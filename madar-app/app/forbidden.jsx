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

  // افکت نوری ماوس (Spotlight) - بهینه‌شده با requestAnimationFrame برای رفع لگ
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

      {/* ================== پترن امنیتی پس‌زمینه ================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* پترن هاشور خورده با شفافیت بسیار کم برای ترکیب با AmbientBackground */}
        <div className="absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_2px,transparent_2px,transparent_12px)] pointer-events-none" />
      </div>

      {/* ================== تایپوگرافی غول‌پیکر پس‌زمینه (اعداد فارسی) ================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 mix-blend-screen flex items-center justify-center opacity-30 md:opacity-50">
        <span className="text-[55vw] md:text-[35vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[4px] md:blur-[6px] tracking-tighter font-sans" dir="ltr">
          ۴۰۳
        </span>
      </div>

      {/* ================== کارت شیشه‌ای اصلی ================== */}
      <main className="relative z-10 w-full max-w-2xl px-4 py-8 md:py-12 flex flex-col justify-center items-center min-h-full">
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          // تنظیم دقیق گلس‌مورفیسم برای درخشش ملایم و عبور نورهای سرخابی
          className="relative w-full rounded-[2rem] md:rounded-3xl bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.03)] border border-white/[0.05] overflow-hidden group animate-[scaleIn_0.5s_ease-out]"
        >
          {/* خط نئونی بالای کارت در هاور */}
          <div className="absolute top-0 inset-x-0 h-[2px] opacity-70 pointer-events-none z-20 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent group-hover:via-rose-500 transition-colors duration-700" />

          {/* لایه Spotlight تعاملی ماوس */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(217,70,239,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* ================== گرافیک خلاقانه: گاوصندوق و اسکنر ================== */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6 md:mb-10 flex items-center justify-center">
              {/* هاله نور پس‌زمینه قفل */}
              <div className="absolute inset-0 bg-fuchsia-500/10 blur-[30px] md:blur-[40px] rounded-full animate-pulse" />
              
              {/* سپرهای امنیتی چرخشی */}
              <div className="absolute inset-1 md:inset-2 border-[1.5px] md:border-2 border-dashed border-fuchsia-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 md:inset-6 border border-rose-500/20 rounded-full" />
              
              {/* کادر مرکزی قفل با گلس‌مورفیسم */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_15px_rgba(217,70,239,0.2),0_0_30px_rgba(217,70,239,0.3)] z-10 overflow-hidden">
                <Icon name="lockKey" className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-80" />
                
                {/* لیزر اسکنر */}
                <div className="absolute left-0 right-0 h-[2px] bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-laser z-20" />
                <div className="absolute left-0 right-0 h-6 md:h-8 bg-gradient-to-b from-transparent to-rose-500/20 animate-laser -mt-6 md:-mt-8 z-10" />
              </div>

              {/* نشانگرهای وضعیت اطراف قفل */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] animate-ping" />
            </div>

            {/* ================== محتوای متنی کاربرپسند (جاستیفای و وسط‌چین) ================== */}
            <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-full text-[10px] md:text-xs font-bold text-fuchsia-400 tracking-widest mb-1 md:mb-2 font-sans">
                دسترسی مسدود شد
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight font-sans drop-shadow-md">
                اسناد طبقه‌بندی شده!
              </h1>
              
              {/* کلاس text-justify همراه با [text-align-last:center] */}
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto text-justify [text-align-last:center] font-sans">
                پروفایل کاربری شما فاقد مجوزهای لازم (Clearance) برای ورود به این بخش از پایگاه داده مدار است. این محتوا برای سطح کاربری شما محدود شده است.
              </p>
            </div>

            {/* ================== پنل تشخیص وضعیت (بازطراحی به صورت یک خط در دسکتاپ) ================== */}
            {/* حذف کادر دور باکس و استایل شیشه‌ای */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full max-w-lg mx-auto mb-8 md:mb-12 py-3 px-4 md:py-4">
              
              {/* بخش اول: وضعیت مجوز */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="fingerprint" className="w-4 h-4 md:w-5 md:h-5 text-fuchsia-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">وضعیت مجوز:</span>
                </div>
                {/* نقطه چشمک زن در کنار وضعیت */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-xs md:text-sm font-bold text-rose-400 tracking-wider font-sans" dir="ltr">DENIED</span>
                </div>
              </div>

              {/* خط جداکننده نازک (فقط در دسکتاپ نمایش داده می‌شود) */}
              <div className="hidden sm:block w-[1px] h-6 md:h-8 bg-white/10 shrink-0"></div>

              {/* بخش دوم: کد امنیتی */}
              <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Icon name="shieldCheck" className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-400 font-sans whitespace-nowrap">کد امنیتی:</span>
                </div>
                {/* عدد ارور فارسی شده */}
                <span className="text-xs md:text-sm font-bold text-gray-200 tracking-wider font-sans drop-shadow-sm" dir="ltr">ERR_۴۰۳</span>
              </div>

            </div>
            
            {/* ================== دکمه‌های عملیاتی ================== */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full">
              
              <Link 
                href="/profile" 
                className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] border border-transparent transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer font-sans text-sm md:text-base"
              >
                <Icon name="userPlus" className="w-4 h-4 md:w-5 md:h-5" />
                ارتقاء سطح دسترسی
              </Link>
              
              <Link 
                href="/archive" 
                className="w-full sm:w-auto bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-gray-300 px-6 md:px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer font-sans text-sm md:text-base group"
              >
                <Icon name="files" className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
                بازگشت به آرشیو
              </Link>
              
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}