// src/app/components/frontend/PersianGuideContent.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getSetting, submitPersianGuidePublicAction } from '@/app/actions/settings';
import { useAuth } from '@/app/hooks/useAuth';
import Icon from '@/app/components/Icon';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// کامپوننت پیام راهنما (Tooltip) با تگ‌های span (کاملاً مجاز در درون تگ‌های p و بدون خطای Hydration)
function Tooltip({ children, content, position = 'top', inline = false }) {
  if (!content) return children;
  const posClasses =
    position === 'bottom'
      ? 'top-full mt-2'
      : 'bottom-full mb-2';

  // تشخیص هوشمند: فقط اگر المان فرزند دارای w-full باشد (مانند inputهای فرم) تمام‌عرض شود، در غیر این صورت خطی (inline) بماند
  const isFullWidth =
    !inline && Boolean(children?.props?.className?.includes('w-full'));

  return (
    <span
      className={cn(
        'relative group/tooltip',
        isFullWidth
          ? 'flex w-full items-center justify-center'
          : 'inline-flex items-baseline justify-center align-baseline'
      )}
    >
      {children}
      <span
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 hidden group-hover/tooltip:flex flex-col items-center justify-center animate-[fadeIn_0.15s_ease-out]',
          posClasses
        )}
      >
        <span className="block bg-[#080d1a]/95 backdrop-blur-2xl text-white text-[11px] font-bold py-1.5 px-3.5 rounded-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] whitespace-nowrap text-center leading-normal">
          {content}
        </span>
        <span className="block w-2 h-2 rotate-45 bg-[#080d1a]/95 border-r border-b border-white/15 -mt-1" />
      </span>
    </span>
  );
}

// تبدیل قطعی ارقام انگلیسی و عربی به فارسی
function toPersianDigits(input) {
  if (input === null || input === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input)
    .replace(/[0-9]/g, (w) => persianDigits[+w])
    .replace(/[٠-٩]/g, (w) => persianDigits[w.charCodeAt(0) - 1632]);
}

// تبدیل ارقام فارسی و عربی به انگلیسی برای اعتبارسنجی شماره همراه
function toEnglishDigits(input) {
  if (!input) return '';
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

// سپر امنیتی سخت‌گیرانه مکتوم: پالایش کامل کدهای مخرب، تگ‌ها، لینک‌ها و شکستن رشته‌های طولانی
function sanitizeSafePersianInput(raw, maxLen = 1200) {
  if (!raw) return '';
  let clean = String(raw).slice(0, maxLen);
  clean = clean
    .replace(/<[^>]*>?/gm, '')
    .replace(/(javascript:|data:|vbscript:|onload|onerror|onclick|onmouseover)/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(
      /\b(function|const|let|var|interface|type|import|export|return|async|await|script|eval|window|document|select|insert|update|delete|drop|union)\b/gi,
      ''
    )
    .replace(/[{}[\];`\\<>#$^*~|=+]/g, '')
    // جلوگیری از تکرار کاراکترهای پشت سر هم (بیش از ۴ بار)
    .replace(/(.)\1{4,}/g, '$1$1$1');
  // شکستن خودکار هر کلمه طولانی‌تر از ۲۵ نویسه پیوسته
  clean = clean.replace(/(\S{25})(?=\S)/g, '$1 ');
  return clean;
}

// موتور پیشرفته پالایش زنده متن فارسی سامانه مکتوم
function refinePersianText(rawText) {
  if (!rawText) {
    return { refined: '', digitsCount: 0, charsCount: 0, zwnjCount: 0 };
  }

  let digitsCount = 0;
  let charsCount = 0;
  let zwnjCount = 0;

  let text = sanitizeSafePersianInput(rawText, 1200);

  // ۱. بومی‌سازی حروف عربی (ي، ك، ة) و علایم نگارشی انگلیسی (؟ ، ؛)
  text = text.replace(/ي/g, () => {
    charsCount++;
    return 'ی';
  });
  text = text.replace(/ك/g, () => {
    charsCount++;
    return 'ک';
  });
  text = text.replace(/ة(\s|$)/g, (_, sp) => {
    charsCount++;
    return `ه${sp}`;
  });
  text = text.replace(/\?/g, () => {
    charsCount++;
    return '؟';
  });
  text = text.replace(/,/g, () => {
    charsCount++;
    return '،';
  });
  text = text.replace(/;/g, () => {
    charsCount++;
    return '؛';
  });

  // ۲. تبدیل گیومه‌های انگلیسی به گیومه فارسی « »
  text = text.replace(/"([^"]+)"/g, (_, inner) => {
    charsCount += 2;
    return `«${inner.trim()}»`;
  });

  // ۳. تبدیل ارقام انگلیسی و عربی به فارسی
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  text = text.replace(/[0-9]/g, (d) => {
    digitsCount++;
    return persianDigits[+d];
  });
  text = text.replace(/[٠-٩]/g, (d) => {
    digitsCount++;
    return persianDigits[d.charCodeAt(0) - 1632];
  });

  // ۴. اصلاح «می» و «نمی» که با فاصله کامل نوشته شده‌اند (مثال: می شود -> می‌شود)
  text = text.replace(/(^|\s)(ن?می)\s+(?=[آ-ی])/g, (_, prefixSpace, mi) => {
    zwnjCount++;
    return `${prefixSpace}${mi}\u200c`;
  });

  // ۵. اصلاح «می» و «نمی» چسبیده به بن مضارع و ماضی (مثال: میشود -> می‌شود / نمیشود -> نمی‌شود)
  const nonVerbExceptions = /^(دان|هن|ثاق|وه|ز|لیون|لیارد|لاد|کرو|راث|زان|عاد|قات|خ|ل|گو|انگین)/;
  text = text.replace(
    /(^|\s)(ن?می)(شود|شوند|شوم|شوی|شویم|شوید|شد|شدند|کند|کنند|کنم|کنی|کنیم|کنید|کرد|کردند|گوید|گویند|گویم|گویی|گوییم|گویید|گفت|باشم|باشی|باشد|باشند|باشیم|باشید|توان|تواند|توانند|توانم|توانیم|خواهد|خواهند|خواهم|خواهی|خواهیم|خواهید|رود|روند|روم|روی|رویم|روید|رفت|آید|آیند|آیم|آیی|آییم|آیید|آمد|داند|دانند|دانم|دانی|دانیم|دانید|دانست|رسد|رسند|رسم|رسی|رسیم|رسید|گذرد|گذرند|گیرد|گیرند|گیرم|گیریم|گرفت|دارد|دارند|دارم|داری|داریم|دارید|داشت|فرماید|فرمایند|نگرد|نگارد|نویسد|نویسند|خواند|خوانند|بیند|بینند|پسندد|پردازد|پردازند|سازد|سازند|زند|زنند)(?=\s|$|[.،؛!؟»)])/g,
    (fullMatch, sp, mi, verbRest) => {
      if (nonVerbExceptions.test(verbRest)) return fullMatch;
      zwnjCount++;
      return `${sp}${mi}\u200c${verbRest}`;
    }
  );

  // ۶. اصلاح نیم‌فاصله در پسوند جمع «ها» و صفت تفضیلی «تر / ترین»
  text = text.replace(
    /([آ-ی])\s+(ها|هایی|های|هایمان|هایتان|هایشان|تر|ترین)(?=\s|$|[.،؛!؟»)])/g,
    (_, wordEnd, suffix) => {
      zwnjCount++;
      return `${wordEnd}\u200c${suffix}`;
    }
  );
  text = text.replace(
    /([هیبپتثجچحخسشصضطظعغفقکگلمن])(ها|هایی|های)(?=\s|$|[.،؛!؟»)])/g,
    (_, lastChar, suffix) => {
      zwnjCount++;
      return `${lastChar}\u200c${suffix}`;
    }
  );

  // ۷. اصلاح یای اضافه و همزه (مثال: خانه ی من / خانهء من -> خانهٔ من)
  text = text.replace(/([آ-ی]ه)(?:\s+ی|\s*ء)(?=\s)/g, (_, word) => {
    charsCount++;
    return `${word}ٔ`;
  });

  // ۸. اصلاح واژگان مرکب پرتکرار بدون نیم‌فاصله
  const compoundFixes = [
    [/شیوه\s+نامه/g, 'شیوه‌نامه'],
    [/به\s+روز\s*رسانی/g, 'به‌روزرسانی'],
    [/شبیه\s+سازی/g, 'شبیه‌سازی'],
    [/دانش\s+آموخته/g, 'دانش‌آموخته'],
    [/علاقه\s+مند/g, 'علاقه‌مند'],
    [/فوق\s+العاده/g, 'فوق‌العاده'],
    [/بین\s+المللی/g, 'بین‌المللی'],
  ];
  compoundFixes.forEach(([regex, replacement]) => {
    text = text.replace(regex, () => {
      zwnjCount++;
      return replacement;
    });
  });

  // ۹. اصلاح فاصله‌های اضافی قبل از علایم نگارشی و داخل پرانتز
  text = text.replace(/\s+([.،؛:؟!])/g, '$1');
  text = text.replace(/([،؛:؟!])(?=[^\s»)\].،؛!؟])/g, '$1 ');
  text = text.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  text = text.replace(/\s{2,}/g, ' ');

  return {
    refined: text,
    digitsCount,
    charsCount,
    zwnjCount,
  };
}

// نمایشگر متن با قابلیت پرتو ایکس و استفاده از کامپوننت رسمی Tooltip سایت
function XRayText({ text, xrayMode, tooltipText }) {
  if (!text) return null;
  if (!xrayMode || !text.includes('\u200c')) {
    return <span>{text}</span>;
  }

  // جداسازی واژگانی که درون خود نیم‌فاصله دارند تا ساختار جمله و ترازبندی (Justify) هرگز نشکند
  const tokens = text.split(/(\S*\u200c\S*)/g);

  return (
    <span>
      {tokens.map((token, idx) => {
        if (!token.includes('\u200c')) {
          return <span key={idx}>{token}</span>;
        }

        const subParts = token.split('\u200c');
        return (
          <Tooltip key={idx} content={tooltipText} position="top" inline={true}>
            <span className="inline-flex items-baseline whitespace-nowrap rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1.5 py-0.2 mx-0.5 text-cyan-100 cursor-help transition-colors hover:bg-[#06b6d4]/20">
              {subParts.map((part, pIdx) => (
                <span key={pIdx} className="inline-flex items-baseline">
                  <span>{part}</span>
                  {pIdx < subParts.length - 1 && (
                    <span className="inline-flex items-center justify-center mx-0.5 px-1 rounded bg-[#06b6d4]/30 text-[#06b6d4] text-[10px] font-black leading-none self-center shadow-[0_0_8px_rgba(6,182,212,0.6)] select-none">
                      •
                    </span>
                  )}
                </span>
              ))}
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}

export default function PersianGuideContent({ pageData: initialPageData = {} }) {
  // نگهداری داده‌های صفحه در استیت زنده تا هر تغییری در بک‌اند بلافاصله در فرانت‌اند اعمال شود
  const [pageData, setPageData] = useState(initialPageData);
  const ui = pageData?.uiLabels || {};
  const { user } = useAuth();
  const [xrayMode, setXrayMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lexiconViewMode, setLexiconViewMode] = useState('cards');
  const [activeOsTab, setActiveOsTab] = useState(pageData?.toolkit?.osTabs?.[0]?.id || 'windows');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState('section-manifesto');

  // استیت آزمایشگاه پالایش متن
  const [rawInput, setRawInput] = useState(pageData?.refiner?.sampleRawText || '');
  const refinerResult = useMemo(() => refinePersianText(rawInput), [rawInput]);

  // استیت پیمان فارسی‌نویسی (نام و شماره تلفن همراه) و پیشنهاد واژه
  const [hasPledged, setHasPledged] = useState(false);
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);
  const [pledgerName, setPledgerName] = useState('');
  const [pledgerPhone, setPledgerPhone] = useState('');
  const [recentPledgers, setRecentPledgers] = useState(() =>
    (pageData?.pledge?.recentPledgers || []).map((p) =>
      typeof p === 'object' ? p.name : String(p)
    )
  );
  // شمارنده ۱۰۰٪ واقعی برابر با تعداد کل هم‌پیمانان تأییدشده
  const pledgeCount = recentPledgers.length;

  // استیت فرم پیشنهاد برابرنهاد توسط کاربر و قفل ضدکلیک رگباری (Rate-Limit)
  const [suggestForeign, setSuggestForeign] = useState('');
  const [suggestPersian, setSuggestPersian] = useState('');
  const [submittingSuggest, setSubmittingSuggest] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  // نگهبان ضداسپم برای دکمه‌های تعاملی فرانت‌اند
  const canTriggerAction = (cooldownMs = 1500) => {
    const now = Date.now();
    if (now - lastActionTime < cooldownMs) return false;
    setLastActionTime(now);
    return true;
  };

  // پر کردن خودکار نام در صورت وارد شدن کاربر به حساب کاربری
  useEffect(() => {
    const fullName =
      user?.name ||
      (user?.firstName || user?.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : '');
    if (fullName && !pledgerName) {
      setPledgerName(sanitizeSafePersianInput(fullName, 35));
    }
  }, [user, pledgerName]);

  // دریافت مستقیم آخرین تغییرات ذخیره‌شده از پایگاه داده در هنگام بارگذاری فرانت‌اند
  useEffect(() => {
    async function syncLiveFrontendData() {
      try {
        const storedPage = await getSetting('persian_guide_page_data');
        if (storedPage) {
          const parsedPage = JSON.parse(storedPage);
          setPageData((prev) => ({
            ...prev,
            ...parsedPage,
            breadcrumb: { ...prev.breadcrumb, ...(parsedPage.breadcrumb || {}) },
            uiLabels: { ...prev.uiLabels, ...(parsedPage.uiLabels || {}) },
            hero: { ...prev.hero, ...(parsedPage.hero || {}) },
            manifesto: { ...prev.manifesto, ...(parsedPage.manifesto || {}) },
            tone: { ...prev.tone, ...(parsedPage.tone || {}) },
            orthography: { ...prev.orthography, ...(parsedPage.orthography || {}) },
            punctuation: { ...prev.punctuation, ...(parsedPage.punctuation || {}) },
            lexicon: { ...prev.lexicon, ...(parsedPage.lexicon || {}) },
            toolkit: { ...prev.toolkit, ...(parsedPage.toolkit || {}) },
            faq: { ...prev.faq, ...(parsedPage.faq || {}) },
            refiner: { ...prev.refiner, ...(parsedPage.refiner || {}) },
            pledge: { ...prev.pledge, ...(parsedPage.pledge || {}) },
          }));

          if (parsedPage?.refiner?.sampleRawText) {
            setRawInput(parsedPage.refiner.sampleRawText);
          }
          if (Array.isArray(parsedPage?.pledge?.recentPledgers)) {
            setRecentPledgers(
              parsedPage.pledge.recentPledgers.map((p) =>
                typeof p === 'object' ? p.name : String(p)
              )
            );
          }
        }

        const storedStats = await getSetting('persian_guide_pledge_stats');
        if (storedStats) {
          const parsedStats = JSON.parse(storedStats);
          if (Array.isArray(parsedStats.recentPledgers)) {
            // فقط نام‌ها به استیت فرانت‌اند منتقل می‌شوند تا شماره همراه کاملاً محرمانه بماند
            setRecentPledgers(
              parsedStats.recentPledgers.map((p) =>
                typeof p === 'object' ? p.name : String(p)
              )
            );
          }
        }
      } catch (err) {
        console.error('Live sync error:', err);
      }

      if (typeof window !== 'undefined') {
        if (localStorage.getItem('maktum_persian_pledge') === 'true') {
          setHasPledged(true);
        }
      }
    }
    syncLiveFrontendData();
  }, []);

  // ثبت هم‌پیمانی با قفل ضداسپم و ارسال نام و شماره همراه به صف تأیید مدیر
  const handlePledge = async (e) => {
    if (e) e.preventDefault();
    if (hasPledged || isSubmittingPledge) return;
    if (!canTriggerAction(3000)) return;

    const cleanName = sanitizeSafePersianInput(pledgerName.trim(), 35);
    if (!cleanName || cleanName.length < 3 || /\S{20,}/.test(cleanName)) {
      if (ui.pledgeInvalidNameToast) toast.error(ui.pledgeInvalidNameToast);
      return;
    }

    const normalizedPhone = toEnglishDigits(pledgerPhone.trim()).replace(/\D/g, '');
    if (!user) {
      if (!/^09\d{9}$/.test(normalizedPhone)) {
        if (ui.pledgeInvalidPhoneToast) toast.error(ui.pledgeInvalidPhoneToast);
        return;
      }
    }

    const finalPhone = user ? user.phone || normalizedPhone || 'کاربر عضو' : normalizedPhone;

    setIsSubmittingPledge(true);
    const res = await submitPersianGuidePublicAction('PLEDGE', {
      name: cleanName,
      phone: finalPhone,
    });
    setIsSubmittingPledge(false);

    if (res?.success) {
      setHasPledged(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maktum_persian_pledge', 'true');
      }
      if (pageData?.pledge?.pledgeSuccessText) {
        toast.success(pageData.pledge.pledgeSuccessText, { duration: 5000 });
      }
    } else {
      toast.error(res?.error || 'خطا در ثبت هم‌پیمانی');
    }
  };

  // ثبت پیشنهاد واژه با قفل ضداسپم و محدودیت طول کاراکتر
  const handleSuggestWord = async (e) => {
    e.preventDefault();
    if (submittingSuggest) return;
    if (!canTriggerAction(3000)) return;

    const safeForeign = sanitizeSafePersianInput(suggestForeign.trim(), 30);
    const safePersian = sanitizeSafePersianInput(suggestPersian.trim(), 30);
    const userFullName =
      user?.firstName || user?.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : '';
    const safeAuthor = sanitizeSafePersianInput(pledgerName.trim() || userFullName || '', 35);

    if (
      !safeForeign ||
      !safePersian ||
      safeForeign.length < 2 ||
      safePersian.length < 2 ||
      /\S{20,}/.test(safeForeign) ||
      /\S{20,}/.test(safePersian)
    ) {
      if (ui.suggestErrorToast) toast.error(ui.suggestErrorToast);
      return;
    }

    setSubmittingSuggest(true);
    const res = await submitPersianGuidePublicAction('SUGGEST_WORD', {
      foreign: safeForeign,
      persian: safePersian,
      author: safeAuthor,
    });
    setSubmittingSuggest(false);

    if (res?.success) {
      setSuggestForeign('');
      setSuggestPersian('');
      if (ui.suggestSuccessToast) toast.success(ui.suggestSuccessToast);
    } else {
      toast.error(res?.error || ui.suggestErrorToast || 'خطا در ثبت پیشنهاد');
    }
  };

  const handleCopy = (textToCopy) => {
    if (!textToCopy || typeof navigator === 'undefined') return;
    if (!canTriggerAction(800)) return;
    navigator.clipboard.writeText(textToCopy);
    toast.success(ui.copiedToastText || 'رونوشت شد!', {
      id: 'persian-guide-copy-toast',
      position: 'bottom-center',
      style: {
        background: 'rgba(8, 13, 26, 0.92)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        backdropFilter: 'blur(16px)',
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '12px',
        fontWeight: 'bold',
      },
    });
  };

  // فهرست سرفصل‌های منوی راهبری چسبان («پیمان فارسی‌نویسی» آخرین بخش است)
  const navItems = useMemo(() => {
    const list = [];
    if (pageData?.manifesto?.enabled !== false) {
      list.push({ id: 'section-manifesto', label: pageData.manifesto?.navTitle, color: '#10b981' });
    }
    if (pageData?.tone?.enabled !== false) {
      list.push({ id: 'section-tone', label: pageData.tone?.navTitle, color: '#06b6d4' });
    }
    if (pageData?.orthography?.enabled !== false) {
      list.push({ id: 'section-orthography', label: pageData.orthography?.navTitle, color: '#a855f7' });
    }
    if (pageData?.punctuation?.enabled !== false) {
      list.push({ id: 'section-punctuation', label: pageData.punctuation?.navTitle, color: '#f59e0b' });
    }
    if (pageData?.lexicon?.enabled !== false) {
      list.push({ id: 'section-lexicon', label: pageData.lexicon?.navTitle, color: '#10b981' });
    }
    if (pageData?.toolkit?.enabled !== false) {
      list.push({ id: 'section-toolkit', label: pageData.toolkit?.navTitle, color: '#a855f7' });
    }
    if (pageData?.faq?.enabled !== false) {
      list.push({ id: 'section-faq', label: pageData.faq?.navTitle, color: '#f59e0b' });
    }
    if (pageData?.refiner?.enabled !== false) {
      list.push({ id: 'section-refiner', label: pageData.refiner?.navTitle, color: '#06b6d4' });
    }
    if (pageData?.pledge?.enabled !== false) {
      list.push({ id: 'section-pledge', label: pageData.pledge?.navTitle, color: '#10b981' });
    }
    return list;
  }, [pageData]);

  // نظارت بر اسکرول برای روشن کردن سرفصل فعال
  useEffect(() => {
    if (typeof window === 'undefined' || navItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: 0.1 }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  // رده‌بندی‌ها و کاوش در جدول واژه‌گزینی
  const lexiconCategories = useMemo(() => {
    const items = pageData?.lexicon?.items || [];
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [pageData?.lexicon?.items]);

  const filteredLexicon = useMemo(() => {
    const items = pageData?.lexicon?.items || [];
    const cleanQuery = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!cleanQuery) return true;
      return (
        (item.foreign || '').toLowerCase().includes(cleanQuery) ||
        (item.persian || '').toLowerCase().includes(cleanQuery) ||
        (item.category || '').toLowerCase().includes(cleanQuery) ||
        (item.note || '').toLowerCase().includes(cleanQuery)
      );
    });
  }, [pageData?.lexicon?.items, searchQuery, selectedCategory]);

  return (
    <main
      dir="rtl"
      style={{ fontFamily: 'Vazirmatn, var(--font-vazirmatn), sans-serif' }}
      className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0 select-none"
    >
      {/* ۱. مسیر راهنما (Breadcrumbs) — اولین فرزند main، دقیقاً هم‌تراز و هم‌فاصله با صفحه درباره ما */}
      {pageData?.breadcrumb?.enabled !== false && (
        <div className="mb-6 md:mb-10">
          <Breadcrumbs
            items={[
              { label: pageData?.breadcrumb?.homeLabel, href: '/' },
              { label: pageData?.breadcrumb?.currentLabel },
            ]}
          />
        </div>
      )}

      {/* ۲. قاب اول (Hero) */}
      {pageData?.hero?.enabled !== false && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-6 md:p-10 text-center overflow-hidden border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] select-none"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-80" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="group/icon cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#10b981]/40 flex items-center justify-center text-[#10b981] mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(16,185,129,0.1),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.25),0_0_30px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 transition-all duration-300">
              <Icon
                name={pageData?.hero?.iconName}
                className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover/icon:scale-110"
              />
            </div>

            {pageData?.hero?.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-[11px] md:text-xs font-bold mb-3 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
                <span>{pageData.hero.badge}</span>
              </div>
            )}

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-5 pt-2 pb-2 leading-[2.25] md:leading-[1.95] drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#10b981] via-[#06b6d4] to-[#a855f7]">
              {pageData?.hero?.titlePart1}
              {pageData?.hero?.titlePart2}
            </h1>

            {pageData?.hero?.quote && (
              <blockquote className="text-xs sm:text-sm md:text-base font-bold text-amber-300/95 bg-white/[0.03] backdrop-blur-md border border-amber-500/20 rounded-2xl py-3 px-4 sm:px-6 shadow-[inset_0_0_15px_rgba(245,158,11,0.05)] mx-auto max-w-3xl mb-4 text-justify [text-align-last:center] leading-7">
                {pageData.hero.quote}
              </blockquote>
            )}

            <div className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify [text-align-last:center] w-full px-1 md:px-0 space-y-3 md:space-y-4 select-none drop-shadow-md">
              {(pageData?.hero?.paragraphs || []).map((p, idx) => (
                <p key={idx} className="select-none">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* چیدمان دو ستونه: نوار راهبری چسبان + بخش‌های محتوایی */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-7 items-start">
        {/* نوار راهبری چسبان */}
        <motion.aside
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          aria-label={ui.tocTitle}
          className="lg:col-span-3 sticky top-2 lg:top-24 z-20 w-full select-none"
        >
          <nav className="relative w-full rounded-2xl lg:rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.08] bg-[#0f172a]/85 lg:bg-white/[0.03] backdrop-blur-2xl p-2.5 lg:p-5 space-y-2 lg:space-y-4">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none" />

            <div className="hidden lg:flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
                {ui.tocTitle}
              </h2>
              <span className="text-[11px] text-gray-400 font-bold">
                {toPersianDigits(navItems.length)} {ui.tocCountUnit}
              </span>
            </div>

            <ul className="flex lg:flex-col gap-1.5 lg:gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 ml-12 sm:ml-14 lg:ml-0 custom-scrollbar">
              {navItems.map((item) => {
                const isActive = activeSectionId === item.id;
                return (
                  <li key={item.id} className="shrink-0 lg:shrink">
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border',
                        isActive
                          ? 'bg-white/[0.08] text-white border-white/20 shadow-inner'
                          : 'bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05] border-transparent'
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: isActive ? `0 0 8px ${item.color}` : 'none',
                          transform: isActive ? 'scale(1.25)' : 'scale(1)',
                        }}
                      />
                      <span className="truncate">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="pt-1.5 lg:pt-3 border-t border-white/10 flex justify-start lg:block">
              <button
                type="button"
                onClick={() => setXrayMode((prev) => !prev)}
                className={cn(
                  'w-fit lg:w-full py-1.5 lg:py-2 px-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border flex items-center justify-between gap-3 cursor-pointer',
                  xrayMode
                    ? 'bg-[#06b6d4]/20 border-[#06b6d4]/50 text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <span>{ui.xrayToggleLabel}</span>
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-colors shrink-0',
                    xrayMode ? 'bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]' : 'bg-gray-500'
                  )}
                />
              </button>
            </div>
          </nav>
        </motion.aside>

        {/* ستون اصلی محتوا با انیمیشن اسکرول مرحله‌به‌مرحله (whileInView) روی تک‌تک قاب‌ها */}
        <article className="lg:col-span-9 space-y-6 md:space-y-9 select-none">
          {/* ========================================================= */}
          {/* بخش ۱: منظومه فکری ما + رهنمودهای رهبر شهید انقلاب اسلامی */}
          {/* ========================================================= */}
          {pageData?.manifesto?.enabled !== false && (
            <motion.section
              id="section-manifesto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-2">
                {pageData?.manifesto?.badge && (
                  <span className="inline-block text-xs font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-3 py-1 rounded-lg">
                    {pageData.manifesto.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.manifesto?.titlePart1}</span>
                  <span className="text-[#10b981]">{pageData?.manifesto?.titlePart2}</span>
                </h2>
              </div>

              {(pageData?.manifesto?.leaderQuoteText || pageData?.manifesto?.leaderQuoteTitle) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-[#10b981]/30 shadow-[inset_0_0_25px_rgba(16,185,129,0.08),0_10px_30px_rgba(0,0,0,0.4)] space-y-3"
                >
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      x: [0, -60, 40, 0],
                      y: [0, 25, -20, 0],
                      opacity: [0.18, 0.38, 0.2, 0.18],
                      scale: [1, 1.25, 0.9, 1],
                    }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#10b981]/30 blur-2xl -z-10"
                  />
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      x: [0, 50, -30, 0],
                      y: [0, -20, 25, 0],
                      opacity: [0.15, 0.32, 0.15],
                    }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute -bottom-12 left-10 w-48 h-48 rounded-full bg-[#06b6d4]/25 blur-2xl -z-10"
                  />

                  {pageData?.manifesto?.leaderQuoteTitle && (
                    <h3 className="text-xs sm:text-sm font-black text-[#10b981] flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                      </span>
                      <span>{pageData.manifesto.leaderQuoteTitle}</span>
                    </h3>
                  )}

                  {pageData?.manifesto?.leaderQuoteText && (
                    <blockquote className="text-xs sm:text-sm md:text-base text-white/95 font-bold leading-7 sm:leading-8 text-justify [text-align-last:right]">
                      <XRayText
                        text={pageData.manifesto.leaderQuoteText}
                        xrayMode={xrayMode}
                        tooltipText={ui.xrayTooltipText}
                      />
                    </blockquote>
                  )}

                  {pageData?.manifesto?.leaderQuoteMeta && (
                    <div className="pt-1 flex justify-end">
                      <span className="text-[10px] sm:text-[11px] text-white/45 font-light tracking-wide">
                        {pageData.manifesto.leaderQuoteMeta}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="space-y-3.5 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.manifesto?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    <XRayText text={p} xrayMode={xrayMode} tooltipText={ui.xrayTooltipText} />
                  </p>
                ))}
              </div>

              {Array.isArray(pageData?.manifesto?.pillars) &&
                pageData.manifesto.pillars.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {pageData.manifesto.pillars.map((pillar, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] space-y-2 relative overflow-hidden"
                      >
                        <div
                          className="w-8 h-1 rounded-full mb-1"
                          style={{ backgroundColor: pillar.color || '#10b981' }}
                        />
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {pillar.title}
                        </h3>
                        <p className="text-xs text-gray-300 leading-6 text-justify [text-align-last:right]">
                          <XRayText
                            text={pillar.desc}
                            xrayMode={xrayMode}
                            tooltipText={ui.xrayTooltipText}
                          />
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۲: لحن و سبک نگارش */}
          {/* ========================================================= */}
          {pageData?.tone?.enabled !== false && (
            <motion.section
              id="section-tone"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-2">
                {pageData?.tone?.badge && (
                  <span className="inline-block text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-3 py-1 rounded-lg">
                    {pageData.tone.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.tone?.titlePart1}</span>
                  <span className="text-[#06b6d4]">{pageData?.tone?.titlePart2}</span>
                </h2>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.tone?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    <XRayText text={p} xrayMode={xrayMode} tooltipText={ui.xrayTooltipText} />
                  </p>
                ))}
              </div>

              {Array.isArray(pageData?.tone?.principles) &&
                pageData.tone.principles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {pageData.tone.principles.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] space-y-2"
                      >
                        <h3
                          className="text-sm font-bold"
                          style={{ color: item.color || '#06b6d4' }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-300 leading-6 text-justify [text-align-last:right]">
                          <XRayText
                            text={item.desc}
                            xrayMode={xrayMode}
                            tooltipText={ui.xrayTooltipText}
                          />
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

              {Array.isArray(pageData?.tone?.comparisons) &&
                pageData.tone.comparisons.length > 0 && (
                  <div className="space-y-3.5 pt-1">
                    {pageData.tone.comparisons.map((comp, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                            <span className="inline-block text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md">
                              {ui.incorrectBadge}
                            </span>
                            <p className="text-xs sm:text-sm text-rose-100 leading-6 line-through decoration-rose-500/60 text-justify [text-align-last:right]">
                              <XRayText
                                text={comp.wrong}
                                xrayMode={xrayMode}
                                tooltipText={ui.xrayTooltipText}
                              />
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                  {ui.correctBadge}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(comp.right)}
                                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-[#10b981] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                >
                                  <Icon name="copy" className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-6 text-justify [text-align-last:right]">
                                <XRayText
                                  text={comp.right}
                                  xrayMode={xrayMode}
                                  tooltipText={ui.xrayTooltipText}
                                />
                              </p>
                            </div>
                          </div>
                        </div>

                        {comp.rule && (
                          <div className="text-xs text-gray-300 bg-white/[0.03] px-3.5 py-2 rounded-xl border border-white/5 text-justify [text-align-last:right]">
                            <strong className="text-[#06b6d4] ml-1">{ui.whyLabel}</strong>
                            <XRayText
                              text={comp.rule}
                              xrayMode={xrayMode}
                              tooltipText={ui.xrayTooltipText}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۳: الفبای درست‌نویسی و ویرایش صوری */}
          {/* ========================================================= */}
          {pageData?.orthography?.enabled !== false && (
            <motion.section
              id="section-orthography"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-6"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-90 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                <div className="space-y-1.5">
                  {pageData?.orthography?.badge && (
                    <span className="inline-block text-xs font-bold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 px-3 py-1 rounded-lg">
                      {pageData.orthography.badge}
                    </span>
                  )}
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                    <span>{pageData?.orthography?.titlePart1}</span>
                    <span className="text-[#a855f7]">{pageData?.orthography?.titlePart2}</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setXrayMode((prev) => !prev)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer',
                    xrayMode
                      ? 'bg-[#06b6d4] text-slate-950 border-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-white/[0.04] text-[#06b6d4] border-[#06b6d4]/40 hover:bg-[#06b6d4]/15'
                  )}
                >
                  {ui.xrayToggleLabel}
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.orthography?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    <XRayText text={p} xrayMode={xrayMode} tooltipText={ui.xrayTooltipText} />
                  </p>
                ))}
              </div>

              <div className="space-y-5">
                {(pageData?.orthography?.subSections || []).map((sub, sIdx) => (
                  <motion.div
                    key={sIdx}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.35, delay: sIdx * 0.08 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] space-y-4"
                  >
                    <div className="space-y-1.5 border-b border-white/10 pb-2.5">
                      <h3
                        className="text-sm sm:text-base font-black"
                        style={{ color: sub.color || '#06b6d4' }}
                      >
                        {sub.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-6 text-justify [text-align-last:right]">
                        <XRayText
                          text={sub.desc}
                          xrayMode={xrayMode}
                          tooltipText={ui.xrayTooltipText}
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(sub.examples || []).map((ex, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-2">
                              <span className="text-xs text-rose-200 font-medium">
                                <XRayText
                                  text={ex.wrong}
                                  xrayMode={xrayMode}
                                  tooltipText={ui.xrayTooltipText}
                                />
                              </span>
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded shrink-0">
                                {ui.incorrectBadge}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2">
                              <span className="text-xs text-emerald-50 font-bold">
                                <XRayText
                                  text={ex.right}
                                  xrayMode={xrayMode}
                                  tooltipText={ui.xrayTooltipText}
                                />
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ex.right)}
                                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-[#10b981] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                >
                                  <Icon name="copy" className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {ex.rule && (
                            <p className="text-[11px] text-gray-300 leading-5 text-justify [text-align-last:right]">
                              <strong className="text-amber-400 ml-1">{ui.whyLabel}</strong>
                              <XRayText
                                text={ex.rule}
                                xrayMode={xrayMode}
                                tooltipText={ui.xrayTooltipText}
                              />
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۴: علایم نگارشی (سجاوندی) و اعداد فارسی */}
          {/* ========================================================= */}
          {pageData?.punctuation?.enabled !== false && (
            <motion.section
              id="section-punctuation"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-2">
                {pageData?.punctuation?.badge && (
                  <span className="inline-block text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-3 py-1 rounded-lg">
                    {pageData.punctuation.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.punctuation?.titlePart1}</span>
                  <span className="text-[#f59e0b]">{pageData?.punctuation?.titlePart2}</span>
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.punctuation?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    <XRayText text={p} xrayMode={xrayMode} tooltipText={ui.xrayTooltipText} />
                  </p>
                ))}
              </div>

              <div className="space-y-3.5">
                {(pageData?.punctuation?.rules || []).map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-2.5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                        <span className="inline-block text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded">
                          {ui.incorrectBadge}
                        </span>
                        <p className="text-xs sm:text-sm text-rose-100 leading-6 text-justify [text-align-last:right]">
                          <XRayText
                            text={item.wrong}
                            xrayMode={xrayMode}
                            tooltipText={ui.xrayTooltipText}
                          />
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                            {ui.correctBadge}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.right)}
                            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-[#10b981] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Icon name="copy" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-50 font-bold leading-6 text-justify [text-align-last:right]">
                          <XRayText
                            text={item.right}
                            xrayMode={xrayMode}
                            tooltipText={ui.xrayTooltipText}
                          />
                        </p>
                      </div>
                    </div>

                    {item.rule && (
                      <p className="text-xs text-gray-300 bg-white/[0.03] px-3.5 py-2 rounded-xl text-justify [text-align-last:right]">
                        <strong className="text-[#f59e0b] ml-1">{ui.whyLabel}</strong>
                        <XRayText
                          text={item.rule}
                          xrayMode={xrayMode}
                          tooltipText={ui.xrayTooltipText}
                        />
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۵: جدول جامع واژه‌گزینی */}
          {/* ========================================================= */}
          {pageData?.lexicon?.enabled !== false && (
            <motion.section
              id="section-lexicon"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  {pageData?.lexicon?.badge && (
                    <span className="inline-block text-xs font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-3 py-1 rounded-lg">
                      {pageData.lexicon.badge}
                    </span>
                  )}
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                    <span>{pageData?.lexicon?.titlePart1}</span>
                    <span className="text-[#10b981]">{pageData?.lexicon?.titlePart2}</span>
                  </h2>
                </div>

                <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] backdrop-blur-md p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setLexiconViewMode('cards')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      lexiconViewMode === 'cards'
                        ? 'bg-[#10b981] text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {ui.viewModeCards}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLexiconViewMode('table')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      lexiconViewMode === 'table'
                        ? 'bg-[#10b981] text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {ui.viewModeTable}
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.lexicon?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    {p}
                  </p>
                ))}
              </div>

              <div className="space-y-3 bg-white/[0.03] backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/[0.06]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    maxLength={50}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(sanitizeSafePersianInput(e.target.value, 50))}
                    placeholder={ui.searchPlaceholder}
                    className="w-full bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-xl pr-4 pl-11 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-400 focus:border-[#10b981] outline-none transition-colors select-text"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                    >
                      <Icon name="eraser" className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {lexiconCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border',
                        selectedCategory === cat
                          ? 'bg-[#10b981] text-white border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-white/[0.04] text-gray-300 border-white/10 hover:bg-white/10'
                      )}
                    >
                      {cat === 'ALL' ? ui.allCategoriesLabel : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden">
                <div className="max-h-[390px] md:max-h-[460px] overflow-y-auto custom-scrollbar">
                  <div
                    className={cn(
                      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3',
                      lexiconViewMode === 'table' ? 'md:hidden' : ''
                    )}
                  >
                    {filteredLexicon.length > 0 ? (
                      filteredLexicon.map((row, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] hover:border-[#10b981]/40 transition-all flex flex-col justify-between space-y-2.5 group shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold text-[#06b6d4]">
                                {row.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(row.persian)}
                                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#10b981] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              >
                                <Icon name="copy" className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="pt-1 space-y-1 break-words">
                              <div className="text-xs text-rose-300/90 line-through decoration-rose-500/50">
                                {row.foreign}
                              </div>
                              <div className="text-sm sm:text-base font-black text-[#10b981]">
                                <XRayText
                                  text={row.persian}
                                  xrayMode={xrayMode}
                                  tooltipText={ui.xrayTooltipText}
                                />
                              </div>
                            </div>
                          </div>

                          {row.note && (
                            <p className="text-[11px] text-gray-300 leading-5 border-t border-white/5 pt-2 text-justify [text-align-last:right] break-words">
                              <XRayText
                                text={row.note}
                                xrayMode={xrayMode}
                                tooltipText={ui.xrayTooltipText}
                              />
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-gray-400 text-sm">
                        {ui.noLexiconMatch}
                      </div>
                    )}
                  </div>

                  {lexiconViewMode === 'table' && (
                    <div className="hidden md:block">
                      <table className="w-full text-right border-collapse">
                        <thead className="sticky top-0 z-20 bg-[#080d1a]/90 backdrop-blur-2xl border-b border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
                          <tr className="text-xs font-black text-gray-200">
                            <th className="py-3.5 px-4 first:rounded-tr-2xl">{ui.colForeign}</th>
                            <th className="py-3.5 px-4 text-[#10b981]">{ui.colPersian}</th>
                            <th className="py-3.5 px-4">{ui.colCategory}</th>
                            <th className="py-3.5 px-4 last:rounded-tl-2xl">{ui.colNote}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-xs">
                          {filteredLexicon.length > 0 ? (
                            filteredLexicon.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-white/[0.04] transition-colors group"
                              >
                                <td className="py-3.5 px-4 font-medium text-rose-300 break-words">
                                  {row.foreign}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-emerald-400 break-words">
                                  <div className="flex items-center justify-between gap-2">
                                    <span>
                                      <XRayText
                                        text={row.persian}
                                        xrayMode={xrayMode}
                                        tooltipText={ui.xrayTooltipText}
                                      />
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(row.persian)}
                                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#10b981] text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
                                    >
                                      <Icon name="copy" className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-cyan-300">
                                    {row.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-gray-300 leading-6 text-justify [text-align-last:right] break-words">
                                  <XRayText
                                    text={row.note}
                                    xrayMode={xrayMode}
                                    tooltipText={ui.xrayTooltipText}
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-gray-400">
                                {ui.noLexiconMatch}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۶: جعبه ابزار فارسی‌نویسی و کلیدهای میانبر */}
          {/* ========================================================= */}
          {pageData?.toolkit?.enabled !== false && (
            <motion.section
              id="section-toolkit"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-2">
                {pageData?.toolkit?.badge && (
                  <span className="inline-block text-xs font-bold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 px-3 py-1 rounded-lg">
                    {pageData.toolkit.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.toolkit?.titlePart1}</span>
                  <span className="text-[#a855f7]">{pageData?.toolkit?.titlePart2}</span>
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                {(pageData?.toolkit?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className="text-justify [text-align-last:right]">
                    {p}
                  </p>
                ))}
              </div>

              {Array.isArray(pageData?.toolkit?.osTabs) &&
                pageData.toolkit.osTabs.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                      {pageData.toolkit.osTabs.map((tab) => {
                        const isSelected = activeOsTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveOsTab(tab.id)}
                            className={cn(
                              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                              isSelected
                                ? 'bg-white/[0.12] text-white border-white/30 shadow-inner'
                                : 'bg-white/[0.02] text-gray-400 border-white/5 hover:text-white'
                            )}
                          >
                            {tab.osName}
                          </button>
                        );
                      })}
                    </div>

                    {pageData.toolkit.osTabs
                      .filter((t) => t.id === activeOsTab)
                      .map((tab) => (
                        <div key={tab.id} className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          {(tab.shortcuts || []).map((sc, sIdx) => (
                            <motion.div
                              key={sIdx}
                              initial={{ opacity: 0, y: 15 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: '-20px' }}
                              transition={{ duration: 0.3, delay: sIdx * 0.06 }}
                              className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] flex flex-col justify-between space-y-3"
                            >
                              <div className="space-y-1.5">
                                <h3 className="text-xs sm:text-sm font-bold text-white">
                                  {sc.action}
                                </h3>
                                <p className="text-xs text-gray-300 leading-6 text-justify [text-align-last:right]">
                                  {sc.desc}
                                </p>
                              </div>
                              <kbd
                                dir="ltr"
                                style={{
                                  fontFamily: 'Vazirmatn, var(--font-vazirmatn), sans-serif',
                                }}
                                className="inline-block text-center px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-black text-[#06b6d4] shadow-inner font-sans"
                              >
                                {sc.keys}
                              </kbd>
                            </motion.div>
                          ))}
                        </div>
                      ))}
                  </div>
                )}
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۷: پرسش‌های متداول نگارشی (FAQ) */}
          {/* ========================================================= */}
          {pageData?.faq?.enabled !== false && Array.isArray(pageData?.faq?.items) && (
            <motion.section
              id="section-faq"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-2">
                {pageData?.faq?.badge && (
                  <span className="inline-block text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-3 py-1 rounded-lg">
                    {pageData.faq.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.faq?.titlePart1}</span>
                  <span className="text-[#f59e0b]">{pageData?.faq?.titlePart2}</span>
                </h2>
              </div>

              <div className="space-y-2.5">
                {pageData.faq.items.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.3, delay: idx * 0.06 }}
                      className="rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="w-full p-4 text-right flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      >
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-6">
                          <XRayText
                            text={item.question}
                            xrayMode={xrayMode}
                            tooltipText={ui.xrayTooltipText}
                          />
                        </h3>
                        <span
                          className={cn(
                            'w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-[#f59e0b] transition-transform duration-200 shrink-0',
                            isOpen ? 'rotate-180 bg-[#f59e0b]/20' : ''
                          )}
                        >
                          ▼
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-300 leading-7 border-t border-white/5 text-justify [text-align-last:right]"
                          >
                            <XRayText
                              text={item.answer}
                              xrayMode={xrayMode}
                              tooltipText={ui.xrayTooltipText}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۸: آزمایشگاه زنده پالایش متن */}
          {/* ========================================================= */}
          {pageData?.refiner?.enabled !== false && (
            <motion.section
              id="section-refiner"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-[#06b6d4]/30 bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-1.5">
                {pageData?.refiner?.badge && (
                  <span className="inline-block text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-3 py-1 rounded-lg">
                    {pageData.refiner.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.refiner?.titlePart1}</span>
                  <span className="text-[#06b6d4]">{pageData?.refiner?.titlePart2}</span>
                </h2>
              </div>

              {pageData?.refiner?.description && (
                <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                  {pageData.refiner.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">{ui.statDigitsLabel}</span>
                  <span className="text-base sm:text-lg font-black text-[#10b981]">
                    {toPersianDigits(refinerResult.digitsCount)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">{ui.statCharsLabel}</span>
                  <span className="text-base sm:text-lg font-black text-[#06b6d4]">
                    {toPersianDigits(refinerResult.charsCount)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">{ui.statZwnjLabel}</span>
                  <span className="text-base sm:text-lg font-black text-[#f59e0b]">
                    {toPersianDigits(refinerResult.zwnjCount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start select-text pt-1">
                <div className="flex flex-col space-y-2.5 select-text">
                  <div className="h-9 flex items-center justify-between gap-2 select-none">
                    <label className="text-xs font-bold text-gray-200 truncate">
                      {ui.refinerInputLabel}
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setRawInput(pageData?.refiner?.sampleRawText || '')}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-bold text-cyan-300 border border-white/10 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {ui.refinerSampleBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRawInput('')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-[11px] font-bold text-rose-300 border border-rose-500/30 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {ui.refinerClearBtn}
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    maxLength={1200}
                    value={rawInput}
                    onChange={(e) =>
                      setRawInput(sanitizeSafePersianInput(e.target.value, 1200))
                    }
                    className="w-full h-[200px] sm:h-[220px] rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/15 p-4 text-xs sm:text-sm text-white leading-7 focus:bg-white/[0.07] focus:border-[#06b6d4] outline-none resize-none shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] select-text text-justify [text-align-last:right] break-words custom-scrollbar"
                  />
                </div>

                <div className="flex flex-col space-y-2.5 select-text">
                  <div className="h-9 flex items-center justify-between select-none">
                    <label className="text-xs font-bold text-[#10b981] truncate">
                      {ui.refinerOutputLabel}
                    </label>
                  </div>

                  <div className="relative w-full h-[200px] sm:h-[220px] rounded-2xl bg-emerald-950/20 backdrop-blur-xl border border-[#10b981]/35 p-4 pl-12 text-xs sm:text-sm text-emerald-50 leading-7 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] select-text text-justify [text-align-last:right] break-words overflow-y-auto custom-scrollbar">
                    <div className="absolute top-3 left-3 z-10 select-none">
                      <button
                        type="button"
                        onClick={() => handleCopy(refinerResult.refined)}
                        className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#10b981] text-[#10b981] hover:text-white border border-[#10b981]/30 flex items-center justify-center transition-all cursor-pointer shadow-inner"
                      >
                        <Icon name="copy" className="w-4 h-4" />
                      </button>
                    </div>

                    <XRayText
                      text={refinerResult.refined}
                      xrayMode={xrayMode}
                      tooltipText={ui.xrayTooltipText}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ========================================================= */}
          {/* بخش ۹ (آخرین بخش صفحه): پیمان فارسی‌نویسی، پیشنهاد واژه و پیوند به صفحات کلیدی */}
          {/* ========================================================= */}
          {pageData?.pledge?.enabled !== false && (
            <motion.footer
              id="section-pledge"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-28 relative rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-[#10b981]/30 bg-white/[0.02] backdrop-blur-2xl p-5 sm:p-7 md:p-9 space-y-6"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

              <div className="space-y-3">
                {pageData?.pledge?.badge && (
                  <span className="inline-block text-xs font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1 rounded-full">
                    {pageData.pledge.badge}
                  </span>
                )}
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  <span>{pageData?.pledge?.titlePart1}</span>
                  <span className="text-[#10b981]">{pageData?.pledge?.titlePart2}</span>
                </h2>

                <div className="space-y-3 text-xs sm:text-sm md:text-base text-gray-200 leading-7 sm:leading-8 text-justify [text-align-last:right]">
                  {(pageData?.pledge?.paragraphs || []).map((p, idx) => (
                    <p key={idx} className="text-justify [text-align-last:right]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* قاب ۱: طومار پاسداران زبان فارسی */}
                <form
                  noValidate
                  onSubmit={handlePledge}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        {ui.pledgeBoxTitle}
                      </span>
                      <Tooltip content={pageData?.pledge?.pledgeCountSuffix} position="top">
                        <span className="text-xs text-[#10b981] font-black cursor-default whitespace-nowrap">
                          {toPersianDigits(pledgeCount)} {ui.pledgeCountUnit}
                        </span>
                      </Tooltip>
                    </div>

                    <div className="space-y-2.5">
                      <Tooltip content={ui.pledgeNamePlaceholder} position="top">
                        <input
                          type="text"
                          maxLength={35}
                          disabled={hasPledged}
                          value={pledgerName}
                          onChange={(e) =>
                            setPledgerName(sanitizeSafePersianInput(e.target.value, 35))
                          }
                          placeholder={ui.pledgeNamePlaceholder}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:border-[#10b981] outline-none transition-colors"
                        />
                      </Tooltip>

                      {!user && (
                        <Tooltip content={ui.pledgePhonePlaceholder} position="top">
                          <input
                            type="tel"
                            dir="ltr"
                            maxLength={11}
                            disabled={hasPledged}
                            value={toPersianDigits(pledgerPhone)}
                            onChange={(e) => {
                              const eng = toEnglishDigits(e.target.value)
                                .replace(/\D/g, '')
                                .slice(0, 11);
                              setPledgerPhone(eng);
                            }}
                            placeholder={ui.pledgePhonePlaceholder}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 text-right focus:border-[#10b981] outline-none transition-colors"
                          />
                        </Tooltip>
                      )}
                    </div>

                    {recentPledgers.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[11px] font-bold text-[#06b6d4]">
                          {ui.recentPledgersTitle}
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-0.5">
                          {recentPledgers.slice(0, 10).map((item, i) => {
                            const displayName =
                              typeof item === 'object' ? item.name : item;
                            return (
                              <span
                                key={i}
                                className="text-[10px] bg-white/[0.04] border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg break-words"
                              >
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={hasPledged}
                    className={cn(
                      'w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer border',
                      hasPledged
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 cursor-default'
                        : 'bg-[#10b981] hover:bg-[#059669] text-white border-transparent shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                    )}
                  >
                    {hasPledged
                      ? ui.pledgeAlreadyRegisteredText
                      : pageData?.pledge?.pledgeButtonText}
                  </button>
                </form>

                {/* قاب ۲: پیشنهاد برابرنهاد فارسی */}
                <form
                  noValidate
                  onSubmit={handleSuggestWord}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="border-b border-white/5 pb-2.5">
                      <h3 className="text-xs font-bold text-[#06b6d4]">
                        {ui.suggestTitle}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <Tooltip content={ui.suggestForeignPlaceholder} position="top">
                        <input
                          type="text"
                          maxLength={30}
                          value={suggestForeign}
                          onChange={(e) =>
                            setSuggestForeign(sanitizeSafePersianInput(e.target.value, 30))
                          }
                          placeholder={ui.suggestForeignPlaceholder}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:border-[#06b6d4] outline-none transition-colors"
                        />
                      </Tooltip>

                      <Tooltip content={ui.suggestPersianPlaceholder} position="top">
                        <input
                          type="text"
                          maxLength={30}
                          value={suggestPersian}
                          onChange={(e) =>
                            setSuggestPersian(sanitizeSafePersianInput(e.target.value, 30))
                          }
                          placeholder={ui.suggestPersianPlaceholder}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:border-[#10b981] outline-none transition-colors"
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSuggest}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-[#06b6d4] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    {submittingSuggest ? ui.suggestSubmittingText : ui.suggestSubmitBtn}
                  </button>
                </form>
              </div>

              {Array.isArray(pageData?.pledge?.ecosystemLinks) &&
                pageData.pledge.ecosystemLinks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                    {pageData.pledge.ecosystemLinks.map((card, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] hover:border-white/25 transition-all flex flex-col justify-between space-y-3.5 group"
                      >
                        <div className="space-y-2">
                          <span
                            className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-white/5"
                            style={{ color: card.color || '#10b981' }}
                          >
                            {card.badge}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#10b981] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-gray-300 leading-6 text-justify [text-align-last:right]">
                            {card.desc}
                          </p>
                        </div>

                        <Link
                          href={card.url || '/about'}
                          className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                        >
                          <span>{card.ctaText}</span>
                          <span aria-hidden="true">←</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
            </motion.footer>
          )}
        </article>
      </div>
    </main>
  );
}