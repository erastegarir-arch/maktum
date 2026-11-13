import { getSetting } from '@/app/actions/settings';
import { generateStaticPageSchema } from '@/lib/seo';

export default async function CollaborateLayout({ children }) {
  // دریافت اطلاعات برای تزریق در گراف دانش گوگل (اسکیما)
  const seoTitle = await getSetting('collaborate_seo_title');
  const pageTitle = await getSetting('collaborate_title');
  
  const schema = generateStaticPageSchema({
    schemaType: 'ContactPage',
    title: seoTitle || pageTitle || 'همکاری با ما',
    description: 'درگاه رسمی ارتباط و همکاری با پلتفرم مکتوم.',
    path: '/collaborate',
    breadcrumbName: 'همکاری با ما',
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