'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserSessionAction } from './auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// ۱. دریافت کامل اطلاعات کاربری که لاگین کرده است
export async function getUserProfile() {
  try {
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success || !authRes.user) return null;

    const user = await prisma.user.findUnique({
      where: { id: authRes.user.id },
      include: {
        favorites: {
          include: {
            content: {
              select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true, coverDesktop: true, coverMobile: true, publishedAt: true }
            }
          }
        },
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
      user.downloadHistory = user.downloads;
      // حذف فیلدهای امنیتی قبل از ارسال به سمت کلاینت
      delete user.password; 
      delete user.adminPassword;
      delete user.adminPermissions;
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
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success) return { success: false, error: 'شما وارد سایت نشده‌اید.' };

    await prisma.user.update({
      where: { id: authRes.user.id },
      data: {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        gender: data.gender === 'MALE' || data.gender === 'FEMALE' ? data.gender : null,
        birthYear: data.birthYear || null,
        province: data.province || null,
        city: data.city || null,
        educationDegree: data.educationDegree || null,
        major: data.major || null,
        email: data.email || null,
        artResearchField: data.artResearchField || null,
        cooperationInterests: data.cooperationInterests || null,
      }
    });

    revalidatePath('/profile');
    return { success: true, message: 'اطلاعات پروفایل با موفقیت ذخیره شد.' };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: 'خطا در ذخیره اطلاعات پروفایل.' };
  }
}

// ۳. تغییر رمز عبور کاربر از داخل داشبورد کاربری
export async function updatePasswordAction(oldPassword, newPassword) {
  try {
    const authRes = await getCurrentUserSessionAction();
    if (!authRes.success) return { success: false, error: 'شما وارد سایت نشده‌اید.' };

    const user = await prisma.user.findUnique({
      where: { id: authRes.user.id },
      select: { password: true }
    });

    if (!user) return { success: false, error: 'کاربر یافت نشد.' };

    if (user.password) {
      if (!oldPassword) return { success: false, error: 'لطفاً رمز عبور قبلی خود را وارد کنید.' };
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return { success: false, error: 'رمز عبور قبلی اشتباه است.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: authRes.user.id },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'رمز عبور شما با موفقیت ثبت/تغییر کرد.' };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر رمز عبور. لطفاً مجدداً تلاش کنید.' };
  }
}