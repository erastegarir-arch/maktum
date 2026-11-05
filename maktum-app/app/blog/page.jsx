import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';

// تم رنگی اختصاصی: نارنجی تیره / آجری (Dark Amber)
const THEME_BLOG = {
  hex: '#b45309',
  text: 'text-[#b45309]',
  hoverText: 'group-hover:text-[#b45309]',
  bg: 'bg-[#b45309]',
  borderHover: 'hover:border-[#b45309]/50',
  via: 'via-[#b45309]',
  shadow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]',
  glowRGB: '180,83,9'
};

export default async function BlogFrontPage() {
  // دریافت تنظیمات ذخیره شده از دیتابیس
  const settingsData = await getSetting('blog_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : { hero: {}, featuredList: [] };

  // دریافت محتوا از دیتابیس
  const rawDataFromDB = await getContents({ type: 'BLOG', status: 'PUBLISHED', limit: 12 });

  // مپ کردن داده‌ها برای تطابق با کامپوننت مشترک + لینک‌دهی به /blog/
  const archiveItems = (rawDataFromDB || []).map(item => ({
    id: item.id,
    title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
    image: item.coverDesktop || item.coverMobile || '',
    date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    views: item.viewCount || 0,
    url: `/blog/${item.slug}` // مسیر اختصاصی صفحه سینگل بلاگ
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'اخبار و مقالات' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_BLOG}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero}
      featuredList={pageSettings.featuredList}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ مقاله‌ای یافت نشد!"
      emptyStateDesc="یادداشت‌های پژوهشگران، تحلیل‌های اختصاصی و اخبار شبکه مکتوم به زودی در اینجا قرار می‌گیرند."
    />
  );
}