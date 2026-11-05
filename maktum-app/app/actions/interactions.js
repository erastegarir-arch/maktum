'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth'; 

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
// سیستم مدیریت لینک دانلود و ثبت تاریخچه
// ==========================================
export async function generateSecureDownloadAction(contentId, fileUrl) {
  try {
    const session = await getSessionUser();
    
    // ۱. بررسی ورود کاربر (فقط کاربران لاگین‌شده مجاز به دانلود هستند)
    if (!session) {
      return { success: false, error: 'برای دانلود فایل‌ها باید وارد حساب کاربری خود شوید.', requireAuth: true };
    }

    // ۲. ثبت در تاریخچه دانلود برای آمارگیری و گزارش‌ها
    await prisma.downloadHistory.create({
      data: {
        userId: session.userId,
        contentId: contentId
      }
    });

    // ۳. ارسال لینک مستقیم فایل به همراه پیام موفقیت
    return { 
      success: true, 
      url: fileUrl, 
      message: 'لینک دانلود شما آماده است.' 
    };

  } catch (error) {
    console.error("Download Error:", error);
    return { success: false, error: 'خطا در پردازش لینک دانلود. لطفا مجدد تلاش کنید.' };
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

    return { success: true, message: 'دیدگاه شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود.' };
  } catch (error) {
    console.error("Comment Error:", error);
    return { success: false, error: 'خطا در ثبت دیدگاه. لطفا مجددا تلاش کنید.' };
  }
}