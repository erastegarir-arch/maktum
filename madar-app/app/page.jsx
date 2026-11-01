import { getSetting } from '@/app/actions/settings';
import HomePageClient from './HomePageClient';

// این تابع مختص Next.js است و قبل از لود صفحه، تب مرورگر و سئو را می‌سازد
export async function generateMetadata() {
  try {
    // خواندن تنظیمات اختصاصی تب مرورگر از دیتابیس
    const seoDataRaw = await getSetting('home_seo_config');
    const seoData = seoDataRaw ? JSON.parse(seoDataRaw) : { metaTitle: 'شبکه مدار' };
    
    return {
      title: {
        // ویژگی absolute باعث می‌شود تمام پیش‌وندها و پس‌وندهای فایل layout (مثل " | مدار")
        // کاملاً باطل شوند و دقیقاً همان عنوانی که در پنل ادمین نوشتید در تب مرورگر بنشیند.
        absolute: seoData.metaTitle || 'شبکه مدار'
      }
    };
  } catch (error) {
    return {
      title: {
        absolute: 'شبکه مدار'
      }
    };
  }
}

// کامپوننت اصلی سرور که کلاینت را رندر می‌کند
export default function HomePage() {
  return <HomePageClient />;
}