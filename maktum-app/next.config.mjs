/** @type {import('next').NextConfig} */
const nextConfig = {
  // مخفی کردن نام فریم‌ورک Next.js از دید اسکنرهای هکرها
  poweredByHeader: false,
  // فعال‌سازی فشرده‌سازی خودکار پاسخ‌ها
  compress: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // افزایش سقف بارگذاری پرونده تا ۵۰۰ مگابایت
    },
  },
  
  // تنظیمات هدرهای امنیتی برای مقابله با جاسوسی و هک
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }
        ],
      },
    ];
  },
};

export default nextConfig;