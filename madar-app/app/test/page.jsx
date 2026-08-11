'use client';
import React from 'react';
import Tooltip from '../components/Tooltip';
import Icon from '../components/Icon'; 
import BlurImage from '../components/BlurImage'; 

export default function TestTooltipPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center py-20">
      
      {/* پس‌زمینه نئونی شناور برای جذابیت بصری */}
      <div className="fixed inset-0 z-[-1] bg-[#080c16] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20 bg-[radial-gradient(circle,rgba(6,182,212,0.3)_0%,transparent_70%)] animate-[drift_30s_infinite_linear_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-15 bg-[radial-gradient(circle,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-[drift_40s_infinite_linear_alternate-reverse]" />
      </div>

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* هدر صفحه تستی */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 tracking-widest shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            آزمایشگاه رابط کاربری مدار
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            تست‌روم <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-blue-500">تول‌تیپ‌های هوشمند</span>
          </h1>
          <p className="text-gray-400 font-light max-w-2xl mx-auto">
            موس خود را روی عناصر زیر حرکت دهید تا عملکرد انیمیشن‌ها، تاخیر زمانی و موقعیت‌یابی هوشمند کامپوننت Tooltip را در سناریوهای واقعی مشاهده کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* سناریو ۱: جهت‌های مختلف */}
          <div className="glass-card p-8 rounded-3xl border-t-2 border-t-[#06b6d4]">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">۱. جهت‌های چهارگانه (Positions)</h3>
            <div className="flex flex-wrap items-center justify-center gap-6 py-10">
              
              <Tooltip content="من در بالا ظاهر می‌شوم!" position="top">
                <button className="bg-white/5 border border-white/10 hover:border-[#06b6d4] text-white px-6 py-3 rounded-xl transition-all font-bold">
                  بالا (Top)
                </button>
              </Tooltip>

              <Tooltip content="من در پایین ظاهر می‌شوم!" position="bottom">
                <button className="bg-white/5 border border-white/10 hover:border-[#06b6d4] text-white px-6 py-3 rounded-xl transition-all font-bold">
                  پایین (Bottom)
                </button>
              </Tooltip>

              <Tooltip content="من در سمت راست ظاهر می‌شوم!" position="right">
                <button className="bg-white/5 border border-white/10 hover:border-[#06b6d4] text-white px-6 py-3 rounded-xl transition-all font-bold">
                  راست (Right)
                </button>
              </Tooltip>

              <Tooltip content="من در سمت چپ ظاهر می‌شوم!" position="left">
                <button className="bg-white/5 border border-white/10 hover:border-[#06b6d4] text-white px-6 py-3 rounded-xl transition-all font-bold">
                  چپ (Left)
                </button>
              </Tooltip>

            </div>
          </div>

          {/* سناریو ۲: نوار ابزار و آیکون‌ها */}
          <div className="glass-card p-8 rounded-3xl border-t-2 border-t-rose-500">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">۲. نوار ابزار فشرده (Action Bar)</h3>
            <div className="flex items-center justify-center h-full pb-8">
              <div className="flex items-center gap-3 bg-black/50 p-3 rounded-2xl border border-white/10">
                
                <Tooltip content="پسندیدن سند" position="top">
                  <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors">
                    <Icon name="heart" className="w-6 h-6" />
                  </button>
                </Tooltip>

                <Tooltip content="دانلود نسخه PDF (۱۲ مگابایت)" position="top">
                  <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-[#06b6d4]/20 text-gray-400 hover:text-[#06b6d4] flex items-center justify-center transition-colors">
                    <Icon name="downloadSimple" className="w-6 h-6" />
                  </button>
                </Tooltip>

                <Tooltip content="کپی لینک اشتراک‌گذاری" position="top">
                  <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-500 flex items-center justify-center transition-colors">
                    <Icon name="shareNetwork" className="w-6 h-6" />
                  </button>
                </Tooltip>

                <div className="w-px h-8 bg-white/10 mx-1"></div>

                <Tooltip content="گزارش خرابی فایل" position="top">
                  <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors">
                    <Icon name="info" className="w-6 h-6" />
                  </button>
                </Tooltip>

              </div>
            </div>
          </div>

          {/* سناریو ۳: متن‌ها و اصطلاحات */}
          <div className="glass-card p-8 rounded-3xl border-t-2 border-t-[#fbbf24]">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">۳. دیکشنری درون‌متنی (Inline Definitions)</h3>
            <p className="text-gray-300 leading-loose text-justify text-lg font-light">
              در بررسی اسناد طبقه‌بندی شده، به نام 
              <Tooltip 
                content="گروهی مخفی متشکل از نخبگان سیاسی و اقتصادی جهان که سالانه گردهم می‌آیند." 
                position="top"
              >
                <span className="text-[#fbbf24] font-bold border-b border-dashed border-[#fbbf24]/50 mx-1 cursor-help hover:bg-[#fbbf24]/10 px-1 rounded transition-colors">
                  گروه بیلدربرگ
                </span>
              </Tooltip>
              برمی‌خوریم. آن‌ها برای تبادل اطلاعات از سیستم‌های 
              <Tooltip 
                content={
                  <div className="text-right">
                    <strong>OSINT</strong><br/>
                    <span className="text-gray-400 text-[10px]">جستجو در منابع اطلاعاتی آزاد و عمومی</span>
                  </div>
                } 
                position="bottom"
              >
                <span className="text-white font-bold border-b-2 border-white/30 mx-1 cursor-help px-1">
                  اوسینت
                </span>
              </Tooltip>
              استفاده می‌کردند که ردیابی آن‌ها را بسیار دشوار می‌کرد.
            </p>
          </div>

          {/* سناریو ۴: آمار، وضعیت و فرم‌ها */}
          <div className="glass-card p-8 rounded-3xl border-t-2 border-t-emerald-500">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">۴. کاربردهای اداری و داینامیک</h3>
            
            <div className="space-y-6">
              {/* وضعیت */}
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">وضعیت سند:</span>
                <Tooltip content="این سند در حال حاضر توسط تیم سردبیری مدار در حال بررسی صحت (Fact-check) است." position="right">
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full cursor-help">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-500 text-xs font-bold">در حال بررسی</span>
                  </div>
                </Tooltip>
              </div>

              {/* تاریخ نسبی */}
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-400">آخرین ویرایش:</span>
                <Tooltip content="۱۴۰۲/۱۱/۲۴ - ساعت ۱۴:۳۵:۱۲" position="top">
                  <span className="text-white text-sm font-bold border-b border-dashed border-gray-600 cursor-help">۲ ساعت پیش</span>
                </Tooltip>
              </div>

              {/* راهنمای فرم */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  کد ملی / شناسه پژوهشگر
                  <Tooltip content="این اطلاعات صرفاً جهت تایید هویت نویسندگان مدار دریافت می‌شود و کاملاً محرمانه خواهد ماند." position="left">
                    <button className="text-gray-500 hover:text-emerald-500 transition-colors">
                      <Icon name="info" className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </label>
                <input type="text" disabled placeholder="موس را روی آیکون بالا ببرید" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-400 cursor-not-allowed" />
              </div>
            </div>

          </div>

          {/* سناریو ۵: تول‌تیپ غنی (کارت پروفایل مینی) */}
          <div className="md:col-span-2 glass-card p-8 rounded-3xl border-t-2 border-t-purple-500 flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 w-full text-center">۵. تول‌تیپ حاوی کدهای پیچیده (Mini-Profile)</h3>
            <p className="text-gray-400 mb-8 font-light text-center">تول‌تیپ‌ها فقط برای متن ساده نیستند؛ شما می‌توانید کدهای HTML و طراحی‌های پیچیده را درون آن‌ها رندر کنید!</p>
            
            <Tooltip 
              position="top"
              className="p-0 bg-transparent border-none shadow-none" // حذف استایل پیش‌فرض برای کاستوم کردن کامل
              content={
                <div className="bg-[#080c16]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 rounded-2xl w-64 text-right flex flex-col gap-3">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0">
                      <BlurImage src="/images/creator-1.jpg" alt="پژوهشگر" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-1">دکتر احمدی <Icon name="checkCircle" className="w-3 h-3 text-purple-500 fill-current" /></h4>
                      <p className="text-[10px] text-purple-400 font-bold">پژوهشگر ارشد مدار</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">متخصص در ریشه‌یابی جریان‌های باطنی و بررسی نسخه‌های خطی قرون وسطی.</p>
                  <div className="flex justify-between text-[10px] font-sans text-gray-500 pt-2 border-t border-white/5">
                    <span>۱۴۲ سند</span>
                    <span>۱۵k بازدید</span>
                  </div>
                </div>
              }
            >
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500 shrink-0">
                  <BlurImage src="/images/creator-1.jpg" alt="پژوهشگر" className="w-full h-full object-cover" />
                </div>
                <span className="text-white font-bold text-sm">نوشته شده توسط دکتر احمدی</span>
              </div>
            </Tooltip>
          </div>

        </div>
      </div>
    </div>
  );
}