'use client';

// کامپوننت داخلی برای باکس‌های آمار
const StatCard = ({ title, value, trend, isPositive }) => (
  <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-2xl relative overflow-hidden group hover:border-[#10b981]/50 transition-all duration-300">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#10b981]/10 transition-all"></div>
    
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-black text-white">{value}</span>
      <span className={`text-xs font-bold px-2 py-1 rounded-md mb-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      
      {/* تیتر صفحه */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">نمای کلی سیستم</h1>
      </div>

      {/* ردیف باکس‌های آماری (طراحی شده برای متصل شدن به دیتابیس در آینده) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="بازدیدهای امروز" value="۱,۲۸۴" trend="+۱۲٪" isPositive={true} />
        <StatCard title="کاربران ثبت‌نامی" value="۳۴۲" trend="+۵٪" isPositive={true} />
        <StatCard title="محتوای منتشر شده" value="۸۹" trend="ثابت" isPositive={true} />
        <StatCard title="نظرات بررسی نشده" value="۱۴" trend="-۲٪" isPositive={false} />
      </div>

      {/* بخش پایینی پیشخوان */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* باکس لاگ فعالیت‌ها (فضای خالی برای نمودار) */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-500">محل قرارگیری نمودار آمار (به زودی)</p>
        </div>

        {/* باکس دسترسی سریع */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">دسترسی سریع</h3>
          <ul className="space-y-3">
            <li>
              <button className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-colors text-sm text-gray-300">
                + افزودن محتوای جدید
              </button>
            </li>
            <li>
              <button className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-colors text-sm text-gray-300">
                بررسی دیدگاه‌های اخیر
              </button>
            </li>
            <li>
              <button className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-colors text-sm text-gray-300">
                ارسال اعلان جدید
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}