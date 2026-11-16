// src/app/sitemap.js
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

// بروزرسانی خودکار نقشه سایت هر ۱ ساعت (۳۶۰۰ ثانیه) برای ثبت مقالات و ویدیوهای جدید بدون نیاز به بیلد مجدد
export const revalidate = 3600;

const getPrefixByType = (type) => {
  const t = type?.toUpperCase();
  if (t === 'BLOG') return '/blog';
  if (t === 'RAW') return '/f';
  if (t === 'PRODUCED') return '/p';
  if (t === 'TOOL') return '/tool';
  return '/p';
};

export default async function sitemap() {
  const now = new Date();

  // ۱. صفحات ایستا، منشورهای فرهنگی و کانون‌های اصلی سامانه
  const staticRoutes = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/persian-guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/collaborate`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/c`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/t`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/f`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/p`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tool`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  try {
    // اجرای همزمان هر ۳ پرس‌وجوی دیتابیس برای حداکثر سرعت
    const [publishedContents, dossiers, taxonomies] = await Promise.all([
      prisma.content.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true, type: true },
      }),
      prisma.dossier.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.taxonomy.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const contentRoutes = publishedContents.map((content) => ({
      url: `${SITE_URL}${getPrefixByType(content.type)}/${encodeURIComponent(content.slug)}`,
      lastModified: content.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const dossierRoutes = dossiers.map((dossier) => ({
      url: `${SITE_URL}/c/${encodeURIComponent(dossier.slug)}`,
      lastModified: dossier.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const taxonomyRoutes = taxonomies.map((tax) => ({
      url: `${SITE_URL}/t/${encodeURIComponent(tax.slug)}`,
      lastModified: tax.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...contentRoutes, ...dossierRoutes, ...taxonomyRoutes];
  } catch (error) {
    console.error('Sitemap database fetch error:', error);
    return staticRoutes;
  }
}