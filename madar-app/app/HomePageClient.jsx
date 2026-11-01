'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import Icon from '@/app/components/Icon';
import BlurImage from '@/app/components/BlurImage';
import { getSetting } from '@/app/actions/settings';
import { getCreatorsList, getLatestContents } from '@/app/actions/homepage';

// ==========================================
// توابع کمکی
// ==========================================
const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[x]);
};

// ==========================================
// کامپوننت‌های پایه
// ==========================================
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => (
  <div className={`relative overflow-hidden bg-white/5 backdrop-blur-sm ${rounded} ${className}`}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
  </div>
);

const HomePageSkeleton = () => (
  <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050810]/70 backdrop-blur-2xl overflow-hidden select-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
    <div className="relative w-20 h-20 md:w-28 md:h-28 mb-8 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-500/40 animate-[spin_3s_linear_infinite]" />
      <div className="absolute inset-2 md:inset-3 rounded-full border-l-2 border-b-2 border-[#8b5cf6]/50 animate-[spin_2s_linear_infinite_reverse]" />
      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tr from-cyan-400 to-[#8b5cf6] rounded-full animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
    </div>
    <div className="flex flex-col items-center gap-4 relative z-10">
      <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#8b5cf6] tracking-[0.2em] md:tracking-[0.3em] font-sans drop-shadow-lg">
        مـــدار
      </h2>
      <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs font-bold font-sans">
        <span className="animate-pulse">در حال آماده‌سازی</span>
        <div className="flex gap-1" dir="ltr">
          <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  </main>
);

const SpotlightCard = ({ children, themeColor, link = "#" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Link
      href={link}
      target="_blank" rel="noopener noreferrer"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col aspect-square md:aspect-video rounded-[1.5rem] md:rounded-[2rem] group overflow-hidden transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] hover:border-white/[0.15] bg-white/[0.02] backdrop-blur-2xl"
    >
      <div className="absolute inset-0 z-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
      <div className={`absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20`} style={{ background: `linear-gradient(to right, transparent, ${themeColor}, transparent)` }} />
      <div
        className="absolute inset-0 pointer-events-none rounded-inherit z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${themeColor}25, transparent 40%)` }}
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-inherit z-20 opacity-15 md:hidden animate-pulse"
        style={{ background: `radial-gradient(150px circle at 50% 100%, ${themeColor}40, transparent 70%)` }}
      />
      {children}
    </Link>
  );
};

const ScrollReveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

// ==========================================
// کامپوننت اصلی فرانت‌اند (کلاینت)
// ==========================================
export default function HomePageClient() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideDuration = 7000; 

  const [isDesktop, setIsDesktop] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);

  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 3000], [0, -250]);
  const parallaxY2 = useTransform(scrollY, [0, 3000], [0, 300]);
  const parallaxY3 = useTransform(scrollY, [0, 3000], [0, -150]);

  // === افکت موس جادویی (Magic Cursor) - فاز 3 ===
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [dragStart, setDragStart] = useState(null);
  const handleDragStart = (clientX) => setDragStart(clientX);
  const handleDragEnd = (clientX) => {
    if (dragStart === null) return;
    const distance = dragStart - clientX;
    if (distance > 50) {
      setCurrentSlide((prev) => (prev === data.heroSlides.length - 1 ? 0 : prev + 1));
    } else if (distance < -50) {
      setCurrentSlide((prev) => (prev === 0 ? data.heroSlides.length - 1 : prev - 1));
    }
    setDragStart(null);
  };

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined') {
      const checkDesktop = window.innerWidth >= 768;
      setIsDesktop(checkDesktop);

      // اتصال مختصات موس برای نشانگر جادویی
      if (checkDesktop) {
        const moveCursor = (e) => {
          cursorX.set(e.clientX);
          cursorY.set(e.clientY);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
      }
    }

    async function fetchHomePageData() {
      try {
        const parseJSON = (str, fallback) => { try { return str ? JSON.parse(str) : fallback; } catch { return fallback; } };

        const creatorsRes = await getCreatorsList();
        const allCreators = creatorsRes.success ? creatorsRes.data : [];
        const savedInvIds = parseJSON(await getSetting('home_investigators'), []);
        const fullInvestigators = savedInvIds.map(id => allCreators.find(c => c.id === id)).filter(Boolean);

        const contentsRes = await getLatestContents();
        const allContents = contentsRes.success ? contentsRes.data : [];

        const contentConfig = parseJSON(await getSetting('home_content_config'), {
          blog: { title: 'آخرین مطالب بلاگ', subtitle: 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی' },
          raw: { title: 'محتوای راش و خام', subtitle: 'اسناد مکتوب، تصاویر و ویدیوها' },
          produced: { title: 'محتوای تولیدی', subtitle: 'مستندهای اختصاصی و پادکست‌ها' },
          tools: { title: 'ابزارهای کاربردی', subtitle: 'تسهیل در پژوهش با ابزارهای هوشمند' }
        });

        const fetchedData = {
          layoutOrder: parseJSON(await getSetting('home_layout'), []),
          heroSlides: parseJSON(await getSetting('home_hero'), []),
          newsTicker: parseJSON(await getSetting('home_news'), []),
          stats: parseJSON(await getSetting('home_stats'), []),
          dossiersConfig: parseJSON(await getSetting('home_dossiers_config'), { title: 'پرونده‌های باز', subtitle: 'مجموعه اسناد، مقالات و ویدیوهای مرتبط با یک کلان‌موضوع' }),
          dossiers: parseJSON(await getSetting('home_dossiers'), []),
          radarConfig: parseJSON(await getSetting('home_radar_config'), { title: 'رادار موضوعی', subtitle: 'داغ‌ترین موضوعات در حال پیگیری' }),
          radarTopics: parseJSON(await getSetting('home_radar'), []),
          timelineEvents: parseJSON(await getSetting('home_timeline'), []),
          countdown: parseJSON(await getSetting('home_countdown'), { targetDate: '', title: '', desc: '', lockedText: '', unlockedText: '', tooltip: '', link: '#' }),
          investigators: fullInvestigators,
          ctaBox: parseJSON(await getSetting('home_cta'), { preTitle: '', title: '', desc: '', btnText: '', btnLink: '#' }),
          contentConfig: contentConfig,
          blog: allContents.filter(c => c.type === 'BLOG').slice(0, 4),
          raw: allContents.filter(c => c.type === 'RAW').slice(0, 4),
          produced: allContents.filter(c => c.type === 'PRODUCED').slice(0, 4),
          tools: allContents.filter(c => c.type === 'TOOL').slice(0, 4)
        };

        if (isMounted) {
          setData(fetchedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("خطا در دریافت تنظیمات:", error);
        if (isMounted) setIsLoading(false);
      }
    }
    fetchHomePageData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!data || !data.countdown || !data.countdown.targetDate) {
      setIsCountdownFinished(true);
      return;
    }
    const targetDate = new Date(data.countdown.targetDate).getTime();
    if (isNaN(targetDate)) {
      setIsCountdownFinished(true);
      return;
    }
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance <= 0) {
        clearInterval(interval);
        setIsCountdownFinished(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsCountdownFinished(false);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (isLoading || !data) return <HomePageSkeleton />;
  const activeSections = data.layoutOrder.filter(s => s.isActive && s.id !== 'mission').map(s => s.id);

  const sectionsContent = {
    // ---------------- نوار اخبار (اصلاح رنگ تازه‌ها به حالت اصلی) ----------------
    news: data.newsTicker && data.newsTicker.length > 0 ? (
      <ScrollReveal key="news">
        <section className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] py-2.5 md:py-3 md:rounded-2xl flex items-stretch md:mx-6 lg:mx-8">
          
          {/* لیبل 'تازه‌ها' اصلاح شد: بازگشت به تیرگی استاندارد قبلی */}
          <div className="absolute right-0 top-0 bottom-0 z-40 flex items-center px-4 md:px-6 bg-[#050810]/80 backdrop-blur-md shadow-[-15px_0_25px_rgba(5,8,16,0.9)] border-l border-white/[0.05]">
            <span className="text-white font-bold text-[11px] md:text-sm flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
              تازه‌ها
            </span>
          </div>

          <div 
            className="flex items-center group py-2 md:py-3 w-full pl-4 overflow-hidden relative"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)', maskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)' }}
          >
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] pr-[100px] md:pr-[160px]">
              {data.newsTicker.map((news, i) => (
                <React.Fragment key={i}>
                  <Link href={news.link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 md:gap-2 mx-6 md:mx-10 text-[11px] md:text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                    <span className="font-bold drop-shadow-md" style={{ color: news.color }}>{news.tag}:</span> {news.text}
                  </Link>
                  <span className="text-white/10">|</span>
                </React.Fragment>
              ))}
            </div>
            <div className="flex animate-marquee group-hover:[animation-play-state:paused]" aria-hidden="true">
              {data.newsTicker.map((news, i) => (
                <React.Fragment key={`dup-${i}`}>
                  <Link href={news.link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 md:gap-2 mx-6 md:mx-10 text-[11px] md:text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                    <span className="font-bold drop-shadow-md" style={{ color: news.color }}>{news.tag}:</span> {news.text}
                  </Link>
                  <span className="text-white/10">|</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    stats: data.stats && data.stats.length > 0 ? (
      <ScrollReveal key="stats">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {data.stats.map((stat, i) => (
              <div key={i} className="group flex flex-col items-center text-center transition-all duration-500 cursor-default">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 relative" style={{ color: stat.color }}>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${stat.color}80, inset 0 0 20px ${stat.color}40` }}></div>
                  {stat.iconUrl ? (
                    <img src={stat.iconUrl} alt={stat.title} className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_currentColor] z-10" />
                  ) : (
                    <Icon name="database" className="w-6 h-6 md:w-10 md:h-10 drop-shadow-[0_0_10px_currentColor] z-10" />
                  )}
                </div>
                <h3 className="font-bold text-white mb-2 text-sm md:text-xl transition-colors" style={{ textShadow: `0 0 10px ${stat.color}00` }}>{stat.title}</h3>
                <p className="text-[10px] md:text-sm text-gray-400 font-light">{toPersianDigits(stat.desc)}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    countdown: data.countdown && data.countdown.title ? (
      <ScrollReveal key="countdown">
         <section className="px-4 sm:px-6 lg:px-8">
           <motion.div 
             layout
             className={`relative rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col items-center justify-center text-center group transition-all duration-700 ${isCountdownFinished ? 'p-6 md:p-10' : 'p-8 md:p-16'}`}
           >
             <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 group-hover:opacity-10 transition-opacity duration-500 mix-blend-overlay pointer-events-none -z-10"></div>
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full blur-[100px] rounded-full pointer-events-none -z-10 transition-colors duration-1000 ${isCountdownFinished ? 'bg-emerald-500/10' : 'bg-rose-500/5 group-hover:bg-rose-500/10'}`}></div>
             
             <Icon name={isCountdownFinished ? 'folder' : 'lockKey'} className={`w-10 h-10 md:w-14 md:h-14 mb-4 md:mb-6 ${isCountdownFinished ? 'text-emerald-400' : 'text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`} />
             <h2 className="text-xl md:text-4xl font-black text-white mb-3 tracking-tight">{data.countdown.title}</h2>
             
             <AnimatePresence>
               {!isCountdownFinished && data.countdown.desc && (
                 <motion.p 
                   initial={{ opacity: 1, height: 'auto' }} 
                   exit={{ opacity: 0, height: 0 }}
                   className="text-gray-400 font-light text-[11px] md:text-sm max-w-md mx-auto leading-loose mb-8 md:mb-12"
                 >
                   {data.countdown.desc}
                 </motion.p>
               )}
             </AnimatePresence>

             <motion.div layout className="flex flex-col items-center gap-6 md:gap-10">
               <div className="flex items-center gap-3 md:gap-6" dir="ltr">
                 {[
                   { label: 'روز', value: timeLeft.days },
                   { label: 'ساعت', value: timeLeft.hours },
                   { label: 'دقیقه', value: timeLeft.minutes },
                   { label: 'ثانیه', value: timeLeft.seconds }
                 ].map((time, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                     <div className={`w-14 h-16 md:w-24 md:h-28 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center shadow-inner backdrop-blur-md relative overflow-hidden transition-all duration-500 ${isCountdownFinished ? 'border-emerald-500/20' : 'border-white/10'}`}>
                       <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 h-1/2"></div>
                       <span className={`text-3xl md:text-6xl font-black font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${isCountdownFinished ? 'text-emerald-400' : 'text-white'}`}>
                         {toPersianDigits(time.value.toString().padStart(2, '0'))}
                       </span>
                     </div>
                     <span className={`text-[9px] md:text-xs font-bold tracking-widest uppercase font-sans ${isCountdownFinished ? 'text-emerald-400' : 'text-rose-400'}`}>{time.label}</span>
                   </div>
                 ))}
               </div>
               <div className="relative group/tooltip inline-block mt-2">
                 <Link 
                   href={isCountdownFinished ? (data.countdown.link || '#') : '#'}
                   target={isCountdownFinished ? "_blank" : undefined} rel={isCountdownFinished ? "noopener noreferrer" : undefined}
                   className={`relative overflow-hidden inline-flex items-center justify-center px-8 md:px-12 py-3 md:py-4 rounded-2xl font-black text-xs md:text-sm transition-all duration-500 shadow-lg ${
                     isCountdownFinished 
                     ? 'bg-emerald-600 hover:bg-emerald-500 text-gray-900 cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95' 
                     : 'bg-white/5 text-gray-400 cursor-not-allowed border-0 pointer-events-none'
                   }`}
                 >
                   <span className="relative z-10 flex items-center gap-2 md:gap-3 font-sans">
                     {isCountdownFinished ? (
                       <>{data.countdown.unlockedText} <Icon name="download" className="w-4 h-4 md:w-5 md:h-5 animate-bounce" /></>
                     ) : (
                       <>{data.countdown.lockedText} <Icon name="lockKey" className="w-4 h-4 md:w-5 md:h-5" /></>
                     )}
                   </span>
                 </Link>
               </div>
             </motion.div>
           </motion.div>
         </section>
      </ScrollReveal>
    ) : null,

    timeline: data.timelineEvents && data.timelineEvents.length > 0 ? (
      <ScrollReveal key="timeline">
        <section className="space-y-8 relative px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-black text-white mb-2 flex items-center gap-2 md:gap-3">
                <Icon name="clock" className="w-6 h-6 md:w-8 md:h-8 text-amber-400" /> تایم‌لاین افشاگری‌ها
              </h2>
            </div>
          </div>
          <div className="relative border-r-2 border-amber-500/20 pr-6 md:pr-10 ml-4 md:ml-0 space-y-8 md:space-y-10">
            {data.timelineEvents.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="relative group">
                <div className="absolute -right-[33px] md:-right-[49px] top-3 md:top-4 w-4 h-4 rounded-full bg-[#0b0f19] border-2 z-10 transition-transform group-hover:scale-125" style={{ borderColor: item.color, color: item.color, boxShadow: `0 0 15px ${item.color}50` }}></div>
                <div className="absolute -right-[29px] md:-right-[45px] top-4 md:top-5 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: item.color }}></div>
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.3)] p-5 md:p-6 rounded-[1.5rem] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
                  <span className="text-lg md:text-2xl font-black drop-shadow-md mb-2 block font-sans tracking-widest" style={{ color: item.color }}>{toPersianDigits(item.year)}</span>
                  <h3 className="text-white font-bold text-sm md:text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-[11px] md:text-sm leading-relaxed font-light text-justify">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    dossiers: data.dossiers && data.dossiers.length > 0 ? (
      <ScrollReveal key="dossiers">
        <section className="space-y-6 md:space-y-8 relative px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4 border-b border-white/5">
            <h2 className="text-xl md:text-3xl font-black text-white mb-2 flex items-center gap-2 md:gap-3">
              <Icon name="folder" className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" /> {data.dossiersConfig.title}
            </h2>
            <p className="text-[11px] md:text-sm text-gray-400 font-light pr-[32px] md:pr-[44px]">{data.dossiersConfig.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {data.dossiers.map((dossier, i) => (
              <Link key={i} href={dossier.link || '#'} target="_blank" rel="noopener noreferrer" className="relative p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_15px_40px_rgba(0,0,0,0.5)] group overflow-hidden hover:-translate-y-2 hover:border-white/[0.15] transition-all duration-500 flex flex-col h-full">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay group-hover:opacity-10 transition-opacity duration-500 pointer-events-none -z-10" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${dossier.color}15, transparent 60%)` }}></div>
                <div className="absolute -left-6 -bottom-6 opacity-5 group-hover:opacity-15 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12" style={{ color: dossier.color }}>
                  <Icon name="folder" className="w-32 h-32 md:w-40 md:h-40" />
                </div>
                <div className="relative z-10 flex justify-between items-start mb-8 md:mb-12">
                  <span className="px-3 py-1 rounded-md text-[10px] md:text-xs font-bold bg-white/5 text-gray-300 border-0 shadow-inner">پرونده ویژه</span>
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-lg" style={{ backgroundColor: dossier.color, boxShadow: `0 0 10px ${dossier.color}` }}></span>
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 md:mb-2 group-hover:text-white transition-colors">{dossier.title}</h3>
                  <p className="text-xs md:text-sm font-light flex items-center gap-1.5" style={{ color: dossier.color }}>
                    <Icon name="trend" className="w-3 h-3" /> {dossier.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    radar: data.radarTopics && data.radarTopics.length > 0 ? (
      <ScrollReveal key="radar">
        <section className="relative p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-10 mx-4 sm:mx-6 lg:mx-8">
          
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04] mix-blend-overlay pointer-events-none -z-10" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] pointer-events-none opacity-80 mix-blend-screen">
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-90"></div>
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-75"></div>
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-50"></div>
            
            <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite]" 
                 style={{ background: 'conic-gradient(from 0deg, transparent 65%, rgba(6,182,212,0.15) 85%, rgba(6,182,212,0.7) 100%)' }}>
              <div className="absolute top-0 right-1/2 w-[2px] h-1/2 bg-cyan-400 blur-[1px] transform origin-bottom shadow-[0_0_20px_#22d3ee]"></div>
            </div>
            
            <div className="absolute top-[30%] left-[60%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping"></div>
            <div className="absolute top-[60%] left-[30%] w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185] animate-[ping_2s_infinite]" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-[75%] left-[70%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-[ping_3s_infinite]" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-[40%] left-[35%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-[ping_2.5s_infinite]" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="w-full md:w-1/3 relative z-10 text-center md:text-right">
            <h2 className="text-xl md:text-3xl font-black text-white mb-2 md:mb-3">{data.radarConfig.title}</h2>
            <p className="text-gray-400 font-light text-[11px] md:text-sm leading-loose max-w-sm mx-auto md:mx-0">{data.radarConfig.subtitle}</p>
          </div>

          <div className="w-full md:w-2/3 relative z-10 flex flex-wrap gap-3 md:gap-4 justify-center md:justify-end items-center">
            {data.radarTopics.map((topic, i) => {
              const isLarge = i % 3 === 0;
              return (
                <motion.div key={i} animate={{ y: [0, i % 2 === 0 ? -12 : 12, 0] }} transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }} className="inline-flex">
                  <Link href={topic.link || '#'} target="_blank" rel="noopener noreferrer" className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] font-bold hover:scale-105 hover:bg-white/[0.08] transition-all cursor-pointer backdrop-blur-xl block ${isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`} style={{ color: topic.color, backgroundColor: `${topic.color}15` }}>
                    {topic.name}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    blog: data.blog && data.blog.length > 0 ? (
      <ScrollReveal key="blog">
        <section className="space-y-5 md:space-y-8 relative px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4 border-b border-white/5">
            <div className="flex justify-between items-center w-full mb-2">
              <h2 className="text-xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                <span className="w-1.5 md:w-2 h-6 md:h-8 rounded-full bg-[#f59e0b] shadow-[0_0_15px_#f59e0b]"></span> {data.contentConfig.blog.title}
              </h2>
              <Link href="/blog" target="_blank" rel="noopener noreferrer" className="text-[11px] md:text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10">
                مشاهده همه <Icon name="arrowLeft" className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-[11px] md:text-sm text-gray-400 font-light pr-[14px] md:pr-[20px]">{data.contentConfig.blog.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {data.blog.map((item, i) => (
              <SpotlightCard key={i} themeColor="#f59e0b" link={`/blog/${item.slug}`}>
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  {(item.coverDesktop || item.coverMobile) ? (
                    <BlurImage src={item.coverDesktop || item.coverMobile} alt={item.titleBase} className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-80 group-hover:scale-110 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
                      <Icon name="blog" className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(to top, #050810 0%, #f59e0b60 30%, transparent 100%)` }} />
                <div className="relative z-20 mt-auto p-4 md:p-5 flex flex-col justify-end h-full">
                  <h3 className="text-sm md:text-base font-black text-white leading-relaxed transition-colors line-clamp-2 drop-shadow-md group-hover:text-[#f59e0b] font-sans">
                    {item.titleBase} {item.titleHighlight && <span className="text-[#f59e0b]">{item.titleHighlight}</span>}
                  </h3>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    raw: data.raw && data.raw.length > 0 ? (
      <ScrollReveal key="raw">
        <section className="space-y-5 md:space-y-8 relative px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4 border-b border-white/5">
            <div className="flex justify-between items-center w-full mb-2">
              <h2 className="text-xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                <span className="w-1.5 md:w-2 h-6 md:h-8 rounded-full bg-[#eab308] shadow-[0_0_15px_#eab308]"></span> {data.contentConfig.raw.title}
              </h2>
              <Link href="/f" target="_blank" rel="noopener noreferrer" className="text-[11px] md:text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10">
                مشاهده همه <Icon name="arrowLeft" className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-[11px] md:text-sm text-gray-400 font-light pr-[14px] md:pr-[20px]">{data.contentConfig.raw.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {data.raw.map((item, i) => (
              <SpotlightCard key={i} themeColor="#eab308" link={`/f/${item.slug}`}>
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  {(item.coverDesktop || item.coverMobile) ? (
                    <BlurImage src={item.coverDesktop || item.coverMobile} alt={item.titleBase} className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-80 group-hover:scale-110 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
                      <Icon name="footage" className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(to top, #050810 0%, #eab30860 30%, transparent 100%)` }} />
                <div className="relative z-20 mt-auto p-4 md:p-5 flex flex-col justify-end h-full">
                  <h3 className="text-sm md:text-base font-black text-white leading-relaxed transition-colors line-clamp-2 drop-shadow-md group-hover:text-[#eab308] font-sans">
                    {item.titleBase} {item.titleHighlight && <span className="text-[#eab308]">{item.titleHighlight}</span>}
                  </h3>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    produced: data.produced && data.produced.length > 0 ? (
      <ScrollReveal key="produced">
        <section className="space-y-5 md:space-y-8 relative px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4 border-b border-white/5">
            <div className="flex justify-between items-center w-full mb-2">
              <h2 className="text-xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                <span className="w-1.5 md:w-2 h-6 md:h-8 rounded-full bg-[#f43f5e] shadow-[0_0_15px_#f43f5e]"></span> {data.contentConfig.produced.title}
              </h2>
              <Link href="/p" target="_blank" rel="noopener noreferrer" className="text-[11px] md:text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10">
                مشاهده همه <Icon name="arrowLeft" className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-[11px] md:text-sm text-gray-400 font-light pr-[14px] md:pr-[20px]">{data.contentConfig.produced.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {data.produced.map((item, i) => (
              <SpotlightCard key={i} themeColor="#f43f5e" link={`/p/${item.slug}`}>
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  {(item.coverDesktop || item.coverMobile) ? (
                    <BlurImage src={item.coverDesktop || item.coverMobile} alt={item.titleBase} className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-80 group-hover:scale-110 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
                      <Icon name="product" className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(to top, #050810 0%, #f43f5e60 30%, transparent 100%)` }} />
                <div className="relative z-20 mt-auto p-4 md:p-5 flex flex-col justify-end h-full">
                  <h3 className="text-sm md:text-base font-black text-white leading-relaxed transition-colors line-clamp-2 drop-shadow-md group-hover:text-[#f43f5e] font-sans">
                    {item.titleBase} {item.titleHighlight && <span className="text-[#f43f5e]">{item.titleHighlight}</span>}
                  </h3>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    tools: data.tools && data.tools.length > 0 ? (
      <ScrollReveal key="tools">
        <section className="space-y-5 md:space-y-8 relative px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4 border-b border-white/5">
            <div className="flex justify-between items-center w-full mb-2">
              <h2 className="text-xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                <span className="w-1.5 md:w-2 h-6 md:h-8 rounded-full bg-[#10b981] shadow-[0_0_15px_#10b981]"></span> {data.contentConfig.tools.title}
              </h2>
              <Link href="/tool" target="_blank" rel="noopener noreferrer" className="text-[11px] md:text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group px-4 py-2 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10">
                مشاهده همه <Icon name="arrowLeft" className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-[11px] md:text-sm text-gray-400 font-light pr-[14px] md:pr-[20px]">{data.contentConfig.tools.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {data.tools.map((item, i) => (
              <SpotlightCard key={i} themeColor="#10b981" link={`/tool/${item.slug}`}>
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  {(item.coverDesktop || item.coverMobile) ? (
                    <BlurImage src={item.coverDesktop || item.coverMobile} alt={item.titleBase} className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out opacity-80 group-hover:scale-110 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 bg-black/50">
                      <Icon name="pen-nib" className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 h-[70%] z-10 pointer-events-none opacity-90 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(to top, #050810 0%, #10b98160 30%, transparent 100%)` }} />
                <div className="relative z-20 mt-auto p-4 md:p-5 flex flex-col justify-end h-full">
                  <h3 className="text-sm md:text-base font-black text-white leading-relaxed transition-colors line-clamp-2 drop-shadow-md group-hover:text-[#10b981] font-sans">
                    {item.titleBase} {item.titleHighlight && <span className="text-[#10b981]">{item.titleHighlight}</span>}
                  </h3>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    investigators: data.investigators && data.investigators.length > 0 ? (
      <ScrollReveal key="investigators">
        <section className="space-y-6 md:space-y-8 relative pt-2 md:pt-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pb-4">
            <h2 className="text-xl md:text-3xl font-black text-white mb-2 flex items-center gap-2 md:gap-3">
              <Icon name="users" className="w-6 h-6 md:w-8 md:h-8 text-purple-400" /> پدیدآورندگان شاخص
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-4 md:mt-8">
            {data.investigators.map((user, i) => (
              <Link key={i} href={`/t/${user.slug || '#'}`} target="_blank" rel="noopener noreferrer" className="relative group flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                    {user.imageUrl ? (
                      <BlurImage src={user.imageUrl} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Icon name="user" className="w-8 h-8 md:w-12 md:h-12 text-gray-500" />
                    )}
                  </div>
                </div>
                <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>
    ) : null,

    // ---------------- تولد دوباره باکس پورتال امن (Dynamic Flow) ----------------
    cta: data.ctaBox && data.ctaBox.title ? (
      <ScrollReveal key="cta">
        <section className="relative p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)] border border-cyan-500/20 hover:border-cyan-400/40 bg-white/[0.02] backdrop-blur-3xl mx-4 sm:mx-6 lg:mx-8 transition-colors duration-500">
          
          {/* پس‌زمینه زنده شبکه داده (Tech Grid) */}
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay -z-10" />
          
          {/* هاله‌های نوری تپنده و زنده در پس‌زمینه باکس */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000 z-0 animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000 z-0 animate-[pulse_5s_ease-in-out_infinite_reverse]"></div>
          
          {/* خط اسکنر لیزری که مدام از بالا به پایین باکس می‌رود */}
          <motion.div 
            animate={{ y: ["-100%", "250%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent z-0 pointer-events-none"
          />

          {/* ذرات جریان داده (Floating Data Particles) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[20%] right-[15%] w-1 h-12 bg-cyan-400/50 rounded-full blur-[1px]" />
            <motion.div animate={{ y: [0, 40, 0], opacity: [0.1, 0.8, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute top-[60%] right-[30%] w-1.5 h-1.5 bg-cyan-300/80 rounded-full blur-[1px]" />
            <motion.div animate={{ x: [0, 50, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className="absolute top-[40%] left-[25%] w-12 h-1 bg-blue-500/50 rounded-full blur-[1px]" />
            <motion.div animate={{ y: [0, -50, 0], opacity: [0.1, 0.7, 0.1] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }} className="absolute bottom-[20%] left-[40%] w-2 h-2 bg-emerald-400/60 rounded-full blur-[1px]" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="flex-1 space-y-4 text-center lg:text-right flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-[10px] md:text-xs font-bold shadow-inner mb-2 border border-red-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></span> {data.ctaBox.preTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">{data.ctaBox.title}</h2>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light leading-loose max-w-2xl text-justify [text-align-last:center] lg:[text-align-last:right] px-2 lg:px-0 mt-2">
                {data.ctaBox.desc}
              </p>
            </div>

            <div className="flex-none w-full sm:w-auto mt-4 lg:mt-0">
              {/* دکمه پورتال با افکت فیزیکی هاور دقیقا منطبق بر شمارش معکوس */}
              <Link href={data.ctaBox.btnLink || '/submit'} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden group/btn flex sm:inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-black text-sm md:text-lg transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] w-full sm:w-auto hover:scale-105 active:scale-95 cursor-pointer">
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  {data.ctaBox.btnText} <Icon name="upload" className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-inherit"></div>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    ) : null
  };

  return (
    <main dir="rtl" className="pt-0 !mt-0 max-w-[1400px] mx-auto space-y-16 md:space-y-24 pb-24 relative z-10 w-full font-sans text-right select-none">
      
      {/* ========== نشانگر جادویی موس (Magic Cursor Glow) ========== */}
      {isDesktop && (
        <motion.div
          className="fixed top-0 left-0 w-[300px] h-[300px] bg-cyan-500/15 rounded-full pointer-events-none blur-[80px] z-0 mix-blend-screen"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%'
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />

      <motion.div style={{ y: parallaxY1 }} className="absolute top-[20%] right-[5%] w-[25rem] md:w-[40rem] aspect-square bg-cyan-500/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10" />
      <motion.div style={{ y: parallaxY2 }} className="absolute top-[50%] left-[2%] w-[30rem] md:w-[50rem] aspect-square bg-purple-500/5 rounded-full blur-[120px] md:blur-[180px] pointer-events-none -z-10" />
      <motion.div style={{ y: parallaxY3 }} className="absolute bottom-[10%] right-[15%] w-[20rem] md:w-[35rem] aspect-square bg-rose-500/5 rounded-full blur-[90px] md:blur-[140px] pointer-events-none -z-10" />

      {data.heroSlides && data.heroSlides.length > 0 && (
        <section 
          className="relative w-full h-[100svh] md:h-[600px] md:max-w-7xl md:mx-auto !-mt-[100px] md:!mt-24 rounded-none md:rounded-[3rem] overflow-hidden group bg-transparent border-0 select-none cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => {
            setIsPaused(true);
            handleDragStart(e.targetTouches[0].clientX);
          }}
          onTouchEnd={(e) => {
            setIsPaused(false);
            handleDragEnd(e.changedTouches[0].clientX);
          }}
          onMouseDown={(e) => {
            setIsPaused(true); 
            handleDragStart(e.clientX);
          }}
          onMouseUp={(e) => {
            setIsPaused(false);
            handleDragEnd(e.clientX);
          }}
          onMouseLeave={() => {
            setIsPaused(false);
            setDragStart(null);
          }}
        >
          {data.heroSlides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
                <picture>
                  {slide.imgMobile && <source media="(max-width: 768px)" srcSet={slide.imgMobile} />}
                  <img src={slide.imgDesktop || slide.imgMobile || '/images/noise.png'} alt={slide.title} className="w-full h-full object-cover md:object-[20%_center] scale-110 opacity-70" draggable="false" />
                </picture>
              </div>

              <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center items-center md:items-start text-center md:text-right p-6 pb-24 md:p-16 w-full md:w-1/2 pointer-events-none">
                {slide.preTitle && slide.preTitle.trim() !== '' && (
                  <div className={`inline-flex items-center gap-2.5 px-4 py-2 mb-4 md:mb-6 rounded-full border text-xs font-bold tracking-widest backdrop-blur-md pointer-events-auto`} style={{ backgroundColor: `${slide.preTitleColor}20`, borderColor: `${slide.preTitleColor}40`, color: slide.preTitleColor }}>
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-100" style={{ backgroundColor: slide.preTitleColor }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: slide.preTitleColor, boxShadow: `0 0 15px ${slide.preTitleColor}` }}></span>
                    </span>
                    <span className="pt-0.5">{slide.preTitle}</span>
                  </div>
                )}
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 py-2 leading-normal text-transparent bg-clip-text drop-shadow-2xl font-sans" style={{ backgroundImage: `linear-gradient(to bottom, ${slide.colorStart}, ${slide.colorEnd})` }}>
                  {slide.title}
                </h2>
                <p className="text-gray-300 mb-8 md:mb-10 max-w-lg text-sm md:text-base font-light text-justify [text-align-last:center] md:[text-align-last:right] leading-relaxed mx-auto md:mx-0 px-2 md:px-0 drop-shadow-lg">
                  {slide.desc}
                </p>
                <Link href={slide.btnLink || '#'} target="_blank" rel="noopener noreferrer" className="font-black text-sm md:text-lg border-b-[3px] pb-1 hover:scale-105 transition-all duration-300 inline-block drop-shadow-lg pointer-events-auto" style={{ color: slide.btnColor, borderColor: slide.btnColor }}>
                  {slide.btnText}
                </Link>
              </div>
            </div>
          ))}

          {data.heroSlides.length > 1 && (
            <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30 pointer-events-auto">
              {data.heroSlides.map((_, idx) => (
                <div key={idx} onClick={() => setCurrentSlide(idx)} className="relative h-1.5 md:h-2 w-10 md:w-16 rounded-full bg-white/20 cursor-pointer overflow-hidden backdrop-blur-md">
                  {currentSlide === idx && (
                    <div 
                      key={`progress-${currentSlide}`} 
                      className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] rounded-full"
                      style={{
                        animation: `progress-fill ${slideDuration}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                      onAnimationEnd={() => setCurrentSlide(prev => (prev === data.heroSlides.length - 1 ? 0 : prev + 1))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSections.map(sectionKey => {
        const SectionComponent = sectionsContent[sectionKey];
        return SectionComponent ? <React.Fragment key={sectionKey}>{SectionComponent}</React.Fragment> : null;
      })}
    </main>
  );
}