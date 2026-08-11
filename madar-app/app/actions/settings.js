'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSetting(key) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting ? setting.value : null;
  } catch (error) {
    console.error('خطا در دریافت تنظیمات:', error);
    return null;
  }
}

export async function saveSetting(key, value, group = 'GENERAL') {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        group,
      },
    });
    
    // بازنشانی کامل کش تمام صفحات و لی‌آوت اصلی سایت
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات:', error);
    return { success: false, error: 'خطا در برقراری ارتباط با دیتابیس' };
  }
}