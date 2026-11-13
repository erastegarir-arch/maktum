import { SITE_CONFIG } from '@/lib/seo';

export default function manifest() {
  return {
    id: '/',
    name: SITE_CONFIG?.name || 'پایگاه مکتوم',
    short_name: 'مکتوم',
    description: SITE_CONFIG?.description || 'سامانه جامع آرشیو، مستندات و رسانه‌های مکتوم',
    start_url: '/',
    scope: '/',
    display: 'standalone', // اجرای سامانه به شکل اپلیکیشن مستقل و بدون نوار آدرس مرورگر
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait-primary', // بهینه‌سازی چرخش صفحه در تلفن‌های همراه
    background_color: '#050810',
    theme_color: SITE_CONFIG?.themeColor || '#050810',
    dir: 'rtl',
    lang: 'fa-IR',
    categories: ['media', 'books', 'education'],
    prefer_related_applications: false, // جلوگیری از نمایش بنرهای مزاحم نصبی و اولویت دادن به نسخه وب
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48 32x32 16x16',
        type: 'image/x-icon',
      },
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any', // نمایش استاندارد در دسکتاپ و iOS بدون برش حاشیه‌ها
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // سازگاری کامل با آیکون‌های تطبیقی (Adaptive Icons) در اندروید
      },
    ],
  };
}