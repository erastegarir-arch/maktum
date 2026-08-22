import './admin-globals.css';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';

export const metadata = {
  title: {
    template: 'پنل مدار | %s',
    default: 'پنل مدار | پیشخوان',
  },
  description: 'پنل مدیریت یکپارچه پایگاه مدار',
};

export default function AdminLayout({ children }) {
  return (
    <div className="bg-[#0b0f19] text-gray-200 min-h-screen flex overflow-hidden w-full font-sans" dir="rtl">
      {/* سایدبار سمت راست */}
      <Sidebar />

      {/* بخش اصلی محتوا (هدر بالا و محتوای داشبورد) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#030712]">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}