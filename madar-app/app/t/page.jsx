// مسیر فایل: app/t/page.jsx
import { Suspense } from 'react';
import ArchivesClientPage from '@/app/components/frontend/ArchivesClientPage';
import { getAllTaxonomiesForArchive } from '@/app/actions/taxonomies';
import { prisma } from '@/lib/prisma'; // اضافه شدن اتصال به دیتابیس

// ==========================================
// ۱. تابع کمکی برای خواندن تنظیمات از دیتابیس
// ==========================================
async function getArchivePageSettings() {
  try {
    // خواندن مقادیر کلیدهای مربوط به این صفحه از جدول Settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['archive_badge', 'archive_title', 'archive_desc', 'archive_highlight']
        }
      }
    });

    // تبدیل مقادیر دریافت‌شده به یک آبجکت ساختاریافته
    const mapped = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      badge: mapped['archive_badge'] || "بایگانی مرجع مدار",
      title: mapped['archive_title'] || "کاوش در بایگانی مدار",
      highlightColor: mapped['archive_highlight'] || "text-[#3b82f6]",
      description: mapped['archive_desc'] || "جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
    };
  } catch (error) {
    // بازگرداندن مقادیر پیش‌فرض در صورت قطع ارتباط با دیتابیس
    return {
      badge: "بایگانی مرجع مدار",
      title: "کاوش در بایگانی مدار",
      highlightColor: "text-[#3b82f6]",
      description: "جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
    };
  }
}

// ==========================================
// ۲. تولید متادیتای سئو (اتوماتیک از دیتابیس)
// ==========================================
export async function generateMetadata() {
  const pageSettings = await getArchivePageSettings();
  return {
    title: pageSettings.title,
    description: pageSettings.description,
  };
}

// ==========================================
// ۳. کامپوننت اصلی سرور
// ==========================================
export default async function ArchiveIndexServerPage() {
  // الف) دریافت تنظیمات متنی صفحه از دیتابیس (جایگزین مقادیر هاردکد شده)
  const pageSettings = await getArchivePageSettings();
  
  // ب) دریافت تمامی دیتاهای ۳ گروه همراه با تعداد محتوایشان
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