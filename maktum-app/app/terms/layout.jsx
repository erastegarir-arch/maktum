// مسیر: app/terms/layout.jsx

import { getSetting } from '@/app/actions/settings'; // اکشن فراخوانی از دیتابیس

export async function generateMetadata() {
  // ۱. دریافت اطلاعات این صفحه خاص از دیتابیس
  const seoTitle = await getSetting('terms_seo_title'); // عنوان سئو (اگر در پنل فیلد مجزا دارد)
  const pageTitle = await getSetting('terms_title');    // عنوان اصلی صفحه

  // ۲. فرمول اولویت‌بندی شما: اول سئو، بعد عنوان اصلی، در نهایت یک مقدار پیش‌فرض امن
  const finalTitle = seoTitle || pageTitle || 'قوانین و مقررات';

  // ۳. ارسال به مرورگر (قالب Root Layout کلمه "مکتوم |" را خودکار اضافه می‌کند)
  return {
    title: finalTitle,
    
    // اگر متا دیسکریپشن هم داینامیک است می‌توانید اینجا اضافه کنید:
    // description: await getSetting('terms_seo_description') || '',
  };
}

export default function TermsLayout({ children }) {
  return children;
}