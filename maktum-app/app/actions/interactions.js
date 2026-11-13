'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth'; 

// ==========================================
// تابع تبدیل اعداد انگلیسی به فارسی برای پیام‌های سمت سرور
// ==========================================
const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '۰';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
};

// ==========================================
// گارد امنیتی (بازرسی و پاکسازی ورودی‌های متنی)
// ==========================================
function sanitizeAndValidateText(text, maxLength = 500) {
  // ۱. بررسی اینکه ورودی حتماً یک رشته متنی باشد (جلوگیری از حملات NoSQL/Object Injection)
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'محتوای ارسالی نامعتبر است.' };
  }

  // ۱.۵. گارد محافظ سرور (DoS Protection): 
  // اگر رشته ارسالی بیش از دو برابر حد مجاز باشد (حمله مگابایتی)، درجا مسدود می‌شود تا پردازنده درگیر نشود
  if (text.length > maxLength * 2) {
    return { isValid: false, error: 'طول متن ارسالی غیرطبیعی و بیش از حد مجاز است.' };
  }
  
  // ۲. حذف فاصله‌های اضافی از ابتدا و انتهای متن
  const cleanText = text.trim();
  
  // ۳. بررسی طول مجاز متن (با اعداد تماماً فارسی در پیام‌ها)
  if (cleanText.length < 2) {
    return { isValid: false, error: `متن دیدگاه بسیار کوتاه است (حداقل ${toPersianDigits(2)} کاراکتر).` };
  }
  if (cleanText.length > maxLength) {
    return { isValid: false, error: `متن نمی‌تواند بیشتر از ${toPersianDigits(maxLength)} کاراکتر باشد.` };
  }
  
  // ۴. مسدود کردن کدهای مخرب (جلوگیری از تزریق HTML و اسکریپت)
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
    // جلوگیری از ارسال دیتای مخرب به جای ID
    if (typeof contentId !== 'string') {
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
// سامانه مسئولیت پیوند بارگیری و ثبت تاریخچه
// ==========================================
export async function generateSecureDownloadAction(contentId, fileUrl) {
  try {
    // بررسی امنیتی نوع داده‌های ورودی
    if (typeof contentId !== 'string' || typeof fileUrl !== 'string') {
      return { success: false, error: 'اطلاعات درخواست نامعتبر است.' };
    }

    const session = await getSessionUser();
    
    // ۱. بررسی ورود کاربر (فقط کاربران وارد‌شده مجاز به بارگیری هستند)
    if (!session) {
      return { success: false, error: 'برای بارگیری پرونده‌ها باید وارد حساب کاربری خود شوید.', requireAuth: true };
    }

    // ۲. ثبت در تاریخچه بارگیری برای آمارگیری و گزارش‌ها
    await prisma.downloadHistory.create({
      data: {
        userId: session.userId,
        contentId: contentId
      }
    });

    // ۳. ارسال پیوند مستقیم پرونده به همراه پیام موفقیت
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
// سامانه ثبت نظر کاربر
// ==========================================
export async function submitCommentAction(contentId, text) {
  try {
    // ۱. بررسی امنیتی شناسه محتوا
    if (typeof contentId !== 'string') {
      return { success: false, error: 'شناسه محتوا نامعتبر است.' };
    }

    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'برای ثبت دیدگاه باید وارد سامانه شوید.' };
    }

    // ۲. فعال‌سازی گارد امنیتی روی متن ارسالی کاربر (با ارسال عدد ۵۰۰)
    const validation = sanitizeAndValidateText(text, 500);
    if (!validation.isValid) {
      // بازگرداندن ارور دقیق و با اعداد کاملا فارسی به کاربر
      return { success: false, error: validation.error };
    }

    // استفاده از متن پاکسازی شده و امن (validation.text)
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