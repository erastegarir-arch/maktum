'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from './components/Icon';
import BlurImage from './components/BlurImage';

// === پایگاه داده فرضی صفحه اصلی (شامل بخش‌های جدید) ===
const pageContent = {
  // پرونده‌های ویژه (بخش جدید ۱)
  dossiers: [
    { id: 1, title: 'پروژه استارگیت', subtitle: 'پرونده فوق‌سری • سیا', items: 12, color: '#f43f5e', glow: 'rgba(244,63,94,0.15)' },
    { id: 2, title: 'انجمن‌های مخفی لندن', subtitle: 'تحلیل شبکه‌ای • قرن ۱۸', items: 8, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
    { id: 3, title: 'کیمیاگران دربار', subtitle: 'اسناد تاریخی • اروپا', items: 24, color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  ],
  // رادار موضوعی (بخش جدید ۲)
  topics: [
    { name: '#جنگ_سرد', size: 'text-2xl', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', delay: '0s' },
    { name: '#الگوریتم_هوش_مصنوعی', size: 'text-sm', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', delay: '1s' },
    { name: '#معماری_پنهان', size: 'text-3xl', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', delay: '0.5s' },
    { name: '#فراماسونری', size: 'text-xl', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', delay: '1.5s' },
    { name: '#شبکه_مالی', size: 'text-base', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-b border-white/5lue-400/20', delay: '0.2s' },
    { name: '#نمادشناسی', size: 'text-lg', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20', delay: '0.8s' },
    { name: '#عملیات_روانی', size: 'text-2xl', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', delay: '1.2s' },
  ],
  // پژوهشگران شاخص (بخش جدید ۳)
  investigators: [
    { id: 1, name: 'دکتر آریا مهر', role: 'پژوهشگر نمادشناسی', docs: 45, image: '/images/avatar-1.jpg' },
    { id: 2, name: 'استاد کیهانی', role: 'تحلیل‌گر شبکه‌های مالی', docs: 32, image: '/images/avatar-2.jpg' },
    { id: 3, name: 'س. الف. راد', role: 'متخصص اسناد محرمانه', docs: 18, image: '/images/avatar-3.jpg' },
    { id: 4, name: 'مهندس پرتو', role: 'توسعه‌دهنده گراف داده', docs: 9, image: '/images/avatar-4.jpg' },
  ]
};

// === کامپوننت پایه اسکلتون ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === اسکلتون صفحه اصلی ===
const HomePageSkeleton = () => {
  return (
    <main className="pt-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-12 relative z-10 w-full">
      <section className="h-[500px] md:h-[450px] p-8 flex items-center justify-between">
        <div className="space-y-4 flex-1">
          <BaseSkeleton className="w-28 h-6" rounded="rounded-full" />
          <BaseSkeleton className="w-3/4 h-12" rounded="rounded-xl" />
          <BaseSkeleton className="w-full h-20" rounded="rounded-xl" />
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <BaseSkeleton className="w-72 h-72" rounded="rounded-full" />
        </div>
      </section>
    </main>
  );
};

// === کامپوننت هوشمند کارت با افکت Spotlight ===
const SpotlightCard = ({ children, themeGlow, borderGlow, link = "#" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <a 
      href={link} 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className="relative flex flex-col p-4 sm:p-5 rounded-2xl group overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full shadow-lg"
    >
      <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
      <div className={`absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 bg-gradient-to-r from-transparent ${borderGlow} to-transparent`} />
      <div 
        className="absolute inset-0 pointer-events-none rounded-inherit z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${themeGlow}, transparent 40%)` }}
      />
      {children}
    </a>
  );
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی لودینگ
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // تایمر اسلایدر هیرو
  useEffect(() => {
    if (isLoading) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [isLoading]);

  if (isLoading) return <HomePageSkeleton />;

  return (
    <main className="pt-20 md:pt-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20 relative z-10 w-full animate-[fadeIn_0.8s_ease-out] font-sans text-right select-none">
        
        {/* ================== بک‌گراند نوری کل صفحه ================== */}
        <div className="fixed inset-0 z-[-1] bg-[#050810] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-20 bg-[radial-gradient(circle,rgba(6,182,212,0.4)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-15 bg-[radial-gradient(circle,rgba(244,63,94,0.3)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
        </div>

        {/* ================== Section 1: Hero Slider (بدون کادر و کاملاً شناور) ================== */}
        <section className="relative overflow-hidden h-[550px] md:h-[500px] group">
            
            {/* Slide 1 */}
            <div className={`transition-all duration-1000 ease-in-out absolute inset-0 flex flex-col-reverse md:flex-row h-full ${currentSlide === 0 ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'}`}>
                <div className="flex-1 p-4 md:p-10 flex flex-col justify-center relative z-20">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-xs font-bold tracking-widest self-start backdrop-blur-md">
                        {/* نقطه چشمک زن درخشان */}
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-100"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06b6d4] shadow-[0_0_15px_#06b6d4]"></span>
                        </span>
                        پژوهش برگزیده
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-600 drop-shadow-2xl">
                        معماری پنهان<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">جهان نوین</span>
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-lg text-sm md:text-base font-light text-justify leading-loose">
                        چگونه نمادهای مصر باستان و علوم غریبه در طراحی پایتخت‌های مدرن و نهادهای مالی کدگذاری شدند؟ بررسی اسناد محرمانه و جریان‌های باطنی.
                    </p>
                    {/* دکمه اختصاصی مینیمال و متحرک بدون آیکون */}
                    <a href="#" className="text-[#06b6d4] font-black text-lg border-b border-white/5-[3px] border-[#06b6d4] pb-1 hover:scale-110 hover:text-cyan-300 transition-all duration-300 inline-block w-max shadow-[0_10px_20px_-10px_rgba(6,182,212,0.5)]">
                        مشاهده مستند
                    </a>
                </div>
                <div className="flex-1 relative h-64 md:h-full flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#06b6d4]/10 blur-[80px] rounded-full"></div>
                    <BlurImage src="/images/slider-1.png" alt="تصویر اسلایدر 1" className="relative z-10 max-h-full max-w-full object-contain animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_30px_40px_rgba(0,0,0,0.9)]" />
                </div>
            </div>

            {/* Slide 2 */}
            <div className={`transition-all duration-1000 ease-in-out absolute inset-0 flex flex-col-reverse md:flex-row h-full ${currentSlide === 1 ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'}`}>
                <div className="flex-1 p-4 md:p-10 flex flex-col justify-center relative z-20">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full bg-[#d946ef]/10 border border-[#d946ef]/30 text-[#d946ef] text-xs font-bold tracking-widest self-start backdrop-blur-md">
                        {/* نقطه چشمک زن درخشان */}
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d946ef] opacity-100"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d946ef] shadow-[0_0_15px_#d946ef]"></span>
                        </span>
                        مستند ویژه
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-600 drop-shadow-2xl">
                        کاهنان<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-[#f59e0b] drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]">عصر فضا</span>
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-lg text-sm md:text-base font-light text-justify leading-loose">
                        آیا پروژه‌های فضایی صرفاً دستاوردهای علمی بودند یا ریشه در آیین‌های باستانی داشتند؟ افشای ارتباط میان پایه‌گذاران ناسا و انجمن‌های مخفی.
                    </p>
                    {/* دکمه اختصاصی مینیمال و متحرک بدون آیکون */}
                    <a href="#" className="text-[#d946ef] font-black text-lg border-b border-white/5-[3px] border-[#d946ef] pb-1 hover:scale-110 hover:text-fuchsia-300 transition-all duration-300 inline-block w-max shadow-[0_10px_20px_-10px_rgba(217,70,239,0.5)]">
                        جزئیات بیشتر
                    </a>
                </div>
                <div className="flex-1 relative h-64 md:h-full flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#d946ef]/10 blur-[80px] rounded-full"></div>
                    <BlurImage src="/images/slider-2.png" alt="تصویر اسلایدر 2" className="relative z-10 max-h-full max-w-full object-contain animate-[float_6s_ease-in-out_infinite_reverse] drop-shadow-[0_30px_40px_rgba(0,0,0,0.9)]" />
                </div>
            </div>

            {/* Slider Navigation Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                <button onClick={() => setCurrentSlide(0)} className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${currentSlide === 0 ? 'bg-white w-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/30 w-3 hover:bg-white/60'}`} aria-label="Slide 1"></button>
                <button onClick={() => setCurrentSlide(1)} className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${currentSlide === 1 ? 'bg-white w-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/30 w-3 hover:bg-white/60'}`} aria-label="Slide 2"></button>
            </div>
        </section>

        {/* ================== Section 2: Cyber Marquee Ticker (اصلاح بک‌گراند تیره) ================== */}
        <section className="relative overflow-hidden bg-[#080c16]/50 py-1.5 rounded-2xl backdrop-blur-xl flex items-stretch shadow-[0_10px_30px_rgba(0,0,0,0.5)] -mx-4 sm:mx-0">
            {/* لایه محافظ تیره و سالید برای رفتن متن به زیر آن */}
            <div className="absolute right-0 top-0 bottom-0 z-40 flex items-center px-5 bg-[#0a0d14] border-r-2 border-[#06b6d4] shadow-[-20px_0_30px_#0a0d14]">
                <span className="text-white font-bold text-sm flex items-center gap-2 whitespace-nowrap drop-shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                    تازه‌های مدار
                </span>
            </div>
            
            <div className="flex items-center group py-3 w-full pl-4">
                {/* مسیر حرکت متن‌ها (شروع انیمیشن از زیر لایه تیره) */}
                <div className="flex animate-marquee group-hover:[animation-play-state:paused] pr-[160px]">
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#d946ef] font-bold">انتشار مستند:</span> کاهنان فضا
                    </a>
                    <span className="text-white/10">|</span>
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#f59e0b] font-bold">بایگانی خام:</span> ۵۰۰ سند انگلیسی افزوده شد
                    </a>
                    <span className="text-white/10">|</span>
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#06b6d4] font-bold">آزمایشگاه داده:</span> آپدیت ابزار گراف شبکه‌ای
                    </a>
                    <span className="text-white/10">|</span>
                </div>
                <div className="flex animate-marquee group-hover:[animation-play-state:paused]" aria-hidden="true">
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#d946ef] font-bold">انتشار مستند:</span> کاهنان فضا
                    </a>
                    <span className="text-white/10">|</span>
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#f59e0b] font-bold">بایگانی خام:</span> ۵۰۰ سند انگلیسی افزوده شد
                    </a>
                    <span className="text-white/10">|</span>
                    <a href="#" className="flex items-center gap-2 mx-10 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                        <span className="text-[#06b6d4] font-bold">آزمایشگاه داده:</span> آپدیت ابزار گراف شبکه‌ای
                    </a>
                    <span className="text-white/10">|</span>
                </div>
            </div>
        </section>

        {/* ================== Section 3: Holographic Features Stats ================== */}
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: 'database', title: 'بزرگترین آرشیو', desc: '۴ ترابایت سند محرمانه', color: '#f59e0b' },
                  { icon: 'users', title: 'شبکه پژوهشگران', desc: '۱۰ هزار محقق فعال', color: '#06b6d4' },
                  { icon: 'pen-nib', title: 'ابزارهای تحلیلی', desc: 'گراف و موتور جستجو', color: '#10b981' },
                  { icon: 'videoCamera', title: 'محتوای تولیدی', desc: 'مستندهای اختصاصی', color: '#f43f5e' }
                ].map((stat, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden group p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 bg-[#0b0f19]/60 backdrop-blur-lg hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${stat.color}, transparent)` }}></div>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10" style={{ color: stat.color, boxShadow: `0 0 20px ${stat.color}20` }}>
                          <Icon name={stat.icon} className="w-8 h-8 drop-shadow-md" />
                      </div>
                      <h3 className="font-bold text-white mb-2 text-lg">{stat.title}</h3>
                      <p className="text-sm text-gray-400 font-light">{stat.desc}</p>
                  </div>
                ))}
            </div>
        </section>

        {/* ================== بخش جدید ۱: پرونده‌های ویژه و چندوجهی (Investigation Dossiers) ================== */}
        <section className="space-y-8 relative pt-6">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <Icon name="folderOpen" className="w-8 h-8 text-indigo-400" /> پرونده‌های باز
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-11">مجموعه اسناد، مقالات و ویدیوهای مرتبط با یک کلان‌موضوع</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pageContent.dossiers.map((dossier, i) => (
                    <a key={i} href="#" className="relative p-6 rounded-2xl bg-[#0b0f19]/80 backdrop-blur-xl group overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-lg">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${dossier.glow}, transparent 60%)` }}></div>
                        <div className="absolute -left-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                           <Icon name="folder" className="w-40 h-40" />
                        </div>
                        
                        <div className="relative z-10 flex justify-between items-start mb-12">
                            <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-white/5 text-gray-300">
                                {dossier.items} آیتم مرتبط
                            </span>
                            <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: dossier.color, boxShadow: `0 0 10px ${dossier.color}` }}></span>
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white transition-colors">{dossier.title}</h3>
                            <p className="text-sm font-light" style={{ color: dossier.color }}>{dossier.subtitle}</p>
                        </div>
                    </a>
                ))}
            </div>
        </section>

        {/* ================== Section 4: Blog (Amber Theme) ================== */}
        <section className="space-y-8 relative">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <span className="w-2 h-8 rounded-full bg-[#f59e0b] shadow-[0_0_15px_#f59e0b]"></span> آخرین مطالب بلاگ
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-5">مقالات، گزارش‌ها و یادداشت‌های تحلیلی</p>
                </div>
                <a href="/blog" className="text-sm font-bold text-gray-400 hover:text-[#f59e0b] transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg hover:bg-white/5">
                    مشاهده همه <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { img: '/images/blog-1.jpg', title: 'نقش انجمن سلطنتی در شکل‌گیری علم مدرن', views: '۲.۴k' },
                  { img: '/images/blog-2.jpg', title: 'بررسی هندسه پنهان در معماری پایتخت‌ها', views: '۳.۱k' },
                  { img: '/images/blog-3.jpg', title: 'پشت پرده تأمین مالی شبکه‌های رسانه‌ای', views: '۱.۸k' },
                  { img: '/images/blog-4.jpg', title: 'ریشه‌های هرمسی در فیزیک و مکانیک کلاسیک', views: '۴.۵k' }
                ].map((item, i) => (
                  <SpotlightCard key={i} themeGlow="rgba(245,158,11,0.08)" borderGlow="via-[#f59e0b]">
                    <div className="w-full h-44 rounded-xl overflow-hidden relative flex items-center justify-center mb-5 bg-[#080c16]">
                        <BlurImage src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-10">
                        <span className="text-[#f59e0b] text-[10px] font-black tracking-wider mb-2 uppercase">{item.cat}</span>
                        <h3 className="font-bold text-white text-sm mb-4 line-clamp-2 leading-loose group-hover:text-[#f59e0b] transition-colors">{item.title}</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-4">
                            <span className="flex items-center gap-1.5"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1.5"><Icon name="eye" className="w-3.5 h-3.5" /> {item.views}</span>
                        </div>
                    </div>
                  </SpotlightCard>
                ))}
            </div>
        </section>

        {/* ================== Section 5: Raw Content (Yellow Theme) ================== */}
        <section className="space-y-8 relative">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <span className="w-2 h-8 rounded-full bg-[#fbbf24] shadow-[0_0_15px_#fbbf24]"></span> محتوای راش و خام
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-5">اسناد مکتوب، تصاویر، ویدیوها و فایل‌های صوتی طبقه‌بندی نشده</p>
                </div>
                <a href="/raw-materials" className="text-sm font-bold text-gray-400 hover:text-[#fbbf24] transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg hover:bg-white/5">
                    آرشیو کامل <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { img: '/images/raw-1.jpg', title: 'اسناد افشا شده پروژه‌های فضایی دهه ۶۰', views: '۳.۲k' },
                  { img: '/images/raw-2.jpg', title: 'ویدیوی خام سخنرانی محرمانه در نیویورک', views: '۶.۵k' },
                  { img: '/images/raw-3.jpg', title: 'تلگراف‌های رمزنگاری شده جنگ سرد', views: '۴.۱k' },
                  { img: '/images/raw-4.jpg', title: 'شنود مکالمات افشا شده اعضای فراماسونری', views: '۸.۹k' }
                ].map((item, i) => (
                  <SpotlightCard key={i} themeGlow="rgba(251,191,36,0.08)" borderGlow="via-[#fbbf24]">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden flex items-center justify-center mb-5 bg-[#080c16]">
                        <BlurImage src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-10">
                        <span className="text-[#fbbf24] text-[10px] font-black tracking-wider mb-2 uppercase">{item.cat}</span>
                        <h3 className="font-bold text-white text-sm mb-4 line-clamp-2 leading-loose group-hover:text-[#fbbf24] transition-colors">{item.title}</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-4">
                            <span className="flex items-center gap-1.5"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> ۱۴۰۲/۱۱/۱۲</span>
                            <span className="flex items-center gap-1.5"><Icon name="eye" className="w-3.5 h-3.5" /> {item.views}</span>
                        </div>
                    </div>
                  </SpotlightCard>
                ))}
            </div>
        </section>

        {/* ================== بخش جدید ۲: رادار موضوعی و ابر تگ‌ها ================== */}
        <section className="relative p-8 md:p-12 rounded-3xl bg-[#0b0f19]/60 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/grid.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
               <div className="w-full md:w-1/3 space-y-4">
                  <h2 className="text-3xl font-black text-white">رادار موضوعی</h2>
                  <p className="text-gray-400 font-light text-sm leading-loose">داغ‌ترین موضوعات و هشتگ‌های در حال پیگیری توسط موتورهای جستجوگر و پژوهشگران مدار.</p>
               </div>
               
               <div className="w-full md:w-2/3 flex flex-wrap gap-4 justify-center md:justify-end items-center">
                  {pageContent.topics.map((topic, i) => (
                      <a key={i} href="#" className={`px-4 py-2 rounded-full border ${topic.border} ${topic.bg} ${topic.color} ${topic.size} font-bold hover:scale-110 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md animate-[float_4s_ease-in-out_infinite] shadow-lg`} style={{ animationDelay: topic.delay }}>
                          {topic.name}
                      </a>
                  ))}
               </div>
            </div>
        </section>

        {/* ================== Section 6: Produced Content (Rose Theme) ================== */}
        <section className="space-y-8 relative">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <span className="w-2 h-8 rounded-full bg-[#f43f5e] shadow-[0_0_15px_#f43f5e]"></span> محتوای تولیدی
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-5">مستندهای اختصاصی، گزارش‌های ویدیویی و پادکست‌ها</p>
                </div>
                <a href="/produced" className="text-sm font-bold text-gray-400 hover:text-[#f43f5e] transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg hover:bg-white/5">
                    آرشیو تولیدات <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { img: '/images/prod-1.jpg', title: 'سایه‌های معماری مدرن: واکاوی نمادها', views: '۱۲.۵k' },
                  { img: '/images/prod-2.jpg', title: 'پادکست تصویری: راز انجمن‌ها (اپیزود ۴)', views: '۸.۲k' },
                  { img: '/images/prod-3.jpg', title: 'تحلیل شبکه مالی رسانه‌های نوظهور', views: '۵.۰k' },
                  { img: '/images/prod-4.jpg', title: 'تاریخچه مخفی نماد چشم جهان‌بین', views: '۲۲.۰k' }
                ].map((item, i) => (
                  <SpotlightCard key={i} themeGlow="rgba(244,63,94,0.08)" borderGlow="via-[#f43f5e]">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden flex items-center justify-center mb-5 bg-[#080c16]">
                        <BlurImage src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-10">
                        <span className="text-[#f43f5e] text-[10px] font-black tracking-wider mb-2 uppercase">{item.cat}</span>
                        <h3 className="font-bold text-white text-sm mb-4 line-clamp-2 leading-loose group-hover:text-[#f43f5e] transition-colors">{item.title}</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-4">
                            <span className="flex items-center gap-1.5"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1.5"><Icon name="eye" className="w-3.5 h-3.5" /> {item.views}</span>
                        </div>
                    </div>
                  </SpotlightCard>
                ))}
            </div>
        </section>

        {/* ================== بخش جدید ۳: تالار پژوهشگران و پدیدآورندگان شاخص ================== */}
        <section className="space-y-8 relative pt-6">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <Icon name="users" className="w-8 h-8 text-purple-400" /> پدیدآورندگان شاخص
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-11">محققان، تحلیل‌گران و مستندسازان فعال در شبکه مدار</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pageContent.investigators.map((user) => (
                    <a key={user.id} href="#" className="relative p-6 rounded-2xl bg-[#0b0f19]/80 backdrop-blur-xl group overflow-hidden flex flex-col items-center text-center transition-all duration-500 hover:border-purple-500/40 hover:-translate-y-2 shadow-lg">
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative w-24 h-24 mb-4 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 border-2 border-[#0b0f19]">
                                <BlurImage src={user.image} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{user.name}</h3>
                        <p className="text-xs text-purple-300 font-light mb-4">{user.role}</p>
                        
                        <span className="mt-auto px-3 py-1 bg-white/5 rounded-full text-[11px] text-gray-400 group-hover:border-purple-500/30 group-hover:text-gray-200 transition-colors">
                           {user.docs} اثر منتشر شده
                        </span>
                    </a>
                ))}
            </div>
        </section>

        {/* ================== Section 7: Tools (Emerald Theme) ================== */}
        <section className="space-y-8 relative">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <span className="w-2 h-8 rounded-full bg-[#10b981] shadow-[0_0_15px_#10b981]"></span> ابزارهای کاربردی
                    </h2>
                    <p className="text-sm text-gray-400 font-light pr-5">تسهیل در تولیدات با به کارگیری مجموعه ابزارهای هوشمند</p>
                </div>
                <a href="/tools" className="text-sm font-bold text-gray-400 hover:text-[#10b981] transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg hover:bg-white/5">
                    آرشیو ابزارها <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { img: '/images/tool-1.jpg', title: 'مترجم هوشمند متون کهن', views: '۱۲.۵k' },
                  { img: '/images/tool-2.jpg', title: 'گاه‌شمار تطبیقی و شبکه‌ای', views: '۸.۲k' },
                  { img: '/images/tool-3.jpg', title: 'تحلیل‌گر تصاویر و نمادها', views: '۵.۰k' },
                  { img: '/images/tool-4.jpg', title: 'تحلیل‌گر فرکانس کلمات در اسناد', views: '۲۲.۰k' }
                ].map((item, i) => (
                  <SpotlightCard key={i} themeGlow="rgba(16,185,129,0.08)" borderGlow="via-[#10b981]">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden flex items-center justify-center mb-5 bg-[#080c16]">
                        <BlurImage src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between relative z-10">
                        <span className="text-[#10b981] text-[10px] font-black tracking-wider mb-2 uppercase">{item.cat}</span>
                        <h3 className="font-bold text-white text-sm mb-4 line-clamp-2 leading-loose group-hover:text-[#10b981] transition-colors">{item.title}</h3>
                        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 border-t border-white/5 pt-4">
                            <span className="flex items-center gap-1.5"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> ۱۴۰۲/۱۱/۲۰</span>
                            <span className="flex items-center gap-1.5"><Icon name="eye" className="w-3.5 h-3.5" /> {item.views}</span>
                        </div>
                    </div>
                  </SpotlightCard>
                ))}
            </div>
        </section>

        {/* ================== بخش جدید ۴: اقدام به عمل و ارسال سند (Tip Line) ================== */}
        <section className="relative mt-20 p-10 md:p-16 rounded-3xl overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f19] to-[#050810] -z-20" />
            <div className="absolute inset-0 opacity-10 bg-[url('/images/noise.png')] mix-blend-overlay -z-10" />
            
            {/* افکت اسکنر رادار */}
            <div className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent -translate-y-full group-hover:animate-[scan_3s_linear_infinite] pointer-events-none z-0" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex-1 space-y-4 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> پورتال ارتباط امن
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white">سندی در دست دارید؟</h2>
                  <p className="text-gray-400 text-sm md:text-base font-light leading-loose max-w-xl">
                      شبکه پژوهشگران مدار همواره به دنبال افشای حقایق و رمزگشایی از اسناد محرمانه است. اگر به داده خام، ویدیو، یا سندی دسترسی دارید، از طریق درگاه امن ما آن را ارسال کنید.
                  </p>
               </div>
               
               <div className="flex-none">
                  <a href="#" className="relative overflow-hidden group/btn inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-black text-lg transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95">
                      <span className="relative z-10 flex items-center gap-3">
                         ارسال امن سند <Icon name="upload" className="w-6 h-6 animate-bounce" />
                      </span>
                  </a>
               </div>
            </div>
        </section>

    </main>
  );
}