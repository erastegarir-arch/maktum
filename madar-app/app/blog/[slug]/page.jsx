import SingleBlogTemplate from '@/app/components/frontend/SingleBlogTemplate';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth';
import { notFound } from 'next/navigation';

// ۱. تنظیم رسمی و مستقیم عنوان سئو و متا در سربرگ مرورگر
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');
  const content = await getContentBySlug(slug, 'BLOG');

  if (!content) {
    return { title: 'مدار | مطلب یافت نشد' };
  }

  const title = `${content?.titleBase || ''} ${content?.titleHighlight || ''}`.trim();
  const seoTitle = content?.metaTitle || content?.seoTitle || title;

  return {
    title: {
      absolute: `مدار | ${seoTitle}`, // استفاده از absolute مانع از تکرار نام مدار می‌شود و ساختار دقیق را اعمال می‌کند
    },
    description: content?.metaDesc || content?.subtitle || '',
  };
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

  return <SingleBlogTemplate data={content} type="BLOG" currentUser={currentUser} />;
}