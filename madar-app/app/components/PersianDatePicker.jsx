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
  hasTime = false,
  inputClass
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
        inputClass={
          inputClass ||
          `w-full bg-white/10 border border-white/10 shadow-inner ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15 focus:border focus:border-amber-500 focus:bg-white/20'
          } rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 dir-ltr text-right outline-none transition-all font-sans`
        }
      />
    </div>
  );
}