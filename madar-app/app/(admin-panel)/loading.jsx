export default function AdminLoading() {
  return (
    // استایل‌های ریسپانسیو و فول‌اسکرین متناسب با فضای خالی زیر هدر پنل ادمین
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center font-sans relative overflow-hidden p-4 select-none">

      {/* ۱. هاله‌های نوری پس‌زمینه (اتمسفریک تپنده برای برجسته کردن لودینگ) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-[#8b5cf6]/10 to-[#06b6d4]/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse pointer-events-none" />

      {/* ۲. کانتینر اصلی شناور (حذف کادر مربعی) */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-[scaleIn_0.3s_ease-out]">

        {/* ۳. انیمیشن مدارهای چرخان (The Madar Orbit) */}
        <div className="relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 mb-8">
          
          {/* مدار بیرونی (بنفش - چرخش در جهت عقربه‌ها) */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#8b5cf6] animate-[spin_3s_linear_infinite] opacity-80 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />

          {/* مدار میانی (فیروزه‌ای - چرخش برعکس و سریع‌تر) */}
          <div className="absolute inset-2.5 md:inset-3.5 rounded-full border-b-2 border-l-2 border-[#06b6d4] animate-[spin_2s_linear_infinite_reverse] opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />

          {/* مدار داخلی (زمردی - چرخش سریع) */}
          <div className="absolute inset-5 md:inset-7 rounded-full border-t-2 border-b-2 border-[#10b981] animate-[spin_1.5s_linear_infinite] opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />

          {/* هسته مرکزی (Core - ستاره تپنده) */}
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white shadow-[0_0_20px_4px_rgba(255,255,255,0.8)] animate-pulse" />
        </div>

        {/* ۴. تایپوگرافی و نقطه‌های متحرک */}
        <div className="flex flex-col items-center gap-3.5 mt-2">
          <h3 className="text-white font-bold text-xs md:text-sm tracking-widest drop-shadow-md">
            در حال پردازش
          </h3>
          
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

      </div>
    </div>
  );
}