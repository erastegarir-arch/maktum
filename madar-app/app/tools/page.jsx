'use client';
import { useState, useEffect, useRef } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // اتصال به فایل مرکزی آیکون‌ها
import EmptyState from '../components/EmptyState'; // وارد کردن کامپوننت حالت‌های خالی
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. هسته محتوایی صفحه (ویرایش آسان ابزارها) ===
const pageContent = {
  hero: {
    badge: "آزمایشگاه داده مدار",
    titlePart1: "",
    titlePart2: "ابزارهای کاربردی",
    description: "تسهیل فرآیند پژوهش با استفاده از هوش مصنوعی، گراف‌های ارتباطی و نرم‌افزارهای اختصاصی استخراج و تحلیل داده."
  },
  featuredTool: {
    badge: "ابزار ویژه پژوهشگران",
    title: "گراف ارتباطات شبکه‌ای",
    description: "ابزاری پیشرفته برای تصویرسازی و بررسی ارتباطات پنهان بین افراد، نهادهای مالی و جریان‌های فکری در اسناد تاریخی. با اتصال خودکار گره‌ها، الگوهای مخفی را کشف کنید.",
    btnText: "اجرای ابزار",
    image: "/images/featured-tool.png"
  },
  tools: [
    {
      id: 1,
      name: "مترجم هوشمند متون کهن",
      category: "هوش مصنوعی",
      date: "۱۴۰۲/۱۱/۲۰",
      views: "۱۲.۵k",
      image: "/images/tool-1.jpg",
      borderTopClass: "border-t-[#10b981]",
      badgeBg: "bg-[#0b0f19]/70 backdrop-blur-md border-[#10b981]/40 text-gray-100 shadow-lg",
      hoverTextClass: "group-hover:text-[#10b981]"
    },
    {
      id: 2,
      name: "گاه‌شمار تطبیقی",
      category: "تحلیل داده",
      date: "۱۴۰۲/۱۱/۱۵",
      views: "۸.۲k",
      image: "/images/tool-2.jpg",
      borderTopClass: "border-t-[#10b981]",
      badgeBg: "bg-[#0b0f19]/70 backdrop-blur-md border-[#10b981]/40 text-gray-100 shadow-lg",
      hoverTextClass: "group-hover:text-[#10b981]"
    },
    {
      id: 3,
      name: "تحلیل‌گر تصاویر و نمادها",
      category: "هوش مصنوعی",
      date: "۱۴۰۲/۱۱/۰۵",
      views: "۵k",
      image: "/images/tool-3.jpg",
      borderTopClass: "border-t-[#10b981]",
      badgeBg: "bg-[#0b0f19]/70 backdrop-blur-md border-[#10b981]/40 text-gray-100 shadow-lg",
      hoverTextClass: "group-hover:text-[#10b981]"
    },
    {
      id: 4,
      name: "تحلیل‌گر فرکانس کلمات",
      category: "تحلیل داده",
      date: "۱۴۰۲/۱۰/۲۸",
      views: "۲۲k",
      image: "/images/tool-4.jpg",
      borderTopClass: "border-t-[#10b981]",
      badgeBg: "bg-[#0b0f19]/70 backdrop-blur-md border-[#10b981]/40 text-gray-100 shadow-lg",
      hoverTextClass: "group-hover:text-[#10b981]"
    },
    {
      id: 5,
      name: "نقشه‌نگار تطبیقی جغرافیا",
      category: "تحلیل داده",
      date: "۱۴۰۲/۱۰/۱۵",
      views: "۱۵k",
      image: "/images/tool-5.jpg",
      borderTopClass: "border-t-[#10b981]",
      badgeBg: "bg-[#0b0f19]/70 backdrop-blur-md border-[#10b981]/40 text-gray-100 shadow-lg",
      hoverTextClass: "group-hover:text-[#10b981]"
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

// === ۳. کامپوننت اسکلتون کارت ابزار ===
const ToolCardSkeleton = () => {
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
const ToolsPageSkeleton = () => {
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

        {/* اسکلتون بخش ابزار ویژه */}
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

        {/* اسکلتون لیست ابزارها */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-2">
              <BaseSkeleton className="w-40 h-7" rounded="rounded" />
              <BaseSkeleton className="w-60 h-4" rounded="rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// === ۵. کامپوننت داخلی برای کارت ابزار با افکت Spotlight و تصویر ===
const ToolCard = ({ tool }) => {
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
      className={`glass-card group flex flex-col p-4 rounded-2xl border-t-2 ${tool.borderTopClass} relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 hover:border-[#10b981]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(16,185,129,0.15)]`}
    >
      {/* لایه Spotlight */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* بخش کاور و تصویر با لودینگ تنبل و بلور */}
      <div className="relative z-10 w-full h-40 rounded-xl bg-gray-900 overflow-hidden mb-4 flex items-center justify-center">
        <BlurImage 
          src={tool.image} 
          alt={tool.name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" 
        />
        
        {/* نشان دسته‌بندی شیشه‌ای */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold border z-20 ${tool.badgeBg}`}>
          {tool.category}
        </div>
      </div>
      
      {/* عنوان */}
      <div className="relative z-10 flex-grow">
        <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed transition-colors line-clamp-2 ${tool.hoverTextClass}`}>
          {tool.name}
        </h3>
      </div>
      
      {/* فوتر کارت شامل تاریخ و بازدید */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
        <span className="flex items-center gap-1">
          <Icon name="calendarBlank" className="w-3 h-3" /> {tool.date}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="eye" className="w-3 h-3" /> {tool.views} بازدید
        </span>
      </div>
    </a>
  );
};

export default function ToolsPage() {
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
    return <ToolsPageSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* پس‌زمینه نئونی شناور */}
      <div className="fixed inset-0 z-[-1] bg-deep-base overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-10 bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      {/* محتوای اصلی */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'ابزارهای کاربردی' }
          ]} 
        />

        {/* بنر عنوان صفحه */}
        <section className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center items-center text-center border-t-2 border-t-[#10b981] animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full text-xs font-bold text-[#10b981] tracking-widest">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
              {pageContent.hero.titlePart1} <span className="text-[#10b981]">{pageContent.hero.titlePart2}</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* بخش ابزار ویژه */}
        <section 
          ref={featuredRef}
          onMouseMove={handleFeaturedMouseMove}
          className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border-t-2 border-t-[#10b981] group transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(16,185,129,0.2)] hover:border-[#10b981]/50"
        >
          {/* لایه Spotlight */}
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 rounded text-xs font-bold text-[#10b981]">
                <Icon name="star" className="w-4 h-4 fill-current" /> {pageContent.featuredTool.badge}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {pageContent.featuredTool.title}
              </h2>
              
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light border-r-2 border-[#10b981]/50 pr-4 text-justify">
                {pageContent.featuredTool.description}
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <button className="bg-[#10b981] text-gray-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer">
                  {pageContent.featuredTool.btnText}
                </button>
              </div>
            </div>

            <div className="w-full md:w-5/12 flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#10b981]/20 blur-2xl rounded-full"></div>
                <BlurImage 
                  src={pageContent.featuredTool.image} 
                  alt="تصویر گرافیکی ابزار" 
                  className="relative z-10 w-full h-full object-contain animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* لیست ابزارها */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">آرشیو ابزارها</h2>
              <p className="text-sm text-gray-400 font-light">تمامی ابزارهای توسعه‌یافته توسط تیم فنی مدار</p>
            </div>
          </div>

          {/* بررسی خالی بودن لیست ابزارها و نمایش EmptyState در صورت نیاز */}
          {pageContent.tools.length === 0 ? (
            <EmptyState 
              icon="pen-nib" 
              title="هنوز هیچ ابزاری منتشر نشده است!" 
              description="تیم فنی مدار در حال توسعه و تست ابزارهای هوش مصنوعی و تحلیل داده است. ابزارهای جدید به زودی در این بخش قرار خواهند گرفت."
              color="text-[#10b981]"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageContent.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}

          {/* دکمه نمایش بیشتر (فقط زمانی که ابزاری وجود داشته باشد) */}
          {pageContent.tools.length > 0 && (
            <div className="flex justify-center pt-8">
              <button className="relative group bg-white/5 border border-white/10 text-white px-10 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer">
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