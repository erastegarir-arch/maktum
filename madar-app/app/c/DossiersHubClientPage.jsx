'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Icon from '@/app/components/Icon'; 
import Breadcrumbs from '@/app/components/Breadcrumbs';

// کاور اسلایدر با ماسک نرم به عنوان پس‌زمینه
// اصلاح Z-Index: به جای z-0 از -z-20 استفاده شده تا کاملاً زیر گوی‌های متحرک محیطی قرار بگیرد
// کاور اسلایدر با ماسک نوری پیشرفته (حذف کامل گرادینت‌های رنگی مسدودکننده نور و خط برش)
const FadingHero = ({ desktopImg, mobileImg }) => {
  if (!desktopImg && !mobileImg) return null;

  // ترکیب ماسک вертикаلی (برای محو شدن ۱۰۰ درصدی قبل از رسیدن به انتهای باکس) و ماسک شعاعی (برای نرمی کناره‌ها)
  const maskStyle = {
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 95%), radial-gradient(ellipse 90% 80% at 50% 25%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 95%)',
    WebkitMaskComposite: 'source-in',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 95%), radial-gradient(ellipse 90% 80% at 50% 25%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 95%)',
    maskComposite: 'intersect',
  };

  return (
    <div 
      className="absolute top-0 inset-x-0 h-[65vh] md:h-[80vh] pointer-events-none z-0 overflow-hidden select-none"
      style={maskStyle}
    >
      {desktopImg && (
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105" 
          style={{ backgroundImage: `url(${desktopImg})`, opacity: 0.32 }} 
        />
      )}
      {mobileImg && (
        <div 
          className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105" 
          style={{ backgroundImage: `url(${mobileImg})`, opacity: 0.32 }} 
        />
      )}
    </div>
  );
};

// کارت‌های نمایش منظومه‌ها
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
      <Link 
        href={`/c/${dossier.slug}`} 
        ref={cardRef} 
        onMouseMove={handleMouseMove} 
        // اصلاح گلس مورفیسم: شفافیت بیشتر (bg-white/[0.02] و backdrop-blur-2xl) برای عبور نور از درون کارت‌ها
        className={`group relative flex flex-col rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] ${isVIP ? 'h-[400px] md:h-[550px]' : 'h-[350px] md:h-[400px]'}`} 
        style={{ '--theme-glow': `rgba(${glowRGB}, 0.08)` }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 opacity-50 group-hover:opacity-100 pointer-events-none z-20" style={{ background: `linear-gradient(to right, transparent, ${dossier.themeColor || '#06b6d4'}, transparent)` }} />
        <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),var(--theme-glow),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:block" />

        <div className="absolute inset-0 z-0">
          {(dossier.coverMobile || dossier.coverDesktop) && (
            // کاهش کدری تصویر از opacity-95 به opacity-85 برای درخشش بیشتر در لایه‌های زیرین
            <img src={dossier.coverDesktop || dossier.coverMobile} className={`w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105 ${!isVIP && 'grayscale-[40%] group-hover:grayscale-0'}`} alt={dossier.title} />
          )}
          {/* گرادینت شفاف برای عدم مسدودسازی نور محیط */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/50 to-transparent opacity-95 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className={`absolute inset-0 flex flex-col justify-end items-start z-20 ${isVIP ? 'p-8 md:p-16' : 'p-6 md:p-8'}`}>
          {!isVIP && <div className="w-10 md:w-12 h-1 mb-4 md:mb-5 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 group-hover:w-20 md:group-hover:w-24" style={{ backgroundColor: dossier.themeColor || '#06b6d4', color: dossier.themeColor || '#06b6d4' }}></div>}
          
          {dossier.preTitle && (
            <div className={`flex items-center gap-2 mb-3 md:mb-4 ${isVIP ? 'px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/5 shadow-inner' : ''}`}>
               {isVIP && (
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse" style={{ backgroundColor: dossier.themeColor || '#06b6d4', boxShadow: `0 0 10px ${dossier.themeColor || '#06b6d4'}` }}></span>
               )}
               <span className={`font-bold drop-shadow-md font-sans ${isVIP ? 'text-[10px] md:text-xs text-white' : 'text-xs md:text-sm text-gray-300'}`}>{dossier.preTitle}</span>
            </div>
          )}
          
          <h3 className={`font-black text-white mb-3 md:mb-4 drop-shadow-xl font-sans group-hover:-translate-y-1 transition-transform duration-300 leading-[1.3] md:leading-[1.4] ${isVIP ? 'text-3xl md:text-5xl' : 'text-xl md:text-3xl'}`} style={isVIP ? { color: dossier.themeColor || '#06b6d4' } : {}}>{dossier.title}</h3>
          
          {isVIP && dossier.description && <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-4xl line-clamp-2 md:line-clamp-3 leading-relaxed font-light font-sans mb-6 md:mb-8 text-justify [text-align-last:right] pr-1">{dossier.description}</p>}

          {isVIP && (
            <div className="flex items-center gap-4 text-[11px] md:text-sm font-bold text-white transition-all duration-300 w-max font-sans">
              <span className="bg-white/5 hover:bg-white/10 px-5 py-2.5 md:px-6 md:py-3 rounded-full border border-transparent shadow-inner flex items-center gap-2 md:gap-3 transition-colors">
                مشاهده پرونده <Icon name="chevronLeft" className="w-3 h-3 md:w-4 md:h-4 rtl:rotate-180" />
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
    // حذف رنگ ثابت bg-[#050810] تا پس‌زمینه شفاف باشد و نور AmbientBackground عبور کند
    <div dir="rtl" className="min-h-screen text-white font-sans text-right overflow-hidden relative select-none selection:bg-cyan-500/30 flex flex-col">
      
      {/* پس‌‌زمینه محو شونده بالای صفحه (اکنون کاملا در لایه زیرین قرار دارد) */}
      <FadingHero desktopImg={hubSettings.bgDesktop} mobileImg={hubSettings.bgMobile} />

      {/* 
        ================= ساختار استاندارد مطابق فایل الگو =================
        استفاده از کلاس‌های دقیقاً مشابه: space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0
      */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
        
        {/* برادکرامب */}
        <Breadcrumbs items={[ { label: 'مدار', href: '/' }, { label: 'منظومه‌های محتوایی' } ]} />

        {/* ================= هدر اصلی (Hero) ================= */}
        {/* کلاس‌های mt-6 md:mt-12 برای جلوگیری از دو برابر شدن فواصل با space-y حذف شدند */}
        <section className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center group">
          
          {/* آیکون با ابعاد و افکت‌های دقیقاً مطابق الگوی ارسالی (بدون چرخش) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }} 
            // گلس‌مورفیسم آیکون هیرو
            className="group/icon cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/20 flex items-center justify-center mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300"
          >
            {isIconUrl ? (
              <img src={hubSettings.icon} alt="Hub Icon" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover/icon:scale-110" />
            ) : (
              <Icon name={hubSettings.icon || 'grid'} className="w-6 h-6 md:w-8 md:h-8 text-gray-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover/icon:scale-110" />
            )}
          </motion.div>
          
          {/* عنوان با سایز استاندارد الگو */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }} 
            className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text font-sans" 
            style={{ backgroundImage: `linear-gradient(to bottom, ${hubSettings.titleGradientStart || '#ffffff'}, ${hubSettings.titleGradientEnd || '#9ca3af'})` }}
          >
            {hubSettings.title || 'منظومه‌های محتوایی مدار'}
          </motion.h1>
          
          {hubSettings.description && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }} 
              // اصلاح: تراز دقیق متن (text-justify و dir-rtl) و وسط‌چین شدن خط آخر (text-align-last:center)
              // اصلاح: اضافه شدن پدینگ پایین (pb-10 md:pb-16) برای ایجاد فاصله عمیق‌تر با کارت‌های زیرین
              className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify w-full px-4 md:px-0 max-w-2xl mx-auto drop-shadow-md pb-10 md:pb-16 [text-align-last:center]"
              style={{ direction: 'rtl' }}
            >
              <p>{hubSettings.description}</p>
            </motion.div>
          )}
        </section>

        {/* ================= شبکه نمایش کارت‌ها ================= */}
        {/* اصلاح: اضافه شدن پدینگ بالا (pt-4 md:pt-8) به کانتینر کارت‌ها برای اطمینان از فاصله‌گذاری مناسب در همه دستگاه‌ها */}
        <section className="pt-4 md:pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {visibleDossiers.map((dossier, i) => (
              <DossierCard key={dossier.id} dossier={dossier} isVIP={dossier.layoutSize === 'VIP'} index={i} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}