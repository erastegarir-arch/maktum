import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';

// تم رنگی اختصاصی: صورتی (Rose)
const THEME_PRODUCED = {
  hex: '#f43f5e',
  text: 'text-[#f43f5e]',
  hoverText: 'group-hover:text-[#f43f5e]',
  bg: 'bg-[#f43f5e]',
  borderHover: 'hover:border-[#f43f5e]/50',
  via: 'via-[#f43f5e]',
  shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
  glowRGB: '244,63,94'
};

export default async function ProducedContentFrontPage() {
  const settingsData = await getSetting('produced_page_settings');
  const pageSettings = settingsData ? JSON.parse(settingsData) : { hero: {}, featuredList: [] };

  const rawDataFromDB = await getContents({ type: 'PRODUCED', status: 'PUBLISHED', limit: 12 });

  // مپ کردن داده‌ها برای تطابق با کامپوننت مشترک + لینک‌دهی به /p/
  const archiveItems = (rawDataFromDB || []).map(item => ({
    id: item.id,
    title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
    image: item.coverDesktop || item.coverMobile || '',
    date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    views: item.viewCount || 0,
    url: `/p/${item.slug}` // مسیر اختصاصی صفحه سینگل محتوای تولیدی
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'محتوای تولیدی' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_PRODUCED}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero}
      featuredList={pageSettings.featuredList}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ محتوای تولیدی یافت نشد!"
      emptyStateDesc="مستندها، مصاحبه‌ها و پادکست‌های تحلیلی به زودی در این بخش قرار می‌گیرند."
    />
  );
}