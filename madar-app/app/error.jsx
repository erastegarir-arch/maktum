'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

export default function ServerError({ error, reset }) {
  const cardRef = useRef(null);

  // تنظیم عنوان تب مرورگر و ثبت لاگ خطا
  useEffect(() => {
    document.title = 'مدار | خطای داخلی سرور';
    // لاگ کردن ارور برای تیم فنی
    console.error("خطای داخلی سرور رخ داد:", error);
  }, [error]);

  // افکت نوری ماوس (Spotlight) - بهینه‌شده برای جلوگیری از لگ
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
    // حذف رنگ ثابت bg-[#050810] تا پس‌زمینه شفاف باشد و گوی‌های نوری AmbientBackground کاملاً مشخص شوند
    <div className="relative min-h-[100dvh] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden select-none dir-rtl">

      {/* ================== پترن نئونی محیطی (Ambient) ================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* پترن نقطه‌ای ظریف مهندسی با شفافیت بسیار کم برای ترکیب با AmbientBackground */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:24px_24px] md:bg-[length:32px_32px]" />
      </div>

      {/* ================== تایپوگرافی غول‌پیکر پس‌زمینه (اعداد فارسی) ================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-30 md:opacity-50">
        <span className="text-[55vw] md:text-[35vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[4px] md:blur-[6px] tracking-tighter font-sans" dir="ltr">
          ۵۰۰
        </span>
      </div>

      {/* ================== کارت شیشه‌ای اصلی ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-8 md:py-12 flex flex-col justify-center items-center min-h-full">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          // تنظیم دقیق گلس‌مورفیسم برای درخشش ملایم و عبور نورهای قرمز/زرشکی
          className="relative w-full rounded-[2rem] md:rounded-3xl bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.03)] border border-white/[0.05] overflow-hidden group animate-[scaleIn_0.6s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-rose-500 to-transparent group-hover:via-rose-400 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(244,63,94,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />

          <div className="relative z-10 flex flex-col items-center">

            {/* ================== گرافیک مهندسی: مدارِ شکسته ================== */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 md:mb-10 flex items-center justify-center">
              {/* هاله نور پس‌زمینه */}
              <div className="absolute inset-0 bg-rose-500/10 blur-[30px] md:blur-[40px] rounded-full animate-pulse" />

              {/* مدار بیرونی */}
              <div className="absolute inset-0 border border-rose-500/20 rounded-full animate-[spin_10s_linear_infinite]" />

              {/* مدار میانی (نقطه‌چین) */}
              <div className="absolute inset-2 md:inset-3 border-[1.5px] md:border-[2px] border-dashed border-rose-500/40 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

              {/* هسته مرکزی مدار با گلس‌مورفیسم */}
              <div className="absolute inset-6 md:inset-8 bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_0_15px_rgba(244,63,94,0.2),0_0_30px_rgba(244,63,94,0.3)] rounded-full backdrop-blur-md flex items-center justify-center z-10 overflow-hidden">
                {/* عدد فارسی ارور */}
                <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] font-sans tracking-tighter z-10" dir="ltr">
                  ۵۰۰
                </span>
              </div>

              {/* نودهای (گره‌های) اطلاعاتی متوقف شده */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] animate-ping" />
              <div className="absolute bottom-3 right-1 md:bottom-4 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-400 rounded-full shadow-[0_0_10px_#f43f5e]" />
            </div>

            {/* ================== محتوای متنی کاربرپسند (جاستیفای و وسط‌چین) ================== */}
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-full text-[10px] md:text-xs font-bold text-rose-400 tracking-widest mb-1 md:mb-2 font-sans">
                اختلال در هسته پردازش
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-sans drop-shadow-md">
                ارتباط با هسته قطع شد
              </h1>

              {/* کلاس text-justify همراه با [text-align-last:center] */}
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify [text-align-last:center] font-sans">
                مشکلی در مسیر دریافت اطلاعات از سرورهای مدار رخ داده است. مهندسین ما در حال بررسی و رفع این تداخل هستند. لطفاً چند لحظه دیگر مجدداً تلاش کنید.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (بازطراحی به صورت یک خط در دسکتاپ) ================== */}
            {/* حذف کادر دور باکس و استایل شیشه‌ای */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-lg mx-auto mb-8 md:mb-12 py-3 px-4 md:py-4">
              
              {/* بخش اول: وضعیت سرور */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="warning" className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">وضعیت سرور:</span>
                </div>
                {/* نقطه چشمک زن در کنار وضعیت */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-xs md:text-sm font-bold text-rose-400 tracking-wider font-sans" dir="ltr">OFFLINE</span>
                </div>
              </div>

              {/* خط جداکننده نازک (فقط در دسکتاپ نمایش داده می‌شود) */}
              <div className="hidden sm:block w-[1px] h-6 md:h-8 bg-white/10 shrink-0"></div>

              {/* بخش دوم: شناسه خطا */}
              <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="hash" className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">شناسه خطا:</span>
                </div>
                {/* عدد ارور فارسی شده */}
                <span className="text-xs md:text-sm font-bold text-gray-200 tracking-wider font-sans drop-shadow-sm" dir="ltr">ERR_۵۰۰</span>
              </div>

            </div>

            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full">

              <button 
                onClick={() => reset()} 
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-6 md:px-8 py-3.5 rounded-xl text-sm md:text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] border border-transparent transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer font-sans"
              >
                <Icon name="update" className="w-4 h-4 md:w-5 md:h-5" />
                تلاش مجدد
              </button>

              <Link 
                href="/" 
                className="w-full sm:w-auto bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-gray-300 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer font-sans text-sm md:text-base group"
              >
                <Icon name="arrowLeft" className="w-4 h-4 md:w-5 md:h-5" />
                بازگشت به خانه
              </Link>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}