'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

/**
 * دریافت مقدار یک تنظیم خاص براساس کلید آن
 * @param {string} key - کلید تنظیم مورد نظر
 */
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

/**
 * ذخیره یا بروزرسانی یک تنظیم
 * @param {string} key - کلید تنظیم
 * @param {string} value - مقدار تنظیم
 * @param {string} group - گروه تنظیم (پیش‌فرض GENERAL)
 */
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
    
    // بازنشانی کامل کش تمام صفحات برای اعمال تغییرات در سراسر سایت
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات:', error);
    return { success: false, error: 'خطا در برقراری ارتباط با دیتابیس' };
  }
}