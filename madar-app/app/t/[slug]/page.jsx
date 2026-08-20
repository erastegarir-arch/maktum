// مسیر فایل: app/t/[slug]/page.jsx

import TaxonomyClientPage from '@/app/components/frontend/TaxonomyClientPage';
import { getTaxonomyBySlug, getContentsByTaxonomy } from '@/app/actions/taxonomies'; 

// ==========================================
// ۱. تولید متادیتای سئو (کاملاً داینامیک)
// ==========================================
export async function generateMetadata({ params }) {
  // در Next.js جدید params باید await شود
  const resolvedParams = await params;
  
  // تبدیل کدهای عجیب URL به کلمات شیرین فارسی!
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const taxonomy = await getTaxonomyBySlug(decodedSlug);

  if (!taxonomy) return {};

  return {
    title: taxonomy.name, 
    description: taxonomy.description || `آرشیو محتوای مرتبط با ${taxonomy.name}`,
  };
}

// ==========================================
// ۲. صفحه اصلی سرورساید
// ==========================================
export default async function TaxonomyServerPage({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  
  // حالا دیتابیس دقیقاً به دنبال "دکتر-علی-حسینی" می‌گردد
  const taxonomy = await getTaxonomyBySlug(decodedSlug);
  const relatedContents = await getContentsByTaxonomy(decodedSlug);

  if (!taxonomy) {
    return <div className="text-center py-20 text-white font-sans mt-20">صفحه مورد نظر یافت نشد.</div>;
  }

  return (
    <TaxonomyClientPage 
      taxonomy={taxonomy} 
      contents={relatedContents || []} 
    />
  );
}