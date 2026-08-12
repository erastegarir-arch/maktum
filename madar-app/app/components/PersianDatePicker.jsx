'use client';

import React from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";

export default function PersianDatePicker({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "انتخاب تاریخ...",
  hasTime = false
}) {
  return (
    <div className="w-full relative custom-datepicker">
      <DatePicker
        value={value || ""}
        onChange={(dateObject) => {
          if (dateObject) {
            onChange(dateObject.format(hasTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"));
          } else {
            onChange("");
          }
        }}
        calendar={persian}
        locale={persian_fa}
        format={hasTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
        plugins={hasTime ? [<TimePicker key="time" position="bottom" />] : []}
        disabled={disabled}
        className="bg-dark"
        placeholder={placeholder}
        containerClassName="w-full"
        inputClass={`w-full bg-[#0b0f19] border ${disabled ? 'border-white/5 opacity-50 cursor-not-allowed' : 'border-white/10 hover:border-white/20 focus:border-amber-500'} rounded-lg p-2 text-sm text-white dir-ltr text-right outline-none transition-colors`}
      />
    </div>
  );
}