// مسیر فایل: app/components/frontend/TaxonomyClientPage.jsx
'use client';

import { useState, useRef, useMemo } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon'; 
import EmptyState from '@/app/components/EmptyState';

// ==========================================
// ۱. توابع کمکی (Helper Functions)
// ==========================================
const toPersianDigits = (num) => {
  if (!num && num !== 0) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[x]);
};

// ==========================================
// ۲. دیکشنری تم‌های رنگی داینامیک
// ==========================================
const TAXONOMY_THEMES = {
  CATEGORY: {
    color: '#10b981', text: 'text-[#10b981]', bgSoft: 'bg-[#10b981]/10', borderSoft: 'border-[#10b981]/30', shadow: 'shadow-[0_0_10px_#10b981]', via: 'via-[#10b981]',
    badgeLabel: 'دسته‌بندی تخصصی', parentLabel: 'دسته‌بندی‌ها', icon: 'folder'
  },
  HASHTAG: {
    color: '#38bdf8', text: 'text-[#38bdf8]', bgSoft: 'bg-[#38bdf8]/10', borderSoft: 'border-[#38bdf8]/30', shadow: 'shadow-[0_0_10px_#38bdf8]', via: 'via-[#38bdf8]',
    badgeLabel: 'هشتگ رسمی', parentLabel: 'هشتگ‌ها', icon: 'hash'
  },
  CREATOR: {
    color: '#a855f7', text: 'text-[#a855f7]', bgSoft: 'bg-[#a855f7]/10', borderSoft: 'border-[#a855f7]/30', shadow: 'shadow-[0_0_10px_#a855f7]', via: 'via-[#a855f7]',
    badgeLabel: 'نمایه پدیدآورنده', parentLabel: 'پدیدآورندگان', icon: 'users'
  }
};

const CONTENT_THEMES = {
  PRODUCED: { category: 'محتوای تولیدی', badgeText: 'text-[#f43f5e]', hoverTitle: 'group-hover:text-[#f43f5e]', gradientVia: 'via-[#f43f5e]', filterId: 'produced', metaIcon: 'video' },
  BLOG: { category: 'بلاگ', badgeText: 'text-[#b45309]', hoverTitle: 'group-hover:text-[#b45309]', gradientVia: 'via-[#b45309]', filterId: 'article', metaIcon: 'article' },
  RAW: { category: 'محتوای خام', badgeText: 'text-[#fbbf24]', hoverTitle: 'group-hover:text-[#fbbf24]', gradientVia: 'via-[#fbbf24]', filterId: 'raw', metaIcon: 'folder' },
  TOOL: { category: 'ابزارها', badgeText: 'text-[#10b981]', hoverTitle: 'group-hover:text-[#10b981]', gradientVia: 'via-[#10b981]', filterId: 'tools', metaIcon: 'pen-nib' },
};

// ==========================================
// ۳. کامپوننت داخلی کارت محتوا (واکنش‌گرا)
// ==========================================
const ContentCard = ({ item }) => {
  const cardRef = useRef(null);
  const theme = CONTENT_THEMES[item.type] || CONTENT_THEMES.PRODUCED;
  const themeColor = theme.badgeText?.match(/\[(.*?)\]/)?.[1] || '#10b981';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <a 
      href={item.url || '#'} 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className="group flex flex-col aspect-square md:aspect-video rounded-2xl md:rounded-3xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/[0.05] hover:border-white/[0.15] bg-white/[0.01] backdrop-blur-xl"
    >
      <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-20" />
      
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${theme.gradientVia} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20`} />
      <div className="hidden md:block absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.05),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
      
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {(item.coverDesktop || item.coverMobile || item.image) ? (
          <picture className="w-full h-full">
            <source media="(max-width: 768px)" srcSet={item.coverMobile || item.image || item.coverDesktop} />
            <img 
              src={item.coverDesktop || item.image || item.coverMobile} 
              alt={item.title} 
              className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-90 group-hover:scale-110 group-hover:opacity-100" 
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
            <Icon name={theme.metaIcon} className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
          </div>
        )}
      </div>
      
      <div 
        className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" 
        style={{ background: `linear-gradient(to top, #050810 0%, ${themeColor}60 30%, transparent 100%)` }}
      />
      
      <div className="relative z-20 mt-auto p-4 md:p-6 flex flex-col justify-end h-full">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]" style={{ color: themeColor }}>
            <Icon name={theme.metaIcon} className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {theme.category}
          </span>
        </div>
        <h3 className={`text-sm md:text-lg font-black text-white leading-relaxed line-clamp-2 drop-shadow-md transition-colors font-sans ${theme.hoverTitle}`}>
          {item.title}
        </h3>
      </div>
    </a>
  );
};

// ==========================================
// ۴. کامپوننت اصلی صفحه
// ==========================================
export default function TaxonomyClientPage({ taxonomy, contents }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);

  const tType = taxonomy?.type || 'CATEGORY';
  const activeTheme = TAXONOMY_THEMES[tType];
  const totalContentsCount = contents.length;

  const filteredItems = useMemo(() => {
    let filtered = contents;
    if (activeFilter !== 'all') {
      filtered = contents.filter(item => {
        const themeDef = CONTENT_THEMES[item.type];
        return themeDef && themeDef.filterId === activeFilter;
      });
    }
    return filtered.slice(0, visibleCount);
  }, [activeFilter, contents, visibleCount]);

  const renderAvatar = () => {
    if (tType === 'CREATOR' && taxonomy.imageUrl) {
      return <img src={taxonomy.imageUrl} alt={taxonomy.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/icon:scale-110" />;
    }
    return <Icon name={activeTheme.icon} className={`w-12 h-12 md:w-16 md:h-16 ${activeTheme.text} transition-transform duration-500 group-hover/icon:scale-110`} />;
  };

  return (
    <>
      {/* تزریق استایل قطعی برای جلوگیری از انتخاب متن در تمامی لایه‌ها و متن‌های دیتابیس */}
      <style dangerouslySetInnerHTML={{ __html: `
        .strict-no-select, .strict-no-select * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `}} />

      <div className="relative min-h-screen flex flex-col scroll-smooth font-sans text-right strict-no-select select-none [&_*]:!select-none">   
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-10 md:pb-12 w-full relative z-10 pt-0">
          
          <Breadcrumbs 
            items={[
              { label: 'مکتوم', href: '/' },
              {
               label: activeTheme.parentLabel, 
               href: `/t?tab=${tType === 'CREATOR' ? 'creators' : tType === 'CATEGORY' ? 'categories' : 'hashtags'}` 
              },
              { label: taxonomy.title || taxonomy.name } 
             ]} 
            /> 
              
          {/* ================= هدر معرفی (باکس گلس‌مورفیک با هاله نور) ================= */}
          <section className="relative overflow-hidden p-6 md:p-12 group rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/[0.08] animate-[fadeIn_0.5s_ease-out] bg-white/[0.03] backdrop-blur-3xl">
            
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90 pointer-events-none z-20`} />
            
            <div className={`absolute left-1/2 md:left-0 top-0 w-full md:w-1/2 h-full ${activeTheme.bgSoft} opacity-40 blur-[60px] md:blur-[80px] rounded-full transform -translate-x-1/2 md:-translate-x-0 -translate-y-1/4 pointer-events-none -z-10`}></div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8 relative z-10">
              
              <div className="flex-shrink-0 relative group/icon cursor-pointer">
                <div className={`w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/[0.1] shadow-[inset_0_0_15px_rgba(255,255,255,0.04),0_10px_20px_rgba(0,0,0,0.4)] bg-black/20 backdrop-blur-md flex items-center justify-center relative transition-all duration-500`}>
                  {renderAvatar()}
                </div>
              </div>

              <div className="flex-grow text-center md:text-right mt-2 md:mt-0 flex flex-col items-center md:items-start">
                
                {taxonomy.preTitle && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-full text-[10px] md:text-xs font-bold ${activeTheme.text} tracking-widest font-sans mb-3 md:mb-4`}>
                    <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5 items-center justify-center shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.color }}></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 8px ${activeTheme.color}` }}></span>
                    </span>
                    {taxonomy.preTitle}
                  </div>
                )}
                
                {(taxonomy.title || taxonomy.name) && (
                  <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg mb-3 md:mb-4">
                    {taxonomy.title || taxonomy.name}
                  </h1>
                )}

                {taxonomy.description && (
                  <div className="rich-text text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl font-light text-justify [text-align-last:center] md:[text-align-last:right] font-sans drop-shadow-md">
                    <p>{taxonomy.description}</p>
                  </div>
                )}
               
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8 mt-5 md:mt-8 border-t border-white/10 pt-5 md:pt-6 w-full">
                  <div className="flex flex-col items-center md:items-start cursor-default">
                    <span className="text-xl md:text-2xl font-black text-white font-sans">{toPersianDigits(totalContentsCount)}</span>
                    <span className="text-[10px] md:text-xs text-gray-400 font-sans mt-0.5">محتوای مرتبط</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= گرید محتوا با فیلتر لمسی در موبایل ================= */}
          <section className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div className="w-full text-center md:text-right">
                <h2 className="text-lg md:text-2xl font-black text-white mb-1 font-sans">محتوای بایگانی شده</h2>
                <p className="text-xs md:text-sm text-gray-400 font-light font-sans">تمام مستندات و مقالاتی که شامل این برچسب هستند.</p>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <div className="flex flex-nowrap items-center justify-between md:justify-end gap-1 md:gap-2 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] w-full md:w-auto">
                  {[
                    { id: 'all', label: 'همه' },
                    { id: 'raw', label: 'راش و فوتیج' },
                    { id: 'produced', label: 'تولیدی' },
                    { id: 'tools', label: 'ابزارها' },
                    { id: 'article', label: 'بلاگ' }
                  ].map(filter => (
                    <button 
                      key={filter.id}
                      onClick={() => { setActiveFilter(filter.id); setVisibleCount(12); }}
                      className={`px-1.5 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] sm:text-[10px] md:text-xs font-bold transition-all cursor-pointer font-sans border flex-1 md:flex-none text-center whitespace-nowrap ${
                        activeFilter === filter.id 
                          ? 'bg-white/[0.08] text-white border-white/[0.1] shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] hover:bg-white/[0.12]' 
                          : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-12 md:py-20 w-full flex items-center justify-center">
                <EmptyState 
                  icon={activeFilter === 'all' ? 'search' : 'folder'}
                  title="محتوایی یافت نشد"
                  description="هنوز محتوایی در این بخش به این تخصیص داده نشده است."
                  actionText={activeFilter !== 'all' ? "نمایش همه موارد" : undefined}
                  onAction={() => setActiveFilter('all')}
                  color={activeTheme.text}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 animate-[fadeIn_0.4s_ease-out]">
                {filteredItems.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {visibleCount < contents.length && filteredItems.length > 0 && (
              <div className="flex justify-center pt-6 md:pt-8">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className={`relative group bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-white px-8 md:px-10 py-3 md:py-3.5 rounded-full font-bold flex items-center gap-2.5 hover:bg-white/[0.08] hover:border-white/[0.1] ${activeTheme.text} transition-all duration-300 cursor-pointer font-sans text-xs md:text-sm`}
                >
                  <span>بارگذاری موارد بیشتر</span>
                  <Icon name="caretDown" className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </section>

        </main>
      </div>
    </>
  );
}