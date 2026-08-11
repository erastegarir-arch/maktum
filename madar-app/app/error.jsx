'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

// دریافت دو ویژگی اصلی ارور در Next.js
export default function ServerError({ error, reset }) {
  const cardRef = useRef(null);

  useEffect(() => {
    // لاگ کردن ارور برای برنامه‌نویس در کنسول مرورگر
    console.error("سیستم با خطای داخلی مواجه شد:", error);
  }, [error]);

  // افکت نوری ماوس (Spotlight) پیشرفته برای کارت
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    // استفاده از min-h-screen و overflow-x-clip برای حذف اسکرول مزاحم
    <div className="relative min-h-screen bg-transparent text-gray-100 font-sans flex flex-col overflow-x-clip selection:bg-amber-500/30 selection:text-white">

      {/* استایل‌های انیمیشن‌های اختصاصی مدرن و بحرانی */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flicker {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        /* انیمیشن شناور تشدید شده و قوی‌تر برای عدد 500 */
        @keyframes floatIntense {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.03); }
        }
      `}} />

      {/* پس‌زمینه نئونی شناور با رنگ‌های گرم (بحرانی) و خطوط شبکه‌ای */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[15%] w-[45vw] h-[45vw] rounded-full blur-[110px] bg-[radial-gradient(circle,rgba(251,191,36,0.18)_0%,transparent_70%)] animate-[flicker_10s_infinite_ease-in-out]" />
        <div className="absolute bottom-[-10%] left-[15%] w-[55vw] h-[55vw] rounded-full blur-[110px] bg-[radial-gradient(circle,rgba(244,63,94,0.15)_0%,transparent_70%)] animate-[flicker_14s_infinite_ease-in-out_reverse]" />
        {/* پترن نقطه‌ای ماتریس داده */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(251,191,36,0.02)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      </div>

      {/* محتوای اصلی */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 pt-52 pb-20">
        <div className="max-w-2xl w-full text-center relative flex flex-col items-center">
          
          {/* عنصر گرافیکی: آیکون جدید هشدار و عدد ۵۰۰ با انیمیشن شناور قوی */}
          <div className="relative mb-12 flex flex-row items-center justify-center gap-4 md:gap-6 animate-[floatIntense_4s_ease-in-out_infinite]">
            
            {/* هاله نورانی پشت آیکون و عدد */}
            <div className="absolute inset-0 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

            {/* آیکون هشدار جدید در کنار عدد با سایه نئونی ملایم */}
            <div className="relative z-10 flex-shrink-0">
                <Icon name="shieldWarning" className="w-16 h-16 md:w-24 md:h-24 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]" />
            </div>
            
            {/* عدد ۵۰۰ */}
            <h1 className="relative z-10 text-[120px] md:text-[170px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-300 to-rose-500 drop-shadow-[0_0_40px_rgba(251,191,36,0.3)]" dir="rtl">
              ۵۰۰
            </h1>
            
          </div>

          {/* کارت شیشه‌ای سینمایی (Glassmorphism) متناسب با تم گرم */}
          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group bg-[#160d0a]/85 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-8 md:p-12 border-t-2 border-t-amber-500 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_30px_rgba(251,191,36,0.35)] hover:border-amber-500/50 w-full"
          >
            {/* لایه اسلات‌لایت تعاملی ماوس */}
            <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(500px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(251,191,36,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center space-y-6">
              
              {/* بج وضعیت: با کادر کامل و نقطه چشمک‌زن */}
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-bold text-amber-400 tracking-wider">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
                </span>
                خطای بحرانی در هسته مدار
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                ارتباط عصبی هسته پردازش داده بحرانی است!
              </h2>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-lg mx-auto mb-4 text-justify md:text-center">
                یک تداخل الکترومغناطیسی شدید، لایه‌های پردازشی اصلی را دچار اختلال کرده است. مدارهای داده در حال بازسازی هستند اما در حال حاضر پاسخگویی ممکن نیست.
              </p>
              
              {/* دکمه‌های عملیاتی جذاب */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                
                <button 
                  onClick={() => reset()} 
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-crimson-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:from-amber-400 hover:to-crimson-500 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="ph-bold ph-arrows-clockwise text-xl"></i>
                  تلاش مجدد برای تعمیر اتصال
                </button>
                
                <Link 
                  href="/" 
                  className="group/link w-full sm:w-auto bg-white/5 border border-white/10 text-gray-300 px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-white/10 hover:text-white hover:border-amber-400/50 transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
                >
                  <i className="ph-fill ph-house text-xl text-gray-400 group-hover/link:text-amber-400 transition-colors"></i>
                  بازگشت به لایه امن (خانه)
                </Link>
                
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}