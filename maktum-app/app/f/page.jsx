import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';

// تم رنگی اختصاصی: محتوای خام (زرد/کهربایی)
const THEME_RAW = {
  hex: '#fbbf24',
  text: 'text-[#fbbf24]',
  hoverText: 'group-hover:text-[#fbbf24]',
  bg: 'bg-[#fbbf24]',
  borderHover: 'hover:border-[#fbbf24]/50',
  via: 'via-[#fbbf24]',
  shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
  glowRGB: '251,191,36'
};

export default async function RawContentFrontPage() {
  const settingsData = await getSetting('raw_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : { hero: {}, featuredList: [] };

  const rawDataFromDB = await getContents({ type: 'RAW', status: 'PUBLISHED', limit: 12 });

  // مپ کردن داده‌ها برای تطابق با کامپوننت مشترک + لینک‌دهی به /f/
  const archiveItems = (rawDataFromDB || []).map(item => ({
    id: item.id,
    title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
    image: item.coverDesktop || item.coverMobile || '',
    date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    views: item.viewCount || 0,
    url: `/f/${item.slug}` // مسیر اختصاصی صفحه سینگل محتوای خام
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'محتوای خام و فوتیج' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_RAW}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero}
      featuredList={pageSettings.featuredList}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ محتوای خامی یافت نشد!"
    />
  );
}