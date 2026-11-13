// مسیر: app/f/[slug]/page.jsx

import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; 
import SingleProductTemplate from '@/app/components/frontend/SingleProductTemplate';
import { constructPageMetadata, SITE_URL, SITE_CONFIG } from '@/lib/seo'; // توابع سئو

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
    type: 'video.movie', // نوع محتوا برای فیسبوک و تلگرام ویدیو در نظر گرفته می‌شود
  });

  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

// ۲. رندر صفحه و تزریق اسکیمای VideoObject
export default async function FootageContentPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'RAW');

  // شرط امنیتی کامل‌شده
  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  // دریافت اطلاعات سشن کاربر
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
    thumbnailUrl: content.coverDesktop ? [`${SITE_URL}${content.coverDesktop}`] : [SITE_CONFIG.ogImageUrl],
    uploadDate: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    contentUrl: videoUrl, // چون نشانی مستقیم MP4 را در اسکیما نمی‌دهیم، خود صفحه را مرجع می‌کنیم
    embedUrl: videoUrl,
    publisher: { '@id': `${SITE_URL}/#organization` },
    creator: { '@type': 'Person', name: authorName },
  };

  // تزریق پویا لایک‌ها (ریچ اسنیپت) برای نمایش ستاره در کاوش گوگل
  if (content._count && content._count.favoritedBy > 0) {
    videoSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      bestRating: '5',
      ratingCount: String(content._count.favoritedBy),
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <SingleProductTemplate data={content} type="RAW" currentUser={currentUser} />
    </>
  );
}