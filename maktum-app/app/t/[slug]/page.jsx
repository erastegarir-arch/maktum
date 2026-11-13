import TaxonomyClientPage from '@/app/components/frontend/TaxonomyClientPage';
import { getTaxonomyBySlug, getContentsByTaxonomy } from '@/app/actions/taxonomies'; 
import { constructPageMetadata, generateStaticPageSchema } from '@/lib/seo';

// ==========================================
// ۱. تولید متادیتای سئو (کاملاً پویا)
// ==========================================
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const taxonomy = await getTaxonomyBySlug(decodedSlug);

  if (!taxonomy) return {};

  const pageTitle = taxonomy.preTitle ? `${taxonomy.preTitle} | ${taxonomy.name}` : taxonomy.name;
  const finalDesc = taxonomy.metaDesc || taxonomy.description || `پایگاه داده محتوای مرتبط با ${taxonomy.name}`;

  return constructPageMetadata({
    title: pageTitle, 
    description: finalDesc,
    path: `/t/${decodedSlug}`,
    ogImage: taxonomy.imageUrl || undefined,
  });
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
  else if (taxonomy.type === 'HASHTAG') themeColor = '#38bdf8'; // آبی روشن (هشتک)
  else if (taxonomy.type === 'CREATOR') themeColor = '#a855f7'; // بنفش (پدیدآورنده)

  // اصلاح دیتای ارسالی به فرانت:
  // بک‌اِند عنوان را در فیلد name ذخیره می‌کند، آن را به title مپ می‌کنیم تا قاب معرفی درست کار کند
  const enhancedTaxonomy = {
    ...taxonomy,
    title: taxonomy.name, // رفع مشکل نشان داده نشدن عنوان
  };

  // تولید اسکیمای پویا برای هر دسته‌بندی/هشتک
  const schema = generateStaticPageSchema({
    schemaType: 'CollectionPage',
    title: enhancedTaxonomy.title,
    description: taxonomy.metaDesc || taxonomy.description || `پایگاه داده محتوای مرتبط با ${taxonomy.name}`,
    path: `/t/${decodedSlug}`,
    breadcrumbName: enhancedTaxonomy.title,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <TaxonomyClientPage 
        taxonomy={enhancedTaxonomy} 
        contents={relatedContents || []} 
        themeColor={themeColor} 
      />
    </>
  );
}