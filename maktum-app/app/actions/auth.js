// app/actions/auth.js
'use server';

import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotificationToUser } from './notifications';
import { parsePermissions } from '@/lib/rbac';
import logger from '@/lib/logger';
// اتصال به هسته امنیتی جدید پیامک
import { sendOtpSms, verifyOtpCode } from '@/lib/otpService';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MAKTUM_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

// ==========================================
// ۱. ارسال کد تایید با امنیت کامل (بدون تغییر در ورودی و خروجی فرانت‌اند)
// ==========================================
export async function sendOtpAction(phone, purpose = 'LOGIN') { 
  try {
    // ۱. اعتبارسنجی دقیق شماره موبایل ایران
    if (!phone || typeof phone !== 'string' || !/^09\d{9}$/.test(phone.trim())) {
      return { success: false, error: 'شماره موبایل وارد شده معتبر نیست.' };
    }
    phone = phone.trim();

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.status === 'BANNED') {
      return { success: false, error: 'حساب شما مسدود است.' };
    }

    // ۲. واگذاری کل منطق ساخت، قفل اسپم، ذخیره هش‌شده و ارتباط با ملی‌پیامک به سرویس امن
    const result = await sendOtpSms(phone, purpose);
    
    return { success: true, message: result.message };
  } catch (error) {
    logger.error({ err: error.message, phone }, 'OTP Generation Error');
    // پیام خطای دقیق سرویس امن (مثل "تعداد درخواست بیش از حد مجاز") به کاربر نمایش داده می‌شود
    return { success: false, error: error.message || 'خطای سرور در تولید کد.' };
  }
}

// ==========================================
// ۲. ثبت‌نام کاربر جدید
// ==========================================
export async function registerAction(phone, password, code) {
  try {
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return { success: false, error: 'گذرواژه باید بین ۶ تا ۷۲ کاراکتر باشد.' };
    }

    // واگذاری اعتبارسنجی کد (بررسی انقضا، تعداد تلاش و صحت کد) به سرویس امن
    // اگر کد اشتباه باشد خطا پرتاب می‌کند (throw Error) و وارد بلاک catch می‌شود
    await verifyOtpCode(phone, code);

    let user = await prisma.user.findUnique({ where: { phone } });
    if (user) return { success: false, error: 'این شماره موبایل قبلاً ثبت شده است. لطفاً وارد شوید.' };

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: { phone, password: hashedPassword, status: 'ACTIVE' }
    });

    await sendWelcomeNotificationToUser(user.id);
    await createSession(user);

    return { success: true, message: 'ثبت‌نام با موفقیت انجام شد.' };
  } catch (error) {
    logger.error({ err: error.message, phone }, 'Registration Error');
    // ارورهایی مثل "کد تایید اشتباه است" یا "منقضی شده" به فرانت برگشت داده می‌شود
    return { success: false, error: error.message || 'خطای سامانه در ثبت‌نام.' };
  }
}

// ==========================================
// ۳. ورود فقط با گذرواژه‌
// ==========================================
export async function loginWithPasswordAction(phone, password) {
  try {
    if (!phone || !password || typeof password !== 'string' || password.length > 72) {
      return { success: false, error: 'شماره موبایل یا گذرواژه اشتباه است.' };
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return { success: false, error: 'شماره موبایل یا گذرواژه اشتباه است.' };
    if (user.status === 'BANNED') return { success: false, error: 'حساب کاربری شما مسدود است.' };
    if (!user.password) return { success: false, error: 'شما گذرواژه‌ای تنظیم نکرده‌اید. با پیامک وارد شوید.' };

    const isPasswordValid = await bcrypt.compare(password, user.password);

    let isAdminPasswordValid = false;
    if (!isPasswordValid && user.isAdmin && user.adminPassword) {
      isAdminPasswordValid = await bcrypt.compare(password, user.adminPassword);
    }

    if (!isPasswordValid && !isAdminPasswordValid) {
      return { success: false, error: 'شماره موبایل یا گذرواژه اشتباه است.' };
    }

    await createSession(user);
    return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
  } catch (error) {
    logger.error({ err: error, phone }, 'Login Password Error');
    return { success: false, error: 'خطای سامانه در هنگام ورود.' };
  }
}

// ==========================================
// ۴. ورود با کد یکبار مصرف (بدون گذرواژه‌)
// ==========================================
export async function verifyOtpAction(phone, code) {
  try {
    // واگذاری اعتبارسنجی کد به سرویس امن
    await verifyOtpCode(phone, code);

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({ data: { phone, status: 'ACTIVE' } });
      await sendWelcomeNotificationToUser(user.id);
    } else if (user.status === 'BANNED') {
      return { success: false, error: 'حساب کاربری شما مسدود است.' };
    }

    await createSession(user);

    return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
  } catch (error) {
    logger.error({ err: error.message, phone }, 'Verify OTP Error');
    return { success: false, error: error.message || 'خطای سامانه در تأیید کد.' };
  }
}

// ==========================================
// ۵. متدهای کوکی
// ==========================================
async function createSession(user) {
  const parsedPerms = parsePermissions(user.adminPermissions);

  const token = await new SignJWT({ 
    userId: user.id, 
    phone: user.phone, 
    isAdmin: !!user.isAdmin,
    isSuperAdmin: !!user.isSuperAdmin,
    adminPermissions: parsedPerms
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('maktum_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete('maktum_session');
  return { success: true };
}

export async function getCurrentUserSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('maktum_session')?.value;

  if (!token) return { success: false };

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    const userId = verified.payload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, firstName: true, lastName: true, 
        status: true, isAdmin: true, isSuperAdmin: true, adminPermissions: true
      }
    });

    if (!user || user.status === 'BANNED') return { success: false };

    user.adminPermissions = parsePermissions(user.adminPermissions);
    return { success: true, user };
  } catch (err) {
    return { success: false };
  }
}

// ==========================================
// توابع سازگاری
// ==========================================
export async function getSessionUser() {
  const res = await getCurrentUserSessionAction();
  if (res.success) {
    return {
      userId: res.user.id,
      phone: res.user.phone,
      role: res.user.roleId || null,
      isAdmin: res.user.isAdmin,
      isSuperAdmin: res.user.isSuperAdmin,
      adminPermissions: res.user.adminPermissions
    };
  }
  return null;
}

export async function logoutAction() {
  return await logoutUserAction();
}