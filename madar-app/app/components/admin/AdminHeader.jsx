'use client';

import { useState, useEffect } from 'react';
import { getSetting } from '@/app/actions/settings';
import Icon from '../Icon';

export default function AdminHeader() {
  const [dateTime, setDateTime] = useState({ time: '', date: '' });
  const [mounted, setMounted] = useState(false);
  const [dateSettings, setDateSettings] = useState(null);

  useEffect(() => {
    setMounted(true);

    // دریافت تنظیمات تاریخ و زمان از دیتابیس
    async function loadSettings() {
      try {
        const settings = await getSetting('datetime_settings');
        if (settings) {
          setDateSettings(JSON.parse(settings));
        }
      } catch (e) {
        // در صورت عدم دسترسی از مقادیر پیش‌فرض استفاده می‌شود
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      const showSeconds = dateSettings?.showSeconds !== false;
      const use24Hour = dateSettings?.use24Hour !== false;

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(showSeconds ? { second: '2-digit' } : {}),
        hour12: !use24Hour,
      };

      // دریافت زمان فارسی و حذف کاراکترهای انگلیسی ناخواسته
      let formattedTime = now.toLocaleTimeString('fa-IR', timeOptions);
      formattedTime = formattedTime.replace(/[a-zA-Z]/g, '').trim();

      // تفکیک دقیق اجزای تاریخ جهت جلوگیری از به هم ریختگی ترتیب کلمات در مرورگرهای مختلف
      const formatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const parts = formatter.formatToParts(now);
      const weekday = parts.find(p => p.type === 'weekday')?.value || '';
      const day = parts.find(p => p.type === 'day')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';

      // ترکیب کاملاً مرتب: «پنجشنبه، ۲۲ مرداد ۱۴۰۵»
      const formattedDate = `${weekday}، ${day} ${month} ${year}`;

      setDateTime({
        time: formattedTime,
        date: formattedDate,
      });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [dateSettings]);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between shadow-2xl select-none overflow-hidden font-sans">
      {/* ۱. لایه پس‌زمینه شیشه‌ای خالص بدون خط سفید */}
      <div className="absolute inset-0 bg-[#0b0f19]/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] pointer-events-none -z-10" />

      {/* ۲. نوار نوری گرادینت بالای هدر */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 z-20 pointer-events-none" />

      {/* بخش راست: عبارت «بسم الله الرحمن الرحیم» و عنوان مرکز مدیریت */}
      <div className="relative z-10 flex flex-col justify-center">
        <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-gray-100 to-gray-300 tracking-wide font-sans">
          بسم الله الرحمن الرحیم
        </h2>
        
        <p className="text-xs text-[#10b981] font-medium mt-1 flex items-center gap-2 font-sans">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
          </span>
          مرکز مدیریت پایگاه مدار
        </p>
      </div>

      {/* بخش چپ: ابزارک زنده تاریخ و ساعت */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex items-center gap-3.5 bg-white/5 px-4 py-2 rounded-xl shadow-inner backdrop-blur-md transition-colors duration-300">
          
          <div className="flex items-center gap-2">
            <Icon name="clock" className="w-4 h-4 text-[#10b981] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-bold text-[#10b981] font-sans tracking-wide dir-rtl" suppressHydrationWarning>
              {dateTime.time || '۰۰:۰۰:۰۰'}
            </span>
          </div>

          <div className="w-px h-4 bg-white/10"></div>

          <div className="flex items-center gap-2">
            <Icon name="calendar" className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
            <span className="text-xs text-gray-300 font-sans font-medium" suppressHydrationWarning>
              {dateTime.date || 'در حال دریافت...'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}