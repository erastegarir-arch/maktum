// مسیر فایل: app/t/page.jsx
import { Suspense } from 'react';
import ArchivesClientPage from '@/app/components/frontend/ArchivesClientPage';
import { getAllTaxonomiesForArchive } from '@/app/actions/taxonomies';

// تنظیمات متن هدر صفحه (در آینده می‌توانید این را از دیتابیسِ تنظیمات سایت بخوانید)
const pageSettings = {
  badge: "بایگانی مرجع مدار",
  title: "کاوش در بایگانی مدار",
  highlightColor: "text-[#3b82f6]",
  description: "جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
};

// ==========================================
// ۱. تولید متادیتای سئو (اتوماتیک از روی متن هدر)
// ==========================================
export async function generateMetadata() {
  return {
    title: `${pageSettings.title} | ${pageSettings.badge}`,
    description: pageSettings.description,
  };
}

// ==========================================
// ۲. کامپوننت اصلی سرور
// ==========================================
export default async function ArchiveIndexServerPage() {
  // دریافت تمامی دیتاهای ۳ گروه همراه با تعداد محتوایشان
  const data = await getAllTaxonomiesForArchive();

  return (
    // Suspense برای مدیریت استفاده از useSearchParams در کامپوننت کلاینت الزامی است
    <Suspense fallback={<div className="min-h-screen bg-[#05080f] flex items-center justify-center"><p className="text-gray-500 font-sans">در حال بارگذاری...</p></div>}>
      <ArchivesClientPage 
        pageContent={{ hero: pageSettings }}
        hashtags={data.hashtags}
        categories={data.categories}
        creators={data.creators}
      />
    </Suspense>
  );
}