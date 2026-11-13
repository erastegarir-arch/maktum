import { getAllDossiers, getHubSettings } from '@/app/actions/dossier'; 
import DossiersHubClientPage from './DossiersHubClientPage'; 
import { constructPageMetadata } from '@/lib/seo'; // اتصال به موتور مرکزی سئو

// ==========================================================
// ۱. تولید متادیتای پویا و تگ‌های OpenGraph (سئو حرفه‌ای)
// ==========================================
export async function generateMetadata() {
  const hubSettingsRes = await getHubSettings();
  const hubSettings = hubSettingsRes || {};

  const finalTitle = hubSettings.seoTitle || hubSettings.title || 'منظومه‌های محتوایی مکتوم';
  const finalDescription = hubSettings.description || 'پایگاه داده جامع منظومه‌های محتوایی و پرونده‌های ویژه شبکه مکتوم';

  return constructPageMetadata({
    title: finalTitle,
    description: finalDescription,
    path: '/c',
    ogImage: hubSettings.bgDesktop || undefined,
  });
}

// ==============================================================
// ۲. سرور کامپوننت: دریافت اطلاعات هاب و ارسال به کلاینت کامپوننت
// ==============================================================
export default async function HubPage() {
  // فراخوانی همزمان تنظیمات هاب و فهرست پرونده‌ها از پایگاه داده
  const [hubSettingsRes, dossiersRes] = await Promise.all([
    getHubSettings(),
    getAllDossiers()
  ]);

  // اگر دریافت پرونده‌ها موفقیت‌آمیز بود، دیتا را قرار می‌دهیم، در غیر این صورت آرایه خالی
  const dossiers = dossiersRes?.success ? dossiersRes.data : [];
  
  // تنظیمات هاب (اگر وجود نداشته باشد یک آبجکت خالی می‌فرستیم تا ارور ندهد)
  const hubSettings = hubSettingsRes || {};

  return (
    <DossiersHubClientPage 
      hubSettings={hubSettings} 
      dossiers={dossiers} 
    />
  );
}