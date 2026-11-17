// مسیر پرونده: app/manifest.js
import { SITE_CONFIG } from '@/lib/seo';

export default function manifest() {
  return {
    id: '/?source=pwa',
    name: SITE_CONFIG?.name || 'پایگاه مکتوم',
    short_name: 'مکتوم',
    description:
      SITE_CONFIG?.description ||
      'سامانه جامع آرشیو، مستندات و رسانه‌های مکتوم',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay', 'minimal-ui'],
    orientation: 'portrait-primary',
    background_color: '#050810',
    theme_color: SITE_CONFIG?.themeColor || '#050810',
    dir: 'rtl',
    lang: 'fa-IR',
    categories: ['media', 'books', 'education', 'news'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48 32x32 16x16',
        type: 'image/x-icon',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'صفحه اصلی مکتوم',
        short_name: 'صفحه اصلی',
        description: 'ورود مستقیم به صفحه اول پایگاه مکتوم',
        url: '/?utm_source=pwa_shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}