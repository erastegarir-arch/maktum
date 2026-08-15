'use client';

import { motion } from 'framer-motion';
import Icon from '@/app/components/Icon'; // مسیر مطلق بدون ارور

// === کامپوننت داخلی کارت‌های آماری بر اساس گرافیک کلی1 ===
const StatCard = ({ title, value, trend, isPositive, iconName = "chart", accentColor = "#10b981", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="relative rounded-2xl border border-white/10 p-6 shadow-xl overflow-hidden group cursor-pointer"
  >
    {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله و ثابت طبق گرافیک کلی1 */}
    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />

    {/* ۲. هاله هوور مجزا بدون درگیر کردن بلور پس‌زمینه */}
    <div 
      className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
      style={{
        boxShadow: `inset 0 0 25px ${accentColor}1a, 0 10px 30px -10px ${accentColor}25`
      }}
    />

    {/* ۳. نوار نوری گرادینت بالای کارت (Top Gradient Highlight Bar) */}
    <div 
      className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100 pointer-events-none"
      style={{ 
        background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)` 
      }}
    />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-gray-400 text-sm font-medium font-sans">{title}</h3>
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner"
        style={{ 
          color: accentColor, 
          backgroundColor: `${accentColor}15`, 
          border: `1px solid ${accentColor}30` 
        }}
      >
        <Icon name={iconName} className="w-5 h-5" />
      </div>
    </div>

    <div className="flex items-end justify-between gap-3 relative z-10">
      <span className="text-3xl font-black text-white font-sans tracking-tight">{value}</span>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 font-sans ${
        isPositive 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}>
        {trend}
      </span>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8 select-none font-sans p-6 md:p-8">
      
      {/* تیتر صفحه پیشخوان */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          نمای کلی سیستم
        </h1>
      </motion.div>

      {/* ردیف باکس‌های آماری ۴ گانه */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="بازدیدهای امروز" 
          value="۱,۲۸۴" 
          trend="+۱۲٪" 
          isPositive={true} 
          iconName="chart"
          accentColor="#10b981"
          delay={0.05}
        />
        <StatCard 
          title="کاربران ثبت‌نامی" 
          value="۳۴۲" 
          trend="+۵٪" 
          isPositive={true} 
          iconName="users"
          accentColor="#06b6d4"
          delay={0.1}
        />
        <StatCard 
          title="محتوای منتشر شده" 
          value="۸۹" 
          trend="ثابت" 
          isPositive={true} 
          iconName="browser"
          accentColor="#a855f7"
          delay={0.15}
        />
        <StatCard 
          title="نظرات بررسی نشده" 
          value="۱۴" 
          trend="-۲٪" 
          isPositive={false} 
          iconName="comment"
          accentColor="#f43f5e"
          delay={0.2}
        />
      </div>

      {/* بخش پایینی پیشخوان */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* باکس لاگ فعالیت‌ها / نمودار آمار */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 relative rounded-3xl border border-white/10 p-6 min-h-[320px] flex flex-col items-center justify-center shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-[#06b6d4]/40 transition-colors duration-300">
            <Icon name="chart" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>

          <p className="text-gray-400 font-medium text-sm font-sans">محل قرارگیری نمودار آمار (به زودی)</p>
          <span className="text-xs text-gray-500 font-light mt-1 dir-rtl font-sans">ارزیابی دقیق ترافیک و رفتار کاربران</span>
        </motion.div>

        {/* باکس دسترسی سریع */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3 flex items-center gap-2 relative z-10 font-sans">
            <Icon name="star" className="w-5 h-5 text-[#10b981]" />
            دسترسی سریع
          </h3>

          <ul className="space-y-3 relative z-10">
            <li>
              <button className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#10b981]/30 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-all text-sm text-gray-300 font-medium group/btn cursor-pointer font-sans">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#10b981] group-hover/btn:scale-110 transition-transform">
                  <Icon name="plus" className="w-4 h-4" />
                </div>
                <span>+ افزودن محتوای جدید</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#10b981]/30 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-all text-sm text-gray-300 font-medium group/btn cursor-pointer font-sans">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#10b981] group-hover/btn:scale-110 transition-transform">
                  <Icon name="comment" className="w-4 h-4" />
                </div>
                <span>بررسی دیدگاه‌های اخیر</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#10b981]/30 hover:bg-[#10b981]/10 hover:text-[#10b981] transition-all text-sm text-gray-300 font-medium group/btn cursor-pointer font-sans">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#10b981] group-hover/btn:scale-110 transition-transform">
                  <Icon name="bell" className="w-4 h-4" />
                </div>
                <span>ارسال اعلان جدید</span>
              </button>
            </li>
          </ul>
        </motion.div>

      </div>
    </div>
  );
}