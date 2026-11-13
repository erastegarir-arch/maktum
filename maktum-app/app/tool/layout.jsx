// مسیر: app/tool/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export async function generateMetadata() {
  const settingsData = await getSetting('tool_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;

  const seoTitle = pageSettings?.seo?.title;
  const seoDesc = pageSettings?.seo?.description;

  return constructPageMetadata({
    title: seoTitle || 'ابزارهای کاربردی و رسانه‌ای',
    description: seoDesc || 'مجموعه نرم‌افزارها، گراف‌های ارتباطی و ابزارهای هوش مصنوعی در پلتفرم مکتوم.',
    path: '/tool',
  });
}

export default async function ToolLayout({ children }) {
  const settingsData = await getSetting('tool_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;
  
  const seoTitle = pageSettings?.seo?.title || 'ابزارهای کاربردی و رسانه‌ای';
  const seoDesc = pageSettings?.seo?.description || 'مجموعه ابزارهای رسانه‌ای و گراف‌های ارتباطی مکتوم.';

  // معرفی صفحه پایگاه داده ابزارها به عنوان یک CollectionPage به گوگل
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: seoTitle,
    description: seoDesc,
    path: '/tool',
    breadcrumbName: 'ابزارهای کاربردی',
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