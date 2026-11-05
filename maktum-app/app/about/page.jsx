import { getSetting } from '@/app/actions/settings';
import AboutContent from '@/app/components/frontend/AboutContent';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function AboutPage() {
  let storedData = null;
  try {
    storedData = await getSetting('about_page_data');
  } catch (err) {
    console.error("Database read error:", err);
  }

  if (!storedData) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center pt-18 md:pt-25">
        <p className="text-gray-400 font-sans">
          اطلاعاتی یافت نشد. لطفاً در پنل تنظیمات درباره ما، اطلاعات را ذخیره کنید.
        </p>
      </main>
    );
  }

  let pageData = {};
  try {
    pageData = JSON.parse(storedData);
  } catch (e) {
    return <div className="text-white text-center py-20 pt-18 md:pt-25">خطا در پردازش اطلاعات</div>;
  }

  return <AboutContent pageData={pageData} />;
}