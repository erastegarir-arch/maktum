'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth';

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-');
}

// ۱. ایجاد طبقه‌بندی جدید
export async function createTaxonomy(data) {
  try {
    const session = await getSessionUser();
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز.' };
    }

    const finalSlug = data.slug && data.slug.trim() !== '' 
      ? generateSlug(data.slug) 
      : generateSlug(data.name);

    const existing = await prisma.taxonomy.findFirst({
      where: {
        type: data.type,
        OR: [{ name: data.name }, { slug: finalSlug }]
      }
    });

    if (existing) {
      return { success: false, error: 'این نام یا پیوند قبلاً در این بخش ثبت شده است.' };
    }

    const newTaxonomy = await prisma.taxonomy.create({
      data: {
        type: data.type,
        name: data.name,
        slug: finalSlug,
        preTitle: data.preTitle || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        metaTitle: data.metaTitle || data.name,
        metaDesc: data.metaDesc || data.description,
      }
    });

    revalidatePath('/portal-entry-99/taxonomies');
    revalidatePath('/t');
    revalidatePath(`/t/${finalSlug}`);
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    return { success: true, data: newTaxonomy };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت اطلاعات در پایگاه داده.' };
  }
}

// ۲. دریافت فهرست طبقه‌بندی‌ها برای درگاه مسئول
export async function getTaxonomies(type) {
  try {
    const taxonomies = await prisma.taxonomy.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: taxonomies };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت اطلاعات.' };
  }
}

// ۳. حذف یک طبقه‌بندی
export async function deleteTaxonomy(id) {
  try {
    const session = await getSessionUser();
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز.' };
    }

    await prisma.taxonomy.delete({ where: { id } });
    revalidatePath('/portal-entry-99/taxonomies');
    revalidatePath('/t');
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف مورد.' };
  }
}

// ۴. ویرایش طبقه‌بندی (همراه با ذخیره کامل metaTitle و metaDesc)
export async function updateTaxonomy(id, data) {
  try {
    const session = await getSessionUser();
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز.' };
    }

    const finalSlug = data.slug && data.slug.trim() !== '' 
      ? generateSlug(data.slug) 
      : generateSlug(data.name);

    const existing = await prisma.taxonomy.findFirst({
      where: {
        type: data.type,
        id: { not: id },
        OR: [{ name: data.name }, { slug: finalSlug }]
      }
    });

    if (existing) {
      return { success: false, error: 'این نام یا پیوند قبلاً ثبت شده است.' };
    }

    const updated = await prisma.taxonomy.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
        preTitle: data.preTitle || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : data.name,
        metaDesc: data.metaDesc !== undefined ? data.metaDesc : data.description,
      }
    });

    revalidatePath('/portal-entry-99/taxonomies');
    revalidatePath('/t');
    revalidatePath(`/t/${finalSlug}`);
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: 'خطا در ویرایش اطلاعات.' };
  }
}

// ۵. دریافت اطلاعات یک طبقه‌بندی با اسلاگ
export async function getTaxonomyBySlug(slug) {
  try {
    if (!slug) return null;
    
    const taxonomy = await prisma.taxonomy.findFirst({
      where: { slug }
    });
    
    return taxonomy;
  } catch (error) {
    console.error('Error fetching taxonomy by slug:', error);
    return null;
  }
}

// ۶. دریافت تمامی محتواهای مرتبط با یک طبقه‌بندی (سبک‌سازی‌شده با select برای سرعت بالا)
export async function getContentsByTaxonomy(slug) {
  try {
    if (!slug) return [];

    const contents = await prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { categories: { some: { slug: slug } } },
          { creators:   { some: { slug: slug } } },
          { tags:       { some: { slug: slug } } }
        ]
      },
      select: {
        id: true,
        type: true,
        slug: true,
        titleBase: true,
        titleHighlight: true,
        coverDesktop: true,
        coverMobile: true,
        publishedAt: true,
        viewCount: true,
      },
      orderBy: { publishedAt: 'desc' }
    });

    return contents.map(item => {
      let itemUrl = '#';
      if (item.type === 'BLOG') itemUrl = `/blog/${item.slug}`;
      else if (item.type === 'RAW') itemUrl = `/f/${item.slug}`;
      else if (item.type === 'TOOL') itemUrl = `/tool/${item.slug}`;
      else if (item.type === 'PRODUCED') itemUrl = `/p/${item.slug}`;

      return {
        id: item.id,
        type: item.type || 'PRODUCED',
        title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
        image: item.coverDesktop || item.coverMobile || '',
        date: item.publishedAt ? new Date(item.publishedAt).toISOString() : null,
        views: item.viewCount || 0,
        url: itemUrl
      };
    });

  } catch (error) {
    console.error('Error fetching contents by taxonomy:', error);
    return [];
  }
}

// ۷. دریافت تمام طبقه‌بندی‌ها به همراه شمارش دقیق محتوا (صفحه اصلی /t)
export async function getAllTaxonomiesForArchive() {
  try {
    const [taxonomies, publishedContents] = await Promise.all([
      prisma.taxonomy.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.content.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          categories: { select: { id: true } },
          creators: { select: { id: true } },
          tags: { select: { id: true } },
        }
      })
    ]);

    const countMap = {};
    for (const item of publishedContents) {
      item.categories?.forEach(c => { countMap[c.id] = (countMap[c.id] || 0) + 1; });
      item.creators?.forEach(c => { countMap[c.id] = (countMap[c.id] || 0) + 1; });
      item.tags?.forEach(t => { countMap[t.id] = (countMap[t.id] || 0) + 1; });
    }

    const hashtags = taxonomies
      .filter(t => t.type === 'HASHTAG')
      .map(t => ({
        id: t.id,
        text: t.name,
        slug: t.slug,
        count: countMap[t.id] || 0
      }));

    const categories = taxonomies
      .filter(t => t.type === 'CATEGORY')
      .map(t => ({
        id: t.id,
        title: t.name,
        slug: t.slug,
        count: countMap[t.id] || 0
      }));

    const creators = taxonomies
      .filter(t => t.type === 'CREATOR')
      .map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        avatar: t.imageUrl,
        count: countMap[t.id] || 0
      }));

    return { hashtags, categories, creators };
  } catch (error) {
    console.error('Error fetching archive data:', error);
    return { hashtags: [], categories: [], creators: [] };
  }
}

export async function getArchiveSettingsAction() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['archive_badge', 'archive_title', 'archive_desc'] } }
    });
    const mapped = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    return { success: true, data: mapped };
  } catch (error) {
    return { success: false };
  }
}

export async function saveArchiveSettingsAction(data) {
  try {
    const session = await getSessionUser();
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز.' };
    }

    const settingsToSave = [
      { key: 'archive_badge', value: data.badge },
      { key: 'archive_title', value: data.title },
      { key: 'archive_desc', value: data.description }
    ];

    for (const item of settingsToSave) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value, group: 'ARCHIVE_PAGE' }
      });
    }
    revalidatePath('/t');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در ذخیره در پایگاه داده' };
  }
}