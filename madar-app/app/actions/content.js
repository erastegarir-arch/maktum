'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth'; // <--- اضافه‌شده برای بررسی کاربر

const safeJsonParse = (data) => {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

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
    if (type !== 'ALL') where.type = type;
    if (status !== 'ALL') where.status = status;

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { categories: true, creators: true, tags: true }
    });
    return contents;
  } catch (error) {
    console.error('Error fetching contents:', error);
    return [];
  }
}

export async function getContentById(id) {
  try {
    if (!id) return null;
    const content = await prisma.content.findUnique({
      where: { id },
      include: { categories: true, creators: true, tags: true }
    });
    return content;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return null;
  }
}

export async function createContent(formData) {
  try {
    const existingSlug = await prisma.content.findUnique({ where: { slug: formData.slug } });
    if (existingSlug) return { success: false, error: 'این پیوند یکتا (Slug) قبلاً استفاده شده است!' };

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
        formats: safeJsonParse(formData.formats),
        fileSpecs: safeJsonParse(formData.fileSpecs),
        changelog: safeJsonParse(formData.changelog),
        downloadLinks: safeJsonParse(formData.downloadLinks),
        previewGallery: safeJsonParse(formData.previewGallery),
        categories: { connect: (formData.categoryIds || []).map(id => ({ id })) },
        creators: { connect: (formData.creatorIds || []).map(id => ({ id })) },
        tags: { connect: (formData.tagIds || []).map(id => ({ id })) }
      }
    });
    revalidatePath('/portal-entry-99/products');
    revalidatePath('/');
    return { success: true, data: newContent };
  } catch (error) {
    console.error('Error creating content:', error);
    return { success: false, error: 'خطایی در ثبت اطلاعات رخ داد.' };
  }
}

export async function updateContent(id, formData) {
  try {
    if (!id) return { success: false, error: 'شناسه محتوا مشخص نیست.' };

    const existingSlug = await prisma.content.findFirst({
      where: { slug: formData.slug, NOT: { id } }
    });
    if (existingSlug) return { success: false, error: 'این پیوند یکتا توسط محتوای دیگری رزرو شده است!' };

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
        formats: safeJsonParse(formData.formats),
        fileSpecs: safeJsonParse(formData.fileSpecs),
        changelog: safeJsonParse(formData.changelog),
        downloadLinks: safeJsonParse(formData.downloadLinks),
        previewGallery: safeJsonParse(formData.previewGallery),
        categories: { set: (formData.categoryIds || []).map(id => ({ id })) },
        creators: { set: (formData.creatorIds || []).map(id => ({ id })) },
        tags: { set: (formData.tagIds || []).map(id => ({ id })) }
      }
    });
    revalidatePath('/portal-entry-99/products');
    revalidatePath(`/portal-entry-99/products/edit/${id}`);
    revalidatePath('/');
    return { success: true, data: updatedContent };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, error: 'خطایی در به‌روزرسانی رخ داد.' };
  }
}

export async function deleteContent(id) {
  try {
    if (!id) return { success: false, error: 'شناسه محتوا مشخص نیست.' };
    await prisma.content.delete({ where: { id } });
    revalidatePath('/portal-entry-99/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { success: false, error: 'خطا در حذف محتوا.' };
  }
}

export async function getTaxonomies() {
  try {
    return await prisma.taxonomy.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error('Error fetching taxonomies:', error);
    return [];
  }
}

// ======================================================================
// دریافت محتوا با آمار لایک‌ها و نظرات تایید شده برای نمایش به کاربر
// ======================================================================
export async function getContentBySlug(slug, type = null) {
  try {
    const session = await getSessionUser(); // خواندن کاربر لاگین شده

    const where = { slug };
    if (type) where.type = type;

    const content = await prisma.content.findFirst({
      where,
      include: {
        categories: true,
        creators: true,
        tags: true,
        _count: {
          select: { favoritedBy: true }
        },
        favoritedBy: session ? {
          where: { userId: session.userId },
          select: { id: true }
        } : false,
        // واکشی نظرات تایید شده از دیتابیس به همراه مشخصات نویسنده
        comments: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
    });

    if (!content) return null;

    const isFavoritedByMe = session && content.favoritedBy && content.favoritedBy.length > 0;

    // مپ کردن نظرات دیتابیس به فرمتی که قالب فرانت‌اِند شما نیاز دارد
    const formattedComments = content.comments ? content.comments.map(c => ({
      id: c.id,
      user: c.user?.firstName || c.user?.lastName ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() : 'کاربر مدار',
      date: new Date(c.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }),
      text: c.text,
      adminReply: c.adminReply
    })) : [];

    return {
      ...content,
      isFavoritedByMe,
      comments: formattedComments // جایگزین شدن نظرات واقعی به جای حالت متنی قدیمی
    };
  } catch (error) {
    console.error("خطا در دریافت محتوا با اسلاگ:", error);
    return null;
  }
}