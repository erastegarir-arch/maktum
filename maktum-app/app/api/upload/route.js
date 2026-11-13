import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getCurrentUserSessionAction } from '@/app/actions/auth';

// فهرست پسوندهای مجاز 
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico',
  '.mp4', '.webm', '.mkv', '.mov',
  '.mp3', '.wav', '.ogg', '.m4a',
  '.pdf', '.zip', '.rar', '.doc', '.docx'
];

// حداکثر حجم مجاز: ۲۰۰ مگابایت
const MAX_FILE_SIZE = 200 * 1024 * 1024; 

export async function POST(request) {
  try {
    // ۱. قفل امنیتی: فقط مسئولان سامانه اجازه بارگذاری پرونده دارند
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success || (!authRes.user?.isAdmin && !authRes.user?.isSuperAdmin)) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز! فقط مسئولان مجاز به بارگذاری هستند.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'پرونده‌ای یافت نشد.' }, { status: 400 });
    }

    // ۲. بررسی سقف حجم پرونده
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'حجم پرونده بیش از حد مجاز (۲۰۰ مگابایت) است.' }, { status: 400 });
    }

    // ۳. بررسی پسوند پرونده
    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ success: false, error: 'قالب این پرونده به دلایل امنیتی مجاز نیست.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ۴. گارد ویژه برای پرونده‌های SVG 
    if (ext === '.svg') {
      const svgContent = buffer.toString('utf8');
      if (/<script[\s>]|onload=|onerror=|javascript:/i.test(svgContent)) {
        return NextResponse.json({ success: false, error: 'پرونده SVG حاوی کدهای ناامن است و مسدود شد.' }, { status: 400 });
      }
    }

    // ۵. ساخت پوشه بارگذاری در صورت عدم وجود
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ۶. پاکسازی نام پرونده از کاراکترهای خطرناک
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9آ-ی_-]/g, '-').replace(/-+/g, '-').slice(0, 60);
    const uniqueName = `${Date.now()}-${baseName || 'media'}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // ۷. ذخیره پرونده روی دیسک
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // تشخیص نوع رسانه
    let fileType = 'DOCUMENT';
    if (file.type.startsWith('image/')) fileType = 'IMAGE';
    else if (file.type.startsWith('video/')) fileType = 'VIDEO';
    else if (file.type.startsWith('audio/')) fileType = 'AUDIO';

    // ثبت در پایگاه داده
    const newMedia = await prisma.media.create({
      data: {
        url: fileUrl,
        fileType,
        mimeType: file.type,
        size: file.size,
        title: baseName || 'بدون عنوان',
      },
    });

    return NextResponse.json({ success: true, media: newMedia });
  } catch (error) {
    console.error('خطا در API بارگذاری:', error);
    return NextResponse.json({ success: false, error: 'خطا در ذخیره‌سازی پرونده' }, { status: 500 });
  }
}