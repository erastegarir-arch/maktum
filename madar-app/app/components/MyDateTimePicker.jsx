'use client';

import DatePicker from "react-multi-date-picker";
import Icon from "@/app/components/Icon";
import { JALALI_CONFIG } from "@/app/utils/CalendarUtils";

export default function MyDateTimePicker({ value, onChange, activeTheme, inputClass }) {
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
        containerClassName="!w-full !block"
        inputClass={
          inputClass || 
          "!w-full !bg-white/10 !border !border-transparent !shadow-inner !rounded-xl !p-3.5 !text-sm !font-bold !text-white placeholder:!text-white/40 focus:!border focus:!border-white/30 focus:!bg-white/20 !outline-none !cursor-pointer hover:!bg-white/15 !transition-all !font-sans !text-center"
        }
        placeholder="انتخاب تاریخ..."
      />
      {/* آیکون تقویم در سمت چپ با رنگ تم پویا */}
      <Icon
        name="calendar"
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${activeTheme?.color || 'text-cyan-400'}`}
      />
    </div>
  );
}