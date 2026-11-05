import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

export const JALALI_CONFIG = {
  calendar: persian,
  locale: persian_fa,
  inputFormat: "YYYY/MM/DD", // فقط تاریخ (سال/ماه/روز) بدون ساعت
  saveFormat: "YYYY/MM/DD",
  fontClass: "font-sans"
};

export const formatDisplayDate = (date) => {
  if (!date) return "";
  const dateObj = new DateObject(date);
  dateObj.set({ calendar: persian, locale: persian_fa });
  return dateObj.format(JALALI_CONFIG.inputFormat);
};