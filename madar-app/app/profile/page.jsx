// مسیر دقیق: app/profile/page.jsx
import { redirect } from 'next/navigation';
import UserDashboard from '@/app/components/frontend/UserDashboard';
import { getUserProfile } from '@/app/actions/user';

export const metadata = {
  title: 'حساب کاربری | مدار',
};

// ==========================================
// جلوگیری از کش شدن صفحه برای نمایش در لحظه اعلان‌ها و آپدیت‌ها
// ==========================================
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function ProfilePage() {
  // گرفتن اطلاعات کاربر از دیتابیس با استفاده از کوکی امن
  const user = await getUserProfile();

  // اگر کاربری پیدا نشد (کوکی نداشت یا مسدود شده بود)، او را به صفحه اصلی برگردان
  if (!user) {
    redirect('/');
  }

  // اگر کاربر مجاز بود، داشبورد را نشان بده و اطلاعات دیتابیس را به آن پاس بده
  return <UserDashboard initialUser={user} />;
}