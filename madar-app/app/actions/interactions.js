'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth'; 
import crypto from 'crypto'; 

// ==========================================
// سیستم افزودن / حذف از علاقه‌مندی‌ها
// ==========================================
export async function toggleFavoriteAction(contentId) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای افزودن به علاقه‌مندی‌ها باید وارد سایت شوید.', requireAuth: true };
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: session.userId,
          contentId: contentId
        }
      }
    });

    if (existingFavorite) {
      await prisma.favorite.delete({ where: { id: existingFavorite.id } });
      return { success: true, isFavorited: false, message: 'از علاقه‌مندی‌ها حذف شد.' };
    } else {
      await prisma.favorite.create({
        data: { userId: session.userId, contentId: contentId }
      });
      return { success: true, isFavorited: true, message: 'به علاقه‌مندی‌ها اضافه شد.' };
    }
  } catch (error) {
    console.error("Favorite Error:", error);
    return { success: false, error: 'خطایی در ارتباط با سرور رخ داد.' };
  }
}

// ==========================================
// سیستم دروازه دانلود و تولید لینک هوشمند و امن
// ==========================================
export async function generateSecureDownloadAction(contentId, fileUrl) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای دانلود فایل‌ها باید وارد حساب کاربری خود شوید.', requireAuth: true };
    }

    // ۱. ثبت در تاریخچه دانلود
    await prisma.downloadHistory.create({
      data: {
        userId: session.userId,
        contentId: contentId
      }
    });

    // تنظیمات سرور دانلود اختصاصی شما (Nginx)
    const DL_SECRET = process.env.DL_SECRET || 'MySuperSecretKey_Madar99'; 
    const DL_HOST = process.env.DL_HOST || 'dl.madar.com'; // نام دامنه سرور دانلود شما بدون پروتکل

    let finalUrl = fileUrl;
    let isSecureLink = false;

    // ۲. مسیریابی هوشمند: بررسی تعلق لینک به سرور اختصاصی مدار
    if (fileUrl.startsWith('/') || fileUrl.includes(DL_HOST)) {
      isSecureLink = true;
      
      let filePath = fileUrl;
      try {
        if (filePath.startsWith('http')) {
          const urlObj = new URL(filePath);
          filePath = urlObj.pathname; // فقط مسیر فایل را استخراج می‌کند (مثلاً /videos/file.mp4)
        }
      } catch (e) {
        if (!filePath.startsWith('/')) filePath = '/' + filePath;
      }

      // ۳. ساخت مهر زمانی (۷۲ ساعت اعتبار)
      const expireTime = Math.floor(Date.now() / 1000) + (72 * 3600); 
      
      // ۴. ساخت هش MD5 به فرمت مخصوص Nginx
      const stringToHash = `${DL_SECRET}${filePath}${expireTime}`;
      const hash = crypto.createHash('md5').update(stringToHash).digest('base64')
                  .replace(/=/g, '')
                  .replace(/\+/g, '-')
                  .replace(/\//g, '_');

      // ۵. ترکیب نهایی لینک امن
      const secureUrl = new URL(filePath, `https://${DL_HOST}`);
      secureUrl.searchParams.append('md5', hash);
      secureUrl.searchParams.append('expires', expireTime);

      finalUrl = secureUrl.toString();
    }

    // ۶. تنظیم پیام اختصاصی برای نمایش به کاربر
    const message = isSecureLink 
      ? 'لینک امن آماده شد. این لینک اختصاصی فقط تا ۷۲ ساعت اعتبار دارد.'
      : 'لینک دانلود شما آماده است.';

    return { success: true, url: finalUrl, message: message };
  } catch (error) {
    console.error("Download Error:", error);
    return { success: false, error: 'خطا در تولید لینک دانلود. لطفا مجدد تلاش کنید.' };
  }
}

// ==========================================
// سیستم ثبت نظر کاربر
// ==========================================
export async function submitCommentAction(contentId, text) {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'برای ثبت دیدگاه باید وارد سایت شوید.' };

    await prisma.comment.create({
      data: {
        text: text,
        contentId: contentId,
        userId: session.userId,
        status: 'PENDING' 
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Comment Error:", error);
    return { success: false, error: 'خطا در ثبت دیدگاه. لطفا مجددا تلاش کنید.' };
  }
}