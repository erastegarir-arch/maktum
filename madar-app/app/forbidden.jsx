'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from './components/Icon'; // اتصال به فایل مرکزی آیکون‌ها

export default function ForbiddenAccess() {
  const cardRef = useRef(null);

  // تنظیم عنوان تب مرورگر
  useEffect(() => {
    document.title = 'مدار | عدم دسترسی به داده';
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
    <div className="relative min-h-screen bg-[#050810] text-gray-100 font-sans flex flex-col justify-center items-center overflow-hidden selection:bg-fuchsia-500/30 selection:text-white dir-rtl">

      {/* استایل‌های انیمیشن اختصاصی اسکنر امنیتی */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes laserScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser {
          animation: laserScan 2.5s ease-in-out infinite alternate;
        }
      `}} />

      {/* ================== پس‌زمینه نئونی و پترن امنیتی ================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* هاله‌های نوری رازآلود و امنیتی */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[130px] bg-[radial-gradient(circle,rgba(217,70,239,0.12)_0%,transparent_60%)] animate-[float_18s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(244,63,94,0.12)_0%,transparent_60%)] animate-[float_22s_infinite_ease-in-out_alternate-reverse]" />
        
        {/* پترن هاشور خورده (نوارهای خطر امنیتی نامحسوس) */}
        <div className="absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_2px,transparent_2px,transparent_12px)] pointer-events-none" />
      </div>

      {/* ================== تایپوگرافی غول‌پیکر پس‌زمینه (مهر محرمانه) ================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-60">
        <span className="text-[32vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/5 to-transparent blur-[4px] tracking-tighter font-sans" dir="ltr">
          403
        </span>
      </div>

      {/* ================== کارت شیشه‌ای اصلی (GKS1) ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-12">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative w-full rounded-3xl bg-white/[0.02] backdrop-blur-3xl p-8 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] border border-transparent overflow-hidden group animate-[scaleIn_0.5s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور (بنفش به قرمز) */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent group-hover:via-rose-500 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(217,70,239,0.06),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* ================== گرافیک خلاقانه: گاوصندوق و اسکنر امنیتی ================== */}
            <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
              {/* هاله نور پس‌زمینه قفل */}
              <div className="absolute inset-0 bg-fuchsia-500/10 blur-[40px] rounded-full animate-pulse" />
              
              {/* سپرهای امنیتی چرخشی */}
              <div className="absolute inset-2 border-2 border-dashed border-fuchsia-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-6 border border-rose-500/20 rounded-full" />
              
              {/* کادر مرکزی قفل */}
              <div className="relative w-24 h-24 bg-black/40 border border-transparent rounded-2xl backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_15px_rgba(217,70,239,0.2),0_0_30px_rgba(217,70,239,0.3)] z-10 overflow-hidden">
                <Icon name="lockKey" className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-80" />
                
                {/* لیزر اسکنر */}
                <div className="absolute left-0 right-0 h-[2px] bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-laser z-20" />
                <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent to-rose-500/20 animate-laser -mt-8 z-10" />
              </div>

              {/* نشانگرهای وضعیت اطراف قفل */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] animate-ping" />
            </div>

            {/* ================== محتوای متنی کاربرپسند ================== */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-transparent rounded-full text-xs font-bold text-fuchsia-400 tracking-widest shadow-inner mb-2 font-sans">
                دسترسی مسدود شد
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight font-sans">
                اسناد طبقه‌بندی شده!
              </h1>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify md:text-center font-sans">
                پروفایل کاربری شما فاقد مجوزهای لازم (Clearance) برای ورود به این بخش از پایگاه داده مدار است. این محتوا برای سطح کاربری شما محدود شده است.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (Clearance Diagnostic UI) ================== */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6 w-full max-w-sm mx-auto mb-10 bg-white/5 border border-transparent shadow-inner rounded-2xl py-4 px-6">
              
              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <Icon name="fingerprint" className="w-4 h-4 text-fuchsia-500" />
                <span className="text-xs text-gray-400 font-sans">وضعیت مجوز:</span>
                <span className="text-xs font-bold text-rose-400 tracking-wider font-sans" dir="ltr">DENIED</span>
              </div>

              <div className="hidden sm:block w-[1px] h-8 bg-white/10"></div>

              <div className="flex items-center justify-center gap-2.5 w-full sm:w-1/2">
                <Icon name="shieldCheck" className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-400 font-sans">کد امنیتی:</span>
                <span className="text-xs font-bold text-gray-300 tracking-wider font-sans" dir="ltr">ERR_403</span>
              </div>

            </div>
            
            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              
              <Link 
                href="/portal-entry-99/profile" 
                className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] border border-transparent transition-all duration-300 hover:-translate-y-1 cursor-pointer font-sans"
              >
                <Icon name="userPlus" className="w-5 h-5" />
                ارتقاء سطح دسترسی
              </Link>
              
              <Link 
                href="/t" 
                className="w-full sm:w-auto bg-white/5 text-gray-300 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 hover:bg-white/10 hover:text-white border border-transparent shadow-inner transition-all duration-300 cursor-pointer font-sans"
              >
                <Icon name="files" className="w-5 h-5 text-gray-400 group-hover:text-white" />
                بازگشت به آرشیو عمومی
              </Link>
              
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}