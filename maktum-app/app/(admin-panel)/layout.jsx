import './admin-globals.css';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { AuthProvider } from '@/app/hooks/useAuth';

export const metadata = {
  title: {
    template: 'درگاه مکتوم | %s',
    absolute: 'درگاه مکتوم | پیشخوان',
  },
  description: 'درگاه مسئولیت یکپارچه پایگاه مکتوم',
  // جلوگیری قطعی از ثبت صفحات پنل مدیریت در موتورهای جستجو
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className="bg-[#0b0f19] text-gray-200 min-h-screen flex overflow-hidden w-full font-sans" dir="rtl">
        <Sidebar />
        <div className="flex-1 h-screen overflow-y-auto bg-[#030712] relative custom-scrollbar">
          <div className="sticky top-0 z-40 w-full">
            <AdminHeader />
          </div>
          <main className="p-8 min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}