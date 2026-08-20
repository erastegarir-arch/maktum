'use server';

import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// یک کلید امنیتی مخفی برای رمزنگاری کوکی‌ها (در نسخه نهایی باید در فایل .env قرار گیرد)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MADAR_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

// ==========================================
// ۱. بررسی شماره موبایل و ارسال کد تایید
// ==========================================
export async function sendOtpAction(phone) {
  try {
    if (!phone || phone.length < 10) {
      return { success: false, error: 'شماره موبایل نامعتبر است.' };
    }

    // بررسی در دیتابیس که آیا این شماره وجود دارد و مسدود است یا خیر
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser && existingUser.status === 'BANNED') {
      return { success: false, error: 'BANNED' }; // کاربر مسدود است
    }

    // ========================================================
    // حالت شبیه‌ساز (Mock) برای کاوه‌نگار:
    // فعلاً چون به کاوه نگار وصل نیستیم، فرض می‌کنیم کد همیشه "12345" است
    // در آینده کدهای اتصال به کاوه نگار اینجا قرار می‌گیرد
    // ========================================================
    console.log(`[شبیه‌ساز پیامک]: کد تایید برای شماره ${phone} برابر است با: 12345`);

    return { success: true, message: 'کد تایید ارسال شد.' };
  } catch (error) {
    console.error('Error in sendOtpAction:', error);
    return { success: false, error: 'خطای سرور در ارسال کد.' };
  }
}

// ==========================================
// ۲. تأیید کد، ثبت‌نام/ورود کاربر و ساخت کوکی امن
// ==========================================
export async function verifyOtpAction(phone, code) {
  try {
    // ۱. اعتبارسنجی کد (فعلاً در حالت شبیه‌ساز چک می‌کنیم کد 12345 باشد)
    if (code !== '12345') {
      return { success: false, error: 'کد وارد شده اشتباه است.' };
    }

    // ۲. بررسی وجود کاربر در دیتابیس یا ساخت کاربر جدید (ثبت نام خودکار)
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // ثبت‌نام کاربر جدید فقط با شماره موبایل
      user = await prisma.user.create({
        data: {
          phone: phone,
          status: 'ACTIVE'
        }
      });
    } else if (user.status === 'BANNED') {
       return { success: false, error: 'حساب کاربری شما مسدود است.' };
    }

    // ۳. ساخت توکن امنیتی (JWT) برای کاربر
    const token = await new SignJWT({ userId: user.id, phone: user.phone, role: user.roleId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // اعتبار نشست: ۳۰ روز
      .sign(SECRET_KEY);

    // ۴. ذخیره توکن در کوکی (HttpOnly برای بالاترین امنیت در برابر هک XSS)
    const cookieStore = await cookies();
    cookieStore.set('madar_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // ۳۰ روز به ثانیه
      path: '/',
    });

    return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
  } catch (error) {
    console.error('Error in verifyOtpAction:', error);
    return { success: false, error: 'خطای سیستم در تأیید کد.' };
  }
}

// ==========================================
// ۳. خروج از حساب کاربری (پاک کردن کوکی)
// ==========================================
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('madar_session');
  return { success: true };
}

// ==========================================
// ۴. تابع کمکی برای دریافت اطلاعات کاربر لاگین شده
// ==========================================
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('madar_session')?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload; // خروجی: { userId, phone, role }
  } catch (err) {
    // اگر توکن منقضی یا دستکاری شده بود
    return null;
  }
}