import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; // <-- اضافه شد
import SingleProductTemplate from '../../components/frontend/SingleProductTemplate';

export default async function ProducedContentPage({ params }) {
  // منتظر ماندن برای دریافت اسلاگ در نسخه‌های جدید Next.js
  const resolvedParams = await params;
  // تبدیل کدهای مرورگر به کلمات فارسی
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'PRODUCED');

  // شرط امنیتی کامل‌شده
  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  // دریافت اطلاعات سشن کاربر
  const currentUser = await getSessionUser(); // <-- اضافه شد

  return <SingleProductTemplate data={content} type="PRODUCED" currentUser={currentUser} />; // <-- پراپ اضافه شد
}