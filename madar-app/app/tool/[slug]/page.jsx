import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/app/actions/content';
import { getSessionUser } from '@/app/actions/auth'; // <-- اضافه شد
import SingleProductTemplate from '@/app/components/frontend/SingleProductTemplate';

export default async function ToolContentPage({ params }) {
  // در نسخه‌های جدید Next.js پارامترها به صورت Promise هستند و باید await شوند
  const resolvedParams = await params;
  // تبدیل کدهای مرورگر به کلمات فارسی
  const slug = decodeURIComponent(resolvedParams.slug);

  const content = await getContentBySlug(slug, 'TOOL');

  // شرط امنیتی کامل‌شده
  if (!content || !content.id || content.status !== 'PUBLISHED') {
    notFound();
  }

  // دریافت اطلاعات سشن کاربر
  const currentUser = await getSessionUser(); // <-- اضافه شد

  return <SingleProductTemplate data={content} type="TOOL" currentUser={currentUser} />; // <-- پراپ اضافه شد
}