'use server';

import { prisma } from '@/lib/prisma';

export async function getIcons() {
  try {
    return await prisma.iconLibrary.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('خطا در دریافت آیکون‌ها:', error);
    return [];
  }
}

export async function uploadIcon(formData) {
  try {
    const file = formData.get('file');
    const name = formData.get('name');
    const label = formData.get('label');

    if (!file || !name) return { success: false, error: 'فایل و نام یکتا الزامی است' };
    
    // خواندن کدهای خام SVG
    const svgText = await file.text();
    
    if (!svgText.includes('<svg')) {
      return { success: false, error: 'فایل نامعتبر است. فقط فرمت SVG پشتیبانی می‌شود.' };
    }

    // پاکسازی امنیتی اولیه (جلوگیری از کدهای مخرب)
    const safeSvg = svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    const newIcon = await prisma.iconLibrary.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        label: label,
        svgCode: safeSvg,
      }
    });

    return { success: true, icon: newIcon };
  } catch (error) {
    if (error.code === 'P2002') return { success: false, error: 'این نام انگلیسی (شناسه) قبلاً ثبت شده است.' };
    return { success: false, error: 'خطا در ذخیره آیکون' };
  }
}

export async function deleteIcon(id) {
  try {
    await prisma.iconLibrary.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}