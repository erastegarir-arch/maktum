'use server';

import {prisma} from '@/lib/prisma'; // یا مسیر تعریف Prisma Client در پروژه شما
import { revalidatePath } from 'next/cache';

// تابع کمکی برای پارس ایمن JSON
const safeJsonParse = (data) => {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

// ================= ۱. دریافت لیست همه محتواها (با فیلتر و جستجو) =================
export async function getContents({ search = '', type = 'ALL', status = 'ALL' } = {}) {
  try {
    const where = {};

    if (search.trim()) {
      where.OR = [
        { titleBase: { contains: search } },
        { titleHighlight: { contains: search } },
        { slug: { contains: search } }
      ];
    }

    if (type !== 'ALL') {
      where.type = type;
    }

    if (status !== 'ALL') {
      where.status = status;
    }

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: true,
        creators: true,
        tags: true
      }
    });

    return contents;
  } catch (error) {
    console.error('Error fetching contents:', error);
    return [];
  }
}

// ================= ۲. دریافت اطلاعات یک محتوا بر اساس ID =================
export async function getContentById(id) {
  try {
    if (!id) return null;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        categories: true,
        creators: true,
        tags: true
      }
    });

    return content;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return null;
  }
}

// ================= ۳. ایجاد محتوای جدید =================
export async function createContent(formData) {
  try {
    // بررسی تکراری نبودن اسلاگ (Slug)
    const existingSlug = await prisma.content.findUnique({
      where: { slug: formData.slug }
    });

    if (existingSlug) {
      return { success: false, error: 'این پیوند یکتا (Slug) قبلاً استفاده شده است!' };
    }

    const newContent = await prisma.content.create({
      data: {
        titleBase: formData.titleBase,
        titleHighlight: formData.titleHighlight || null,
        subtitle: formData.subtitle || null,
        slug: formData.slug,
        type: formData.type,
        status: formData.status || 'DRAFT',
        
        coverDesktop: formData.coverDesktop || null,
        coverMobile: formData.coverMobile || null,
        
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : new Date(),
        readTime: formData.readTime || null,
        ageRating: formData.ageRating || null,
        allowComments: formData.allowComments !== undefined ? formData.allowComments : true,
        
        metaTitle: formData.metaTitle || null,
        metaDesc: formData.metaDesc || null,
        displaySettings: safeJsonParse(formData.displaySettings),

        body: formData.body || null,
        lead: formData.lead || null,

        // فیلدهای اختصاصی محصولات (Json)
        formats: safeJsonParse(formData.formats),
        fileSpecs: safeJsonParse(formData.fileSpecs),
        changelog: safeJsonParse(formData.changelog),
        downloadLinks: safeJsonParse(formData.downloadLinks),
        previewGallery: safeJsonParse(formData.previewGallery),

        // برقراری ارتباط با سرشاخه‌ها
        categories: {
          connect: (formData.categoryIds || []).map(id => ({ id }))
        },
        creators: {
          connect: (formData.creatorIds || []).map(id => ({ id }))
        },
        tags: {
          connect: (formData.tagIds || []).map(id => ({ id }))
        }
      }
    });

    revalidatePath('/portal-entry-99/products');
    revalidatePath('/');
    return { success: true, data: newContent };
  } catch (error) {
    console.error('Error creating content:', error);
    return { success: false, error: 'خطایی در ثبت اطلاعات در پایگاه‌داده رخ داد.' };
  }
}

// ================= ۴. ویرایش و به‌روزرسانی محتوا =================
export async function updateContent(id, formData) {
  try {
    if (!id) return { success: false, error: 'شناسه محتوا مشخص نیست.' };

    // بررسی تکراری نبودن اسلاگ برای محتوای دیگر
    const existingSlug = await prisma.content.findFirst({
      where: {
        slug: formData.slug,
        NOT: { id }
      }
    });

    if (existingSlug) {
      return { success: false, error: 'این پیوند یکتا (Slug) توسط محتوای دیگری رزرو شده است!' };
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        titleBase: formData.titleBase,
        titleHighlight: formData.titleHighlight || null,
        subtitle: formData.subtitle || null,
        slug: formData.slug,
        type: formData.type,
        status: formData.status,
        
        coverDesktop: formData.coverDesktop || null,
        coverMobile: formData.coverMobile || null,
        
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : undefined,
        updatedAt: formData.updatedAt ? new Date(formData.updatedAt) : new Date(),
        readTime: formData.readTime || null,
        ageRating: formData.ageRating || null,
        allowComments: formData.allowComments !== undefined ? formData.allowComments : true,
        
        metaTitle: formData.metaTitle || null,
        metaDesc: formData.metaDesc || null,
        displaySettings: safeJsonParse(formData.displaySettings),

        body: formData.body || null,
        lead: formData.lead || null,

        // فیلدهای Json
        formats: safeJsonParse(formData.formats),
        fileSpecs: safeJsonParse(formData.fileSpecs),
        changelog: safeJsonParse(formData.changelog),
        downloadLinks: safeJsonParse(formData.downloadLinks),
        previewGallery: safeJsonParse(formData.previewGallery),

        // به‌روزرسانی روابط چندبه‌چند
        categories: {
          set: (formData.categoryIds || []).map(id => ({ id }))
        },
        creators: {
          set: (formData.creatorIds || []).map(id => ({ id }))
        },
        tags: {
          set: (formData.tagIds || []).map(id => ({ id }))
        }
      }
    });

    revalidatePath('/portal-entry-99/products');
    revalidatePath(`/portal-entry-99/products/edit/${id}`);
    revalidatePath('/');
    return { success: true, data: updatedContent };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, error: 'خطایی در به‌روزرسانی اطلاعات رخ داد.' };
  }
}

// ================= ۵. حذف محتوا =================
export async function deleteContent(id) {
  try {
    if (!id) return { success: false, error: 'شناسه محتوا مشخص نیست.' };

    await prisma.content.delete({
      where: { id }
    });

    revalidatePath('/portal-entry-99/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { success: false, error: 'خطا در حذف محتوا.' };
  }
}

// ================= ۶. دریافت لیست سرشاخه‌ها (Taxonomies) =================
export async function getTaxonomies() {
  try {
    const taxonomies = await prisma.taxonomy.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return taxonomies;
  } catch (error) {
    console.error('Error fetching taxonomies:', error);
    return [];
  }
}