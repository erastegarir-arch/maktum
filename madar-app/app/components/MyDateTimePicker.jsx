// @/app/components/MyDateTimePicker.jsx
'use client';

import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import Icon from "./Icon"; 
import { JALALI_CONFIG, formatDisplayDate } from '@/app/utils/CalendarUtils';

// --- کامپوننت ظاهرِ اینپوت سفارشی (فقط شمسی و بسیار تمیز) ---
const CustomInput = ({ openCalendar, value, label, activeTheme, className }) => {
  const displayValue = formatDisplayDate(value);

  // استایل‌ها و فونت شمسی
  const inputClass = `w-full bg-[#080c16] p-3 text-sm text-white outline-none rounded-xl border border-white/10 focus:border-white/30 transition-colors text-center font-bold cursor-pointer ${JALALI_CONFIG.fontClass} ${className}`;

  return (
    <div className="space-y-2 relative w-full">
      {label && <label className="text-xs text-gray-300 font-bold block">{label}</label>}
      <div className="relative group">
        <input
          type="text"
          value={displayValue}
          onClick={openCalendar} // کلیک روی اینپوت تقویم را باز می‌کند
          className={inputClass}
          readOnly={true} // جلوگیری از تایپ دستی
          placeholder="انتخاب تاریخ و ساعت..."
        />
        {/* آیکون تقویم با رنگ تم پویا */}
        <Icon 
          name="calendar" 
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors ${activeTheme?.color}`} 
        />
      </div>
    </div>
  );
};

// --- کامپوننت اصلی انتخابگر تاریخ و ساعت سراسری ---
// ✅ گام جدید: این کامپوننت بسیار "احمق" است، فقطprop می‌گیرد و رندر می‌کند.
// هیچuseEffect یا درخواست دیتابیس ندارد -> پردازش کم، دردسر کم.
const MyDateTimePicker = ({ 
  value, 
  onChange, 
  label, 
  activeTheme, 
  className 
}) => {
  
  return (
    <div className={`date-time-picker-wrapper ${className}`}>
      <DatePicker
        value={value} // مقدار Date استاندارد
        onChange={(dateObject) => {
          // تبدیل DateObject پکیج به Date استاندارد جاوااسکریپت برای والد
          if (dateObject) {
            onChange(dateObject.toDate()); 
          } else {
            onChange(null);
          }
        }}
        format={JALALI_CONFIG.saveFormat}
        // ✅ راهکار استاندارد: اضافه کردن پلاگین ساعت بدون خطا
        plugins={[
          <TimePicker position="bottom" h24={true} />
        ]}
        // ✅ بنیادین: تقویم سخت‌افزاری فقط شمسی
        calendar={JALALI_CONFIG.calendar}
        locale={JALALI_CONFIG.locale}
        calendarPosition="bottom-right"
        containerClassName="w-full"
        // استفاده از اینپوت سفارشی که در بالا ساختیم
        customElement={
          <CustomInput 
            label={label} 
            activeTheme={activeTheme}
          />
        }
      />
    </div>
  );
};

export default MyDateTimePicker;