'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from './auth';

// ۱. دریافت تمام نظرات با صافی وضعیت
export async function getAdminCommentsAction(statusFilter = 'ALL') {
  try {
    const where = statusFilter !== 'ALL' ? { status: statusFilter } : {};
    
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        // واکشی مشخصات کاربر نویسنده نظر
        user: { select: { id: true, firstName: true, lastName: true, phone: true } },
        // واکشی مشخصات مقاله‌ای که نظر برای آن ثبت شده
        content: { select: { id: true, titleBase: true, titleHighlight: true, slug: true, type: true } }
      }
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Error fetching admin comments:", error);
    return { success: false, error: 'خطا در دریافت فهرست نظرات.' };
  }
}

// ۲. تغییر وضعیت نظر (تایید / رد)
export async function updateCommentStatusAction(commentId, newStatus) {
  try {
    const session = await getSessionUser(); 
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز. فقط مسئولان می‌توانند نظرات را بررسی کنند.' };
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(newStatus)) {
      return { success: false, error: 'وضعیت نامعتبر است.' };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { status: newStatus }
    });

    revalidatePath('/admin/comments'); // مسیر فرضی درگاه مسئول
    revalidatePath('/'); // رفرش صفحات فرانت‌اند
    return { success: true, message: `وضعیت نظر با موفقیت به ${newStatus === 'APPROVED' ? 'تایید شده' : 'رد شده'} تغییر یافت.` };
  } catch (error) {
    console.error("Error updating comment status:", error);
    return { success: false, error: 'خطا در تغییر وضعیت نظر.' };
  }
}

// ۳. ثبت پاسخ مسئول و (در صورت نیاز) ویرایش متن کاربر
export async function saveAdminReplyAction(commentId, adminReply, editedUserText, changeStatusToApproved = true) {
  try {
    // گارد امنیتی: فقط مسئولان مجاز به ثبت پاسخ مسئول هستند
    const session = await getSessionUser();
    if (!session || (!session.isAdmin && !session.isSuperAdmin)) {
      return { success: false, error: 'دسترسی غیرمجاز. فقط مسئولان می‌توانند پاسخ ثبت کنند.' };
    }

    const updateData = {
      adminReply: adminReply || null,
      text: editedUserText // متن کاربر با ویرایش احتمالی جایگزین می‌شود
    };

    revalidatePath('/admin/comments');
    revalidatePath('/');
    return { success: true, message: 'پاسخ شما با موفقیت ثبت شد.' };
  } catch (error) {
    console.error("Error saving admin reply:", error);
    return { success: false, error: 'خطا در ثبت پاسخ مسئول.' };
  }
}