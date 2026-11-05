'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSetting } from '@/app/actions/settings';
import Icon from '../Icon';

export default function AdminHeader() {
  const [dateTime, setDateTime] = useState({ time: '', date: '' });
  const [mounted, setMounted] = useState(false);
  const [dateSettings, setDateSettings] = useState(null);

  useEffect(() => {
    setMounted(true);

    async function loadSettings() {
      try {
        const settings = await getSetting('datetime_settings');
        if (settings) {
          setDateSettings(JSON.parse(settings));
        }
      } catch (e) {
        // Fallback to default
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

      let formattedTime = now.toLocaleTimeString('fa-IR', timeOptions);
      formattedTime = formattedTime.replace(/[a-zA-Z]/g, '').trim();

      const formatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const parts = formatter.formatToParts(now);
      const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';

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
    // کاهش ارتفاع هدر به h-14 در موبایل و h-16 در دسکتاپ برای مینیمالیسم بیشتر
    <header className="sticky top-0 z-40 h-14 md:h-16 w-full flex items-center justify-between px-4 md:px-8 select-none transition-all duration-300">
      
      {/* ========================================================= */}
      {/* ۱. لایه گلس‌مورفیسم پیشرفته (Advanced Glass Backdrop) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 bg-[#070b14]/45 backdrop-blur-3xl border-b border-white/[0.04] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] pointer-events-none -z-10" />
      
      {/* خط نوری نامرئی برای ایجاد عمق در لبه بالا */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none -z-10" />

      {/* ========================================================= */}
      {/* ۲. بخش راست: تایپوگرافی اصیل (بدون عنوان فرعی) */}
      {/* ========================================================= */}
      <div className="relative z-10 flex items-center">
        {/* متن عربی با فونت اختصاصی، رنگ سبز خالص و افکت تنفس نوری */}
        <motion.h2 
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="quran-text text-base md:text-xl lg:text-2xl text-[#10b981] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] mt-1"
          style={{ lineHeight: '1' }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </motion.h2>
      </div>

      {/* ========================================================= */}
      {/* ۳. بخش چپ: کپسول شیشه‌ای زمان (تنظیم‌شده با ارتفاع جدید) */}
      {/* ========================================================= */}
      <div className="relative z-10 flex items-center">
        <div className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] transition-all hover:bg-white/[0.04]">
          
          {/* آیکون و ساعت */}
          <div className="flex items-center gap-1.5 text-emerald-400/90">
            <Icon name="clock" className="w-3.5 h-3.5 md:w-4 md:h-4 drop-shadow-sm" />
            <span 
              className="text-xs md:text-sm font-bold font-sans tracking-widest dir-ltr mt-0.5" 
              suppressHydrationWarning
            >
              {dateTime.time || '۰۰:۰۰:۰۰'}
            </span>
          </div>

          {/* تاریخ (مخفی در موبایل) */}
          <div className="hidden md:flex items-center gap-3 pl-1">
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <Icon name="calendar" className="w-3.5 h-3.5 opacity-80" />
              <span 
                className="text-[11px] lg:text-xs font-medium font-sans mt-0.5" 
                suppressHydrationWarning
              >
                {dateTime.date || '...'}
              </span>
            </div>
          </div>
          
        </div>
      </div>
      
    </header>
  );
}