// مسیر: app/f/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export async function generateMetadata() {
  const settingsData = await getSetting('raw_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;

  const seoTitle = pageSettings?.seo?.title;
  const seoDesc = pageSettings?.seo?.description;

  return constructPageMetadata({
    title: seoTitle || 'پایگاه داده فوتیج و فیلم‌های خام ویدیویی',
    description: seoDesc || 'پایگاه داده جامع و باز مکتوم شامل هزاران فوتیج، راش مستند و ویدیوهای خام بدون حق نشر برای تدوین‌گران و مستندسازان.',
    path: '/f',
  });
}

export default async function RawMaterialsLayout({ children }) {
  const settingsData = await getSetting('raw_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;
  
  const seoTitle = pageSettings?.seo?.title || 'پایگاه داده فوتیج و راش‌های ویدیویی';
  const seoDesc = pageSettings?.seo?.description || 'پایگاه داده جامع ویدیوهای خام و راش‌های مستند مکتوم.';

  // معرفی این صفحه به عنوان یک کالکشن معتبر در گوگل
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: seoTitle,
    description: seoDesc,
    path: '/f',
    breadcrumbName: 'محتوای خام و فوتیج',
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