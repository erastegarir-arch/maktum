'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs'; 
import Icon from '@/app/components/Icon'; 
import BlurImage from '@/app/components/BlurImage'; 
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// === تابع تبدیل اعداد انگلیسی به فارسی ===
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// === کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-transparent shadow-inner backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function ArchivesClientPage({ pageContent, hashtags = [], categories = [], creators = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ۱. بررسی پارامتر URL برای باز کردن هوشمند تب (مثلاً ?tab=creators)
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'hashtags');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [catSort, setCatSort] = useState('count'); 
  const [creatorSort, setCreatorSort] = useState('newest'); 

  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی لودینگ هنگام تغییر تب
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); 
    return () => clearTimeout(timer);
  }, [activeTab]);

  // ۲. همگام‌سازی URL هنگام کلیک کاربر روی تب‌ها
  const handleTabSwitch = (tab) => {
    if(activeTab === tab) return;
    setActiveTab(tab);
    setSearchQuery('');
    // تغییر URL بدون رفرش صفحه برای اشتراک‌گذاری راحت‌تر
    router.replace(`/t?tab=${tab}`, { scroll: false });
  };

  const getSearchPlaceholder = () => {
    if (activeTab === 'hashtags') return "جستجو در هشتگ‌ها...";
    if (activeTab === 'categories') return "جستجو در دسته‌بندی‌ها...";
    return "جستجوی نام پدیدآورنده...";
  };

  // === فیلتر و مرتب‌سازی داده‌های واقعی ===
  const filteredHashtags = useMemo(() => {
    return hashtags.filter(h => h.text.includes(searchQuery)).sort((a,b) => b.count - a.count);
  }, [searchQuery, hashtags]);

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c => c.title.includes(searchQuery));
    if (catSort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
    } else {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [searchQuery, catSort, categories]);

  const filteredCreators = useMemo(() => {
    let result = creators.filter(c => c.name.includes(searchQuery));
    if (creatorSort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    } else {
      // تازه‌ترین‌ها بر اساس ID (چون ID بزرگتر مساوی ثبت جدیدتر است)
      result.sort((a, b) => b.id - a.id);  
    }
    return result;
  }, [searchQuery, creatorSort, creators]);

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

        {/* هدر صفحه (داینامیک شده از دیتابیس/سرور) */}
        <section className="relative rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col justify-center items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent animate-[fadeIn_0.5s_ease-out] group">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-90 pointer-events-none z-20" />
          
          {/* ============= اصلاحیه افکت نقطه نقطه (تراکم بیشتر و وضوح بالاتر) ============= */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none -z-10"></div>
          {/* ==================================================================== */}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-full text-xs font-bold text-[#3b82f6] tracking-widest shadow-inner font-sans">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2 font-sans">
               <span className={pageContent.hero.highlightColor}>{pageContent.hero.title}</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify font-sans">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* نوار تب‌ها و جستجو */}
        <div className="relative rounded-3xl p-4 flex flex-col md:flex-row gap-6 justify-between items-center z-20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 pointer-events-none z-20" />
          
          <div className="flex bg-white/5 border border-transparent p-1.5 rounded-full overflow-x-auto w-full md:w-auto hide-scroll relative z-10 shadow-inner">
            <button 
              onClick={() => handleTabSwitch('hashtags')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'hashtags' ? 'bg-[#a855f7]/20 text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon name="hash" className="w-4 h-4" /> هشتگ‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('categories')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'categories' ? 'bg-[#f59e0b]/20 text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon name="folder" className="w-4 h-4" /> دسته‌بندی‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('creators')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'creators' ? 'bg-[#10b981]/20 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
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
              className="w-full bg-white/10 border border-transparent shadow-inner rounded-full py-3.5 px-12 text-sm outline-none focus:bg-white/20 transition-all text-white placeholder-gray-400 font-sans"
            />
            <Icon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* پنل ۱: هشتگ‌ها */}
        {activeTab === 'hashtags' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="relative rounded-3xl p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-70 pointer-events-none z-20" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/5 pb-4 gap-4 relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
                  <Icon name="trend" className="w-6 h-6 text-[#a855f7]" /> ابر کلیدواژه‌ها
                </h2>
                {!isLoading && (
                  <span className="text-xs text-gray-400 font-sans bg-white/10 border border-transparent px-4 py-2 rounded-full shadow-inner">
                    <span className="text-[#a855f7] font-bold">{toPersianDigits(filteredHashtags.length)}</span> هشتگ یافت شد
                  </span>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex flex-wrap justify-center items-center gap-4 p-6 relative z-10">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <BaseSkeleton key={i} className={`h-10 ${['w-24', 'w-32', 'w-20', 'w-36', 'w-28'][i % 5]}`} rounded="rounded-2xl" />
                  ))}
                </div>
              ) : filteredHashtags.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10 relative z-10 font-sans">موردی یافت نشد.</p>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-4 p-4 relative z-10">
                  {filteredHashtags.map(hashtag => {
                    const ratio = (hashtag.count - minHashtagCount) / (maxHashtagCount - minHashtagCount || 1);
                    const isHigh = ratio > 0.6;
                    const isMedium = ratio > 0.2 && ratio <= 0.6;

                    const baseClasses = "relative group/tag flex items-center gap-2 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md shadow-inner hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] font-sans";
                    const sizeClasses = isHigh ? "px-5 py-2.5 text-base" : isMedium ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
                    const colorClasses = isHigh
                      ? "border-transparent bg-[#a855f7]/20 text-white hover:brightness-110"
                      : isMedium
                        ? "border-transparent bg-white/10 text-white hover:bg-white/20"
                        : "border-transparent bg-white/5 text-gray-400 hover:text-white hover:bg-white/10";

                    return (
                      <a key={hashtag.id} href={`/t/${hashtag.slug}`} className={cn(baseClasses, sizeClasses, colorClasses)}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none" />
                        <Icon name="hash" className={cn("shrink-0 transition-colors", isHigh ? "w-5 h-5 text-[#a855f7]" : "w-4 h-4 opacity-70 group-hover/tag:text-white")} />
                        <span className="font-bold whitespace-nowrap">{hashtag.text}</span>
                        <span className={cn(
                          "font-sans rounded-lg px-2 py-0.5 flex items-center justify-center border border-transparent shadow-inner transition-colors",
                          isHigh ? "bg-[#a855f7]/30 text-white" : "bg-black/40 text-gray-300 group-hover/tag:text-white"
                        )}>
                          {toPersianDigits(hashtag.count)}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* پنل ۲: دسته‌بندی‌ها */}
        {activeTab === 'categories' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
                <Icon name="folder" className="w-6 h-6 text-[#f59e0b]" /> فهرست دسته‌بندی‌ها
              </h2>
              
              <div className="flex gap-2 bg-white/5 border border-transparent p-1.5 rounded-xl shadow-inner">
                <button 
                  onClick={() => setCatSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer font-sans ${catSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCatSort('count')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer font-sans ${catSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative p-6 flex flex-col justify-between h-32 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <BaseSkeleton className="h-5 w-1/2" rounded="rounded-md" />
                    <div className="flex justify-between items-end mt-4">
                      <BaseSkeleton className="w-6 h-6" rounded="rounded-md" />
                      <BaseSkeleton className="h-6 w-20" rounded="rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
               <div className="relative rounded-3xl p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                 <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                 <p className="text-gray-400 text-sm text-center relative z-10 font-sans">موردی یافت نشد.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map(cat => (
                  <a key={cat.id} href={`/t/${cat.slug}`} className="relative group flex flex-col justify-between h-32 p-6 rounded-3xl border border-transparent transition-all duration-400 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] cursor-pointer">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#f59e0b]/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/15 transition-colors -z-10"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-base font-bold text-white group-hover:text-[#f59e0b] transition-colors truncate font-sans">{cat.title}</h3>
                    </div>
                    <div className="relative z-10 flex justify-between items-end mt-4">
                      <Icon name="folder" className="w-6 h-6 text-gray-400 group-hover:text-[#f59e0b] transition-colors" />
                      <span className="text-xs text-white font-bold font-sans bg-white/10 border border-transparent px-3 py-1.5 rounded-xl shadow-inner">{toPersianDigits(cat.count)} محتوا</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* پنل ۳: پدیدآورندگان */}
        {activeTab === 'creators' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
                <Icon name="users" className="w-6 h-6 text-[#10b981]" /> نمایه پدیدآورندگان
              </h2>
              
              <div className="flex gap-2 bg-white/5 border border-transparent p-1.5 rounded-xl shadow-inner">
                <button 
                  onClick={() => setCreatorSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer font-sans ${creatorSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCreatorSort('newest')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer font-sans ${creatorSort === 'newest' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >تازه‌ترین‌ها</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="relative p-6 flex flex-col items-center text-center gap-3 h-[140px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent justify-center">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <BaseSkeleton className="w-16 h-16 shadow-inner" rounded="rounded-full" />
                    <BaseSkeleton className="h-4 w-3/4 mt-2" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
               <div className="relative rounded-3xl p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                 <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                 <p className="text-gray-400 text-sm text-center relative z-10 font-sans">موردی یافت نشد.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredCreators.map(creator => (
                  <a key={creator.id} href={`/t/${creator.slug}`} className="relative group flex flex-col items-center text-center gap-3 p-6 rounded-3xl border border-transparent transition-all duration-400 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] cursor-pointer">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#10b981]/5 rounded-full blur-2xl group-hover:bg-[#10b981]/15 transition-colors -z-10"></div>
                    
                    <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border border-transparent shadow-inner group-hover:border-[#10b981]/50 transition-colors flex items-center justify-center bg-black/40">
                      {creator.avatar ? (
                        <BlurImage src={creator.avatar} alt={creator.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                         <Icon name="user" className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <div className="relative z-10 mt-2 w-full flex flex-col items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors line-clamp-1 w-full font-sans">{creator.name}</h3>
                      <span className="text-[10px] text-white font-bold font-sans bg-white/10 border border-transparent px-3 py-1 rounded-lg shadow-inner">{toPersianDigits(creator.count)} اثر</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}