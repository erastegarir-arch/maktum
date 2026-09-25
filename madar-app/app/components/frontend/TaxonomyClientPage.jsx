'use client';

import { useState, useRef, useMemo } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon'; 
import EmptyState from '@/app/components/EmptyState';
import BlurImage from '@/app/components/BlurImage';

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
    color: '#a855f7', text: 'text-[#a855f7]', bgSoft: 'bg-[#a855f7]/10', borderSoft: 'border-[#a855f7]/30', shadow: 'shadow-[0_0_10px_#a855f7]', via: 'via-[#a855f7]',
    badgeLabel: 'هشتگ رسمی', parentLabel: 'هشتگ‌ها', icon: 'hash'
  },
  CREATOR: {
    color: '#06b6d4', text: 'text-[#06b6d4]', bgSoft: 'bg-[#06b6d4]/10', borderSoft: 'border-[#06b6d4]/30', shadow: 'shadow-[0_0_10px_#06b6d4]', via: 'via-[#06b6d4]',
    badgeLabel: 'نمایه پدیدآورنده', parentLabel: 'پدیدآورندگان', icon: 'user'
  }
};

const CONTENT_THEMES = {
  PRODUCED: { category: 'محتوای تولیدی', borderTop: 'border-t border-white/5-[#f43f5e]', badgeText: 'text-[#f43f5e]', hoverTitle: 'group-hover:text-[#f43f5e]', gradientVia: 'via-[#f43f5e]', hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]', filterId: 'produced', metaIcon: 'video' },
  BLOG: { category: 'بلاگ', borderTop: 'border-t border-white/5-[#b45309]', badgeText: 'text-[#b45309]', hoverTitle: 'group-hover:text-[#b45309]', gradientVia: 'via-[#b45309]', hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(180,83,9,0.3)]', filterId: 'article', metaIcon: 'article' },
  RAW: { category: 'محتوای خام', borderTop: 'border-t border-white/5-[#fbbf24]', badgeText: 'text-[#fbbf24]', hoverTitle: 'group-hover:text-[#fbbf24]', gradientVia: 'via-[#fbbf24]', hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)]', filterId: 'raw', metaIcon: 'folder' },
  TOOL: { category: 'ابزارها', borderTop: 'border-t border-white/5-[#10b981]', badgeText: 'text-[#10b981]', hoverTitle: 'group-hover:text-[#10b981]', gradientVia: 'via-[#10b981]', hoverShadow: 'hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]', filterId: 'tools', metaIcon: 'pen-nib' },
};

// ==========================================
// ۳. کامپوننت داخلی کارت محتوا
// ==========================================
const ContentCard = ({ item }) => {
  const cardRef = useRef(null);
  const theme = CONTENT_THEMES[item.type] || CONTENT_THEMES.PRODUCED;

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
      className={`group flex flex-col p-5 rounded-3xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent ${theme.hoverShadow}`}
    >
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10 transition-colors" />
      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${theme.gradientVia} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20`} />
      <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.05),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      <div className="relative w-full h-48 rounded-2xl bg-black/40 border border-transparent shadow-inner overflow-hidden mb-5 z-10 flex items-center justify-center">
        {item.image ? (
          <BlurImage src={item.image} alt={item.title} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
        ) : (
          <Icon name={theme.metaIcon} className="w-8 h-8 text-gray-500 opacity-50" />
        )}
      </div>
      
      <div className="relative z-10 flex-grow">
        <h3 className={`text-base font-bold text-white mb-2.5 leading-relaxed line-clamp-2 transition-colors font-sans ${theme.hoverTitle}`}>
          {item.title}
        </h3>
      </div>
      
      <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-sans font-bold">
        <span className="flex items-center gap-1.5">
         <Icon name="calendarBlank" className="w-3.5 h-3.5" /> 
         {item.date ? toPersianDigits(new Date(item.date).toLocaleDateString('fa-IR')) : 'نامشخص'}
        </span>
        <span className={`${theme.badgeText} opacity-90 bg-white/5 border border-transparent shadow-inner px-2 py-1 rounded-lg`}>{theme.category}</span>
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
  const totalViewsCount = contents.reduce((acc, curr) => acc + (curr.views || 0), 0);

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
    return <Icon name={activeTheme.icon} className={`w-16 h-16 ${activeTheme.text} transition-transform duration-500 group-hover/icon:scale-110`} />;
  };

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth font-sans select-none text-right">
      <div className="fixed inset-0 z-[-10] bg-[#050810] overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-15 bg-[radial-gradient(circle,${activeTheme.color}_0%,transparent_60%)] animate-[drift_30s_infinite_linear_alternate]`} />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 w-full relative z-10 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            {
             label: activeTheme.parentLabel, 
             href: `/t?tab=${tType === 'CREATOR' ? 'creators' : tType === 'CATEGORY' ? 'categories' : 'hashtags'}` 
            },
            { label: taxonomy.name } 
           ]} 
          /> 
            
        {/* ================= هدر معرفی (باکس پروفایل) ================= */}
        <section className="relative overflow-hidden p-8 md:p-12 group rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90 pointer-events-none z-20`} />
          <div className={`absolute left-0 top-0 w-1/2 h-full ${activeTheme.bgSoft} blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/4 pointer-events-none -z-10`}></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            
            <div className="flex-shrink-0 relative group/icon cursor-pointer">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-transparent shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_20px_rgba(0,0,0,0.5)] bg-black/40 flex items-center justify-center relative transition-colors duration-500`}>
                {renderAvatar()}
              </div>
            </div>

            <div className="flex-grow text-center md:text-right mt-4 md:mt-0">
              <div className="flex justify-center md:justify-start mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-transparent shadow-inner rounded-full text-xs font-bold ${activeTheme.text} tracking-widest font-sans`}>
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.color }}></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 8px ${activeTheme.color}` }}></span>
                 </span>
                {activeTheme.badgeLabel}
            </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black mb-2 text-white drop-shadow-lg font-sans">
                {taxonomy.preTitle && <span className="block text-lg font-light text-gray-400 mb-2">{taxonomy.preTitle}</span>}
                {taxonomy.name}
              </h1>
              
              <div className="rich-text text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl font-light text-justify mx-auto md:mx-0 mt-4 font-sans">
                <p>{taxonomy.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mt-8 border-t border-white/10 pt-6">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-black text-white font-sans">{toPersianDigits(totalContentsCount)}</span>
                  <span className="text-xs text-gray-400 font-sans mt-0.5">محتوای مرتبط</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-black text-white font-sans dir-ltr">
                    {totalViewsCount > 1000 ? `${toPersianDigits((totalViewsCount / 1000).toFixed(1))}k` : toPersianDigits(totalViewsCount)}
                  </span>
                  <span className="text-xs text-gray-400 font-sans mt-0.5">بازدید کل</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= گرید محتوا با فیلتر ================= */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-black text-white mb-1 text-center md:text-right font-sans">محتوای بایگانی شده</h2>
              <p className="text-sm text-gray-400 font-light text-center md:text-right font-sans">تمام مستندات و مقالاتی که شامل این برچسب هستند.</p>
            </div>
            
            <div className="flex gap-2 bg-white/5 border border-transparent p-1.5 rounded-2xl overflow-x-auto max-w-full hide-scroll shadow-inner">
              {[
                { id: 'all', label: 'همه موارد' },
                { id: 'raw', label: 'محتوای راش و فوتیج' },
                { id: 'produced', label: 'محتوای تولیدی' },
                { id: 'tools', label: 'ابزارها' },
                { id: 'article', label: 'بلاگ' }
              ].map(filter => (
                <button 
                  key={filter.id}
                  onClick={() => { setActiveFilter(filter.id); setVisibleCount(12); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-sans border border-transparent ${activeFilter === filter.id ? 'bg-white/15 text-white shadow-md hover:bg-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="relative rounded-3xl p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <EmptyState 
                icon={activeFilter === 'all' ? 'search' : 'folder'}
                title="محتوایی یافت نشد"
                description="هنوز محتوایی در این بخش به این دسته‌بندی تخصیص داده نشده است."
                actionText={activeFilter !== 'all' ? "نمایش همه موارد" : undefined}
                onAction={() => setActiveFilter('all')}
                color={activeTheme.text}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.4s_ease-out]">
              {filteredItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* سیستم نمایش بیشتر (Load More) */}
          {visibleCount < contents.length && filteredItems.length > 0 && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={() => setVisibleCount(prev => prev + 12)}
                className={`relative group bg-white/5 border border-transparent text-white px-10 py-3.5 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 ${activeTheme.text} transition-all duration-300 shadow-inner cursor-pointer font-sans`}
              >
                <span>بارگذاری موارد بیشتر</span>
                <Icon name="caretDown" className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}