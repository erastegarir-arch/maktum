import { getSetting } from '@/app/actions/settings';
import CollaborationContent from '../components/frontend/CollaborationContent';
import { constructPageMetadata } from '@/lib/seo';
import ProgressBar from '@/app/components/ProgressBar';

export const revalidate = 60;

export async function generateMetadata() {
  const [seoTitle, pageTitle, seoDesc] = await Promise.all([
    getSetting('collaborate_seo_title'),
    getSetting('collaborate_title'),
    getSetting('collaborate_seo_desc'),
  ]);

  return constructPageMetadata({
    title: seoTitle || pageTitle || 'همکاری با ما',
    description: seoDesc || 'دعوت به همکاری با مستندسازان، پژوهشگران، تدوین‌گران و تولیدکنندگان محتوا در پلتفرم باز مکتوم جهت گسترش پایگاه داده رسانه‌ای.',
    path: '/collaborate',
  });
}

export default async function CollaborationPage() {
  const storedData = await getSetting('collaboration_page_data');

  if (!storedData) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 font-sans">
          اطلاعاتی یافت نشد. لطفاً در درگاه تنظیمات همکاری با ما، اطلاعات را یک‌بار ذخیره کنید.
        </p>
      </main>
    );
  }

  let pageData = {};
  try {
    pageData = JSON.parse(storedData);
  } catch (e) {
    return <div className="text-white text-center py-20">خطا در پردازش اطلاعات از پایگاه داده</div>;
  }

  return (
    <>
      <ProgressBar />
      <CollaborationContent pageData={pageData} />
    </>
  );
}