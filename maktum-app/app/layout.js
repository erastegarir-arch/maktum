// مسیر پرونده: app/layout.jsx
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/app/components/frontend/Header';
import Footer from '@/app/components/frontend/Footer';
import { getSetting } from '@/app/actions/settings';
import { getIcons } from '@/app/actions/icons';
import AmbientBackground from '@/app/components/frontend/AmbientBackground';
import Script from 'next/script';
// وارد کردن موتور مرکزی سئوی مکتوم
import { SITE_URL, SITE_CONFIG, generateCoreGraphSchema } from '@/lib/seo';

// تامین‌کننده تاریخ
import { DateSettingsProvider } from '@/app/components/providers/DateSettingsContext';

// کامپوننت واسط برای انیمیشن‌های روان بین صفحات
import PageTransitionProvider from '@/app/components/providers/PageTransitionProvider';

// تابع ایمن برای پارس کردن JSON در سمت سرور (جلوگیری از خطای 500 در صورت نقص داده)
const safeJsonParse = (str, fallback = []) => {
  if (!str || typeof str !== 'string') return fallback;
  try {
    const parsed = JSON.parse(str);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

// ==========================================
// تنظیمات Viewport استاندارد (هماهنگ با تم سرمه‌ای تیره)
// ==========================================
export const viewport = {
  themeColor: SITE_CONFIG.themeColor || '#0b1426',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

// ==========================================
// اعمال سراسری فاونماد، متا دیتا و گراف برند
// ==========================================
export async function generateMetadata() {
  let dynamicFavicon = null;
  try {
    dynamicFavicon = await getSetting('favicon');
  } catch {}
  
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `${SITE_CONFIG.name} | %s`,
      default: SITE_CONFIG.title,
    },
    description: SITE_CONFIG.description,
    applicationName: SITE_CONFIG.name,
    generator: 'Next.js 16',
    referrer: 'origin-when-cross-origin',
    keywords: [
      'مکتوم',
      'پایگاه داده رسانه‌ای مکتوم',
      'فوتیج خام رایگان',
      'راش مستند',
      'پرونده‌های ویژه پژوهشی',
      'ابزار تولید محتوا',
    ],
    authors: [{ name: SITE_CONFIG.name, url: SITE_URL }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical: SITE_URL,
      languages: { 'fa-IR': SITE_URL },
      types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
    },
    icons: {
      icon: dynamicFavicon || '/favicon.ico',
      shortcut: dynamicFavicon || '/favicon.ico',
      apple: dynamicFavicon || '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: SITE_URL,
      siteName: SITE_CONFIG.name,
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      images: [{ url: SITE_CONFIG.ogImageUrl, width: 1200, height: 630, alt: SITE_CONFIG.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      images: [SITE_CONFIG.ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // تاییدیه موتورهای کاوش (از پرونده .env خوانده می‌شود)
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: {
        ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION } : {}),
      },
    },
  };
}

export default async function RootLayout({ children }) {
  // ۱. دریافت کل نمادها و تنظیمات روی سرور با پرامیس‌های هم‌زمان (شامل header_settings برای رندر فوری هدر)
  const settingsKeys = [
    'header_settings', 'header_icon', 'header_text', 'header_links',
    'footer_icon', 'footer_text', 'footer_desc', 'copyright_text', 'footer_fast_links', 'footer_companion_links', 'footer_social_links',
    'enamad_type', 'enamad_code', 'enamad_img', 'enamad_url',
    'samandehi_type', 'samandehi_code', 'samandehi_img', 'samandehi_url',
    'satra_type', 'satra_code', 'satra_img', 'satra_url'
  ];

  const settingsPromises = settingsKeys.map(key => getSetting(key).catch(() => null));

  const [allIcons, ...settingsResults] = await Promise.all([
    getIcons().catch(() => []),
    ...settingsPromises
  ]);

  const settings = settingsKeys.reduce((acc, key, index) => {
    acc[key] = settingsResults[index];
    return acc;
  }, {});

  // استخراج ایمن تنظیمات هدر برای رندر سمت سرور (SSR) بدون تاخیر
  const parsedHeaderSettings = safeJsonParse(settings['header_settings'], null);
  const headerLinks = safeJsonParse(settings['header_links'], []);

  // استخراج ایمن تنظیمات فوتر
  const fastLinks = safeJsonParse(settings['footer_fast_links'], []);
  const companionLinks = safeJsonParse(settings['footer_companion_links'], []);
  const socialLinks = safeJsonParse(settings['footer_social_links'], []);

  const headerData = {
    headerSettings: parsedHeaderSettings,
    headerIcon: parsedHeaderSettings?.logoIcon ?? settings['header_icon'] ?? '',
    headerText: parsedHeaderSettings?.siteTitle ?? settings['header_text'] ?? 'مکتوم',
    headerLinks: Array.isArray(parsedHeaderSettings?.navItems) && parsedHeaderSettings.navItems.length > 0
      ? parsedHeaderSettings.navItems
      : headerLinks,
    allIcons: Array.isArray(allIcons) ? allIcons : []
  };

  const footerData = {
    footerIcon: settings['footer_icon'] || '',
    footerText: settings['footer_text'] || '',
    footerDesc: settings['footer_desc'] || 'شبکه رسانه‌ای مکتوم؛ پلتفرم مستقل پایگاه داده و تبادل دانش.',
    copyrightText: settings['copyright_text'] || 'تمامی حقوق برای شبکه رسانه‌ای مکتوم محفوظ است.',
    fastLinks,
    companionLinks,
    socialLinks,
    allIcons: Array.isArray(allIcons) ? allIcons : [],
    enamad: {
      type: settings['enamad_type'] || 'code',
      code: settings['enamad_code'] || '',
      img: settings['enamad_img'] || '',
      url: settings['enamad_url'] || '',
    },
    samandehi: {
      type: settings['samandehi_type'] || 'code',
      code: settings['samandehi_code'] || '',
      img: settings['samandehi_img'] || '',
      url: settings['samandehi_url'] || '',
    },
    satra: {
      type: settings['satra_type'] || 'code',
      code: settings['satra_code'] || '',
      img: settings['satra_img'] || '',
      url: settings['satra_url'] || '',
    }
  };

  // ایمن‌سازی رشته JSON-LD در برابر تزریق تگ اسکریپت (XSS Protection)
  const safeSchemaJson = JSON.stringify(generateCoreGraphSchema()).replace(/</g, '\\u003c');

  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* پیش‌بارگذاری فونت اصلی برای حذف کامل پرش متن (CLS = 0) و افزایش سرعت LCP */}
        <link
          rel="preload"
          href="/fonts/Vazirmatn[wght].woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://c.iran-analytics.ir" />
        <link rel="dns-prefetch" href="https://www.goftino.com" />
      </head>
      <body 
        suppressHydrationWarning
        className="text-white min-h-screen flex flex-col antialiased relative selection:bg-cyan-500/30"
      >
        {/* تزریق ایمن گراف دانش مکتوم، قاب کاوش گوگل و ساختار Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeSchemaJson }}
        />
        
        <DateSettingsProvider>
          
          {/* ۱. اسکریپت اصلی ایران آنالیتیکس */}
          <Script
            id="iran-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer=window.dataLayer||[];
                function IRA(){dataLayer.push(arguments);}
                IRA('js',new Date());
                IRA('config','IRA-CNY5F0Z');
              `,
            }}
          />
          {/* ۲. اسکریپت تگ ایران آنالیتیکس */}
          <Script 
            src="https://c.iran-analytics.ir/iratag/js?id=IRA-CNY5F0Z" 
            strategy="afterInteractive" 
            async 
          />

          {/* ۳. اسکریپت گفتینو */}
          <Script
            id="goftino-widget"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(){var i="sYy11k",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g);}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1);}();`,
            }}
          />

          {/* ۱. پس‌زمینه زنده در لایه صفر */}
          <AmbientBackground />
          
          <Toaster
            position="bottom-center"
            containerClassName="mb-24 md:mb-6"
            toastOptions={{
              duration: 4000,
              className: "bg-[#0b1426]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.03)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              style: {
                background: 'transparent',
                color: '#fff',
                direction: 'rtl',
                padding: '12px 16px',
              },
              success: { 
                iconTheme: { primary: '#10b981', secondary: '#0b1426' },
                className: "bg-emerald-500/[0.08] backdrop-blur-2xl border border-emerald-500/[0.2] shadow-[0_10px_30px_rgba(16,185,129,0.15),inset_0_0_15px_rgba(16,185,129,0.05)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              },
              error: { 
                iconTheme: { primary: '#f43f5e', secondary: '#0b1426' },
                className: "bg-rose-500/[0.08] backdrop-blur-2xl border border-rose-500/[0.2] shadow-[0_10px_30px_rgba(244,63,94,0.15),inset_0_0_15px_rgba(244,63,94,0.05)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              },
            }}
          />

          {/* ۲. کانتینر اصلی سامانه با معماری ترانزیشن */}
          <div className="relative z-10 flex flex-col min-h-screen w-full">
            <Header initialData={headerData} />
            
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
            
            <Footer initialData={footerData} />
          </div>

        </DateSettingsProvider>
      </body>
    </html>
  );
}