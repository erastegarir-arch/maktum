// app/actions/notifications.js
'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

// ============================================================================
// ۱. هسته مرکزی و داینامیک ارسال پیامک
// ============================================================================
async function dispatchSmsViaKavenegar(phoneNumbers, messageText) {
  try {
    if (!phoneNumbers || phoneNumbers.length === 0 || !messageText) return { success: true, count: 0 };

    const apiKeySetting = await prisma.setting.findUnique({ where: { key: 'sms_api_key' } });
    const senderSetting = await prisma.setting.findUnique({ where: { key: 'sms_sender_number' } });

    if (!apiKeySetting || !apiKeySetting.value) {
      console.warn("SMS API Key is not configured in settings.");
      return { success: false, error: "کلید API کاوه‌نگار در تنظیمات ثبت نشده است." };
    }

    const apiKey = apiKeySetting.value;
    const sender = senderSetting?.value || "10008663";

    // تبدیل آرایه شماره‌ها به یک رشته با جداکننده کاما
    const receptors = phoneNumbers.join(',');

    /* 
      // کد اصلی اتصال کاوه‌نگار:
      const response = await fetch(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ receptor: receptors, sender: sender, message: messageText })
      });
      const result = await response.json();
      if(result.return.status !== 200) throw new Error(result.return.message);
    */

    console.log(`[SMS MOCK] Sending SMS to ${phoneNumbers.length} numbers via ${sender}. Text: ${messageText}`);
    return { success: true, count: phoneNumbers.length };
  } catch (error) {
    console.error("Kavenegar SMS Error:", error);
    return { success: false, error: 'خطا در ارتباط با سرور پیامک.' };
  }
}

// ============================================================================
// ۲. مدیریت اعلان‌ها در پنل ادمین (ساخت، فیلتر و ارسال گروهی)
// ============================================================================

export async function getAdminNotificationsListAction() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: notifications };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت لیست اعلان‌ها.' };
  }
}

export async function saveAndDispatchNotificationAction(payload) {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'عدم دسترسی' };

    // ۱. ایجاد رکورد اصلی اعلان در دیتابیس
    const notification = await prisma.notification.create({
      data: {
        type: payload.type || 'BULK',
        isTemplate: payload.isTemplate || false,
        triggerEvent: payload.triggerEvent || null,
        sendInApp: payload.sendInApp,
        title: payload.title,
        bodyHtml: payload.bodyHtml,
        themeColor: payload.themeColor,
        iconUrl: payload.iconUrl,
        coverUrl: payload.coverUrl,
        ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
        sendSms: payload.sendSms,
        smsText: payload.smsText,
      }
    });

    if (payload.isTemplate) {
      revalidatePath('/admin/notifications');
      return { success: true, message: 'قالب اعلان اتوماتیک با موفقیت ذخیره شد.' };
    }

    // ۲. فاز پیدا کردن مخاطبین (Audience Targeting)
    let targetUsers = [];
    let manualPhonesArray = [];

    if (payload.audienceType === 'MANUAL') {
      if (payload.manualPhones) {
        manualPhonesArray = payload.manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length >= 10);
      }
      
      // حل مشکل ۱: جستجوی کاربران بر اساس شماره دستی در دیتابیس
      if (payload.sendInApp && manualPhonesArray.length > 0) {
        targetUsers = await prisma.user.findMany({
          where: { phone: { in: manualPhonesArray } },
          select: { id: true, phone: true }
        });
      }
      
    } else {
      // حالت فیلتر شده یا همه کاربران
      const whereClause = {};
      
      if (payload.audienceType === 'FILTERED') {
        if (payload.filters?.province && payload.filters.province !== 'ALL') {
          whereClause.province = payload.filters.province === 'EMPTY' ? null : payload.filters.province;
        }
        if (payload.filters?.gender && payload.filters.gender !== 'ALL') {
          whereClause.gender = payload.filters.gender === 'EMPTY' ? null : payload.filters.gender;
        }
      }

      // دریافت لیست کاربران بر اساس شرایط
      targetUsers = await prisma.user.findMany({
        where: whereClause,
        select: { id: true, phone: true }
      });
    }

    // ترکیب تمام شماره‌های معتبر پیدا شده
    const allValidPhones = [...new Set([
      ...targetUsers.map(u => u.phone).filter(Boolean), 
      ...manualPhonesArray
    ])];
    
    let appDispatchCount = 0;
    let smsDispatchCount = 0;

    // ۳. فاز پخش درون برنامه‌ای (In-App)
    if (payload.sendInApp && targetUsers.length > 0) {
      const userNotificationData = targetUsers.map(u => ({
        userId: u.id,
        notificationId: notification.id,
        isRead: false
      }));

      // حل مشکل ۲: حذف ویژگیِ ناسازگار skipDuplicates برای دیتابیس‌های سبک (مانند SQLite)
      await prisma.userNotification.createMany({
        data: userNotificationData
      });
      appDispatchCount = targetUsers.length;
    }

    // ۴. فاز پخش پیامکی (SMS)
    if (payload.sendSms && payload.smsText && allValidPhones.length > 0) {
      const smsResult = await dispatchSmsViaKavenegar(allValidPhones, payload.smsText);
      if (smsResult.success) {
        smsDispatchCount = smsResult.count;
      }
    }

    // ۵. بروزرسانی آمار اعلان در دیتابیس برای گزارش‌گیری ادمین
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        targetCount: allValidPhones.length,
        smsSentCount: smsDispatchCount
      }
    });

    revalidatePath('/admin/notifications');
    return { 
      success: true, 
      message: `اعلان با موفقیت پردازش شد. (ارسال سایت: ${appDispatchCount} نفر | پیامک: ${smsDispatchCount} شماره)` 
    };

  } catch (error) {
    console.error("Dispatch Error:", error);
    return { success: false, error: 'خطای سیستمی در پردازش و ارسال اعلان.' };
  }
}

// ============================================================================
// ۳. اکشن‌های مربوط به سمت کاربر (فرانت‌اِند سایت)
// ============================================================================

export async function getUserUnreadNotificationCountAction() {
  try {
    const session = await getSessionUser();
    if (!session) return 0;

    const count = await prisma.userNotification.count({
      where: {
        userId: session.userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
}

export async function getUserNotificationsAction(limit = 20) {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'عدم دسترسی' };

    const notifications = await prisma.userNotification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        notification: {
          select: {
            title: true,
            bodyHtml: true,
            themeColor: true,
            iconUrl: true,
            coverUrl: true,
            ctaButtons: true,
            createdAt: true
          }
        }
      }
    });

    return { success: true, data: notifications };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت اعلان‌ها.' };
  }
}

export async function markNotificationAsReadAction(userNotificationId) {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false };

    await prisma.userNotification.update({
      where: { id: userNotificationId, userId: session.userId },
      data: { 
        isRead: true, 
        readAt: new Date() 
      }
    });
    
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false };

    await prisma.userNotification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleNotificationTemplateStatusAction(id, currentStatus) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin/notifications');
    return { success: true, message: 'وضعیت اتوماسیون تغییر کرد.' };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت.' };
  }
}