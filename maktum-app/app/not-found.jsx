'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

export default function NotFound() {
  const cardRef = useRef(null);

  // تنظیم عنوان تب مرورگر
  useEffect(() => {
    document.title = 'مکتوم | صفحه مورد نظر یافت نشد';
  }, []);

  // افکت نوری ماوس (Spotlight) - بهینه‌شده برای جلوگیری از لگ (استفاده از requestAnimationFrame)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  return (
    // حذف رنگ ثابت bg-[#050810] تا پس‌زمینه شفاف باشد و گوی‌های نوری کاملاً مشخص شوند
    <div className="relative min-h-[100dvh] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden select-none dir-rtl">

      {/* ================== تایپوگرافی غول‌پیکر پس‌زمینه (اعداد فارسی) ================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-30 md:opacity-50">
        <span className="text-[55vw] md:text-[35vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[4px] md:blur-[6px] animate-[pulse_4s_ease-in-out_infinite] leading-none font-sans" dir="ltr">
          ۴۰۴
        </span>
      </div>

      {/* ================== کارت شیشه‌ای اصلی ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-8 md:py-12 flex flex-col justify-center items-center min-h-full">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          // تنظیم دقیق گلس‌مورفیسم برای درخشش ملایم و عبور نور بدون تاریکی بیش از حد
          className="relative w-full rounded-[2rem] md:rounded-3xl bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.03)] border border-white/[0.05] overflow-hidden group animate-[fadeIn_0.5s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent group-hover:via-blue-400 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس (فقط در دسکتاپ فعال است) */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* ================== گرافیک خلاقانه: رادار ================== */}
            <div className="relative w-36 h-36 md:w-48 md:h-48 mb-6 md:mb-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/10 blur-[30px] md:blur-[40px] rounded-full animate-pulse" />
              
              <div className="absolute inset-0 border border-cyan-500/20 rounded-full" />
              <div className="absolute inset-3 md:inset-4 border-[2px] md:border-[3px] border-dotted border-cyan-500/30 rounded-full animate-[spin_30s_linear_infinite]" />
              
              <div className="absolute inset-3 md:inset-4 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(6,182,212,0.4)_100%)] animate-[spin_3s_linear_infinite]" />
              </div>
              
              <div className="absolute inset-8 md:inset-12 border border-white/5 rounded-full flex items-center justify-center bg-white/[0.02] backdrop-blur-md z-10 shadow-[inset_0_0_15px_rgba(6,182,212,0.2),0_0_30px_rgba(6,182,212,0.3)]">
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/20" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/20" />
                {/* عدد فارسی ارور */}
                <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] font-sans tracking-tighter z-10" dir="ltr">
                  ۴۰۴
                </span>
              </div>

              <div className="absolute top-1/4 right-1/4 w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] animate-ping z-20" />
              <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-white rounded-full z-20" />
            </div>

            {/* ================== محتوای متنی ================== */}
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-full text-[10px] md:text-xs font-bold text-cyan-400 tracking-widest mb-1 md:mb-2 font-sans">
                مسیر نامعتبر
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-sans drop-shadow-md">
                مختصات خارج از مکتوم کشف شد!
              </h1>
              
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify [text-align-last:center] font-sans">
                به نظر می‌رسد به بخش ناشناخته‌ای از پایگاه داده رسیده‌اید. این مسیر ممکن است تغییر نام داده، حذف شده یا از ابتدا در این مختصات وجود نداشته باشد.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (طراحی یک خطی در دسکتاپ طبق عکس) ================== */}
            {/* حذف کادر دور باکس و استایل شیشه‌ای */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-lg mx-auto mb-8 md:mb-12 py-3 px-4 md:py-4">
              
              {/* بخش اول: وضعیت ردیابی */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="warning" className="w-4 h-4 md:w-5 md:h-5 text-cyan-500 animate-pulse" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">وضعیت ردیابی:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-xs md:text-sm font-bold text-rose-400 tracking-wider font-sans" dir="ltr">LOST_SIGNAL</span>
                </div>
              </div>

              {/* خط جداکننده نازک (فقط در دسکتاپ نمایش داده می‌شود) */}
              <div className="hidden sm:block w-[1px] h-6 md:h-8 bg-white/10 shrink-0"></div>

              {/* بخش دوم: کد خطا */}
              <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="hash" className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">کد خطا:</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-200 tracking-wider font-sans drop-shadow-sm" dir="ltr">ERR_۴۰۴</span>
              </div>

            </div>
            
            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full">
              
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-gray-900 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-transparent transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer font-sans text-sm md:text-base"
              >
                <Icon name="home" className="w-4 h-4 md:w-5 md:h-5" />
                بازگشت به پایگاه مرکزی
              </Link>
              
              <Link 
                href="/archive" 
                className="w-full sm:w-auto bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-gray-300 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer font-sans text-sm md:text-base group"
              >
                <Icon name="search" className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                جستجو در آرشیو
              </Link>
              
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}