'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/Icon'; 
import BlurImage from '@/app/components/BlurImage'; 
import { searchArchive } from '@/app/actions/search';

// ==========================================
// هوک هوشمند تاخیر (Debounce)
// جلوگیری از بمباران دیتابیس هنگام تایپ سریع
// ==========================================
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

// ==========================================
// اسکلتون لودینگ پیشرفته (Shimmer)
// ==========================================
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    // اعمال گلس‌مورفیسم به اسکلتون
    <div className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};

const BentoSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-[fadeIn_0.3s_ease-in]">
      <div className="md:col-span-2 lg:col-span-2 row-span-2 h-[280px] md:h-[350px] relative rounded-[2rem] p-4 flex flex-col justify-end overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/[0.05]">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-[2rem] pointer-events-none -z-10" />
        <BaseSkeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />
      </div>
      <div className="col-span-1 h-[200px] md:h-[250px] relative rounded-[2rem] p-4 flex flex-col justify-end overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/[0.05]">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-[2rem] pointer-events-none -z-10" />
        <BaseSkeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />
      </div>
      <div className="col-span-1 h-[200px] md:h-[250px] relative rounded-[2rem] p-4 flex flex-col justify-end overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/[0.05]">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-[2rem] pointer-events-none -z-10" />
        <BaseSkeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />
      </div>
    </div>
  );
};

// ==========================================
// آیکون مربوط به هر نوع محتوا
// ==========================================
function getIconByType(type) {
  switch (type) {
    case 'BLOG': return 'blog';
    case 'RAW': return 'footage';
    case 'PRODUCED': return 'product';
    case 'TOOL': return 'pen-nib';
    case 'DOSSIER': return 'dossiers';
    default: return 'layout';
  }
}

// ==========================================
// کامپوننت اصلی
// ==========================================
export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400); 
  
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [activeIndex, setActiveIndex] = useState(-1); 
  const resultsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      setPage(1);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleArrowKeys = (e) => {
      if (!isOpen || results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        router.push(results[activeIndex].url);
        onClose();
      }
    };
    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [isOpen, results, activeIndex, router, onClose]);

  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeElement = resultsRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const performSearch = useCallback(async (isLoadMore = false) => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const targetPage = isLoadMore ? page + 1 : 1;
    if (!isLoadMore) {
      setIsLoading(true);
      setActiveIndex(-1);
    }

    try {
      const response = await searchArchive({
        keyword: debouncedQuery,
        filters: activeFilters,
        page: targetPage,
        limit: 10 
      });

      if (response.success) {
        if (isLoadMore) {

          // ارسال آمار جستجو به ایران آنالیتیکس
        if (!isLoadMore && debouncedQuery && typeof window !== 'undefined' && window.ira && window.ira.search) {
          try {
            window.ira.search.track({
              search_term: debouncedQuery,
              search_category: 'all'
            });
          } catch (e) {
            console.error('Analytics error:', e);
          }
        }

          setResults(prev => [...prev, ...response.data]);
          setPage(targetPage);
        } else {
          setResults(response.data);
          setPage(1);
        }
        setHasMore(response.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeFilters, page]);

  useEffect(() => {
    performSearch(false);
  }, [debouncedQuery, activeFilters, performSearch]);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/90 backdrop-blur-2xl flex justify-center pt-4 md:pt-16 px-4 pb-4 animate-[fadeIn_0.3s_ease-out] font-sans text-right select-none">
      
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col max-h-full animate-[scaleIn_0.3s_ease-out] mx-auto" onClick={(e) => e.stopPropagation()}>
        
        {/* اعمال گلس‌مورفیسم به باکس اصلی مودال جستجو */}
        <div className="relative rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 overflow-hidden shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/[0.05] group bg-white/[0.02] backdrop-blur-3xl">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 z-20 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          
          {/* ۱. دکمه بستن صفحه (به داخل باکس منتقل شد تا در هیچ مانیتوری بیرون نزند) */}
          <div className="absolute top-5 left-5 md:top-8 md:left-8 z-30 group/close hidden md:block">
            <button 
              onClick={onClose} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/[0.1] shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <Icon name="close" className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            {/* ۲. تولتیپ سفارشی گلس‌مورفیسم هماهنگ با تم سایت (جایگزین title) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-gray-200 text-[10px] rounded-lg opacity-0 invisible group-hover/close:opacity-100 group-hover/close:visible transition-all whitespace-nowrap shadow-xl font-bold">
              بستن (Esc)
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10 md:pl-16">
            
            {/* ۳. کادر جستجو (متمایز شده با پس‌زمینه شیشه‌ای مستقل برای مشخص بودن محل تایپ) */}
            <div className="flex items-center gap-3 flex-1 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-2xl px-4 py-3 md:px-5 md:py-4 focus-within:bg-white/[0.07] focus-within:border-cyan-500/40 transition-all">
              <div className={query ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "text-gray-500"}>
                  <Icon name="search" className="w-6 h-6 md:w-8 md:h-8 transition-colors" />
              </div>
              
              <input 
                type="text" 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-lg md:text-2xl w-full placeholder:text-gray-500 font-black font-sans tracking-wide" 
                placeholder="در مکتوم جستجو کنید..." 
                autoComplete="off" 
              />

              {query && (
                <button onClick={() => setQuery('')} className="flex-shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-500/20 hover:bg-rose-500/80 text-gray-400 hover:text-white transition-all cursor-pointer shadow-inner">
                  {/* ۴. تغییر آیکون پاک کردن نوشته (استفاده از آیکون بسیار کوچکتر در یک دایره توپر تا با بستن مودال اشتباه نشود) */}
                  <Icon name="eraser" className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 justify-between md:justify-end mt-1 md:mt-0">
              {/* دکمه بستن مخصوص موبایل (در دسترس‌تر برای انگشت) */}
              <button onClick={onClose} className="md:hidden flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 px-4 py-2.5 rounded-xl transition-colors">
                <Icon name="close" className="w-4 h-4" /> بستن
              </button>

              {/* تولتیپ راهنمای کیبورد (طراحی گلس‌مورفیسم هماهنگ با تم) */}
              <div className="hidden lg:flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.1] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-xl text-gray-300 font-mono text-[11px] font-bold">
                <span className="bg-white/10 px-2 py-1 rounded shadow-inner">Ctrl</span> + <span className="bg-white/10 px-2 py-1 rounded shadow-inner">K</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3 mt-6 relative z-10">
            {[
              { id: 'DOSSIER', label: 'منظومه‌ها', icon: 'dossiers', color: 'text-indigo-400' },
              { id: 'PRODUCED', label: 'محتوای تولیدی', icon: 'product', color: 'text-cyan-400' },
              { id: 'RAW', label: 'محتوای راش و خام', icon: 'footage', color: 'text-amber-400' },
              { id: 'BLOG', label: 'مقالات بلاگ', icon: 'blog', color: 'text-purple-400' },
              { id: 'TOOL', label: 'ابزارها', icon: 'pen-nib', color: 'text-emerald-400' }
            ].map(filter => {
              const isActive = activeFilters.includes(filter.id);
              // اعمال گلس‌مورفیسم به دکمه‌های فیلتر
              const btnClass = isActive 
                ? "bg-white/[0.1] border-white/[0.2] text-white scale-105 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" 
                : "bg-white/[0.03] backdrop-blur-md border-white/[0.05] text-gray-400 hover:bg-white/[0.08] hover:text-white";
              
              return (
                <button 
                  key={filter.id} onClick={() => toggleFilter(filter.id)}
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer font-sans shadow-lg border ${btnClass}`}
                >
                  <Icon name={filter.icon} className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? filter.color : 'opacity-50'}`} /> 
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex-grow overflow-y-auto custom-scrollbar px-1 pb-10">
            
          {query.trim().length < 2 && !isLoading ? (
            /* حالت انتظار: طراحی شیک جایگزین کلمات پرجستجو */
            <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col items-center justify-center h-full min-h-[40vh] opacity-60">
               <Icon name="search" className="w-16 h-16 md:w-20 md:h-20 text-gray-600 mb-6 animate-pulse" />
               <p className="text-gray-400 text-sm md:text-base font-light tracking-wide text-center max-w-sm leading-relaxed">
                 برای جستجو در آرشیو مکتوم، کلیدواژه یا عبارت مورد نظر خود را تایپ کنید...
               </p>
            </div>
          ) : isLoading && page === 1 ? (
            <BentoSkeleton />
          ) : results.length === 0 && !isLoading ? (
            <div className="relative rounded-[3rem] p-12 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl flex flex-col items-center justify-center text-center">
               <div className="w-32 h-32 mb-6 relative">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <Icon name="folderSlash" className="w-full h-full text-rose-500 relative z-10" />
               </div>
               <h3 className="text-xl md:text-2xl font-black text-white mb-3">محتوایی یافت نشد!</h3>
               <p className="text-gray-400 max-w-lg mb-8 leading-loose text-sm font-light">
                 متأسفانه برای عبارت <span className="text-rose-400 font-bold">«{query}»</span> با فیلترهای فعلی محتوایی وجود ندارد. لطفاً کلمه دیگری را جستجو کنید یا از طریق ارتباط با پشتیبانی سایت، درخواست خود را ثبت نمایید.
               </p>
               <button onClick={() => setQuery('')} className="bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md border border-white/[0.05] shadow-inner text-white px-8 py-3 rounded-xl font-bold transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                 پاک کردن متن و شروع مجدد
               </button>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-in]">
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 shrink-0 bg-white/[0.03] backdrop-blur-md p-5 rounded-2xl border border-white/[0.05] shadow-inner">
                <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2 mb-2 md:mb-0">
                  <Icon name="layout" className="w-5 h-5 text-emerald-400" /> نتایج کشف شده برای «{query}»
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/[0.05] shadow-inner">
                  <span className="hidden md:flex items-center gap-1.5 font-bold"><span className="bg-white/10 px-2 rounded font-mono text-[10px]">↑</span> <span className="bg-white/10 px-2 rounded font-mono text-[10px]">↓</span> اسکرول کیبورد</span>
                  <span className="hidden md:flex text-white/20">|</span>
                  <span className="font-bold flex items-center gap-1.5"><span className="bg-white/10 px-2 rounded font-mono text-[10px]">Enter</span> ورود به سند</span>
                </div>
              </div>

              <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                {results.map((item, index) => {
                  const isDossier = item.type === 'DOSSIER';
                  const isFocused = activeIndex === index;
                  const itemIcon = getIconByType(item.type);
                  
                  const containerClass = "relative rounded-[2rem] group cursor-pointer flex flex-col justify-end p-5 overflow-hidden shadow-xl transition-all duration-500 border " +
                    (isDossier ? "md:col-span-2 lg:col-span-2 row-span-2 h-[280px] md:h-[350px] " : "col-span-1 h-[200px] md:h-[250px] ") +
                    (isFocused ? "border-white/40 scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10" : "border-white/[0.05] hover:border-white/20");

                  const haloClass = "absolute inset-0 rounded-[2rem] pointer-events-none transition-all duration-500 -z-10 " + 
                    (isFocused ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100 group-hover:scale-105");

                  const imageClass = "w-full h-full object-cover transition-transform duration-[1.5s] ease-out " +
                    (isFocused ? "scale-110 opacity-100" : "opacity-60 group-hover:scale-105 group-hover:opacity-90");

                  const titleClass = "font-black text-white mb-2 line-clamp-2 drop-shadow-md " + 
                    (isDossier ? "text-lg md:text-2xl leading-tight" : "text-sm md:text-base");

                  const subtitleClass = "text-gray-200 font-medium line-clamp-2 text-justify drop-shadow-md mb-2 " + 
                    (isDossier ? "text-xs md:text-sm leading-relaxed" : "text-[10px] md:text-xs");
                  
                  return (
                    <div 
                      key={`${item.type}-${item.id}`}
                      onClick={() => { router.push(item.url); onClose(); }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={containerClass}
                    >
                      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] -z-20" />
                      
                      <div 
                        className={haloClass}
                        style={{ boxShadow: `inset 0 0 60px ${item.color}30, 0 20px 50px -10px ${item.color}50` }}
                      />
                      
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                        {item.image ? (
                          <BlurImage src={item.image} alt={item.title} className={imageClass} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10 bg-black/50"><Icon name="folder" className="w-24 h-24" /></div>
                        )}
                      </div>

                      <div 
                        className="absolute bottom-0 inset-x-0 h-[85%] z-10 pointer-events-none" 
                        style={{ background: `linear-gradient(to top, #050810 0%, ${item.color}50 40%, transparent 100%)` }}
                      />
                      
                      <div className="relative z-20 mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-inner" style={{ color: item.color }}>
                            <Icon name={itemIcon} className="w-3.5 h-3.5" />
                            {item.category}
                          </span>
                          {isFocused && <span className="text-[9px] text-gray-900 bg-white px-2 py-0.5 rounded font-bold animate-pulse shadow-[0_0_10px_white]">Enter</span>}
                        </div>
                        
                        <h3 className={titleClass}>{item.title}</h3>
                        
                        {item.subtitle && (
                          <p className={subtitleClass}>{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center pb-8 pt-4">
                  <button 
                    onClick={() => performSearch(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer disabled:opacity-50 hover:-translate-y-1"
                  >
                    {isLoading ? <Icon name="loader" className="w-5 h-5 animate-spin text-cyan-400" /> : <Icon name="plus" className="w-5 h-5 text-cyan-400" />}
                    نمایش اسناد بیشتر
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}