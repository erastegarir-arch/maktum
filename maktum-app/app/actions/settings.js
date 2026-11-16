// src/app/actions/settings.js
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUserSessionAction } from './auth';
import { checkUserPermission } from '@/lib/rbac';

/**
 * دریافت مقدار یک تنظیم خاص براساس کلید آن
 * @param {string} key کلید تنظیم مورد نظر
 */
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

/**
 * ذخیره یا بروزرسانی یک تنظیم توسط مسئولان
 * @param {string} key کلید تنظیم
 * @param {string} value مقدار تنظیم
 * @param {string} group گروه تنظیم (پیش‌فرض GENERAL)
 */
export async function saveSetting(key, value, group = 'GENERAL') {
  try {
    // ۱. قفل امنیتی: بررسی دسترسی مسئول
    const session = await getCurrentUserSessionAction();
    if (!session.success || (!session.user?.isSuperAdmin && !session.user?.isAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز. فقط مسئولان می‌توانند تنظیمات را تغییر دهند.' };
    }

    // ۲. بررسی مجوز اختصاصی «شیوه‌نامه فارسی‌نویسی» (مسئول کل همیشه دسترسی دارد)
    if (
      (group === 'PERSIAN_GUIDE_PAGE' || key.startsWith('persian_guide_')) &&
      !session.user?.isSuperAdmin &&
      !checkUserPermission(session.user, 'PERSIAN_GUIDE_EDIT')
    ) {
      return {
        success: false,
        error: 'شما مجوز «شیوه‌نامه فارسی‌نویسی» را برای ویرایش این بخش ندارید.',
      };
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value, group },
      create: {
        key,
        value,
        group,
      },
    });

    // بازنشانی کامل کش صفحه شیوه‌نامه و کل سامانه برای اعمال فوری تغییرات در فرانت‌اند
    revalidatePath('/persian-guide');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات:', error);
    return { success: false, error: 'خطا در برقراری ارتباط با پایگاه داده' };
  }
}

/**
 * اکشن عمومی و امن ویژه کاربران فرانت‌اند برای ثبت نام در طومار پاسداران یا ارسال پیشنهاد واژه
 */
const publicActionCooldownMap = new Map();

export async function submitPersianGuidePublicAction(type, payload) {
  try {
    // ۱. بررسی محدودیت نرخ ارسال (حداقل ۵ ثانیه فاصله بین هر درخواست)
    const now = Date.now();
    const clientKey = `${type}_${String(payload?.phone || payload?.author || 'anon').slice(0, 20)}`;
    const lastAttempt = publicActionCooldownMap.get(clientKey) || 0;
    if (now - lastAttempt < 5000) {
      return { success: false, error: 'لطفاً چند ثانیه صبر کنید و دوباره تلاش نمایید.' };
    }
    publicActionCooldownMap.set(clientKey, now);

    if (publicActionCooldownMap.size > 500) {
      publicActionCooldownMap.clear();
    }

    if (type === 'PLEDGE') {
      const cleanName = String(payload?.name || '')
        .replace(/[<>{}[\];`\\]/g, '')
        .trim()
        .slice(0, 35);
      const cleanPhone = String(payload?.phone || '')
        .replace(/[^0-9۰-۹٠-٩+]/g, '')
        .trim()
        .slice(0, 15);

      if (!cleanName || cleanName.length < 3) {
        return { success: false, error: 'نام واردشده معتبر نیست.' };
      }

      const stored = await prisma.setting.findUnique({
        where: { key: 'persian_guide_pledge_stats' },
      });
      const parsed = stored?.value ? JSON.parse(stored.value) : {};
      const currentApproved = Array.isArray(parsed.recentPledgers) ? parsed.recentPledgers : [];
      const currentPending = Array.isArray(parsed.pendingPledgers) ? parsed.pendingPledgers : [];

      if (currentPending.length >= 200) {
        return { success: false, error: 'صف بررسی پر است؛ لطفاً بعداً تلاش کنید.' };
      }

      const newStats = {
        count: currentApproved.length,
        recentPledgers: currentApproved,
        pendingPledgers: [
          {
            id: now,
            name: cleanName,
            phone: cleanPhone || 'کاربر عضو',
            date: new Date().toLocaleDateString('fa-IR'),
          },
          ...currentPending,
        ],
      };

      await prisma.setting.upsert({
        where: { key: 'persian_guide_pledge_stats' },
        update: { value: JSON.stringify(newStats), group: 'PERSIAN_GUIDE_PAGE' },
        create: {
          key: 'persian_guide_pledge_stats',
          value: JSON.stringify(newStats),
          group: 'PERSIAN_GUIDE_PAGE',
        },
      });

      revalidatePath('/persian-guide');
      return { success: true, count: currentApproved.length };
    }

    if (type === 'SUGGEST_WORD') {
      const cleanForeign = String(payload?.foreign || '')
        .replace(/[<>{}[\];`\\]/g, '')
        .trim()
        .slice(0, 30);
      const cleanPersian = String(payload?.persian || '')
        .replace(/[<>{}[\];`\\]/g, '')
        .trim()
        .slice(0, 30);
      const cleanAuthor = String(payload?.author || '')
        .replace(/[<>{}[\];`\\]/g, '')
        .trim()
        .slice(0, 35) || 'کاربر سامانه';

      if (!cleanForeign || !cleanPersian || cleanForeign.length < 2 || cleanPersian.length < 2) {
        return { success: false, error: 'واژه واردشده معتبر نیست.' };
      }

      const stored = await prisma.setting.findUnique({
        where: { key: 'persian_guide_user_suggestions' },
      });
      const existingList = stored?.value ? JSON.parse(stored.value) : [];

      if (existingList.length >= 200) {
        return { success: false, error: 'صف پیشنهادها پر است.' };
      }

      const newEntry = {
        id: now,
        foreign: cleanForeign,
        persian: cleanPersian,
        author: cleanAuthor,
        date: new Date().toLocaleDateString('fa-IR'),
      };

      await prisma.setting.upsert({
        where: { key: 'persian_guide_user_suggestions' },
        update: {
          value: JSON.stringify([newEntry, ...existingList]),
          group: 'PERSIAN_GUIDE_PAGE',
        },
        create: {
          key: 'persian_guide_user_suggestions',
          value: JSON.stringify([newEntry, ...existingList]),
          group: 'PERSIAN_GUIDE_PAGE',
        },
      });

      revalidatePath('/persian-guide');
      return { success: true };
    }

    return { success: false, error: 'عملیات نامعتبر است.' };
  } catch (error) {
    console.error('Public action error:', error);
    return { success: false, error: 'خطا در ثبت اطلاعات.' };
  }
}

/**
 * دریافت همزمان چندین تنظیم تنها با ۱ درخواست به پایگاه داده (بهینه‌سازی سرعت Layout و صفحات)
 * @param {string[]} keys آرایه‌ای از کلیدهای تنظیمات
 */
export async function getMultipleSettings(keys = []) {
  try {
    const records = await prisma.setting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });
    return records.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('خطا در دریافت گروهی تنظیمات:', error);
    return {};
  }
}