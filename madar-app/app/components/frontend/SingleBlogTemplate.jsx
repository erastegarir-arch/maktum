'use client';

import { useState, useMemo, useEffect } from 'react';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon'; 
import ProgressBar from '@/app/components/ProgressBar';
import BlurImage from '@/app/components/BlurImage'; 
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast'; 

// ایمپورت مودال عضویت (پاپ‌آپ)
import AuthModal from '@/app/components/frontend/AuthModal';

// ایمپورت اکشن‌های تعاملی
import { toggleFavoriteAction, submitCommentAction } from '@/app/actions/interactions';

const cn = (...inputs) => twMerge(clsx(inputs));

const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '۰';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
};

function Tooltip({ text, children }) {
  if (!text) return children;
  return (
    <div className="relative z-30 group/tooltip inline-flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none">
        <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap font-sans font-bold">
          {text}
        </div>
      </div>
    </div>
  );
}

const THEMES = {
  RAW: {
    primaryText: "text-[#fbbf24]", primaryBg: "bg-[#fbbf24]", borderClass: "border-[#fbbf24]/30",
    badgeBg: "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30", glowBg: "rgba(251,191,36,0.15)",
    hoverText: "hover:text-[#fbbf24]", hoverBg: "hover:bg-[#fbbf24]", hoverBorder: "hover:border-[#fbbf24]",
    focusBorder: "focus:border-[#fbbf24]", fillCurrent: "fill-current text-[#fbbf24]", gradientVia: "via-[#fbbf24]"
  },
  PRODUCED: {
    primaryText: "text-[#f43f5e]", primaryBg: "bg-[#f43f5e]", borderClass: "border-[#f43f5e]/30",
    badgeBg: "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30", glowBg: "rgba(244,63,94,0.15)",
    hoverText: "hover:text-[#f43f5e]", hoverBg: "hover:bg-[#f43f5e]", hoverBorder: "hover:border-[#f43f5e]",
    focusBorder: "focus:border-[#f43f5e]", fillCurrent: "fill-current text-[#f43f5e]", gradientVia: "via-[#f43f5e]"
  },
  TOOL: {
    primaryText: "text-[#10b981]", primaryBg: "bg-[#10b981]", borderClass: "border-[#10b981]/30",
    badgeBg: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30", glowBg: "rgba(16,185,129,0.15)",
    hoverText: "hover:text-[#10b981]", hoverBg: "hover:bg-[#10b981]", hoverBorder: "hover:border-[#10b981]",
    focusBorder: "focus:border-[#10b981]", fillCurrent: "fill-current text-[#10b981]", gradientVia: "via-[#10b981]"
  },
  BLOG: {
    primaryText: "text-[#f59e0b]", primaryBg: "bg-[#f59e0b]", borderClass: "border-[#f59e0b]/30",
    badgeBg: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30", glowBg: "rgba(245,158,11,0.15)",
    hoverText: "hover:text-[#f59e0b]", hoverBg: "hover:bg-[#f59e0b]", hoverBorder: "hover:border-[#f59e0b]",
    focusBorder: "focus:border-[#f59e0b]", fillCurrent: "fill-current text-[#f59e0b]", gradientVia: "via-[#f59e0b]"
  }
};

const sharePlatforms = [
  { name: 'ایتا', icon: 'eitaa', hoverColorClass: 'hover:text-[#f97316]', getUrl: (url, title) => `https://eitaa.com/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { name: 'بله', icon: 'bale', hoverColorClass: 'hover:text-[#10b981]', getUrl: (url, title) => `https://ble.ir/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { name: 'تلگرام', icon: 'telegram', hoverColorClass: 'hover:text-[#0088cc]', getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` }
];

const safeParse = (str, fallback = []) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try { return JSON.parse(str); } catch { return fallback; }
};

// ==========================================
// کامپوننت بلاگ
// ==========================================
export default function SingleBlogTemplate({ data, type = 'BLOG', currentUser = null }) {
  const [isFavorite, setIsFavorite] = useState(data?.isFavoritedByMe || false);
  const [favCount, setFavCount] = useState(data?._count?.favoritedBy || 0);

  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // استیت کنترل باز شدن مودال لاگین/عضویت
  const [showAuthModal, setShowAuthModal] = useState(false);

  const currentTheme = THEMES[type] || THEMES.BLOG;
  const parentBreadcrumb = { label: 'بلاگ', href: '/blog' };

  const title = `${data?.titleBase || ''} ${data?.titleHighlight || ''}`.trim();
  const mainImage = data?.coverDesktop || '/images/placeholder-cover.jpg'; 
  const mobileImage = data?.coverMobile || mainImage; 
  
  // سیستم پشتیبانی از چند نویسنده
  const authors = data?.creators?.length > 0 ? data.creators : [{ name: 'مرکز مدار', imageUrl: null, avatarUrl: null }];

  const displaySettings = safeParse(data?.displaySettings, {});
  const relatedContent = safeParse(data?.relatedContent, []);
  const commentsList = safeParse(data?.comments, []);

  const combinedTaxonomies = useMemo(() => {
    const cats = (data?.categories || []).map(c => ({ name: c.name, link: `/t/cat/${c.slug || c.name}`, isTag: false }));
    const tgs = (data?.tags || []).map(t => ({ name: t.name, link: `/t/tag/${t.name}`, isTag: true }));
    return [...cats, ...tgs].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  }, [data]);

  const handleCopyLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://madar.ir';
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const seoTitle = data?.seoTitle || title;
    if (seoTitle) document.title = `مدار | ${seoTitle}`;
  }, [data, title]);

  // پیغام سفارشی که دکمه آن مستقیماً پاپ‌آپ لاگین را باز می‌کند
  const showLoginToast = () => {
    toast((t) => (
      <div className="flex flex-col gap-2 font-sans text-right" dir="rtl">
        <span className="text-sm font-bold text-white">دسترسی محدود</span>
        <span className="text-xs text-gray-300">برای استفاده از این امکان باید وارد حساب کاربری خود شوید.</span>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.dismiss(t.id);
            setShowAuthModal(true); // باز شدن مودال
          }}
          className={`mt-2 ${currentTheme.primaryBg} text-white px-4 py-2 rounded-lg text-xs font-bold border border-transparent shadow-inner hover:brightness-110 transition-all cursor-pointer`}
        >
          ورود / عضویت
        </button>
      </div>
    ), {
      duration: 5000,
      style: { background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  // =====================================
  // توابع تعاملی
  // =====================================
  const handleFavoriteClick = async () => {
    if (!currentUser) {
      showLoginToast();
      return;
    }
    
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    setFavCount(prev => newStatus ? prev + 1 : prev - 1);
    
    const res = await toggleFavoriteAction(data.id);
    if (!res.success) {
      setIsFavorite(!newStatus); 
      setFavCount(prev => !newStatus ? prev + 1 : prev - 1);
      toast.error(res.error);
    }
  };

  const handleCommentFocus = (e) => {
    if (!currentUser) {
      e.target.blur(); 
      showLoginToast();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return; 
    if (!commentText.trim()) return;

    const toastId = toast.loading('در حال ارسال دیدگاه...');
    const res = await submitCommentAction(data.id, commentText);
    
    if (res.success) {
      toast.success('دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر می‌شود.', { id: toastId });
      setCommentText('');
    } else {
      toast.error(res.error || 'خطا در ثبت دیدگاه', { id: toastId });
    }
  };
  // =====================================

  const showDateFlag = displaySettings.showDate !== false && !!data?.publishedAt;
  const showReadTimeFlag = displaySettings.showReadTime !== false && !!data?.readTime;
  const showViewsFlag = displaySettings.showViews !== false;
  const showAgeRatingFlag = displaySettings.showAgeRating !== false && !!data?.ageRating;
  const hasAnyMetaInfo = showDateFlag || showReadTimeFlag || showViewsFlag || showAgeRatingFlag;

  const isCommentsEnabled = displaySettings.allowComments !== false && data?.allowComments !== false && displaySettings.showComments !== false;

  return (
    <div className={`relative min-h-screen flex flex-col scroll-smooth theme-${type.toLowerCase()}`}>
      <div className="fixed inset-0 z-[-1] bg-[#05080f] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-15" style={{ backgroundImage: `radial-gradient(circle, ${currentTheme.glowBg} 0%, transparent 70%)` }} />
      </div>

      <ProgressBar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ label: 'مدار', href: '/' }, parentBreadcrumb, { label: title || 'بدون عنوان' }]} />
        </div>

        <article className="max-w-4xl mx-auto mt-6 animate-[fadeIn_0.5s_ease-out]">
          
          <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent group mb-10 cursor-pointer p-1">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
            <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black/40 shadow-inner">
              <picture className="w-full h-full">
                <source media="(max-width: 768px)" srcSet={mobileImage} />
                <img src={mainImage} alt={title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 group-hover:opacity-100" />
              </picture>
            </div>
          </div>

          <div className="mb-8 text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 font-sans">
              {data?.titleBase} <span className={currentTheme.primaryText}>{data?.titleHighlight}</span>
            </h1>
            {data?.subtitle && (
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light text-justify font-sans">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* نوار متادیتا و دکمه‌های اشتراک‌گذاری */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-5 border-y border-white/10 mb-10">
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              {hasAnyMetaInfo && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-gray-400 bg-white/5 border border-transparent px-4 py-2.5 rounded-3xl font-sans shadow-inner">
                  {showDateFlag && (
                    <Tooltip text="تاریخ انتشار">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-200 transition-colors font-bold">
                        <Icon name="calendarBlank" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(new Date(data.publishedAt).toLocaleDateString('fa-IR'))}
                      </span>
                    </Tooltip>
                  )}
                  {showDateFlag && (showReadTimeFlag || showViewsFlag || showAgeRatingFlag) && <span className="w-1 h-1 bg-white/20 rounded-full shrink-0"></span>}
                  
                  {showReadTimeFlag && (
                    <Tooltip text="زمان تخمینی مطالعه">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-200 transition-colors font-bold">
                        <Icon name="clock" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(data.readTime)} دقیقه مطالعه
                      </span>
                    </Tooltip>
                  )}
                  {showReadTimeFlag && (showViewsFlag || showAgeRatingFlag) && <span className="w-1 h-1 bg-white/20 rounded-full shrink-0"></span>}
                  
                  {showViewsFlag && (
                    <Tooltip text="تعداد بازدیدکنندگان">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-200 transition-colors font-bold">
                        <Icon name="eye" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(data?.viewCount || 0)} بازدید
                      </span>
                    </Tooltip>
                  )}
                  {showViewsFlag && showAgeRatingFlag && <span className="w-1 h-1 bg-white/20 rounded-full shrink-0"></span>}
                  
                  {showAgeRatingFlag && (
                    <Tooltip text="رده‌بندی سنی مقاله">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-200 transition-colors">
                        <Icon name="shieldCheck" className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
                        رده‌بندی سنی: <span className="dir-ltr text-white font-bold">{toPersianDigits(data.ageRating)}</span>
                      </span>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 lg:ml-auto w-full lg:w-auto">
              <Tooltip text="اشتراک‌گذاری">
                <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-transparent shadow-inner">
                  <Icon name="shareNetwork" className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip text={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن مقاله به علاقه‌مندی‌ها"}>
                <button onClick={handleFavoriteClick} className={`transition-all cursor-pointer flex items-center gap-1.5 p-2.5 rounded-full border border-transparent shadow-inner ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}>
                  <Icon name="heart" className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-[11px] font-sans font-bold pt-0.5">{toPersianDigits(favCount)}</span>
                </button>
              </Tooltip>
            </div>

          </div>

          {data?.lead && (
            <div className="relative p-6 md:p-8 rounded-3xl overflow-hidden shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] bg-white/[0.02] backdrop-blur-2xl border border-transparent mb-10">
              <p className="text-white text-base md:text-lg leading-loose font-bold text-justify relative z-10 font-sans">
                {data.lead}
              </p>
            </div>
          )}

          <div className={`rich-text theme-${type.toLowerCase()} relative z-10 mb-12`}>
            <div dangerouslySetInnerHTML={{ __html: data?.body || '' }} />
          </div>

          {combinedTaxonomies.length > 0 && (
            <div className="pt-6 border-t border-white/10 mb-10">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> دسته‌بندی‌ها و برچسب‌ها:
              </h3>
              <div className="flex flex-wrap gap-2 relative z-10">
                {combinedTaxonomies.map((tax, idx) => (
                  <a key={idx} href={tax.link} className={`px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent shadow-inner text-xs font-bold text-gray-300 ${currentTheme.hoverText} transition-all flex items-center gap-1.5 font-sans`}>
                    {tax.isTag && <Icon name="hash" className="w-3.5 h-3.5 opacity-60 shrink-0" />}
                    {tax.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ===================== انتقال بخش نویسندگان به پایین صفحه ===================== */}
          {displaySettings.showAuthor !== false && (
            <div className="pt-6 mt-8 border-t border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="user" className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-300 font-sans">نویسندگان و پژوهشگران:</span>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                {authors.map((author, index) => {
                  const authorImage = author?.imageUrl || author?.avatarUrl || null;
                  return (
                    <a key={index} href={`/t/${author.slug || author.name}`} className="flex items-center gap-3 group cursor-pointer bg-white/5 hover:bg-white/10 border border-transparent shadow-inner transition-colors px-4 py-3 rounded-2xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-transparent shadow-inner shrink-0 relative bg-black/40 flex items-center justify-center">
                        {authorImage ? (
                          <BlurImage src={authorImage} alt={author.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <Icon name="user" className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-bold text-white ${currentTheme.hoverText} transition-colors flex items-center gap-1 font-sans`}>
                          {author.name}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          {/* ================================================================================= */}
          
        </article>

        <div className="max-w-4xl mx-auto space-y-12">
          
          {relatedContent && relatedContent.length > 0 && (
            <section className="mt-10 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1.5 font-sans">محتوای مرتبط</h2>
                  <p className="text-xs text-gray-400 font-light font-sans">محتوای مشابه که ممکن است برایتان جالب باشد</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedContent.map(rel => (
                  <a key={rel.id} href={rel.link || '#'} className="relative group flex flex-col p-3 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-transparent">
                    <div className="absolute inset-0 bg-white/5 border border-transparent shadow-inner group-hover:bg-white/10 backdrop-blur-xl pointer-events-none -z-10 transition-colors" />
                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none z-20`} />
                    
                    <div className="relative w-full h-36 rounded-xl bg-black/40 shadow-inner overflow-hidden mb-3 flex items-center justify-center z-10 border border-transparent">
                      <BlurImage src={rel.image || '/images/placeholder-cover.jpg'} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={rel.title || "Related"} />
                    </div>
                    <div className="flex-grow z-10">
                      <h3 className={`text-xs font-bold text-white mb-2 leading-relaxed ${currentTheme.hoverText} transition-colors line-clamp-2 font-sans`}>{rel.title}</h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-sans z-10 font-bold">
                      <span className="flex items-center gap-1 cursor-default"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> {toPersianDigits(rel.date)}</span>
                      <span className="flex items-center gap-1 cursor-default"><Icon name="eye" className="w-3.5 h-3.5" /> {toPersianDigits(rel.views)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {isCommentsEnabled && (
            <section id="comments" className="mt-10 pt-6 border-t border-white/10 relative z-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-sans">
                <Icon name="chat" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> نظرات کاربران 
                <span className="text-[10px] font-sans font-bold text-gray-300 bg-white/10 border border-transparent shadow-inner px-3 py-1 rounded-full">
                  {toPersianDigits(commentsList.length)} نظر
                </span>
              </h3>

              <div className="relative p-5 sm:p-6 rounded-3xl mb-6 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                <form className="relative z-10" onSubmit={handleCommentSubmit}>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      {currentUser ? (
                        <span className="text-[11px] font-bold text-[#10b981] font-sans pl-1">شما با حساب کاربری وارد شده‌اید</span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 font-sans pl-1">ابتدا وارد سایت شوید</span>
                      )}
                      <span className="text-[9px] text-gray-400 font-sans font-bold px-2 py-0.5 bg-black/40 rounded-lg shadow-inner">پس از تأیید نمایش داده می‌شود</span>
                    </div>
                    <textarea 
                      rows="4" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onFocus={(e) => {
                        handleCommentFocus(e);
                        e.target.style.borderColor = currentTheme.primaryBg.replace('bg-', '');
                      }}
                      onBlur={(e) => e.target.style.borderColor = 'transparent'}
                      placeholder={currentUser ? "نظر خود را درباره این مقاله بنویسید..." : "برای ثبت دیدگاه کلیک کنید..."} 
                      className={`w-full bg-white/10 border border-transparent rounded-2xl p-4 text-white placeholder:text-white/40 text-sm leading-relaxed ${currentTheme.focusBorder} focus:bg-white/20 outline-none transition-all resize-none shadow-inner font-sans`}
                      style={{ '--tw-ring-color': currentTheme.primaryText }} 
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={!commentText.trim() || !currentUser} 
                      className={`bg-white/10 border border-transparent text-white hover:bg-white/20 px-8 py-3 rounded-xl text-sm font-bold ${currentTheme.hoverBg} hover:text-white transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans`}
                    >
                      ارسال دیدگاه
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4 relative z-10">
                {commentsList.map((comment, idx) => (
                  <div key={idx} className="bg-white/5 border border-transparent hover:bg-white/10 transition-colors rounded-2xl p-5 shadow-inner">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/40 border border-transparent shadow-inner flex items-center justify-center shrink-0">
                          <Icon name="user" className={`w-5 h-5 ${currentTheme.primaryText}`} />
                        </div>                    
                        <div>
                          <h4 className="text-sm font-bold text-white font-sans">{comment.user}</h4>
                          <span className="text-[10px] text-gray-500 font-sans font-bold block mt-0.5">{toPersianDigits(comment.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-light text-justify font-sans">
                      {comment.text}
                    </p>
                    {comment.adminReply && (
                    <div className={`mt-4 bg-black/30 border-r-2 ${currentTheme.borderClass.replace('/30', '')} border-transparent shadow-inner p-4 rounded-xl`}>
                      <span className={`text-[10px] ${currentTheme.primaryText} font-bold mb-2 flex items-center gap-1.5 font-sans`}>
                        <Icon name="shield" className="w-3.5 h-3.5" /> پاسخ مدار:
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed font-light font-sans text-justify">{comment.adminReply}</p>
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

      </main>

      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl font-sans">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsShareModalOpen(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }} className="relative z-10 w-full max-w-sm p-6 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-[#050810]/90 backdrop-blur-2xl border border-transparent">
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className={`text-base font-bold text-white flex items-center gap-2`}><Icon name="shareNetwork" className={`w-5 h-5 ${currentTheme.primaryText}`} /> اشتراک‌گذاری</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 rounded-full p-2 border border-transparent shadow-inner">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-center text-sm font-light text-gray-300 mb-5 relative z-10">این مقاله را در شبکه‌های اجتماعی به اشتراک بگذارید:</p>

              <div className="flex gap-6 justify-center items-center mb-8 relative z-10">
                {sharePlatforms.map((platform) => (
                  <div key={platform.name} className="relative flex items-center justify-center">
                    <Tooltip text={platform.name}>
                      <a href={platform.getUrl(typeof window !== 'undefined' ? window.location.href : 'https://madar.ir', title)} target="_blank" rel="noopener noreferrer" className={`p-3 text-gray-400 flex items-center justify-center transition-all duration-300 transform hover:scale-125 ${platform.hoverColorClass} cursor-pointer`}>
                        <Icon name={platform.icon} className="w-7 h-7 transition-colors" />
                      </a>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[11px] font-bold text-gray-400 pl-1">لینک مستقیم صفحه:</label>
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl p-1.5 shadow-inner">
                  <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : 'https://madar.ir'} className="bg-transparent text-gray-400 text-[11px] w-full outline-none px-2 dir-ltr text-left font-sans" />
                  <button onClick={handleCopyLink} className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-lg border border-transparent ${isCopied ? `${currentTheme.primaryBg} text-white` : 'bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 shadow-inner'}`}>
                    {isCopied ? 'کپی شد' : 'کپی لینک'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* اتصال مودال لاگین در سطح کامپوننت با پراپ صحیح */}
      <AnimatePresence>
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

    </div>
  );
}