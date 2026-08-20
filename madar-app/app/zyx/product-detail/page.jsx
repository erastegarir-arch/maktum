'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import Icon from '../../components/Icon'; 
import ProgressBar from '../../components/ProgressBar';
import BlurImage from '../../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر
import { motion, AnimatePresence } from 'framer-motion';

// === ۱. سیستم نگاشت تم پویا (Dynamic Theme Mapping) ===
const themes = {
  raw: {
    primaryText: "text-[#fbbf24]",
    primaryBg: "bg-[#fbbf24]",
    borderTop: "border-t-[#fbbf24]",
    borderClass: "border-[#fbbf24]/30",
    badgeBg: "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30",
    glowBg: "rgba(251,191,36,0.15)",
    hoverText: "hover:text-[#fbbf24]",
    hoverBg: "hover:bg-[#fbbf24]",
    hoverBorder: "hover:border-[#fbbf24]",
    focusBorder: "focus:border-[#fbbf24]",
    fillCurrent: "fill-current text-[#fbbf24]",
    gradientVia: "via-[#fbbf24]"
  },
  produced: {
    primaryText: "text-[#f43f5e]",
    primaryBg: "bg-[#f43f5e]",
    borderTop: "border-t-[#f43f5e]",
    borderClass: "border-[#f43f5e]/30",
    badgeBg: "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30",
    glowBg: "rgba(244,63,94,0.15)",
    hoverText: "hover:text-[#f43f5e]",
    hoverBg: "hover:bg-[#f43f5e]",
    hoverBorder: "hover:border-[#f43f5e]",
    focusBorder: "focus:border-[#f43f5e]",
    fillCurrent: "fill-current text-[#f43f5e]",
    gradientVia: "via-[#f43f5e]"
  },
  tools: {
    primaryText: "text-[#10b981]",
    primaryBg: "bg-[#10b981]",
    borderTop: "border-t-[#10b981]",
    borderClass: "border-[#10b981]/30",
    badgeBg: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
    glowBg: "rgba(16,185,129,0.15)",
    hoverText: "hover:text-[#10b981]",
    hoverBg: "hover:bg-[#10b981]",
    hoverBorder: "hover:border-[#10b981]",
    focusBorder: "focus:border-[#10b981]",
    fillCurrent: "fill-current text-[#10b981]",
    gradientVia: "via-[#10b981]"
  }
};

// لیست شبکه‌های اجتماعی برای اشتراک‌گذاری (از راست به چپ)
const sharePlatforms = [
  {
    name: 'ایتا',
    icon: 'eitaa',
    hoverColorClass: 'hover:text-[#f97316]',
    getUrl: (url, title) => `https://eitaa.com/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'بله',
    icon: 'bale',
    hoverColorClass: 'hover:text-[#10b981]',
    getUrl: (url, title) => `https://ble.ir/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'تلگرام',
    icon: 'telegram',
    hoverColorClass: 'hover:text-[#0088cc]',
    getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  }
];

// === ۲. هسته محتوایی صفحه (تغذیه داینامیک) ===
const productData = {
  type: "produced", 
  category: "محتوای تولیدی",
  title: "معماری پنهان واشنگتن",
  shortDesc: "مستند تحلیلی بررسی هم‌ترازی بناهای پایتخت آمریکا با صورت‌های فلکی باستانی و ردپای لژهای ماسونی در طراحی شهری.",
  author: "مرکز پژوهش‌های مدار",
  meta: {
    date: "۲۴ بهمن ۱۴۰۲",
    readTime: "۵۲ دقیقه",
    views: "۱۲.۴k بازدید",
    ageRating: "+۱۲" // رده‌بندی سنی قابل تنظیم
  },
  formats: [
    { type: "ویدیویی", icon: "film", color: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10" },
    { type: "تصویری", icon: "photo", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
    { type: "صوتی", icon: "music", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10" },
    { type: "متنی", icon: "text", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
    { type: "پروژه", icon: "project", color: "text-[#a855f7]", bg: "bg-[#a855f7]/10" },
    { type: "سایر محتوا", icon: "cube", color: "text-[#ec4899]", bg: "bg-[#ec4899]/10" }
  ],
  mainImage: "/images/product-main.jpg",
  description: [
    "در این مستند ۵۰ دقیقه‌ای که حاصل ماه‌ها پژوهش در اسناد بایگانی ملی آمریکا و تطبیق آن‌ها با نقشه‌های شهری است، به بررسی این فرضیه می‌پردازیم که چگونه بنیان‌گذاران یک کشور، باورهای باطنی و وابستگی‌های خود به انجمن‌های مخفی را در کالبد معماری شهر تثبیت کردند.",
    "از ابلیسک عظیم واشنگتن که یادآور معماری مصر باستان است، تا زاویه خیابان‌هایی که ستاره پنج‌پر و پرگار ماسونی را تشکیل می‌دهند. این مجموعه حاوی تصاویری بی‌نظیر از اسناد اولیه طراحی شهر توسط پی‌یر شارلز لَنفان است."
  ],
  featuresList: [
    "تحلیل محور تاریخی پاریس از لوور تا طاق نصرت",
    "بررسی قرارگیری کاخ کنگره آمریکا و بنای یادبود واشنگتن",
    "نقش انجمن‌های مخفی در مهندسی شهری"
  ],
  tags: ["مستند تاریخی", "معماری پنهان", "#نمادشناسی", "#فراماسونری"],
  fileSpecs: [
    { label: "حجم کل", value: "۲.۴ گیگابایت", icon: "hardDrives" },
    { label: "تعداد فایل", value: "۳ عدد", icon: "files" },
    { label: "فرمت", value: "MP4, PDF", icon: "fileText" },
    { label: "مدت زمان", value: "۵۲:۱۴", icon: "clock" },
    { label: "کیفیت", value: "1080p (FHD)", icon: "monitorPlay" }
  ],
  timeline: [
    { version: "v1.2", date: "۲۵ بهمن ۱۴۰۲", title: "اضافه شدن کیفیت 4K و اصلاح زیرنویس", isLatest: true },
    { version: "v1.0", date: "۱۰ دی ۱۴۰۲", title: "انتشار نسخه اولیه مستند (قسمت اول)", isLatest: false },
    { version: "v0.9", date: "۱۵ آذر ۱۴۰۲", title: "ثبت طرح و پژوهش اولیه مستند در سامانه", isLatest: false }
  ],
  downloads: [
    { title: "مستند کامل - 1080p", meta: "حجم: ۱.۸ GB | فرمت: MP4", icon: "Video" },
    { title: "مستند کامل - 720p", meta: "حجم: ۸۵۰ MB | فرمت: MP4", icon: "Video" },
    { title: "جزوه منابع و ارجاعات", meta: "حجم: ۱۲ MB | فرمت: PDF", icon: "Video" }
  ],
  isUserLoggedIn: false,
  relatedContent: [
    { id: 1, title: "رازهای ابلیسک‌های پاریس", image: "/images/related-1.jpg", date: "۱۴۰۲/۱۱/۲۰", views: "۴.۱k بازدید" },
    { id: 2, title: "نقشه‌های اصلی معماری پایتخت‌های غربی", image: "/images/related-2.jpg", date: "۱۴۰۲/۱۱/۱۵", views: "۶.۸k بازدید" },
    { id: 3, title: "تحلیل لایه‌های قدرت در واشنگتن دی‌سی", image: "/images/related-3.jpg", date: "۱۴۰۲/۱۱/۱۰", views: "۵.۲k بازدید" }
  ],
  comments: [
    { id: 1, user: "علی رضایی", date: "۲۵ بهمن ۱۴۰۲ - ۱۶:۳۰", text: "مستند بسیار عالی و دقیقی بود. اطلاعاتی که درباره نحوه قرارگیری خیابان‌ها داده شد واقعاً جای تفکر دارد. منتظر قسمت‌های بعدی هستیم." },
    { id: 2, user: "محمدرضا", date: "۲۶ بهمن ۱۴۰۲ - ۱۰:۱۵", text: "کیفیت صدا در فایل دانلود شده کمی پایین بود، لطفاً در نسخه‌های بعدی اصلاح بفرمایید." }
  ]
};

export default function ProductDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeGallery, setActiveGallery] = useState('video');
  const [commentText, setCommentText] = useState('');
  
  // استیت‌های مودال اشتراک‌گذاری
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // استخراج تم فعال بر اساس دیتای محصول
  const currentTheme = themes[productData.type] || themes.produced;
  
  // تعیین مسیرنما (Breadcrumb) پویا
  let parentLabel = "دسته‌بندی‌ها"; 
  let parentLink = "#";
  if (productData.type === "produced") { parentLabel = "محتوای تولیدی"; parentLink = "/produced"; }
  else if (productData.type === "raw") { parentLabel = "محتوای خام"; parentLink = "/raw-materials"; }
  else if (productData.type === "tools") { parentLabel = "ابزارها"; parentLink = "/tools"; }

  const handleCopyLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://madar.ir';
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      {/* پس‌زمینه نئونی داینامیک */}
      <div className="fixed inset-0 z-[-1] bg-deep-base overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-15 animate-[drift_30s_infinite_linear_alternate]" style={{ backgroundImage: `radial-gradient(circle, ${currentTheme.glowBg} 0%, transparent 70%)` }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-10 bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] animate-[drift_40s_infinite_linear_alternate-reverse]" />
      </div>

      {/* ۱. اضافه کردن نوار پیشرفت اینجا */}
      <ProgressBar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: parentLabel, href: parentLink },
            { label: productData.title } 
          ]} 
        />

        {/* بخش بالایی: ویژوال و اطلاعات پایه */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          <div className="lg:col-span-7 flex flex-col gap-4 relative animate-[fadeIn_0.5s_ease-out]">
            {/* تصویر اصلی مبتنی بر گرافیک کلی1 */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-1 group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
              
              <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black/50">
                <BlurImage src={productData.mainImage} alt="تصویر اصلی" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:pl-6 animate-[fadeIn_0.6s_ease-out]">
            <div className="flex flex-wrap items-center gap-2">
              {/* بج دسته‌بندی پویا */}
              <span className={`border text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase ${currentTheme.badgeBg}`}>
                {productData.category}
              </span>
              
              {/* باکس فرمت‌ها (اصلاح‌شده برای Wrap هوشمند و اضافه شدن المان‌های جدید) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5 ml-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl text-xs text-gray-300">
                {productData.formats.map((fmt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 shrink-0">
                    {idx > 0 && <span className="w-1 h-1 rounded-full bg-gray-600"></span>}
                    <Icon name={fmt.icon} className={`w-3.5 h-3.5 ${fmt.color}`} /> {fmt.type}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                {productData.title}
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light text-justify">
                {productData.shortDesc}
              </p>
            </div>

            <div className="flex items-start justify-between pt-4 border-t border-white/10 w-full">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0 relative bg-gray-900 flex items-center justify-center">
                  <BlurImage src="/images/author-avatar.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="Author" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">تهیه‌کننده</p>
                  <a href="#" className={`text-sm font-bold text-white ${currentTheme.hoverText} transition-colors flex items-center gap-1`}>
                    {productData.author}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-1">
                <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer text-gray-400 hover:text-white" title="اشتراک‌گذاری">
                  <Icon name="shareNetwork" className="w-5 h-5" />
                </button>
                <button onClick={() => setIsFavorite(!isFavorite)} className={`transition-colors cursor-pointer ${isFavorite ? 'text-rose-500' : 'text-gray-400 hover:text-white'}`} title="پسندیدن">
                  <Icon name="heart" className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* بخش میانی: محتوای اصلی و سایدبار */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* باکس متادیتا (تاریخ، زمان مطالعه، بازدید، رده‌بندی سنی) مبتنی بر GKS1 */}
            <div className="relative flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 font-sans shadow-inner mb-6 overflow-hidden group/meta">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-0 group-hover/meta:opacity-90 transition-opacity pointer-events-none z-20`} />
              
              <span className="flex items-center gap-2"><Icon name="calendarBlank" className="w-4 h-4" /> {productData.meta.date}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="flex items-center gap-2"><Icon name="clock" className="w-4 h-4" /> {productData.meta.readTime}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="flex items-center gap-2"><Icon name="eye" className="w-4 h-4" /> {productData.meta.views}</span>
              {productData.meta.ageRating && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span className="flex items-center gap-1.5" title="رده‌بندی سنی محتوا">
                    <Icon name="shieldCheck" className={`w-4 h-4 ${currentTheme.primaryText}`} />
                    <span className="text-gray-400 text-xs">رده‌بندی سنی:</span>
                    <span className="dir-ltr text-white font-bold">{productData.meta.ageRating}</span>
                  </span>
                </>
              )}
            </div>

            {/* بخش معرفی (GKS1) */}
            <div className="relative p-6 md:p-8 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Icon name="info" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> معرفی
              </h2>
              <div className="rich-text text-gray-300 text-sm leading-loose space-y-4 relative z-10">
                {productData.description.map((p, idx) => (
                  <p key={idx} className="text-justify font-light">{p}</p>
                ))}
                {productData.featuresList.length > 0 && (
                  <ul className={`list-disc pr-5 space-y-2 mt-4 text-sm leading-loose font-light marker:${currentTheme.primaryText.split('-')[1]}`}>
                    {productData.featuresList.map((li, idx) => (
                      <li key={idx}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* بخش پیش‌نمایش (GKS1) */}
            <div className="relative p-6 md:p-8 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Icon name="playCircle" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> پیش‌نمایش محتوا
              </h2>
              
              <div className="relative z-10 w-full aspect-video rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-black/50 group/vid mb-4">
                <BlurImage src={`/images/preview-${activeGallery}.jpg`} className="w-full h-full object-cover opacity-50" alt="Preview" />
                <button className={`absolute w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white ${currentTheme.hoverBg} hover:text-deep-base transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] z-10 cursor-pointer`}>
                  <Icon name="play" className="w-8 h-8 ml-1 fill-current" />
                </button>
              </div>
              
              <p className="text-sm text-gray-400 text-center mb-6 px-4 font-light relative z-10">متن دلخواه خود را برای توضیحات پیش‌نمایش اینجا بنویسید</p>

              <div className="flex gap-3 overflow-x-auto hide-scroll pb-2 relative z-10">
                <button onClick={() => setActiveGallery('video')} className={`w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer ${activeGallery === 'video' ? currentTheme.borderClass.replace('/30', '') : 'border-transparent opacity-60 hover:opacity-80'} relative transition-all`}>
                  <BlurImage src="/images/preview-video.jpg" className="w-full h-full object-cover opacity-60" alt="Video" />
                  <div className="absolute inset-0 flex items-center justify-center z-10"><Icon name="film" className="w-5 h-5 text-white fill-current" /></div>
                </button>
                <button onClick={() => setActiveGallery('image')} className={`w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer ${activeGallery === 'image' ? currentTheme.borderClass.replace('/30', '') : 'border-transparent opacity-60 hover:opacity-80'} relative transition-all`}>
                  <BlurImage src="/images/preview-image.jpg" className="w-full h-full object-cover opacity-60" alt="Image" />
                  <div className="absolute inset-0 flex items-center justify-center z-10"><Icon name="photo" className="w-5 h-5 text-white" /></div>
                </button>
                <button onClick={() => setActiveGallery('audio')} className={`w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer ${activeGallery === 'audio' ? currentTheme.borderClass.replace('/30', '') : 'border-transparent opacity-60 hover:opacity-80'} relative transition-all`}>
                  <BlurImage src="/images/preview-audio.jpg" className="w-full h-full object-cover opacity-60" alt="Audio" />
                  <div className="absolute inset-0 flex items-center justify-center z-10"><Icon name="music" className="w-5 h-5 text-white" /></div>
                </button>
              </div>
            </div>

            <div className="pt-2 mt-2">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="hash" className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-bold text-gray-300">دسته‌بندی‌ها و برچسب‌ها:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {productData.tags.map(tag => (
                  <a key={tag} href={`/tag/${tag.replace('#', '')}`} className={`px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 ${currentTheme.hoverText} ${currentTheme.hoverBorder}/50 transition-all`}>
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            
            {/* اطلاعات فایل‌ها (GKS1) */}
            <div className="relative p-6 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-center border-b border-white/5 pb-4 relative z-10">اطلاعات فایل‌ها</h3>
              <ul className="space-y-4 relative z-10">
                {productData.fileSpecs.map((spec, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Icon name={spec.icon} className="w-5 h-5" /> {spec.label}
                    </div>
                    <span className="text-white text-sm font-sans">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* تاریخچه (GKS1) */}
            <div className="relative p-6 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Icon name="update" className={`w-5 h-5 ${currentTheme.fillCurrent}`} /> آخرین به‌روزرسانی‌ها
              </h3>
              <div className="relative z-10 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-white/10 z-0"></div>
                <div className="space-y-6 relative z-10">
                  {productData.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-4 pr-8">
                      <div className={`absolute right-0 top-1 w-6 h-6 rounded-full bg-deep-base border-2 ${item.isLatest ? `${currentTheme.borderClass.replace('/30', '')} shadow-[0_0_10px_${currentTheme.glowBg.replace('0.15', '0.5')}]` : 'border-white/20'} flex items-center justify-center z-10`}>
                        {item.isLatest && <div className={`w-2 h-2 ${currentTheme.primaryBg} rounded-full`}></div>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className={`${item.isLatest ? `${currentTheme.primaryText} ${currentTheme.borderClass}` : 'bg-white/5 text-gray-400 border-white/10'} text-[10px] font-sans px-2 py-0.5 rounded border w-fit`}>
                          {item.version}
                        </span>
                        <h4 className={`text-sm font-bold leading-relaxed ${item.isLatest ? 'text-white' : 'text-gray-400'}`}>{item.title}</h4>
                        <span className="text-xs text-gray-500 font-sans">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* دانلود فایل‌ها (GKS1) */}
            <div className="relative p-6 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
              
              <div className={`absolute -right-10 -top-10 w-32 h-32 ${currentTheme.primaryBg} opacity-10 rounded-full blur-3xl pointer-events-none`}></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Icon name="download" className={`w-6 h-6 ${currentTheme.fillCurrent}`} /> دانلود فایل‌ها
              </h3>

              {!productData.isUserLoggedIn && (
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-3xl animate-[fadeIn_0.3s]">
                  <Icon name="lockKey" className="w-10 h-10 text-gray-500 mb-4 drop-shadow-md fill-current" />
                  <h4 className="text-white font-bold mb-2">دسترسی محدود</h4>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light text-justify">برای دانلود و مشاهده لینک‌های این محتوا باید وارد حساب کاربری خود شوید.</p>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold transition-colors border border-white/20 cursor-pointer">
                    ورود / عضویت
                  </button>
                </div>
              )}

              <div className="space-y-3 relative z-10 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {productData.downloads.map((dl, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 ${currentTheme.hoverBorder}/50 transition-colors group/item cursor-pointer`}>
                    <div className="flex items-center gap-3">
                      <Icon name={dl.icon} className={`w-6 h-6 text-gray-400 group-hover/item:${currentTheme.primaryText.split('-')[1]} transition-colors fill-current`} />
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{dl.title}</h4>
                        <p className="text-[10px] text-gray-400 font-sans">{dl.meta}</p>
                      </div>
                    </div>
                    <button className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 ${currentTheme.hoverBg} hover:text-deep-base transition-colors cursor-pointer`}>
                      <Icon name="download" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* محتوای مرتبط (GKS1) */}
        <section className="mt-8 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">محتوای مرتبط</h2>
              <p className="text-sm text-gray-400 font-light">محتوای مشابه که ممکن است برایتان جالب باشد</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productData.relatedContent.map(rel => (
              <a key={rel.id} href="#" className="relative group flex flex-col p-3 rounded-2xl border border-white/10 overflow-hidden transition-all duration-400 hover:-translate-y-1.5 shadow-lg">
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none z-20`} />
                
                <div className="relative w-full h-40 rounded-xl bg-gray-900 overflow-hidden mb-3 flex items-center justify-center z-10">
                  <BlurImage src={rel.image} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="Related" />
                </div>
                <div className="flex-grow z-10">
                  <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed ${currentTheme.hoverText} transition-colors line-clamp-2`}>{rel.title}</h3>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans z-10">
                  <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> {rel.date}</span>
                  <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> {rel.views}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* بخش نظرات (GKS1) */}
        <section id="comments" className="mt-8 pt-4 border-t border-white/10 relative z-10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="chat" className={`w-7 h-7 ${currentTheme.fillCurrent}`} /> نظرات کاربران 
            <span className="text-sm font-sans text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {productData.comments.length} نظر
            </span>
          </h3>

          <div className="relative p-6 rounded-3xl border border-white/10 mb-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <form className="relative z-10">
              <div className="flex gap-4 mb-4">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">شما به عنوان «کاربر مدار» وارد شده‌اید</span>
                    <span className="text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded">پس از تأیید نمایش داده می‌شود</span>
                  </div>
                  <textarea 
                    rows="3" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="نظر خود را درباره این محتوا بنویسید..." 
                    className={`w-full bg-[#080c16] border border-white/10 rounded-2xl p-4 text-white text-sm ${currentTheme.focusBorder} outline-none transition-all resize-none shadow-inner`}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  disabled={!commentText.trim()}
                  className={`bg-white/10 text-white border border-white/20 px-8 py-2.5 rounded-xl text-sm font-bold ${currentTheme.hoverBg} hover:text-deep-base ${currentTheme.hoverBorder} transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                >
                  ارسال دیدگاه
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {productData.comments.map((comment, idx) => (
              <div key={idx} className="relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon name="user" className={`w-6 h-6 ${currentTheme.primaryText}`} />
                    </div>                    
                    <div>
                      <h4 className="text-sm font-bold text-white">{comment.user}</h4>
                      <span className="text-[10px] text-gray-500 font-sans">{comment.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-1 font-light text-justify relative z-10">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* مودال اشتراک گذاری با ساختار شیشه‌ای GKS1 */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsShareModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-sm p-6 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className={`text-base font-bold text-white flex items-center gap-2`}>
                  <Icon name="shareNetwork" className={`w-5 h-5 ${currentTheme.primaryText}`} /> اشتراک‌گذاری
                </h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 rounded-full p-1.5">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
              
              {/* دکمه‌های شبکه‌های اجتماعی: بدون پس‌زمینه دایره‌ای، همراه با افکت بزرگ‌نمایی و تغییر رنگ اختصاصی */}
              <div className="flex gap-6 justify-center items-center mb-8 relative z-10">
                {sharePlatforms.map((platform) => (
                  <div key={platform.name} className="relative group/social flex items-center justify-center">
                    <a 
                      href={platform.getUrl(typeof window !== 'undefined' ? window.location.href : 'https://madar.ir', productData.title)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 text-gray-400 flex items-center justify-center transition-all duration-300 transform hover:scale-125 ${platform.hoverColorClass} cursor-pointer`}
                    >
                      <Icon name={platform.icon} className="w-7 h-7 transition-colors" />
                    </a>

                    {/* تول‌تیپ اسم شبکه اجتماعی */}
                    <div className="absolute bottom-full mb-2 hidden group-hover/social:flex flex-col items-center z-50 pointer-events-none animate-[fadeIn_0.2s_ease-out]">
                      <div className="bg-[#0b0f19] text-white text-[11px] font-sans py-1 px-2.5 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap">
                        {platform.name}
                      </div>
                      <div className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-[#0b0f19]"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-xs text-gray-400">لینک مستقیم صفحه:</label>
                <div className="flex items-center gap-2 bg-[#080c16] border border-white/10 rounded-xl p-1.5 shadow-inner">
                  <input 
                    type="text" 
                    readOnly 
                    value={typeof window !== 'undefined' ? window.location.href : 'https://madar.ir'} 
                    className="bg-transparent text-gray-400 text-[11px] w-full outline-none px-2 dir-ltr text-left font-sans" 
                  />
                  <button 
                    onClick={handleCopyLink} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-lg ${isCopied ? `${currentTheme.primaryBg} text-white` : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isCopied ? 'کپی شد' : 'کپی لینک'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}