'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// تابع کمکی برای ساخت Slug از روی نام (فارسی به انگلیسی و جایگزینی فاصله‌ها)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // تبدیل فاصله به خط تیره
    .replace(/[^\w\u0600-\u06FF-]/g, '') // حذف کاراکترهای غیرمجاز (به جز فارسی و انگلیسی و خط تیره)
    .replace(/-+/g, '-');        // حذف خط تیره‌های تکراری
}

// ۱. ایجاد طبقه‌بندی جدید
export async function createTaxonomy(data) {
  try {
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
      return { success: false, error: 'این نام یا لینک قبلاً در این بخش ثبت شده است.' };
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
    return { success: true, data: newTaxonomy };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت اطلاعات در دیتابیس.' };
  }
}

// ۲. دریافت لیست طبقه‌بندی‌ها برای پنل ادمین
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
    await prisma.taxonomy.delete({ where: { id } });
    revalidatePath('/portal-entry-99/taxonomies');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف آیتم.' };
  }
}

// ۴. ویرایش طبقه‌بندی
export async function updateTaxonomy(id, data) {
  try {
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
      return { success: false, error: 'این نام یا لینک قبلاً ثبت شده است.' };
    }

    const updated = await prisma.taxonomy.update({
      where: { id },
      data: {
        name: data.name,
        slug: finalSlug,
        preTitle: data.preTitle || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      }
    });

    revalidatePath('/portal-entry-99/taxonomies');
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

// ۶. دریافت تمامی محتواهای مرتبط با یک طبقه‌بندی (صفحه داخلی /t/[slug])
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
    // ۱. دریافت تمام طبقه‌بندی‌ها
    const taxonomies = await prisma.taxonomy.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // ۲. دریافت روابط محتواهای منتشرشده
    const publishedContents = await prisma.content.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        categories: { select: { id: true } },
        creators: { select: { id: true } },
        tags: { select: { id: true } },
      }
    });

    // ۳. شمارش تعداد آیتم‌های متصل به هر ID
    const countMap = {};
    for (const item of publishedContents) {
      item.categories?.forEach(c => { countMap[c.id] = (countMap[c.id] || 0) + 1; });
      item.creators?.forEach(c => { countMap[c.id] = (countMap[c.id] || 0) + 1; });
      item.tags?.forEach(t => { countMap[t.id] = (countMap[t.id] || 0) + 1; });
    }

    // ۴. تفکیک به تفکیک نوع با شمارش دقیق
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