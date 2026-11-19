// مسیر: app/blog/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export async function generateMetadata() {
  const settingsData = await getSetting('blog_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;

  const seoTitle = pageSettings?.seo?.title;
  const seoDesc = pageSettings?.seo?.description;

  return constructPageMetadata({
    title: seoTitle || 'مقالات، یادداشت‌ها و پژوهش‌ها',
    description: seoDesc || 'یادداشت‌های پژوهشگران، تحلیل‌های اختصاصی و اخبار شبکه مکتوم.',
    path: '/blog',
  });
}

export default async function BlogLayout({ children }) {
  const settingsData = await getSetting('blog_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;
  
  const seoTitle = pageSettings?.seo?.title || 'مقالات، یادداشت‌ها و پژوهش‌ها';
  const seoDesc = pageSettings?.seo?.description || 'یادداشت‌های پژوهشگران، تحلیل‌های اختصاصی و اخبار شبکه مکتوم.';

  // معرفی صفحه پایگاه داده مقالات به عنوان یک CollectionPage در گوگل
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: seoTitle,
    description: seoDesc,
    path: '/blog',
    breadcrumbName: 'تارنگار',
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