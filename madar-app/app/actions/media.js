'use server';

import { prisma } from '@/lib/prisma';
import { formatSiteDate } from '@/app/utils/dateFormatter';
import { writeFile, mkdir, rename } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// ۱. دریافت رسانه‌ها
export async function getMedia() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return await Promise.all(
      media.map(async (item) => ({
        ...item,
        formattedDate: await formatSiteDate(item.createdAt),
      }))
    );
  } catch (error) {
    console.error('خطا در دریافت رسانه‌ها:', error);
    return [];
  }
}

// ۲. آپلود رسانه (برای فایل‌های سبک در صورت نیاز، اما فایل‌های سنگین از API می‌روند)
export async function uploadMedia(formData) {
  try {
    const file = formData.get('file');
    if (!file) throw new Error('فایلی یافت نشد.');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    let fileType = 'DOCUMENT';
    if (file.type.startsWith('image/')) fileType = 'IMAGE';
    else if (file.type.startsWith('video/')) fileType = 'VIDEO';
    else if (file.type.startsWith('audio/')) fileType = 'AUDIO';

    const newMedia = await prisma.media.create({
      data: { url: fileUrl, fileType, mimeType: file.type, size: file.size, title: file.name },
    });
    return { success: true, media: newMedia };
  } catch (error) {
    return { success: false, error: 'خطا در آپلود فایل' };
  }
}

// ۳. بروزرسانی سئو
export async function updateMedia(id, data) {
  try {
    await prisma.media.update({
      where: { id },
      data: { title: data.title, altText: data.altText },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ۴. تغییر نام فیزیکی فایل
export async function renameMediaFile(id, newName) {
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'فایل پیدا نشد' };

    const oldFileName = media.url.split('/').pop();
    const oldPath = path.join(process.cwd(), 'public', 'uploads', oldFileName);
    const ext = path.extname(oldFileName);

    // پاکسازی نام جدید از کاراکترهای غیرمجاز
    let safeNewName = newName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-آ-ی]/g, '');
    if (!safeNewName.endsWith(ext)) safeNewName += ext;
    
    // حفظ شناسه زمانی برای جلوگیری از تداخل نام‌ها
    const timestamp = oldFileName.split('-')[0]; 
    const finalUniqueName = `${timestamp}-${safeNewName}`;
    const newPath = path.join(process.cwd(), 'public', 'uploads', finalUniqueName);
    const newUrl = `/uploads/${finalUniqueName}`;

    // تغییر نام در سرور فیزیکی
    if (existsSync(oldPath)) {
      await rename(oldPath, newPath);
    }

    // بروزرسانی آدرس و عنوان در دیتابیس
    await prisma.media.update({
      where: { id },
      data: { url: newUrl, title: safeNewName }
    });

    return { success: true, newUrl, newTitle: safeNewName };
  } catch (error) {
    console.error('خطا در تغییر نام:', error);
    return { success: false, error: 'خطا در عملیات تغییر نام' };
  }
}

// ۵. حذف رسانه
export async function deleteMedia(id) {
  try {
    await prisma.media.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}