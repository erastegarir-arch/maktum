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
    return { success: true, data: JSON.parse(JSON.stringify(dossiers)) };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت پرونده‌ها' };
  }
}

// ==========================================
// ۲. دریافت اطلاعات کامل یک پرونده (حل مشکل ارور صفحه داخلی)
// ==========================================
export async function getDossierBySlug(slug) {
  try {
    const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
    
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

    const payload = { ...dossier, topics, creators };
    return { success: true, data: JSON.parse(JSON.stringify(payload)) };
  } catch (error) {
    console.error('Error fetching dossier by slug:', error);
    return { success: false, error: 'خطا در ارتباط با دیتابیس' };
  }
}

// ==========================================
// ۳. دریافت تمام پرونده‌ها برای پنل ادمین
// ==========================================
export async function getAllDossiersAdmin() {
  try {
    const dossiers = await prisma.dossier.findMany({
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { contents: true } }, taxonomies: true, contents: true }
    });
    return { success: true, data: JSON.parse(JSON.stringify(dossiers)) };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت اطلاعات' };
  }
}

// ==========================================
// ۴. ساخت یا ویرایش پرونده (آپدیت شده برای رفع ارور ذخیره)
// ==========================================
export async function saveDossier(data) {
  try {
    const { id, selectedTopics = [], selectedCreators = [], selectedContents = [], ...restData } = data;
    
    const taxonomyConnect = [...selectedTopics, ...selectedCreators].filter(t=>t.id).map(t => ({ id: t.id }));
    const contentConnect = selectedContents.filter(c=>c.id).map(c => ({ id: c.id }));

    restData.status = 'PUBLISHED';
    
    if (restData.slug) {
      restData.slug = restData.slug.trim().toLowerCase().replace(/\s+/g, '-');
    }

    // پاکسازی فیلدهای سیستمی برای جلوگیری از کراش دیتابیس
    delete restData.taxonomies;
    delete restData.contents;
    delete restData._count;
    delete restData.createdAt;
    delete restData.updatedAt;

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
    if (restData.slug) {
      revalidatePath(`/c/${restData.slug}`);
    }
    revalidatePath('/portal-entry-99/dossiers');
    
    return { success: true };
  } catch (error) {
    console.error("خطا در دیتابیس هنگام ذخیره پرونده:", error);
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
// ۶. آپدیت ترتیب چینش
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
  const keys = [
    'hub_title', 'hub_desc', 'hub_meta_title', 'hub_meta_desc',
    'hub_icon', 'hub_bg_desktop', 'hub_bg_mobile',
    'hub_title_gradient_start', 'hub_title_gradient_end'
  ];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  
  const map = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  return {
    title: map.hub_title || 'پرونده‌های ویـژه مـدار',
    description: map.hub_desc || '',
    metaTitle: map.hub_meta_title || 'پرونده‌های ویژه مدار',
    metaDesc: map.hub_meta_desc || '',
    icon: map.hub_icon || '',
    bgDesktop: map.hub_bg_desktop || '',
    bgMobile: map.hub_bg_mobile || '',
    titleGradientStart: map.hub_title_gradient_start || '#ffffff',
    titleGradientEnd: map.hub_title_gradient_end || '#ffffff'
  };
}

// ==========================================
// ۸. ذخیره تنظیمات هاب
// ==========================================
export async function saveHubSettings(data) {
  const settingsToSave = [
    { key: 'hub_title', value: data.title || '' },
    { key: 'hub_desc', value: data.description || '' },
    { key: 'hub_meta_title', value: data.metaTitle || '' },
    { key: 'hub_meta_desc', value: data.metaDesc || '' },
    { key: 'hub_icon', value: data.icon || '' },
    { key: 'hub_bg_desktop', value: data.bgDesktop || '' },
    { key: 'hub_bg_mobile', value: data.bgMobile || '' },
    { key: 'hub_title_gradient_start', value: data.titleGradientStart || '#ffffff' },
    { key: 'hub_title_gradient_end', value: data.titleGradientEnd || '#ffffff' }
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