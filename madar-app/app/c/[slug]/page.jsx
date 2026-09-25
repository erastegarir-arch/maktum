import { getDossierBySlug } from '@/app/actions/dossier'; 
import DossierDetailClientPage from './DossierDetailClientPage'; 

export default async function DossierPage(props) {
  // باز کردن ایمن پارامترها در Next.js 15
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) {
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center text-white font-sans text-center">
        <h2 className="text-rose-500 font-bold text-2xl">خطا: لینک پرونده یافت نشد!</h2>
      </div>
    );
  }

  // دریافت اطلاعات از دیتابیس
  const response = await getDossierBySlug(slug);

  // سیستم مدیریت خطای ۴۰۴ برای زمانی که پرونده در دیتابیس نیست
  if (!response || !response.success || !response.data) {
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center text-white font-sans text-center p-6" dir="rtl">
        <h1 className="text-4xl font-black text-rose-500 mb-4">خطای ۴۰۴</h1>
        <p className="text-xl text-gray-300 mb-2">پرونده‌ای با این آدرس پیدا نشد!</p>
      </div>
    );
  }

  // رندر موفقیت‌آمیز صفحه داخلی منظومه
  return <DossierDetailClientPage dossier={response.data} />;
}