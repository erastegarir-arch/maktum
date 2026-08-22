'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; 

export default function ServerError({ error, reset }) {
  const cardRef = useRef(null);

  // تنظیم عنوان تب مرورگر و ثبت لاگ خطا
  useEffect(() => {
    document.title = 'مدار | خطای داخلی سرور';
    // لاگ کردن ارور برای تیم فنی
    console.error("خطای داخلی سرور رخ داد:", error);
  }, [error]);

  // افکت نوری ماوس (Spotlight) بر اساس گرافیک کلی ۱
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    // تأکید بر فونت وزیرمتن با کلاس font-sans
    <div className="relative min-h-screen bg-[#050810] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden selection:bg-rose-500/30 selection:text-white dir-rtl">

      {/* ================== پس‌زمینه نئونی محیطی (Ambient) ================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[130px] bg-[radial-gradient(circle,rgba(244,63,94,0.15)_0%,transparent_60%)] animate-[float_15s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_60%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />

        {/* پترن نقطه‌ای ظریف مهندسی */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* ================== کارت شیشه‌ای اصلی (GKS1) ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-12">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative w-full rounded-3xl bg-[#0b0f19]/80 backdrop-blur-2xl p-8 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group animate-[scaleIn_0.6s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-rose-500 to-transparent group-hover:via-rose-400 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(244,63,94,0.06),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col items-center">

            {/* ================== گرافیک مهندسی: مدارِ شکسته ================== */}
            <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
              {/* هاله نور پس‌زمینه */}
              <div className="absolute inset-0 bg-rose-500/20 blur-[40px] rounded-full animate-pulse" />

              {/* مدار بیرونی */}
              <div className="absolute inset-0 border border-rose-500/20 rounded-full animate-[spin_10s_linear_infinite]" />

              {/* مدار میانی (نقطه‌چین) */}
              <div className="absolute inset-3 border-[2px] border-dashed border-rose-500/40 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

              {/* هسته مرکزی مدار */}
              <div className="absolute inset-8 bg-gradient-to-tr from-[#0b0f19] to-rose-900/40 border border-rose-500/30 rounded-full backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] z-10">
                <span className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] font-sans tracking-tighter" dir="ltr">
                  500
                </span>
              </div>

              {/* نودهای (گره‌های) اطلاعاتی متوقف شده */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] animate-ping" />
              <div className="absolute bottom-4 right-2 w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_10px_#f43f5e]" />
            </div>

            {/* ================== محتوای متنی کاربرپسند ================== */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                ارتباط با هسته پردازش قطع شد
              </h1>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify md:text-center">
                مشکلی در مسیر دریافت اطلاعات از سرورهای مدار رخ داده است. مهندسین ما در حال بررسی و رفع این تداخل هستند. لطفاً چند لحظه دیگر مجدداً تلاش کنید.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (Diagnostic UI) ================== */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6 w-full max-w-sm mx-auto mb-10 border-y border-white/5 py-5">
              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs text-gray-500">وضعیت سرور:</span>
                <span className="text-xs font-bold text-rose-400 tracking-wider font-sans" dir="ltr">OFFLINE</span>
              </div>

              <div className="hidden sm:block w-[1px] h-8 bg-white/10"></div>

              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <Icon name="hash" className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-500">شناسه خطا:</span>
                <span className="text-xs font-bold text-gray-300 tracking-wider font-sans" dir="ltr">ERR_500</span>
              </div>
            </div>

            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">

              <button 
                onClick={() => reset()} 
                className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Icon name="update" className="w-5 h-5" />
                تلاش مجدد
              </button>

              <Link 
                href="/" 
                className="w-full sm:w-auto bg-white/5 text-gray-300 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Icon name="arrowLeft" className="w-5 h-5" />
                بازگشت به خانه
              </Link>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
}