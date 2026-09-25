'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Icon from '@/app/components/Icon'; 
import Breadcrumbs from '@/app/components/Breadcrumbs';

const FadingHero = ({ desktopImg, mobileImg }) => {
  if (!desktopImg && !mobileImg) return null;
  const maskGradient = 'radial-gradient(circle at center, black 10%, transparent 75%)';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {desktopImg && <div className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000" style={{ backgroundImage: `url(${desktopImg})`, opacity: 0.35, maskImage: maskGradient, WebkitMaskImage: maskGradient }} />}
      {mobileImg && <div className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000" style={{ backgroundImage: `url(${mobileImg})`, opacity: 0.35, maskImage: maskGradient, WebkitMaskImage: maskGradient }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-[#050810] opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-transparent to-[#050810] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#050810] via-transparent to-[#050810] opacity-90" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050810] to-transparent opacity-100" />
    </div>
  );
};

const DossierCard = ({ dossier, isVIP, index }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#06b6d4');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '6, 182, 212';
  };

  const glowRGB = hexToRgb(dossier.themeColor);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={isVIP ? "md:col-span-2 lg:col-span-3" : "col-span-1"}>
      <Link href={`/c/${dossier.slug}`} ref={cardRef} onMouseMove={handleMouseMove} className={`group relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 border border-transparent bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] ${isVIP ? 'h-[450px] md:h-[550px]' : 'h-[400px]'}`} style={{ '--theme-glow': `rgba(${glowRGB}, 0.08)` }}>
        <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-50 group-hover:opacity-100 pointer-events-none z-20" style={{ background: `linear-gradient(to right, transparent, ${dossier.themeColor || '#06b6d4'}, transparent)` }} />
        <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        <div className="absolute inset-0 z-0">
          {(dossier.coverMobile || dossier.coverDesktop) && (
            <img src={dossier.coverDesktop || dossier.coverMobile} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${!isVIP && 'grayscale-[40%] group-hover:grayscale-0'}`} alt={dossier.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/70 to-transparent opacity-95 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className={`absolute inset-0 flex flex-col justify-end items-start z-20 ${isVIP ? 'p-10 md:p-16' : 'p-8'}`}>
          {!isVIP && <div className="w-12 h-1 mb-5 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 group-hover:w-24" style={{ backgroundColor: dossier.themeColor || '#06b6d4', color: dossier.themeColor || '#06b6d4' }}></div>}
          
          {dossier.preTitle && <span className={`font-bold mb-4 block drop-shadow-md font-sans ${isVIP ? 'text-xs px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl text-white border border-white/5' : 'text-sm text-gray-300'}`}>{dossier.preTitle}</span>}
          
          <h3 className={`font-black text-white mb-4 drop-shadow-xl font-sans group-hover:-translate-y-1 transition-transform duration-300 ${isVIP ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'}`} style={isVIP ? { color: dossier.themeColor || '#06b6d4' } : {}}>{dossier.title}</h3>
          
          {isVIP && dossier.description && <p className="text-sm md:text-base text-gray-300 max-w-4xl line-clamp-2 leading-relaxed font-light font-sans mb-8 text-justify">{dossier.description}</p>}

          {isVIP && (
            <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-white transition-all duration-300 w-max font-sans">
              <span className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-transparent shadow-inner flex items-center gap-3 transition-colors">
                مشاهده پرونده <Icon name="chevronLeft" className="w-4 h-4 rtl:rotate-180" />
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 inset-x-0 h-1/2 opacity-30 mix-blend-screen pointer-events-none transition-opacity duration-700 group-hover:opacity-50" style={{ background: `radial-gradient(ellipse at bottom, ${dossier.themeColor || '#06b6d4'}50 0%, transparent 70%)` }} />
      </Link>
    </motion.div>
  );
};

export default function DossiersHubClientPage({ hubSettings = {}, dossiers = [] }) {
  const visibleDossiers = dossiers.filter(d => d.isVisibleInHub !== false);
  const isIconUrl = hubSettings.icon && (hubSettings.icon.includes('/') || hubSettings.icon.startsWith('http'));

  return (
    <div dir="rtl" className="min-h-screen bg-[#050810] text-white font-sans text-right pb-24 overflow-hidden relative select-none selection:bg-cyan-500/30">
      
      {/* برادکرامب با z-index پایین‌تر برای جلوگیری از تداخل با هدر */}
      <div className="relative z-20 pt-8 px-4 md:px-8 w-full max-w-7xl mx-auto">
        <Breadcrumbs items={[ { label: 'مدار', href: '/' }, { label: 'منظومه‌های محتوایی' } ]} />
      </div>

      <section className="relative w-full min-h-[40vh] flex flex-col justify-center items-center pb-16 pt-10">
        <FadingHero desktopImg={hubSettings.bgDesktop} mobileImg={hubSettings.bgMobile} />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none -z-10"></div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-4 group">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-[2rem] bg-white/5 border border-transparent shadow-inner backdrop-blur-3xl flex items-center justify-center mb-6">
            {isIconUrl ? <img src={hubSettings.icon} alt="Hub Icon" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" /> : <Icon name={hubSettings.icon || 'grid'} className="w-10 h-10 text-gray-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />}
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-transparent bg-clip-text drop-shadow-sm font-sans" style={{ backgroundImage: `linear-gradient(to bottom, ${hubSettings.titleGradientStart || '#ffffff'}, ${hubSettings.titleGradientEnd || '#d1d5db'})` }}>
            {hubSettings.title || 'منظومه‌های محتوایی مدار'}
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed font-light text-justify backdrop-blur-sm font-sans">
            {hubSettings.description}
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleDossiers.map((dossier, i) => (
            <DossierCard key={dossier.id} dossier={dossier} isVIP={dossier.layoutSize === 'VIP'} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}