'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; 
import EmptyState from '../components/EmptyState'; // وارد کردن کامپوننت حالت‌های خالی
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. هسته محتوایی صفحه (تغذیه داینامیک اطلاعات) ===
const categoryData = {
  type: "hashtag", // نوع صفحه: 'hashtag' یا 'category'
  title: "نمادشناسی و علوم باطنی",
  description: "آرشیو کامل اسناد، مقالات و مستندهای مرتبط با ریشه‌یابی نمادهای باستانی در دوران معاصر. این برچسب شامل اطلاعات مربوط به تاریخ علم، بررسی نسخه‌های خطی، رساله‌های کمیاب و انجمن‌های مخفی است.",
  stats: [
    { value: "۱۴۲", label: "محتوای مرتبط" },
    { value: "۸.۵k", label: "بازدید کل" }
  ],
  theme: {
    color: "neon-purple", 
    bgSoft: "bg-neon-purple/5",
    icon: "hash"
  },
  items: [
    {
      id: 1,
      title: "سایه‌های معماری مدرن: واکاوی نمادها",
      filterType: "produced", 
      typeBadge: "مستند",
      category: "محتوای تولیدی",
      image: "/images/content-documentary.jpg", 
      metaIcon: "calendarBlank",
      metaText: "۱۴۰۲/۱۱/۲۰",
      theme: {
        borderTop: "border-t-[#f43f5e]",
        badgeBorder: "border-[#f43f5e]/40",
        badgeText: "text-[#f43f5e]",
        hoverTitle: "group-hover:text-[#f43f5e]",
        hoverShadow: "hover:border-[#f43f5e]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(244,63,94,0.15)]"
      }
    },
    {
      id: 2,
      title: "ردپای علوم غریبه در متون تاریخی و نسخ خطی",
      filterType: "article",
      typeBadge: "مقاله",
      category: "بلاگ",
      image: "/images/content-article.jpg", 
      metaIcon: "calendarBlank",
      metaText: "۱۴۰۲/۱۱/۱۵",
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBorder: "border-[#b45309]/40",
        badgeText: "text-[#b45309]",
        hoverTitle: "group-hover:text-[#b45309]",
        hoverShadow: "hover:border-[#b45309]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(180,83,9,0.15)]"
      }
    },
    {
      id: 3,
      title: "دست‌نوشته‌های اصلی ایزاک نیوتن در باب کیمیاگری",
      filterType: "raw",
      typeBadge: "سند PDF",
      category: "محتوای خام",
      image: "/images/content-document.jpg", 
      metaIcon: "calendarBlank",
      metaText: "۱۴۰۲/۱۱/۱۰",
      theme: {
        borderTop: "border-t-[#fbbf24]",
        badgeBorder: "border-[#fbbf24]/40",
        badgeText: "text-[#fbbf24]",
        hoverTitle: "group-hover:text-[#fbbf24]",
        hoverShadow: "hover:border-[#fbbf24]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(251,191,36,0.15)]"
      }
    },
    {
      id: 4,
      title: "گراف ارتباطات شبکه‌ای و بررسی تعاملات",
      filterType: "tools",
      typeBadge: "تحلیل داده",
      category: "ابزارها",
      image: "/images/tool-1.jpg", 
      metaIcon: "calendarBlank",
      metaText: "۱۴۰۲/۱۰/۲۸",
      theme: {
        borderTop: "border-t-[#10b981]",
        badgeBorder: "border-[#10b981]/40",
        badgeText: "text-[#10b981]",
        hoverTitle: "group-hover:text-[#10b981]",
        hoverShadow: "hover:border-[#10b981]/40 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(16,185,129,0.15)]"
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
const ContentCardSkeleton = () => {
  return (
    <div className="glass-card flex flex-col p-4 rounded-3xl relative overflow-hidden border-t-2 border-white/10 h-full">
      <BaseSkeleton className="w-full h-48 mb-4" rounded="rounded-2xl" />
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

// === ۴. کامپوننت اسکلتون کل صفحه (زمان لودینگ اولیه یا تغییر فیلتر) ===
const CategoryDetailSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 w-full relative z-10 pt-0">
        <div className="w-32 h-6 bg-white/5 rounded-lg"></div>

        {/* اسکلتون هدر صفحه */}
        <section className="glass-card relative overflow-hidden p-8 md:p-12 rounded-3xl border-t-2 border-t-white/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <BaseSkeleton className="w-32 h-32 md:w-40 md:h-40 shrink-0" rounded="rounded-full" />
            <div className="flex-grow space-y-4 w-full text-center md:text-right">
              <BaseSkeleton className="w-32 h-6 mx-auto md:mx-0" rounded="rounded-full" />
              <BaseSkeleton className="w-64 h-10 mx-auto md:mx-0" rounded="rounded-xl" />
              <BaseSkeleton className="w-full h-16" rounded="rounded-xl" />
              <div className="flex gap-6 pt-6 border-t border-white/10 justify-center md:justify-start">
                <BaseSkeleton className="w-24 h-10" rounded="rounded-lg" />
                <BaseSkeleton className="w-24 h-10" rounded="rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* اسکلتون بخش گرید محتوا */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div className="space-y-2 text-center md:text-right">
              <BaseSkeleton className="w-56 h-7 mx-auto md:mx-0" rounded="rounded" />
              <BaseSkeleton className="w-48 h-4 mx-auto md:mx-0" rounded="rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// === ۵. کامپوننت داخلی کارت محتوا ===
const ContentCard = ({ item }) => {
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
      className={`glass-card group flex flex-col p-4 rounded-3xl border-t-2 ${item.theme.borderTop} relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 ${item.theme.hoverShadow}`}
    >
      <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative w-full h-48 rounded-2xl bg-gray-900 overflow-hidden mb-4 z-10 flex items-center justify-center">
        <BlurImage 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
        />
        <div className={`absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold border ${item.theme.badgeBorder} ${item.theme.badgeText} shadow-lg z-20`}>
          {item.typeBadge}
        </div>
      </div>
      
      <div className="relative z-10 flex-grow">
        <h3 className={`text-base font-bold text-white mb-2 leading-relaxed line-clamp-2 transition-colors ${item.theme.hoverTitle}`}>
          {item.title}
        </h3>
      </div>
      
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
        <span className="flex items-center gap-1">
          <Icon name={item.metaIcon} className="w-3 h-3" /> {item.metaText}
        </span>
        <span className={`${item.theme.badgeText} font-bold opacity-80`}>{item.category}</span>
      </div>
    </a>
  );
};

export default function CategoryDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // شبیه‌سازی بارگذاری اولیه صفحه (مثلاً ۱ ثانیه)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const isHashtag = categoryData.type === 'hashtag';
  const themeColor = categoryData.theme.color; 
  const badgeLabel = isHashtag ? 'هشتگ رسمی' : 'دسته‌بندی تخصصی';
  const titleIcon = categoryData.theme.icon; 

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return categoryData.items;
    return categoryData.items.filter(item => item.filterType === activeFilter);
  }, [activeFilter]);

  // اگر صفحه در حال لودینگ بود، اسکلتون اختصاصی نمایش داده می‌شود
  if (isLoading) {
    return <CategoryDetailSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      <div className="fixed inset-0 z-[-1] bg-deep-base overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-15 animate-[drift_30s_infinite_linear_alternate]" style={{ backgroundImage: `radial-gradient(circle, var(--tw-colors-${themeColor.replace('neon-', '')}) 0%, transparent 60%)` }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-15 bg-[radial-gradient(circle,#06b6d4_0%,transparent_60%)] animate-[drift_40s_infinite_linear_alternate-reverse]" />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 w-full relative z-10 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'دسته‌بندی‌ها ', href: '/categories' },
            { label: categoryData.title } 
          ]} 
        />

        <section className={`glass-card relative overflow-hidden p-8 md:p-12 group border-t-2 border-t-[#10b981] animate-[fadeIn_0.5s_ease-out] rounded-3xl`}>
          <div className="absolute left-0 top-0 w-1/2 h-full bg-[#10b981]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-20">
            
            {/* دایره آیکون با افکت هاور بزرگ‌نمایی */}
            <div className="flex-shrink-0 relative group/icon">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-deep-surface flex items-center justify-center relative">
                <Icon 
                    name={titleIcon} 
                    className="w-16 h-16 text-[#10b981] transition-transform duration-300 group-hover/icon:scale-110" 
                />
              </div>
            </div>

            {/* اطلاعات متنی */}
            <div className="flex-grow text-center md:text-right mt-4 md:mt-0">
              
              <div className="flex justify-center md:justify-start mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full text-xs font-bold text-[#10b981] tracking-widest shadow-sm">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_10px_currentColor]"></span>
                  </span>
                  {badgeLabel}
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
                {categoryData.title}
              </h1>
              
              <div className="rich-text text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl font-light text-justify mx-auto md:mx-0">
                <p>{categoryData.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8 border-t border-white/10 pt-6">
                {categoryData.stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col items-center md:items-start">
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-gray-500 font-sans">{stat.label}</span>
                  </div>
                ))}
                <div className="w-px h-8 bg-white/10 hidden md:block"></div>
              </div>
            </div>
          </div>
        </section>

        {/* گرید محتوا با فیلتر */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center md:text-right">محتوای بایگانی شده</h2>
              <p className="text-sm text-gray-400 font-light text-center md:text-right">مستندات، مقالات و اسناد خام مرتبط</p>
            </div>
            
            <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full hide-scroll">
              {[
                { id: 'all', label: 'همه موارد' },
                { id: 'raw', label: 'محتوای راش و فوتیج' },
                { id: 'produced', label: 'محتوای تولیدی' },
                { id: 'tools', label: 'ابزارها' },
                { id: 'article', label: 'بلاگ' }
              ].map(filter => (
                <button 
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${activeFilter === filter.id ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* رندر گرید یا حالت خالی استاندارد (EmptyState) بر اساس تب فعال */}
          {filteredItems.length === 0 ? (
            <EmptyState 
              icon={
                activeFilter === 'raw' ? 'folder' :
                activeFilter === 'produced' ? 'video' :
                activeFilter === 'tools' ? 'pen-nib' :
                activeFilter === 'article' ? 'article' : 'search'
              }
              title={
                activeFilter === 'all' ? 'هیچ محتوایی در این بخش ثبت نشده است' :
                activeFilter === 'raw' ? 'محتوای خامی برای این برچسب وجود ندارد' :
                activeFilter === 'produced' ? 'محتوای تولیدی در این دسته یافت نشد' :
                activeFilter === 'tools' ? 'ابزاری مرتبط با این موضوع ارائه نشده است' : 'مقاله‌ای در این بخش وجود ندارد'
              }
              description="به محض انتشار و دسته‌بندی اسناد جدید توسط پژوهشگران مدار، اطلاعات مربوطه در این بخش قابل مشاهده خواهند بود."
              actionText="نمایش همه موارد"
              onAction={() => setActiveFilter('all')}
              color="text-[#10b981]"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.4s_ease-out]">
              {filteredItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="flex justify-center pt-8">
              <button className="relative group bg-white/5 border border-white/10 text-white px-10 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer">
                <span>بارگذاری موارد بیشتر</span>
                <Icon name="caretDown" className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}