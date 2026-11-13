// مسیر: app/c/[slug]/page.jsx

import { getDossierBySlug } from '@/app/actions/dossier'; 
import DossierDetailClientPage from './DossierDetailClientPage'; 
import { notFound } from 'next/navigation';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo'; // توابع سئو

// ==========================================================
// ۱. تولید متادیتای پیشرفته و متصل به شبکه‌های اجتماعی برای هر پرونده
// ==========================================================
export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) return { title: 'مکتوم | یافت نشد' };

  const response = await getDossierBySlug(slug);

  if (!response || !response.success || !response.data) {
    return { title: 'مکتوم | یافت نشد' };
  }

  const data = response.data;
  const pageTitle = data.seoTitle || data.title;
  const finalDesc = data.description || `مشاهده جزئیات، مقالات و ویدیوهای مرتبط با پرونده ویژه ${data.title}`;

  return constructPageMetadata({
    title: pageTitle,
    description: finalDesc,
    path: `/c/${slug}`,
    ogImage: data.coverDesktop || undefined,
  });
}

// ==========================================================
// ۲. کامپوننت اصلی صفحه (کدهای قبلی شما)
// ==========================================================
export default async function DossierPage(props) {
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) {
    notFound();
  }

  const response = await getDossierBySlug(slug);

  if (!response || !response.success || !response.data) {
    notFound();
  }

  const data = response.data;
  const pageTitle = data.seoTitle || data.title;
  const finalDesc = data.description || `مشاهده جزئیات، مقالات و ویدیوهای مرتبط با پرونده ویژه ${data.title}`;

  // تولید اسکیمای پویا برای هر پرونده (منظومه)
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: pageTitle,
    description: finalDesc,
    path: `/c/${slug}`,
    breadcrumbName: data.title,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <DossierDetailClientPage dossier={data} />
    </>
  );
}