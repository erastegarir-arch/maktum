// مسیر: app/persian-guide/page.js

import { getSetting } from '@/app/actions/settings';
import PersianGuideContent from '@/app/components/frontend/PersianGuideContent';
import { constructPageMetadata } from '@/lib/seo';
import { defaultPersianGuideData } from '@/lib/persianGuideDefaults';
import ProgressBar from '@/app/components/ProgressBar';

// کش هوشمند ۶۰ ثانیه‌ای (با هر تغییر در پنل مدیریت یا ثبت طومار، از طریق revalidatePath درجا بروز می‌شود)
export const revalidate = 60;

export async function generateMetadata() {
  const [seoTitle, pageTitle, seoDesc, rawData] = await Promise.all([
    getSetting('persian_guide_seo_title'),
    getSetting('persian_guide_title'),
    getSetting('persian_guide_seo_desc'),
    getSetting('persian_guide_page_data'),
  ]);

  let parsedSeo = defaultPersianGuideData.seo;
  try {
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (parsed.seo) parsedSeo = { ...defaultPersianGuideData.seo, ...parsed.seo };
    }
  } catch (err) {
    console.error('Metadata JSON parse error:', err);
  }

  return constructPageMetadata({
    title: seoTitle || pageTitle || parsedSeo.title || 'شیوه‌نامه فارسی‌نویسی و پاسداشت آن در مکتوم',
    description:
      seoDesc ||
      parsedSeo.description ||
      'منظومه فکری، راهنمای جامع نگارش، ویرایش صوری، واژه‌گزینی رسانه‌ای و اصول درست‌نویسی زبان فارسی در زیست‌بوم رسانه‌ای و پژوهشی مکتوم.',
    path: parsedSeo.canonicalPath || '/persian-guide',
  });
}

export default async function PersianGuidePage() {
  let storedData = null;
  try {
    storedData = await getSetting('persian_guide_page_data');
  } catch (err) {
    console.error('Database read error:', err);
  }

  let pageData = defaultPersianGuideData;
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      pageData = {
        ...defaultPersianGuideData,
        ...parsed,
        breadcrumb: { ...defaultPersianGuideData.breadcrumb, ...(parsed.breadcrumb || {}) },
        uiLabels: { ...defaultPersianGuideData.uiLabels, ...(parsed.uiLabels || {}) },
        hero: { ...defaultPersianGuideData.hero, ...(parsed.hero || {}) },
        manifesto: { ...defaultPersianGuideData.manifesto, ...(parsed.manifesto || {}) },
        tone: { ...defaultPersianGuideData.tone, ...(parsed.tone || {}) },
        orthography: { ...defaultPersianGuideData.orthography, ...(parsed.orthography || {}) },
        punctuation: { ...defaultPersianGuideData.punctuation, ...(parsed.punctuation || {}) },
        lexicon: { ...defaultPersianGuideData.lexicon, ...(parsed.lexicon || {}) },
        toolkit: { ...defaultPersianGuideData.toolkit, ...(parsed.toolkit || {}) },
        faq: { ...defaultPersianGuideData.faq, ...(parsed.faq || {}) },
        pledge: { ...defaultPersianGuideData.pledge, ...(parsed.pledge || {}) },
        refiner: { ...defaultPersianGuideData.refiner, ...(parsed.refiner || {}) },
      };
    } catch {
      return (
        <div className="text-white text-center py-20 pt-18 md:pt-25 font-sans select-none">
          خطا در پردازش اطلاعات شیوه‌نامه
        </div>
      );
    }
  }

  const faqEntities =
    pageData.faq?.enabled !== false && Array.isArray(pageData.faq?.items)
      ? pageData.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        }))
      : [];

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: pageData.seo?.title || defaultPersianGuideData.seo.title,
        description: pageData.seo?.description || defaultPersianGuideData.seo.description,
        inLanguage: 'fa-IR',
        isPartOf: {
          '@type': 'WebSite',
          name: 'سامانه مکتوم',
        },
      },
      ...(faqEntities.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqEntities,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchema).replace(/</g, '\\u003c'),
        }}
      />
      <PersianGuideContent pageData={pageData} />
    </>
  );
}