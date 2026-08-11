'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

export default function NotFound() {
  const cardRef = useRef(null);

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
    <div className="relative min-h-screen bg-transparent text-gray-100 font-sans flex flex-col overflow-x-clip selection:bg-purple-500/30 selection:text-white">

      {/* استایل‌های انیمیشن‌های اختصاصی مدرن */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
      `}} />

      {/* پس‌زمینه نئونی شناور و خطوط شبکه‌ای بایگانی */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[15%] w-[45vw] h-[45vw] rounded-full blur-[110px] bg-[radial-gradient(circle,rgba(168,85,247,0.22)_0%,transparent_70%)] animate-[pulseGlow_8s_infinite_ease-in-out]" />
        <div className="absolute bottom-[-10%] left-[15%] w-[55vw] h-[55vw] rounded-full blur-[110px] bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,transparent_70%)] animate-[pulseGlow_12s_infinite_ease-in-out_reverse]" />
        {/* پترن نقطه‌ای ماتریس داده */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      </div>

      {/* محتوای اصلی */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 pt-52 pb-20">
        <div className="max-w-2xl w-full text-center relative flex flex-col items-center">
          
          {/* عنصر گرافیکی رادار و اسکنر سیگنال */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* رادار چرخان */}
            <div className="absolute w-44 h-44 md:w-60 md:h-60 rounded-full border border-purple-500/20 animate-[radarSweep_12s_linear_infinite] pointer-events-none">
              <div className="absolute top-0 left-1/2 w-1 h-1/2 bg-gradient-to-b from-cyan-400/60 to-transparent origin-bottom" />
            </div>
            <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full border border-dashed border-cyan-400/30 pointer-events-none" />
            <div className="absolute w-28 h-28 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* عدد ۴۰۴ با افکت شناور و گرادیانت نئونی */}
            <h1 className="text-[120px] md:text-[170px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-300 to-cyan-400 drop-shadow-[0_0_50px_rgba(168,85,247,0.35)] animate-[floatSlow_6s_ease-in-out_infinite]" dir="rtl">
              ۴۰۴
            </h1>
          </div>

          {/* کارت شیشه‌ای سینمایی (Glassmorphism) */}
          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group bg-[#0c1222]/85 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-8 md:p-12 border-t-2 border-t-purple-500 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_30px_rgba(168,85,247,0.35)] hover:border-purple-500/50 w-full"
          >
            {/* لایه اسلات‌لایت تعاملی ماوس */}
            <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(500px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(168,85,247,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
              {/* بج وضعیت */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-bold text-purple-400 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
                خطای انحراف از مدار
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                این مختصات در مدار ثبت نشده است!
              </h2>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-lg mx-auto">
                سند یا مسیری که به دنبال آن بودید، یا به لایه‌های امنیتی منتقل شده و یا در تونل‌های تاریک تاریخ گم شده است.
              </p>
              
              {/* دکمه‌های عملیاتی جذاب */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/" 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Icon name="house" className="w-5 h-5 fill-current" />
                  بازگشت به مدار (خانه)
                </Link>
                
                <Link 
                  href="/about" 
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-gray-300 px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-white/10 hover:text-white hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
                >
                  <Icon name="compass" className="w-5 h-5 text-cyan-400" />
                  درباره مدار
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}