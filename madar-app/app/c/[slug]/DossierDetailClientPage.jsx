'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/app/components/Icon'; 
import Link from 'next/link';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import EmptyState from '@/app/components/EmptyState'; 

const getContentTypeConfig = (type) => {
  const t = type?.toUpperCase() || '';
  if(t.includes('VIDEO') || t.includes('AUDIO') || t.includes('PRODUCED') || t === 'محتوای تولیدی') return { label: 'محتوای تولیدی', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-transparent', icon: 'video', hex: '#f43f5e', prefix: '/p' };
  if(t.includes('RAW') || t.includes('FOOTAGE') || t === 'فوتیج و راش') return { label: 'فوتیج و راش', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-transparent', icon: 'grid', hex: '#f59e0b', prefix: '/f' };
  if(t.includes('TOOL') || t === 'ابزارها' || t === 'محتوای ابزارها') return { label: 'ابزارها', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-transparent', icon: 'project', hex: '#06b6d4', prefix: '/tool' };
  if(t.includes('BLOG') || t.includes('ARTICLE') || t === 'بلاگ') return { label: 'بلاگ', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-transparent', icon: 'fileText', hex: '#10b981', prefix: '/blog' };
  return { label: type || 'نامشخص', bg: 'bg-white/5', text: 'text-gray-300', border: 'border-transparent', icon: 'document', hex: '#9ca3af', prefix: '/p' };
};

// کاور اسلایدر با ماسک نوری پیشرفته (حذف کامل گرادینت‌های رنگی مسدودکننده نور و خط برش)
const FadingHero = ({ desktopImg, mobileImg }) => {
  if (!desktopImg && !mobileImg) return null;

  // ترکیب ماسک عمودی و شعاعی برای محو شدن ۱۰۰ درصدی لبه‌ها بدون ایجاد خط برش
  const maskStyle = {
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 95%), radial-gradient(ellipse 90% 80% at 50% 25%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 95%)',
    WebkitMaskComposite: 'source-in',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 95%), radial-gradient(ellipse 90% 80% at 50% 25%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 95%)',
    maskComposite: 'intersect',
  };

  return (
    <div 
      className="absolute top-0 inset-x-0 h-[65vh] md:h-[80vh] pointer-events-none -z-20 overflow-hidden select-none"
      style={maskStyle}
    >
      {desktopImg && (
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105" 
          style={{ backgroundImage: `url(${desktopImg})`, opacity: 0.28 }} 
        />
      )}
      {mobileImg && (
        <div 
          className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105" 
          style={{ backgroundImage: `url(${mobileImg})`, opacity: 0.28 }} 
        />
      )}
    </div>
  );
};

// کارت‌های محتوا
const ContentCard = ({ content, index }) => {
  const cardRef = useRef(null);
  const typeConfig = getContentTypeConfig(content.type);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    // اصلاح باگ سینتکس جاوااسکریپت در محاسبه مختصات موس
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#9ca3af');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '156, 163, 175';
  };

  return (
    <Link href={`${typeConfig.prefix}/${content.slug || '#'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        // اعمال گلس‌مورفیسم شفاف روی کارت‌ها
        className="group relative aspect-square md:aspect-video rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5"
        style={{ '--theme-glow': `rgba(${hexToRgb(typeConfig.hex)}, 0.08)` }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20" style={{ background: `linear-gradient(to right, transparent, ${typeConfig.hex}, transparent)` }} />
        <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:block" />

        {content.coverDesktop && <img src={content.coverDesktop} alt={content.titleBase} className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/60 to-transparent opacity-85 transition-opacity group-hover:opacity-95" />
        
        <div className="absolute -bottom-10 inset-x-0 h-1/2 transition-all duration-700 opacity-30 group-hover:opacity-60 mix-blend-screen pointer-events-none" style={{ background: `radial-gradient(ellipse at bottom, ${typeConfig.hex}60 0%, transparent 70%)` }} />
        
        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end items-start z-20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 bg-white/[0.05] border border-white/[0.05] backdrop-blur-xl px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
            <Icon name={typeConfig.icon} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${typeConfig.text}`} />
            <span className="text-[9px] md:text-xs font-bold text-gray-200 font-sans">{typeConfig.label}</span>
          </div>
          <h4 className="text-[11px] sm:text-xs md:text-base font-bold text-white leading-snug md:leading-relaxed drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300 font-sans line-clamp-2 w-full text-right pr-1">
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
  const [visibleCount, setVisibleCount] = useState(6); 

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
    // حذف bg-[#050810] برای شفافیت کامل نسبت به لایه نوری AmbientBackground
    <div dir="rtl" className="min-h-screen text-white font-sans text-right overflow-hidden relative select-none selection:bg-cyan-500/30 flex flex-col">
      
      {/* کاور پس‌زمینه (استایل مشابه صفحه Hub) */}
      <FadingHero desktopImg={data.coverDesktop} mobileImg={data.coverMobile} />

      {/* 
        استفاده دقیق از کلاس‌های استاندارد (main) برای هماهنگی ۱۰۰٪ با صفحات Hub و Archive
        space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0
      */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
        
        {/* برادکرامب */}
        <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'منظومه‌های محتوایی', href: '/c' }, { label: data.title }]} />

        {/* ================= هدر اصلی منظومه ================= */}
        <section className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center group">
          
          {data.preTitle && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }} 
              // اعمال گلس‌مورفیسم برای لیبل بالایی
              className="inline-flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] mb-4 md:mb-6 z-10 relative"
            >
              <span 
                className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full animate-pulse" 
                style={{ 
                  backgroundColor: data.themeColor || '#06b6d4', 
                  boxShadow: `0 0 10px ${data.themeColor || '#06b6d4'}` 
                }}
              ></span>
              <span className="text-xs md:text-sm font-bold tracking-wide font-sans" style={{ color: data.preTitleColor || '#e5e7eb' }}>{data.preTitle}</span>
            </motion.div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }} 
            className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text font-sans" 
            style={{ backgroundImage: `linear-gradient(to bottom, ${data.titleGradientStart || '#ffffff'}, ${data.titleGradientEnd || '#d1d5db'})`, textShadow: `0 10px 40px ${data.themeColor || '#06b6d4'}40` }}
          >
            {data.title}
          </motion.h1>
          
          {data.description && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              // اصلاح: فاصله از پایین (mb-8 md:mb-16) اضافه شد تا از رادار فاصله بگیرد
              // اصلاح: تراز دقیق متن (text-justify و dir-rtl) و وسط‌چین شدن خط آخر اعمال شد
              className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify w-full px-4 md:px-0 max-w-2xl mx-auto drop-shadow-md mb-8 md:mb-16 [text-align-last:center]"
              style={{ color: data.descColor || '#d1d5db', direction: 'rtl' }}
            >
              <p>{data.description}</p>
            </motion.div>
          )}
        </section>

        {/* رادار موضوعی (هشتگ‌ها) */}
        {data.showRadar && data.topics?.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            // اصلاح: اضافه شدن پدینگ و مارجین بالا (pt-8 mt-8) برای فاصله گرفتن از هدر
            className="relative max-w-5xl mx-auto pt-8 mt-4 md:pt-12 md:mt-8"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl md:text-3xl font-black mb-8 md:mb-10 text-white flex items-center gap-2 md:gap-3 drop-shadow-lg font-sans">
                <Icon name="hash" className="w-6 h-6 md:w-8 md:h-8" style={{ color: data.themeColor || '#06b6d4' }} /> {data.radarTitle}
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5 md:gap-4">
                {data.topics.map((topic, i) => (
                  <Link href={`/t/${topic.slug || ''}`} key={topic.id}>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5 + (i % 2), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }} 
                    className="px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] backdrop-blur-xl cursor-pointer transition-all hover:scale-105 group font-sans flex items-center hover:bg-white/[0.06]">
                      {topic.type === 'HASHTAG' && <span className="text-gray-500 group-hover:text-white transition-colors ml-1.5 font-light text-base md:text-lg">#</span>}
                      <span className="text-xs md:text-lg font-bold" style={{ color: i % 2 === 0 ? 'white' : (data.themeColor || '#06b6d4') }}>{topic.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* اشخاص و پدیدآورندگان */}
        {data.showCreators && data.creators?.length > 0 && (
          <section className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
              <div className="w-1.5 md:w-2 h-8 md:h-10 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: data.themeColor || '#06b6d4', color: data.themeColor || '#06b6d4' }}></div>
              <h3 className="text-xl md:text-3xl font-black font-sans">{data.creatorsTitle}</h3>
            </div>
            <div className="flex flex-wrap gap-6 md:gap-16 items-start justify-center sm:justify-start">
              {data.creators.map((creator, i) => (
                <Link href={`/t/${creator.slug || ''}`} key={creator.id}>
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-3 md:gap-5 group cursor-pointer w-20 md:w-32">
                    <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-2 border border-white/[0.05] group-hover:border-white/[0.15] bg-white/[0.03] backdrop-blur-md">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                      {creator.imageUrl ? <img src={creator.imageUrl} alt={creator.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 opacity-90 group-hover:opacity-100" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><Icon name="user" className="w-8 h-8 md:w-10 md:h-10" /></div>}
                    </div>
                    <span className="text-xs md:text-base font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight font-sans">{creator.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* محتوای پرونده */}
        {data.contents?.length > 0 && (
          <section className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-6 mb-8 md:mb-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 md:w-2 h-8 md:h-10 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: data.themeColor || '#06b6d4', color: data.themeColor || '#06b6d4' }}></div>
                <h3 className="text-xl md:text-3xl font-black font-sans">محتوای پرونده</h3>
              </div>
              
              {/* تب‌های فیلتر با مخفی‌کننده اسکرول بار برای موبایل */}
              <div className="flex gap-2 bg-white/[0.02] backdrop-blur-md shadow-[inset_0_0_15px_rgba(255,255,255,0.01)] p-1.5 rounded-2xl border border-white/[0.05] overflow-x-auto w-full md:w-auto pb-2 md:pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {['همه', 'فوتیج و راش', 'محتوای تولیدی', 'ابزارها', 'بلاگ'].map((cat, i) => (
                  <button key={i} onClick={() => { setActiveFilter(cat); setVisibleCount(6); }} className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-colors whitespace-nowrap font-sans border ${activeFilter === cat ? 'bg-white/[0.08] text-white shadow-md border-white/[0.1]' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}>{cat}</button>
                ))}
              </div>
            </div>

            {displayedContents.length === 0 ? (
              <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.05]">
                 <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                 <EmptyState icon="folder" title="محتوایی یافت نشد!" description="برای این بخش هنوز محتوایی ثبت نشده است." color={data.themeColor || '#06b6d4'} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {displayedContents.map((content, i) => (
                  <ContentCard key={content.id} content={content} index={i} />
                ))}
              </div>
            )}

            {visibleCount < filteredContents.length && (
              <div className="flex justify-center pt-8">
                <button onClick={() => setVisibleCount(prev => prev + 6)} className="relative group bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] text-white px-8 md:px-10 py-3 md:py-3.5 rounded-full font-bold flex items-center gap-2 md:gap-3 hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-300 cursor-pointer font-sans text-xs md:text-sm">
                  <span>نمایش موارد بیشتر</span>
                  <Icon name="caretDown" className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* باکس اقدام (CTA) */}
        {data.showTipLine && (
          <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-white/[0.05] overflow-hidden text-center flex flex-col items-center shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.02)] group">
            <div className="absolute top-0 inset-x-0 h-[2px] opacity-50 bg-gradient-to-r from-transparent via-emerald-500 to-transparent pointer-events-none z-20" />
            
            <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-64 h-64 md:w-96 md:h-96 bg-emerald-500/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-80" />
            <div className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-80" />
            
            <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 mb-4 md:mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {isTipIconUrl ? <img src={data.tipBtnIcon} alt="icon" className="w-full h-full object-contain" /> : <Icon name={data.tipBtnIcon || 'shieldCheck'} className="w-12 h-12 md:w-14 md:h-14 text-emerald-400" />}
            </div>
            
            <h5 className="text-emerald-400 font-bold text-xs md:text-sm mb-2 md:mb-3 tracking-widest uppercase font-sans relative z-10">{data.tipPreTitle}</h5>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 drop-shadow-md font-sans leading-tight relative z-10">{data.tipTitle}</h2>
            
            <div className="text-gray-300 max-w-xl mx-auto leading-relaxed mb-6 md:mb-10 font-light text-sm md:text-base font-sans text-justify [text-align-last:center] px-2 relative z-10">
              <p>{data.tipDesc}</p>
            </div>
            
            <Link href={data.tipBtnLink || '#'} className="group/btn relative inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white/[0.04] backdrop-blur-md hover:bg-emerald-500/20 text-white rounded-xl md:rounded-2xl font-bold transition-all border border-white/[0.05] hover:border-emerald-500/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] font-sans text-xs md:text-sm cursor-pointer w-full sm:w-auto justify-center z-10">
              <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover/btn:opacity-10 transition-opacity rounded-inherit" />
              <span className="relative z-10">{data.tipBtnText}</span>
              <Icon name="chevronLeft" className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 group-hover/btn:-translate-x-1 transition-transform relative z-10 rtl:rotate-180" />
            </Link>
          </motion.section>
        )}

      </main>
    </div>
  );
}