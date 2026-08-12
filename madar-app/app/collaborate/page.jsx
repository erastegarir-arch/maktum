import { getSetting } from '@/app/actions/settings';
import CollaborationContent from '../components/CollaborationContent';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function CollaborationPage() {
  const storedData = await getSetting('collaboration_page_data');

  if (!storedData) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 font-sans">
          اطلاعاتی یافت نشد. لطفاً در پنل تنظیمات همکاری با ما، اطلاعات را یک‌بار ذخیره کنید.
        </p>
      </main>
    );
  }

  let pageData = {};
  try {
    pageData = JSON.parse(storedData);
  } catch (e) {
    return <div className="text-white text-center py-20">خطا در پردازش اطلاعات از دیتابیس</div>;
  }

  return <CollaborationContent pageData={pageData} />;
}