// مسیر فایل: app/components/providers/PageTransitionProvider.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransitionProvider({ children }) {
  const pathname = usePathname();

  // مسیرهایی که نمی‌خواهیم ترانزیشن داشته باشند (مثل پنل ادمین)
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/portal-entry-99');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    // mode="wait" باعث می‌شود صفحه قبلی کاملا محو شود و سپس صفحه جدید ظاهر شود
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // با تغییر مسیر، انیمیشن دوباره اجرا می‌شود
        initial={{ opacity: 0, y: 15 }} // حالت اولیه: کمی پایین و نامرئی
        animate={{ opacity: 1, y: 0 }}  // حالت نمایش: جایگاه اصلی و مرئی
        exit={{ opacity: 0, y: -15 }}   // حالت خروج (رفتن به صفحه دیگر): کمی بالا و نامرئی
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-grow flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}