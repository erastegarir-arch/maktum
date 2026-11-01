'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendWelcomeNotificationToUser } from './notifications';

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
            downloads: true, // تعداد کل دفعات دانلود
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
    if (!phone || phone.length < 10) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return { success: false, error: 'این شماره موبایل قبلاً در سیستم ثبت شده است.' };

    const user = await prisma.user.create({
      data: { phone, status: 'ACTIVE' }
    });

    // ارسال خودکار اعلان خوش‌آمدگویی به کاربر تازه ایجاد شده توسط ادمین
    await sendWelcomeNotificationToUser(user.id);

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: 'کاربر با موفقیت اضافه شد.', data: user };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت کاربر.' };
  }
}

export async function adminUpdateUserAction(id, data) {
  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.isSuperAdmin) {
       data.isAdmin = true; 
    }

    const updateData = {
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthYear: data.birthYear,
      province: data.province,
      city: data.city,
      educationDegree: data.educationDegree,
      major: data.major,
      artResearchField: data.artResearchField,
      cooperationInterests: data.cooperationInterests,
      email: data.email,
      
      isAdmin: !!data.isAdmin,
      adminPermissions: data.adminPermissions ? JSON.stringify(data.adminPermissions) : null,
    };

    if (data.newPassword && data.newPassword.length >= 6) {
      updateData.password = await bcrypt.hash(data.newPassword, 10);
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
        // اضافه شدن واکشی دقیق اعلانات اختصاصی این کاربر
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