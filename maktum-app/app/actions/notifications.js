'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

// ============================================================================
// ۰. تابع کمکی ارسال خودکار پیام خوش‌آمدگویی به کاربر جدید (ادمین یا ثبت‌نام سایت)
// ============================================================================
export async function sendWelcomeNotificationToUser(userId) {
  try {
    if (!userId) return { success: false };

    // یافتن آخرین الگوی خوش‌آمدگویی فعال
    const welcomeTemplate = await prisma.notification.findFirst({
      where: {
        isTemplate: true,
        triggerEvent: 'WELCOME',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!welcomeTemplate) return { success: false, reason: 'NO_ACTIVE_TEMPLATE' };

    // بررسی عدم ارسال تکراری برای همین کاربر
    const existing = await prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId: userId,
          notificationId: welcomeTemplate.id
        }
      }
    });

    if (existing) return { success: true };

    // ثبت اعلان در داشبورد کاربر و افزایش شمارنده دریافت‌کنندگان الگو
    await prisma.$transaction([
      prisma.userNotification.create({
        data: {
          userId: userId,
          notificationId: welcomeTemplate.id,
          isRead: false
        }
      }),
      prisma.notification.update({
        where: { id: welcomeTemplate.id },
        data: { targetCount: { increment: 1 } }
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error("Welcome Notification Error:", error);
    return { success: false };
  }
}

// ============================================================================
// ۱. دریافت لیست اعلان‌ها و اتوماسیون‌ها برای جدول ادمین
// ============================================================================
export async function getAdminNotificationsListAction() {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        isTemplate: true,
        triggerEvent: true,
        isActive: true,
        title: true,
        bodyHtml: true,
        themeColor: true,
        iconUrl: true,
        coverUrl: true,
        ctaButtons: true,
        targetCount: true,
        readCount: true,
        createdAt: true,
      }
    });
    return { success: true, data: notifications };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت لیست اعلان‌ها.' };
  }
}

// ============================================================================
// ۲. ذخیره و پخش اعلان جدید (همراه با نسخه‌بندی هوشمند پیام خوش‌آمدگویی)
// ============================================================================
export async function saveAndDispatchNotificationAction(payload) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    // الف) منطق اختصاصی ذخیره الگوی خوش‌آمدگویی (نسخه‌بندی برای عدم تغییر پیام کاربران قدیمی)
    if (payload.isTemplate) {
      const existingWelcome = await prisma.notification.findUnique({
        where: { triggerEvent: 'WELCOME' }
      });

      if (existingWelcome) {
        if (existingWelcome.targetCount > 0) {
          // اگر الگوی قبلی برای کاربرانی ارسال شده، آن را بایگانی می‌کنیم تا پیام کاربران قدیمی دست‌نخورده بماند
          await prisma.notification.update({
            where: { id: existingWelcome.id },
            data: {
              triggerEvent: `WELCOME_ARCHIVED_${Date.now()}`,
              isActive: false
            }
          });
        } else {
          // اگر هنوز هیچ کاربری الگوی قبلی را دریافت نکرده، همان رکورد را بروزرسانی می‌کنیم
          await prisma.notification.update({
            where: { id: existingWelcome.id },
            data: {
              title: payload.title,
              bodyHtml: payload.bodyHtml,
              themeColor: payload.themeColor,
              iconUrl: payload.iconUrl,
              coverUrl: payload.coverUrl,
              ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
              isActive: true
            }
          });
          revalidatePath('/admin/notifications');
          return { success: true, message: 'الگوی خوش‌آمدگویی برای کاربران آینده بروزرسانی شد.' };
        }
      }

      // ایجاد نسخه جدید و فعال خوش‌آمدگویی برای ثبت‌نام‌های بعدی
      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          isTemplate: true,
          triggerEvent: 'WELCOME',
          isActive: true,
          sendInApp: true,
          title: payload.title,
          bodyHtml: payload.bodyHtml,
          themeColor: payload.themeColor,
          iconUrl: payload.iconUrl,
          coverUrl: payload.coverUrl,
          ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
          sendSms: false,
        }
      });

      revalidatePath('/admin/notifications');
      return { success: true, message: 'الگوی خوش‌آمدگویی جدید با موفقیت ذخیره و فعال شد.' };
    }

    // ب) ایجاد رکورد اصلی برای اعلانات دستی و لیستی
    const notification = await prisma.notification.create({
      data: {
        type: payload.type || 'BULK',
        isTemplate: false,
        triggerEvent: null,
        sendInApp: true,
        title: payload.title,
        bodyHtml: payload.bodyHtml,
        themeColor: payload.themeColor,
        iconUrl: payload.iconUrl,
        coverUrl: payload.coverUrl,
        ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
        sendSms: false,
      }
    });

    // ۲. هدف‌گیری مخاطبان
    let targetUsers = [];

    if (payload.audienceType === 'MANUAL') {
      let manualPhonesArray = [];
      if (payload.manualPhones) {
        manualPhonesArray = payload.manualPhones.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length >= 10);
      }
      if (manualPhonesArray.length > 0) {
        targetUsers = await prisma.user.findMany({
          where: { phone: { in: manualPhonesArray } },
          select: { id: true }
        });
      }
    } else {
      const whereClause = {};
      if (payload.audienceType === 'FILTERED') {
        if (payload.filters?.province && payload.filters.province !== 'ALL') {
          whereClause.province = payload.filters.province === 'EMPTY' ? null : payload.filters.province;
        }
        if (payload.filters?.gender && payload.filters.gender !== 'ALL') {
          whereClause.gender = payload.filters.gender === 'EMPTY' ? null : payload.filters.gender;
        }
      }
      targetUsers = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      });
    }

    // ۳. پخش اعلان در داشبورد کاربران پیدا شده
    let appDispatchCount = 0;
    if (targetUsers.length > 0) {
      const userNotificationData = targetUsers.map(u => ({
        userId: u.id,
        notificationId: notification.id,
        isRead: false
      }));

      await prisma.userNotification.createMany({
        data: userNotificationData
      });
      appDispatchCount = targetUsers.length;
    }

    // ۴. ثبت آمار کل
    await prisma.notification.update({
      where: { id: notification.id },
      data: { targetCount: appDispatchCount }
    });

    revalidatePath('/admin/notifications');
    return { 
      success: true, 
      message: `اعلان به داشبورد ${appDispatchCount} کاربر ارسال شد.` 
    };

  } catch (error) {
    console.error("Dispatch Error:", error);
    return { success: false, error: 'خطای سیستمی در پردازش اعلان.' };
  }
}

// ============================================================================
// ۳. ویرایش اعلان (تغییرات بلادرنگ در پنل کاربران برای اعلانات دستی + نسخه‌بندی برای الگوها)
// ============================================================================
export async function updateNotificationAction(id, payload) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    const targetNotif = await prisma.notification.findUnique({ where: { id } });
    if (!targetNotif) return { success: false, error: 'اعلان یافت نشد.' };

    // اگر اعلانِ در حال ویرایش، الگوی خوش‌آمدگوییِ فعالی است که قبلاً برای کاربرانی ارسال شده:
    if (targetNotif.isTemplate && targetNotif.triggerEvent === 'WELCOME' && targetNotif.targetCount > 0) {
      await prisma.notification.update({
        where: { id: targetNotif.id },
        data: {
          triggerEvent: `WELCOME_ARCHIVED_${Date.now()}`,
          isActive: false
        }
      });

      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          isTemplate: true,
          triggerEvent: 'WELCOME',
          isActive: true,
          sendInApp: true,
          title: payload.title,
          bodyHtml: payload.bodyHtml,
          themeColor: payload.themeColor,
          iconUrl: payload.iconUrl,
          coverUrl: payload.coverUrl,
          ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
          sendSms: false,
        }
      });

      revalidatePath('/admin/notifications');
      return { success: true, message: 'نسخه جدید خوش‌آمدگویی برای کاربران آینده ایجاد شد (پیام کاربران قبلی حفظ شد).' };
    }

    // برای اعلانات دستی (یا الگویی که هنوز گیرنده‌ای نداشته)، ویرایش مستقیماً روی رکورد انجام می‌شود
    // و بلافاصله در پنل تمام کاربران دریافت‌کننده بروزرسانی می‌گردد:
    await prisma.notification.update({
      where: { id },
      data: {
        title: payload.title,
        bodyHtml: payload.bodyHtml,
        themeColor: payload.themeColor,
        iconUrl: payload.iconUrl,
        coverUrl: payload.coverUrl,
        ctaButtons: payload.ctaButtons ? JSON.stringify(payload.ctaButtons) : null,
      }
    });

    revalidatePath('/admin/notifications');
    revalidatePath('/');
    return { success: true, message: 'تمامی مشخصات اعلان با موفقیت در پنل کاربران بروزرسانی شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در ویرایش اعلان.' };
  }
}

// ============================================================================
// ۴. حذف سراسری اعلان (حذف از دیتابیس و پنل تمامی کاربران)
// ============================================================================
export async function deleteNotificationAction(id) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    await prisma.notification.delete({
      where: { id }
    });

    revalidatePath('/admin/notifications');
    return { success: true, message: 'اعلان به طور کامل از سیستم و پنل کاربران حذف شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در حذف اعلان.' };
  }
}

// ============================================================================
// ۵. گزارش ریز بازدیدکنندگان یک اعلان با صفحه‌بندی
// ============================================================================
export async function getNotificationViewersAction(notificationId, page = 1, limit = 20, filterStatus = 'ALL') {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    const skip = (page - 1) * limit;
    
    let whereClause = { notificationId };
    if (filterStatus === 'READ') whereClause.isRead = true;
    if (filterStatus === 'UNREAD') whereClause.isRead = false;

    const viewers = await prisma.userNotification.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        user: {
          select: { firstName: true, lastName: true, phone: true }
        }
      },
      orderBy: { readAt: 'desc' }
    });

    const total = await prisma.userNotification.count({ where: whereClause });

    return { 
      success: true, 
      data: viewers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت لیست بازدیدکنندگان.' };
  }
}

// ============================================================================
// ۶. تغییر وضعیت روشن/خاموش بودن اتوماسیون
// ============================================================================
export async function toggleNotificationTemplateStatusAction(id, currentStatus) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) return { success: false, error: 'عدم دسترسی' };

    const target = await prisma.notification.findUnique({ where: { id } });
    if (!target) return { success: false, error: 'الگو یافت نشد.' };

    const newStatus = !currentStatus;

    // اگر می‌خواهیم یک الگوی خوش‌آمدگویی را فعال کنیم، سایر الگوهای خوش‌آمدگویی را غیرفعال می‌کنیم تا تداخل پیش نیاید
    if (newStatus && target.isTemplate) {
      await prisma.notification.updateMany({
        where: { isTemplate: true, id: { not: id } },
        data: { isActive: false }
      });
      // اطمینان از اینکه کلید WELCOME روی الگوی فعال قرار دارد
      const currentWelcome = await prisma.notification.findUnique({ where: { triggerEvent: 'WELCOME' } });
      if (currentWelcome && currentWelcome.id !== id) {
        await prisma.notification.update({
          where: { id: currentWelcome.id },
          data: { triggerEvent: `WELCOME_ARCHIVED_${Date.now()}` }
        });
      }
      await prisma.notification.update({
        where: { id },
        data: { isActive: true, triggerEvent: 'WELCOME' }
      });
    } else {
      await prisma.notification.update({
        where: { id },
        data: { isActive: newStatus }
      });
    }

    revalidatePath('/admin/notifications');
    return { success: true, message: 'وضعیت اتوماسیون تغییر کرد.' };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت.' };
  }
}

// ============================================================================
// ۷. اکشن‌های سمت کاربر (فرانت‌اِند اصلی سایت)
// ============================================================================
export async function getUserUnreadNotificationCountAction() {
  try {
    const session = await getSessionUser();
    if (!session) return 0;

    const count = await prisma.userNotification.count({
      where: { userId: session.userId, isRead: false }
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

    const un = await prisma.userNotification.update({
      where: { id: userNotificationId, userId: session.userId },
      data: { isRead: true, readAt: new Date() }
    });
    
    await prisma.notification.update({
      where: { id: un.notificationId },
      data: { readCount: { increment: 1 } }
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

    const unreadUserNotifs = await prisma.userNotification.findMany({
      where: { userId: session.userId, isRead: false },
      select: { notificationId: true }
    });

    await prisma.userNotification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    
    for (const un of unreadUserNotifs) {
      await prisma.notification.update({
        where: { id: un.notificationId },
        data: { readCount: { increment: 1 } }
      });
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}