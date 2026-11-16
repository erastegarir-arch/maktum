// مسیر: app/tool/[slug]/page.jsx

import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; 
import SingleProductTemplate from '@/app/components/frontend/SingleProductTemplate';
import { constructPageMetadata, SITE_URL, SITE_CONFIG, getAbsoluteUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const content = await getContentBySlug(slug, 'TOOL');

  if (!content) return { title: 'مکتوم | ابزار یافت نشد' };

  const title = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const seoTitle = content?.metaTitle || content?.seoTitle || title;
  const finalDesc = content?.metaDesc || content?.subtitle || `معرفی و بارگیری ابزار کاربردی ${title}`;

  const metadata = constructPageMetadata({
    title: seoTitle,
    description: finalDesc,
    path: `/tool/${slug}`,
    ogImage: content.coverDesktop || undefined,
    type: 'article', 
  });

  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

export default async function ToolContentPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'TOOL');

  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  const currentUser = await getSessionUser(); 

  const toolTitle = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const toolUrl = `${SITE_URL}/tool/${content.slug}`;
  const authorName = content.creators?.[0]?.name || SITE_CONFIG.name;
  
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'TechArticle'],
    '@id': `${toolUrl}#tool`,
    name: toolTitle,
    headline: toolTitle,
    description: content.metaDesc || content.subtitle || toolTitle,
    image: content.coverDesktop ? [getAbsoluteUrl(content.coverDesktop)] : [SITE_CONFIG.ogImageUrl],
    datePublished: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: content.updatedAt ? new Date(content.updatedAt).toISOString() : new Date().toISOString(),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    author: { '@type': 'Person', name: authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  if (content._count && content._count.favoritedBy > 0) {
    toolSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      bestRating: '5',
      ratingCount: String(content._count.favoritedBy),
    };
  }

  const safeToolSchema = JSON.stringify(toolSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeToolSchema }}
      />
      <SingleProductTemplate data={content} type="TOOL" currentUser={currentUser} />
    </>
  );
}