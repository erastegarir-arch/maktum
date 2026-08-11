'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; // اتصال به کامپوننت مرکزی آیکون‌ها
import ProgressBar from '../components/ProgressBar';

// === ۱. هسته محتوایی صفحه (قابل ویرایش در پنل مدیریت سایت) ===
const pageContent = {
  hero: {
    icon: "shieldCheck", // نام آیکون قابل ویرایش از پنل ادمین
    title: "قوانین و مقررات پلتفرم مدار",
    description: "لطفاً پیش از استفاده از امکانات، ابزارها و بایگانی اسناد سایت مدار، مفاد این توافق‌نامه را با دقت مطالعه فرمایید. آخرین به‌روزرسانی: ۲۴ بهمن ۱۴۰۲."
  },
  rules: [
    {
      id: "section-1",
      number: "ماده ۱.",
      title: "تعاریف و کلیات",
      paragraphs: [
        "پلتفرم «مدار» یک بایگانی تحقیقاتی و رسانه‌ای است که با هدف جمع‌آوری، طبقه‌بندی و تحلیل اسناد تاریخی، محتوای خام (راش) و انتشار مستندات پژوهشی ایجاد شده است.",
        "استفاده از این وب‌سایت، ثبت‌نام، و دانلود هرگونه محتوا به منزله پذیرش کامل این قوانین است. مدار حق دارد در هر زمان، بدون اطلاع قبلی، مفاد این توافق‌نامه را تغییر دهد. نسخه فعلی همواره در همین صفحه قابل دسترسی است."
      ],
      list: [
        "محتوای خام: شامل اسناد متنی، تصاویر اسکن شده، ویدیوهای راش و فایل‌های صوتی که بدون ویرایش در اختیار پژوهشگران قرار می‌گیرد.",
        "محتوای تولیدی: مستندها، پادکست‌ها و گزارش‌هایی که توسط تیم تحریریه مدار تولید و تدوین شده‌اند.",
        "کاربر: هر شخص حقیقی یا حقوقی که از خدمات سایت استفاده می‌کند."
      ]
    },
    {
      id: "section-2",
      number: "ماده ۲.",
      title: "شرایط عضویت و حساب کاربری",
      paragraphs: [
        "برای دسترسی به سطوح بالاتر اسناد (مانند دانلود فایل‌های حجیم و استفاده از ابزارهای هوش مصنوعی)، کاربران موظف به ایجاد حساب کاربری با استفاده از شماره موبایل معتبر هستند."
      ],
      list: [
        "کاربر موظف است اطلاعات خود را به صورت صحیح وارد نماید. مدار هیچ‌گونه مسئولیتی در قبال مشکلات ناشی از درج اطلاعات نادرست نمی‌پذیرد.",
        "حفظ امنیت رمز عبور (کد یکبار مصرف) و حساب کاربری بر عهده شخص کاربر است. اشتراک‌گذاری حساب کاربری با اشخاص ثالث ممنوع است.",
        "در صورت مشاهده هرگونه فعالیت مشکوک (مانند دانلود رباتیک و انبوه اسناد)، مدار حق دارد حساب کاربر را به صورت موقت یا دائم مسدود کند."
      ]
    },
    {
      id: "section-3",
      number: "ماده ۳.",
      title: "حقوق مالکیت معنوی و حق نشر",
      paragraphs: [
        "رسالت پلتفرم مدار، کمک به نشر و تبیین آزاد اطلاعات برای پژوهشگران مستقل است. با این حال، رعایت اخلاق پژوهشی الزامی است.",
        "استفاده از محتوای خام: استفاده، بازنشر و تحلیل محتوای خام (راش، اسناد، صوت) در رسانه‌ها، مقالات و مستندهای دیگر کاملاً آزاد بوده و نیازی به کسب اجازه کتبی ندارد.",
        "استفاده از محتوای تولیدی: بازنشر مستندها، گزارش‌ها و پادکست‌های اختصاصی مدار، تنها در صورت حفظ واترمارک (لوگو)، عدم تقطیع تحریف‌کننده و ذکر نام «پلتفرم مدار» به عنوان منبع، مجاز است."
      ],
      list: []
    },
    {
      id: "section-4",
      number: "ماده ۴.",
      title: "حریم خصوصی و امنیت داده‌ها",
      paragraphs: [
        "مدار به حریم خصوصی کاربران خود احترام می‌گذارد و متعهد می‌شود که اطلاعات ثبت‌نامی و تاریخچه جستجوهای پژوهشگران را در بالاترین سطح امنیتی نگهداری کند."
      ],
      list: [
        "اطلاعات هویتی شما هرگز در اختیار شرکت‌های تبلیغاتی یا اشخاص ثالث قرار نخواهد گرفت.",
        "داده‌های وارد شده در «ابزارهای تحلیلی» (مانند متون ارسال شده برای مترجم هوشمند) صرفاً جهت پردازش در همان لحظه استفاده شده و در سرورهای ما ذخیره دائم نمی‌شوند.",
        "ما از کوکی‌ها (Cookies) صرفاً برای بهبود تجربه کاربری و حفظ نشست (Session) ورود شما استفاده می‌کنیم."
      ]
    },
    {
      id: "section-5",
      number: "ماده ۵.",
      title: "استفاده از ابزارهای تحلیلی و هوش مصنوعی",
      paragraphs: [
        "ابزارهای ارائه شده در سایت (نظیر گراف ارتباطات، گاه‌شمار و ماشین ترجمه) به صورت خودکار و بر پایه الگوریتم‌های پردازش داده عمل می‌کنند.",
        "مدار هیچ‌گونه تضمینی مبنی بر صحت صددرصدی خروجیِ ابزارهای ماشینی ارائه نمی‌دهد. پژوهشگران موظف‌اند خروجی‌ها را پیش از استناد در مقالات رسمی، شخصاً صحت‌سنجی نمایند."
      ],
      list: []
    },
    {
      id: "section-6",
      number: "ماده ۶.",
      title: "رفع مسئولیت",
      paragraphs: [
        "بخش عمده‌ای از «محتوای خام» موجود در این پلتفرم از بایگانی‌های ملی، اسناد افشاشده و منابع متن‌باز (OSINT) جمع‌آوری شده است.",
        "نظرات، تحلیل‌ها و تفسیرهایی که کاربران در بخش نظرات مقالات منتشر می‌کنند، تنها بیانگر دیدگاه شخصی نویسنده آن نظر بوده و الزاماً مورد تأیید تحریریه مدار نیست. مدیریت سایت حق ویرایش یا حذف نظرات حاوی توهین، افترا یا نقض قوانین جاری کشور را برای خود محفوظ می‌دارد."
      ],
      list: []
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

// === ۳. کامپوننت اسکلتون کل صفحه قوانین ===
const RulesPageSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-12 w-full relative z-10 pt-28">
        <div className="w-32 h-6 bg-white/5 rounded-lg"></div>

        {/* اسکلتون هدر قوانین */}
        <section className="glass-card relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4]">
          <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
            <BaseSkeleton className="w-16 h-16" rounded="rounded-2xl" />
            <BaseSkeleton className="w-3/4 max-w-md h-12" rounded="rounded-xl" />
            <div className="w-full space-y-2 mt-2">
              <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
              <BaseSkeleton className="w-5/6 h-4 mx-auto" rounded="rounded-md" />
            </div>
          </div>
        </section>

        {/* گرید دو ستونی اسکلتون */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* سایدبار اسکلتون */}
          <aside className="lg:col-span-3 sticky top-32 glass-card p-6 hidden lg:block space-y-4">
            <BaseSkeleton className="w-36 h-6 mb-6" rounded="rounded-md" />
            {Array.from({ length: 6 }).map((_, i) => (
              <BaseSkeleton key={i} className="w-full h-5" rounded="rounded-md" />
            ))}
          </aside>

          {/* محتوا اسکلتون */}
          <div className="lg:col-span-9 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 md:p-8 space-y-4">
                <BaseSkeleton className="w-1/2 h-7" rounded="rounded-lg" />
                <div className="space-y-2 pt-2">
                  <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
                  <BaseSkeleton className="w-5/6 h-4" rounded="rounded-md" />
                  <BaseSkeleton className="w-4/5 h-4" rounded="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function RulesPage() {
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی بارگذاری اولیه صفحه
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // تابع اسکرول نرم برای لینک‌های منوی کناری
  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // اگر صفحه در حال لودینگ بود، اسکلتون اختصاصی نمایش داده می‌شود
  if (isLoading) {
    return <RulesPageSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      
      {/* نوار پیشرفت مطالعه صفحه */}
      <ProgressBar />

      {/* محتوای اصلی */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16 w-full relative z-10 pt-18 md:pt-25">
        
        {/* مسیر راهنما */}
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'قوانین و مقررات' }
          ]} 
        />

        {/* هدر صفحه قوانین (تغذیه شده از آبجکت داینامیک pageContent.hero) */}
        <section className="glass-card relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* آیکون قابل ویرایش از بخش مدیریت */}
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] group hover:border-[#06b6d4]/30 transition-colors">
              <Icon name={pageContent.hero.icon} className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
            
            {/* عنوان قابل ویرایش از بخش مدیریت */}
            <h1 className="text-3xl md:text-5xl font-black mb-4 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
              {pageContent.hero.title}
            </h1>
            
            {/* توضیحات قابل ویرایش از بخش مدیریت */}
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light text-center">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* سایدبار: فهرست مندرجات */}
          <aside className="lg:col-span-3 sticky top-32 glass-card p-6 hidden lg:block shadow-xl">
            <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-sm">
              <Icon name="listBullets" className="text-[#06b6d4] w-5 h-5" /> فهرست مندرجات
            </h2>
            <ul className="space-y-3 text-sm">
              {pageContent.rules.map((rule) => (
                <li key={`toc-${rule.id}`}>
                  <a 
                    href={`#${rule.id}`} 
                    onClick={(e) => handleScroll(e, rule.id)}
                    className="text-gray-400 hover:text-[#06b6d4] transition-colors flex items-center gap-2 cursor-pointer group py-1"
                  >
                    <Icon name="arrowLeft" className="w-3 h-3 text-[#06b6d4] group-hover:scale-110 transition-transform" /> 
                    <span>{rule.number} {rule.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* محتوای اصلی: بندهای قانونی */}
          <div className="lg:col-span-9 space-y-6">
            {pageContent.rules.map((rule) => (
              <section key={rule.id} id={rule.id} className="glass-card p-6 md:p-8 scroll-mt-32 border-t-2 border-t-transparent hover:border-t-[#06b6d4]/40 transition-all duration-300">
                <h3 className="text-white text-xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-2 mt-2">
                  <span className="text-[#06b6d4] font-sans">{rule.number}</span> {rule.title}
                </h3>
                
                <div className="rich-text space-y-4">
                  {rule.paragraphs.map((p, index) => (
                    <p key={`p-${index}`} className="text-gray-300 text-[0.95rem] leading-[2.2] font-light text-justify">
                      {p}
                    </p>
                  ))}
                </div>

                {/* تبصره‌ها / لیست‌ها */}
                {rule.list && rule.list.length > 0 && (
                  <ul className="mt-6 space-y-3 pr-0">
                    {rule.list.map((li, index) => (
                      <li 
                        key={`li-${index}`} 
                        className="text-gray-300 leading-[2] pr-6 relative font-light text-[0.95rem] text-justify before:content-[''] before:absolute before:right-0 before:top-3 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#06b6d4]"
                      >
                        {li.includes(':') ? (
                          <>
                            <strong className="text-white font-medium">{li.split(':')[0]}:</strong>
                            {li.split(':')[1]}
                          </>
                        ) : (
                          li
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}