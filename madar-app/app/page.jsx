'use client';

import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import BlurImage from './components/BlurImage';

// === کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === اسکلتون صفحه اصلی (زمان بارگذاری اولیه) ===
const HomePageSkeleton = () => {
  return (
    <main className="pt-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-12 relative z-10 w-full animate-pulse">
      {/* اسکلتون هرو اسلایدر */}
      <section className="glass-card h-[500px] md:h-[450px] rounded-3xl p-8 flex items-center justify-between">
        <div className="space-y-4 flex-1">
          <BaseSkeleton className="w-28 h-6" rounded="rounded-full" />
          <BaseSkeleton className="w-3/4 h-12" rounded="rounded-xl" />
          <BaseSkeleton className="w-full h-20" rounded="rounded-xl" />
          <BaseSkeleton className="w-36 h-12" rounded="rounded-xl" />
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <BaseSkeleton className="w-72 h-72" rounded="rounded-full" />
        </div>
      </section>

      {/* اسکلتون کارت‌های آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center space-y-4 h-40">
            <BaseSkeleton className="w-14 h-14" rounded="rounded-2xl" />
            <BaseSkeleton className="w-28 h-5" rounded="rounded-md" />
            <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی لودینگ اولیه صفحه
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, []);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <main className="pt-36 md:pt-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16 relative z-10 w-full animate-[fadeIn_0.5s_ease-out]">
        
        {/* ================== Section 1: Hero Slider ================== */}
        <section className="glass-card relative overflow-hidden h-[520px] md:h-[450px] group border-t border-l border-white/10 rounded-3xl">
            <div className="absolute left-0 top-0 w-1/2 h-full bg-[#06b6d4]/10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>

            {/* Slide 1 */}
            <div className={`transition-opacity duration-700 absolute inset-0 flex flex-col-reverse md:flex-row h-full ${currentSlide === 0 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                <div className="flex-1 p-6 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-xs font-bold tracking-widest self-start">
                        پژوهش برگزیده
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg">
                        معماری پنهان<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">جهان نوین</span>
                    </h2>
                    <p className="rich-text text-gray-300 mb-8 max-w-lg text-sm md:text-base font-light text-justify">
                        چگونه <b>نمادهای مصر باستان</b> و علوم غریبه در طراحی پایتخت‌های مدرن و نهادهای مالی کدگذاری شدند؟ بررسی اسناد محرمانه و جریان‌های باطنی.
                    </p>
                    <a href="#" className="btn-glow bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-max shadow-lg hover:text-white transition-transform hover:-translate-x-1 cursor-pointer">
                        مشاهده مستند <Icon name="arrowLeft" className="w-5 h-5" />
                    </a>
                </div>
                <div className="flex-1 relative h-56 md:h-full flex items-center justify-center p-6">
                    <BlurImage src="/images/slider-1.png" alt="تصویر اسلایدر 1" className="max-h-full max-w-full object-contain animate-float drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] z-10" />
                </div>
            </div>

            {/* Slide 2 */}
            <div className={`transition-opacity duration-700 absolute inset-0 flex flex-col-reverse md:flex-row h-full ${currentSlide === 1 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                <div className="flex-1 p-6 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#d946ef]/10 border border-[#d946ef]/30 text-[#d946ef] text-xs font-bold tracking-widest self-start">
                        مستند ویژه
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg">
                        کاهنان<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#f59e0b]">عصر فضا</span>
                    </h2>
                    <p className="rich-text text-gray-300 mb-8 max-w-lg text-sm md:text-base font-light text-justify">
                        آیا پروژه‌های فضایی صرفاً دستاوردهای علمی بودند یا ریشه در <a href="#" className="underline text-[#d946ef]">آیین‌های باستانی</a> داشتند؟ افشای ارتباط میان پایه‌گذاران ناسا و انجمن‌های مخفی.
                    </p>
                    <a href="#" className="btn-glow bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-max shadow-lg hover:text-white transition-transform hover:-translate-x-1 cursor-pointer">
                        جزئیات بیشتر <Icon name="arrowLeft" className="w-5 h-5" />
                    </a>
                </div>
                <div className="flex-1 relative h-56 md:h-full flex items-center justify-center p-6">
                    <BlurImage src="/images/slider-2.png" alt="تصویر اسلایدر 2" className="max-h-full max-w-full object-contain animate-float drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] z-10" />
                </div>
            </div>

            {/* Slider Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                <button onClick={() => setCurrentSlide(0)} className={`h-1.5 rounded-full transition-all ${currentSlide === 0 ? 'bg-[#06b6d4] w-8 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/30 w-2 hover:bg-white/80'} cursor-pointer`}></button>
                <button onClick={() => setCurrentSlide(1)} className={`h-1.5 rounded-full transition-all ${currentSlide === 1 ? 'bg-[#06b6d4] w-8 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/30 w-2 hover:bg-white/80'} cursor-pointer`}></button>
            </div>
        </section>

        {/* ================== Section 2: Marquee Ticker ================== */}
        <section className="max-w-[100vw] overflow-hidden bg-white/5 border-y border-white/10 py-0 relative rounded-2xl backdrop-blur-sm -mx-4 sm:mx-0 flex items-stretch shadow-lg">
            <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center px-4 md:px-6 bg-[#080c16]/95 backdrop-blur-xl border-l border-white/10 shadow-[-15px_0_30px_rgba(0,0,0,0.8)]">
                <span className="text-gray-200 font-bold text-sm md:text-base flex items-center gap-3 whitespace-nowrap">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 shadow-[0_0_10px_#e11d48]"></span>
                    </span>
                    <span className="text-[#06b6d4]">جدیدترین‌های مدار:</span>
                </span>
            </div>

            <div className="ticker-gradient-right rounded-r-2xl z-20"></div>
            <div className="ticker-gradient-left rounded-l-2xl z-20"></div>
            
            <div className="ticker-wrapper flex items-center group py-3">
                <div className="flex animate-marquee group-hover:[animation-play-state:paused] pr-[220px]">
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#06b6d4] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]"></span> انتشار مستند جدید: کاهنان فضا
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#f59e0b] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></span> اضافه شدن ۵۰۰ سند خام انگلیسی
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#06b6d4] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]"></span> به‌روزرسانی ابزار تحلیل شبکه‌ای
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#3b82f6] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]"></span> فراخوان همکاری در بخش ترجمه
                    </a>
                    <span className="text-white/20">|</span>
                </div>
                
                <div className="flex animate-marquee group-hover:[animation-play-state:paused]" aria-hidden="true">
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#06b6d4] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]"></span> انتشار مستند جدید: کاهنان فضا
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#f59e0b] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></span> اضافه شدن ۵۰۰ سند خام انگلیسی
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#06b6d4] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]"></span> به‌روزرسانی ابزار تحلیل شبکه‌ای
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="#" className="flex items-center gap-2 mx-8 text-sm font-medium text-gray-300 hover:text-[#3b82f6] transition-colors whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]"></span> فراخوان همکاری در بخش ترجمه
                    </a>
                    <span className="text-white/20">|</span>
                </div>
            </div>
        </section>

        {/* ================== Section 3: Features Stats ================== */}
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 flex flex-col items-center text-center hover-lift group relative overflow-hidden rounded-2xl">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#f59e0b]/10 rounded-full blur-2xl group-hover:bg-[#f59e0b]/20 transition-colors pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f59e0b] mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <Icon name="database" className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">بزرگترین آرشیو</h3>
                    <p className="rich-text text-sm text-gray-400 font-light text-center">بیش از <span className="font-bold text-gray-200">۴ ترابایت</span> سند خام، تصویر و ویدیو طبقه‌بندی شده.</p>
                </div>

                <div className="glass-card p-6 flex flex-col items-center text-center hover-lift group relative overflow-hidden rounded-2xl">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#06b6d4]/10 rounded-full blur-2xl group-hover:bg-[#06b6d4]/20 transition-colors pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        <Icon name="users" className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">شبکه پژوهشگران</h3>
                    <p className="rich-text text-sm text-gray-400 font-light text-center">حضور بیش از <span className="font-bold text-gray-200">۱۰ هزار</span> محقق، دانشجو و مستندساز.</p>
                </div>

                <div className="glass-card p-6 flex flex-col items-center text-center hover-lift group relative overflow-hidden rounded-2xl">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#10b981]/10 rounded-full blur-2xl group-hover:bg-[#10b981]/20 transition-colors pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#10b981] mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Icon name="pen-nib" className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">ابزارهای تحلیلی</h3>
                    <p className="rich-text text-sm text-gray-400 font-light text-center">دسترسی به گراف ارتباطات، ترجمه هوشمند و <span className="font-bold text-gray-200">موتور جستجوی پیشرفته</span>.</p>
                </div>

                <div className="glass-card p-6 flex flex-col items-center text-center hover-lift group relative overflow-hidden rounded-2xl">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#f43f5e]/10 rounded-full blur-2xl group-hover:bg-[#f43f5e]/20 transition-colors pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f43f5e] mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        <Icon name="videoCamera" className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">محتوای تولیدی</h3>
                    <p className="rich-text text-sm text-gray-400 font-light text-center">تولید <span className="font-bold text-gray-200">مستندهای اختصاصی</span> و گزارش‌های تحلیلی دست اول.</p>
                </div>
            </div>
        </section>

        {/* ================== Section 4: Blog (Theme: #f59e0b) ================== */}
        <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">آخرین مطالب بلاگ</h2>
                    <p className="rich-text text-sm text-gray-400 font-light">مقالات، گزارش‌ها و یادداشت‌های تحلیلی مدار</p>
                </div>
                <a href="/blog" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                    مشاهده همه <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                
                <a href="#" className="glass-card hover-lift flex-none w-[280px] sm:w-[300px] p-4 group flex flex-col relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-[#f59e0b]/0 group-hover:bg-[#f59e0b]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="w-full h-40 rounded-xl bg-gray-900 mb-4 overflow-hidden relative flex items-center justify-center">
                        <BlurImage src="/images/blog-1.jpg" alt="کاور بلاگ" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f59e0b]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">تحلیل تاریخی</div>
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-20">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f59e0b] transition-colors">نقش انجمن سلطنتی در شکل‌گیری پارادایم علم مدرن</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۲.۴k بازدید</span>
                        </div>
                    </div>
                </a>
                
                <a href="#" className="glass-card hover-lift flex-none w-[280px] sm:w-[300px] p-4 group flex flex-col relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-[#f59e0b]/0 group-hover:bg-[#f59e0b]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="w-full h-40 rounded-xl bg-gray-900 mb-4 overflow-hidden relative flex items-center justify-center">
                        <BlurImage src="/images/blog-2.jpg" alt="کاور بلاگ" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f59e0b]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">نمادشناسی</div>
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-20">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f59e0b] transition-colors">بررسی هندسه پنهان در معماری پایتخت‌های غربی</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۱۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۳.۱k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift flex-none w-[280px] sm:w-[300px] p-4 group flex flex-col relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-[#f59e0b]/0 group-hover:bg-[#f59e0b]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="w-full h-40 rounded-xl bg-gray-900 mb-4 overflow-hidden relative flex items-center justify-center">
                        <BlurImage src="/images/blog-3.jpg" alt="کاور بلاگ" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f59e0b]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">گزارش</div>
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-20">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f59e0b] transition-colors">پشت پرده تأمین مالی شبکه‌های رسانه‌ای جدید</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۱۰</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۱.۸k بازدید</span>
                        </div>
                    </div>
                </a>
                
                <a href="#" className="glass-card hover-lift flex-none w-[280px] sm:w-[300px] p-4 group flex flex-col relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-[#f59e0b]/0 group-hover:bg-[#f59e0b]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="w-full h-40 rounded-xl bg-gray-900 mb-4 overflow-hidden relative flex items-center justify-center">
                        <BlurImage src="/images/blog-4.jpg" alt="کاور بلاگ" className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f59e0b]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">مقاله</div>
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-20">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f59e0b] transition-colors">ریشه‌های هرمسی در فیزیک و مکانیک کلاسیک</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۰۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۴.۵k بازدید</span>
                        </div>
                    </div>
                </a>
            </div>
        </section>

        {/* ================== Section 5: Raw Content (Theme: #fbbf24) ================== */}
        <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">محتوای راش و خام</h2>
                    <p className="rich-text text-sm text-gray-400 font-light">اسناد مکتوب، تصاویر، ویدیوها و فایل‌های صوتی طبقه‌بندی نشده</p>
                </div>
                <a href="/archive" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                    آرشیو کامل <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#fbbf24]/0 group-hover:bg-[#fbbf24]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/raw-1.jpg" alt="کاور سند" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۲.۴ مگابایت</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#fbbf24]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">سند PDF</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#fbbf24] transition-colors">اسناد افشا شده پروژه‌های فضایی دهه ۶۰ و ارتباطات باطنی</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۱۲</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۳.۲k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#fbbf24]/0 group-hover:bg-[#fbbf24]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/raw-2.jpg" alt="کاور ویدیو" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۱۴۵ مگابایت</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#fbbf24]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">راش ویدیویی MP4</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#fbbf24] transition-colors">ویدیوی خام سخنرانی محرمانه اعضای لژ در نیویورک</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۰۸</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۶.۵k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group hidden sm:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#fbbf24]/0 group-hover:bg-[#fbbf24]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/raw-3.jpg" alt="کاور متن" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۱۲۰ کیلوبایت</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#fbbf24]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">متن TXT</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#fbbf24] transition-colors">مجموعه تلگراف‌های رمزنگاری شده رد و بدل شده در جنگ سرد</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۰/۲۸</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۴.۱k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group hidden lg:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#fbbf24]/0 group-hover:bg-[#fbbf24]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/raw-4.jpg" alt="کاور صدا" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۳۵ مگابایت</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#fbbf24]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">فایل صوتی MP3</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#fbbf24] transition-colors">شنود صوتی مکالمات افشا شده اعضای فراماسونری لندن</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۰/۱۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۸.۹k بازدید</span>
                        </div>
                    </div>
                </a>
            </div>
        </section>

        {/* ================== Section 6: Produced Content (Theme: #f43f5e) ================== */}
        <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">محتوای تولیدی</h2>
                    <p className="rich-text text-sm text-gray-400 font-light">مستندهای اختصاصی، گزارش‌های ویدیویی و پادکست‌ها</p>
                </div>
                <a href="/produced" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                    آرشیو تولیدات <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#f43f5e]/0 group-hover:bg-[#f43f5e]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/prod-1.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۱:۲۴:۰۰</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f43f5e]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">مستند بلند</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f43f5e] transition-colors">سایه‌های معماری مدرن: واکاوی نمادها</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۱۲.۵k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#f43f5e]/0 group-hover:bg-[#f43f5e]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/prod-2.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۴۵:۱۵</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f43f5e]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">پادکست تصویری</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f43f5e] transition-colors">پادکست تصویری: راز انجمن‌ها (اپیزود ۴)</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۱۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۸.۲k بازدید</span>
                        </div>
                    </div>
                </a>
                
                <a href="#" className="glass-card hover-lift group hidden sm:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#f43f5e]/0 group-hover:bg-[#f43f5e]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/prod-3.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۱۸:۳۰</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f43f5e]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">گزارش ویدیویی</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f43f5e] transition-colors">تحلیل شبکه مالی رسانه‌های نوظهور</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۰۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۵.۰k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group hidden lg:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#f43f5e]/0 group-hover:bg-[#f43f5e]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/prod-4.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute bottom-3 left-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs px-2 py-1.5 rounded-lg z-20 shadow-lg">۱۰:۱۵</div>
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#f43f5e]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">گزارش کوتاه</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#f43f5e] transition-colors">تاریخچه مخفی نماد چشم جهان‌بین</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۰/۲۸</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۲۲.۰k بازدید</span>
                        </div>
                    </div>
                </a>
            </div>
        </section>

        {/* ================== Section 7: Tools (Theme: #10b981) ================== */}
        <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">ابزارهای کاربردی</h2>
                    <p className="rich-text text-sm text-gray-400 font-light">تسهیل در تولیدات با به کارگیری مجموعه ابزارهای کاربردی</p>
                </div>
                <a href="/tools" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                    آرشیو ابزارها <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#10b981]/0 group-hover:bg-[#10b981]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/tool-1.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#10b981]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">ابزار هوش مصنوعی</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#10b981] transition-colors">مترجم هوشمند متون کهن</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۱۲.۵k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#10b981]/0 group-hover:bg-[#10b981]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/tool-2.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#10b981]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">تحلیل داده</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#10b981] transition-colors">گاه‌شمار تطبیقی و شبکه‌ای</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۱۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۸.۲k بازدید</span>
                        </div>
                    </div>
                </a>
                
                <a href="#" className="glass-card hover-lift group hidden sm:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#10b981]/0 group-hover:bg-[#10b981]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/tool-3.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#10b981]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">ابزار هوش مصنوعی</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#10b981] transition-colors">تحلیل‌گر تصاویر و نمادها</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۱/۰۵</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۵.۰k بازدید</span>
                        </div>
                    </div>
                </a>

                <a href="#" className="glass-card hover-lift group hidden lg:flex flex-col overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-[#10b981]/0 group-hover:bg-[#10b981]/5 transition-colors duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                        <BlurImage src="/images/tool-4.jpg" alt="کاور" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div className="absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md border border-[#10b981]/40 text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg">تحلیل داده</div>
                    </div>
                    <div className="p-5 relative z-20 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-4 line-clamp-2 leading-relaxed group-hover:text-[#10b981] transition-colors">تحلیل‌گر فرکانس کلمات در اسناد</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-3 w-full">
                            <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> ۱۴۰۲/۱۰/۲۸</span>
                            <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> ۲۲.۰k بازدید</span>
                        </div>
                    </div>
                </a>
            </div>
        </section>

    </main>
  );
}