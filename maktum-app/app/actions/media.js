'use server';

import { prisma } from '@/lib/prisma';
import { formatDisplayDate as formatSiteDate } from '@/app/utils/CalendarUtils';
import { writeFile, mkdir, rename, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getCurrentUserSessionAction } from './auth';

// بررسی دسترسی مسئول
async function checkAdminAccess() {
  const authRes = await getCurrentUserSessionAction();
  if (!authRes.success || (!authRes.user?.isAdmin && !authRes.user?.isSuperAdmin)) {
    throw new Error('دسترسی غیرمجاز');
  }
}

// ۱. دریافت رسانه‌ها
export async function getMedia() {
  try {
    await checkAdminAccess();
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

// ۲. بارگذاریاری رسانه (با سقف ۲۰۰ مگابایت)
export async function uploadMedia(formData) {
  try {
    await checkAdminAccess();
    const file = formData.get('file');
    if (!file) throw new Error('پرونده‌ای یافت نشد.');

    // محدودیت حجم ۲۰۰ مگابایت
    const MAX_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE) throw new Error('حجم پرونده بیش از ۲۰۰ مگابایت است.');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    // پاکسازی نام پرونده
    const ext = path.extname(file.name).toLowerCase();
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9آ-ی_-]/g, '-').replace(/-+/g, '-');
    const uniqueName = `${Date.now()}-${safeBaseName || 'media'}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    let fileType = 'DOCUMENT';
    if (file.type.startsWith('image/')) fileType = 'IMAGE';
    else if (file.type.startsWith('video/')) fileType = 'VIDEO';
    else if (file.type.startsWith('audio/')) fileType = 'AUDIO';

    const newMedia = await prisma.media.create({
      data: { url: fileUrl, fileType, mimeType: file.type, size: file.size, title: safeBaseName || 'بدون عنوان' },
    });
    return { success: true, media: newMedia };
  } catch (error) {
    return { success: false, error: error.message || 'خطا در بارگذاری پرونده' };
  }
}

// ۳. بروزرسانی سئو
export async function updateMedia(id, data) {
  try {
    await checkAdminAccess();
    await prisma.media.update({
      where: { id },
      data: { title: data.title, altText: data.altText },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ۴. تغییر نام فیزیکی پرونده
export async function renameMediaFile(id, newName) {
  try {
    await checkAdminAccess();
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'پرونده پیدا نشد' };

    const oldFileName = media.url.split('/').pop();
    const oldPath = path.join(process.cwd(), 'public', 'uploads', oldFileName);
    const ext = path.extname(oldFileName);

    let safeNewName = newName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-آ-ی]/g, '');
    if (!safeNewName.endsWith(ext)) safeNewName += ext;
    
    const timestamp = oldFileName.split('-')[0]; 
    const finalUniqueName = `${timestamp}-${safeNewName}`;
    const newPath = path.join(process.cwd(), 'public', 'uploads', finalUniqueName);
    const newUrl = `/uploads/${finalUniqueName}`;

    if (existsSync(oldPath)) {
      await rename(oldPath, newPath);
    }

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

// ۵. حذف رسانه (حذف از پایگاه داده + هارد سرور)
export async function deleteMedia(id) {
  try {
    await checkAdminAccess();
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'رسانه یافت نشد' };

    // ۱. حذف فیزیکی پرونده از روی هارد سرور ابرآروان
    const fileName = media.url.split('/').pop();
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    if (existsSync(filePath)) {
      await unlink(filePath); // این دستور پرونده را کاملاً پاک می‌کند
    }

    // ۲. حذف از پایگاه داده
    await prisma.media.delete({ where: { id } });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting media:', error);
    return { success: false, error: 'خطا در حذف پرونده' };
  }
}