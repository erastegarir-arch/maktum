import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

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

export async function generateMetadata() {
  const settingsData = await getSetting('blog_page_settings');
  let pageSettings = {};
  try { pageSettings = settingsData ? JSON.parse(settingsData) : {}; } catch {}

  const title = pageSettings?.seo?.metaTitle || pageSettings?.hero?.title || 'اخبار، مقالات و پژوهش‌های تحلیلی';
  const description = pageSettings?.seo?.metaDescription || pageSettings?.hero?.subtitle || 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی پژوهشگران شبکه مکتوم.';

  return constructPageMetadata({
    title,
    description,
    path: '/blog',
  });
}

export default async function BlogFrontPage() {
  const [settingsData, rawDataFromDB] = await Promise.all([
    getSetting('blog_page_settings'),
    getContents({ type: 'BLOG', status: 'PUBLISHED', limit: 12 })
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
    url: `/blog/${item.slug}`
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'تارنگار' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_BLOG}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero || {}}
      featuredList={pageSettings.featuredList || []}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ مقاله‌ای یافت نشد!"
      emptyStateDesc="محتوای این بخش در حال به‌روزرسانی است."
    />
  );
}