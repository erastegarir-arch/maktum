/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // افزایش سقف بارگذاری پرونده تا ۵۰۰ مگابایت
    },
  },
  
  // تنظیمات هدرهای امنیتی برای مقابله با جاسوسی و هک
  async headers() {
    return [
      {
        // این هدرها به تمام مسیرهای سامانه (/*) اعمال می‌شوند
        source: '/(.*)',
        headers: [
          {
            // جلوگیری از جاسازی سامانه مکتوم در iframe سامانه‌های دیگر (ضد Clickjacking)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // جلوگیری از تغییر خودکار نوع پرونده‌ها توسط مرورگر (MIME sniffing)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // فعال‌سازی گارد امنیتی مرورگر در برابر حملات XSS
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // سامانه فقط باید روی پروتکل امن (HTTPS) باز شود
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }
        ],
      },
    ];
  },
};

export default nextConfig;