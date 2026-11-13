// @/app/components/providers/DateSettingsContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
// ✅ Import اکشن دریافت تنظیمات پایگاه داده (اکشنی که در تصویر کدهایتان بود)
import { getSetting } from '@/app/actions/settings';

// ۱. ایجاد کانتکست با مقدار اولیه (منفی یا null مهم نیست)
const DateSettingsContext = createContext(null);

// ۲. کامپوننت تأمین‌کننده (Provider) که ریشه سامانه را در بر می‌گیرد
export function DateSettingsProvider({ children }) {
  // ✅ راهکار بنیادین ضد Bilid سرور: استیت‌ها روی کلاینت مسئولیت می‌شوند.
  const [allowCommentsGlobally, setAllowCommentsGlobally] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // ✅ گام جدید: دریافت تنظیمات کلاینت-ساید
  useEffect(() => {
    async function fetchGlobalSettings() {
      try {
        // اجرای همزمان درخواست‌ها برای سرعت بیشتر
        const [commentsSetting] = await Promise.all([
          getSetting('allow_comments_globally'), // مثلاً یک تنظیمات از پایگاه داده
          // getSetting('default_date_format'), // اگر قالب هم تنظیماتی بود
        ]);

        if (commentsSetting !== null) setAllowCommentsGlobally(commentsSetting === 'true');
        // if (dateFormatSetting) JALALI_CONFIG.inputFormat = dateFormatSetting; // به‌روزرسانی پیکربندی خام

      } catch (error) {
        console.error("خطا در دریافت تنظیمات سراسری تاریخ/نظرات:", error);
        // در صورت خطا، مقادیر پیش‌فرض (true) باقی می‌مانند -> سامانه داغون نمی‌شود.
      } finally {
        setIsLoadingSettings(false);
      }
    }
    
    // ✅ نکته حیاتی: این کد فقط روی مرورگر کاربر اجرا می‌شود، نه زمان Bilid سرور.
    fetchGlobalSettings();
  }, []);

  // مقداری که به تمام کلاینت‌ها پاس داده می‌شود
  const contextValue = {
    allowCommentsGlobally,
    isLoadingSettings,
    // می‌توانید متدهای به‌روزرسانی تنظیمات (برای صفحه تنظیمات) را هم اینجا اضافه کنید
    // setAllowCommentsGlobally, 
  };

  return (
    <DateSettingsContext.Provider value={contextValue}>
      {children}
    </DateSettingsContext.Provider>
  );
}

// ۳. هوک سفارشی برای استفاده راحت در کامپوننت‌ها
export function useDateSettings() {
  const context = useContext(DateSettingsContext);
  if (context === undefined) {
    throw new Error('useDateSettings must be used within a DateSettingsProvider');
  }
  return context;
}