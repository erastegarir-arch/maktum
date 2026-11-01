'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon';
import EmptyState from '@/app/components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => (
  <div className={`relative overflow-hidden bg-white/5 border border-transparent shadow-inner backdrop-blur-sm ${rounded} ${className}`}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
  </div>
);

const PageSkeleton = ({ activeTheme }) => (
  <div className="relative min-h-screen flex flex-col">
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
      <div className="w-32 h-6 bg-white/5 rounded-lg border border-transparent shadow-inner"></div>
      <section className="relative rounded-3xl p-6 md:p-12 flex flex-col items-center overflow-hidden border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] -z-10" />
        <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90`} />
        <BaseSkeleton className="w-36 h-6 mb-5" rounded="rounded-full" />
        <BaseSkeleton className="w-3/4 h-12 md:h-16 mb-5" rounded="rounded-xl" />
        <BaseSkeleton className="w-1/2 h-6" rounded="rounded-md" />
      </section>
      <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl p-3 md:p-5 flex flex-col relative overflow-hidden border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90`} />
            <BaseSkeleton className="w-full aspect-square md:aspect-video mb-4" rounded="rounded-xl" />
            <BaseSkeleton className="w-3/4 h-4 mb-2" rounded="rounded-md" />
            <BaseSkeleton className="w-1/2 h-4" rounded="rounded-md" />
          </div>
        ))}
      </section>
    </main>
  </div>
);

const toPersianDigits = (num) => {
  if (!num) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[x]);
};

const ArchiveItemCard = ({ item, theme }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Link 
      href={item.url || '#'}
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      className={`group flex flex-col aspect-square md:aspect-video rounded-2xl relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 border border-transparent shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:${theme.shadow}`}
      style={{ '--theme-glow': `rgba(${theme.glowRGB}, 0.06)` }}
    >
      <div className="absolute inset-0 bg-[#0a0d14] -z-20" />
      <div className={`absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20 bg-gradient-to-r from-transparent ${theme.via} to-transparent`} />
      <div className="hidden md:block absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
      
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {(item.coverDesktop || item.coverMobile || item.image) ? (
          <picture className="w-full h-full">
            <source media="(max-width: 768px)" srcSet={item.coverMobile || item.coverDesktop || item.image} />
            <img 
              src={item.coverDesktop || item.image || item.coverMobile} 
              alt={item.title} 
              className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-80 group-hover:scale-110 group-hover:opacity-100" 
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
            <Icon name="image" className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
          </div>
        )}
      </div>
      
      <div 
        className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" 
        style={{ background: `linear-gradient(to top, #050810 0%, ${theme.hex || '#10b981'}60 30%, transparent 100%)` }}
      />
      
      <div className="relative z-20 mt-auto p-4 md:p-5 flex flex-col justify-end h-full">
        <h3 className={`text-sm md:text-base font-bold text-white leading-relaxed transition-colors line-clamp-2 drop-shadow-md ${theme.hoverText} font-sans`}>
          {item.title} 
        </h3>
      </div>
    </Link>
  );
};

export default function SharedArchivePage({ 
  isLoading = false,
  activeTheme,
  breadcrumbs = [],
  hero = {},
  featuredList = [],
  archiveItems = [],
  onLoadMore,
  hasMore = false,
  emptyStateTitle = "هیچ محتوایی یافت نشد!",
  emptyStateDesc = "محتوای این بخش در حال به‌روزرسانی است."
}) {
  const featuredRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isLoading || isPaused || featuredList.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === featuredList.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [isLoading, isPaused, featuredList.length]);

  const handleFeaturedMouseMove = (e) => {
    if (!featuredRef.current) return;
    const rect = featuredRef.current.getBoundingClientRect();
    featuredRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    featuredRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  if (isLoading) {
    return <PageSkeleton activeTheme={activeTheme} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
        
        <Breadcrumbs items={breadcrumbs} />

        {(hero.titlePart1 || hero.titlePart2) && (
          <section className="relative rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col justify-center items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/[0.05] animate-[fadeIn_0.5s_ease-out] group">
            {/* حذف تیرگی مات و اعمال گلس‌مورفیسم شفاف برای عبور نور */}
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90 pointer-events-none z-20`} />
            
            <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(${activeTheme.hex}_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none -z-10`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${activeTheme.bg}/10 rounded-full blur-3xl pointer-events-none -z-10`}></div>
            
            <div className="relative z-10 space-y-4 md:space-y-5">
              {hero.badge && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 bg-white/5 border border-transparent shadow-inner rounded-full text-[10px] md:text-xs font-bold ${activeTheme.text} tracking-widest`}>
                  <span className="relative flex h-2 w-2 md:h-3 md:w-3 items-center justify-center">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeTheme.bg} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 ${activeTheme.bg} shadow-[0_0_10px_${activeTheme.hex}]`}></span>
                  </span>
                  {hero.badge}
                </div>
              )}
              
              <h1 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-1 md:pb-2 font-sans">
                {hero.titlePart1} <span className={activeTheme.text}>{hero.titlePart2}</span>
              </h1>
              
              {hero.description && (
                <p className="text-gray-300 text-xs md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify [text-align-last:center] md:[text-align-last:right] font-sans">
                  {hero.description}
                </p>
              )}
            </div>
          </section>
        )}

        {featuredList && featuredList.length > 0 && (
          <section 
            ref={featuredRef}
            onMouseMove={handleFeaturedMouseMove}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            // جایگزین کردن رنگ‌های مسدودکننده با استایل شیشه‌ای
            className={`relative rounded-3xl p-6 pb-12 md:p-12 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/[0.05] transition-all duration-400 group bg-white/[0.02] backdrop-blur-2xl mt-6 md:mt-12`}
            style={{ '--theme-glow': `rgba(${activeTheme.glowRGB}, 0.06)` }}
          >
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90 pointer-events-none z-20`} />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.via} to-transparent opacity-90 pointer-events-none z-20`} />
            
            <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <div className={`absolute -right-16 -top-16 md:-right-32 md:-top-32 w-64 h-64 md:w-96 md:h-96 ${activeTheme.bg}/10 rounded-full blur-[60px] md:blur-[80px] pointer-events-none -z-10`}></div>
            
            <div className="relative min-h-[400px] flex items-center">
              {featuredList.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`absolute inset-0 w-full flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-all duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' : 'opacity-0 -translate-x-10 z-0 pointer-events-none'
                  }`}
                >
                  
                  <div className="w-full md:w-5/12 flex justify-center items-center order-1 md:order-none mt-2 md:mt-0">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 flex items-center justify-center">
                      <div className={`absolute inset-0 ${activeTheme.bg}/20 blur-2xl rounded-full pointer-events-none`}></div>
                      {slide.image && (
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className={`relative z-10 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-[2000ms] ${index === currentSlide ? 'scale-100' : 'scale-90'}`} 
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 md:space-y-6 order-2 md:order-none text-center md:text-right w-full flex flex-col items-center md:items-start pb-10 md:pb-0">
                    {slide.badge && (
                      <div className={`inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 bg-white/5 border border-transparent shadow-inner rounded-lg text-[10px] md:text-xs font-bold ${activeTheme.text} font-sans`}>
                        <Icon name="star" className="w-3 h-3 md:w-4 md:h-4 fill-current" /> {slide.badge}
                      </div>
                    )}
                    
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight font-sans">
                      {slide.title}
                    </h2>
                    
                    {slide.description && (
                      <p className={`text-xs md:text-base text-gray-300 leading-relaxed font-light md:border-r-2 md:border-white/20 md:pr-4 text-justify [text-align-last:center] md:[text-align-last:right] font-sans w-full`}>
                        {slide.description}
                      </p>
                    )}
                    
                    {slide.btnText && slide.btnUrl && (
                      <div className="pt-2 md:pt-4">
                        <Link 
                          href={slide.btnUrl}
                          target={slide.btnUrl.startsWith('http') ? '_blank' : '_self'}
                          className={`${activeTheme.bg} hover:brightness-110 text-white px-6 md:px-8 py-2.5 md:py-3.5 rounded-xl text-sm md:text-base font-bold inline-flex items-center justify-center border border-transparent shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans`}
                        >
                          {slide.btnText}
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {featuredList.length > 1 && (
              <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                {featuredList.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full cursor-pointer border border-transparent shadow-inner ${
                      index === currentSlide ? `w-6 h-1.5 md:w-8 md:h-1.5 ${activeTheme.bg} shadow-[0_0_8px_${activeTheme.hex}]` : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-1 font-sans">آرشیو محتوا</h2>
              <p className="text-xs md:text-sm text-gray-400 font-light font-sans">تمامی محتوای بارگذاری شده در این بخش</p>
            </div>
          </div>

          {archiveItems.length === 0 ? (
            // اعمال گلس‌مورفیسم به باکس یافت نشد
            <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl">
               <EmptyState 
                icon="folder" 
                title={emptyStateTitle} 
                description={emptyStateDesc}
                color={activeTheme.text}
               />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {archiveItems.map((item) => (
                <ArchiveItemCard key={item.id} item={item} theme={activeTheme} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-4 md:pt-6">
              <button 
                onClick={onLoadMore}
                className={`relative group bg-white/5 border border-transparent shadow-inner text-white px-8 md:px-10 py-3 md:py-3.5 rounded-full text-sm md:text-base font-bold flex items-center gap-3 hover:bg-white/10 ${activeTheme.hoverText} transition-all duration-300 cursor-pointer font-sans`}
              >
                <span>نمایش موارد بیشتر</span>
                <Icon name="caretDown" className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}