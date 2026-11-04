'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; 

export default function ServerError({ error, reset }) {
  const cardRef = useRef(null);

  useEffect(() => {
    document.title = 'مدار | خطای سیستمی';
    // لاگ کردن ارور برای رهگیری توسط برنامه‌نویس
    console.error('Server Error Caught:', error);
  }, [error]);

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
    <div className="relative min-h-[100dvh] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden select-none dir-rtl">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-30 md:opacity-50">
        <span className="text-[55vw] md:text-[35vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[4px] md:blur-[6px] tracking-tighter font-sans" dir="ltr">
          ۵۰۰
        </span>
      </div>

      <main className="relative z-10 w-full max-w-2xl px-4 py-8 md:py-12 flex flex-col justify-center items-center min-h-full">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative w-full rounded-[2rem] md:rounded-3xl bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.03)] border border-white/[0.05] overflow-hidden group animate-[scaleIn_0.5s_ease-out]"
        >
          {/* خط نئونی طلایی */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent group-hover:via-yellow-400 transition-colors duration-700" />
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(245,158,11,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* گرافیک چرخ‌دنده‌های در حال تعمیر */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6 md:mb-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/10 blur-[30px] rounded-full animate-pulse" />
              
              <div className="absolute inset-4 md:inset-6 border-[2px] border-dotted border-amber-500/40 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
              
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_15px_rgba(245,158,11,0.2),0_0_30px_rgba(245,158,11,0.3)] z-10 overflow-hidden">
                <Icon name="setting" className="w-10 h-10 md:w-12 md:h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-[spin_4s_linear_infinite]" />
              </div>
            </div>

            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-full text-[10px] md:text-xs font-bold text-amber-400 tracking-widest mb-1 md:mb-2 font-sans">
                اختلال سیستمی
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-sans drop-shadow-md">
                هسته پردازشی متوقف شد!
              </h1>
              
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify [text-align-last:center] font-sans">
                یک خطای پیش‌بینی نشده در موتور پردازشی سرور رخ داده است. مهندسین سیستم به طور خودکار از این اختلال مطلع شدند. لطفاً لحظاتی دیگر مجدداً تلاش کنید.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-lg mx-auto mb-8 md:mb-12 py-3 px-4 md:py-4">
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="activity" className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">وضعیت هسته:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-xs md:text-sm font-bold text-amber-400 tracking-wider font-sans" dir="ltr">CRITICAL</span>
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-6 md:h-8 bg-white/10 shrink-0"></div>

              <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="hash" className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">کد رهگیری:</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-200 tracking-wider font-sans drop-shadow-sm" dir="ltr">ERR_۵۰۰</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full">
              {/* دکمه تلاش مجدد که تابع reset را صدا می‌زند */}
              <button 
                onClick={() => reset()} 
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-gray-900 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-transparent transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer font-sans text-sm md:text-base"
              >
                <Icon name="refresh" className="w-4 h-4 md:w-5 md:h-5" />
                تلاش مجدد
              </button>
              
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-gray-300 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer font-sans text-sm md:text-base group"
              >
                <Icon name="home" className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                بازگشت به خانه
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}