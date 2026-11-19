// مسیر: app/page.jsx
import { getSetting } from '@/app/actions/settings';
import { getCreatorsList, getLatestContents } from '@/app/actions/homepage';
import HomePageClient from './HomePageClient';
import { constructPageMetadata, generateStaticPageSchema, SITE_URL } from '@/lib/seo';

// نگهداری حافظه موقت صفحه اصلی به مدت ۶۰ ثانیه برای مقاومت در برابر هجوم هزاران کاربر همزمان
export const revalidate = 60;

// ==========================================
// ۱. تولید متادیتای پیشرفته برای صفحه اصلی مکتوم
// ==========================================
export async function generateMetadata() {
  try {
    const seoDataRaw = await getSetting('home_seo_config');
    const seoData = seoDataRaw ? JSON.parse(seoDataRaw) : {};
    
    const seoTitle = seoData.metaTitle || 'مکتوم | پایگاه داده باز محتوای رسانه‌ای و پژوهش‌های تحلیلی';
    const seoDesc = seoData.metaDescription || 'پلتفرم غیرتجاری مکتوم؛ مرجع تخصصی پایگاه داده ویدیو، راش، مستند، ابزارهای تولید محتوا و پرونده‌های ویژه.';

    const metadata = constructPageMetadata({
      title: seoTitle,
      description: seoDesc,
      path: '/',
    });

    metadata.title = { absolute: seoTitle };
    return metadata;

  } catch (error) {
    return {
      title: { absolute: 'مکتوم | پایگاه داده باز محتوای رسانه‌ای و پژوهش‌های تحلیلی' },
    };
  }
}

// ==========================================
// ۲. کامپوننت اصلی سرور (واکشی موازی و فوق‌سریع)
// ==========================================
export default async function HomePage() {
  // تابع کمکی برای پارس کردن امن اطلاعات
  const parseJSON = (str, fallback) => { 
    try { return str ? JSON.parse(str) : fallback; } 
    catch { return fallback; } 
  };

  // ✅ اجرای همزمان و موازی تمام ۱۵ درخواست دیتابیس در یک مرحله با Promise.all
  const [
    creatorsRes,
    savedInvIdsRaw,
    contentsRes,
    contentConfigRaw,
    layoutOrderRaw,
    heroSlidesRaw,
    newsTickerRaw,
    statsRaw,
    dossiersConfigRaw,
    dossiersRaw,
    radarConfigRaw,
    radarTopicsRaw,
    timelineEventsRaw,
    countdownRaw,
    ctaBoxRaw,
  ] = await Promise.all([
    getCreatorsList(),
    getSetting('home_investigators'),
    getLatestContents(),
    getSetting('home_content_config'),
    getSetting('home_layout'),
    getSetting('home_hero'),
    getSetting('home_news'),
    getSetting('home_stats'),
    getSetting('home_dossiers_config'),
    getSetting('home_dossiers'),
    getSetting('home_radar_config'),
    getSetting('home_radar'),
    getSetting('home_timeline'),
    getSetting('home_countdown'),
    getSetting('home_cta'),
  ]);

  const allCreators = creatorsRes?.success ? creatorsRes.data : [];
  const savedInvIds = parseJSON(savedInvIdsRaw, []);
  const fullInvestigators = savedInvIds.map(id => allCreators.find(c => c.id === id)).filter(Boolean);

  const allContents = contentsRes?.success ? contentsRes.data : [];

  const contentConfig = parseJSON(contentConfigRaw, {
    blog: { title: 'آخرین مطالب تارنگار', subtitle: 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی' },
    raw: { title: 'محتوای راش و خام', subtitle: 'اسناد مکتوب، تصاویر و ویدیوها' },
    produced: { title: 'محتوای تولیدی', subtitle: 'مستندهای اختصاصی و پادکست‌ها' },
    tools: { title: 'ابزارهای کاربردی', subtitle: 'تسهیل در پژوهش با ابزارهای هوشمند' }
  });

  const fetchedData = {
    layoutOrder: parseJSON(layoutOrderRaw, []),
    heroSlides: parseJSON(heroSlidesRaw, []),
    newsTicker: parseJSON(newsTickerRaw, []),
    stats: parseJSON(statsRaw, []),
    dossiersConfig: parseJSON(dossiersConfigRaw, { title: 'پرونده‌های باز', subtitle: 'مجموعه اسناد، مقالات و ویدیوهای مرتبط با یک کلان‌موضوع' }),
    dossiers: parseJSON(dossiersRaw, []),
    radarConfig: parseJSON(radarConfigRaw, { title: 'رادار موضوعی', subtitle: 'داغ‌ترین موضوعات در حال پیگیری' }),
    radarTopics: parseJSON(radarTopicsRaw, []),
    timelineEvents: parseJSON(timelineEventsRaw, []),
    countdown: parseJSON(countdownRaw, { targetDate: '', title: '', desc: '', lockedText: '', unlockedText: '', tooltip: '', link: '#' }),
    investigators: fullInvestigators,
    ctaBox: parseJSON(ctaBoxRaw, { preTitle: '', title: '', desc: '', btnText: '', btnLink: '#' }),
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

  if (schema['@graph']) {
    const websiteNode = schema['@graph'].find(node => node['@type'] === 'WebSite');
    if (websiteNode) {
      websiteNode.potentialAction = [{
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/t?q={search_term_string}`
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
      <HomePageClient initialData={fetchedData} />
    </>
  );
}