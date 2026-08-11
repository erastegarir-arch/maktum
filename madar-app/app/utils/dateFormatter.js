import { getSetting } from '@/app/actions/settings';

export async function formatSiteDate(dateInput) {
  if (!dateInput) return '';
  
  // خواندن تنظیمات از دیتابیس
  const calendarType = await getSetting('calendar_type') || 'jalali';
  const dateFormat = await getSetting('date_format') || 'full';
  const useDst = await getSetting('use_dst') === 'true';
  const timezone = await getSetting('timezone') || 'Asia/Tehran';

  let date = new Date(dateInput);

  // اعمال ساعت تابستانی به صورت دستی (افزودن ۱ ساعت در صورت فعال بودن)
  if (useDst) {
    date = new Date(date.getTime() + (60 * 60 * 1000));
  }

  // ۱. حالت زمان‌گذشته (نسبی)
  if (dateFormat === 'relative') {
    const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });
    const diffInMilliseconds = date.getTime() - new Date().getTime();
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.round(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(diffInMinutes, 'minute');
    } else if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, 'hour');
    } else if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, 'day');
    }
    // اگر بیشتر از یک ماه بود، به فرمت کامل نمایش می‌دهد
  }

  // تنظیمات تقویم بر اساس جلالی یا میلادی
  const isJalali = calendarType === 'jalali';
  const locale = isJalali ? 'fa-IR' : 'en-US';
  
  // ۲. حالت متنی کامل (۲۲ مرداد ۱۴۰۳)
  if (dateFormat === 'full') {
    return new Intl.DateTimeFormat(locale, {
      calendar: isJalali ? 'persian' : 'gregory',
      timeZone: timezone,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  // ۳. حالت عددی کوتاه (۱۴۰۳/۰۵/۲۲)
  if (dateFormat === 'short') {
    return new Intl.DateTimeFormat(locale, {
      calendar: isJalali ? 'persian' : 'gregory',
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  return date.toLocaleDateString('fa-IR');
}