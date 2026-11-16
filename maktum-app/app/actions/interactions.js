'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth'; 

const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '۰';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
};

function sanitizeAndValidateText(text, maxLength = 500) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'محتوای ارسالی نامعتبر است.' };
  }

  if (text.length > maxLength * 2) {
    return { isValid: false, error: 'طول متن ارسالی غیرطبیعی و بیش از حد مجاز است.' };
  }
  
  const cleanText = text.trim();
  
  if (cleanText.length < 2) {
    return { isValid: false, error: `متن دیدگاه بسیار کوتاه است (حداقل ${toPersianDigits(2)} کاراکتر).` };
  }
  if (cleanText.length > maxLength) {
    return { isValid: false, error: `متن نمی‌تواند بیشتر از ${toPersianDigits(maxLength)} کاراکتر باشد.` };
  }
  
  const hasHTMLTags = /<[a-z][\s\S]*>/i.test(cleanText);
  if (hasHTMLTags) {
    return { isValid: false, error: 'استفاده از کدهای غیرمجاز و کاراکترهای نامعتبر ممنوع است.' };
  }

  return { isValid: true, text: cleanText };
}

// ==========================================
// سامانه افزودن / حذف از علاقه‌مندی‌ها
// ==========================================
export async function toggleFavoriteAction(contentId) {
  try {
    if (typeof contentId !== 'string' || !contentId.trim()) {
      return { success: false, error: 'شناسه محتوا نامعتبر است.' };
    }

    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای افزودن به علاقه‌مندی‌ها باید وارد سامانه شوید.', requireAuth: true };
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
// سامانه مسئولیت پیوند بارگیری و ثبت تاریخچه (مجهز به محافظ ضدتکرار)
// ==========================================
export async function generateSecureDownloadAction(contentId, fileUrl) {
  try {
    if (typeof contentId !== 'string' || typeof fileUrl !== 'string' || !contentId.trim() || !fileUrl.trim()) {
      return { success: false, error: 'اطلاعات درخواست نامعتبر است.' };
    }

    const session = await getSessionUser();
    
    if (!session) {
      return { success: false, error: 'برای بارگیری پرونده‌ها باید وارد حساب کاربری خود شوید.', requireAuth: true };
    }

    // بررسی اینکه آیا کاربر در ۵ دقیقه گذشته همین پرونده را دانلود کرده است یا خیر (جلوگیری از پر شدن دیتابیس با کلیک‌های پیاپی)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDownload = await prisma.downloadHistory.findFirst({
      where: {
        userId: session.userId,
        contentId: contentId,
        downloadedAt: { gte: fiveMinutesAgo }
      },
      select: { id: true }
    });

    if (!recentDownload) {
      await prisma.downloadHistory.create({
        data: {
          userId: session.userId,
          contentId: contentId
        }
      });
    }

    return { 
      success: true, 
      url: fileUrl, 
      message: 'پیوند بارگیری شما آماده است.' 
    };

  } catch (error) {
    console.error("Download Error:", error);
    return { success: false, error: 'خطا در پردازش پیوند بارگیری. لطفا دوباره تلاش کنید.' };
  }
}

// ==========================================
// سامانه ثبت نظر کاربر (مجهز به قفل ضداسپم ۶۰ ثانیه‌ای)
// ==========================================
export async function submitCommentAction(contentId, text) {
  try {
    if (typeof contentId !== 'string' || !contentId.trim()) {
      return { success: false, error: 'شناسه محتوا نامعتبر است.' };
    }

    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای ثبت دیدگاه باید وارد سامانه شوید.' };
    }

    const validation = sanitizeAndValidateText(text, 500);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // بررسی قفل ضداسپم: حداقل ۶۰ ثانیه فاصله بین دو دیدگاه از یک کاربر
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentComment = await prisma.comment.findFirst({
      where: {
        userId: session.userId,
        createdAt: { gte: oneMinuteAgo }
      },
      select: { id: true }
    });

    if (recentComment) {
      return {
        success: false,
        error: `لطفاً از ارسال دیدگاه‌های پیاپی خودداری فرمایید و ${toPersianDigits(1)} دقیقه دیگر تلاش کنید.`
      };
    }

    await prisma.comment.create({
      data: {
        text: validation.text,
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