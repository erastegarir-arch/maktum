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
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className="bg-[#0b0f19] text-gray-200 min-h-screen flex overflow-hidden w-full font-sans" dir="rtl">
        {/* سایدبار سمت راست */}
        <Sidebar />

        {/* 
          راه حل سراسری: کانتینر اصلی به یک فضای یکپارچه اسکرول‌شونده تبدیل شد.
          حالا هر باز شونده‌ی در هر صفحه‌ای باز شود، به صورت خودکار هدر را می‌پوشاند.
        */}
        <div className="flex-1 h-screen overflow-y-auto bg-[#030712] relative custom-scrollbar">
          
          {/* هدر به جای جدا بودن، حالا به صورت چسبان در بالاترین سطح این کانتینر قرار می‌گیرد */}
          <div className="sticky top-0 z-40 w-full">
            <AdminHeader />
          </div>
          
          {/* محتوای میزکار */}
          <main className="p-8 min-h-[calc(100vh-80px)]">
            {children}
          </main>

        </div>
      </div>
    </AuthProvider>
  );
}