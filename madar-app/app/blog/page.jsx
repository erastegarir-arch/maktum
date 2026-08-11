'use client';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // اتصال به کتابخانه مرکزی آیکون‌ها
import EmptyState from '../components/EmptyState'; // وارد کردن کامپوننت حالت‌های خالی
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. هسته محتوایی صفحه (قابل ویرایش و مدیریت در پنل ادمین سایت) ===
const pageContent = {
  hero: {
    badge: "پایگاه دانش",
    titlePart1: "",
    titlePart2: "اخبار و مقالات",
    description: "در این بخش، جدیدترین تحلیل‌ها، گزارش‌های اختصاصی، یادداشت‌های پژوهشگران و اخبار مربوط به به‌روزرسانی‌های شبکه مدار را مطالعه کنید."
  },
  featuredArticle: {
    badge: "مقاله منتخب سردبیر",
    title: "نقش انجمن سلطنتی در شکل‌گیری پارادایم علم مدرن",
    description: "آیا علم تجربی صرفاً بر پایه مشاهدات دقیق استوار شد، یا کاتالیزور اصلی آن، میل باطنی کیمیاگران برای کشف قوانین آفرینش بود؟ در این مقاله اختصاصی، اسناد تازه‌ای از رابرت بویل و اسحاق نیوتن را بررسی می‌کنیم.",
    btnText: "ادامه مطالعه",
    image: "/images/blog-featured.png"
  },
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

// === ۲. کامپوننت پایه اسکلتون با افکت Shimmer ===
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
    <div className="glass-card flex flex-col p-4 rounded-2xl relative overflow-hidden border-t-2 border-white/10 h-full">
      <BaseSkeleton className="w-full h-48 mb-4" rounded="rounded-xl" />
      <div className="flex-grow space-y-2 mb-4">
        <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-2/3 h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-full h-3 mt-3" rounded="rounded-sm" />
      </div>
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
        <BaseSkeleton className="w-20 h-3" rounded="rounded-sm" />
        <BaseSkeleton className="w-14 h-3" rounded="rounded-sm" />
      </div>
    </div>
  );
};

// === ۴. کامپوننت اسکلتون کل صفحه (زمان لودینگ اولیه) ===
const BlogPageSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <div className="w-32 h-6 bg-white/5 rounded-lg"></div>

        {/* اسکلتون بنر صفحه */}
        <section className="glass-card rounded-3xl p-8 md:p-12 space-y-4 flex flex-col items-center">
          <BaseSkeleton className="w-36 h-6" rounded="rounded-full" />
          <BaseSkeleton className="w-3/4 h-12" rounded="rounded-xl" />
          <BaseSkeleton className="w-1/2 h-6" rounded="rounded-md" />
        </section>

        {/* اسکلتون بخش مقاله ویژه */}
        <section className="glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-10">
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

        {/* اسکلتون لیست آخرین مطالب */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-2">
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

// === ۵. کامپوننت داخلی برای کارت بلاگ اصلی ===
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
      href="#" 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className={`glass-card group flex flex-col p-4 rounded-2xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 border-t-2 ${article.theme.borderTop} hover:border-[#b45309]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(180,83,9,0.15)]`}
    >
      {/* لایه Spotlight */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* تصویر کاور با لودینگ تنبل و بلور */}
      <div className="relative z-10 w-full h-48 rounded-xl bg-gray-900 overflow-hidden mb-4 flex items-center justify-center">
        <BlurImage 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
        />
        <div className={`absolute top-2 right-2 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold border z-10 bg-[#0b0f19]/70 ${article.theme.badgeBg} ${article.theme.badgeText} shadow-lg`}>
          {article.badgeText}
        </div>
      </div>
      
      {/* عنوان و خلاصه */}
      <div className="relative z-10 flex-grow">
        <h3 className={`text-base font-bold text-white mb-2 leading-relaxed transition-colors line-clamp-2 ${article.theme.hoverTitle}`}>
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light text-justify">
          {article.excerpt}
        </p>
      </div>
      
      {/* فوتر کارت (تاریخ و تعداد بازدید) */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
        <span className="flex items-center gap-1">
          <Icon name="calendarBlank" className="w-3 h-3" /> {article.date}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="eye" className="w-3 h-3" /> {article.views}
        </span>
      </div>
    </a>
  );
};

export default function BlogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const featuredRef = useRef(null);

  // شبیه‌سازی بارگذاری اولیه صفحه (مثلاً ۱ ثانیه)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFeaturedMouseMove = (e) => {
    if (!featuredRef.current) return;
    const rect = featuredRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    featuredRef.current.style.setProperty('--mouse-x', `${x}px`);
    featuredRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // اگر صفحه در حال لودینگ بود، اسکلتون اختصاصی نمایش داده می‌شود
  if (isLoading) {
    return <BlogPageSkeleton />;
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        
      {/* مسیر راهنما */}        
      <Breadcrumbs 
        items={[
          { label: 'مدار', href: '/' },
          { label: 'بلاگ' }
        ]} 
      />

      {/* بنر عنوان صفحه (متصل به آبجکت مدیریت) */}
      <section className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center items-center text-center border-t-2 border-t-[#b45309] animate-[fadeIn_0.5s_ease-out]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#b45309]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b45309]/10 border border-[#b45309]/30 rounded-full text-xs font-bold text-[#b45309] tracking-widest">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d97706] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b45309] shadow-[0_0_10px_#b45309]"></span>
            </span>
            {pageContent.hero.badge}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
            {pageContent.hero.titlePart1} <span className="text-[#b45309]">{pageContent.hero.titlePart2}</span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
            {pageContent.hero.description}
          </p>
        </div>
      </section>

      {/* بخش خبر/مقاله ویژه (متصل به آبجکت مدیریت) */}
      <section 
        ref={featuredRef}
        onMouseMove={handleFeaturedMouseMove}
        className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border-t-2 border-t-[#b45309] group transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(180,83,9,0.2)] hover:border-[#b45309]/50"
      >
        <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#b45309]/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b45309]/10 border border-[#b45309]/30 rounded text-xs font-bold text-[#b45309]">
              <Icon name="star" className="w-4 h-4 fill-current" /> {pageContent.featuredArticle.badge}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {pageContent.featuredArticle.title}
            </h2>
            
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light border-r-2 border-[#b45309]/50 pr-4 text-justify">
              {pageContent.featuredArticle.description}
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <button className="bg-[#b45309] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d97706] shadow-[0_0_15px_rgba(180,83,9,0.4)] transition-all cursor-pointer">
                {pageContent.featuredArticle.btnText}
              </button>
            </div>
          </div>

          <div className="w-full md:w-5/12 flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#b45309]/20 blur-2xl rounded-full"></div>
              <BlurImage 
                src={pageContent.featuredArticle.image} 
                alt="تصویر گرافیکی مقاله" 
                className="relative z-10 w-full h-full object-contain animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* آرشیو مقالات */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">آخرین مطالب</h2>
            <p className="text-sm text-gray-400 font-light">آرشیو کامل یادداشت‌ها، مقالات و گزارش‌های مدار</p>
          </div>
        </div>

        {/* بررسی خالی بودن لیست و نمایش EmptyState در صورت نیاز */}
        {pageContent.articles.length === 0 ? (
          <EmptyState 
            icon="article" 
            title="هنوز مقاله‌ای منتشر نشده است!" 
            description="پژوهشگران و نویسندگان شبکه مدار در حال تدوین یادداشت‌ها و گزارش‌های تحلیلی جدید هستند. مطالب بلاگ به زودی در این بخش منتشر خواهند شد."
            color="text-[#b45309]"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageContent.articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* دکمه نمایش مطالب بیشتر (فقط زمانی که مقاله‌ای وجود داشته باشد) */}
        {pageContent.articles.length > 0 && (
          <div className="flex justify-center pt-8">
            <button className="relative group bg-white/5 border border-white/10 text-white px-10 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 hover:border-[#b45309] hover:text-[#b45309] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer">
              <span>نمایش مطالب بیشتر</span>
              <Icon name="caretDown" className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

    </main>
  );
}