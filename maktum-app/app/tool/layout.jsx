// نمونه برای مسیر: app/raw-materials/layout.jsx
import { getSetting } from '@/app/actions/settings';

export async function generateMetadata() {
  const settingsData = await getSetting('tool_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : null;

  // بررسی می‌کنیم که کاربر فیلد title یا description را در پنل ادمین پر کرده باشد
  const seoTitle = pageSettings?.seo?.title;
  const seoDesc = pageSettings?.seo?.description;

  if (seoTitle || seoDesc) {
    return {
      ...(seoTitle && { title: seoTitle }),
      ...(seoDesc && { description: seoDesc }),
    };
  }
  return {};
}

export default function ToolLayout({ children }) {
  return children;
}