import { getAllDossiers, getHubSettings } from '@/app/actions/dossier'; // اطمینان از مسیر صحیح اکشن‌ها
import DossiersHubClientPage from './DossiersHubClientPage'; // فرض بر این است که فایل کلاینت در همین پوشه است

// ==============================================================
// سرور کامپوننت: دریافت اطلاعات هاب و ارسال به کلاینت کامپوننت
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