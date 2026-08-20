'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// ۱. دریافت پرونده‌ها برای صفحه اصلی هاب (/c)
// ==========================================
export async function getAllDossiers() {
  try {
    const dossiers = await prisma.dossier.findMany({
      where: { status: 'PUBLISHED', isVisibleInHub: true },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { contents: true, taxonomies: true } } }
    });
    return { success: true, data: dossiers };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت پرونده‌ها' };
  }
}

// ==========================================
// دریافت اطلاعات کامل یک پرونده
// ==========================================
export async function getDossierBySlug(slug) {
  try {
    // ۱. پاکسازی کامل و استانداردسازی لینک ورودی
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    
    // ۲. استفاده از findFirst برای جلوگیری از ارورهای حساسیت به حروف
    const dossier = await prisma.dossier.findFirst({
      where: { slug: cleanSlug },
      include: {
        contents: {
          where: { status: 'PUBLISHED' },
          select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, readTime: true, viewCount: true },
          orderBy: { publishedAt: 'desc' }
        },
        taxonomies: {
          select: { id: true, name: true, slug: true, type: true, imageUrl: true }
        }
      }
    });

    if (!dossier) return { success: false, error: 'پرونده یافت نشد.' };

    const topics = dossier.taxonomies.filter(t => t.type === 'CATEGORY' || t.type === 'HASHTAG');
    const creators = dossier.taxonomies.filter(t => t.type === 'CREATOR');

    return { success: true, data: { ...dossier, topics, creators } };
  } catch (error) {
    console.error('Error fetching dossier by slug:', error);
    return { success: false, error: 'خطا در ارتباط با دیتابیس' };
  }
}

// ==========================================
// ۳. دریافت تمام پرونده‌ها برای پنل ادمین (تابعی که ارور داده بود)
// ==========================================
export async function getAllDossiersAdmin() {
  try {
    const dossiers = await prisma.dossier.findMany({
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { contents: true } }, taxonomies: true, contents: true }
    });
    return { success: true, data: dossiers };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت اطلاعات' };
  }
}

// ==========================================
// ساخت یا ویرایش پرونده
// ==========================================
export async function saveDossier(data) {
  try {
    const { id, selectedTopics = [], selectedCreators = [], selectedContents = [], ...restData } = data;
    
    const taxonomyConnect = [...selectedTopics, ...selectedCreators].filter(t=>t.id).map(t => ({ id: t.id }));
    const contentConnect = selectedContents.filter(c=>c.id).map(c => ({ id: c.id }));

    restData.status = 'PUBLISHED';
    
    // پاکسازی قطعی اسلاگ قبل از ذخیره در دیتابیس (حذف فاصله‌ها و حروف بزرگ)
    if (restData.slug) {
      restData.slug = restData.slug.trim().toLowerCase().replace(/\s+/g, '-');
    }

    if (id) {
      await prisma.dossier.update({
        where: { id },
        data: {
          ...restData,
          taxonomies: { set: taxonomyConnect },
          contents: { set: contentConnect }
        }
      });
    } else {
      const count = await prisma.dossier.count();
      await prisma.dossier.create({
        data: {
          ...restData,
          orderIndex: count,
          taxonomies: { connect: taxonomyConnect },
          contents: { connect: contentConnect }
        }
      });
    }

    revalidatePath('/c');
    revalidatePath(`/c/${restData.slug}`);
    revalidatePath('/portal-entry-99/dossiers');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'خطا در ذخیره پرونده' };
  }
}

// ==========================================
// ۵. حذف پرونده
// ==========================================
export async function deleteDossier(id) {
  try {
    await prisma.dossier.delete({ where: { id } });
    revalidatePath('/c');
    revalidatePath('/portal-entry-99/dossiers');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف' };
  }
}

// ==========================================
// ۶. ذخیره ترتیب چینش پرونده‌ها در هاب
// ==========================================
export async function updateDossiersOrder(orderedIds) {
  try {
    await Promise.all(orderedIds.map((id, index) => prisma.dossier.update({ where: { id }, data: { orderIndex: index } })));
    revalidatePath('/c');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ==========================================
// ۷. دریافت تنظیمات هاب
// ==========================================
export async function getHubSettings() {
  const keys = ['hub_title', 'hub_desc', 'hub_meta_title', 'hub_meta_desc'];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  
  const map = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  return {
    title: map.hub_title || 'پرونده‌های ویـژه مـدار',
    description: map.hub_desc || 'مجموعه‌ای گلچین‌شده از اسناد...',
    metaTitle: map.hub_meta_title || 'پرونده‌های ویژه مدار',
    metaDesc: map.hub_meta_desc || ''
  };
}

// ==========================================
// ۸. ذخیره تنظیمات هاب
// ==========================================
export async function saveHubSettings(data) {
  const settingsToSave = [
    { key: 'hub_title', value: data.title },
    { key: 'hub_desc', value: data.description },
    { key: 'hub_meta_title', value: data.metaTitle },
    { key: 'hub_meta_desc', value: data.metaDesc },
  ];

  await Promise.all(settingsToSave.map(s => 
      prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, group: 'HUB' }
      })
  ));
  revalidatePath('/c');
  return { success: true };
}