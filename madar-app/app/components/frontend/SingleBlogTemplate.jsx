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
        <div className="bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap font-sans">
          {text}
        </div>
        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0b0f19] -mt-[1px]"></div>
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
  const author = data?.creators?.[0] || { name: 'مرکز مدار' };
  const authorImage = author?.imageUrl || author?.avatarUrl || null;
  const mainImage = data?.coverDesktop || '/images/placeholder-cover.jpg'; 
  const mobileImage = data?.coverMobile || mainImage; 
  
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
          className={`mt-2 ${currentTheme.primaryBg} text-white px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all cursor-pointer`}
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
          
          <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-10 cursor-pointer">
            <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
            <div className="relative w-full h-full bg-black/50">
              <picture className="w-full h-full">
                <source media="(max-width: 768px)" srcSet={mobileImage} />
                <img src={mainImage} alt={title} className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
              </picture>
            </div>
          </div>

          <div className="mb-8 text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              {data?.titleBase} <span className={currentTheme.primaryText}>{data?.titleHighlight}</span>
            </h1>
            {data?.subtitle && (
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light text-justify">
                {data.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-5 border-y border-white/10 mb-10">
            
            {displaySettings.showAuthor !== false && (
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 relative bg-gray-900 flex items-center justify-center">
                  {authorImage ? (
                    <BlurImage src={authorImage} alt={author.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Icon name="user" className="w-5 h-5 text-gray-500 transition-transform duration-500 group-hover:scale-110" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500 mb-0.5">نویسنده / پژوهشگر</span>
                  <span className={`text-sm font-bold text-white ${currentTheme.hoverText} transition-colors line-clamp-1`}>
                    {author.name}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 lg:justify-end w-full lg:w-auto">
              {hasAnyMetaInfo && (
                <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 font-sans shadow-inner overflow-x-auto hide-scroll">
                  {showDateFlag && (
                    <Tooltip text="تاریخ انتشار">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-300 transition-colors">
                        <Icon name="calendarBlank" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(new Date(data.publishedAt).toLocaleDateString('fa-IR'))}
                      </span>
                    </Tooltip>
                  )}
                  {showDateFlag && (showReadTimeFlag || showViewsFlag || showAgeRatingFlag) && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span>}
                  
                  {showReadTimeFlag && (
                    <Tooltip text="زمان تخمینی مطالعه">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-300 transition-colors">
                        <Icon name="clock" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(data.readTime)} دقیقه مطالعه
                      </span>
                    </Tooltip>
                  )}
                  {showReadTimeFlag && (showViewsFlag || showAgeRatingFlag) && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span>}
                  
                  {showViewsFlag && (
                    <Tooltip text="تعداد بازدیدکنندگان">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-300 transition-colors">
                        <Icon name="eye" className="w-3.5 h-3.5" /> 
                        {toPersianDigits(data?.viewCount || 0)} بازدید
                      </span>
                    </Tooltip>
                  )}
                  {showViewsFlag && showAgeRatingFlag && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span>}
                  
                  {showAgeRatingFlag && (
                    <Tooltip text="رده‌بندی سنی مقاله">
                      <span className="flex items-center gap-1.5 whitespace-nowrap cursor-default hover:text-gray-300 transition-colors">
                        <Icon name="shieldCheck" className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
                        رده‌بندی سنی: <span className="dir-ltr text-white font-bold">{toPersianDigits(data.ageRating)}</span>
                      </span>
                    </Tooltip>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Tooltip text={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن مقاله به علاقه‌مندی‌ها"}>
                  <button onClick={handleFavoriteClick} className={`transition-colors cursor-pointer flex items-center gap-1.5 p-2 rounded-full ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <Icon name="heart" className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="text-[11px] font-sans font-bold pt-0.5">{toPersianDigits(favCount)}</span>
                  </button>
                </Tooltip>
                <Tooltip text="اشتراک‌گذاری">
                  <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer p-2 text-gray-400 hover:text-white">
                    <Icon name="shareNetwork" className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            </div>

          </div>

          {data?.lead && (
            <div className="relative p-6 md:p-8 rounded-3xl border border-white/10 bg-white/5 mb-10 shadow-inner overflow-hidden">
              <p className="text-white text-base md:text-lg leading-loose font-bold text-justify relative z-10">
                {data.lead}
              </p>
            </div>
          )}

          <div className={`rich-text theme-${type.toLowerCase()} relative z-10 mb-12`}>
            <div dangerouslySetInnerHTML={{ __html: data?.body || '' }} />
          </div>

          {combinedTaxonomies.length > 0 && (
            <div className="pt-6 border-t border-white/10 mb-12">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> دسته‌بندی‌ها و برچسب‌ها:
              </h3>
              <div className="flex flex-wrap gap-2 relative z-10">
                {combinedTaxonomies.map((tax, idx) => (
                  <a key={idx} href={tax.link} className={`px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 ${currentTheme.hoverText} ${currentTheme.hoverBorder}/50 transition-all flex items-center gap-1.5 shadow-inner`}>
                    {tax.isTag && <Icon name="hash" className="w-3.5 h-3.5 opacity-60 shrink-0" />}
                    {tax.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          
        </article>

        <div className="max-w-4xl mx-auto space-y-12">
          
          {relatedContent && relatedContent.length > 0 && (
            <div className="relative p-6 md:p-8 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4 relative z-10">
                <Icon name="files" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> مقالات مرتبط
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {relatedContent.map(rel => (
                  <a key={rel.id} href={rel.link || '#'} className="group/rel flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#080c16] border border-white/10 hover:border-white/20 transition-all shadow-inner">
                    <div className="w-full sm:w-24 h-40 sm:h-20 rounded-xl bg-gray-900 overflow-hidden shrink-0">
                      <BlurImage src={rel.image || '/images/placeholder-cover.jpg'} className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-500" alt={rel.title || "Related"} />
                    </div>
                    <div className="flex-col overflow-hidden">
                      <h4 className={`text-sm font-bold text-white mb-2 line-clamp-2 ${currentTheme.hoverText} transition-colors leading-relaxed`}>{rel.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-sans">
                        <span className="flex items-center gap-1 cursor-default"><Icon name="calendarBlank" className="w-3 h-3" /> {toPersianDigits(rel.date)}</span>
                        <span className="flex items-center gap-1 cursor-default"><Icon name="eye" className="w-3 h-3" /> {toPersianDigits(rel.views)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {isCommentsEnabled && (
            <section id="comments" className="relative p-6 md:p-8 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
                <Icon name="chat" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> نظرات کاربران 
                <span className="text-xs font-sans text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {toPersianDigits(commentsList.length)} نظر
                </span>
              </h3>

              <div className="relative mb-8 z-10">
                <form onSubmit={handleCommentSubmit}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      {currentUser ? (
                        <span className="text-xs font-bold text-white">شما با حساب کاربری وارد شده‌اید</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400">ابتدا وارد سایت شوید</span>
                      )}
                      <span className="text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded">پس از تأیید نمایش داده می‌شود</span>
                    </div>
                    <textarea 
                      rows="3" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onFocus={handleCommentFocus}
                      placeholder={currentUser ? "نظر خود را درباره این مقاله بنویسید..." : "برای ثبت دیدگاه کلیک کنید..."} 
                      className={`w-full bg-[#080c16] border border-white/10 rounded-2xl p-4 text-white text-sm leading-relaxed ${currentTheme.focusBorder} outline-none transition-all resize-none shadow-inner`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={!commentText.trim() || !currentUser} 
                      className={`bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold ${currentTheme.hoverBg} hover:text-deep-base ${currentTheme.hoverBorder} transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                    >
                      ارسال دیدگاه
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4 relative z-10">
                {commentsList.map((comment, idx) => (
                  <div key={idx} className="bg-[#080c16] border border-white/10 rounded-2xl p-5 shadow-inner">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Icon name="user" className={`w-5 h-5 ${currentTheme.primaryText}`} />
                        </div>                    
                        <div>
                          <h4 className="text-sm font-bold text-white">{comment.user}</h4>
                          <span className="text-[10px] text-gray-500 font-sans">{toPersianDigits(comment.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-light text-justify">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

      </main>

      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsShareModalOpen(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }} className="relative z-10 w-full max-w-sm p-6 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className={`text-base font-bold text-white flex items-center gap-2`}><Icon name="shareNetwork" className={`w-5 h-5 ${currentTheme.primaryText}`} /> اشتراک‌گذاری</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 rounded-full p-1.5">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-center text-sm text-gray-300 mb-5 relative z-10">این مقاله را در شبکه‌های اجتماعی به اشتراک بگذارید:</p>

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
                <label className="text-xs text-gray-400">لینک مستقیم صفحه:</label>
                <div className="flex items-center gap-2 bg-[#080c16] border border-white/10 rounded-xl p-1.5 shadow-inner">
                  <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : 'https://madar.ir'} className="bg-transparent text-gray-400 text-[11px] w-full outline-none px-2 dir-ltr text-left font-sans" />
                  <button onClick={handleCopyLink} className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-lg ${isCopied ? `${currentTheme.primaryBg} text-white` : 'bg-white/10 text-white hover:bg-white/20'}`}>
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