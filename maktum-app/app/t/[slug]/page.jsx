import { notFound } from 'next/navigation';
import TaxonomyClientPage from '@/app/components/frontend/TaxonomyClientPage';
import { getTaxonomyBySlug, getContentsByTaxonomy } from '@/app/actions/taxonomies'; 
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const taxonomy = await getTaxonomyBySlug(decodedSlug);

  if (!taxonomy) return { title: 'مکتوم | یافت نشد' };

  const defaultTitle = taxonomy.preTitle ? `${taxonomy.preTitle} | ${taxonomy.name}` : taxonomy.name;
  const pageTitle = taxonomy.metaTitle || defaultTitle;
  const finalDesc = taxonomy.metaDesc || taxonomy.description || `پایگاه داده محتوای مرتبط با ${taxonomy.name}`;

  return constructPageMetadata({
    title: pageTitle, 
    description: finalDesc,
    path: `/t/${decodedSlug}`,
    ogImage: taxonomy.imageUrl || undefined,
  });
}

export default async function TaxonomyServerPage({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  
  const [taxonomy, relatedContents] = await Promise.all([
    getTaxonomyBySlug(decodedSlug),
    getContentsByTaxonomy(decodedSlug)
  ]);

  if (!taxonomy) {
    notFound();
  }

  let themeColor = '#06b6d4';
  if (taxonomy.type === 'CATEGORY') themeColor = '#10b981';
  else if (taxonomy.type === 'HASHTAG') themeColor = '#38bdf8';
  else if (taxonomy.type === 'CREATOR') themeColor = '#a855f7';

  const enhancedTaxonomy = {
    ...taxonomy,
    title: taxonomy.name,
  };

  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: taxonomy.metaTitle || enhancedTaxonomy.title,
    description: taxonomy.metaDesc || taxonomy.description || `پایگاه داده محتوای مرتبط با ${taxonomy.name}`,
    path: `/t/${decodedSlug}`,
    breadcrumbName: enhancedTaxonomy.title,
  });

  const safeSchemaJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSchemaJson }}
      />
      <TaxonomyClientPage 
        taxonomy={enhancedTaxonomy} 
        contents={relatedContents || []} 
        themeColor={themeColor} 
      />
    </>
  );
}