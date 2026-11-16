import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

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

export async function generateMetadata() {
  const settingsData = await getSetting('produced_page_settings');
  let pageSettings = {};
  try { pageSettings = settingsData ? JSON.parse(settingsData) : {}; } catch {}

  const title = pageSettings?.seo?.metaTitle || pageSettings?.hero?.title || 'مستندها و محتوای تولیدی';
  const description = pageSettings?.seo?.metaDescription || pageSettings?.hero?.subtitle || 'تماشا و بارگیری مستندهای اختصاصی، ویدیوهای تحلیلی و پادکست‌های شبکه مکتوم.';

  return constructPageMetadata({
    title,
    description,
    path: '/p',
  });
}

export default async function ProducedContentFrontPage() {
  const [settingsData, rawDataFromDB] = await Promise.all([
    getSetting('produced_page_settings'),
    getContents({ type: 'PRODUCED', status: 'PUBLISHED', limit: 12 })
  ]);

  let pageSettings = { hero: {}, featuredList: [] };
  try {
    if (settingsData) pageSettings = JSON.parse(settingsData);
  } catch {}

  const archiveItems = (rawDataFromDB || []).map(item => ({
    id: item.id,
    title: `${item.titleBase || ''} ${item.titleHighlight || ''}`.trim() || 'بدون عنوان',
    image: item.coverDesktop || item.coverMobile || '',
    date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    views: item.viewCount || 0,
    url: `/p/${item.slug}`
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'محتوای تولیدی' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_PRODUCED}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero || {}}
      featuredList={pageSettings.featuredList || []}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ محتوای تولیدی یافت نشد!"
      emptyStateDesc="محتوای این بخش در حال به‌روزرسانی است."
    />
  );
}