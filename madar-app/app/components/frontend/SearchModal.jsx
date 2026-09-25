'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/Icon'; 
import EmptyState from '@/app/components/EmptyState';
import BlurImage from '@/app/components/BlurImage'; 

// === کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-transparent shadow-inner backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === اسکلتون کارت نتیجه جستجو ===
const ResultCardSkeleton = () => {
  return (
    <div className="relative rounded-2xl p-4 h-48 flex flex-col justify-end overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
      {/* پس‌زمینه شیشه‌ای ایزوله */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-2xl pointer-events-none -z-10" />
      <BaseSkeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />
      <div className="relative z-20 space-y-2">
        <BaseSkeleton className="w-20 h-3" rounded="rounded-sm" />
        <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-2/3 h-3" rounded="rounded-sm" />
      </div>
    </div>
  );
};

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // مدیریت بسته شدن پاپ‌آپ با دکمه Esc کیبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; 
      setQuery('');
      setIsLoading(false);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // شبیه‌سازی لودینگ داخلی به محض تایپ کاربر
  useEffect(() => {
    if (query.trim().length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400); 
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  // منطق انتخاب فیلترها (چیپس‌ها)
  const toggleFilter = (filterName) => {
    setActiveFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName) 
        : [...prev, filterName]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex justify-center pt-8 md:pt-20 px-4 pb-4 animate-[fadeIn_0.3s_ease-out] font-sans text-right select-none">
      
      {/* پس‌زمینه تاریک برای بستن با کلیک بیرون از باکس */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* نگهدارنده اصلی پاپ‌آپ */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col max-h-full animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        
        {/* دکمه بستن اصلی */}
        <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 md:-right-12 md:top-0 w-10 h-10 rounded-full bg-white/5 border border-transparent shadow-inner flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          title="بستن پنجره"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>

        {/* بخش بالایی: کادر جستجو */}
        <div className="relative rounded-[2rem] p-6 overflow-hidden shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent group">
          {/* ۱. لایه پس‌زمینه شیشه‌ای */}
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-[2rem] pointer-events-none -z-10" />

          {/* ۲. نوار نوری گرادینت بالای کادر جستجو */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 z-20 pointer-events-none" />

          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className={`${query ? 'text-white' : 'text-[#06b6d4] animate-pulse'}`}>
                <Icon name="search" className="w-8 h-8" />
            </div>
            
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xl md:text-2xl w-full placeholder:text-gray-500 font-bold font-sans" 
              placeholder="جستجو در اسناد، مستندات و پژوهش‌ها..." 
              autoComplete="off" 
            />

            {/* دکمه پاک کردن متن */}
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="text-gray-400 hover:text-white bg-white/5 border border-transparent shadow-inner p-2 rounded-full transition-colors cursor-pointer"
                title="پاک کردن متن"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* فیلترهای سریع */}
          <div className="flex flex-wrap gap-2 mt-6 relative z-10 border-t border-white/10 pt-4">
            {[
              { id: 'prod', label: 'محتوای تولیدی', icon: 'video', color: 'text-[#06b6d4]' },
              { id: 'raw', label: 'محتوای راش و خام', icon: 'folder', color: 'text-[#fbbf24]' },
              { id: 'blog', label: 'مقالات بلاگ', icon: 'article', color: 'text-[#a855f7]' },
              { id: 'tools', label: 'ابزارها', icon: 'pen-nib', color: 'text-gray-400' }
            ].map(filter => {
              const isActive = activeFilters.includes(filter.id);
              return (
                <button 
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 border border-transparent transition-all duration-300 cursor-pointer font-sans ${
                    isActive 
                      ? 'bg-white/15 shadow-inner text-white' 
                      : 'bg-white/5 shadow-inner text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Icon name={filter.icon} className={`w-4 h-4 ${filter.color}`} /> 
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* بخش پایینی: محتوای متغیر بر اساس تایپ کاربر */}
        <div className="mt-8 flex-grow overflow-y-auto hide-scroll pb-10 px-2">
            
          {/* حالت اول: کاربر هنوز چیزی تایپ نکرده است */}
          {query.trim().length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fadeIn_0.3s_ease-out]">
              
              {/* تاریخچه جستجو */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-sans border-b border-white/10 pb-2">
                  <Icon name="history" className="w-5 h-5 text-gray-400" /> جستجوهای اخیر شما
                </h4>
                <div className="space-y-2">
                  {['مستند کاهنان فضا', 'گراف ارتباطات'].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent shadow-inner group hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 text-sm text-gray-300 font-sans">
                        <Icon name="clock" className="w-4 h-4 text-gray-500" /> {item}
                      </div>
                      <button className="text-gray-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* پرجستجوترین‌ها */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-sans border-b border-white/10 pb-2">
                  <Icon name="trend" className="w-5 h-5 text-[#fbbf24]" /> پرجستجوترین‌های مدار
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['هندسه_مقدس', 'لژ_لندن', 'اسناد_ناسا', 'مترجم_هوشمند'].map((tag, idx) => (
                    <button key={idx} className="px-3 py-1.5 rounded-lg bg-black/40 border border-transparent shadow-inner text-sm text-gray-400 hover:text-[#06b6d4] hover:bg-black/60 transition-colors flex items-center gap-1 cursor-pointer font-sans">
                      <Icon name="hash" className="w-4 h-4 opacity-50" /> {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* کشف تصادفی */}
              <div className="md:col-span-2 mt-2">
                <div className="relative rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-2xl pointer-events-none -z-10" />
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-transparent shadow-inner flex items-center justify-center text-[#06b6d4] flex-shrink-0 group-hover:bg-white/10 transition-colors duration-300">
                      <Icon name="compass" className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 font-sans">گشت و گذار در بایگانی</h4>
                      <p className="text-xs text-gray-400 font-light text-justify font-sans">نمی‌دانید از کجا شروع کنید؟ به صورت تصادفی یک محتوای خام یا تولیدی را کشف کنید.</p>
                    </div>
                  </div>
                  <button className="relative z-10 bg-[#06b6d4] border border-transparent text-[#080c16] px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-cyan-300 transition-all shadow-[0_5px_15px_rgba(6,182,212,0.4)] cursor-pointer font-sans">
                    کشف تصادفی
                  </button>
                </div>
              </div>

            </div>
          ) : isLoading ? (
            /* حالت بارگذاری محلی (اسکلتون اسکرین نتایج) */
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
              <div className="flex justify-between items-center mb-4">
                <BaseSkeleton className="w-32 h-5" rounded="rounded-md" />
                <BaseSkeleton className="w-28 h-4" rounded="rounded-md" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <ResultCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : query === 'تست' || query === 'خالی' ? (
            /* حالت سوم: نمایش حالت خالی استاندارد (Empty State) */
            <div className="relative rounded-3xl p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
               <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
               <EmptyState 
                icon="folderSlash" 
                title="سندی با این عنوان یافت نشد!" 
                description={`جستجوی شما برای عبارت «${query}» هیچ نتیجه‌ای در بایگانی، راش‌ها و مستندات مدار نداشت. لطفاً کلمات کلیدی دیگری را امتحان کنید یا فیلترها را تغییر دهید.`}
                actionText="پاک کردن متن جستجو"
                onAction={() => setQuery('')}
                color="text-[#fbbf24]" 
              />
            </div>
          ) : (
            /* حالت دوم: کاربر در حال تایپ است و نتایج داخلی آماده‌اند */
            <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-in]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h4 className="text-sm font-bold text-white font-sans">نتایج یافت شده: <span className="text-[#06b6d4] font-sans">۳</span> مورد</h4>
                <span className="text-xs text-gray-500 font-light font-sans">در حال نمایش بهترین نتایج</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                
                {/* نتیجه ۱ (فیروزه‌ای) */}
                <div className="relative rounded-2xl group cursor-pointer h-48 flex flex-col justify-end p-4 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent transition-all duration-300">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-2xl pointer-events-none -z-10" />

                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{
                      boxShadow: 'inset 0 0 25px rgba(6, 182, 212, 0.15), 0 10px 30px -10px rgba(6, 182, 212, 0.25)'
                    }}
                  />

                  <div 
                    className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100 z-20 pointer-events-none"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)' 
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/30 to-transparent z-10"></div>
                  <div className="absolute inset-0 w-full h-full bg-black/40 overflow-hidden shadow-inner">
                    <BlurImage src="/images/content-documentary.jpg" alt="سایه‌های معماری مدرن" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="relative z-20">
                    <span className="text-[#06b6d4] text-[10px] font-bold mb-1 block tracking-widest font-sans">محتوای تولیدی</span>
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 font-sans">سایه‌های معماری مدرن</h3>
                    <p className="text-[11px] text-gray-400 font-light line-clamp-1 text-justify font-sans">واکاوی نمادها در طراحی شهری.</p>
                  </div>
                </div>

                {/* نتیجه ۲ (کهربایی) */}
                <div className="relative rounded-2xl group cursor-pointer h-48 flex flex-col justify-end p-4 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent transition-all duration-300">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-2xl pointer-events-none -z-10" />

                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{
                      boxShadow: 'inset 0 0 25px rgba(251, 191, 36, 0.15), 0 10px 30px -10px rgba(251, 191, 36, 0.25)'
                    }}
                  />

                  <div 
                    className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100 z-20 pointer-events-none"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent 0%, #fbbf24 50%, transparent 100%)' 
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/30 to-transparent z-10"></div>
                  <div className="absolute top-2 left-2 z-20 bg-[#fbbf24]/90 text-black text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-inner font-sans">سند PDF</div>
                  <div className="absolute inset-0 w-full h-full bg-black/40 overflow-hidden shadow-inner">
                    <BlurImage src="/images/doc-pdf.png" alt="اسناد انجمن‌های مخفی لندن" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="relative z-20">
                    <span className="text-[#fbbf24] text-[10px] font-bold mb-1 block tracking-widest font-sans">محتوای راش و خام</span>
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 font-sans">اسناد انجمن‌های مخفی لندن</h3>
                    <p className="text-[11px] text-gray-400 font-light line-clamp-1 text-justify font-sans">دست‌نوشته‌های قرن ۱۸.</p>
                  </div>
                </div>

                {/* نتیجه ۳ (بنفش) */}
                <div className="relative rounded-2xl group cursor-pointer h-48 flex flex-col justify-end p-4 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent transition-all duration-300">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-2xl pointer-events-none -z-10" />

                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{
                      boxShadow: 'inset 0 0 25px rgba(168, 85, 247, 0.15), 0 10px 30px -10px rgba(168, 85, 247, 0.25)'
                    }}
                  />

                  <div 
                    className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100 z-20 pointer-events-none"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent 0%, #a855f7 50%, transparent 100%)' 
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/30 to-transparent z-10"></div>
                  <div className="absolute inset-0 w-full h-full bg-black/40 overflow-hidden shadow-inner">
                    <BlurImage src="/images/content-article.jpg" alt="ریشه‌های هرمسی در فیزیک کلاسیک" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="relative z-20">
                    <span className="text-[#a855f7] text-[10px] font-bold mb-1 block tracking-widest font-sans">مقاله تحلیلی</span>
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 font-sans">ریشه‌های هرمسی در فیزیک کلاسیک</h3>
                    <p className="text-[11px] text-gray-400 font-light line-clamp-1 text-justify font-sans">زمان مطالعه: ۱۲ دقیقه</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}