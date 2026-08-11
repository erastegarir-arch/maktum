'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // وارد کردن کامپوننت مرکزی آیکون‌ها
import ProgressBar from '../components/ProgressBar';
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. هسته محتوایی مقاله (دیتای داینامیک) ===
const articleData = {
  category: "گزارش ویژه",
  title: "پشت پرده تأمین مالی شبکه‌های رسانه‌ای جدید؛ چه کسی جریان‌ها را مدیریت می‌کند؟",
  subtitle: "تحلیلی بر ساختار قدرت رسانه‌ای در قرن بیست و یکم و ردیابی منابع مالی ناشناس که به نهادهای مخفی ختم می‌شوند.",
  coverImage: "/images/article-cover.jpg",
  author: {
    name: "دکتر محمدصادق احمدی",
    role: "نویسنده / پژوهشگر",
    avatar: "/images/author-avatar.jpg"
  },
  meta: {
    date: "۲۴ بهمن ۱۴۰۲",
    readTime: "۱۲ دقیقه مطالعه",
    views: "۳.۲k بازدید"
  },
  // محتوای مقاله به صورت بلاک‌بندی شده برای رندر داینامیک
  contentBlocks: [
    {
      type: "lead", // پاراگراف لید (مقدمه برجسته)
      text: "در سال‌های اخیر، ظهور رسانه‌های به اصطلاح مستقل با بودجه‌های کلان و مبهم، این سوال را ایجاد کرده است که آیا مفهوم استقلال رسانه‌ای در عصر حاضر یک سراب است؟ بررسی‌های ما نشان می‌دهد که بسیاری از این جریان‌ها به هاب‌های مالی مشخصی متصل هستند."
    },
    {
      type: "paragraph",
      text: "هنگامی که به ساختار شبکه‌های خبری جدید و پلتفرم‌های تحلیلی نوظهور نگاه می‌کنیم، در ظاهر با مجموعه‌ای از روزنامه‌نگاران آزاد و پژوهشگران مستقل روبرو می‌شویم. اما با رهگیری تراکنش‌های مالی و حمایت‌های سازمانی از طریق سازمان‌های غیردولتی (NGOها)، به شبکه‌ای در هم تنیده می‌رسیم که ریشه در بنیادهای فکری خاصی دارد."
    },
    {
      type: "paragraph",
      text: "اسنادی که اخیراً در بایگانی «مدار» پردازش و تحلیل شده‌اند، نشان می‌دهند که الگوی تأمین مالی این رسانه‌ها از یک رویه هماهنگ پیروی می‌کند."
    },
    {
      type: "heading",
      text: "ساختار لایه‌ای نهادهای تأمین‌کننده"
    },
    {
      type: "paragraph",
      text: "برای مخفی ماندن منبع اصلی پول، معمولاً از سه تا چهار لایه شرکتی و بنیادهای خیریه استفاده می‌شود. این روش، که در ادبیات مالی به آن «لایه‌بندی» می‌گویند، ردیابی را برای سازمان‌های نظارتی دشوار می‌سازد."
    },
    {
      type: "list",
      items: [
        "لایه اول: بنیادهای کلان و اتاق‌فکرهای سیاست‌گذار (غالباً در لندن و واشنگتن).",
        "لایه دوم: صندوق‌های توسعه رسانه‌ای و سازمان‌های حامی دموکراسی در ظاهر.",
        "لایه سوم: شرکت‌های واسطه و هاب‌های منطقه‌ای (معمولاً مستقر در اروپای شرقی یا خاورمیانه).",
        "لایه چهارم: شبکه‌ها و رسانه‌های به اصطلاح مستقل و افراد تأثیرگذار."
      ]
    },
    {
      type: "video", // ویدیوی ضمیمه شده بین متن
      title: "ویدیوی ضمیمه: بررسی لایه‌های پنهان",
      thumbnail: "/images/video-thumbnail.jpg",
      duration: "03:45 / 18:30"
    },
    {
      type: "heading",
      text: "نتیجه‌گیری و افق پیش رو"
    },
    {
      type: "paragraph",
      text: "در نهایت، باید پذیرفت که جریان آزاد اطلاعات، شعاری است که در سایه مهندسی مالی و شبکه‌سازی‌های پیچیده، معنای خود را از دست داده است. برای درک صحیح وقایع، پژوهشگران باید به جای تمرکز صرف بر محتوا، به تحلیل ساختارهای تأمین مالی بپردازند."
    },
    {
      type: "blockquote",
      text: "آنان که جریان پول را کنترل می‌کنند، روایت‌ها را می‌نویسند. در دنیای امروز، کشف حقیقت از مسیر بررسی تراکنش‌های بانکی و اسناد ثبت شرکت‌ها می‌گذرد، نه صرفاً از خواندن اخبار.",
      source: "کتاب معماری پنهان"
    }
  ],
  tags: ["رسانه و قدرت", "جنگ شناختی", "#تأمین_مالی_پنهان", "#گزارش_تحلیلی", "#اسناد_مالی"],
  comments: [
    { id: 1, user: "علی رضایی", date: "۲۵ بهمن ۱۴۰۲ - ۱۶:۳۰", text: "گزارش بسیار دقیقی بود. به خصوص بخش مربوط به لایه‌بندی نهادهای مالی که نشان می‌دهد چگونه بودجه‌های دولتی در پوشش NGOها به رسانه‌ها تزریق می‌شود.", avatarColor: "fbbf24", isAuthor: false },
    { id: 2, user: "محمدرضا", date: "۲۶ بهمن ۱۴۰۲ - ۱۰:۱۵", text: "کیفیت صدا در فایل دانلود شده کمی پایین بود، لطفاً در نسخه‌های بعدی اصلاح بفرمایید.", avatarColor: "22d3ee" }
  ],
  relatedNews: [
    { 
      id: 1, 
      title: "کیمیاگران دربار و راز سنگ جادو", 
      badge: "مقاله ویژه", 
      date: "۱۴۰۲/۱۱/۰۱", 
      views: "۵.۴k بازدید", 
      image: "/images/related-1.jpg", 
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBorder: "border-[#b45309]/40",
        hoverText: "group-hover:text-[#b45309]"
      }
    },
    { 
      id: 2, 
      title: "فراماسونری و انقلاب‌های قرن هجدهم", 
      badge: "یادداشت", 
      date: "۱۴۰۲/۱۰/۲۸", 
      views: "۳.۸k بازدید", 
      image: "/images/related-2.jpg", 
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBorder: "border-[#b45309]/40",
        hoverText: "group-hover:text-[#b45309]"
      }
    },
    { 
      id: 3, 
      title: "افشای اسناد جدید از نشست‌های محرمانه سال ۲۰۱۰", 
      badge: "گزارش خبری", 
      date: "۱۴۰۲/۱۰/۱۵", 
      views: "۷.۱k بازدید", 
      image: "/images/related-3.jpg", 
      theme: {
        borderTop: "border-t-[#b45309]",
        badgeBorder: "border-[#b45309]/40",
        hoverText: "group-hover:text-[#b45309]"
      }
    }
  ]
};

// === ۲. کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// === ۳. کامپوننت اسکلتون کل صفحه جزئیات مقاله (زمان لودینگ اولیه) ===
const BlogDetailSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <article className="max-w-4xl mx-auto w-full space-y-8">
          
          {/* اسکلتون مسیرنما */}
          <div className="w-48 h-6 bg-white/5 rounded-lg"></div>

          {/* اسکلتون تصویر شاخص */}
          <BaseSkeleton className="w-full aspect-video" rounded="rounded-3xl" />

          {/* اسکلتون هدر مقاله */}
          <header className="space-y-4 text-center md:text-right">
            <BaseSkeleton className="w-full h-12" rounded="rounded-xl" />
            <BaseSkeleton className="w-3/4 h-8" rounded="rounded-lg" />
            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/10 gap-4">
              <div className="flex items-center gap-3">
                <BaseSkeleton className="w-12 h-12" rounded="rounded-full" />
                <div className="space-y-2">
                  <BaseSkeleton className="w-24 h-3" rounded="rounded" />
                  <BaseSkeleton className="w-32 h-4" rounded="rounded" />
                </div>
              </div>
              <BaseSkeleton className="w-64 h-10" rounded="rounded-2xl" />
            </div>
          </header>

          {/* اسکلتون پاراگراف‌های محتوا */}
          <div className="space-y-6 pt-6">
            <BaseSkeleton className="w-full h-32" rounded="rounded-3xl" />
            <BaseSkeleton className="w-full h-6" rounded="rounded-md" />
            <BaseSkeleton className="w-5/6 h-6" rounded="rounded-md" />
            <BaseSkeleton className="w-full h-6" rounded="rounded-md" />
            <BaseSkeleton className="w-2/3 h-8 mt-8" rounded="rounded-lg" />
            <BaseSkeleton className="w-full h-24" rounded="rounded-md" />
          </div>

        </article>
      </main>
    </div>
  );
};

// === ۴. کامپوننت رندرگر محتوای متنی مقاله ===
const ArticleRenderer = ({ blocks }) => {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'lead':
            return (
              <div key={index} className="glass-card p-6 md:p-8 rounded-3xl mb-10 border-r-4 border-r-[#b45309] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b45309]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-0 relative z-10 text-justify">
                  {block.text}
                </p>
              </div>
            );
          case 'paragraph':
            return <p key={index} className="text-[1.05rem] text-slate-300 leading-[2.2] text-justify font-light">{block.text}</p>;
          case 'heading':
            return (
              <h2 key={index} className="text-[1.75rem] font-black text-white mt-12 mb-5 flex items-center gap-3">
                <span className="block w-1.5 h-6 bg-[#b45309] rounded shadow-[0_0_10px_rgba(180,83,9,0.5)]"></span>
                {block.text}
              </h2>
            );
          case 'list':
            return (
              <ul key={index} className="list-disc pr-6 mb-6 text-slate-300 leading-[2] font-light marker:text-[#b45309]">
                {block.items.map((item, i) => (
                  <li key={i} className="mb-2">{item}</li>
                ))}
              </ul>
            );
          case 'video':
            return (
              <div key={index} className="my-12">
                <h3 className="text-sm text-gray-500 font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Icon name="videoCamera" className="w-4 h-4 text-[#b45309]" /> {block.title}
                </h3>
                <div className="relative w-full aspect-video glass-card rounded-3xl overflow-hidden p-1 group border-t border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-pointer">
                  <div className="absolute inset-0 bg-gray-900 rounded-[22px] overflow-hidden">
                    <BlurImage src={block.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="کاور ویدیو" />
                  </div>
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#b45309] hover:border-[#b45309] hover:text-white transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(180,83,9,0.5)] z-10">
                    <Icon name="play" className="w-8 h-8 ml-1 fill-current" />
                  </button>
                  {/* نوار کنترل پلیر (نمایشی) */}
                  <div className="absolute bottom-2 left-2 right-2 h-12 bg-black/80 backdrop-blur rounded-xl border border-white/10 flex items-center px-4 gap-4 z-10">
                    <Icon name="pause" className="w-5 h-5 text-white" />
                    <div className="h-1 bg-white/20 flex-grow rounded-full overflow-hidden cursor-pointer">
                      <div className="h-full bg-[#b45309] w-1/3 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_5px_#b45309]"></div>
                      </div>
                    </div>
                    <span className="text-xs text-white font-sans">{block.duration}</span>
                    <Icon name="speakerHigh" className="w-5 h-5 text-white" />
                    <Icon name="cornersOut" className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          case 'blockquote':
            return (
              <blockquote key={index} className="relative p-8 my-10 bg-gradient-to-l from-white/5 to-transparent border-l border-white/10 rounded-r-3xl rounded-l-md italic">
                <Icon name="quotes" className="w-12 h-12 text-[#b45309]/20 absolute right-4 top-4 fill-current" />
                <p className="relative z-10 text-xl text-white font-medium leading-[2.2] mb-4 pr-6 text-justify">
                  "{block.text}"
                </p>
                {block.source && <footer className="mt-4 text-sm text-[#b45309] font-bold pr-6">{block.source}</footer>}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default function BlogDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // استیت‌های مربوط به مودال اشتراک‌گذاری
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // شبیه‌سازی بارگذاری اولیه صفحه (مثلاً ۱ ثانیه)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // تابع کپی کردن لینک صفحه
  const handleCopyLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://madar.ir';
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // اگر صفحه در حال لودینگ بود، اسکلتون اختصاصی نمایش داده می‌شود
  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      {/* پس‌زمینه نئونی شناور */}
      <div className="fixed inset-0 z-[-1] bg-deep-base overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,rgba(180,83,9,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-10 bg-[radial-gradient(circle,rgba(180,83,9,0.15)_0%,transparent_70%)] animate-[float_40s_infinite_linear_alternate-reverse]" />
      </div>

      {/* ۱. اضافه کردن نوار پیشرفت اینجا */}
      <ProgressBar />

      {/* محتوای اصلی مقاله */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        
        {/* کانتینر باریک‌تر برای خوانایی بهتر متن */}
        <article className="max-w-4xl mx-auto w-full animate-[fadeIn_0.5s_ease-out]">
          
          {/* مسیر راهنما */}
          <Breadcrumbs 
            items={[
              { label: 'خانه', href: '/' },
              { label: 'بلاگ', href: '/blog' },
              { label: articleData.title.split('؛')[0] } 
            ]} 
          />

          {/* تصویر شاخص */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-card mb-8 group border-t-2 border-t-[#b45309] p-1">
            <BlurImage src={articleData.coverImage} alt="تصویر شاخص مقاله" className="w-full h-full object-cover rounded-[22px] opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent pointer-events-none rounded-[22px]"></div>
            <div className="absolute top-6 right-6 bg-[#0b0f19]/70 backdrop-blur-md border border-[#b45309]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.5)] z-20">
              {articleData.category}
            </div>
          </div>

          {/* سربرگ مقاله و متادیتا */}
          <header className="mb-10 text-center md:text-right">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.4] mb-4">
              {articleData.title.split('؛')[0]}؛ <span className="text-[#b45309]">{articleData.title.split('؛')[1]}</span>
            </h1>
            <h2 className="text-lg md:text-xl text-gray-400 font-light leading-relaxed mb-8 text-justify">
              {articleData.subtitle}
            </h2>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0 relative flex items-center justify-center bg-gray-900">
                  <BlurImage src={articleData.author.avatar} alt="نویسنده" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{articleData.author.role}</p>
                  <a href="#" className="text-sm font-bold text-white hover:text-[#b45309] transition-colors">{articleData.author.name}</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-sans">
                <span className="flex items-center gap-2"><Icon name="calendarBlank" className="w-4 h-4" /> {articleData.meta.date}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-2"><Icon name="clock" className="w-4 h-4" /> {articleData.meta.readTime}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-2"><Icon name="eye" className="w-4 h-4" /> {articleData.meta.views}</span>
              </div>

              <div className="flex items-center gap-2 md:mr-auto">
                <button onClick={() => setIsSaved(!isSaved)} className={`transition-colors cursor-pointer ${isSaved ? 'text-[#b45309]' : 'text-gray-400 hover:text-white'}`}>
                  <Icon name="heart" className={`w-8 h-8 ${isSaved ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer text-gray-400 hover:text-[#b45309]" title="اشتراک‌گذاری">
                  <Icon name="shareNetwork" className="w-8 h-8" />
                </button>
              </div>
            </div>
          </header>

          {/* متن اصلی مقاله (رندر کامپوننت) */}
          <ArticleRenderer blocks={articleData.contentBlocks} />

          {/* برچسب‌ها */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="tag" className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-bold text-gray-300">دسته‌بندی‌ها و برچسب‌ها:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {articleData.tags.map(tag => (
                <a key={tag} href="#" className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-[#b45309] hover:border-[#b45309]/50 hover:bg-[#b45309]/5 transition-all">
                  {tag}
                </a>
              ))}
            </div>
          </div>

          {/* تازه‌های مدار (مطالب مرتبط) */}
          <section className="w-full border-t border-white/5 bg-[#050810] py-16 relative z-10 mt-16 rounded-3xl overflow-hidden shadow-inner">
            <div className="px-6 md:px-10">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Icon name="sparkle" className="w-6 h-6 text-[#b45309] fill-current" /> تازه‌های مدار
                  </h2>
                  <p className="text-sm text-gray-400 font-light">آخرین مقالات و گزارش‌های منتشر شده</p>
                </div>
                <a href="/blog" className="hidden md:flex text-sm font-semibold text-gray-400 hover:text-white transition-colors items-center gap-1 group">
                  مشاهده آرشیو <Icon name="arrowLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articleData.relatedNews.map(news => (
                  <a key={news.id} href="#" className={`glass-card group flex flex-col p-4 rounded-3xl border-t-2 ${news.theme.borderTop} transition-all duration-400 hover:-translate-y-1.5`}>
                    <div className="relative w-full h-48 rounded-2xl bg-gray-900 overflow-hidden mb-4 flex items-center justify-center">
                      <BlurImage src={news.image} alt={news.title} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                      {/* بج با استایل شیشه‌ای هماهنگ با صفحه اصلی بلاگ */}
                      <div className={`absolute top-3 right-3 bg-[#0b0f19]/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-gray-100 font-bold border ${news.theme.badgeBorder} shadow-lg z-20`}>
                        {news.badge}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className={`text-base font-bold text-white mb-2 leading-relaxed ${news.theme.hoverText} transition-colors line-clamp-2`}>{news.title}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
                      <span className="flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3" /> {news.date}</span>
                      <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3" /> {news.views}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* بخش نظرات */}
          <section id="comments" className="mt-16 pt-10 border-t border-white/10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#b45309]/30 to-transparent"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Icon name="chats" className="w-6 h-6 text-[#b45309] fill-current" /> نظرات کاربران 
              <span className="text-sm font-sans text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {articleData.comments.length} نظر
              </span>
            </h3>

            <div className="glass-card p-6 rounded-3xl mb-12 relative overflow-hidden border-none shadow-none bg-black/30">
              <form className="relative z-10">
                <div className="flex gap-4 mb-4">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">شما به عنوان «کاربر مدار» وارد شده‌اید</span>
                      <span className="text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded">ارسال نظر پس از تأیید مدیر</span>
                    </div>
                    <textarea 
                      rows="3" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="دیدگاه تحلیلی خود را بنویسید..." 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#b45309] focus:bg-white/10 outline-none transition-all resize-none shadow-inner"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    disabled={!commentText.trim()}
                    className="bg-white/10 text-white border border-white/20 px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b45309] hover:text-white hover:border-[#b45309] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ارسال دیدگاه
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {articleData.comments.map(comment => (
                <div key={comment.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon name="user" className="w-6 h-6 text-[#fbbf24]" />
                      </div>                
                      <div>
                        <h4 className={`text-sm font-bold flex items-center gap-1 ${comment.isAuthor ? 'text-[#b45309]' : 'text-white'}`}>
                          {comment.user} {comment.isAuthor && <Icon name="checkCircle" className="w-3 h-3 fill-current" />}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-sans">{comment.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-[2.2] mb-1 font-light text-justify">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <button className="text-sm text-[#b45309] hover:text-white transition-colors border border-[#b45309]/30 hover:border-white px-6 py-2 rounded-full cursor-pointer">
                بارگذاری نظرات بیشتر
              </button>
            </div>
          </section>
        </article>
      </main>

      {/* مودال اشتراک گذاری */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setIsShareModalOpen(false)}></div>
          <div className="glass-card relative z-10 w-full max-w-sm p-6 rounded-3xl border border-white/10 bg-[#0c1222]/90 animate-[fadeIn_0.2s_ease-out] shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Icon name="shareNetwork" className="w-5 h-5 text-[#b45309]" /> اشتراک‌گذاری
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 rounded-full p-1.5">
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-4 justify-center mb-8">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#0088cc] hover:border-[#0088cc] transition-all group shadow-lg" title="تلگرام">
                <Icon name="telegram" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all group shadow-lg" title="توییتر">
                <Icon name="twitter" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-green-600 hover:border-green-600 transition-all group shadow-lg" title="چت">
                <Icon name="chat" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">لینک مستقیم صفحه:</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-1.5">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : 'https://madar.ir'} 
                  className="bg-transparent text-gray-400 text-[11px] w-full outline-none px-2 dir-ltr text-left font-sans" 
                />
                <button 
                  onClick={handleCopyLink} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isCopied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isCopied ? 'کپی شد' : 'کپی لینک'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}