// app/actions/admin-otp.js
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserSessionAction } from './auth';
// اضافه کردن تابع گذرواژه‌گشایی برای نمایش به ادمین در پنل
import { decryptOtpFromLog } from '@/lib/otpService';

// بررسی دسترسی
async function checkAccess() {
  const session = await getCurrentUserSessionAction();
  if (!session.success) return false;
  const user = session.user;
  if (user.isSuperAdmin) return true;
  if (user.isAdmin && user.adminPermissions?.includes('OTP_LOGS_VIEW')) return true;
  return false;
}

export async function getOtpLogsAction() {
  try {
    const hasAccess = await checkAccess();
    if (!hasAccess) return { success: false, error: 'عدم دسترسی' };

    const rawLogs = await prisma.otpLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // نمایش 100 درخواست آخر برای جلوگیری از سنگین شدن صفحه
    });

    // گذرواژه‌گشایی کدهای تایید برای نمایش در پنل ادمین
    const formattedLogs = rawLogs.map(log => ({
      ...log,
      code: decryptOtpFromLog(log.code)
    }));

    return { success: true, data: formattedLogs };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت تاریخچه' };
  }
}

export async function deleteOtpLogAction(id) {
  try {
    // گارد امنیتی: جلوگیری از حملات تزریق شیء (Object Injection)
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'شناسه لاگ نامعتبر است.' };
    }

    const hasAccess = await checkAccess();
    if (!hasAccess) return { success: false, error: 'عدم دسترسی' };

    await prisma.otpLog.delete({ where: { id } });
    return { success: true, message: 'لاگ با موفقیت حذف شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در حذف لاگ' };
  }
}

export async function clearAllOtpLogsAction() {
  try {
    const hasAccess = await checkAccess();
    if (!hasAccess) return { success: false, error: 'عدم دسترسی' };

    await prisma.otpLog.deleteMany({});
    return { success: true, message: 'تمام تاریخچه با موفقیت پاک شد.' };
  } catch (error) {
    return { success: false, error: 'خطا در پاکسازی تاریخچه' };
  }
}