// مسیر: app/page.jsx
import { getSetting } from '@/app/actions/settings';
import { getCreatorsList, getLatestContents } from '@/app/actions/homepage';
import HomePageClient from './HomePageClient';
import { constructPageMetadata, generateStaticPageSchema, SITE_URL } from '@/lib/seo'; // اتصال به موتور سئو

// ==========================================
// ۱. تولید متادیتای پیشرفته برای صفحه اصلی مکتوم
// ==========================================
export async function generateMetadata() {
  try {
    const seoDataRaw = await getSetting('home_seo_config');
    const seoData = seoDataRaw ? JSON.parse(seoDataRaw) : {};
    
    // دریافت عنوان و توضیحات پویا از درگاه مسئولیت
    const seoTitle = seoData.metaTitle || 'مکتوم | پایگاه داده باز محتوای رسانه‌ای و پژوهش‌های تحلیلی';
    const seoDesc = seoData.metaDescription || 'پلتفرم غیرتجاری مکتوم؛ مرجع تخصصی پایگاه داده ویدیو، راش، مستند، ابزارهای تولید محتوا و پرونده‌های ویژه.';

    // استفاده از موتور سئو برای تولید تمام تگ‌های OpenGraph و Twitter
    const metadata = constructPageMetadata({
      title: seoTitle,
      description: seoDesc,
      path: '/',
    });

    // در صفحه اصلی، نام سامانه تکرار نمی‌شود (absolute)
    metadata.title = { absolute: seoTitle };
    return metadata;

  } catch (error) {
    return {
      title: { absolute: 'مکتوم | پایگاه داده باز محتوای رسانه‌ای و پژوهش‌های تحلیلی' },
    };
  }
}

// ==========================================
// ۲. کامپوننت اصلی سرور
// ==========================================
export default async function HomePage() {
  // تابع کمکی برای پارس کردن امن اطلاعات
  const parseJSON = (str, fallback) => { 
    try { return str ? JSON.parse(str) : fallback; } 
    catch { return fallback; } 
  };

  // ✅ جادوی Next.js: دریافت تمام اطلاعات روی سرور (بدون درگیر کردن مرورگر کاربر)
  const creatorsRes = await getCreatorsList();
  const allCreators = creatorsRes?.success ? creatorsRes.data : [];
  
  const savedInvIds = parseJSON(await getSetting('home_investigators'), []);
  const fullInvestigators = savedInvIds.map(id => allCreators.find(c => c.id === id)).filter(Boolean);

  const contentsRes = await getLatestContents();
  const allContents = contentsRes?.success ? contentsRes.data : [];

  const contentConfig = parseJSON(await getSetting('home_content_config'), {
    blog: { title: 'آخرین مطالب بلاگ', subtitle: 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی' },
    raw: { title: 'محتوای راش و خام', subtitle: 'اسناد مکتوب، تصاویر و ویدیوها' },
    produced: { title: 'محتوای تولیدی', subtitle: 'مستندهای اختصاصی و پادکست‌ها' },
    tools: { title: 'ابزارهای کاربردی', subtitle: 'تسهیل در پژوهش با ابزارهای هوشمند' }
  });

  const fetchedData = {
    layoutOrder: parseJSON(await getSetting('home_layout'), []),
    heroSlides: parseJSON(await getSetting('home_hero'), []),
    newsTicker: parseJSON(await getSetting('home_news'), []),
    stats: parseJSON(await getSetting('home_stats'), []),
    dossiersConfig: parseJSON(await getSetting('home_dossiers_config'), { title: 'پرونده‌های باز', subtitle: 'مجموعه اسناد، مقالات و ویدیوهای مرتبط با یک کلان‌موضوع' }),
    dossiers: parseJSON(await getSetting('home_dossiers'), []),
    radarConfig: parseJSON(await getSetting('home_radar_config'), { title: 'رادار موضوعی', subtitle: 'داغ‌ترین موضوعات در حال پیگیری' }),
    radarTopics: parseJSON(await getSetting('home_radar'), []),
    timelineEvents: parseJSON(await getSetting('home_timeline'), []),
    countdown: parseJSON(await getSetting('home_countdown'), { targetDate: '', title: '', desc: '', lockedText: '', unlockedText: '', tooltip: '', link: '#' }),
    investigators: fullInvestigators,
    ctaBox: parseJSON(await getSetting('home_cta'), { preTitle: '', title: '', desc: '', btnText: '', btnLink: '#' }),
    contentConfig: contentConfig,
    blog: allContents.filter(c => c.type === 'BLOG').slice(0, 4),
    raw: allContents.filter(c => c.type === 'RAW').slice(0, 4),
    produced: allContents.filter(c => c.type === 'PRODUCED').slice(0, 4),
    tools: allContents.filter(c => c.type === 'TOOL').slice(0, 4)
  };

  // ۳. تولید اسکیمای جامع WebSite برای ثبت برند مکتوم و فعال‌سازی قاب کاوش گوگل
  const schema = generateStaticPageSchema({
    schemaType: 'WebSite',
    title: 'پلتفرم مکتوم',
    description: 'پایگاه داده باز محتوای رسانه‌ای، ویدیو خام و پژوهش‌های تحلیلی',
    path: '/',
  });

  // اضافه کردن قابلیت SearchAction به اسکیما برای قاب کاوش گوگل
  if (schema['@graph']) {
    const websiteNode = schema['@graph'].find(node => node['@type'] === 'WebSite');
    if (websiteNode) {
      websiteNode.potentialAction = [{
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/t?q={search_term_string}` // کاربر را با کاوش در گوگل مستقیماً به صفحه پایگاه داده هدایت می‌کند
        },
        'query-input': 'required name=search_term_string'
      }];
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* اطلاعات آماده‌شده مستقیما به کلاینت پاس داده می‌شود */}
      <HomePageClient initialData={fetchedData} />
    </>
  );
}