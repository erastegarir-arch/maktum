import Breadcrumbs from '@/app/components/Breadcrumbs';
import ProgressBar from '@/app/components/ProgressBar';
import RulesContent from '@/app/components/RulesContent';
import { getSetting } from '@/app/actions/settings';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function RulesPage() {
  let storedData = null;
  try {
    storedData = await getSetting('rules_page_data');
  } catch (error) {
    console.error("Database connection error:", error);
  }

  let pageData = {
    hero: {
      title: 'قوانین و مقررات',
      paragraphs: ['اطلاعات قوانین در حال بارگذاری است...'],
      enabled: true,
      showUpdateDate: false
    },
    rules: []
  };

  if (storedData) {
    try {
      pageData = JSON.parse(storedData);
    } catch (e) {
      console.error("JSON Parse error:", e);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      <ProgressBar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16 w-full relative z-10 pt-18 md:pt-25">
        <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'قوانین و مقررات' }]} />
        <RulesContent hero={pageData.hero} rules={pageData.rules || []} />
      </main>
    </div>
  );
}