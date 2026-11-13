'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserSessionAction } from './auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// ==========================================
// توابع امنیتی و پاکسازی ورودی‌های کاربر (نماگر)
// ==========================================
const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '۰';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
};

function sanitizeField(text, maxLength, fieldName) {
  if (!text) return { isValid: true, value: null };
  if (typeof text !== 'string') return { isValid: false, error: `قالب ${fieldName} نامعتبر است.` };
  
  const cleanText = text.trim();
  if (cleanText.length === 0) return { isValid: true, value: null };
  
  if (cleanText.length > maxLength) {
    return { isValid: false, error: `${fieldName} نمی‌تواند بیشتر از ${toPersianDigits(maxLength)} کاراکتر باشد.` };
  }
  
  // مسدود کردن قطعی کدهای مخرب و تگ‌های HTML
  const hasHTMLTags = /<[a-z][\s\S]*>/i.test(cleanText);
  if (hasHTMLTags) {
    return { isValid: false, error: `استفاده از کدهای غیرمجاز در ${fieldName} ممنوع است.` };
  }
  
  return { isValid: true, value: cleanText };
}

// ۱. دریافت کامل اطلاعات کاربری که وارد شده است
export async function getUserProfile() {
  try {
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success || !authRes.user) return null;

    const user = await prisma.user.findUnique({
      where: { id: authRes.user.id },
      include: {
        favorites: {
          include: {
            content: {
              select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, publishedAt: true }
            }
          }
        },
        downloads: { 
          include: {
            content: {
              select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, publishedAt: true }
            }
          }
        }
      }
    });

    if (user) {
      user.downloadHistory = user.downloads;
      // حذف فیلدهای امنیتی قبل از ارسال به سمت کلاینت
      delete user.password; 
      delete user.adminPassword;
      delete user.adminPermissions;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// ۲. بروزرسانی اطلاعات نماگر کاربر
export async function updateUserProfileAction(data) {
  try {
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success) return { success: false, error: 'شما وارد سامانه نشده‌اید.' };

    // ====================================================
    // --- شروع لایه امنیتی، پاکسازی داده‌ها و اعتبارسنجی ---
    // ====================================================
    
    // ۱. بررسی فیلدهای متنی با محدودیت‌های دقیق
    const vFirstName = sanitizeField(data.firstName, 50, 'نام');
    if (!vFirstName.isValid) return { success: false, error: vFirstName.error };
    if (!vFirstName.value || vFirstName.value.length < 2) return { success: false, error: 'وارد کردن «نام» (حداقل ۲ کاراکتر) الزامی است.' };

    const vLastName = sanitizeField(data.lastName, 50, 'نام خانوادگی');
    if (!vLastName.isValid) return { success: false, error: vLastName.error };

    const vMajor = sanitizeField(data.major, 100, 'رشته تحصیلی');
    if (!vMajor.isValid) return { success: false, error: vMajor.error };

    const vEmail = sanitizeField(data.email, 100, 'ایمیل');
    if (!vEmail.isValid) return { success: false, error: vEmail.error };
    // اعتبارسنجی دقیق قالب ایمیل در سمت سرور
    if (vEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vEmail.value)) {
      return { success: false, error: 'نشانی رایانمه نامعتبر است.' };
    }

    const vArtField = sanitizeField(data.artResearchField, 150, 'حوزه فعالیت هنری');
    if (!vArtField.isValid) return { success: false, error: vArtField.error };

    const vInterests = sanitizeField(data.cooperationInterests, 500, 'زمینه‌های همکاری');
    if (!vInterests.isValid) return { success: false, error: vInterests.error };

    // ۲. پاکسازی فیلدهای فهرستی و تقویم برای جلوگیری از دور زدن فیلدها توسط هکر
    const vBirthYear = sanitizeField(data.birthYear, 20, 'تاریخ تولد');
    const vProvince = sanitizeField(data.province, 50, 'استان');
    const vCity = sanitizeField(data.city, 50, 'شهر');
    const vEducation = sanitizeField(data.educationDegree, 50, 'مدرک تحصیلی');

    // ====================================================
    // --- پایان لایه امنیتی ---
    // ====================================================

    await prisma.user.update({
      where: { id: authRes.user.id },
      data: {
        firstName: vFirstName.value,
        lastName: vLastName.value,
        // جنسیت فقط می‌تواند یکی از این دو مقدار باشد، در غیر این صورت null می‌شود (ضد تقلب)
        gender: data.gender === 'MALE' || data.gender === 'FEMALE' ? data.gender : null,
        birthYear: vBirthYear.isValid ? vBirthYear.value : null,
        province: vProvince.isValid ? vProvince.value : null,
        city: vCity.isValid ? vCity.value : null,
        educationDegree: vEducation.isValid ? vEducation.value : null,
        major: vMajor.value,
        email: vEmail.value,
        artResearchField: vArtField.value,
        cooperationInterests: vInterests.value,
      }
    });

    revalidatePath('/profile');
    return { success: true, message: 'اطلاعات نماگر با موفقیت ذخیره شد.' };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: 'خطا در ذخیره اطلاعات نماگر.' };
  }
}

// ۳. تغییر گذرواژه کاربر از داخل میزکار کاربری
export async function updatePasswordAction(oldPassword, newPassword) {
  try {
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success) return { success: false, error: 'شما وارد سامانه نشده‌اید.' };

    const user = await prisma.user.findUnique({
      where: { id: authRes.user.id },
      select: { password: true }
    });

    if (!user) return { success: false, error: 'کاربر یافت نشد.' };

    if (user.password) {
      if (!oldPassword) return { success: false, error: 'لطفاً گذرواژه قبلی خود را وارد کنید.' };
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return { success: false, error: 'گذرواژه قبلی اشتباه است.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: authRes.user.id },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'گذرواژه شما با موفقیت ثبت/تغییر کرد.' };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر گذرواژه. لطفاً مجدداً تلاش کنید.' };
  }
}