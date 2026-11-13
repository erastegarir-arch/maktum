// مسیر دقیق: app/profile/page.jsx
import { redirect } from 'next/navigation';
import UserDashboard from '@/app/components/frontend/UserDashboard';
import { getUserProfile } from '@/app/actions/user';

// ==========================================
// متادیتا و قفل سئو برای جلوگیری از هدر رفتن بودجه خزش گوگل (Crawl Budget)
// ==========================================
export const metadata = {
  title: 'حساب کاربری',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

// ==========================================
// جلوگیری از کش شدن صفحه برای نمایش در لحظه اعلان‌ها و به‌روزرسانی‌ها
// ==========================================
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function ProfilePage() {
  // گرفتن اطلاعات کاربر از پایگاه داده با استفاده از کوکی امن
  const user = await getUserProfile();

  // اگر کاربری پیدا نشد (کوکی نداشت یا مسدود شده بود)، او را به صفحه اصلی برگردان
  if (!user) {
    redirect('/');
  }

  // اگر کاربر مجاز بود، میزکار را نشان بده و اطلاعات پایگاه داده را به آن پاس بده
  return <UserDashboard initialUser={user} />;
}