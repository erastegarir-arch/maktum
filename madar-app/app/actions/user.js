// app/actions/user.js
'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

// ۱. دریافت کامل اطلاعات کاربری که لاگین کرده است
export async function getUserProfile() {
  try {
    const session = await getSessionUser();
    if (!session) return null; // اگر توکن نداشت یا منقضی بود

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        // واکشی علاقه‌مندی‌ها بدون فیلتر تاریخ (برای جلوگیری از ارور Prisma)
        favorites: {
          include: {
            content: {
              select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, publishedAt: true }
            }
          }
        },
        // استفاده از نام صحیح جدول (downloads) به جای downloadHistory
        downloads: { 
          include: {
            content: {
              select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, publishedAt: true }
            }
          }
        }
      }
    });

    if (user) {
      // یک ترفند عالی: 
      // نام متغیر را تغییر می‌دهیم تا کدهای UserDashboard شما بدون حتی یک کلمه تغییر، کار کنند!
      user.downloadHistory = user.downloads;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// ۲. بروزرسانی اطلاعات پروفایل کاربر
export async function updateUserProfileAction(data) {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: 'شما وارد سایت نشده‌اید.' };

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        birthYear: data.birthYear,
        province: data.province,
        city: data.city,
        educationDegree: data.educationDegree,
        major: data.major,
        email: data.email,
        artResearchField: data.artResearchField,
        cooperationInterests: data.cooperationInterests,
      }
    });

    revalidatePath('/profile'); // رفرش کردن کش صفحه پروفایل
    return { success: true, message: 'اطلاعات با موفقیت بروزرسانی شد.' };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: 'خطا در ذخیره اطلاعات.' };
  }
}