'use server';

import { GRANULAR_PERMISSIONS } from '@/lib/rbac';

// بازگرداندن لیست مجوزهای دانه‌ریز به جای جدول قدیمی نقش‌ها
export async function getAllRolesAction() {
  return {
    success: true,
    data: [],
    permissionsCatalog: GRANULAR_PERMISSIONS
  };
}

export async function saveRoleAction() {
  return {
    success: false,
    error: 'سیستم نقش‌های ثابت غیرفعال شده است. لطفاً از چک‌لیست دسترسی در پروفایل هر کاربر استفاده کنید.'
  };
}

export async function deleteRoleAction() {
  return {
    success: false,
    error: 'سیستم نقش‌های ثابت غیرفعال شده است.'
  };
}