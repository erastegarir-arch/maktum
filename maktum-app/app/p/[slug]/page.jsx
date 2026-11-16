// مسیر: app/p/[slug]/page.jsx

import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; 
import SingleProductTemplate from '../../components/frontend/SingleProductTemplate';
import { constructPageMetadata, SITE_URL, SITE_CONFIG, getAbsoluteUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const content = await getContentBySlug(slug, 'PRODUCED');

  if (!content) return { title: 'مکتوم | محتوا یافت نشد' };

  const title = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const seoTitle = content?.metaTitle || content?.seoTitle || title;
  const finalDesc = content?.metaDesc || content?.subtitle || `مشاهده و بارگیری مستند و محتوای تولیدی ${title}`;

  const metadata = constructPageMetadata({
    title: seoTitle,
    description: finalDesc,
    path: `/p/${slug}`,
    ogImage: content.coverDesktop || undefined,
    type: 'video.movie',
  });

  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

export default async function ProducedContentPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'PRODUCED');

  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  const currentUser = await getSessionUser(); 

  const videoTitle = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const videoUrl = `${SITE_URL}/p/${content.slug}`;
  const authorName = content.creators?.[0]?.name || SITE_CONFIG.name;
  
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${videoUrl}#video`,
    name: videoTitle,
    description: content.metaDesc || content.subtitle || videoTitle,
    thumbnailUrl: content.coverDesktop ? [getAbsoluteUrl(content.coverDesktop)] : [SITE_CONFIG.ogImageUrl],
    uploadDate: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    contentUrl: content.previewVideoUrl ? getAbsoluteUrl(content.previewVideoUrl) : videoUrl,
    embedUrl: videoUrl,
    publisher: { '@id': `${SITE_URL}/#organization` },
    creator: { '@type': 'Person', name: authorName },
  };

  if (content._count && content._count.favoritedBy > 0) {
    videoSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      bestRating: '5',
      ratingCount: String(content._count.favoritedBy),
    };
  }

  const safeVideoSchema = JSON.stringify(videoSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeVideoSchema }}
      />
      <SingleProductTemplate data={content} type="PRODUCED" currentUser={currentUser} />
    </>
  );
}