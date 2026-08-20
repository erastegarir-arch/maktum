import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/app/components/frontend/Header';
import Footer from '@/app/components/frontend/Footer';
import { getSetting } from '@/app/actions/settings';
import { getIcons } from '@/app/actions/icons';

// ✅ گام جدید و بنیادین: Import سیستم ContextProvider سراسری (تأمین‌کننده تنظیمات تاریخ ضد-Bilid)
import { DateSettingsProvider } from '@/app/components/providers/DateSettingsContext';

// ==========================================
// ✅ اضافه شدن این بخش برای حل مشکل ۴ (اعمال سراسری فاوآیکون)
// ==========================================
export async function generateMetadata() {
  const dynamicFavicon = await getSetting('favicon');
  
  return {
    title: {
      template: 'مدار | %s', // %s با عنوان هر صفحه جایگزین می‌شود
      default: 'مدار', // عنوان پیش‌فرض برای صفحه اصلی سایت
    },
      icons: {
      icon: dynamicFavicon || '/favicon.ico', // خواندن از دیتابیس یا مقدار پیش‌فرض
    }
  };
}

export default async function RootLayout({ children }) {
  // ۱. دریافت کل آیکون‌ها و تنظیمات روی سرور (بدون هیچ تاخیری برای کاربر)
  // ✅ گام جدید و بهینه‌سازی: درخواست‌ها همزمان (Promise.all) شدند تا Bilid پروژه روی سرور سریع‌تر شود.
  
  // تعریف کلیدهای تنظیماتی که نیاز داریم
  const settingsKeys = [
    'header_icon', 'header_text', 'header_links',
    'footer_icon', 'footer_text', 'footer_desc', 'copyright_text', 'footer_fast_links', 'footer_companion_links', 'footer_social_links',
    'enamad_type', 'enamad_code', 'enamad_img', 'enamad_url',
    'samandehi_type', 'samandehi_code', 'samandehi_img', 'samandehi_url',
    'satra_type', 'satra_code', 'satra_img', 'satra_url'
  ];

  // ایجاد یک لیسیت از پرامیس‌ها برای اجرای همزمان درخواست‌ها
  const settingsPromises = settingsKeys.map(key => getSetting(key));

  // ✅ گام جدید و بهینه‌سازی: اجرای همزمان کل درخواست‌ها و دریافت آیکون‌ها
  const [allIcons, ...settingsResults] = await Promise.all([
    getIcons(),
    ...settingsPromises
  ]);

  // ✅ گام جدید و بهینه‌سازی: نگاشت نتایج درخواست‌ها به یک شیء تنظیمات برای استفاده راحت‌تر
  const settings = settingsKeys.reduce((acc, key, index) => {
    acc[key] = settingsResults[index];
    return acc;
  }, {});

  // تنظیمات هدر (پاکسازی و بهینه‌سازی)
  const headerLinksStr = settings['header_links'];
  const headerLinks = headerLinksStr ? JSON.parse(headerLinksStr) : [];

  // تنظیمات فوتر (پاکسازی و بهینه‌سازی)
  const fastStr = settings['footer_fast_links'];
  const fastLinks = fastStr ? JSON.parse(fastStr) : [];

  const compStr = settings['footer_companion_links'];
  const companionLinks = compStr ? JSON.parse(compStr) : [];

  const socStr = settings['footer_social_links'];
  const socialLinks = socStr ? JSON.parse(socStr) : [];

  // بسته‌بندی داده‌ها برای فرستادن به هدر و فوتر (بدون تغییر در ساختار داده‌ها)
  const headerData = {
    headerIcon: settings['header_icon'] || '',
    headerText: settings['header_text'] || '',
    headerLinks,
    allIcons
  };

  const footerData = {
    footerIcon: settings['footer_icon'] || '',
    footerText: settings['footer_text'] || '',
    footerDesc: settings['footer_desc'] || 'شبکه رسانه‌ای مدار؛ پلتفرم مستقل آرشیو و تبادل دانش.',
    copyrightText: settings['copyright_text'] || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.',
    fastLinks,
    companionLinks,
    socialLinks,
    allIcons,
    // نمادها (بهینه‌سازی)
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
      <body className="bg-[#080c16] text-white min-h-screen flex flex-col antialiased">
        {/* ✅ بنیادین: سیستم Provider سراسری کلاینت‌ساید برای مدیریت تاریخ و تنظیمات سراسری ضد-Bilid */}
        {/* اینProvider کل اپلیکیشن (Header، children و Footer) را در بر می‌گیرد. */}
        <DateSettingsProvider>
          {/* سیستم پیام‌های شناور توست در کل پروژه (بدون تغییر) */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0b0f19',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                direction: 'rtl',
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#0b0f19' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0b0f19' },
              },
            }}
          />

          <Header initialData={headerData} />
          {children}
          <Footer initialData={footerData} />
        </DateSettingsProvider>
      </body>
    </html>
  );
}