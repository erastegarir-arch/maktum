'use client';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // اتصال به کتابخانه مرکزی آیکون‌ها
import EmptyState from '../components/EmptyState'; // وارد کردن کامپوننت حالت‌های خالی
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. هسته محتوایی صفحه (کاملاً آماده برای اتصال به پنل مدیریت سایت / ادمین) ===
const pageContent = {
  hero: {
    badge: "بانک داده مدار",
    titlePart1: "",
    titlePart2: "محتوای خام و فوتیج",
    description: "دسترسی بدون واسطه به اسناد، دست‌نوشته‌ها، ویدیوهای خام و فایل‌های صوتی افشا شده جهت تحلیل و بررسی پژوهشگران."
  },
  featuredDoc: {
    badge: "محتوای پیشنهادی سردبیر",
    title: "اسناد طبقه‌بندی شده پروژه استارگیت",
    description: "مجموعه کامل و بدون سانسور اسناد مرتبط با آزمایش‌های ذهنی، روانی و پروژه‌های فوق‌محرمانه در دوران جنگ سرد. این فایل شامل ۱۲۰ صفحه دست‌نویس و گزارش‌های تایپ شده است.",
    meta: "حجم فایل: ۴۵ مگابایت (ZIP)",
    btnText: "بررسی اسناد",
    image: "/images/classified-folder.png"
  },
  rawItems: [
    {
      id: 1,
      title: "اسناد افشا شده انجمن‌های مخفی لندن",
      date: "۱۴۰۲/۱۱/۲۰",
      views: "۳.۲k بازدید",
      badgeText: "سند متنی",
      formatIcon: "filePdf",
      image: "/images/doc-pdf.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
      }
    },
    {
      id: 2,
      title: "ویدیوی خام سخنرانی محرمانه اعضای لژ",
      date: "۱۴۰۲/۱۱/۱۸",
      views: "۶.۵k بازدید",
      badgeText: "راش ویدیویی",
      formatIcon: "fileVideo",
      image: "/images/doc-video.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
      }
    },
    {
      id: 3,
      title: "شنود مکالمات فاش شده در گردهمایی سالانه",
      date: "۱۴۰۲/۱۱/۱۵",
      views: "۱.۸k بازدید",
      badgeText: "فایل صوتی",
      formatIcon: "fileAudio",
      image: "/images/doc-audio.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
      }
    },
    {
      id: 4,
      title: "مجموعه تلگراف‌های رمزنگاری شده جنگ سرد",
      date: "۱۴۰۲/۱۱/۱۰",
      views: "۴.۱k بازدید",
      badgeText: "متن ساده",
      formatIcon: "fileText",
      image: "/images/doc-text.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
      }
    },
    {
      id: 5,
      title: "نقشه‌های اصلی معماری پایتخت‌های غربی",
      date: "۱۴۰۲/۱۱/۰۵",
      views: "۵.۰k بازدید",
      badgeText: "سند متنی",
      formatIcon: "filePdf",
      image: "/images/doc-pdf.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
      }
    },
    {
      id: 6,
      title: "مراسم‌های نمادین ضبط شده در دهه هفتاد میلادی",
      date: "۱۴۰۲/۱۰/۲۸",
      views: "۱۲.۵k بازدید",
      badgeText: "راش ویدیویی",
      formatIcon: "fileVideo",
      image: "/images/doc-video.png",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBg: "bg-[#fbbf24]/20 border-[#fbbf24]/30",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]"
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

// === ۳. کامپوننت اسکلتون کارت محتوا ===
const RawItemCardSkeleton = () => {
  return (
    <div className="glass-card flex flex-col p-4 rounded-2xl relative overflow-hidden border-t-2 border-white/10 h-full">
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

// === ۴. کامپوننت اسکلتون کل صفحه (زمان لودینگ اولیه) ===
const RawContentPageSkeleton = () => {
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

        {/* اسکلتون بخش سند ویژه */}
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

        {/* اسکلتون لیست آرشیو */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-2">
              <BaseSkeleton className="w-40 h-7" rounded="rounded" />
              <BaseSkeleton className="w-60 h-4" rounded="rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RawItemCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// === ۵. کامپوننت داخلی کارت اسناد خام اصلی ===
const RawItemCard = ({ item }) => {
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
      className={`glass-card group flex flex-col p-4 rounded-2xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 border-t-2 ${item.theme.borderTop} hover:border-[#fbbf24]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(251,191,36,0.15)]`}
    >
      {/* لایه Spotlight */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* تصویر کاور با لودینگ تنبل و بلور */}
      <div className="relative z-10 w-full h-40 rounded-xl bg-gray-900 overflow-hidden mb-4 flex items-center justify-center">
        <BlurImage 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
        />
            
        <div className={`absolute top-2 right-2 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold border z-10 bg-[#0b0f19]/70 ${item.theme.badgeBg} ${item.theme.badgeText} shadow-lg`}>
          {item.badgeText}
        </div>
      </div>
      
      {/* عنوان فایل */}
      <div className="relative z-10 flex-grow">
        <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed transition-colors line-clamp-2 ${item.theme.hoverTitle}`}>
          {item.title}
        </h3>
      </div>
      
      {/* فوتر کارت (تاریخ انتشار و تعداد بازدید) */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
        <span className="flex items-center gap-1">
          <Icon name="calendarBlank" className="w-3 h-3" /> {item.date}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="eye" className="w-3 h-3" /> {item.views}
        </span>
      </div>
    </a>
  );
};

export default function RawContentPage() {
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
    return <RawContentPageSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        
        {/* مسیرنما (Breadcrumbs) */}
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'محتوای خام' }
          ]} 
        />

        {/* بنر عنوان صفحه (متصل به آبجکت مدیریت) */}
        <section className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center items-center text-center border-t-2 border-t-[#fbbf24] animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-full text-xs font-bold text-[#fbbf24] tracking-widest">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
              {pageContent.hero.titlePart1} <span className="text-[#fbbf24]">{pageContent.hero.titlePart2}</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* بخش سند ویژه سردبیر (متصل به آبجکت مدیریت) */}
        <section 
          ref={featuredRef}
          onMouseMove={handleFeaturedMouseMove}
          className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border-t-2 border-t-[#fbbf24] group transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(251,191,36,0.2)] hover:border-[#fbbf24]/50"
        >
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded text-xs font-bold text-[#fbbf24]">
                <Icon name="star" className="w-4 h-4 fill-current" /> {pageContent.featuredDoc.badge}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {pageContent.featuredDoc.title}
              </h2>
              
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light border-r-2 border-[#fbbf24]/50 pr-4 text-justify">
                {pageContent.featuredDoc.description}
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <button className="bg-[#fbbf24] text-gray-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all cursor-pointer">
                  {pageContent.featuredDoc.btnText}
                </button>
              </div>
            </div>

            <div className="w-full md:w-5/12 flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#fbbf24]/20 blur-2xl rounded-full"></div>
                <BlurImage 
                  src={pageContent.featuredDoc.image} 
                  alt="تصویر گرافیکی سند" 
                  className="relative z-10 w-full h-full object-contain animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* لیست آرشیو محتوای خام */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">آرشیو محتوا</h2>
              <p className="text-sm text-gray-400 font-light">تمامی فایل‌های بارگذاری شده در سامانه</p>
            </div>
          </div>

          {/* بررسی خالی بودن لیست و نمایش EmptyState در صورت نیاز */}
          {pageContent.rawItems.length === 0 ? (
            <EmptyState 
              icon="folder" 
              title="هیچ سند یا محتوای خامی وجود ندارد!" 
              description="بخش آرشیو محتوای خام و فوتیج‌های مدار در حال به‌روزرسانی است. اسناد و فایل‌های جدید به زودی در این قسمت بارگذاری خواهند شد."
              color="text-[#fbbf24]"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageContent.rawItems.map((item) => (
                <RawItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* دکمه نمایش بیشتر (فقط زمانی که فایلی وجود داشته باشد) */}
          {pageContent.rawItems.length > 0 && (
            <div className="flex justify-center pt-8">
              <button className="relative group bg-white/5 border border-white/10 text-white px-10 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 hover:border-[#fbbf24] hover:text-[#fbbf24] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer">
                <span>نمایش موارد بیشتر</span>
                <Icon name="caretDown" className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}