'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ۱. دریافت تمام نقش‌ها به همراه تعداد کاربران هر نقش
export async function getAllRolesAction() {
  try {
    const roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'asc' }
    });
    
    // تبدیل رشته متنی JSON به آرایه واقعی برای فرانت‌اِند
    const formattedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : []
    }));

    return { success: true, data: formattedRoles };
  } catch (error) {
    console.error("Error getting roles:", error);
    return { success: false, error: 'خطا در دریافت لیست نقش‌ها' };
  }
}

// ۲. ساخت یا ویرایش یک نقش
export async function saveRoleAction(data) {
  try {
    const { id, name, slug, permissions } = data;
    
    if (!name || !slug) return { success: false, error: 'نام و شناسه (اسلاگ) نقش الزامی است.' };

    // تبدیل آرایه به رشته برای ذخیره در SQLite
    const permsString = JSON.stringify(permissions || []);

    if (id) {
      await prisma.role.update({
        where: { id },
        data: { name, slug, permissions: permsString }
      });
      revalidatePath('/admin/users');
      return { success: true, message: 'مجوزهای نقش با موفقیت بروزرسانی شد.' };
    } else {
      const existing = await prisma.role.findUnique({ where: { slug } });
      if (existing) return { success: false, error: 'شناسه (اسلاگ) تکراری است.' };

      await prisma.role.create({
        data: { name, slug, permissions: permsString }
      });
      revalidatePath('/admin/users');
      return { success: true, message: 'سطح دسترسی جدید با موفقیت ایجاد شد.' };
    }
  } catch (error) {
    console.error("Error saving role:", error);
    return { success: false, error: 'خطا در ذخیره نقش' };
  }
}

// ۳. حذف نقش
export async function deleteRoleAction(id) {
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return { success: false, error: 'نقش یافت نشد.' };
    if (role.isSystem) return { success: false, error: 'نقش‌های سیستمی قابل حذف نیستند!' };

    await prisma.role.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { success: true, message: 'نقش کاربری با موفقیت حذف شد.' };
  } catch (error) {
    // اگر نقش به کاربری متصل باشد دیتابیس ارور می‌دهد (محافظت از دیتابیس)
    return { success: false, error: 'این نقش به کاربرانی متصل است و قابل حذف نیست.' };
  }
}