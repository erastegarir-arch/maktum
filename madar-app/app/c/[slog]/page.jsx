'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'; 
import Icon from '@/app/components/Icon';
import BlurImage from '@/app/components/BlurImage';
import Breadcrumbs from '@/app/components/Breadcrumbs';

// اکشن دریافت اطلاعات از دیتابیس
import { getDossierBySlug } from '@/app/actions/dossier'; 

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// تولید لینک محتوا
const getContentUrl = (content) => {
  if (!content) return '#';
  switch (content.type) {
    case 'BLOG': return `/blog/${content.slug}`;
    case 'RAW': return `/f/${content.slug}`;
    case 'TOOL': return `/tool/${content.slug}`;
    case 'PRODUCED': return `/p/${content.slug}`;
    default: return `/p/${content.slug}`;
  }
};

// فرمت‌دهی لینک‌های خارجی
const formatExternalLink = (url) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// رنگ‌های داینامیک هشتگ‌ها
const tagColors = [
  'text-rose-400 border-rose-500/30 bg-rose-500/10',
  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  'text-amber-400 border-amber-500/30 bg-amber-500/10',
  'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10',
  'text-blue-400 border-blue-500/30 bg-blue-500/10',
];

// ==========================================
// ۱. کامپوننت اسکلتون (کد اصلی خودتان)
// ==========================================
const DossierSkeleton = () => (
  <div className="min-h-screen bg-[#050810] animate-pulse pb-20">
    <div className="h-[50vh] md:h-[60vh] bg-white/5 border-b border-white/10 w-full" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
      <div className="h-64 bg-white/5 rounded-3xl border border-white/10" />
      <div className="h-40 bg-white/5 rounded-3xl border border-white/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 rounded-3xl border border-white/10" />)}
      </div>
    </div>
  </div>
);

// ==========================================
// ۲. کامپوننت افکت ذرات شناور
// ==========================================
const RisingParticles = memo(({ color }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  const particles = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 250, x: Math.random() * 160 - 80, opacity: 0, scale: 0 }}
          animate={{ y: -30, x: Math.random() * 80 - 40, opacity: [0, 0.8, 0], scale: Math.random() * 1.2 + 0.4 }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
          className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      ))}
    </div>
  );
});
RisingParticles.displayName = 'RisingParticles';

// ==========================================
// ۳. کامپوننت کارت محتوا (اصلاح ابعاد تصاویر)
// ==========================================
const ContentCard = ({ content }) => {
  const typeColors = { RAW: '#06b6d4', PRODUCED: '#10b981', TOOL: '#f59e0b', BLOG: '#f43f5e' };
  const cardColor = typeColors[content?.type] || '#8b5cf6';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      // اصلاح 16:9 دسکتاپ و 1:1 موبایل
      className="group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer aspect-square md:aspect-video w-full border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.7)] hover:border-white/20" 
      style={{ '--card-color': cardColor }}
    >
      {/* لینک شدن کل کادر محتوا */}
      <Link href={getContentUrl(content)} className="absolute inset-0 z-20" />

      <div className="absolute inset-0 bg-[#080c16] -z-30" />
      <div className="hidden md:block absolute inset-0 opacity-40 group-hover:opacity-65 transition-transform duration-700 group-hover:scale-105 -z-20">
        <BlurImage src={content?.coverDesktop || content?.image || '/images/placeholder.jpg'} alt={content?.titleBase || content?.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="block md:hidden absolute inset-0 opacity-40 group-hover:opacity-65 transition-transform duration-700 group-hover:scale-105 -z-20">
        <BlurImage src={content?.coverMobile || content?.coverDesktop || content?.image || '/images/placeholder.jpg'} alt={content?.titleBase || content?.title} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/40 to-transparent -z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-25 group-hover:opacity-45 transition-opacity duration-500 -z-10 mix-blend-screen pointer-events-none" style={{ background: `linear-gradient(to top, var(--card-color) 0%, transparent 100%)` }} />
      <div className="absolute -bottom-8 inset-x-8 h-16 blur-2xl opacity-30 group-hover:opacity-55 transition-opacity duration-500 -z-10 pointer-events-none" style={{ backgroundColor: 'var(--card-color)' }} />
      <RisingParticles color={cardColor} />
      <div className="relative z-10 p-5 h-full flex flex-col justify-end items-center text-center">
        <h3 className="text-sm md:text-base font-black text-white leading-relaxed line-clamp-2 drop-shadow-lg group-hover:text-[var(--card-color)] transition-colors">
          {content?.titleBase || content?.title}
        </h3>
      </div>
    </motion.div>
  );
};

// ==========================================
// ۴. کامپوننت اصلی صفحه
// ==========================================
export default function DossierPage({ params }) {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4); 

  // منطق اصلی خودتان که با موفقیت اطلاعات را آورد
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const unwrappedParams = await Promise.resolve(params);
        const rawSlug = unwrappedParams?.slug || Object.values(unwrappedParams || {})[0];

        if (!rawSlug) {
          if (isMounted) { setErrorMsg('لینک نامعتبر است.'); setIsLoading(false); }
          return;
        }

        const decodedSlug = decodeURIComponent(rawSlug).trim().toLowerCase();
        const res = await getDossierBySlug(decodedSlug);

        if (isMounted) {
          if (res?.success && res?.data) {
            setDossier(res.data);
          } else {
            setErrorMsg(res?.error || 'پرونده‌ای یافت نشد.');
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (isMounted) setErrorMsg('خطا در ارتباط با سرور.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    loadData();
    return () => { isMounted = false; };
  }, [params]);

  if (isLoading) return <DossierSkeleton />;
  if (errorMsg || !dossier) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">{errorMsg || 'پرونده‌ای یافت نشد.'}</div>;

  return (
    <div className="relative min-h-screen bg-[#050810] font-sans text-right select-none pb-20 overflow-hidden">
      
      <div className="relative w-full flex flex-col justify-center border-b border-white/5 overflow-hidden min-h-[50vh] md:min-h-[60vh]">
        <div className="absolute inset-0 flex justify-center items-center -z-30 bg-[#050810]">
           <div className="relative w-full h-full md:max-w-[1920px] md:aspect-video">
             {/* ارور priority با حذف این اتریبیوت برطرف شد */}
             <BlurImage src={dossier?.coverDesktop || dossier?.hubCoverDesktop || '/images/placeholder.jpg'} alt={dossier?.title || 'پرونده'} className="w-full h-full object-cover opacity-30" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-[#050810]" />
             <div className="absolute inset-0 bg-gradient-to-l from-[#050810] via-transparent to-[#050810]" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-transparent to-[#050810]" />
           </div>
        </div>

        <div className="absolute inset-0 z-0 flex items-center justify-end pointer-events-none opacity-20 overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="w-[800px] h-[800px] rounded-full border border-white/10 border-dashed absolute -right-[200px]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="w-[600px] h-[600px] rounded-full border border-white/20 border-dashed absolute -right-[100px]" />
        </div>
        
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full mix-blend-screen opacity-20 pointer-events-none -z-10" 
             style={{ background: `radial-gradient(ellipse at right center, ${dossier?.themeColor || '#06b6d4'} 0%, transparent 70%)` }} />

        {/* پدینگ بالا کاهش یافت تا فاصله بردکرامب تنظیم شود */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-20 md:pt-24 pb-12">
          
          <div className="mb-4">
            <Breadcrumbs items={[
              { label: 'مدار', href: '/' },
              { label: 'منظومه‌ها', href: '/c' },
              { label: dossier?.title || 'پرونده' }
            ]} />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {dossier?.preTitle && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold text-white mb-5 tracking-widest" style={{ color: dossier?.themeColor || '#fff', borderColor: `${dossier?.themeColor || '#fff'}50` }}>
                <span className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentcolor]" style={{ backgroundColor: dossier?.themeColor || '#fff' }}></span>
                {dossier?.preTitle}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 drop-shadow-2xl leading-tight">
              {dossier?.title}
            </h1>
            
            <p className="text-sm text-gray-300 font-light leading-loose max-w-3xl border-r-2 pl-4" style={{ borderColor: dossier?.themeColor || '#fff' }}>
              {dossier?.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* z-index محتوای صفحه از z-40 به z-10 کاهش یافت تا هدر اصلی سایت پنهان نشود */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-12 space-y-12 relative z-10">

        {dossier?.showRadar !== false && dossier?.topics?.length > 0 && (
          <section className="relative p-8 rounded-3xl bg-[#0b0f19]/60 backdrop-blur-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                 <div className="w-full md:w-1/3 text-center md:text-right">
                    <Icon name="hashtag" className="w-8 h-8 text-white mb-2 mx-auto md:mx-0 opacity-80" />
                    <h2 className="text-2xl font-black text-white mb-2">{dossier?.radarTitle || 'رادار موضوعی پرونده'}</h2>
                    <p className="text-gray-400 font-light text-xs leading-loose">
                      هشتگ‌ها و سرفصل‌های اصلی که محتواهای این پرونده حول آن‌ها طبقه‌بندی شده‌اند.
                    </p>
                 </div>
                 
                 <div className="w-full md:w-2/3 flex flex-wrap gap-3 justify-center md:justify-end items-center relative py-6 md:py-0">
                    {dossier?.topics.map((topic, i) => {
                        const colorClass = tagColors[i % tagColors.length];
                        return (
                          // لینکدهی به سرشاخه‌ها با /t/ و اعمال رنگ خودکار
                          <Link key={topic?.id || i} href={`/t/${topic?.slug}`} className={`rounded-full border ${colorClass} text-sm px-4 py-2 font-bold hover:scale-105 transition-all cursor-pointer backdrop-blur-md shadow-md`} 
                             style={{ animation: `float 4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
                              {topic?.name}
                          </Link>
                        );
                    })}
                 </div>
              </div>
          </section>
        )}

        {dossier?.showCreators !== false && dossier?.creators?.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                <span className="w-2 h-6 rounded-full" style={{ backgroundColor: dossier?.themeColor || '#fff', boxShadow: `0 0 10px ${dossier?.themeColor || '#fff'}` }}></span> 
                {dossier?.creatorsTitle || 'اشخاص و پدیدآورندگان'}
              </h2>
            </div>
            
            <div className="flex gap-6 overflow-x-auto custom-scrollbar py-6 pt-2">
              {dossier?.creators.map((person) => (
                // استفاده از تگ Link با مسیر /t/ و اضافه شدن hover:z-20
                <Link href={`/t/${person?.slug}`} key={person?.id} className="group relative z-10 hover:z-20 flex flex-col items-center min-w-[100px] cursor-pointer">
                  <div className="relative w-24 h-24 rounded-full p-1 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110" style={{ background: `linear-gradient(to bottom right, ${dossier?.themeColor || '#fff'}, transparent)` }}>
                    <div className="w-full h-full rounded-full bg-[#080c16] overflow-hidden border-[3px] border-[#050810]">
                       <BlurImage src={person?.imageUrl || '/images/avatar-default.jpg'} alt={person?.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                    </div>
                  </div>
                  <div className="mt-3 text-center w-full transition-transform duration-500 group-hover:-translate-y-1">
                    <h4 className="text-white text-xs font-bold whitespace-nowrap mb-1">{person?.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {dossier?.contents?.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                <span className="w-2 h-6 rounded-full" style={{ backgroundColor: dossier?.themeColor || '#fff', boxShadow: `0 0 10px ${dossier?.themeColor || '#fff'}` }}></span> محتوای پرونده
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              <AnimatePresence>
                {dossier?.contents.slice(0, visibleCount).map((content, index) => (
                  <ContentCard key={content?.id || index} content={content} />
                ))}
              </AnimatePresence>
            </div>

            {dossier?.contents.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 4)}
                  className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all hover:-translate-y-1 active:scale-95 shadow-lg cursor-pointer"
                >
                  نمایش محتوای بیشتر
                </button>
              </div>
            )}
          </section>
        )}

        {dossier?.showTipLine !== false && (
          <section className="relative p-8 md:p-12 rounded-3xl border border-white/10 overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f19] to-[#050810] -z-20" />
              <div className="absolute inset-0 opacity-10 mix-blend-overlay -z-10" />
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none z-0" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex-1 space-y-3 text-center md:text-right">
                    {dossier?.tipPreTitle && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {dossier?.tipPreTitle}
                      </div>
                    )}
                    <h2 className="text-2xl md:text-4xl font-black text-white">{dossier?.tipTitle || 'سندی در دست دارید؟'}</h2>
                    <p className="text-gray-400 text-xs md:text-sm font-light leading-loose max-w-xl mx-auto md:mx-0">
                        {dossier?.tipDesc || 'اگر به داده خام، ویدیو، یا سندی مرتبط با این پرونده دسترسی دارید، از طریق درگاه امن ما آن را ارسال کنید.'}
                    </p>
                 </div>
                 
                 <div className="flex-none mt-4 md:mt-0">
                    {/* لینک شدن دکمه پورتال به خارج از سایت */}
                    <a href={formatExternalLink(dossier?.tipBtnLink)} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden group/btn inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-gray-900 font-black text-sm md:text-base transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95">
                        <span className="relative z-10 flex items-center gap-2">
                           {dossier?.tipBtnText || 'ارسال امن سند'} <Icon name={dossier?.tipBtnIcon || 'folder'} className="w-5 h-5 animate-bounce" />
                        </span>
                    </a>
                 </div>
              </div>
          </section>
        )}

      </div>
    </div>
  );
}