'use client';

import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import BlurImage from '../components/BlurImage';

// === ۱. هسته محتوایی صفحه ===
const pageContent = {
  hero: {
    badge: "پایگاه دانش",
    titlePart1: "",
    titlePart2: "اخبار و مقالات",
    description: "در این بخش، جدیدترین تحلیل‌ها، گزارش‌های اختصاصی، یادداشت‌های پژوهشگران و اخبار مربوط به به‌روزرسانی‌های شبکه مدار را مطالعه کنید."
  },
  // آرایه اسلایدر مقالات منتخب
  featuredArticleList: [
    {
      id: 1,
      badge: "مقاله منتخب سردبیر",
      title: "نقش انجمن سلطنتی در شکل‌گیری پارادایم علم مدرن",
      description: "آیا علم تجربی صرفاً بر پایه مشاهدات دقیق استوار شد، یا کاتالیزور اصلی آن، میل باطنی کیمیاگران برای کشف قوانین آفرینش بود؟ در این مقاله اختصاصی، اسناد تازه‌ای از رابرت بویل و اسحاق نیوتن را بررسی می‌کنیم.",
      btnText: "ادامه مطالعه",
      image: "/images/blog-featured.png"
    },
    {
      id: 2,
      badge: "یادداشت تحلیلی",
      title: "مهندسی افکار عمومی و جنگ روایت‌ها در قرن جدید",
      description: "چگونه ساختارهای رسانه‌ای مدرن واقعیت را بازتعریف می‌کنند؟ تحلیلی بر الگوریتم‌های شبکه‌های اجتماعی و تأثیر آن بر ناخودآگاه جمعی.",
      btnText: "مطالعه یادداشت",
      image: "/images/blog-2.jpg"
    },
    {
      id: 3,
      badge: "گزارش پژوهشی",
      title: "تحلیل شبکه جریان‌های مالی پنهان رسانه‌های غربی",
      description: "بررسی الگوهای سرمایه‌گذاری و ارتباط کانون‌های قدرت با غول‌های فناوری و رسانه‌های جریان اصلی.",
      btnText: "مشاهده گزارش",
      image: "/images/blog-3.jpg"
    }
  ],
  articles: [
    {
      id: 1,
      title: "ریشه‌های هرمسی در فیزیک و مکانیک کلاسیک",
      excerpt: "بررسی نامه‌های رد و بدل شده در قرن هفدهم که نشان از اهداف پنهان علمی دارد.",
      date: "۱۴۰۲/۱۱/۱۵",
      views: "۴.۲k بازدید",
      badgeText: "یادداشت",
      image: "/images/blog-1.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    },
    {
      id: 2,
      title: "پشت پرده تأمین مالی شبکه‌های رسانه‌ای جدید",
      excerpt: "چه کسانی جریان‌های اطلاعاتی را در قرن بیست و یکم مدیریت می‌کنند؟",
      date: "۱۴۰۲/۱۱/۱۲",
      views: "۵.۸k بازدید",
      badgeText: "گزارش تحلیلی",
      image: "/images/blog-2.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    },
    {
      id: 3,
      title: "بررسی هندسه پنهان در معماری پایتخت‌های غربی",
      excerpt: "ردپای خطوط باستانی و نمادهای نجومی در نقشه‌های شهری پاریس و واشنگتن.",
      date: "۱۴۰۲/۱۱/۰۸",
      views: "۹.۱k بازدید",
      badgeText: "مقاله",
      image: "/images/blog-3.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    },
    {
      id: 4,
      title: "اضافه شدن ۵۰۰ سند خام جدید به آرشیو مدار",
      excerpt: "اسناد مربوط به دهه‌های ۶۰ و ۷۰ میلادی در بخش ویژه قرار گرفت.",
      date: "۱۴۰۲/۱۱/۰۵",
      views: "۲.۵k بازدید",
      badgeText: "اخبار شبکه",
      image: "/images/blog-4.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    },
    {
      id: 5,
      title: "کیمیاگران دربار و راز سنگ جادو",
      excerpt: "چگونه جستجو برای اکسیر حیات، مسیر علم را در اروپا تغییر داد؟",
      date: "۱۴۰۲/۱۱/۰۱",
      views: "۱۱.۴k بازدید",
      badgeText: "مقاله ویژه",
      image: "/images/blog-5.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    },
    {
      id: 6,
      title: "فراماسونری و انقلاب‌های قرن هجدهم",
      excerpt: "بررسی اجمالی تأثیر محافل مخفی بر رویدادهای سیاسی مهم جهان.",
      date: "۱۴۰۲/۱۰/۲۸",
      views: "۷.۳k بازدید",
      badgeText: "یادداشت",
      image: "/images/blog-6.jpg",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBg: "bg-[#b45309]/20 border-[#b45309]/30",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]"
      }
    }
  ]
};

// === ۲. کامپوننت پایه اسکلتون ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === ۳. کامپوننت اسکلتون کارت بلاگ ===
const BlogCardSkeleton = () => {
  return (
    <div className="relative flex flex-col p-5 rounded-2xl border border-white/10 overflow-hidden h-full">
      <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-90 pointer-events-none" />
      
      <BaseSkeleton className="w-full h-48 mb-4" rounded="rounded-xl" />
      <div className="flex-grow space-y-3 mb-4">
        <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-2/3 h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-full h-3 mt-3" rounded="rounded-sm" />
      </div>
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <BaseSkeleton className="w-20 h-3" rounded="rounded-sm" />
        <BaseSkeleton className="w-14 h-3" rounded="rounded-sm" />
      </div>
    </div>
  );
};

// === ۴. کامپوننت اسکلتون کل صفحه ===
const BlogPageSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <div className="w-32 h-6 bg-white/5 rounded-lg"></div>

        <section className="relative rounded-3xl border border-white/10 p-8 md:p-12 space-y-5 flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#b45309] to-transparent opacity-90 pointer-events-none" />
          
          <BaseSkeleton className="w-36 h-6" rounded="rounded-full" />
          <BaseSkeleton className="w-3/4 h-12 md:h-16" rounded="rounded-xl" />
          <BaseSkeleton className="w-1/2 h-6" rounded="rounded-md" />
        </section>

        <section className="relative rounded-3xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-10 overflow-hidden">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#b45309] to-transparent opacity-90 pointer-events-none" />

          <div className="flex-1 space-y-6 relative z-10">
            <BaseSkeleton className="w-44 h-6" rounded="rounded" />
            <BaseSkeleton className="w-full h-10" rounded="rounded-xl" />
            <BaseSkeleton className="w-full h-20" rounded="rounded-xl" />
            <BaseSkeleton className="w-36 h-12" rounded="rounded-xl" />
          </div>
          <div className="w-full md:w-5/12 flex justify-center items-center relative z-10">
            <BaseSkeleton className="w-64 h-64 md:w-80 md:h-80" rounded="rounded-full" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-3">
              <BaseSkeleton className="w-40 h-7" rounded="rounded" />
              <BaseSkeleton className="w-60 h-4" rounded="rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// === ۵. کامپوننت داخلی برای کارت بلاگ (بدون بج روی تصویر) ===
const BlogCard = ({ article }) => {
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
      href={`/blog/${article.id}`} 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className="group flex flex-col p-5 rounded-2xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 border border-white/10 hover:border-[#b45309]/40 h-full shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(180,83,9,0.3)]"
    >
      {/* لایه پس‌زمینه شیشه‌ای */}
      <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />

      {/* نوار نوری بالای کارت */}
      <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20 bg-gradient-to-r from-transparent via-[#b45309] to-transparent" />

      {/* لایه Spotlight */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(180,83,9,0.06),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* تصویر کاور (بدون کادر بج) */}
      <div className="relative z-10 w-full h-48 rounded-xl bg-black/60 overflow-hidden mb-5 flex items-center justify-center border border-white/5">
        <BlurImage 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
        />
      </div>
      
      {/* عنوان و خلاصه */}
      <div className="relative z-10 flex-grow">
        <h3 className={`text-base font-bold text-white mb-2.5 leading-relaxed transition-colors line-clamp-2 ${article.theme.hoverTitle}`}>
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light text-justify">
          {article.excerpt}
        </p>
      </div>
      
      {/* فوتر کارت */}
      <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-sans">
        <span className="flex items-center gap-1.5">
          <Icon name="calendarBlank" className="w-3.5 h-3.5" /> {article.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="eye" className="w-3.5 h-3.5" /> {article.views}
        </span>
      </div>
    </a>
  );
};

export default function BlogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const featuredRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // تایمر خودکار اسلایدر
  useEffect(() => {
    if (isLoading || isPaused) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === pageContent.featuredArticleList.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [isLoading, isPaused]);

  const handleFeaturedMouseMove = (e) => {
    if (!featuredRef.current) return;
    const rect = featuredRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    featuredRef.current.style.setProperty('--mouse-x', `${x}px`);
    featuredRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  if (isLoading) {
    return <BlogPageSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
          
        {/* مسیر راهنما */}        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'بلاگ' }
          ]} 
        />

        {/* بنر عنوان صفحه */}
        <section className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden flex flex-col justify-center items-center text-center shadow-2xl animate-[fadeIn_0.5s_ease-out] group">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#b45309] to-transparent opacity-90 pointer-events-none z-20" />
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#b45309]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#b45309]/10 border border-[#b45309]/30 rounded-full text-xs font-bold text-[#b45309] tracking-widest shadow-inner">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d97706] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b45309] shadow-[0_0_10px_#b45309]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
              {pageContent.hero.titlePart1} <span className="text-[#b45309]">{pageContent.hero.titlePart2}</span>
            </h1>
            
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* بخش مقاله ویژه (اسلایدر انیمیشنی) */}
        <section 
          ref={featuredRef}
          onMouseMove={handleFeaturedMouseMove}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden shadow-2xl transition-all duration-400 hover:border-[#b45309]/50 group"
        >
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#b45309] to-transparent opacity-90 pointer-events-none z-20" />
          
          <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(180,83,9,0.06),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#b45309]/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          
          {/* کانتینر اسلایدها */}
          <div className="relative min-h-[400px] md:min-h-[350px] flex items-center">
            {pageContent.featuredArticleList.map((slide, index) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 w-full flex flex-col md:flex-row items-center gap-10 transition-all duration-700 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' 
                    : 'opacity-0 -translate-x-10 z-0 pointer-events-none'
                }`}
              >
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#b45309]/10 border border-[#b45309]/30 rounded-lg text-xs font-bold text-[#b45309]">
                    <Icon name="star" className="w-4 h-4 fill-current" /> {slide.badge}
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    {slide.title}
                  </h2>
                  
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light border-r-2 border-[#b45309]/50 pr-4 text-justify">
                    {slide.description}
                  </p>
                  
                  <div className="pt-4">
                    <button className="bg-[#b45309] hover:bg-[#d97706] text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(180,83,9,0.3)] hover:shadow-[0_0_25px_rgba(180,83,9,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      {slide.btnText}
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-5/12 flex justify-center items-center">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#b45309]/20 blur-2xl rounded-full pointer-events-none"></div>
                    <BlurImage 
                      src={slide.image} 
                      alt={slide.title} 
                      className={`relative z-10 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-[2000ms] ${index === currentSlide ? 'scale-100' : 'scale-90'}`} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* نقطه‌های ناوبری اسلایدر (Dots) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {pageContent.featuredArticleList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentSlide 
                    ? 'w-8 h-1.5 bg-[#b45309] shadow-[0_0_8px_#b45309]' 
                    : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`رفتن به اسلاید ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* آرشیو مقالات */}
        <section className="space-y-8">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">آخرین مطالب</h2>
              <p className="text-sm text-gray-400 font-light">آرشیو کامل یادداشت‌ها، مقالات و گزارش‌های مدار</p>
            </div>
          </div>

          {pageContent.articles.length === 0 ? (
            <div className="relative rounded-2xl border border-white/10 p-10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <EmptyState 
                icon="article" 
                title="هنوز مقاله‌ای منتشر نشده است!" 
                description="پژوهشگران و نویسندگان شبکه مدار در حال تدوین یادداشت‌ها و گزارش‌های تحلیلی جدید هستند. مطالب بلاگ به زودی در این بخش منتشر خواهند شد."
                color="text-[#b45309]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageContent.articles.map((article) => (
                <BlogCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {pageContent.articles.length > 0 && (
            <div className="flex justify-center pt-6">
              <button className="relative group bg-[#080c16] border border-white/10 text-white px-10 py-3.5 rounded-full font-bold flex items-center gap-3 hover:bg-white/5 hover:border-[#b45309] hover:text-[#b45309] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-pointer">
                <span>نمایش مطالب بیشتر</span>
                <Icon name="caretDown" className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}