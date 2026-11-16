// مسیر پرونده: app/t/page.jsx
import { Suspense } from 'react';
import ArchivesClientPage from '@/app/components/frontend/ArchivesClientPage';
import { getAllTaxonomiesForArchive } from '@/app/actions/taxonomies';
import { prisma } from '@/lib/prisma';
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

async function getArchivePageSettings() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['archive_badge', 'archive_title', 'archive_desc', 'archive_highlight']
        }
      }
    });

    const mapped = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      badge: mapped['archive_badge'] || "بایگانی مرجع مکتوم",
      title: mapped['archive_title'] || "کاوش در بایگانی مکتوم",
      highlightColor: mapped['archive_highlight'] || "text-[#3b82f6]",
      description: mapped['archive_desc'] || "کاوش در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
    };
  } catch (error) {
    return {
      badge: "بایگانی مرجع مکتوم",
      title: "کاوش در بایگانی مکتوم",
      highlightColor: "text-[#3b82f6]",
      description: "کاوش در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
    };
  }
}

export async function generateMetadata() {
  const pageSettings = await getArchivePageSettings();
  
  return constructPageMetadata({
    title: pageSettings.title || 'کاوش در بایگانی مکتوم',
    description: pageSettings.description,
    path: '/t',
  });
}

export default async function ArchiveIndexServerPage() {
  const [pageSettings, data] = await Promise.all([
    getArchivePageSettings(),
    getAllTaxonomiesForArchive()
  ]);

  return (
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