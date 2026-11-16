// مسیر: app/c/[slug]/page.jsx

import { getDossierBySlug } from '@/app/actions/dossier'; 
import DossierDetailClientPage from './DossierDetailClientPage'; 
import { notFound } from 'next/navigation';
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) return { title: 'مکتوم | یافت نشد' };

  const response = await getDossierBySlug(slug);

  if (!response || !response.success || !response.data) {
    return { title: 'مکتوم | یافت نشد' };
  }

  const data = response.data;
  const pageTitle = data.metaTitle || data.seoTitle || data.title;
  const finalDesc = data.metaDesc || data.description || `مشاهده جزئیات، مقالات و ویدیوهای مرتبط با پرونده ویژه ${data.title}`;

  return constructPageMetadata({
    title: pageTitle,
    description: finalDesc,
    path: `/c/${decodeURIComponent(slug)}`,
    ogImage: data.coverDesktop || undefined,
  });
}

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
  const pageTitle = data.metaTitle || data.seoTitle || data.title;
  const finalDesc = data.metaDesc || data.description || `مشاهده جزئیات، مقالات و ویدیوهای مرتبط با پرونده ویژه ${data.title}`;

  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: pageTitle,
    description: finalDesc,
    path: `/c/${decodeURIComponent(slug)}`,
    breadcrumbName: data.title,
  });

  const safeSchemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSchemaJson }}
      />
      <DossierDetailClientPage dossier={data} />
    </>
  );
}