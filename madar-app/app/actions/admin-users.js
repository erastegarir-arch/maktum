'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotificationToUser } from './notifications';
import { getCurrentUserSessionAction } from './auth';
import { checkUserPermission, parsePermissions } from '@/lib/rbac';

export async function getAllUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        downloads: {
          select: { contentId: true }
        },
        _count: {
          select: {
            downloads: true,
            favorites: true,
            comments: true 
          }
        }
      }
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: 'خطا در دریافت لیست کاربران.' };
  }
}

export async function adminCreateUserAction(phone) {
  try {
    const session = await getCurrentUserSessionAction();
    if (!session.success || !checkUserPermission(session.user, 'USERS_CREATE')) {
      return { success: false, error: 'شما مجوز افزودن کاربر جدید را ندارید.' };
    }

    if (!phone || phone.length < 10) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return { success: false, error: 'این شماره موبایل قبلاً در سیستم ثبت شده است.' };

    const user = await prisma.user.create({
      data: { phone, status: 'ACTIVE' }
    });

    await sendWelcomeNotificationToUser(user.id);

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: 'کاربر با موفقیت اضافه شد.', data: user };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت کاربر.' };
  }
}

export async function adminUpdateUserAction(id, data) {
  try {
    const session = await getCurrentUserSessionAction();
    if (!session.success) return { success: false, error: 'عدم احراز هویت.' };

    const canEditInfo = checkUserPermission(session.user, 'USERS_EDIT');
    const canGrantAdmin = checkUserPermission(session.user, 'USERS_GRANT_ADMIN');

    if (!canEditInfo && !canGrantAdmin) {
      return { success: false, error: 'شما مجوز ویرایش اطلاعات کاربر را ندارید.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: 'کاربر یافت نشد.' };

    const updateData = {};

    // ۱. اگر مجوز ویرایش اطلاعات فردی را دارد
    if (canEditInfo) {
      updateData.phone = data.phone;
      updateData.firstName = data.firstName || null;
      updateData.lastName = data.lastName || null;
      updateData.gender = data.gender || null;
      updateData.birthYear = data.birthYear || null;
      updateData.province = data.province || null;
      updateData.city = data.city || null;
      updateData.educationDegree = data.educationDegree || null;
      updateData.major = data.major || null;
      updateData.artResearchField = data.artResearchField || null;
      updateData.cooperationInterests = data.cooperationInterests || null;
      updateData.email = data.email || null;

      if (data.newPassword && data.newPassword.length >= 6) {
        updateData.password = await bcrypt.hash(data.newPassword, 10);
      }
    }

    // ۲. اگر مجوز تعیین سطح مدیریت را دارد و کاربر هدف مدیرکل نیست
    if (canGrantAdmin && !targetUser.isSuperAdmin) {
      const isAdminFlag = !!data.isAdmin;
      const permsArray = isAdminFlag ? parsePermissions(data.adminPermissions) : [];
      updateData.isAdmin = isAdminFlag;
      updateData.adminPermissions = JSON.stringify(permsArray);

      if (!canEditInfo && data.newPassword && data.newPassword.length >= 6) {
        updateData.password = await bcrypt.hash(data.newPassword, 10);
      }
    } else if (targetUser.isSuperAdmin) {
      updateData.isAdmin = true;
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: 'اطلاعات کاربر با موفقیت ویرایش شد.' };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: 'خطا در ویرایش اطلاعات کاربر.' };
  }
}

export async function adminToggleUserStatusAction(id, currentStatus) {
  try {
    const session = await getCurrentUserSessionAction();
    if (!session.success || !checkUserPermission(session.user, 'USERS_BAN')) {
      return { success: false, error: 'شما مجوز مسدودسازی یا فعال‌سازی حساب را ندارید.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.isSuperAdmin) {
       return { success: false, error: 'مسدودسازی مدیر کل ارشد امکان‌پذیر نیست.' };
    }

    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    
    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: newStatus === 'BANNED' ? 'دسترسی کاربر مسدود شد.' : 'حساب کاربر فعال شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت کاربر.' };
  }
}

export async function getAdminUserDetailsAction(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        comments: {
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } },
          orderBy: { createdAt: 'desc' }
        },
        favorites: {
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } }
        },
        downloads: { 
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } }
        },
        notifications: {
          include: { notification: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { success: false, error: 'خطا در دریافت جزئیات فعالیت کاربر.' };
  }
}