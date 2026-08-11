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

export async function createTaxonomy(data) {
  try {
    // تولید خودکار slug اگر کاربر آن را خالی گذاشته باشد
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
        slug: finalSlug, // استفاده از اسلاگ پردازش شده
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

// توابع getTaxonomies و deleteTaxonomy همان کدهای قبلی هستند
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

export async function deleteTaxonomy(id) {
  try {
    await prisma.taxonomy.delete({ where: { id } });
    revalidatePath('/portal-entry-99/taxonomies');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف آیتم.' };
  }
}

// ۴. ویرایش یک آیتم
export async function updateTaxonomy(id, data) {
  try {
    const finalSlug = data.slug && data.slug.trim() !== '' 
      ? generateSlug(data.slug) 
      : generateSlug(data.name);

    // بررسی اینکه آیا نام یا اسلاگ جدید، قبلا توسط آیتم "دیگری" اشغال شده یا نه
    const existing = await prisma.taxonomy.findFirst({
      where: {
        type: data.type,
        id: { not: id }, // خود آیتم را مستثنی می‌کنیم
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