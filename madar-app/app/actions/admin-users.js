'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. دریافت تمام کاربران به همراه آمار دانلودها و علاقه‌مندی‌ها
export async function getAllUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        role: true,
        // گرفتن آمار دقیق کاربر برای نمایش در داشبورد
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

// ۲. ساخت کاربر جدید توسط ادمین (فقط با شماره موبایل)
export async function adminCreateUserAction(phone) {
  try {
    if (!phone || phone.length < 10) return { success: false, error: 'شماره موبایل نامعتبر است.' };

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return { success: false, error: 'این شماره موبایل قبلاً در سیستم ثبت شده است.' };

    const user = await prisma.user.create({
      data: { phone, status: 'ACTIVE' }
    });

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: 'کاربر با موفقیت اضافه شد.', data: user };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت کاربر.' };
  }
}

// ۳. ویرایش اطلاعات کاربر توسط ادمین
export async function adminUpdateUserAction(id, data) {
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
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
      }
    });

    revalidatePath('/portal-entry-99/users');
    return { success: true, message: 'اطلاعات کاربر با موفقیت ویرایش شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در ویرایش اطلاعات کاربر.' };
  }
}

// ۴. تغییر وضعیت کاربر (مسدود / فعال)
export async function adminToggleUserStatusAction(id, currentStatus) {
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    
    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath('/portal-entry-99/users');
    return { 
      success: true, 
      message: newStatus === 'BANNED' ? 'دسترسی کاربر مسدود شد.' : 'حساب کاربر فعال شد.' 
    };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت کاربر.' };
  }
}

// ۵. دریافت جزئیات و تاریخچه فعالیت‌های یک کاربر خاص (لود هوشمند)
export async function getAdminUserDetailsAction(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        comments: {
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } }
        },
        favorites: {
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } }
        },
        downloads: { 
          include: { content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } } }
        }
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { success: false, error: 'خطا در دریافت جزئیات فعالیت کاربر.' };
  }
}