// مسیر فایل: app/layout.jsx
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/app/components/frontend/Header';
import Footer from '@/app/components/frontend/Footer';
import { getSetting } from '@/app/actions/settings';
import { getIcons } from '@/app/actions/icons';
import AmbientBackground from '@/app/components/frontend/AmbientBackground';
import Script from 'next/script';

// تامین‌کننده تاریخ
import { DateSettingsProvider } from '@/app/components/providers/DateSettingsContext';

// ✅ کامپوننت جدید برای انیمیشن‌های روان بین صفحات
import PageTransitionProvider from '@/app/components/providers/PageTransitionProvider';

// ==========================================
// اعمال سراسری فاوآیکون و متا دیتا
// ==========================================
export async function generateMetadata() {
  const dynamicFavicon = await getSetting('favicon');
  
  return {
    title: {
      template: 'مکتوم | %s',
      default: 'مکتوم',
    },
    icons: {
      icon: dynamicFavicon || '/favicon.ico',
    }
  };
}

export default async function RootLayout({ children }) {
  // ۱. دریافت کل آیکون‌ها و تنظیمات روی سرور با پرامیس‌های همزمان
  const settingsKeys = [
    'header_icon', 'header_text', 'header_links',
    'footer_icon', 'footer_text', 'footer_desc', 'copyright_text', 'footer_fast_links', 'footer_companion_links', 'footer_social_links',
    'enamad_type', 'enamad_code', 'enamad_img', 'enamad_url',
    'samandehi_type', 'samandehi_code', 'samandehi_img', 'samandehi_url',
    'satra_type', 'satra_code', 'satra_img', 'satra_url'
  ];

  const settingsPromises = settingsKeys.map(key => getSetting(key));

  const [allIcons, ...settingsResults] = await Promise.all([
    getIcons(),
    ...settingsPromises
  ]);

  const settings = settingsKeys.reduce((acc, key, index) => {
    acc[key] = settingsResults[index];
    return acc;
  }, {});

  // تنظیمات هدر
  const headerLinksStr = settings['header_links'];
  const headerLinks = headerLinksStr ? JSON.parse(headerLinksStr) : [];

  // تنظیمات فوتر
  const fastStr = settings['footer_fast_links'];
  const fastLinks = fastStr ? JSON.parse(fastStr) : [];

  const compStr = settings['footer_companion_links'];
  const companionLinks = compStr ? JSON.parse(compStr) : [];

  const socStr = settings['footer_social_links'];
  const socialLinks = socStr ? JSON.parse(socStr) : [];

  const headerData = {
    headerIcon: settings['header_icon'] || '',
    headerText: settings['header_text'] || '',
    headerLinks,
    allIcons
  };

  const footerData = {
    footerIcon: settings['footer_icon'] || '',
    footerText: settings['footer_text'] || '',
    footerDesc: settings['footer_desc'] || 'شبکه رسانه‌ای مکتوم؛ پلتفرم مستقل آرشیو و تبادل دانش.',
    copyrightText: settings['copyright_text'] || 'تمامی حقوق برای شبکه رسانه‌ای مکتوم محفوظ است.',
    fastLinks,
    companionLinks,
    socialLinks,
    allIcons,
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

  return (
    <html lang="fa" dir="rtl">
      <body className="text-white min-h-screen flex flex-col antialiased relative selection:bg-cyan-500/30">
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
                IRA('config','IRA-11D9HQ7');
              `,
            }}
          />
          {/* ۲. اسکریپت تگ ایران آنالیتیکس */}
          <Script 
            src="https://t.iran-analytics.ir/iratag/js?id=IRA-11D9HQ7" 
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
              className: "bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              style: {
                background: 'transparent',
                color: '#fff',
                direction: 'rtl',
                padding: '12px 16px',
              },
              success: { 
                iconTheme: { primary: '#10b981', secondary: '#050810' },
                className: "bg-emerald-500/[0.05] backdrop-blur-2xl border border-emerald-500/[0.15] shadow-[0_10px_30px_rgba(16,185,129,0.1),inset_0_0_15px_rgba(16,185,129,0.05)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              },
              error: { 
                iconTheme: { primary: '#f43f5e', secondary: '#050810' },
                className: "bg-rose-500/[0.05] backdrop-blur-2xl border border-rose-500/[0.15] shadow-[0_10px_30px_rgba(244,63,94,0.1),inset_0_0_15px_rgba(244,63,94,0.05)] text-white text-[11px] md:text-sm font-sans rounded-2xl font-bold",
              },
            }}
          />

          {/* ۲. کانتینر اصلی سایت با معماری جدید برای ترانزیشن */}
          <div className="relative z-10 flex flex-col min-h-screen w-full">
            <Header initialData={headerData} />
            
            {/* 
               ✅ به جای <div> ساده، حالا از کامپوننت واسطی که ساختیم استفاده می‌کنیم.
               این کامپوننت با تغییر URL، صفحه قدیمی را محو و صفحه جدید را ظاهر می‌کند.
            */}
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