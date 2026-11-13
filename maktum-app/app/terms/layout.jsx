// مسیر: app/terms/layout.jsx
import { getSetting } from '@/app/actions/settings';
import { generateStaticPageSchema } from '@/lib/seo';

export default async function TermsLayout({ children }) {
  // دریافت اطلاعات برای تزریق در گراف دانش گوگل (اسکیما)
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