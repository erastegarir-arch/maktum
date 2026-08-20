'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

export default function NotFound() {
  const cardRef = useRef(null);

  // تنظیم عنوان تب مرورگر
  useEffect(() => {
    document.title = 'مدار | صفحه مورد نظر یافت نشد';
  }, []);

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
    <div className="relative min-h-screen bg-[#050810] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden selection:bg-cyan-500/30 selection:text-white dir-rtl">

      {/* ================== پس‌زمینه نئونی محیطی (Deep Space Ambient) ================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[130px] bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_60%)] animate-[float_15s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_60%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
        
        {/* پترن شبکه‌ای (Grid) برای القای حس نقشه و مختصات */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* ================== تایپوگرافی غول‌پیکر پس‌زمینه ================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-70">
        <span className="text-[35vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/5 to-transparent blur-[6px] animate-[pulse_4s_ease-in-out_infinite] leading-none" dir="ltr">
          404
        </span>
      </div>

      {/* ================== کارت شیشه‌ای اصلی (GKS1) ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-12">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative w-full rounded-3xl border border-white/10 bg-[#0b0f19]/80 backdrop-blur-2xl p-8 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group animate-[fadeIn_0.5s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور (تم فیروزه‌ای و آبی) */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent group-hover:via-blue-400 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.06),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* ================== گرافیک خلاقانه: رادار در حال جستجو ================== */}
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              {/* هاله نور پس‌زمینه */}
              <div className="absolute inset-0 bg-cyan-500/10 blur-[40px] rounded-full animate-pulse" />
              
              {/* حلقه‌های بیرونی رادار */}
              <div className="absolute inset-0 border border-cyan-500/20 rounded-full" />
              <div className="absolute inset-4 border-[3px] border-dotted border-white/10 rounded-full animate-[spin_30s_linear_infinite]" />
              
              {/* لنز اسکنر رادار (نور چرخشی) */}
              <div className="absolute inset-4 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(6,182,212,0.4)_100%)] animate-[spin_3s_linear_infinite]" />
              </div>
              
              {/* هدف‌گیر (Crosshair) و عدد 404 */}
              <div className="absolute inset-12 border border-cyan-500/30 rounded-full flex items-center justify-center bg-[#0b0f19]/60 backdrop-blur-sm z-10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/20" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/20" />
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] font-sans tracking-tighter z-10" dir="ltr">
                  404
                </span>
              </div>

              {/* نقطه چشمک‌زن (نماد صفحه گمشده) */}
              <div className="absolute top-1/4 right-1/4 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] animate-ping z-20" />
              <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-white rounded-full z-20" />
            </div>

            {/* ================== محتوای متنی کاربرپسند ================== */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400 tracking-widest shadow-inner mb-2">
                مسیر نامعتبر
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                مختصات خارج از مدار کشف شد!
              </h1>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify md:text-center">
                به نظر می‌رسد به بخش ناشناخته‌ای از پایگاه داده رسیده‌اید. این مسیر (آدرس) ممکن است تغییر نام داده، حذف شده یا از ابتدا در این مختصات وجود نداشته باشد.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (Radar Diagnostic UI) ================== */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6 w-full max-w-sm mx-auto mb-10 border-t border-b border-white/5 py-5">
              
              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <Icon name="radar" className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span className="text-xs text-gray-500">وضعیت ردیابی:</span>
                <span className="text-xs font-bold text-rose-400 tracking-wider font-sans" dir="ltr">LOST_SIGNAL</span>
              </div>

              <div className="hidden sm:block w-[1px] h-8 bg-white/10"></div>

              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <Icon name="hash" className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-500">کد خطا:</span>
                <span className="text-xs font-bold text-gray-300 tracking-wider font-sans" dir="ltr">ERR_404</span>
              </div>

            </div>
            
            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-gray-900 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <Icon name="home" className="w-5 h-5" />
                بازگشت به پایگاه مرکزی
              </Link>
              
              <Link 
                href="/archive" 
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-gray-300 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Icon name="search" className="w-5 h-5 text-gray-400 group-hover:text-white" />
                جستجو در آرشیو
              </Link>
              
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}