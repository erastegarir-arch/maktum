'use client';
import { useState, useEffect } from 'react';

export default function AdminHeader() {
  const [dateTime, setDateTime] = useState({ time: '', date: '' });

  useEffect(() => {
    // تابع به‌روزرسانی تاریخ و ساعت زنده
    const updateClock = () => {
      const now = new Date();
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      
      setDateTime({
        time: now.toLocaleTimeString('fa-IR', timeOptions),
        date: now.toLocaleDateString('fa-IR', dateOptions),
      });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-[#030712]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      
      {/* بخش راست: خوشامدگویی */}
      <div>
        <h2 className="text-lg font-bold text-gray-100">سلام، ادمین!</h2>
        <p className="text-xs text-gray-400 font-light mt-1">خلاصه وضعیت پایگاه مدار</p>
      </div>

      {/* بخش چپ: تاریخ، ساعت و پروفایل */}
      <div className="flex items-center gap-6">
        
        {/* ابزارک تاریخ و ساعت */}
        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-sm text-[#10b981] font-medium tracking-widest" suppressHydrationWarning>
            {dateTime.time || '۰۰:۰۰:۰۰'}
          </span>
          <div className="w-px h-4 bg-white/20"></div>
          <span className="text-sm text-gray-300" suppressHydrationWarning>
            {dateTime.date || 'در حال بارگذاری...'}
          </span>
        </div>

        {/* آواتار ادمین */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <div className="w-full h-full bg-[#0b0f19] rounded-full flex items-center justify-center">
            <span className="text-[#10b981] font-bold text-sm">M</span>
          </div>
        </div>

      </div>
    </header>
  );
}