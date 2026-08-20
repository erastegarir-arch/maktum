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
      where: { id: session.userId }
    });

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
        cooperationInterests: data.cooperationInterests,
        // سایر فیلدهایی که بعداً اضافه کردید را می‌توانید اینجا بگذارید
      }
    });

    revalidatePath('/profile'); // رفرش کردن کش صفحه پروفایل
    return { success: true, message: 'اطلاعات با موفقیت بروزرسانی شد.' };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: 'خطا در ذخیره اطلاعات.' };
  }
}