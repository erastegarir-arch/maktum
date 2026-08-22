'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Icon from '@/app/components/Icon';
import BlurImage from '@/app/components/BlurImage';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Link from 'next/link';

// === اکشن‌های بک‌اند ===
import { getAllDossiers, getHubSettings } from '@/app/actions/dossier';

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const HubSkeleton = () => (
  <div className="min-h-screen bg-[#050810] animate-pulse pb-20">
    <div className="h-[60vh] bg-white/5 border-b border-white/5 w-full" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
      <div className="h-96 md:col-span-2 md:row-span-2 bg-white/5 rounded-[2rem] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white/5 rounded-[2rem] border" />)}
      </div>
    </div>
  </div>
);

const FloatingParticles = memo(({ color }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if(!isMounted) return null;

  const particles = Array.from({ length: 6 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 50, x: Math.random() * 100 - 50, opacity: 0, scale: 0 }}
          animate={{ y: -150, x: Math.random() * 100 - 50, opacity: [0, 0.8, 0], scale: Math.random() * 1.5 + 0.5 }}
          transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, delay: Math.random() * 2, ease: "easeOut" }}
          className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      ))}
    </div>
  );
});
FloatingParticles.displayName = 'FloatingParticles';

const DossierCard = ({ dossier, index }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const isLarge = index === 0;
  const isMedium = index === 1 || index === 2;
  const themeColor = dossier.themeColor || '#06b6d4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 z-10
        ${isLarge ? 'md:col-span-2 md:row-span-2 min-h-[450px] lg:min-h-[550px]' : isMedium ? 'md:col-span-2 lg:col-span-1 min-h-[350px]' : 'col-span-1 min-h-[350px]'}`}
      style={{ '--theme-glow': themeColor, boxShadow: isHovered ? `0 20px 40px -15px ${themeColor}40` : '0 10px 30px -20px rgba(0,0,0,0.5)' }}
    >
      <Link href={`/c/${dossier.slug}`} className="absolute inset-0 z-20" />

      <div className="absolute inset-0 bg-[#080c16] -z-20" />
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 group-hover:scale-110 transform -z-10">
        <BlurImage src={dossier.hubCoverDesktop || dossier.coverDesktop || '/images/placeholder.jpg'} alt={dossier.title} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/70 to-transparent -z-10" />
      
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 mix-blend-screen"
           style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--theme-glow) 0%, transparent 40%)`, opacity: 0.15 }} />

      <AnimatePresence>
        {isHovered && <FloatingParticles color={themeColor} />}
      </AnimatePresence>

      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end">
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold text-white shadow-lg">
            <Icon name="folder" className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>{toPersianDigits(dossier._count?.contents || 0)} فایل</span>
          </div>
        </div>

        <motion.div animate={{ y: isHovered ? -5 : 0 }} transition={{ duration: 0.3 }}>
          {dossier.preTitle && (
            <h4 className="text-xs font-bold mb-2 tracking-wider uppercase" style={{ color: themeColor }}>{dossier.preTitle}</h4>
          )}
          <h2 className={`${isLarge ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'} font-black text-white mb-3 leading-tight drop-shadow-lg`}>{dossier.title}</h2>
          <p className={`text-sm text-gray-400 font-light leading-relaxed transition-all duration-300 ${isLarge ? 'line-clamp-3' : 'line-clamp-2'} ${isHovered ? 'text-gray-300' : ''}`}>
            {dossier.description}
          </p>
          <div className="h-1 w-0 group-hover:w-full mt-6 transition-all duration-700 ease-out rounded-full"
               style={{ background: `linear-gradient(to right, ${dossier.gradientFrom || themeColor}, ${dossier.gradientTo || themeColor})` }} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function DossiersHubPage() {
  const [dossiers, setDossiers] = useState([]);
  const [hubSettings, setHubSettings] = useState({ title: 'پرونده‌های ویژه مدار', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5); 

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    async function loadHubData() {
      try {
        const [dosRes, settingsRes] = await Promise.all([
          getAllDossiers(),
          getHubSettings()
        ]);
        if (dosRes?.success) {
          setDossiers(dosRes.data.filter(d => d.isVisibleInHub !== false).sort((a, b) => a.orderIndex - b.orderIndex));
        }
        if (settingsRes) setHubSettings(settingsRes);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadHubData();
  }, []);

  if (isLoading) return <HubSkeleton />;

  return (
    <div className="relative min-h-screen bg-[#050810] font-sans text-right select-none overflow-hidden pb-32">
      <div className="relative h-[60vh] md:h-[70vh] flex flex-col justify-center overflow-hidden border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="absolute inset-0 w-full h-full -z-20">
          <div className="absolute inset-0 bg-[#050810]/70 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent z-20" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#06b6d4]/10 blur-[120px] rounded-full z-10 pointer-events-none" />
        </motion.div>

        <div className="relative z-20 max-w-5xl w-full mx-auto px-6 pt-28 pb-10 text-center">
          <div className="mb-10 flex justify-center"><Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'منظومه‌ها' }]} /></div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.2)]">
              <Icon name="folder" className="w-10 h-10 text-[#06b6d4]" />
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-gray-200 to-gray-500 mb-6 leading-tight">
            {hubSettings.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-base md:text-lg text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            {hubSettings.description}
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24">
        {dossiers.length === 0 ? (
           <div className="text-center text-gray-400 py-20 bg-[#080c16] rounded-3xl border">هنوز پرونده‌ای منتشر نشده است.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              <AnimatePresence>
                {dossiers.slice(0, visibleCount).map((dossier, index) => (
                  <DossierCard key={dossier.id} dossier={dossier} index={index} />
                ))}
              </AnimatePresence>
            </div>
            {dossiers.length > visibleCount && (
              <div className="mt-16 flex justify-center">
                <button onClick={() => setVisibleCount(prev => prev + 3)} className="px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all hover:-translate-y-1 active:scale-95 shadow-xl cursor-pointer">نمایش منظومه‌های بیشتر</button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.8)] pointer-events-none" />
    </div>
  );
}