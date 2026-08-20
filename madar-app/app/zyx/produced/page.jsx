'use client';

import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon';
import EmptyState from '@/app/components/EmptyState';
import BlurImage from '@/app/components/BlurImage';

// === ۱. هسته محتوایی صفحه ===
const pageContent = {
  hero: {
    badge: "استودیو مدار",
    titlePart1: "",
    titlePart2: "محتوای تولیدی",
    description: "تماشای مستندهای اختصاصی، گزارش‌های ویدیویی، مصاحبه‌ها و پادکست‌های تحلیلی تهیه شده توسط شبکه پژوهشگران مدار."
  },
  // آرایه اسلایدر محتوای منتخب
  featuredMediaList: [
    {
      id: 1,
      badge: "مستند ویژه سردبیر",
      title: "سایه‌های معماری مدرن: واکاوی نمادها",
      description: "در این مستند اختصاصی، ردپای نمادهای باستانی و علوم غریبه را در طراحی پایتخت‌های مهم جهان (پاریس، لندن، واشنگتن) بررسی می‌کنیم. قسمت اول از سه‌گانه معماری قدرت.",
      btnText: "تماشای مستند",
      image: "/images/documentary-cover.jpg"
    },
    {
      id: 2,
      badge: "پادکست تحلیلی",
      title: "نبرد روایت‌ها در رسانه‌های نوظهور",
      description: "بررسی نقش هوش مصنوعی و شبکه‌های اجتماعی در شکل‌دهی به افکار عمومی. چگونه الگوریتم‌ها واقعیت را مهندسی می‌کنند؟",
      btnText: "شنیدن پادکست",
      image: "/images/media-2.jpg"
    },
    {
      id: 3,
      badge: "گزارش ویژه",
      title: "پشت پرده تأمین مالی جریان‌ها",
      description: "تحلیلی بر ساختار قدرت رسانه‌ای در قرن بیست و یکم و ردیابی منابع مالی ناشناس که به نهادهای مخفی ختم می‌شوند.",
      btnText: "مشاهده گزارش",
      image: "/images/media-3.jpg"
    }
  ],
  mediaList: [
    {
      id: 1,
      title: "کاهنان عصر فضا: ریشه‌های پنهان پروژه‌های فضایی",
      duration: "۱:۲۴:۰۰",
      type: "مستند بلند",
      date: "۱۴۰۲/۱۱/۲۰",
      views: "۱۲.۵k",
      image: "/images/media-1.jpg",
      theme: { borderTop: "border-t-rose-500", text: "text-rose-400", bgSoft: "bg-rose-500/10", borderSoft: "border-rose-500/20", hoverText: "group-hover:text-rose-400" }
    },
    {
      id: 2,
      title: "اپیزود ۴: راز انجمن‌ها و شکل‌گیری کالج نامرئی",
      duration: "۴۵:۰۰",
      type: "پادکست تصویری",
      date: "۱۴۰۲/۱۱/۱۵",
      views: "۸.۲k",
      image: "/images/media-2.jpg",
      theme: { borderTop: "border-t-rose-500", text: "text-rose-400", bgSoft: "bg-rose-500/10", borderSoft: "border-rose-500/20", hoverText: "group-hover:text-rose-400" }
    },
    {
      id: 3,
      title: "تحلیل شبکه مالی رسانه‌های نوظهور غربی",
      duration: "۱۸:۳۰",
      type: "گزارش ویدیویی",
      date: "۱۴۰۲/۱۱/۰۵",
      views: "۵k",
      image: "/images/media-3.jpg",
      theme: { borderTop: "border-t-rose-500", text: "text-rose-400", bgSoft: "bg-rose-500/10", borderSoft: "border-rose-500/20", hoverText: "group-hover:text-rose-400" }
    },
    {
      id: 4,
      title: "تاریخچه مخفی نماد چشم جهان‌بین در دلار",
      duration: "۱۰:۱۵",
      type: "گزارش کوتاه",
      date: "۱۴۰۲/۱۰/۲۸",
      views: "۲۲k",
      image: "/images/media-4.jpg",
      theme: { borderTop: "border-t-rose-500", text: "text-rose-400", bgSoft: "bg-rose-500/10", borderSoft: "border-rose-500/20", hoverText: "group-hover:text-rose-400" }
    }
  ]
};

// === ۲. کامپوننت پایه اسکلتون ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === ۳. کامپوننت اسکلتون کارت رسانه ===
const MediaCardSkeleton = () => {
  return (
    <div className="bg-[#0b0f19]/80 border border-white/10 flex flex-col p-4 rounded-2xl relative overflow-hidden h-full">
      <BaseSkeleton className="w-full h-40 mb-4" rounded="rounded-xl" />
      <div className="flex-grow space-y-2 mb-4">
        <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-2/3 h-4" rounded="rounded-md" />
      </div>
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
        <BaseSkeleton className="w-20 h-3" rounded="rounded-sm" />
        <BaseSkeleton className="w-14 h-3" rounded="rounded-sm" />
      </div>
    </div>
  );
};

// === ۴. کامپوننت اسکلتون کل صفحه ===
const ProducedContentPageSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <div className="w-32 h-6 bg-white/5 rounded-lg"></div>

        <section className="bg-[#0b0f19]/80 border border-white/10 rounded-3xl p-8 md:p-12 space-y-4 flex flex-col items-center">
          <BaseSkeleton className="w-36 h-6" rounded="rounded-full" />
          <BaseSkeleton className="w-3/4 h-12" rounded="rounded-xl" />
          <BaseSkeleton className="w-1/2 h-6" rounded="rounded-md" />
        </section>

        <section className="bg-[#0b0f19]/80 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <BaseSkeleton className="w-44 h-6" rounded="rounded" />
            <BaseSkeleton className="w-full h-10" rounded="rounded-xl" />
            <BaseSkeleton className="w-full h-20" rounded="rounded-xl" />
            <BaseSkeleton className="w-36 h-12" rounded="rounded-xl" />
          </div>
          <div className="w-full md:w-5/12 flex justify-center items-center">
            <BaseSkeleton className="w-64 h-64" rounded="rounded-full" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-2">
              <BaseSkeleton className="w-40 h-7" rounded="rounded" />
              <BaseSkeleton className="w-60 h-4" rounded="rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// === ۵. کامپوننت داخلی برای کارت رسانه ===
const MediaCard = ({ item }) => {
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
      href={`/produced/${item.id}`}
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className="relative rounded-2xl border border-white/10 group flex flex-col p-4 overflow-hidden transition-all duration-500 ease-out transform hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.2)] hover:border-rose-500/40"
    >
      {/* لایه پس‌زمینه شیشه‌ای */}
      <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10 rounded-2xl" />
      
      {/* خط نئونی بالای کارت در حالت هاور */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

      {/* لایه Spotlight */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* بخش کاور */}
      <div className="relative z-10 w-full h-40 rounded-xl bg-[#080c16] border border-white/5 overflow-hidden mb-4 flex items-center justify-center">
        <BlurImage 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100" 
        />
      </div>
      
      {/* عنوان */}
      <div className="relative z-10 flex-grow">
        <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed transition-colors line-clamp-2 ${item.theme.hoverText}`}>
          {item.title}
        </h3>
      </div>
      
      {/* فوتر کارت */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-sans">
        
        {/* تاریخ انتشار (سمت راست) */}
        <span className="flex items-center gap-1.5" title="تاریخ انتشار">
          <span>{item.date}</span>
          <Icon name="calendarBlank" className="w-3.5 h-3.5 text-gray-400" />
        </span>

        {/* تعداد بازدید (سمت چپ) */}
        <span className="flex items-center gap-1.5" title="تعداد بازدید">
          <span>{item.views} بازدید</span>
          <Icon name="eye" className="w-3.5 h-3.5 text-gray-400" />
        </span>

      </div>
    </a>
  );
};

export default function ProducedContentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const featuredRef = useRef(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // تایمر خودکار اسلایدر
  useEffect(() => {
    if (isLoading || isPaused) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === pageContent.featuredMediaList.length - 1 ? 0 : prev + 1));
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

  if (isLoading) return <ProducedContentPageSkeleton />;

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-right select-none">
      
      {/* پس‌زمینه محیطی و نورانی */}
      <div className="fixed inset-0 z-[-1] bg-[#050810] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-15 bg-[radial-gradient(circle,rgba(244,63,94,0.6)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-10 bg-[radial-gradient(circle,rgba(59,130,246,0.5)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      {/* تنظیم دقیق پهنا روی max-w-7xl هماهنگ با هدر */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'محتوای تولیدی' }
          ]} 
        />

        {/* ۱. بنر اصلی صفحه با گرافیک کلی ۱ */}
        <section className="relative rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs font-bold text-rose-400 tracking-widest">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
              {pageContent.hero.titlePart1} <span className="text-rose-500">{pageContent.hero.titlePart2}</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-loose text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* ۲. بخش اسلایدر مستند ویژه با گرافیک کلی ۱ */}
        <section 
          ref={featuredRef}
          onMouseMove={handleFeaturedMouseMove}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8 md:p-12 group transition-all duration-500 hover:border-white/20"
        >
          {/* لایه‌های شیشه‌ای و نئونی */}
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(800px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          {/* اسلایدها */}
          <div className="relative min-h-[400px] md:min-h-[350px] flex items-center">
            {pageContent.featuredMediaList.map((slide, index) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 w-full flex flex-col md:flex-row items-center gap-10 transition-all duration-700 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' 
                    : 'opacity-0 -translate-x-10 z-0 pointer-events-none'
                }`}
              >
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs font-bold text-rose-400">
                    <Icon name="star" className="w-4 h-4 fill-current" /> {slide.badge}
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                    {slide.title}
                  </h2>
                  
                  <p className="text-sm md:text-base text-gray-300 leading-loose font-light border-r-2 border-rose-500/50 pr-4 text-justify">
                    {slide.description}
                  </p>
                  
                  <div className="pt-4">
                    <button className="bg-rose-500 hover:bg-rose-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all cursor-pointer">
                      {slide.btnText}
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-5/12 flex justify-center items-center">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-500/20 blur-[60px] rounded-full"></div>
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

          {/* نقطه‌های ناوبری اسلایدر */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {pageContent.featuredMediaList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentSlide 
                    ? 'w-8 h-1.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                    : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`رفتن به اسلاید ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ۳. آرشیو تولیدات */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">آرشیو تولیدات</h2>
              <p className="text-sm text-gray-400 font-light">تمامی ویدیوها و پادکست‌های تولید شده توسط شبکه مدار</p>
            </div>
          </div>

          {pageContent.mediaList.length === 0 ? (
            <EmptyState 
              icon="video" 
              title="هیچ محتوای تولیدی ثبت نشده است!" 
              description="استودیو مدار در حال آماده‌سازی مستندات و پادکست‌های جدید است. ویدیوها و گزارش‌های تحلیلی به زودی در این بخش بارگذاری خواهند شد."
              color="text-rose-500"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageContent.mediaList.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {pageContent.mediaList.length > 0 && (
            <div className="flex justify-center pt-8">
              <button className="relative bg-[#0b0f19] border border-white/10 text-gray-300 px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-3 hover:bg-white/5 hover:border-rose-500 hover:text-rose-500 transition-all duration-300 cursor-pointer shadow-lg">
                <span>نمایش موارد بیشتر</span>
                <Icon name="caretDown" className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}