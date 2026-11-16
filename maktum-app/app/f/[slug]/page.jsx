// مسیر: app/f/[slug]/page.jsx

import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; 
import SingleProductTemplate from '@/app/components/frontend/SingleProductTemplate';
import { constructPageMetadata, SITE_URL, SITE_CONFIG, getAbsoluteUrl } from '@/lib/seo';

// ۱. تولید متادیتای پیشرفته و متصل به شبکه‌های اجتماعی
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const content = await getContentBySlug(slug, 'RAW');

  if (!content) return { title: 'مکتوم | ویدیو یافت نشد' };

  const title = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const seoTitle = content?.metaTitle || content?.seoTitle || title;
  const finalDesc = content?.metaDesc || content?.subtitle || `بارگیری و مشاهده فوتیج و ویدیوی خام ${title}`;

  const metadata = constructPageMetadata({
    title: seoTitle,
    description: finalDesc,
    path: `/f/${slug}`,
    ogImage: content.coverDesktop || undefined,
    type: 'video.movie',
  });

  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

// ۲. رندر صفحه و تزریق اسکیمای VideoObject
export default async function FootageContentPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'RAW');

  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  const currentUser = await getSessionUser(); 

  // ۳. تولید اسکیمای VideoObject برای تسخیر تب ویدیو در نتایج گوگل
  const videoTitle = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const videoUrl = `${SITE_URL}/f/${content.slug}`;
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
      <SingleProductTemplate currentUser="{currentUser}" data="{content}" type="RAW"/>
    </>
  );
}