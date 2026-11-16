// src/lib/otpService.ts
import { prisma } from './prisma';
import crypto from 'crypto';

// ساخت کلید ۳۲ بایتی ایمن و ضدکرش (سازگار با کلید ۶۴ کاراکتری Hex فعلی)
function getSafeSecretKey(): Buffer {
  const rawKey = process.env.OTP_ENCRYPTION_KEY || '';
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }
  return crypto.createHash('sha256').update(rawKey || 'MAKTUM_FALLBACK_OTP_SECRET_KEY').digest();
}

const SECRET_KEY = getSafeSecretKey();
const MELIPAYAMAK_API_KEY = process.env.MELIPAYAMAK_API_KEY;
const MELIPAYAMAK_BODY_ID = process.env.MELIPAYAMAK_BODY_ID;

// تولید کد تصادفی از طریق موتور رمزنگاری امن Node.js
function generateRandomCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
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

  // فقط اگر پیامک قبلی «با موفقیت» ارسال شده باشد، کاربر باید ۲ دقیقه صبر کند
  const lastSuccessfulLog = recentLogs.find((log: any) => log.isSuccess);
  if (lastSuccessfulLog && lastSuccessfulLog.createdAt >= twoMinutesAgo) {
    throw new Error('کد تایید به تازگی ارسال شده است. لطفاً ۲ دقیقه صبر کنید.');
  }

  const successfulCount = recentLogs.filter((log: any) => log.isSuccess).length;
  if (successfulCount >= 5 || recentLogs.length >= 10) {
    throw new Error('سقف دریافت کد در یک ساعت تکمیل شده است.');
  }

  // ۲. تولید کد و گذرواژه‌نگاری‌های لازم
  const plainCode = generateRandomCode();
  const hashedCode = hashOtpCode(phone, plainCode);
  const encryptedLogCode = encryptOtpForLog(plainCode);

  // ۳. ارسال درخواست به ملی پیامک (با مهلت زمانی ۱۰ ثانیه برای جلوگیری از هنگ کردن سرور)
  let isSuccess = true;
  let errorMsg = null;

  try {
    if (!MELIPAYAMAK_API_KEY) {
      throw new Error('کلید API ملی‌پیامک در پرونده .env تنظیم نشده است.');
    }

    const response = await fetch(`https://console.melipayamak.com/api/send/shared/${MELIPAYAMAK_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodyId: parseInt(MELIPAYAMAK_BODY_ID || '579058', 10),
        to: phone,
        args: [plainCode],
      }),
      signal: AbortSignal.timeout(10000), // قطع خودکار در صورت عدم پاسخ درگاه پس از ۱۰ ثانیه
    });

    const smsResult = await response.json();
    
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
    if (isSuccess) {
      await tx.otpCode.deleteMany({ where: { phone } });

      await tx.otpCode.create({
        data: {
          phone,
          code: hashedCode,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000), // انقضا در ۲ دقیقه
        },
      });
    }

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
    throw new Error('سامانه پیامک موقتاً دچار اختلال است. لطفاً دقایقی دیگر تلاش کنید.');
  }

  return { message: 'کد تایید ارسال شد', expires_in: 120 };
}

/**
 * متد اعتبارسنجی کد وارد شده توسط کاربر
 */
export async function verifyOtpCode(phone: string, inputCode: string) {
  const cleanCode = String(inputCode || '').trim();
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

  const hashedInput = hashOtpCode(phone, cleanCode);
  
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