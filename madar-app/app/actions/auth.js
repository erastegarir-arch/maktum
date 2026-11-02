'use server';

import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotificationToUser } from './notifications';
import { parsePermissions } from '@/lib/rbac';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MADAR_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

// ==========================================
// ۰. راه‌اندازی اولین مدیرکل ارشد (Master Admin)
// ==========================================
export async function initMasterAdminAction(phone) {
  try {
    if (!phone || phone.length !== 11) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, status: 'ACTIVE' }
      });
      await sendWelcomeNotificationToUser(user.id);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isSuperAdmin: true, isAdmin: true }
    });

    return { success: true, message: 'حساب شما با موفقیت به مدیر کل ارشد ارتقا یافت! حالا لاگین کنید.' };
  } catch (error) {
    console.error('Error in initMasterAdmin:', error);
    return { success: false, error: 'خطای سرور' };
  }
}

// ==========================================
// ۱. بررسی شماره موبایل و ارسال کد تایید (OTP)
// ==========================================
export async function sendOtpAction(phone) {
  try {
    if (!phone || phone.length < 10) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.status === 'BANNED') return { success: false, error: 'BANNED' };

    const activeOtp = await prisma.otpCode.findUnique({ where: { phone } });
    if (activeOtp && activeOtp.expiresAt > new Date(Date.now() + 105 * 1000)) {
      return { success: false, error: 'لطفاً تا پایان تایمر قبلی صبر کنید.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 120 * 1000);

    await prisma.otpCode.upsert({
      where: { phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone, code, expiresAt }
    });

    console.log(`[شبیه‌ساز پیامک]: کد تایید برای شماره ${phone} برابر است با: ${code}`);

    return { success: true, message: 'کد تایید ارسال شد.', mockCode: code }; 
  } catch (error) {
    return { success: false, error: 'خطای سرور در ارسال کد.' };
  }
}

// ==========================================
// ۲. ثبت‌نام کاربر جدید (با رمز عبور و پیامک)
// ==========================================
export async function registerAction(phone, password, code) {
  try {
    const otpRecord = await prisma.otpCode.findUnique({ where: { phone } });
    if (!otpRecord) return { success: false, error: 'کد تاییدی برای این شماره درخواست نشده است.' };
    if (otpRecord.expiresAt < new Date()) return { success: false, error: 'کد تایید منقضی شده است.' };
    if (otpRecord.code !== code) {
      await prisma.otpCode.update({ where: { phone }, data: { attempts: { increment: 1 } } });
      return { success: false, error: 'کد وارد شده اشتباه است.' };
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (user) return { success: false, error: 'این شماره موبایل قبلاً ثبت شده است. لطفاً وارد شوید.' };

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: { phone, password: hashedPassword, status: 'ACTIVE' }
    });

    await sendWelcomeNotificationToUser(user.id);

    await prisma.otpCode.delete({ where: { phone } });
    await createSession(user);

    return { success: true, message: 'ثبت‌نام با موفقیت انجام شد.' };
  } catch (error) {
    return { success: false, error: 'خطای سیستم در ثبت‌نام.' };
  }
}

// ==========================================
// ۳. ورود فقط با رمز عبور
// ==========================================
export async function loginWithPasswordAction(phone, password) {
  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return { success: false, error: 'شماره موبایل یا رمز عبور اشتباه است.' };
    if (user.status === 'BANNED') return { success: false, error: 'حساب کاربری شما مسدود است.' };
    if (!user.password) return { success: false, error: 'شما رمز عبوری تنظیم نکرده‌اید. با پیامک وارد شوید.' };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    let isAdminPasswordValid = false;
    if (!isPasswordValid && user.isAdmin && user.adminPassword) {
      isAdminPasswordValid = await bcrypt.compare(password, user.adminPassword);
    }

    if (!isPasswordValid && !isAdminPasswordValid) {
      return { success: false, error: 'شماره موبایل یا رمز عبور اشتباه است.' };
    }

    await createSession(user);
    return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
  } catch (error) {
    return { success: false, error: 'خطای سیستم در هنگام ورود.' };
  }
}

// ==========================================
// ۴. ورود با کد یکبار مصرف (بدون رمز)
// ==========================================
export async function verifyOtpAction(phone, code) {
  try {
    const otpRecord = await prisma.otpCode.findUnique({ where: { phone } });
    if (!otpRecord) return { success: false, error: 'کد تاییدی درخواست نشده است.' };
    if (otpRecord.expiresAt < new Date()) return { success: false, error: 'کد تایید منقضی شده است.' };
    if (otpRecord.code !== code) {
      await prisma.otpCode.update({ where: { phone }, data: { attempts: { increment: 1 } } });
      return { success: false, error: 'کد وارد شده اشتباه است.' };
    }

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({ data: { phone, status: 'ACTIVE' } });
      await sendWelcomeNotificationToUser(user.id);
    } else if (user.status === 'BANNED') {
      return { success: false, error: 'حساب کاربری شما مسدود است.' };
    }

    await prisma.otpCode.delete({ where: { phone } });
    await createSession(user);

    return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
  } catch (error) {
    return { success: false, error: 'خطای سیستم در تأیید کد.' };
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
  cookieStore.set('madar_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete('madar_session');
  return { success: true };
}

export async function getCurrentUserSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('madar_session')?.value;

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

    // تبدیل رشته JSON دیتابیس به آرایه استاندارد برای استفاده یکپارچه در کل کلاینت
    user.adminPermissions = parsePermissions(user.adminPermissions);

    return { success: true, user };
  } catch (err) {
    return { success: false };
  }
}

// ==========================================
// توابع سازگاری برای فایل‌های قدیمی سایت
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