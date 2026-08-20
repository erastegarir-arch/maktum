'use client';
import { useState, useMemo, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import Icon from '../../components/Icon'; 
import BlurImage from '../../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// === تابع تبدیل اعداد انگلیسی به فارسی ===
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// === ۱. دیتای نمایشی و محتوای قابل ویرایش در پنل ادمین ===
const pageContent = {
  hero: {
    badge: "بایگانی مرجع مدار",
    title: "کاوش در بایگانی مدار",
    highlightColor: "text-[#3b82f6]", // رنگ آبی اختصاصی
    description: "جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
  }
};

const MOCK_HASHTAGS = Array.from({length: 40}, (_, i) => ({  
  id: i,  
  text: `کلیدواژه_${toPersianDigits(i+1)}`,  
  count: ((i * 37) % 450) + 10 
})).sort((a,b) => b.count - a.count);

const PREFIXES = ['تاریخ', 'معماری', 'علوم غریبه', 'رسانه', 'سیاست', 'اقتصاد'];
const MOCK_CATEGORIES = Array.from({length: 20}, (_, i) => ({  
  id: i,  
  title: `${PREFIXES[i % PREFIXES.length]} ${toPersianDigits(i+1)}`,  
  count: ((i * 19) % 150) + 1 
}));

const MOCK_CREATORS = Array.from({length: 24}, (_, i) => ({
  id: i,  
  name: `پژوهشگر ${toPersianDigits(i+1)}`,  
  avatar: `/images/creator-${(i % 6) + 1}.jpg` 
}));

// === ۲. کامپوننت پایه اسکلتون با افکت Shimmer (گرافیک کلی1) ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState('hashtags');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [catSort, setCatSort] = useState('count'); 
  const [creatorSort, setCreatorSort] = useState('newest'); 

  // === استیت لودینگ برای اسکلتون ===
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی دریافت داده هنگام تغییر تب یا بارگذاری اولیه
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // نمایش اسکلتون برای ۱ ثانیه
    return () => clearTimeout(timer);
  }, [activeTab]);

  // تغییر تب و پاک کردن کادر جستجو
  const handleTabSwitch = (tab) => {
    if(activeTab === tab) return;
    setActiveTab(tab);
    setSearchQuery('');
  };

  // تعیین Placeholder داینامیک
  const getSearchPlaceholder = () => {
    if (activeTab === 'hashtags') return "جستجو در هشتگ‌ها...";
    if (activeTab === 'categories') return "جستجو در دسته‌بندی‌ها...";
    return "جستجوی نام پدیدآورنده...";
  };

  // === فیلتر و مرتب‌سازی داده‌ها ===
  const filteredHashtags = useMemo(() => {
    return MOCK_HASHTAGS.filter(h => h.text.includes(searchQuery));
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    let result = MOCK_CATEGORIES.filter(c => c.title.includes(searchQuery));
    if (catSort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
    } else {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [searchQuery, catSort]);

  const filteredCreators = useMemo(() => {
    let result = MOCK_CREATORS.filter(c => c.name.includes(searchQuery));
    if (creatorSort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    } else {
      result.sort((a, b) => b.id - a.id);  
    }
    return result;
  }, [searchQuery, creatorSort]);

  const maxHashtagCount = Math.max(...filteredHashtags.map(h => h.count), 1);
  const minHashtagCount = Math.min(...filteredHashtags.map(h => h.count), 0);

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'بایگانی و دسته‌بندی‌ها' }
          ]} 
        />

        {/* هدر صفحه (گرافیک کلی1) */}
        <section className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden flex flex-col justify-center items-center text-center shadow-2xl animate-[fadeIn_0.5s_ease-out] group">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-90 pointer-events-none z-20" />
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-full text-xs font-bold text-[#3b82f6] tracking-widest shadow-inner">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
               <span className={pageContent.hero.highlightColor}>{pageContent.hero.title}</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* نوار تب‌ها و جستجو (گرافیک کلی1) */}
        <div className="relative rounded-2xl border border-white/10 p-4 flex flex-col md:flex-row gap-6 justify-between items-center z-20 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 pointer-events-none z-20" />
          
          <div className="flex bg-[#080c16] p-1.5 rounded-full border border-white/5 overflow-x-auto w-full md:w-auto hide-scroll relative z-10 shadow-inner">
            <button 
              onClick={() => handleTabSwitch('hashtags')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${activeTab === 'hashtags' ? 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon name="hash" className="w-4 h-4" /> هشتگ‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('categories')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${activeTab === 'categories' ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon name="folder" className="w-4 h-4" /> دسته‌بندی‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('creators')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${activeTab === 'creators' ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon name="users" className="w-4 h-4" /> پدیدآورندگان
            </button>
          </div>

          <div className="relative w-full md:w-96 flex-shrink-0 z-10">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-[#080c16] border border-white/10 rounded-full py-3 px-12 text-sm outline-none focus:border-white/30 focus:bg-white/5 transition-all text-white placeholder-gray-500 shadow-inner"
            />
            <Icon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* پنل ۱: هشتگ‌ها (طراحی خلاقانه و GKS1) */}
        {activeTab === 'hashtags' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="relative rounded-3xl border border-white/10 p-8 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-70 pointer-events-none z-20" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/10 pb-4 gap-4 relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icon name="trend" className="w-6 h-6 text-[#a855f7]" /> ابر کلیدواژه‌ها
                </h2>
                {!isLoading && (
                  <span className="text-xs text-gray-400 font-sans bg-[#080c16] border border-white/10 px-4 py-2 rounded-full shadow-inner">
                    <span className="text-[#a855f7] font-bold">{toPersianDigits(filteredHashtags.length)}</span> هشتگ یافت شد
                  </span>
                )}
              </div>
              
              {isLoading ? (
                /* اسکلتون هشتگ‌ها با افکت Shimmer */
                <div className="flex flex-wrap justify-center items-center gap-4 p-6 relative z-10">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <BaseSkeleton key={i} className={`h-10 ${['w-24', 'w-32', 'w-20', 'w-36', 'w-28'][i % 5]}`} rounded="rounded-2xl" />
                  ))}
                </div>
              ) : filteredHashtags.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10 relative z-10">موردی یافت نشد.</p>
              ) : (
                /* نمایش خلاقانه هشتگ‌ها به صورت Glass Pills با رنگ‌های حرارتی */
                <div className="flex flex-wrap justify-center items-center gap-4 p-4 relative z-10">
                  {filteredHashtags.map(hashtag => {
                    const ratio = (hashtag.count - minHashtagCount) / (maxHashtagCount - minHashtagCount || 1);
                    
                    const isHigh = ratio > 0.6;
                    const isMedium = ratio > 0.2 && ratio <= 0.6;

                    const baseClasses = "relative group/tag flex items-center gap-2 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md shadow-lg hover:-translate-y-1 hover:shadow-2xl";
                    const sizeClasses = isHigh ? "px-5 py-2.5 text-base" : isMedium ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
                    const colorClasses = isHigh
                      ? "border-[#a855f7]/50 bg-[#a855f7]/15 text-white hover:border-[#a855f7] hover:bg-[#a855f7]/25"
                      : isMedium
                        ? "border-white/20 bg-white/5 text-gray-200 hover:border-white/40 hover:bg-white/10"
                        : "border-white/10 bg-[#080c16]/50 text-gray-400 hover:text-gray-200 hover:border-white/30 hover:bg-[#080c16]";

                    return (
                      <a key={hashtag.id} href={`/tag/${hashtag.text}`} className={cn(baseClasses, sizeClasses, colorClasses)}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none" />
                        <Icon name="hash" className={cn("shrink-0 transition-colors", isHigh ? "w-5 h-5 text-[#a855f7]" : "w-4 h-4 opacity-70 group-hover/tag:text-white")} />
                        <span className="font-bold whitespace-nowrap">{hashtag.text}</span>
                        <span className={cn(
                          "font-sans rounded-lg px-2 py-0.5 flex items-center justify-center border transition-colors",
                          isHigh ? "bg-[#a855f7]/20 border-[#a855f7]/30 text-[#e9d5ff]" : "bg-black/50 border-white/10 text-gray-400 group-hover/tag:text-white"
                        )}>
                          {toPersianDigits(hashtag.count)}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
              
              {!isLoading && (
                <div className="text-center mt-12 relative z-10">
                  <button className="bg-[#080c16] hover:bg-[#a855f7]/10 border border-white/10 hover:border-[#a855f7]/50 text-gray-300 hover:text-[#a855f7] px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] cursor-pointer">
                    نمایش هشتگ‌های بیشتر
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* پنل ۲: دسته‌بندی‌ها (گرافیک کلی1) */}
        {activeTab === 'categories' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="folder" className="w-6 h-6 text-[#f59e0b]" /> فهرست دسته‌بندی‌ها
              </h2>
              
              <div className="flex gap-2 bg-[#080c16] p-1 rounded-xl border border-white/10 shadow-inner">
                <button 
                  onClick={() => setCatSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${catSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCatSort('count')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${catSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              /* اسکلتون دسته‌بندی‌ها با افکت Shimmer و GKS1 */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative p-6 flex flex-col justify-between h-32 rounded-3xl border border-white/10 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                    <BaseSkeleton className="h-5 w-1/2" rounded="rounded-md" />
                    <div className="flex justify-between items-end mt-4">
                      <BaseSkeleton className="w-6 h-6" rounded="rounded-md" />
                      <BaseSkeleton className="h-6 w-20" rounded="rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
               <div className="relative rounded-3xl border border-white/10 p-10 overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                 <p className="text-gray-500 text-sm text-center relative z-10">موردی یافت نشد.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map(cat => (
                  <a key={cat.id} href={`/tag/${cat.title}`} className="relative group flex flex-col justify-between h-32 p-6 rounded-3xl border border-white/10 hover:border-[#f59e0b]/50 hover:-translate-y-1.5 transition-all duration-400 overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] cursor-pointer">
                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#f59e0b]/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/15 transition-colors -z-10"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-base font-bold text-white group-hover:text-[#f59e0b] transition-colors truncate">{cat.title}</h3>
                    </div>
                    <div className="relative z-10 flex justify-between items-end mt-4">
                      <Icon name="folder" className="w-6 h-6 text-gray-500 group-hover:text-[#f59e0b] transition-colors" />
                      <span className="text-xs text-gray-300 font-sans bg-[#080c16] border border-white/10 px-3 py-1.5 rounded-xl shadow-inner">{toPersianDigits(cat.count)} محتوا</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {!isLoading && (
              <div className="text-center mt-12">
                <button className="bg-[#080c16] hover:bg-[#f59e0b]/10 border border-white/10 hover:border-[#f59e0b]/50 text-gray-300 hover:text-[#f59e0b] px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer">
                  نمایش دسته‌بندی‌های بیشتر
                </button>
              </div>
            )}
          </div>
        )}

        {/* پنل ۳: پدیدآورندگان (گرافیک کلی1) */}
        {activeTab === 'creators' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="users" className="w-6 h-6 text-[#10b981]" /> نمایه پدیدآورندگان
              </h2>
              
              <div className="flex gap-2 bg-[#080c16] p-1 rounded-xl border border-white/10 shadow-inner">
                <button 
                  onClick={() => setCreatorSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${creatorSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCreatorSort('newest')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${creatorSort === 'newest' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >تازه‌ترین‌ها</button>
              </div>
            </div>
            
            {isLoading ? (
              /* اسکلتون پدیدآورندگان با افکت Shimmer و GKS1 */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="relative p-6 flex flex-col items-center text-center gap-3 h-[140px] rounded-3xl border border-white/10 overflow-hidden shadow-lg justify-center">
                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                    <BaseSkeleton className="w-16 h-16 shadow-lg" rounded="rounded-full" />
                    <BaseSkeleton className="h-4 w-3/4 mt-2" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
               <div className="relative rounded-3xl border border-white/10 p-10 overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                 <p className="text-gray-500 text-sm text-center relative z-10">موردی یافت نشد.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredCreators.map(creator => (
                  <a key={creator.id} href={`/creator/${creator.id}`} className="relative group flex flex-col items-center text-center gap-3 p-6 rounded-3xl border border-white/10 hover:border-[#10b981]/50 hover:-translate-y-1.5 transition-all duration-400 overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] cursor-pointer">
                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#10b981]/5 rounded-full blur-2xl group-hover:bg-[#10b981]/15 transition-colors -z-10"></div>
                    
                    <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#10b981] transition-colors shadow-lg flex items-center justify-center bg-gray-900">
                      <BlurImage src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 mt-2 w-full">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors line-clamp-1 w-full">{creator.name}</h3>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {!isLoading && (
              <div className="text-center mt-12">
                <button className="bg-[#080c16] hover:bg-[#10b981]/10 border border-white/10 hover:border-[#10b981]/50 text-gray-300 hover:text-[#10b981] px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer">
                  نمایش پدیدآورندگان بیشتر
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}