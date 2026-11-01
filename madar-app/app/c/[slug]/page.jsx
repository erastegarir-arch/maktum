// مسیر: app/c/[slug]/page.jsx

import { getDossierBySlug } from '@/app/actions/dossier'; 
import DossierDetailClientPage from './DossierDetailClientPage'; 
import { notFound } from 'next/navigation';

// ==========================================================
// ۱. تولید متادیتای داینامیک اختصاصی برای هر پرونده
// ==========================================================
export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) return { title: 'یافت نشد' };

  // دریافت اطلاعات همان پرونده از دیتابیس
  const response = await getDossierBySlug(slug);

  if (!response || !response.success || !response.data) {
    return { title: 'یافت نشد' };
  }

  const data = response.data;

  return {
    // عنوان و توضیحات متا دقیقاً برابر با مقادیر داخل صفحه تنظیم می‌شوند
    title: data.seoTitle || data.title,
    description: data.description || '',
  };
}

// ==========================================================
// ۲. کامپوننت اصلی صفحه (کدهای قبلی شما)
// ==========================================================
export default async function DossierPage(props) {
  const params = await props.params;
  const slug = params?.slug || (params ? Object.values(params)[0] : null);

  if (!slug) {
    notFound();
  }

  const response = await getDossierBySlug(slug);

  if (!response || !response.success || !response.data) {
    notFound();
  }

  return <DossierDetailClientPage dossier={response.data} />;
}