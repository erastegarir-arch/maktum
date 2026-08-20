'use client';

import DatePicker from "react-multi-date-picker";
import Icon from "@/app/components/Icon";
import { JALALI_CONFIG } from "@/app/utils/CalendarUtils";

export default function MyDateTimePicker({ value, onChange, activeTheme }) {
  return (
    <div className="relative w-full">
      <DatePicker
        value={value}
        onChange={(dateObject) => {
          onChange(dateObject ? dateObject.toDate() : null);
        }}
        calendar={JALALI_CONFIG.calendar}
        locale={JALALI_CONFIG.locale}
        format={JALALI_CONFIG.saveFormat}
        calendarPosition="bottom-right"
        // حذف استایل پیش‌فرض و اعمال استایل دارک اختصاصی سایت
        containerClassName="!w-full !block"
        inputClass="!w-full !bg-[#080c16] !text-white !border !border-white/10 focus:!border-white/30 !rounded-xl !p-3 !text-sm !font-bold !text-center !outline-none !cursor-pointer hover:!border-white/20 !transition-all font-sans shadow-inner"
        placeholder="انتخاب تاریخ..."
      />
      {/* آیکون تقویم در سمت چپ با رنگ تم پویا */}
      <Icon
        name="calendar"
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${activeTheme?.color || 'text-cyan-400'}`}
      />
    </div>
  );
}