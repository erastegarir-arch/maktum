// مسیر: app/terms/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

// ۱. اعمال متادیتای سراسری و پویا برای صفحه قوانین
export async function generateMetadata() {
  const seoTitle = await getSetting('terms_seo_title'); 
  const pageTitle = await getSetting('terms_title'); 
  const seoDesc = await getSetting('terms_seo_description');

  const finalTitle = seoTitle || pageTitle || 'قوانین و مقررات';
  const finalDesc = seoDesc || 'شرایط و ضوابط بهره‌برداری غیرتجاری و رایگان از راش‌ها، فوتیج‌های خام و محتواهای پژوهشی منتشرشده در پلتفرم مکتوم.';

  return constructPageMetadata({
    title: finalTitle,
    description: finalDesc,
    path: '/terms',
  });
}

export default async function TermsLayout({ children }) {
  // ۲. دریافت اطلاعات برای تزریق در گراف دانش گوگل (اسکیما)
  const seoTitle = await getSetting('terms_seo_title');
  const pageTitle = await getSetting('terms_title');
  
  const schema = generateStaticPageSchema({
    schemaType: 'WebPage',
    title: seoTitle || pageTitle || 'قوانین و مقررات',
    description: 'شرایط و ضوابط استفاده از پایگاه داده رسانه‌ای مکتوم',
    path: '/terms',
    breadcrumbName: 'قوانین و مقررات',
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