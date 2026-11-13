// src/app/sitemap.js
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

// تابع کمکی برای پیدا کردن پیشوند مسیر (Prefix) بر اساس نوع محتوا
const getPrefixByType = (type) => {
  const t = type?.toUpperCase();
  if (t === 'BLOG') return '/blog';
  if (t === 'RAW') return '/f';
  if (t === 'PRODUCED') return '/p';
  if (t === 'TOOL') return '/tool';
  return '/p'; // پیش‌فرض
};

export default async function sitemap() {
  const now = new Date();

  // ۱. صفحات ایستا، منشورهای فرهنگی و کانون‌های اصلی سامانه
  const staticRoutes = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/persian-guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 }, // شیوه‌نامه فارسی‌نویسی و پاسداشت زبان فارسی
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/collaborate`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/c`, lastModified: now, changeFrequency: 'daily', priority: 0.9 }, // کانون پرونده‌ها
    { url: `${SITE_URL}/t`, lastModified: now, changeFrequency: 'daily', priority: 0.9 }, // کانون پایگاه داده
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/f`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/p`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tool`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  try {
    // ۲. دریافت تمام محتواهای منتشرشده از پایگاه داده
    const publishedContents = await prisma.content.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, type: true },
    });

    const contentRoutes = publishedContents.map((content) => ({
      url: `${SITE_URL}${getPrefixByType(content.type)}/${content.slug}`,
      lastModified: content.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // ۳. دریافت تمام پرونده‌های ویژه (منظومه‌ها)
    const dossiers = await prisma.dossier.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const dossierRoutes = dossiers.map((dossier) => ({
      url: `${SITE_URL}/c/${dossier.slug}`,
      lastModified: dossier.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // ۴. دریافت تمام دسته‌بندی‌ها، نشان‌واژه‌ها و پدیدآورندگان
    const taxonomies = await prisma.taxonomy.findMany({
      select: { slug: true, updatedAt: true },
    });

    const taxonomyRoutes = taxonomies.map((tax) => ({
      url: `${SITE_URL}/t/${tax.slug}`,
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