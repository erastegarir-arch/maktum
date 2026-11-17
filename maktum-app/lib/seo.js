// lib/seo.js

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maktum.ir').replace(/\/$/, '');

export const SITE_CONFIG = {
  name: 'مکتوم',
  alternateName: ['Maktum', 'پلتفرم مکتوم', 'پایگاه داده رسانه‌ای مکتوم', 'شبکه مکتوم'],
  title: 'مکتوم | پایگاه داده باز محتوای رسانه‌ای، راش، مستند و پژوهش‌های تحلیلی',
  description:
    'پلتفرم غیرتجاری و باز مکتوم؛ مرجع تخصصی پایگاه داده، توزیع رایگان فوتیج و راش‌های ویدیویی (B-Roll)، مستندها، ابزارهای تولید محتوا، مقالات تحلیلی و پرونده‌های ویژه پژوهشی.',
  locale: 'fa_IR',
  language: 'fa-IR',
  themeColor: '#0b1426',
  logoUrl: `${SITE_URL}/images/logo.png`,
  ogImageUrl: `${SITE_URL}/images/og-default.jpg`,
  socials: [
    'https://t.me/MaktumHist',
    // هر زمان شبکه اجتماعی جدیدی ساختید، لینک آن را در خط جدید داخل گیومه اضافه کنید
  ],
};

export function getAbsoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function generateCoreGraphSchema() {
  const mainRoutes = [
    { name: 'پرونده‌های ویژه (منظومه‌ها)', url: getAbsoluteUrl('/c') },
    { name: 'پایگاه داده موضوعی و پدیدآورندگان', url: getAbsoluteUrl('/t') },
    { name: 'محتوای راش و فوتیج خام', url: getAbsoluteUrl('/f') },
    { name: 'مستندها و محتوای تولیدی', url: getAbsoluteUrl('/p') },
    { name: 'مقالات و پژوهش‌های تحلیلی', url: getAbsoluteUrl('/blog') },
    { name: 'ابزارهای کاربردی رسانه', url: getAbsoluteUrl('/tool') },
    { name: 'شیوه‌نامه فارسی‌نویسی و پاسداشت زبان فارسی', url: getAbsoluteUrl('/persian-guide') },
    { name: 'درباره مکتوم', url: getAbsoluteUrl('/about') },
    { name: 'همکاری با مکتوم', url: getAbsoluteUrl('/collaborate') },
    { name: 'قوانین و مرامنامه', url: getAbsoluteUrl('/terms') },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ResearchOrganization'],
        '@id': `${SITE_URL}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.alternateName,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: SITE_CONFIG.logoUrl,
          contentUrl: SITE_CONFIG.logoUrl,
          caption: SITE_CONFIG.name,
          inLanguage: SITE_CONFIG.language,
          width: 512,
          height: 512,
        },
        image: { '@id': `${SITE_URL}/#logo` },
        description: SITE_CONFIG.description,
        sameAs: SITE_CONFIG.socials,
        knowsAbout: [
          'پایگاه داده ویدیویی و فوتیج خام',
          'مستندسازی و پژوهش تاریخی',
          'تولید محتوای رسانه‌ای',
          'ابزارهای رسانه و دیجیتال',
          'پاسداشت زبان و ادب فارسی',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'editorial and collaboration support',
          url: getAbsoluteUrl('/collaborate'),
          availableLanguage: ['Persian', 'fa'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.alternateName,
        description: SITE_CONFIG.description,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: SITE_CONFIG.language,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/t?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/#navigation`,
        name: 'بخش‌های اصلی پلتفرم مکتوم',
        itemListElement: mainRoutes.map((route, index) => ({
          '@type': 'SiteNavigationElement',
          position: index + 1,
          name: route.name,
          url: route.url,
        })),
      },
    ],
  };
}

export function constructPageMetadata({
  title,
  description,
  path = '/',
  ogImage = SITE_CONFIG.ogImageUrl,
  type = 'website',
  keywords = [],
  noIndex = false,
}) {
  const canonicalUrl = getAbsoluteUrl(path);
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title;
  const finalDesc = description || SITE_CONFIG.description;
  const finalImage = getAbsoluteUrl(ogImage);

  return {
    title: title || { absolute: SITE_CONFIG.title },
    description: finalDesc,
    keywords: [
      'مکتوم',
      'پلتفرم مکتوم',
      'بارگیری فوتیج رایگان',
      'راش ویدیویی',
      'پایگاه داده مستند',
      ...keywords,
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fa-IR': canonicalUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description: finalDesc,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDesc,
      images: [finalImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

export function generateStaticPageSchema({
  schemaType = 'WebPage',
  title,
  description,
  path,
  breadcrumbName,
}) {
  const pageUrl = getAbsoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaType,
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${title} | ${SITE_CONFIG.name}`,
        description: description || SITE_CONFIG.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        inLanguage: SITE_CONFIG.language,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'خانه',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: breadcrumbName || title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}