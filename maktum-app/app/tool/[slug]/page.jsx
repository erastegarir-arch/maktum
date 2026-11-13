// مسیر: app/tool/[slug]/page.jsx

import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; 
import SingleProductTemplate from '@/app/components/frontend/SingleProductTemplate';
import { constructPageMetadata, SITE_URL, SITE_CONFIG } from '@/lib/seo'; // توابع سئو

// ۱. تولید متادیتای پیشرفته و متصل به شبکه‌های اجتماعی برای صفحه ابزار
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

  // استفاده از absolute برای اعمال دقیق نام انتخابی شما در مرورگر
  metadata.title = { absolute: `مکتوم | ${seoTitle}` };
  return metadata;
}

// ۲. رندر صفحه و تزریق اسکیمای ترکیبی ابزار
export default async function ToolContentPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'TOOL');

  // شرط امنیتی کامل‌شده
  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  // دریافت اطلاعات سشن کاربر
  const currentUser = await getSessionUser(); 

  // ۳. تولید اسکیمای SoftwareApplication و TechArticle برای درخشش ابزارها در گوگل
  const toolTitle = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const toolUrl = `${SITE_URL}/tool/${content.slug}`;
  const authorName = content.creators?.[0]?.name || SITE_CONFIG.name;
  
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'TechArticle'], // ترکیب هوشمندانه برای پوشش کامل سئو
    '@id': `${toolUrl}#tool`,
    name: toolTitle,
    headline: toolTitle, // مورد نیاز برای TechArticle
    description: content.metaDesc || content.subtitle || toolTitle,
    image: content.coverDesktop ? [`${SITE_URL}${content.coverDesktop}`] : [SITE_CONFIG.ogImageUrl],
    datePublished: content.publishedAt ? new Date(content.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: content.updatedAt ? new Date(content.updatedAt).toISOString() : new Date().toISOString(),
    applicationCategory: 'MultimediaApplication', // دسته‌بندی ابزار رسانه‌ای
    operatingSystem: 'All', // قابل استفاده برای همه
    author: { '@type': 'Person', name: authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  // تزریق پویا لایک‌ها (ریچ اسنیپت) برای نمایش ستاره در کاوش گوگل
  if (content._count && content._count.favoritedBy > 0) {
    toolSchema.aggregateRating = {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <SingleProductTemplate data={content} type="TOOL" currentUser={currentUser} />
    </>
  );
}