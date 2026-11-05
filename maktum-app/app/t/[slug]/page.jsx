import TaxonomyClientPage from '@/app/components/frontend/TaxonomyClientPage';
import { getTaxonomyBySlug, getContentsByTaxonomy } from '@/app/actions/taxonomies'; 

// ==========================================
// ۱. تولید متادیتای سئو (کاملاً داینامیک)
// ==========================================
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const taxonomy = await getTaxonomyBySlug(decodedSlug);

  if (!taxonomy) return {};

  // ایجاد عنوان یکپارچه برای سئو (استفاده از name)
  const pageTitle = taxonomy.preTitle ? `${taxonomy.preTitle} | ${taxonomy.name}` : taxonomy.name;

  return {
    title: pageTitle, 
    description: taxonomy.description || `آرشیو محتوای مرتبط با ${taxonomy.name}`,
  };
}

// ==========================================
// ۲. صفحه اصلی سرورساید
// ==========================================
export default async function TaxonomyServerPage({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  
  const taxonomy = await getTaxonomyBySlug(decodedSlug);
  const relatedContents = await getContentsByTaxonomy(decodedSlug);

  if (!taxonomy) {
    return <div className="text-center py-20 text-white font-sans mt-20 select-none">صفحه مورد نظر یافت نشد.</div>;
  }

  // استخراج تم رنگی متناسب با نوع بایگانی برای استفاده در AmbientBackground
  let themeColor = '#06b6d4'; // فیروزه‌ای پیش‌فرض
  if (taxonomy.type === 'CATEGORY') themeColor = '#10b981'; // سبز (دسته‌بندی)
  else if (taxonomy.type === 'HASHTAG') themeColor = '#38bdf8'; // آبی روشن (هشتگ)
  else if (taxonomy.type === 'CREATOR') themeColor = '#a855f7'; // بنفش (پدیدآورنده)

  // اصلاح دیتای ارسالی به فرانت:
  // بک‌اِند عنوان را در فیلد name ذخیره می‌کند، آن را به title مپ می‌کنیم تا باکس معرفی درست کار کند
  const enhancedTaxonomy = {
    ...taxonomy,
    title: taxonomy.name, // رفع مشکل نشان داده نشدن عنوان
  };

  return (
    <TaxonomyClientPage 
      taxonomy={enhancedTaxonomy} 
      contents={relatedContents || []} 
      themeColor={themeColor} // پاس دادن کدرنگ به کامپوننت کلاینت
    />
  );
}