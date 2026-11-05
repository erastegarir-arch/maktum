import { getAllDossiers, getHubSettings } from '@/app/actions/dossier'; // اطمینان از مسیر صحیح اکشن‌ها
import DossiersHubClientPage from './DossiersHubClientPage'; // فرض بر این است که فایل کلاینت در همین پوشه است

// ==========================================================
// ۱. تولید متادیتای داینامیک برای تب مرورگر و سئو
// ==========================================================
export async function generateMetadata() {
  // دریافت تنظیمات هاب برای تنظیم متادیتا (توسط Next.js به طور خودکار کش می‌شود تا سرعت افت نکند)
  const hubSettingsRes = await getHubSettings();
  const hubSettings = hubSettingsRes || {};

  // اولویت‌بندی عنوان: اول عنوان سئو (اگر تعریف شده بود)، بعد عنوان داخل صفحه، بعد مقدار پیش‌فرض
  const finalTitle = hubSettings.seoTitle || hubSettings.title || 'منظومه‌های محتوایی مکتوم';
  
  // قرار دادن دقیق متن زیر عنوان به عنوان توضیحات متای گوگل (Meta Description)
  const finalDescription = hubSettings.description || 'آرشیو جامع منظومه‌های محتوایی و پرونده‌های ویژه شبکه مکتوم';

  return {
    title: finalTitle,
    description: finalDescription,
  };
}

// ==============================================================
// ۲. سرور کامپوننت: دریافت اطلاعات هاب و ارسال به کلاینت کامپوننت
// ==============================================================
export default async function HubPage() {
  // فراخوانی همزمان تنظیمات هاب و لیست پرونده‌ها از دیتابیس
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