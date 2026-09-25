'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon'; 
import Link from 'next/link';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import EmptyState from '@/app/components/EmptyState'; 

const getContentTypeConfig = (type) => {
  const t = type?.toUpperCase() || '';
  if(t.includes('VIDEO') || t.includes('AUDIO') || t.includes('PRODUCED') || t === 'محتوای تولیدی') return { label: 'محتوای تولیدی', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-transparent', icon: 'video', hex: '#f43f5e' };
  if(t.includes('RAW') || t.includes('FOOTAGE') || t === 'فوتیج و راش') return { label: 'فوتیج و راش', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-transparent', icon: 'grid', hex: '#f59e0b' };
  if(t.includes('TOOL') || t === 'ابزارها' || t === 'محتوای ابزارها') return { label: 'ابزارها', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-transparent', icon: 'project', hex: '#06b6d4' };
  if(t.includes('BLOG') || t.includes('ARTICLE') || t === 'بلاگ') return { label: 'بلاگ', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-transparent', icon: 'fileText', hex: '#10b981' };
  return { label: type || 'نامشخص', bg: 'bg-white/5', text: 'text-gray-300', border: 'border-transparent', icon: 'document', hex: '#9ca3af' };
};

// کاور اسلایدر با همون ابعاد اولیه و بدون باکس
const FadingHero = ({ desktopImg, mobileImg }) => {
  if (!desktopImg && !mobileImg) return null;
  const maskGradient = 'radial-gradient(ellipse at center, black 50%, transparent 90%)'; 

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-[4rem]">
      {desktopImg && <div className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000" style={{ backgroundImage: `url(${desktopImg})`, opacity: 0.7, maskImage: maskGradient, WebkitMaskImage: maskGradient }} />}
      {mobileImg && <div className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000" style={{ backgroundImage: `url(${mobileImg})`, opacity: 0.7, maskImage: maskGradient, WebkitMaskImage: maskGradient }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-[#050810] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-transparent to-[#050810] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#050810] via-transparent to-[#050810] opacity-90" />
    </div>
  );
};

// کارت‌های محتوا (با لینک، افکت نوری اختصاصی و ردیابی موس)
const ContentCard = ({ content, index }) => {
  const cardRef = useRef(null);
  const typeConfig = getContentTypeConfig(content.type);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#9ca3af');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '156, 163, 175';
  };

  return (
    <Link href={`/v/${content.slug || '#'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative aspect-video rounded-[2rem] overflow-hidden cursor-pointer shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] border border-transparent bg-white/[0.02] backdrop-blur-2xl transition-all duration-400 hover:-translate-y-1.5"
        style={{ '--theme-glow': `rgba(${hexToRgb(typeConfig.hex)}, 0.08)` }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20" style={{ background: `linear-gradient(to right, transparent, ${typeConfig.hex}, transparent)` }} />
        <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {content.coverDesktop && <img src={content.coverDesktop} alt={content.titleBase} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/50 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />
        
        {/* هاله نوری اختصاصی از رنگ مدل محتوا */}
        <div className="absolute -bottom-10 inset-x-0 h-1/2 transition-all duration-700 opacity-30 group-hover:opacity-60 mix-blend-screen pointer-events-none" style={{ background: `radial-gradient(ellipse at bottom, ${typeConfig.hex}60 0%, transparent 70%)` }} />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-20">
          <div className="flex items-center gap-2 mb-3 bg-white/5 border border-white/5 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-inner">
            <Icon name={typeConfig.icon} className={`w-3.5 h-3.5 ${typeConfig.text}`} />
            <span className="text-[10px] md:text-xs font-bold text-gray-200 font-sans">{typeConfig.label}</span>
          </div>
          <h4 className="text-sm md:text-base font-bold text-white leading-relaxed drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300 font-sans line-clamp-2">
            {content.titleBase} {content.titleHighlight}
          </h4>
        </div>
      </motion.div>
    </Link>
  );
};

export default function DossierDetailClientPage({ dossier }) {
  if (!dossier) return <div className="min-h-screen flex items-center justify-center text-white">پرونده‌ای یافت نشد.</div>;

  const data = dossier;
  const [activeFilter, setActiveFilter] = useState('همه');
  const [visibleCount, setVisibleCount] = useState(4); 

  const filteredContents = useMemo(() => {
    let filtered = data.contents || [];
    if (activeFilter !== 'همه') {
      filtered = filtered.filter(item => getContentTypeConfig(item.type).label === activeFilter);
    }
    return filtered;
  }, [activeFilter, data.contents]);

  const displayedContents = filteredContents.slice(0, visibleCount);
  const isTipIconUrl = data.tipBtnIcon && (data.tipBtnIcon.includes('/') || data.tipBtnIcon.startsWith('http'));

  return (
    <div dir="rtl" className="min-h-screen bg-[#050810] text-white font-sans text-right pb-24 overflow-hidden relative select-none selection:bg-cyan-500/30">
      
      {/* لایه برادکرامب به z-20 کاهش یافت تا هدر سایت از آن بالاتر باشد */}
      <div className="relative z-20 pt-8 px-4 md:px-8 w-full max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'منظومه‌های محتوایی', href: '/c' }, { label: data.title }]} />
      </div>

      {/* اسلایدر اول صفحه: بدون باکس شیشه‌ای و بازگشت به حالت اولیه بزرگ */}
      <section className="relative w-full min-h-[50vh] md:min-h-[75vh] flex flex-col justify-center items-center pt-8 pb-16">
        
        {/* تصویر پس‌زمینه اسلایدر به صورت تمام‌عرض (خارج از باکس داخلی) */}
        <FadingHero desktopImg={data.coverDesktop} mobileImg={data.coverMobile} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center mt-10">
          
          {data.preTitle && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.02] border border-transparent backdrop-blur-md shadow-inner mb-8 z-10 relative">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: data.themeColor || '#06b6d4' }}></span>
              <span className="text-sm md:text-base font-bold tracking-wide font-sans" style={{ color: data.preTitleColor || '#a3a3a3' }}>{data.preTitle}</span>
            </motion.div>
          )}
          
          {/* اندازه فونت‌ها با صفحات دیگر متناسب شد */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl md:text-5xl font-black mb-8 pt-6 pb-2 leading-[1.35] tracking-tight text-transparent bg-clip-text drop-shadow-2xl z-10 relative font-sans" style={{ backgroundImage: `linear-gradient(to bottom, ${data.titleGradientStart || '#ffffff'}, ${data.titleGradientEnd || '#d1d5db'})`, textShadow: `0 10px 40px ${data.themeColor || '#06b6d4'}40` }}>
            {data.title}
          </motion.h1>
          
          {data.description && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-sm md:text-base max-w-3xl leading-relaxed font-bold backdrop-blur-sm drop-shadow-lg z-10 relative font-sans text-justify" style={{ color: data.descColor || '#d1d5db' }}>
              {data.description}
            </motion.p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 relative z-20 mt-10">
        
        {/* رادار موضوعی (هشتگ‌ها) */}
        {data.showRadar && data.topics?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="relative">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-3 drop-shadow-lg font-sans">
                <Icon name="hash" className="w-6 h-6" style={{ color: data.themeColor || '#06b6d4' }} /> {data.radarTitle}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {data.topics.map((topic, i) => (
                  <Link href={`/t/${topic.slug || ''}`} key={topic.id}>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5 + (i % 2), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }} className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-transparent shadow-inner backdrop-blur-xl cursor-pointer transition-all hover:scale-105 group font-sans flex items-center">
                      {topic.type === 'HASHTAG' && <span className="text-gray-500 group-hover:text-white transition-colors ml-1.5 font-light text-sm">#</span>}
                      <span className="text-xs md:text-sm font-bold" style={{ color: i % 2 === 0 ? 'white' : (data.themeColor || '#06b6d4') }}>{topic.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* اشخاص و پدیدآورندگان */}
        {data.showCreators && data.creators?.length > 0 && (
          <section className="border-t border-white/10 pt-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1.5 h-8 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: data.themeColor || '#06b6d4', color: data.themeColor || '#06b6d4' }}></div>
              <h3 className="text-2xl font-black font-sans">{data.creatorsTitle}</h3>
            </div>
            <div className="flex flex-wrap gap-8 md:gap-12 items-start justify-start">
              {data.creators.map((creator, i) => (
                <Link href={`/t/${creator.slug || ''}`} key={creator.id}>
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-4 group cursor-pointer w-20 md:w-28">
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1.5 border border-transparent group-hover:border-white/10 bg-white/5">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                      {creator.imageUrl ? <img src={creator.imageUrl} alt={creator.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><Icon name="user" className="w-8 h-8" /></div>}
                    </div>
                    <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight font-sans">{creator.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* محتوای پرونده */}
        {data.contents?.length > 0 && (
          <section className="border-t border-white/10 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: data.themeColor || '#06b6d4', color: data.themeColor || '#06b6d4' }}></div>
                <h3 className="text-2xl font-black font-sans">محتوای پرونده</h3>
              </div>
              <div className="flex gap-2 bg-white/5 shadow-inner p-1.5 rounded-2xl border border-transparent overflow-x-auto max-w-full hide-scroll">
                {['همه', 'فوتیج و راش', 'محتوای تولیدی', 'ابزارها', 'بلاگ'].map((cat, i) => (
                  <button key={i} onClick={() => { setActiveFilter(cat); setVisibleCount(4); }} className={`px-5 py-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-colors whitespace-nowrap font-sans border border-transparent ${activeFilter === cat ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{cat}</button>
                ))}
              </div>
            </div>

            {displayedContents.length === 0 ? (
              <div className="relative rounded-3xl p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                 <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                 <EmptyState icon="folder" title="محتوایی یافت نشد!" description="برای این بخش هنوز محتوایی ثبت نشده است." color={data.themeColor || '#06b6d4'} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedContents.map((content, i) => (
                  <ContentCard key={content.id} content={content} index={i} />
                ))}
              </div>
            )}

            {visibleCount < filteredContents.length && (
              <div className="flex justify-center pt-8">
                <button onClick={() => setVisibleCount(prev => prev + 4)} className="relative group bg-white/5 border border-transparent shadow-inner text-white px-10 py-3.5 rounded-full font-bold flex items-center gap-3 hover:bg-white/10 transition-all duration-300 cursor-pointer font-sans text-xs md:text-sm">
                  <span>نمایش موارد بیشتر</span>
                  <Icon name="caretDown" className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* باکس اقدام (CTA) */}
        {data.showTipLine && (
          <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 md:p-16 border border-transparent overflow-hidden text-center flex flex-col items-center mt-20 shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] group">
            <div className="absolute top-0 inset-x-0 h-[2px] opacity-50 bg-gradient-to-r from-transparent via-emerald-500 to-transparent pointer-events-none z-20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
            
            <div className="w-12 h-12 mb-5 flex items-center justify-center drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {isTipIconUrl ? <img src={data.tipBtnIcon} alt="icon" className="w-10 h-10 object-contain" /> : <Icon name={data.tipBtnIcon || 'shield'} className="w-10 h-10 text-emerald-400" />}
            </div>
            <h5 className="text-emerald-400 font-bold text-xs mb-3 tracking-widest uppercase font-sans">{data.tipPreTitle}</h5>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-5 drop-shadow-md font-sans">{data.tipTitle}</h2>
            <p className="text-gray-300 max-w-xl text-center leading-relaxed mb-8 font-light text-sm font-sans">{data.tipDesc}</p>
            <Link href={data.tipBtnLink || '#'} className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-emerald-500/20 text-white rounded-xl font-bold transition-all border border-transparent shadow-inner font-sans text-xs md:text-sm cursor-pointer">
              <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover/btn:opacity-10 transition-opacity rounded-xl" />
              <span className="relative z-10">{data.tipBtnText}</span>
              <Icon name="chevronLeft" className="w-4 h-4 text-emerald-400 group-hover/btn:-translate-x-1 transition-transform relative z-10 rtl:rotate-180" />
            </Link>
          </motion.section>
        )}

      </div>
    </div>
  );
}