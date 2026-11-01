'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';
import { quranicWisdom } from '@/lib/wisdom';
import AdminLoading from '@/app/(admin-panel)/loading';
import Icon from '@/app/components/Icon';

// ============================================================================
// ۱. توابع کمکی اعداد فارسی و محاسبه روز سال شمسی
// ============================================================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

function getJalaliDayOfYear(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);

    if (month <= 6) {
      return (month - 1) * 31 + day;
    } else {
      return 186 + (month - 7) * 30 + day;
    }
  } catch {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
}

// ============================================================================
// ۲. پیکربندی ۸ تم بصری با گرادینت‌های مدرن و ۵ هاله نوری
// ============================================================================
const THEME_CONFIG = {
  'theme-cosmos-dark': {
    persianTitle: 'کیهان‌شناسی و افلاک',
    persianSub: 'هندسه کیهانی و نظم مدارها',
    orbs: ['#38bdf8', '#6366f1', '#0ea5e9', '#818cf8', '#22d3ee'],
    accentHex: '#38bdf8',
    textGlow: 'rgba(56, 189, 248, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#bae6fd] to-[#818cf8]',
    watermark: 'astrolabe',
  },
  'theme-nature-green': {
    persianTitle: 'طبیعت و سایبرنتیک',
    persianSub: 'شبکه حیات و کدهای تکوینی',
    orbs: ['#10b981', '#14b8a6', '#059669', '#34d399', '#2dd4bf'],
    accentHex: '#10b981',
    textGlow: 'rgba(16, 185, 129, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#a7f3d0] to-[#2dd4bf]',
    watermark: 'cybernetics',
  },
  'theme-calm-blue': {
    persianTitle: 'روان و آرامش ذهن',
    persianSub: 'ثبات درونی و اتصال به مرکز ثقل هستی',
    orbs: ['#0ea5e9', '#3b82f6', '#38bdf8', '#60a5fa', '#0284c7'],
    accentHex: '#38bdf8',
    textGlow: 'rgba(56, 189, 248, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#e0f2fe] to-[#60a5fa]',
    watermark: 'waves',
  },
  'theme-history-rust': {
    persianTitle: 'تاریخ باستان و تمدن‌ها',
    persianSub: 'میراث کهن، معماری و رمزگان تاریخ',
    orbs: ['#f43f5e', '#fb923c', '#ec4899', '#f97316', '#fda4af'],
    accentHex: '#fb7185',
    textGlow: 'rgba(251, 113, 133, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#ffe4e6] to-[#fdba74]',
    watermark: 'ancientStar',
  },
  'theme-light-gold': {
    persianTitle: 'شبکه بازتاب و عمل',
    persianSub: 'قانونمندی کنش‌ها و ارتعاش ذرات',
    orbs: ['#a855f7', '#38bdf8', '#ec4899', '#6366f1', '#22d3ee'],
    accentHex: '#c084fc',
    textGlow: 'rgba(192, 132, 252, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#e9d5ff] to-[#7dd3fc]',
    watermark: 'karmaRipple',
  },
  'theme-singularity-purple': {
    persianTitle: 'آینده و ابعاد موازی',
    persianSub: 'تکینگی فضا-زمان و افق رویدادها',
    orbs: ['#a855f7', '#d946ef', '#8b5cf6', '#ec4899', '#c084fc'],
    accentHex: '#d946ef',
    textGlow: 'rgba(217, 70, 239, 0.38)',
    arabicGradient: 'from-[#ffffff] via-[#f5d0fe] to-[#a855f7]',
    watermark: 'singularity',
  },
  'theme-pure-white': {
    persianTitle: 'کیمیاگری درون و اشراق',
    persianSub: 'علم لدنی، شهود و مراتب نور',
    orbs: ['#94a3b8', '#38bdf8', '#cbd5e1', '#818cf8', '#e2e8f0'],
    accentHex: '#e2e8f0',
    textGlow: 'rgba(226, 232, 240, 0.4)',
    arabicGradient: 'from-[#ffffff] via-[#f1f5f9] to-[#93c5fd]',
    watermark: 'alchemy',
  },
  'theme-harmony-teal': {
    persianTitle: 'زیبایی‌شناسی و تقارن',
    persianSub: 'توازن مطلق و نسبت طلایی آفرینش',
    orbs: ['#14b8a6', '#06b6d4', '#2dd4bf', '#22d3ee', '#0d9488'],
    accentHex: '#2dd4bf',
    textGlow: 'rgba(45, 212, 191, 0.35)',
    arabicGradient: 'from-[#ffffff] via-[#ccfbf1] to-[#38bdf8]',
    watermark: 'harmony',
  },
};

const CATEGORY_FA_MAP = {
  'Cosmology': 'کیهان‌شناسی و افلاک',
  'Nature & Cybernetics': 'طبیعت و سایبرنتیک',
  'Psychology & Mind': 'روان و آرامش ذهن',
  'Ancient History': 'تاریخ باستان و تمدن‌ها',
  'Karma Web': 'شبکه بازتاب و عمل',
  'Future & Multiverse': 'آینده و ابعاد موازی',
  'Inner Alchemy': 'کیمیاگری درون و اشراق',
  'Aesthetics': 'زیبایی‌شناسی و تقارن',
};

const FALLBACK_WISDOM = [
  {
    day: 1,
    arabic: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ',
    translation: 'قلمرو دانش و قدرت او، تمام آسمان‌ها و زمین را دربرگرفته است.',
    category: 'Cosmology',
    theme: 'theme-cosmos-dark',
    reference: 'بقره / ۲۵۵',
  },
];

// ============================================================================
// ۳. کامپوننت واترمارک‌های هندسی در پس‌زمینه کتیبه
// ============================================================================
const SacredWatermark = ({ type, color }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.055] select-none">
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        viewBox="0 0 400 400"
        className="w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] transform-gpu"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
      >
        <circle cx="200" cy="200" r="180" strokeDasharray="4 8" />
        <circle cx="200" cy="200" r="150" strokeOpacity="0.6" />

        {type === 'astrolabe' && (
          <>
            <circle cx="200" cy="200" r="110" />
            <circle cx="200" cy="165" r="75" />
            <circle cx="200" cy="140" r="45" />
            <line x1="20" y1="200" x2="380" y2="200" />
            <line x1="200" y1="20" x2="200" y2="380" />
            <line x1="73" y1="73" x2="327" y2="327" strokeDasharray="3 6" />
            <line x1="327" y1="73" x2="73" y2="327" strokeDasharray="3 6" />
          </>
        )}

        {type === 'cybernetics' && (
          <>
            <polygon points="200,40 338,120 338,280 200,360 62,280 62,120" />
            <polygon points="200,80 304,140 304,260 200,320 96,260 96,140" strokeDasharray="6 4" />
            <line x1="200" y1="40" x2="200" y2="360" />
            <line x1="62" y1="120" x2="338" y2="280" />
            <line x1="338" y1="120" x2="62" y2="280" />
            <circle cx="200" cy="200" r="25" fill={color} fillOpacity="0.15" />
          </>
        )}

        {type === 'waves' && (
          <>
            <ellipse cx="200" cy="200" rx="140" ry="60" />
            <ellipse cx="200" cy="200" rx="140" ry="60" transform="rotate(60 200 200)" />
            <ellipse cx="200" cy="200" rx="140" ry="60" transform="rotate(120 200 200)" />
            <circle cx="200" cy="200" r="40" />
          </>
        )}

        {type === 'ancientStar' && (
          <>
            <rect x="95" y="95" width="210" height="210" />
            <rect x="95" y="95" width="210" height="210" transform="rotate(45 200 200)" />
            <rect x="130" y="130" width="140" height="140" transform="rotate(22.5 200 200)" />
            <circle cx="200" cy="200" r="55" />
          </>
        )}

        {type === 'karmaRipple' && (
          <>
            <circle cx="200" cy="200" r="125" strokeDasharray="10 5" />
            <circle cx="200" cy="200" r="95" />
            <circle cx="200" cy="200" r="65" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="35" />
            <circle cx="200" cy="200" r="12" fill={color} fillOpacity="0.2" />
          </>
        )}

        {type === 'singularity' && (
          <>
            <polygon points="200,30 370,200 200,370 30,200" />
            <polygon points="200,70 330,200 200,330 70,200" transform="rotate(45 200 200)" />
            <circle cx="200" cy="200" r="80" strokeDasharray="2 6" />
            <circle cx="200" cy="200" r="30" />
          </>
        )}

        {type === 'alchemy' && (
          <>
            <polygon points="200,45 340,285 60,285" />
            <polygon points="200,355 340,115 60,115" />
            <circle cx="200" cy="200" r="78" />
            <circle cx="200" cy="200" r="18" />
          </>
        )}

        {type === 'harmony' && (
          <>
            <circle cx="200" cy="130" r="70" />
            <circle cx="200" cy="270" r="70" />
            <circle cx="130" cy="200" r="70" />
            <circle cx="270" cy="200" r="70" />
            <circle cx="200" cy="200" r="70" />
          </>
        )}
      </motion.svg>
    </div>
  );
};

// ============================================================================
// ۴. هوک افکت رمزگشایی (Decryption Reveal)
// ============================================================================
const CIPHER_CHARS = ['ا', 'ل', 'م', 'ص', 'ر', 'ك', 'ه', 'ي', 'ع', 'ط', 'س', 'ح', 'ق', 'ن', 'ـ', '✦'];

function useDecryptionText(targetText, triggerKey, durationMs = 1000) {
  const [displayText, setDisplayText] = useState(targetText);
  const [isDecrypting, setIsDecrypting] = useState(true);

  useEffect(() => {
    if (!targetText) return;
    setIsDecrypting(true);

    const words = targetText.split(' ');
    const totalSteps = 16;
    const stepTime = durationMs / totalSteps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;

      if (progress >= 1) {
        setDisplayText(targetText);
        setIsDecrypting(false);
        clearInterval(interval);
        return;
      }

      const scrambled = words
        .map((word, wIdx) => {
          if (wIdx / words.length < progress) {
            return word;
          }
          const len = Math.max(2, Math.min(word.length, 6));
          let cipherWord = '';
          for (let i = 0; i < len; i++) {
            cipherWord += CIPHER_CHARS[(currentStep + wIdx + i) % CIPHER_CHARS.length];
          }
          return cipherWord;
        })
        .join(' ');

      setDisplayText(scrambled);
    }, stepTime);

    return () => clearInterval(interval);
  }, [targetText, triggerKey, durationMs]);

  return { displayText, isDecrypting };
}

// ============================================================================
// ۵. کامپوننت اصلی پیشخوان (کتیبه دیجیتال مدار)
// ============================================================================
export default function DashboardPage() {
  const { user, isLoading, loading, isFetching } = useAuth();
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);
  const [hasAccess, setHasAccess] = useState(null);
  const [realDayOfYear, setRealDayOfYear] = useState(1);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
    setRealDayOfYear(getJalaliDayOfYear(new Date()));
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    const authIsLoading = isLoading || loading || isFetching;
    if (authIsLoading) return;

    if (user) {
      setHasAccess(!!(user.isAdmin || user.isSuperAdmin));
    } else {
      const timer = setTimeout(() => {
        setHasAccess(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, loading, isFetching]);

  const activeDayOfYear = useMemo(() => {
    return (((realDayOfYear - 1 + selectedDayOffset) % 366) + 366) % 366 + 1;
  }, [realDayOfYear, selectedDayOffset]);

  const currentWisdom = useMemo(() => {
    const list = Array.isArray(quranicWisdom) && quranicWisdom.length > 0 ? quranicWisdom : FALLBACK_WISDOM;
    const index = (activeDayOfYear - 1) % list.length;
    return list[index];
  }, [activeDayOfYear]);

  const activeTheme = useMemo(() => {
    return THEME_CONFIG[currentWisdom?.theme] || THEME_CONFIG['theme-cosmos-dark'];
  }, [currentWisdom]);

  const persianCategoryName = CATEGORY_FA_MAP[currentWisdom?.category] || activeTheme.persianTitle;

  const { displayText: decryptedArabic, isDecrypting } = useDecryptionText(
    currentWisdom?.arabic || '',
    activeDayOfYear,
    950
  );

  if (!mounted || hasAccess === null) return <AdminLoading />;

  if (hasAccess === false) {
    return (
      <div
        className="fixed inset-0 w-full h-[100dvh] bg-[#050810] flex flex-col items-center justify-center px-4 text-center select-none font-sans overflow-hidden"
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        <div className="relative w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.15),0_0_30px_rgba(244,63,94,0.15)]">
          <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl animate-pulse pointer-events-none" />
          <Icon name="lock" className="w-8 h-8 text-rose-500 relative z-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 select-none">دسترسی مسدود است</h2>
        <p className="text-sm sm:text-base text-gray-400 select-none">شما مجوز ورود به پنل مدیریت را ندارید.</p>
      </div>
    );
  }

  return (
    // لایه اول (Master Wrapper): قاب اصلی که 100dvh است و جلوی هرگونه اسکرول و برش خوردن را می‌گیرد. فقط این والد overflow-hidden دارد.
    <div
      className="fixed inset-0 w-full h-[100dvh] bg-[#050810] flex flex-col select-none font-sans overflow-hidden"
      style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      {/* لایه دوم: پس‌زمینه نوری بی‌نهایت (ثابت در قاب اصلی) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <motion.div animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.15, 0.45, 0.15], x: [0, 35, 0], y: [0, -25, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[80px] sm:blur-[120px] transition-colors duration-1000 transform-gpu" style={{ backgroundColor: activeTheme.orbs[0] }} />
        <motion.div animate={{ scale: [1.3, 0.7, 1.3], opacity: [0.35, 0.15, 0.35], x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-10 -left-10 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[90px] sm:blur-[130px] transition-colors duration-1000 transform-gpu" style={{ backgroundColor: activeTheme.orbs[1] }} />
        <motion.div animate={{ scale: [0.65, 1.25, 0.65], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-10 right-10 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] sm:blur-[140px] transition-colors duration-1000 transform-gpu" style={{ backgroundColor: activeTheme.orbs[2] }} />
      </div>

      {/* لایه سوم: محتوای اصلی (بدون overflow-hidden تا سایه‌ها هرگز کات نشوند) */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="relative w-full max-w-4xl flex flex-col items-center justify-center flex-1 min-h-0">
          
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 mb-4 sm:mb-6 inline-flex items-center gap-2.5 sm:gap-3 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#0b0f19]/70 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] shrink-0 select-none"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.accentHex }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: activeTheme.accentHex, boxShadow: `0 0 12px ${activeTheme.accentHex}` }} />
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-100 tracking-wide select-none">
              سلام، {user?.firstName || 'مدیر گرامی'}
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.section
              key={activeDayOfYear}
              ref={cardRef}
              onMouseMove={handleMouseMove}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              // این کارت تنها بخشی است که overflow-hidden دارد تا بردر نوری را گرد نگه دارد، اما سایه دراپ از بیرون آن تولید می‌شود و دیگر قطع نمی‌شود
              className="group relative z-10 w-full h-[65vh] min-h-[380px] max-h-[550px] rounded-[1.75rem] sm:rounded-[2.5rem] p-[1.5px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.8)] shrink-0 select-none"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square pointer-events-none opacity-80 transform-gpu"
                style={{ background: `conic-gradient(from 0deg, transparent 0%, transparent 75%, ${activeTheme.accentHex} 95%, #ffffff 100%)` }}
              />

              <div className="relative w-full h-full rounded-[calc(1.75rem-1.5px)] sm:rounded-[calc(2.5rem-1.5px)] bg-[#070b14]/80 backdrop-blur-3xl px-4 py-5 sm:px-10 sm:py-8 md:px-12 flex flex-col items-center justify-between text-center overflow-hidden shadow-[inset_0_0_60px_rgba(255,255,255,0.03)] border border-white/[0.06]">
                
                <div className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block" style={{ background: `radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${activeTheme.textGlow}, transparent 45%)` }} />
                <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-[1.5px] opacity-90 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${activeTheme.accentHex}, transparent)` }} />
                <SacredWatermark type={activeTheme.watermark} color={activeTheme.accentHex} />

                {/* === منطقه بالایی کارت (Header) === */}
                <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-white/[0.08] text-xs shrink-0 select-none">
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] shadow-inner">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeTheme.accentHex, boxShadow: `0 0 10px ${activeTheme.accentHex}` }} />
                    <span className="font-bold text-gray-100 tracking-wide text-[11px] sm:text-xs select-none">
                      قلمرو موضوعی: {persianCategoryName}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-300/80 font-light tracking-wide select-none">
                    {activeTheme.persianSub}
                  </span>
                </div>

                {/* === منطقه میانی داینامیک (Middle Dynamic Content) === */}
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center overflow-hidden py-2 sm:py-4 select-none">
                  <p
                    className={`quran-text select-none w-full px-2 sm:px-6 text-[clamp(1.1rem,3.5vw,2.5rem)] font-normal bg-gradient-to-r ${activeTheme.arabicGradient} bg-clip-text text-transparent transition-all duration-300 ${isDecrypting ? 'opacity-75 blur-[0.5px]' : 'opacity-100 blur-0'}`}
                    style={{ lineHeight: '1.7', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone', filter: `drop-shadow(0 0 22px ${activeTheme.textGlow})` }}
                  >
                    {decryptedArabic}
                  </p>

                  <div className="w-full max-w-xs sm:max-w-md my-3 sm:my-5 flex items-center justify-center gap-3 shrink-0 select-none">
                    <div className="h-[1px] flex-1 opacity-45" style={{ background: `linear-gradient(90deg, transparent, ${activeTheme.accentHex})` }} />
                    <span className="text-xs sm:text-sm opacity-90 transition-transform duration-500 group-hover:scale-125" style={{ color: activeTheme.accentHex, textShadow: `0 0 10px ${activeTheme.accentHex}` }}>❖</span>
                    <div className="h-[1px] flex-1 opacity-45" style={{ background: `linear-gradient(270deg, transparent, ${activeTheme.accentHex})` }} />
                  </div>

                  <motion.p
                    initial={{ opacity: 0, filter: 'blur(6px)' }}
                    animate={{ opacity: isDecrypting ? 0.3 : 1, filter: isDecrypting ? 'blur(4px)' : 'blur(0px)' }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative z-10 text-[clamp(0.75rem,2vw,1.125rem)] text-gray-200 font-light leading-relaxed max-w-2xl px-2 text-justify [text-align-last:center] select-none"
                  >
                    «{currentWisdom?.translation}»
                  </motion.p>
                </div>

                {/* === منطقه پایینی کارت (Footer) === */}
                <div className="relative z-10 w-full pt-3 sm:pt-4 border-t border-white/[0.07] flex items-center justify-center shrink-0 select-none">
                  <div className="inline-flex items-center gap-2.5 bg-[#050810]/60 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-white/[0.07] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
                    <span className="text-gray-400 text-[11px] sm:text-xs select-none">سوره مبارکه</span>
                    <span className="font-bold text-xs sm:text-sm tracking-wide select-none" style={{ color: activeTheme.accentHex }}>
                      {currentWisdom?.reference ? toPersianDigits(currentWisdom.reference) : ''}
                    </span>
                  </div>
                </div>

              </div>
            </motion.section>
          </AnimatePresence>

          {/* کنسول ورق زدن روزها */}
          <footer className="w-full max-w-md z-10 mt-4 sm:mt-6 flex items-center justify-center shrink-0 select-none">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[#070b14]/70 backdrop-blur-2xl border border-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-90 sm:opacity-55 hover:opacity-100 transition-all duration-300">
              <button type="button" onClick={() => setSelectedDayOffset((d) => d - 1)} className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.09] active:scale-95 text-xs text-gray-300 hover:text-white border border-white/5 cursor-pointer transition-all duration-200 select-none">روز قبل</button>
              {selectedDayOffset !== 0 && (
                <button type="button" onClick={() => setSelectedDayOffset(0)} className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-xs text-white font-bold border border-white/10 cursor-pointer transition-all duration-200 select-none" style={{ boxShadow: `0 0 15px -5px ${activeTheme.accentHex}` }}>بازگشت به امروز</button>
              )}
              <button type="button" onClick={() => setSelectedDayOffset((d) => d + 1)} className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.09] active:scale-95 text-xs text-gray-300 hover:text-white border border-white/5 cursor-pointer transition-all duration-200 select-none">روز بعد</button>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}