'use client';
import { useState, useEffect } from 'react';

export default function ProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // میزان اسکرول از بالای صفحه
      const scrolled = document.documentElement.scrollTop;
      // کل ارتفاع قابل اسکرول صفحه (ارتفاع کل محتوا منهای ارتفاع پنجره نمایش)
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // محاسبه درصد پیشرفت (از ۰ تا ۱۰۰)
      const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
      setScrollPercentage(progress);
    };

    // اضافه کردن شنونده رویداد اسکرول
    window.addEventListener('scroll', handleScroll);
    
    // اجرای یک‌باره تابع در لود اولیه (برای زمانی که کاربر صفحه را رفرش می‌کند و وسط صفحه است)
    handleScroll();

    // پاکسازی شنونده رویداد هنگام خروج از کامپوننت
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // کانتینر اصلی که ثابت در بالاترین نقطه صفحه قرار می‌گیرد
    <div className="fixed top-0 left-0 right-0 h-1 z-[120] bg-white/5 pointer-events-none backdrop-blur-sm">
      {/* نوار رنگی متحرک با گرادینت نئونی مدار */}
      <div 
        className="h-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#a855f7] shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-150 ease-out rounded-r-full"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
}