import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

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

export async function generateMetadata() {
  const settingsData = await getSetting('tool_page_settings');
  let pageSettings = {};
  try { pageSettings = settingsData ? JSON.parse(settingsData) : {}; } catch {}

  const title = pageSettings?.seo?.metaTitle || pageSettings?.hero?.title || 'ابزارهای کاربردی رسانه و پژوهش';
  const description = pageSettings?.seo?.metaDescription || pageSettings?.hero?.subtitle || 'بارگیری رایگان ابزارهای گرافیکی، قالب‌ها، LUTها و نرم‌افزارهای کمکی تولید محتوا در مکتوم.';

  return constructPageMetadata({
    title,
    description,
    path: '/tool',
  });
}

export default async function ToolsFrontPage() {
  const [settingsData, rawDataFromDB] = await Promise.all([
    getSetting('tool_page_settings'),
    getContents({ type: 'TOOL', status: 'PUBLISHED', limit: 12 })
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
    url: `/tool/${item.slug}`
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'ابزارهای کاربردی' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_TOOL}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero || {}}
      featuredList={pageSettings.featuredList || []}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ ابزاری یافت نشد!"
      emptyStateDesc="محتوای این بخش در حال به‌روزرسانی است."
    />
  );
}