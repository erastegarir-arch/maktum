import SingleBlogTemplate from '@/app/components/frontend/SingleBlogTemplate';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; // <-- اضافه شد
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }) {
  // ۱. دریافت اسلاگ از آدرس
  const resolvedParams = await params;
  // رمزگشایی و تبدیل به کلمه فارسی امن
  const slug = decodeURIComponent(resolvedParams?.slug || '');

  // ۲. دریافت اطلاعات مستقیم از دیتابیس
  const content = await getContentBySlug(slug, 'BLOG');

  // ۳. بررسی سالم بودن دیتا و وضعیت انتشار
  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound(); 
  }

  // ۴. دریافت اطلاعات سشن کاربر (اگر لاگین باشد)
  const currentUser = await getSessionUser(); // <-- اضافه شد

  // ۵. رندر صفحه با دیتا و وضعیت کاربر
  return <SingleBlogTemplate data={content} type="BLOG" currentUser={currentUser} />; // <-- پراپ اضافه شد
}