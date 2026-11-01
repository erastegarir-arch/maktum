'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. دریافت لیست پدیدآورندگان برای انتخاب در پنل ادمین
export async function getCreatorsList() {
  try {
    const creators = await prisma.taxonomy.findMany({
      where: { type: 'CREATOR' },
      select: { id: true, name: true, slug: true, imageUrl: true }
    });
    return { success: true, data: creators };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت پدیدآورندگان' };
  }
}

// ۲. دریافت لیست هشتگ‌ها و دسته‌بندی‌ها برای رادار موضوعی
export async function getTagsList() {
  try {
    const tags = await prisma.taxonomy.findMany({
      where: { type: { in: ['HASHTAG', 'CATEGORY'] } },
      select: { id: true, name: true, type: true, slug: true }
    });
    return { success: true, data: tags };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت هشتگ‌ها' };
  }
}

// ۳. دریافت آخرین محتواهای منتشر شده برای صفحه اصلی (بلاگ، راش و...)
export async function getLatestContents() {
  try {
    const contents = await prisma.content.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 40, // دریافت ۴۰ پست آخر
      include: { 
        categories: { select: { name: true } } // دریافت نام دسته‌بندی
      }
    });
    return { success: true, data: contents };
  } catch (error) {
    console.error("Error fetching contents:", error);
    return { success: false, data: [] };
  }
}