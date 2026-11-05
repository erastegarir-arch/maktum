/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // افزایش سقف آپلود فایل تا ۵۰۰ مگابایت
    },
  },
};

export default nextConfig;