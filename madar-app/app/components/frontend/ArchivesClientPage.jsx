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
    <div className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function ArchivesClientPage({ pageContent, hashtags = [], categories = [], creators = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'hashtags');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [hashtagSort, setHashtagSort] = useState('count');
  const [catSort, setCatSort] = useState('count'); 
  const [creatorSort, setCreatorSort] = useState('count'); 

  const [isLoading, setIsLoading] = useState(true);

  // === مقادیر اولیه برای سیستم «نمایش بیشتر» ===
  const INITIAL_HASHTAGS = 30;
  const INITIAL_CATEGORIES = 12;
  const INITIAL_CREATORS = 15;

  const [visibleHashtags, setVisibleHashtags] = useState(INITIAL_HASHTAGS);
  const [visibleCategories, setVisibleCategories] = useState(INITIAL_CATEGORIES);
  const [visibleCreators, setVisibleCreators] = useState(INITIAL_CREATORS);

  // شبیه‌سازی لودینگ هنگام تغییر تب
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); 
    return () => clearTimeout(timer);
  }, [activeTab]);

  // ریست کردن تعداد نمایش با هر بار تغییر تب یا جستجو
  useEffect(() => {
    setVisibleHashtags(INITIAL_HASHTAGS);
    setVisibleCategories(INITIAL_CATEGORIES);
    setVisibleCreators(INITIAL_CREATORS);
  }, [searchQuery, activeTab]);

  const handleTabSwitch = (tab) => {
    if(activeTab === tab) return;
    setActiveTab(tab);
    setSearchQuery('');
    router.replace(`/t?tab=${tab}`, { scroll: false });
  };

  const getSearchPlaceholder = () => {
    if (activeTab === 'hashtags') return "جستجو در هشتگ‌ها...";
    if (activeTab === 'categories') return "جستجو در دسته‌‌بندی‌ها...";
    return "جستجوی نام پدیدآورنده...";
  };

  // === فیلتر و مرتب‌سازی داده‌ها ===
  const filteredHashtags = useMemo(() => {
    let result = hashtags.filter(h => h.text.includes(searchQuery));
    if (hashtagSort === 'alpha') {
      result.sort((a, b) => a.text.localeCompare(b.text, 'fa'));
    } else {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [searchQuery, hashtagSort, hashtags]);

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
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [searchQuery, creatorSort, creators]);

  // === کامپوننت مشترک برای نمایش استیت خالی (موردی یافت نشد) ===
  const renderEmptyState = () => (
    <div className="flex flex-col justify-center items-center py-16 md:py-24 animate-[fadeIn_0.5s_ease-out] w-full">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-inner">
        <Icon name="search" className="w-8 h-8 md:w-10 md:h-10 text-gray-600 opacity-60" />
      </div>
      <p className="text-gray-400 text-sm md:text-base font-bold font-sans tracking-wide">نتیجه‌ای یافت نشد.</p>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-10 md:pb-20 w-full relative z-10 pt-0">
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'بایگانی و دسته‌بندی‌ها' }
          ]} 
        />

        {/* ================= هدر صفحه ================= */}
        <section className="relative rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col justify-center items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent animate-[fadeIn_0.5s_ease-out] group bg-white/[0.02] backdrop-blur-2xl">
          {/* افکت گلس‌مورفیسم شفاف بدون تیرگی پس‌زمینه (استایل مشابه صفحه همکاری) */}
          <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-90 pointer-events-none z-20" />
          
          {/* هاله نور ملایم مرکزی متناسب با رنگ دسته‌بندی‌ها */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-[#3b82f6]/10 rounded-full blur-[60px] pointer-events-none -z-10"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 bg-[#0b0f19]/50 border border-white/5 rounded-full text-[10px] md:text-xs font-bold text-[#3b82f6] tracking-widest shadow-inner font-sans mb-4 md:mb-5 transition-colors group-hover:border-[#3b82f6]/30">
              <span className="relative flex h-2 w-2 md:h-3 md:w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></span>
              </span>
              {pageContent.hero.badge}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400 font-sans">
               <span className={pageContent.hero.highlightColor || "text-[#3b82f6]"}>{pageContent.hero.title}</span>
            </h1>

            <div className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify [text-align-last:center] w-full px-1 md:px-0 space-y-3 md:space-y-4 font-sans">
              <p suppressHydrationWarning>{pageContent.hero.description}</p>
            </div>
            
          </div>
        </section>

        {/* نوار تب‌ها و جستجو */}
        <div className="relative rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-center z-20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 pointer-events-none z-20" />
          
          <div className="w-full lg:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] p-1.5 rounded-full w-max lg:w-auto relative z-10">
              <button 
                onClick={() => handleTabSwitch('hashtags')} 
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'hashtags' ? 'bg-[#a855f7]/20 text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon name="hash" className="w-3.5 h-3.5 md:w-4 md:h-4" /> هشتگ‌ها
              </button>
              <button 
                onClick={() => handleTabSwitch('categories')} 
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'categories' ? 'bg-[#f59e0b]/20 text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon name="folder" className="w-3.5 h-3.5 md:w-4 md:h-4" /> دسته‌بندی‌ها
              </button>
              <button 
                onClick={() => handleTabSwitch('creators')} 
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border border-transparent font-sans ${activeTab === 'creators' ? 'bg-[#10b981]/20 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon name="users" className="w-3.5 h-3.5 md:w-4 md:h-4" /> پدیدآورندگان
              </button>
            </div>
          </div>

          <div className="relative w-full lg:w-96 flex-shrink-0 z-10">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-full py-3 px-10 md:py-3.5 md:px-12 text-xs md:text-sm outline-none focus:bg-white/10 transition-all text-white placeholder-gray-400 font-sans"
            />
            <Icon name="search" className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </div>
        </div>

        {/* ================= پنل ۱: هشتگ‌ها ================= */}
        {activeTab === 'hashtags' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 font-sans">
                  <Icon name="trend" className="w-5 h-5 md:w-6 md:h-6 text-[#a855f7]" /> لیست هشتگ‌ها
                </h2>
              </div>
              
              <div className="flex gap-2 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] p-1 md:p-1.5 rounded-xl w-full sm:w-auto">
                <button 
                  onClick={() => setHashtagSort('alpha')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${hashtagSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setHashtagSort('count')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${hashtagSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-wrap justify-center items-center gap-2.5 md:gap-4 relative z-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <BaseSkeleton key={i} className={`h-8 md:h-10 ${['w-20 md:w-24', 'w-24 md:w-32', 'w-16 md:w-20', 'w-28 md:w-36', 'w-20 md:w-28'][i % 5]}`} rounded="rounded-xl md:rounded-2xl" />
                ))}
              </div>
            ) : filteredHashtags.length === 0 ? (
               renderEmptyState()
            ) : (
              <>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 relative z-10">
                  {filteredHashtags.slice(0, visibleHashtags).map(hashtag => {
                    return (
                      <a 
                        key={hashtag.id} 
                        href={`/t/${hashtag.slug}`} 
                        className="relative group/tag flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-xl md:rounded-2xl border border-white/[0.05] bg-white/[0.03] text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(168,85,247,0.2)] font-sans"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none" />
                        <Icon name="hash" className="shrink-0 transition-colors w-3.5 h-3.5 md:w-4 md:h-4 opacity-70 group-hover/tag:text-[#a855f7]" />
                        <span className="font-bold whitespace-nowrap">{hashtag.text}</span>
                        <span className="font-sans rounded-md md:rounded-lg px-1.5 py-0.5 md:px-2 md:py-0.5 flex items-center justify-center border border-transparent shadow-inner transition-colors bg-black/40 text-gray-400 group-hover/tag:text-white">
                          {toPersianDigits(hashtag.count)}
                        </span>
                      </a>
                    );
                  })}
                </div>
                {/* دکمه نمایش بیشتر */}
                {filteredHashtags.length > visibleHashtags && (
                  <div className="flex justify-center mt-8 md:mt-12">
                    <button
                      onClick={() => setVisibleHashtags(prev => prev + INITIAL_HASHTAGS)}
                      className="px-6 py-2 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-bold bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#a855f7]/20 hover:border-[#a855f7]/50 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-gray-300 transition-all font-sans cursor-pointer"
                    >
                      نمایش بیشتر
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= پنل ۲: دسته‌بندی‌ها ================= */}
        {activeTab === 'categories' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 font-sans">
                <Icon name="folder" className="w-5 h-5 md:w-6 md:h-6 text-[#f59e0b]" /> فهرست دسته‌‌بندی‌ها
              </h2>
              
              <div className="flex gap-2 bg-white/5 border border-transparent p-1 md:p-1.5 rounded-xl shadow-inner w-full sm:w-auto">
                <button 
                  onClick={() => setCatSort('alpha')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${catSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCatSort('count')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${catSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative p-5 md:p-6 flex flex-col justify-between h-28 md:h-32 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <BaseSkeleton className="h-4 md:h-5 w-1/2" rounded="rounded-md" />
                    <div className="flex justify-between items-end mt-4">
                      <BaseSkeleton className="w-5 h-5 md:w-6 md:h-6" rounded="rounded-md" />
                      <BaseSkeleton className="h-5 md:h-6 w-16 md:w-20" rounded="rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
               renderEmptyState()
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredCategories.slice(0, visibleCategories).map(cat => (
                    <a key={cat.id} href={`/t/${cat.slug}`} className="relative group flex flex-col justify-between h-28 md:h-32 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-transparent transition-all duration-400 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 md:hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.3)] cursor-pointer">
                      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                      <div className="absolute -right-6 -top-6 md:-right-10 md:-top-10 w-20 h-20 md:w-24 md:h-24 bg-[#f59e0b]/5 rounded-full blur-xl md:blur-2xl group-hover:bg-[#f59e0b]/15 transition-colors -z-10"></div>
                      
                      <div className="relative z-10">
                        <h3 className="text-sm md:text-base font-bold text-white group-hover:text-[#f59e0b] transition-colors truncate font-sans">{cat.title}</h3>
                      </div>
                      <div className="relative z-10 flex justify-between items-end mt-4">
                        <Icon name="folder" className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-[#f59e0b] transition-colors" />
                        <span className="text-[10px] md:text-xs text-white font-bold font-sans bg-white/10 border border-transparent px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl shadow-inner">{toPersianDigits(cat.count)} محتوا</span>
                      </div>
                    </a>
                  ))}
                </div>
                {/* دکمه نمایش بیشتر */}
                {filteredCategories.length > visibleCategories && (
                  <div className="flex justify-center mt-8 md:mt-12">
                    <button
                      onClick={() => setVisibleCategories(prev => prev + INITIAL_CATEGORIES)}
                      className="px-6 py-2 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-bold bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#f59e0b]/20 hover:border-[#f59e0b]/50 hover:text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] text-gray-300 transition-all font-sans cursor-pointer"
                    >
                      نمایش بیشتر
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= پنل ۳: پدیدآورندگان ================= */}
        {activeTab === 'creators' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 font-sans">
                <Icon name="users" className="w-5 h-5 md:w-6 md:h-6 text-[#10b981]" /> نمایه پدیدآورندگان
              </h2>
              
              <div className="flex gap-2 bg-white/5 border border-transparent p-1 md:p-1.5 rounded-xl shadow-inner w-full sm:w-auto">
                <button 
                  onClick={() => setCreatorSort('alpha')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${creatorSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCreatorSort('count')} 
                  className={`flex-1 sm:flex-none text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors cursor-pointer font-sans ${creatorSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="relative p-4 md:p-6 flex flex-col items-center text-center gap-2 md:gap-3 h-[120px] md:h-[140px] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent justify-center">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <BaseSkeleton className="w-12 h-12 md:w-16 md:h-16 shadow-inner" rounded="rounded-full" />
                    <BaseSkeleton className="h-3 md:h-4 w-3/4 mt-1 md:mt-2" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
               renderEmptyState()
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {filteredCreators.slice(0, visibleCreators).map(creator => (
                    <a key={creator.id} href={`/t/${creator.slug}`} className="relative group flex flex-col items-center text-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-transparent transition-all duration-400 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 md:hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] cursor-pointer">
                      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                      <div className="absolute -left-6 -bottom-6 md:-left-10 md:-bottom-10 w-20 h-20 md:w-24 md:h-24 bg-[#10b981]/5 rounded-full blur-xl md:blur-2xl group-hover:bg-[#10b981]/15 transition-colors -z-10"></div>
                      
                      <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-transparent shadow-inner group-hover:border-[#10b981]/50 transition-colors flex items-center justify-center bg-black/40">
                        {creator.avatar ? (
                          <BlurImage src={creator.avatar} alt={creator.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                           <Icon name="user" className="w-6 h-6 md:w-8 md:h-8 text-gray-400 group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <div className="relative z-10 mt-1 md:mt-2 w-full flex flex-col items-center gap-1 md:gap-1.5">
                        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-[#10b981] transition-colors line-clamp-1 w-full font-sans">{creator.name}</h3>
                        <span className="text-[9px] md:text-[10px] text-white font-bold font-sans bg-white/10 border border-transparent px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg shadow-inner">{toPersianDigits(creator.count)} اثر</span>
                      </div>
                    </a>
                  ))}
                </div>
                {/* دکمه نمایش بیشتر */}
                {filteredCreators.length > visibleCreators && (
                  <div className="flex justify-center mt-8 md:mt-12">
                    <button
                      onClick={() => setVisibleCreators(prev => prev + INITIAL_CREATORS)}
                      className="px-6 py-2 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-bold bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#10b981]/20 hover:border-[#10b981]/50 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-gray-300 transition-all font-sans cursor-pointer"
                    >
                      نمایش بیشتر
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}