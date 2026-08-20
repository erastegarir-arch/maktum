'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth'; 
import crypto from 'crypto'; 

// ==========================================
// فاز ۳: سیستم افزودن / حذف از علاقه‌مندی‌ها
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
// فاز ۲: سیستم دروازه دانلود و تولید لینک هش‌دار
// ==========================================
export async function generateSecureDownloadAction(contentId, fileUrl) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای دانلود فایل‌ها باید وارد حساب کاربری خود شوید.', requireAuth: true };
    }

    await prisma.downloadHistory.create({
      data: {
        userId: session.userId,
        contentId: contentId
      }
    });

    const DL_SECRET = process.env.DL_SECRET || 'MySuperSecretKey_Madar99'; 
    const DL_HOST = process.env.DL_HOST || 'https://dl.madar.com';

    // اصلاح قدرتمند مسیر فایل برای جلوگیری از چسبیدن کلمات
    let filePath = fileUrl;
    try {
      const urlObj = new URL(filePath.startsWith('http') ? filePath : `http://${filePath}`);
      filePath = urlObj.pathname;
    } catch (e) {
      if (!filePath.startsWith('/')) filePath = '/' + filePath;
    }

    const expireTime = Math.floor(Date.now() / 1000) + (3 * 3600); 
    const stringToHash = `${DL_SECRET}${filePath}${expireTime}`;
    
    const hash = crypto.createHash('md5').update(stringToHash).digest('base64')
                  .replace(/=/g, '')
                  .replace(/\+/g, '-')
                  .replace(/\//g, '_');

    // استفاده از شیء URL برای ساخت لینک نهایی بدون باگ
    const secureUrl = new URL(filePath, DL_HOST);
    secureUrl.searchParams.append('md5', hash);
    secureUrl.searchParams.append('expires', expireTime);

    return { success: true, url: secureUrl.toString() };
  } catch (error) {
    console.error("Download Error:", error);
    return { success: false, error: 'خطا در تولید لینک دانلود. لطفا مجدد تلاش کنید.' };
  }
}

// ==========================================
// فاز ۴: سیستم ثبت نظر کاربر
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