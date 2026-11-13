import SingleBlogTemplate from '@/app/components/frontend/SingleBlogTemplate';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth';
import { notFound } from 'next/navigation';
import { constructPageMetadata, SITE_URL, SITE_CONFIG } from '@/lib/seo'; // توابع سئو

// ۱. تنظیم رسمی و مستقیم عنوان سئو و متا در سربرگ مرورگر
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');
  const content = await getContentBySlug(slug, 'BLOG');

  if (!content) {
    return { title: 'مکتوم | مطلب یافت نشد' };
  }

  const title = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const seoTitle = content?.metaTitle || content?.seoTitle || title;
  const finalDesc = content?.metaDesc || content?.subtitle || '';

  // استفاده از متد قدرتمند constructPageMetadata برای تولید تمام تگ‌های شبکه‌های اجتماعی
  const metadata = constructPageMetadata({
    title: seoTitle,
    description: finalDesc,
    path: `/blog/${slug}`,
    ogImage: content.coverDesktop || undefined,
    type: 'article',
  });

  // حفظ اولویت شما برای absolute بودن title در صفحه مقاله
  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

// ۲. رندر صفحه اصلی
export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');

  const content = await getContentBySlug(slug, 'BLOG');

  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound(); 
  }

  const currentUser = await getSessionUser();

  // ۳. تولید اسکیمای فوق‌پیشرفته Article برای شکار پوزیشن صفر گوگل
  const articleTitle = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const articleUrl = `${SITE_URL}/blog/${content.slug}`;
  const authorName = content.creators?.[0]?.name || SITE_CONFIG.name;
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    headline: articleTitle,
    description: content.metaDesc || content.subtitle || '',
    image: content.coverDesktop ? [`${SITE_URL}${content.coverDesktop}`] : [SITE_CONFIG.ogImageUrl],
    datePublished: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: content.updatedAt ? new Date(content.updatedAt).toISOString() : new Date().toISOString(),
    author: { '@type': 'Person', name: authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  // تزریق پویا لایک‌های واقعی کاربران برای نمایش ستاره در نتایج کاوش گوگل (Rich Snippet)
  if (content._count && content._count.favoritedBy > 0) {
    articleSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5', // فرض بر رضایت کامل کاربرانی که لایک کرده‌اند
      bestRating: '5',
      ratingCount: String(content._count.favoritedBy),
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SingleBlogTemplate data={content} type="BLOG" currentUser={currentUser} />
    </>
  );
}