'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // اتصال به کامپوننت مرکزی آیکون‌ها

// === ۱. بخش محتوای متنی (قابل ویرایش و مدیریت در پنل ادمین سایت) ===
const pageContent = {
  hero: {
    badge: "همکاری با شبکه",
    highlight: "مدار",
    description: "ما در مدار به دنبال توسعه یک زنجیره قدرتمند از پژوهشگران، برنامه‌نویسان، هنرمندان رسانه‌ای و فعالان فرهنگی هستیم. اگر در مسیر تبیین حقایق و ارزش‌های انقلاب اسلامی قدم برمی‌دارید، جای شما در مدار خالی است."
  },
  collaborationOptions: [
    {
      id: 1,
      icon: 'folderOpen',
      title: "ارسال محتوای خام",
      desc: "ارسال عکس، فیلم و راش‌های صوتی جهت عرضه در سایت و استفاده دیگر پژوهشگران در راستای رشد و تبیین ارزش‌های انقلاب اسلامی.",
      baseColorClass: "text-[#fbbf24]", 
      borderColorClass: "border-t-[#fbbf24]/50",
      glowClass: "bg-[#fbbf24]/10 group-hover:bg-[#fbbf24]/20",
      hoverShadowClass: "hover:border-[#fbbf24]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(251,191,36,0.15)]"
    },
    {
      id: 2,
      icon: 'monitorPlay', 
      title: "محتوای تولیدی",
      desc: "آیا محتوایی با استفاده از راش‌های مدار تولید کرده‌اید؟ یا محتوای باکیفیتی دارید که راضی به انتشار رایگان آن هستید؟ ما در دیده شدن آن کمک می‌کنیم.",
      baseColorClass: "text-[#f43f5e]", 
      borderColorClass: "border-t-[#f43f5e]/50",
      glowClass: "bg-[#f43f5e]/10 group-hover:bg-[#f43f5e]/20",
      hoverShadowClass: "hover:border-[#f43f5e]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(244,63,94,0.15)]"
    },
    {
      id: 3,
      icon: 'shareNetwork',
      title: "شبکه توزیع و نشر",
      desc: "اگر در انتشار و وایرال کردن محتوای تولید شده در شبکه‌های اجتماعی توانمندی دارید و می‌توانید صدای پلتفرم مدار را به گوش مخاطبان بیشتری برسانید.",
      baseColorClass: "text-[#06b6d4]", 
      borderColorClass: "border-t-[#06b6d4]/50",
      glowClass: "bg-[#06b6d4]/10 group-hover:bg-[#06b6d4]/20",
      hoverShadowClass: "hover:border-[#06b6d4]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)]"
    },
    {
      id: 4,
      icon: 'users',
      title: "پیوستن به شبکه فعالان",
      desc: "اگر توانایی در عرصه‌های مختلف رسانه‌ای دارید (تدوین، گرافیک، پژوهش و...) فرم رزومه را تکمیل کنید تا در صورت وجود پروژه به شما اطلاع دهیم.",
      baseColorClass: "text-[#10b981]", 
      borderColorClass: "border-t-[#10b981]/50",
      glowClass: "bg-[#10b981]/10 group-hover:bg-[#10b981]/20",
      hoverShadowClass: "hover:border-[#10b981]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)]"
    },
    {
      id: 5,
      icon: 'buildings',
      title: "درخواست نیروی سازمان‌ها",
      desc: "اگر سازمان یا گروهی هستید که برای پیشبرد پروژه‌های خود نیاز به معرفی نیروی فعال، توانمند و انقلابی دارید، درخواست خود را برای ما ارسال کنید.",
      baseColorClass: "text-[#d946ef]", 
      borderColorClass: "border-t-[#d946ef]/50",
      glowClass: "bg-[#d946ef]/10 group-hover:bg-[#d946ef]/20",
      hoverShadowClass: "hover:border-[#d946ef]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(217,70,239,0.15)]"
    },
    {
      id: 6,
      icon: 'code',
      title: "توسعه زیرساخت فنی",
      desc: "مدار یک پلتفرم در حال رشد است. اگر در زمینه برنامه‌نویسی، توسعه ابزارهای هوش مصنوعی و زیرساخت‌های سروری تخصص دارید، دست یاری شما را می‌فشاریم.",
      baseColorClass: "text-[#3b82f6]", 
      borderColorClass: "border-t-[#3b82f6]/50",
      glowClass: "bg-[#3b82f6]/10 group-hover:bg-[#3b82f6]/20",
      hoverShadowClass: "hover:border-[#3b82f6]/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(59,130,246,0.15)]"
    }
  ],
  proposal: {
    icon: "lightbulb",
    title: "پیشنهاد و ایده آزاد",
    desc: "ایده‌ای خارج از چارچوب‌های بالا دارید؟ توانمندی و پیشنهاد خاصی دارید که فکر می‌‌کنید می‌تواند به جریان انقلاب اسلامی و پلتفرم مدار کمک کند؟ ما مشتاقانه آماده شنیدن ایده‌های شما هستیم.",
  }
};

// === ۲. کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function CollaborationPage() {
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی بارگذاری صفحه (پس از ۱ ثانیه محتوا نمایش داده می‌شود)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* محتوای اصلی */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        
        {/* مسیر راهنما */}        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'همکاری با ما' }
          ]} 
        />

        {/* بخش ۱: هدر اصلی */}
        <section className="glass-card relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {isLoading ? (
              /* اسکلتون هدر با افکت Shimmer */
              <div className="w-full flex flex-col items-center space-y-4">
                <BaseSkeleton className="w-16 h-16 mb-2" rounded="rounded-2xl" />
                <BaseSkeleton className="w-3/4 max-w-sm h-10" rounded="rounded-xl" />
                <div className="w-full space-y-2 mt-2">
                  <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
                  <BaseSkeleton className="w-5/6 h-4 mx-auto" rounded="rounded-md" />
                </div>
              </div>
            ) : (
              /* محتوای واقعی هدر (تغذیه شده از آبجکت ادمین) */
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] group hover:border-[#06b6d4]/30 transition-colors">
                  <Icon name="treeStructure" className="w-8 h-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black mb-4 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                  {pageContent.hero.badge} {pageContent.hero.highlight}
                </h1>
                
                <div className="rich-text text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light text-center">
                  <p>{pageContent.hero.description}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* بخش ۲: گزینه‌های همکاری */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? /* اسکلتون کارت‌های گرید با افکت Shimmer */
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="glass-card p-8 flex flex-col items-center text-center border-t-2 border-t-white/5 space-y-4">
                  <BaseSkeleton className="w-14 h-14 mb-2" rounded="rounded-2xl" />
                  <BaseSkeleton className="w-1/2 h-6" rounded="rounded-lg" />
                  <div className="w-full space-y-2 pt-2">
                    <BaseSkeleton className="w-full h-3" rounded="rounded-sm" />
                    <BaseSkeleton className="w-11/12 h-3" rounded="rounded-sm" />
                    <BaseSkeleton className="w-4/5 h-3" rounded="rounded-sm" />
                  </div>
                </div>
              ))
            : /* محتوای واقعی کارت‌های گرید (تغذیه شده از آبجکت ادمین) */
              pageContent.collaborationOptions.map((option) => (
                <div 
                  key={option.id} 
                  className={`glass-card p-8 flex flex-col items-center text-center group border-t-2 ${option.borderColorClass} relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1 ${option.hoverShadowClass} cursor-pointer`}
                >
                  <div className={`absolute -right-8 -top-8 w-24 h-24 ${option.glowClass} rounded-full blur-2xl transition-all pointer-events-none`}></div>
                  
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${option.baseColorClass} mb-6 z-10 transition-colors duration-300 group-hover:bg-white/10`}>
                    <Icon name={option.icon} className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 z-10">{option.title}</h3>
                  
                  <div className="rich-text text-sm text-gray-400 leading-relaxed font-light flex-grow z-10 w-full text-justify md:text-center">
                    <p>{option.desc}</p>
                  </div>
                </div>
              ))}
        </section>

        {/* بخش ۳: پیشنهاد آزاد (تغذیه شده از آبجکت ادمین) */}
        <section className="w-full">
          <div className={`glass-card p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden border-t-2 ${isLoading ? 'border-t-white/5' : 'border-t-[#fbbf24] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(251,191,36,0.15)] group transition-shadow duration-500 cursor-pointer'}`}>
            
            {!isLoading && (
              <>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-[#fbbf24]/20"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-[#f59e0b]/20"></div>
              </>
            )}
            
            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
              {isLoading ? (
                /* اسکلتون بخش پیشنهاد آزاد با افکت Shimmer */
                <div className="w-full flex flex-col items-center space-y-4 animate-pulse">
                  <BaseSkeleton className="w-24 h-24 mb-2" rounded="rounded-3xl" />
                  <BaseSkeleton className="w-1/2 h-10 mb-2" rounded="rounded-xl" />
                  <div className="w-full space-y-2">
                    <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
                    <BaseSkeleton className="w-5/6 h-4 mx-auto" rounded="rounded-md" />
                    <BaseSkeleton className="w-3/4 h-4 mx-auto" rounded="rounded-md" />
                  </div>
                </div>
              ) : (
                /* محتوای واقعی پیشنهاد آزاد */
                <>
                  <div className="w-24 h-24 flex-shrink-0 rounded-3xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.2)] mb-6 transition-colors duration-500 group-hover:bg-[#fbbf24]/20 group-hover:border-[#fbbf24]/50">
                    <Icon name={pageContent.proposal.icon} className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {pageContent.proposal.title}
                  </h3>
                  
                  <div className="rich-text text-base text-gray-300 leading-relaxed font-light text-center w-full">
                    <p>{pageContent.proposal.desc}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}