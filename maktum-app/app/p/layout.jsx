// مسیر: app/p/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export async function generateMetadata() {
  const settingsData = await getSetting('produced_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;

  const seoTitle = pageSettings?.seo?.title;
  const seoDesc = pageSettings?.seo?.description;

  return constructPageMetadata({
    title: seoTitle || 'محتوای تولیدی، مستندها و مصاحبه‌ها',
    description: seoDesc || 'پایگاه داده مستندها، پادکست‌های تحلیلی و محتوای تولیدی شبکه مکتوم.',
    path: '/p',
  });
}

export default async function ProducedLayout({ children }) {
  const settingsData = await getSetting('produced_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;
  
  const seoTitle = pageSettings?.seo?.title || 'محتوای تولیدی، مستندها و مصاحبه‌ها';
  const seoDesc = pageSettings?.seo?.description || 'پایگاه داده مستندها، پادکست‌های تحلیلی و محتوای تولیدی شبکه مکتوم.';

  // معرفی صفحه پایگاه داده به عنوان یک کالکشن معتبر در گوگل
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: seoTitle,
    description: seoDesc,
    path: '/p',
    breadcrumbName: 'محتوای تولیدی',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}