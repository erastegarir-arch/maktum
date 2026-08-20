import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';

// تم رنگی اختصاصی: سبز زمردی (Emerald)
const THEME_TOOL = {
  hex: '#10b981',
  text: 'text-[#10b981]',
  hoverText: 'group-hover:text-[#10b981]',
  bg: 'bg-[#10b981]',
  borderHover: 'hover:border-[#10b981]/50',
  via: 'via-[#10b981]',
  shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
  glowRGB: '16,185,129'
};

export default async function ToolsFrontPage() {
  const settingsData = await getSetting('tool_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : { hero: {}, featuredList: [] };

  const rawDataFromDB = await getContents({ type: 'TOOL', status: 'PUBLISHED', limit: 12 });

  // مپ کردن داده‌ها برای تطابق با کامپوننت مشترک + لینک‌دهی به /tool/
  const archiveItems = (rawDataFromDB || []).map(item => ({
    id: item.id,
    title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
    image: item.coverDesktop || item.coverMobile || '',
    date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    views: item.viewCount || 0,
    url: `/tool/${item.slug}` // مسیر اختصاصی صفحه سینگل ابزارها
  }));

  const breadcrumbs = [
    { label: 'مدار', href: '/' },
    { label: 'ابزارهای کاربردی' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_TOOL}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero}
      featuredList={pageSettings.featuredList}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ ابزاری یافت نشد!"
      emptyStateDesc="نرم‌افزارها، گراف‌های ارتباطی و ابزارهای هوش مصنوعی به زودی منتشر می‌شوند."
    />
  );
}