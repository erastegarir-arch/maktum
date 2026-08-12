'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export async function getSetting(key) {
  noStore(); // 🚀 این دستور کَش را نابود می‌کند تا فرانت‌اند همیشه مستقیماً از دیتابیس بخواند
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
      update: { value, group },
      create: {
        key,
        value,
        group,
      },
    });
    
    // بازنشانی کامل کش تمام صفحات
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات:', error);
    return { success: false, error: 'خطا در برقراری ارتباط با دیتابیس' };
  }
}