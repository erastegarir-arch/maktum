'use client';

import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon';
import Tooltip from '../components/Tooltip';

// ==========================================
// پایگاه داده داینامیک صفحه (قابل مدیریت در پنل ادمین)
// تمامی متن‌ها، آیکون‌ها، اطلاعات تماس و شبکه‌های اجتماعی از اینجا تغذیه می‌شوند
// ==========================================
const pageData = {
  hero: {
    icon: "microscope",
    title: "در مدار انقلاب اسلامی",
    paragraphs: [
      "«مدار» مخففِ «مرکز داده و آرشیو رسانه‌ای انقلاب اسلامی» است. مجموعه‌ای کاملاً مردمی و مستقل که بدون وابستگی به هیچ نهاد، سازمان یا بودجه‌ی حاکمیتی، برخاسته از دغدغه‌هایی از جنس مردم است. دل ما با جمهوری اسلامی و انقلاب اسلامی است و با افتخار در مسیر تقویت جبهه مقاومت و تاریخ و فرهنگ ایران عزیز گام برمی‌داریم.",
      "ما اینجا جمع شده‌ایم تا با هم‌افزایی ظرفیت‌های مختلف انسانی، مادی و معنوی، به تمامی عزیزانی که می‌خواهند در مسیر رسانه و در مدار انقلاب اسلامی تولید محتوا کنند، یاری برسانیم. مدار، نقطه اتصال ظرفیت‌هاست."
    ]
  },
  ecosystem: {
    badge: "یک زیست‌بوم زنده",
    titlePart1: "فراتر از یک آرشیو؛",
    titlePart2: "یک اکوسیستم رسانه‌ای",
    paragraphs: [
      "مدار صرفاً یک سایت برای دانلود فایل یا یک آرشیو ساده نیست؛ مدار یک اکوسیستم رسانه‌ای و شبکه‌ای زنده از عوامل انسانی، فناورانه و نهادی است که با تعامل مستمر، جریان اطلاعات و ارتباطات در جامعه را شکل می‌دهند.",
      "در این زیست‌بوم، هر فرد، هر ابزار و هر اثر رسانه‌ای، جزئی از یک چرخه حیات‌بخش است. ما فقط آرشیو راش و فوتیج نیستیم، بلکه «مرکز داده هنرمندان انقلاب اسلامی» هستیم. در این اکوسیستم، تولیدکننده، تدوین‌گر، ایده پرداز و سفارش‌دهنده در یک فضای هم‌افزا در کنار یکدیگر قرار می‌گیرند تا با حرکتی شتابان و منسجم، خلأهای موجود در جبهه رسانه‌ای را پر کنند."
    ]
  },
  waqf: {
    badge: "۱۰۰% وقفِ ساحت مقدس حضرت صدیقه طاهره (س)",
    titlePart1: "نذر فرهنگی و ",
    titlePart2: "عهد آسمانی",
    paragraphs: [
      "مدار، یک اقدام رسانه‌ای با عهدی آسمانی است. ما خود را یک موسسه تولیدی یا بنگاه مالی نمی‌دانیم؛ اینجا نه پولی در میان است و نه سرمایه‌ای کلان، بلکه تمام حرکت ما بر مبنای «برکت» پایه‌گذاری شده است.",
      "تمامی فعالیت‌ها، دستاوردها و اعتبار پلتفرم رسانه‌ای «مدار»، خالصانه و بدون هیچ چشم‌داشتی، وقفِ نام و یادِ بانوی دو عالم، حضرت فاطمه زهرا (سلام‌الله‌علیها) گردیده است. امیدواریم عنایت ایشان، همواره چراغ راه این موکب رسانه‌ای در کشف حقایق و پیشبرد اهداف باشد."
    ]
  },
  connection: {
    icon: "target",
    title: "پر کردن خلأها؛ اتصال در مدار انقلاب",
    paragraphs: [
      "تا به امروز، خلأ بزرگی در دسترسی به منابع و اتصال افراد توانمند وجود داشته است. مدار دقیقاً در همین نقطه ایستاده تا این خلأ را پر کند. تمرکز ما حمایت بی‌دریغ از تولید محتواست.",
      "ما تمام تلاش و ظرفیت خود را به کار گرفته‌ایم تا هر عزیزی در دورترین نقاط ایران که توان و استعدادی در حوزه رسانه دارد را شناسایی کرده و به سفارش‌دهندگان سازمانی و تهیه‌کنندگان متصل کنیم. هدف این است که هنرمندانی که در رسانه زیست می‌کنند، بتوانند تولیداتی مؤثر، باکیفیت و درآمدزا داشته باشند."
    ]
  },
  features: {
    title: "در مدار چه می‌گذرد؟",
    subtitle: "خدمات اصلی زیست‌بوم رسانه‌ای مدار",
    items: [
      {
        icon: "database",
        title: "تأمین راش و مصالح تولید",
        desc: "جمع‌آوری و عرضه رایگان مجموعه‌ای غنی از راش‌ها و فوتیج‌های باکیفیت بر اساس اقتضائات روز و زمانه. تا هر هنرمندی ابزار کار خود را در اینجا بیابد.",
        color: "#f59e0b"
      },
      {
        icon: "users",
        title: "مرکز داده و شبکه‌سازی انسانی",
        desc: "متصل کردن افراد توانمند و هنرمندان سراسر کشور به شبکه‌ی تولیدکنندگان و سازمان‌های فعال جهت همکاری در پروژه‌های تولیدی.",
        color: "#06b6d4"
      },
      {
        icon: "pen-nib",
        title: "جعبه ابزار رسانه‌ای",
        desc: "علاوه بر تصویر، جمع‌آوری و توزیع ابزارهای کاربردی تولید رسانه‌ای نظیر صوت‌های حرفه‌ای، پلاگین‌ها و ملزومات فنی.",
        color: "#10b981"
      },
      {
        icon: "shareNetwork",
        title: "حمایت از انتشار",
        desc: "در کنار تأمین مواد اولیه، ما به جمع‌آوری آثار تولیدشده توسط همین شبکه و کمک به توزیع و انتشار گسترده‌ی آن‌ها می‌پردازیم.",
        color: "#a855f7"
      }
    ]
  },
  contact: {
    title: "هم‌افزایی در این موکب رسانه‌ای",
    description: "این موکب رسانه‌ای با دست به دست هم دادن شما عزیزان برپا مانده است. اگر در مدار انقلاب اسلامی حرکت می‌کنید و دغدغه تولید رسانه‌ای دارید، به این زیست‌بوم بپیوندید تا با هم‌افزایی توانمندی‌ها، جریانی قدرتمند و اثرگذار خلق کنیم.",
    email: {
      value: "info@madar.ir",
      tooltip: "ارسال ایمیل مستقیم به تیم پشتیبانی مدار"
    },
    phone: {
      value: "021 - 8800 0000",
      tooltip: "تماس تلفنی با دفتر مرکزی در ساعات اداری"
    },
    socialsTitle: "ما را در شبکه‌های اجتماعی دنبال کنید",
    socials: [
      { id: "telegram", icon: "telegram", url: "#", tooltip: "کانال رسمی تلگرام مدار", hoverColor: "hover:text-[#229ED9]" },
      { id: "instagram", icon: "instagram", url: "#", tooltip: "صفحه رسمی اینستاگرام", hoverColor: "hover:text-[#E1306C]" },
      { id: "twitter", icon: "twitter", url: "#", tooltip: "صفحه رسمی ایکس (توییتر)", hoverColor: "hover:text-[#1DA1F2]" },
      { id: "youtube", icon: "youtube", url: "#", tooltip: "کانال ویدیویی یوتیوب", hoverColor: "hover:text-[#FF0000]" },
      { id: "aparat", icon: "videoCamera", url: "#", tooltip: "کانال رسمی آپارات", hoverColor: "hover:text-[#EA1D5D]" },
      { id: "eitaa", icon: "chatText", url: "#", tooltip: "کانال رسمی ایتا", hoverColor: "hover:text-[#F37021]" },
      { id: "bale", icon: "chats", url: "#", tooltip: "کانال رسمی پیام‌رسان بله", hoverColor: "hover:text-[#34A853]" },
      { id: "rubika", icon: "appWindow", url: "#", tooltip: "صفحه رسمی روبیکا", hoverColor: "hover:text-[#8A2BE2]" }
    ]
  }
};

// ==========================================
// اسکلتون اختصاصی
// ==========================================
const AboutSkeleton = () => {
  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 animate-pulse pt-0">
      <div className="w-32 h-6 bg-white/5 rounded-lg"></div>
      <section className="glass-card p-8 md:p-12 text-center border-t-2 border-t-white/10 rounded-3xl">
        <div className="max-w-3xl mx-auto flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10"></div>
          <div className="w-3/4 h-10 bg-white/10 rounded-xl"></div>
          <div className="w-full h-24 bg-white/5 rounded-xl"></div>
        </div>
      </section>
      <section className="glass-card p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 rounded-3xl">
        <div className="lg:w-1/2 w-full space-y-4">
          <div className="w-48 h-8 bg-white/10 rounded-lg"></div>
          <div className="w-full h-32 bg-white/5 rounded-lg"></div>
        </div>
        <div className="lg:w-1/2 w-full h-64 bg-white/5 rounded-full"></div>
      </section>
      <section className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 rounded-3xl">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 shrink-0"></div>
        <div className="flex-grow w-full space-y-4">
          <div className="w-48 h-6 bg-white/10 rounded-full"></div>
          <div className="w-full h-8 bg-white/10 rounded-lg"></div>
          <div className="w-full h-16 bg-white/5 rounded-lg"></div>
        </div>
      </section>
      <section className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-8 flex flex-col items-center text-center space-y-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white/10"></div>
              <div className="w-32 h-6 bg-white/10 rounded"></div>
              <div className="w-full h-16 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

// ==========================================
// کامپوننت اصلی صفحه درباره ما
// ==========================================
export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AboutSkeleton />;
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 animate-[fadeIn_0.5s_ease-out] pt-0">

      <Breadcrumbs 
        items={[
          { label: 'مدار', href: '/' },
          { label: 'درباره ما' }
        ]} 
      />

      {/* ==========================================
          بخش اول: معرفی پلتفرم (Hero)
      ========================================== */}
      <section className="glass-card relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] rounded-3xl shadow-2xl">
        <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] group hover:border-[#06b6d4]/60 transition-colors">
            <Icon name={pageData.hero.icon} className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-6 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
            {pageData.hero.title}
          </h1>
          
          <div className="text-gray-300 text-sm md:text-base leading-loose font-light text-justify md:text-center space-y-4">
            {pageData.hero.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          بخش دوم: عهد آسمانی (وقف‌نامه جدید)
      ========================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-black to-[#1a1005] p-8 md:p-14 text-center group shadow-[0_0_40px_rgba(245,158,11,0.05)]">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Icon name="ya-fatemeh" className="w-20 h-20 md:w-24 md:h-24 stroke-[0.5]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-amber-50 mb-6 tracking-wide drop-shadow-md">
            {pageData.waqf.titlePart1}{pageData.waqf.titlePart2}
          </h2>
          <div className="max-w-3xl text-amber-100/70 text-sm md:text-base leading-loose font-light space-y-4 text-justify md:text-center">
             {pageData.waqf.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          بخش سوم: زیست‌بوم رسانه‌ای
      ========================================== */}
      <section className="glass-card p-8 md:p-12 relative overflow-hidden group flex flex-col lg:flex-row items-center gap-12 border-t-2 border-t-[#a855f7] rounded-3xl">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#a855f7]/20 pointer-events-none"></div>
        
        <div className="relative z-10 lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full text-xs font-bold text-[#a855f7] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse"></span>
            {pageData.ecosystem.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
            {pageData.ecosystem.titlePart1} <br/>
            <span className="text-[#a855f7]">{pageData.ecosystem.titlePart2}</span>
          </h2>
          <div className="space-y-4 text-gray-300 text-sm md:text-base leading-loose font-light text-justify">
            {pageData.ecosystem.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        <div className="relative z-10 lg:w-1/2 flex items-center justify-center w-full h-72 md:h-96">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent absolute"></div>
              <div className="h-full w-px bg-gradient-to-b from-transparent via-[#06b6d4]/50 to-transparent absolute"></div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent absolute rotate-45"></div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent absolute -rotate-45"></div>
            </div>
            <div className="relative z-20 w-24 h-24 bg-[#080c16] border-2 border-[#a855f7] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Icon name="treeStructure" className="w-10 h-10 text-[#a855f7]" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-[float_4s_ease-in-out_infinite]">
              <div className="w-12 h-12 bg-[#080c16] border border-[#06b6d4] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] text-[#06b6d4]"><Icon name="videoCamera" className="w-5 h-5" /></div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 animate-[float_5s_ease-in-out_infinite_1s]">
              <div className="w-12 h-12 bg-[#080c16] border border-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] text-[#f59e0b]"><Icon name="users" className="w-5 h-5" /></div>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 animate-[float_6s_ease-in-out_infinite_2s]">
              <div className="w-12 h-12 bg-[#080c16] border border-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] text-[#10b981]"><Icon name="pen-nib" className="w-5 h-5" /></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 animate-[float_4.5s_ease-in-out_infinite_0.5s]">
              <div className="w-12 h-12 bg-[#080c16] border border-[#f43f5e] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)] text-[#f43f5e]"><Icon name="shareNetwork" className="w-5 h-5" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          بخش چهارم: پر کردن خلأها (با استفاده از کامپوننت Icon)
      ========================================== */}
      <section className="glass-card p-8 md:p-12 relative overflow-hidden group flex flex-col lg:flex-row items-center gap-12 border-t-2 border-t-[#f59e0b] rounded-3xl">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#f59e0b]/20"></div>
        
        <div className="relative z-10 lg:w-2/3">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name={pageData.connection.icon} className="w-7 h-7 text-[#f59e0b]" /> {pageData.connection.title}
          </h2>
          <div className="space-y-4 text-gray-300 text-sm md:text-base leading-loose font-light text-justify">
             {pageData.connection.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
          </div>
        </div>

        {/* گرافیک مداری با استفاده از Icon در مرکز و ۴ مدار چرخان با سرعت و جهت‌های متناوب */}
        <div className="relative z-10 lg:w-1/3 flex items-center justify-center w-full h-72 md:h-96">
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
            
            {/* مدار اول (کوچک‌ترین) - سرعت ۸ ثانیه - ساعت‌گرد */}
            <div className="absolute inset-16 rounded-full border border-dashed border-[#f59e0b]/40 animate-[spin_8s_linear_infinite]">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f59e0b] rounded-full shadow-[0_0_12px_#f59e0b]"></div>
            </div>

            {/* مدار دوم - سرعت ۱۲ ثانیه - پادساعت‌گرد */}
            <div className="absolute inset-10 rounded-full border border-dotted border-[#06b6d4]/40 animate-[spin_12s_linear_infinite_reverse]">
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#06b6d4] rounded-full shadow-[0_0_12px_#06b6d4]"></div>
            </div>

            {/* مدار سوم - سرعت ۱۸ ثانیه - ساعت‌گرد */}
            <div className="absolute inset-4 rounded-full border border-dashed border-[#10b981]/30 animate-[spin_18s_linear_infinite]">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#10b981] rounded-full shadow-[0_0_12px_#10b981]"></div>
            </div>

            {/* مدار چهارم (بزرگ‌ترین) - سرعت ۲۵ ثانیه - پادساعت‌گرد */}
            <div className="absolute inset-0 rounded-full border border-[#a855f7]/20 animate-[spin_25s_linear_infinite_reverse]">
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"></div>
            </div>

            {/* لوگوی مرکزی (فراخوانی از صفحه آیکون‌ها) با قابلیت بزرگ‌شدن هنگام هاور */}
            <div className="relative z-20 w-24 h-24 bg-[#080c16] border-2 border-[#f59e0b]/50 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Icon name="allah" className="w-14 h-14 text-[#f59e0b] drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          بخش پنجم: ارکان فعالیت (کارت‌های گرید داینامیک)
      ========================================== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{pageData.features.title}</h2>
          <p className="text-sm text-gray-400 font-light">{pageData.features.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageData.features.items.map((feature, idx) => (
            <div key={idx} className="glass-card p-8 hover-lift flex flex-col items-center text-center group rounded-3xl" style={{ borderTopColor: feature.color, borderTopWidth: '2px' }}>
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}1a`, color: feature.color, boxShadow: `0 0 10px ${feature.color}33` }}
              >
                <Icon name={feature.icon} className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 transition-colors" style={{ '--tw-hover-text': feature.color }} onMouseEnter={(e) => e.currentTarget.style.color = feature.color} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-loose font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          بخش ششم: پل‌های ارتباطی (شبکه‌های اجتماعی مینیمال و تول‌تیپ)
      ========================================== */}
      <section className="glass-card p-8 md:p-12 relative overflow-hidden border-t-2 border-t-[#10b981] rounded-3xl">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Icon name="phoneCall" className="w-7 h-7 text-[#10b981]" /> {pageData.contact.title}
          </h2>
          <p className="text-sm md:text-base text-gray-300 font-light leading-loose max-w-3xl mx-auto text-justify md:text-center">
            {pageData.contact.description}
          </p>
        </div>

        <div className="flex flex-col gap-10 relative z-10 mt-8 border-t border-white/5 pt-8">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
            
            <Tooltip content={pageData.contact.email.tooltip} position="top">
              <div className="bg-black/30 border border-white/5 px-8 py-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#10b981]">
                  <Icon name="envelope" className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">پست الکترونیک</p>
                  <a href={`mailto:${pageData.contact.email.value}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                    {pageData.contact.email.value}
                  </a>
                </div>
              </div>
            </Tooltip>

            <Tooltip content={pageData.contact.phone.tooltip} position="top">
              <div className="bg-black/30 border border-white/5 px-8 py-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#10b981]">
                  <Icon name="phone" className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">شماره تماس (پشتیبانی)</p>
                  <a href={`tel:${pageData.contact.phone.value.replace(/\D/g,'')}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                    {pageData.contact.phone.value}
                  </a>
                </div>
              </div>
            </Tooltip>

          </div>

          <div className="border-t border-white/5 pt-8">
            <p className="text-center text-sm text-gray-400 mb-6 font-light">{pageData.contact.socialsTitle}</p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
              {pageData.contact.socials.map((social) => (
                <Tooltip key={social.id} content={social.tooltip} position="top">
                  <a 
                    href={social.url} 
                    className={`text-gray-400 ${social.hoverColor} hover:scale-110 transition-all duration-300 drop-shadow-md inline-block p-2`}
                  >
                    <Icon name={social.icon} className="w-8 h-8" />
                  </a>
                </Tooltip>
              ))}
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}