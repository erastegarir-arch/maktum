import SingleBlogTemplate from '@/app/components/frontend/SingleBlogTemplate';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth';
import { notFound } from 'next/navigation';
import { constructPageMetadata, SITE_URL, SITE_CONFIG, getAbsoluteUrl } from '@/lib/seo';

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

  const metadata = constructPageMetadata({
    title: seoTitle,
    description: finalDesc,
    path: `/blog/${slug}`,
    ogImage: content.coverDesktop || undefined,
    type: 'article',
  });

  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');

  const content = await getContentBySlug(slug, 'BLOG');

  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound(); 
  }

  const currentUser = await getSessionUser();

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
    image: content.coverDesktop ? [getAbsoluteUrl(content.coverDesktop)] : [SITE_CONFIG.ogImageUrl],
    datePublished: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: content.updatedAt ? new Date(content.updatedAt).toISOString() : new Date().toISOString(),
    author: { '@type': 'Person', name: authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  if (content._count && content._count.favoritedBy > 0) {
    articleSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '5',
      bestRating: '5',
      ratingCount: String(content._count.favoritedBy),
    };
  }

  const safeArticleSchema = JSON.stringify(articleSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeArticleSchema }}
      />
      <SingleBlogTemplate data={content} type="BLOG" currentUser={currentUser} />
    </>
  );
}