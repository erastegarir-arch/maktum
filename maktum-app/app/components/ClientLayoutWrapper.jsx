'use client';
import { usePathname } from 'next/navigation';
import Header from './frontend/Header';
import Footer from './frontend/Footer';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // بررسی اینکه آیا کاربر داخل پنل مدیریت است یا خیر
  const isAdminPage = pathname?.startsWith('/portal-entry-99');

  // ۱. اگر کاربر در پنل مدیریت بود: هدر، فوتر و پس‌زمینه سایت اصلی کلاً رندر نمی‌شوند
  if (isAdminPage) {
    return <>{children}</>;
  }

  // ۲. اگر کاربر در سایر صفحات سایت بود: هدر، فوتر و پس‌زمینه اصلی نمایش داده می‌شوند
  return (
    <>
      {/* پس‌زمینه اختصاصی صفحات عمومی سایت */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#030712]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12)_0%,rgba(168,85,247,0.06)_50%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-15 bg-[radial-gradient(circle,#06b6d4_0%,transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-10 bg-[radial-gradient(circle,#a855f7_0%,transparent_70%)]" />
      </div>

      <div className="flex flex-col min-h-screen relative z-0">
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}