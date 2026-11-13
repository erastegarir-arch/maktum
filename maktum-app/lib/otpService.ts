// src/lib/otpService.ts
import { prisma } from './prisma';
import crypto from 'crypto';

// استخراج کلیدهای امنیتی و API
const SECRET_KEY = Buffer.from(process.env.OTP_ENCRYPTION_KEY || '', 'hex');
const MELIPAYAMAK_API_KEY = process.env.MELIPAYAMAK_API_KEY;
const MELIPAYAMAK_BODY_ID = process.env.MELIPAYAMAK_BODY_ID;

// تابع تولید کد ۵ رقمی تصادفی
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// تابع هش کردن کد برای جدول زنده (غیرقابل بازگردانی)
export function hashOtpCode(phone: string, code: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(`${phone}:${code}`).digest('hex');
}

// تابع گذرواژه‌نگاری کد برای لاگ دیتابیس (قابل مشاهده توسط ادمین در صورت نیاز)
export function encryptOtpForLog(code: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
  return `enc:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}

// تابع گذرواژه‌گشایی کد پیامک برای نمایش در پنل ادمین
export function decryptOtpFromLog(storedCode: string): string {
  if (!storedCode || !storedCode.startsWith('enc:')) return storedCode || ''; 
  
  try {
    const parts = storedCode.split(':');
    if (parts.length !== 4) return '***INVALID_FORMAT***';
    
    const [, ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      SECRET_KEY,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    return '***ERROR***';
  }
}

/**
 * متد اصلی درخواست و ارسال پیامک تایید
 */
export async function sendOtpSms(phone: string, purpose: string) {
  // ۱. نظارت اسپم: بررسی جلوگیری از درخواست‌های رگباری
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  const recentLogs = await prisma.otpLog.findMany({
    where: { phone, createdAt: { gte: oneHourAgo } },
    orderBy: { createdAt: 'desc' },
  });

  if (recentLogs.length > 0 && recentLogs[0].createdAt >= twoMinutesAgo) {
    throw new Error('کد تایید به تازگی ارسال شده است. لطفاً ۲ دقیقه صبر کنید.');
  }
  if (recentLogs.length >= 5) {
    throw new Error('سقف دریافت کد در یک ساعت تکمیل شده است.');
  }

  // ۲. تولید کد و گذرواژه‌نگاری‌های لازم
  const plainCode = generateRandomCode();
  const hashedCode = hashOtpCode(phone, plainCode);
  const encryptedLogCode = encryptOtpForLog(plainCode);

  // ۳. ارسال درخواست به ملی پیامک (الگوی خدماتی) با کلید API واقعی شما
  let isSuccess = true;
  let errorMsg = null;

  try {
    if (!MELIPAYAMAK_API_KEY) {
      throw new Error('کلید API ملی‌پیامک در پرونده .env تنظیم نشده است.');
    }

    // اصلاح بزرگ: قرار دادن پویا API KEY شما در نشانی URL
    const response = await fetch(`https://console.melipayamak.com/api/send/shared/${MELIPAYAMAK_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodyId: parseInt(MELIPAYAMAK_BODY_ID || '579058'),
        to: phone,
        args: [plainCode],
      }),
    });

    const smsResult = await response.json();
    
    // اگر درخواست با موفقیت به ملی‌پیامک نرسید یا خود ملی‌پیامک ارور داد
    if (!response.ok || !smsResult.recId || String(smsResult.recId).startsWith('-')) {
       throw new Error(smsResult.message || smsResult.status || 'خطا در وب‌سرویس ملی‌پیامک');
    }
  } catch (err: any) {
    isSuccess = false;
    errorMsg = err.message || 'خطای شبکه در ارتباط با درگاه پیامک';
    console.error('SMS Error:', errorMsg);
  }

  // ۴. ذخیره در دیتابیس در یک تراکنش اتمیک
  await prisma.$transaction(async (tx: any) => {
    await tx.otpCode.deleteMany({ where: { phone } });

    await tx.otpCode.create({
      data: {
        phone,
        code: hashedCode,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // انقضا در ۲ دقیقه
      },
    });

    await tx.otpLog.create({
      data: {
        phone,
        code: encryptedLogCode,
        purpose,
        isSuccess,
        errorMsg,
      },
    });
  });

  if (!isSuccess) {
    // پیام خطایی که دریافت می‌کنید (مثلاً کلید نامعتبر) را مستقیماً به کاربر نشان نمی‌دهیم، 
    // اما در کنسول و دیتابیس لاگ می‌شود.
    throw new Error('سامانه پیامک موقتاً دچار اختلال است. لطفاً دقایقی دیگر تلاش کنید.');
  }

  return { message: 'کد تایید ارسال شد', expires_in: 120 };
}

/**
 * متد اعتبارسنجی کد وارد شده توسط کاربر
 */
export async function verifyOtpCode(phone: string, inputCode: string) {
  const record = await prisma.otpCode.findUnique({
    where: { phone },
  });

  if (!record) {
    throw new Error('کد تاییدی یافت نشد یا منقضی شده است.');
  }

  if (record.attempts >= 3) {
    await prisma.otpCode.delete({ where: { phone } });
    throw new Error('تعداد تلاش‌های ناموفق بیش از حد مجاز. لطفاً مجدداً کد دریافت کنید.');
  }

  if (new Date() > record.expiresAt) {
    await prisma.otpCode.delete({ where: { phone } });
    throw new Error('کد تایید منقضی شده است.');
  }

  const hashedInput = hashOtpCode(phone, inputCode);
  
  if (hashedInput !== record.code) {
    await prisma.otpCode.update({
      where: { phone },
      data: { attempts: record.attempts + 1 },
    });
    throw new Error('کد تایید نامعتبر است.');
  }

  await prisma.$transaction([
    prisma.otpCode.delete({ where: { phone } }),
    prisma.otpLog.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true },
    })
  ]);

  return true;
}