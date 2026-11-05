'use server';

import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotificationToUser } from './notifications';
import { parsePermissions } from '@/lib/rbac';
import logger from '@/lib/logger';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MAKTUM_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

// ==========================================
// ۱. بررسی شماره موبایل و ارسال کد تایید واقعی (متد VerifyLookup کاوه‌نگار)
// ==========================================
export async function sendOtpAction(phone) {
  try {
    if (!phone || phone.length < 10) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.status === 'BANNED') return { success: false, error: 'حساب شما مسدود است.' };

    const activeOtp = await prisma.otpCode.findUnique({ where: { phone } });
    if (activeOtp && activeOtp.expiresAt > new Date(Date.now() + 105 * 1000)) {
      return { success: false, error: 'لطفاً تا پایان تایمر صبر کنید.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 120 * 1000);

    const apiKey = process.env.KAVENEGAR_API_KEY;

    if (apiKey) {
      const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${phone}&token=${code}&template=verifyPhone`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.return.status !== 200) {
          // استفاده از لاگر به جای console.error
          logger.error({ err: data.return.message, phone }, 'Kavenegar API Error');
          return { success: false, error: 'خطا در سرویس پیامک. لطفاً دقایقی دیگر تلاش کنید.' };
        }
      } catch (err) {
        logger.error({ err, phone }, 'Kavenegar Fetch Error');
        return { success: false, error: 'ارتباط با سرور پیامک برقرار نشد.' };
      }
    } else {
      logger.warn('هشدار: کلید کاوه‌نگار تنظیم نشده است. پیامک ارسال نشد.');
    }

    await prisma.otpCode.upsert({
      where: { phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone, code, expiresAt }
    });

    return { success: true, message: 'کد تایید با موفقیت ارسال شد.' }; 
  } catch (error) {
    logger.error({ err: error, phone }, 'OTP Send Error');
    return { success: false, error: 'خطای سرور در ارتباط با سامانه پیامک.' };
  }
}

// ==========================================
// ۲. ثبت‌نام کاربر جدید
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
    logger.error({ err: error, phone }, 'Registration Error');
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
    logger.error({ err: error, phone }, 'Login Password Error');
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
    logger.error({ err: error, phone }, 'Verify OTP Error');
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