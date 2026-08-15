// app/utils/dateFormatter.js
import { getSetting } from '@/app/actions/settings';

/**
 * تابع مرکزی برای فرمت‌دهی تاریخ در سراسر سایت بر اساس تنظیمات کاربر
 * @param {Date | string | number} dateInput - تاریخ خام
 * @param {string} lang - زبان فعلی سایت (برای دوزبانه شدن در آینده)
 * @returns {Promise<string>} - تاریخ فرمت شده
 */
export async function formatSiteDate(dateInput, lang = 'fa') {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    return 'تاریخ نامعتبر';
  }

  // ۱. دریافت تنظیمات از دیتابیس (با مقادیر پیش‌فرض امن)
  let timezone, calendarType, dateFormat;
  try {
    const settings = await Promise.all([
      getSetting('timezone'),
      getSetting('calendar_type'),
      getSetting('date_format')
    ]);
    
    timezone = settings[0] || 'Asia/Tehran';
    calendarType = settings[1] || 'jalali';
    dateFormat = settings[2] || 'full';
  } catch (error) {
    // در صورت خطا در دیتابیس، از مقادیر پیش‌فرض استفاده کن
    timezone = 'Asia/Tehran';
    calendarType = 'jalali';
    dateFormat = 'full';
  }

  // ۲. مدیریت فرمت نسبی (زمان‌گذشته) - این بخش نیاز به منطق خاص دارد
  if (dateFormat === 'relative') {
    return formatRelativeTime(date, lang);
  }

  // ۳. تنظیمات Locale و Calendar برای Intl
  // اگر سیستم دوزبانه شد، اینجا منطق lang را اضافه کنید
  // برای جلالی: fa-IR-u-ca-jalali
  // برای میلادی فارسی: fa-IR-u-ca-gregory
  // برای میلادی انگلیسی: en-US-u-ca-gregory
  
  let locale = 'fa-IR';
  if (calendarType === 'jalali') {
    locale += '-u-ca-jalali';
  } else {
    locale += '-u-ca-gregory';
  }

  // ۴. تنظیمات پترن فرمت بر اساس dateFormat
  let options = {
    timeZone: timezone,
    // ساعت تابستانی (DST) توسط خود Intl و بر اساس timezone به صورت خودکار مدیریت می‌شود
    // نیازی به چک کردن دستی use_dst نیست، Intl آن را دقیق مدیریت می‌کند.
  };

  if (dateFormat === 'short') {
    // مثال: ۱۴۰۳/۰۵/۲۲
    options = {
      ...options,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
  } else {
    // مثال: دوشنبه ۲۲ مرداد ۱۴۰۳
    // dateFormat === 'full' یا پیش‌فرض
    options = {
      ...options,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
  }

  // ۵. فرمت نهایی با Intl
  return new Intl.DateTimeFormat(locale, options).format(date);
}

// --- تابع کمکی برای فرمت نسبی (زمان‌گذشته) ---
function formatRelativeTime(date, lang) {
  const now = new Date();
  const diffSeconds = Math.round((now - date) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  // در آینده اگر انگلیسی اضافه شد، اینجا switch case بزنید
  
  if (diffSeconds < 60) return 'چند ثانیه پیش';
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 30) return `${diffDays} روز پیش`;
  if (diffMonths < 12) return `${diffMonths} ماه پیش`;
  return `${diffYears} سال پیش`;
}