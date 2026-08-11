import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'فایلی یافت نشد.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ساخت پوشه آپلود در صورت عدم وجود
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ساخت نام یکتا
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueName);

    // ذخیره فایل روی دیسک
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    // تشخیص نوع رسانه
    let fileType = 'DOCUMENT';
    if (file.type.startsWith('image/')) fileType = 'IMAGE';
    else if (file.type.startsWith('video/')) fileType = 'VIDEO';
    else if (file.type.startsWith('audio/')) fileType = 'AUDIO';

    // ثبت در دیتابیس
    const newMedia = await prisma.media.create({
      data: {
        url: fileUrl,
        fileType,
        mimeType: file.type,
        size: file.size,
        title: file.name,
      },
    });

    return NextResponse.json({ success: true, media: newMedia });
  } catch (error) {
    console.error('خطا در API آپلود:', error);
    return NextResponse.json({ success: false, error: 'خطا در ذخیره‌سازی فایل' }, { status: 500 });
  }
}