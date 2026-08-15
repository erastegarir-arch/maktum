// @/app/utils/CalendarUtils.jsx

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

// ✅ استاندارد بنیادین: پیکربندی سخت‌افزاری فقط برای تقویم شمسی
export const JALALI_CONFIG = {
  calendar: persian,
  locale: persian_fa,
  inputFormat: "YYYY/MM/DD HH:mm", // فرمت نمایش در اینپوت
  saveFormat: "YYYY/MM/DD HH:mm",  // فرمت داخلی پکیج
  fontClass: "font-sans"           // فونت فارسی
};

// تابع کمکی استاندارد برای فرمت‌دهی نمایش تاریخ (فقط شمسی)
export const formatDisplayDate = (date) => {
  if (!date) return "";
  const dateObj = new DateObject(date);
  dateObj.set({ calendar: persian, locale: persian_fa });
  return dateObj.format(JALALI_CONFIG.inputFormat);
};