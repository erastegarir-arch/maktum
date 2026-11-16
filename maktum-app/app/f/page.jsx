import SharedArchivePage from '@/app/components/frontend/SharedArchivePage';
import { getSetting } from '@/app/actions/settings';
import { getContents } from '@/app/actions/content';
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

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

export async function generateMetadata() {
  const settingsData = await getSetting('raw_page_settings');
  let pageSettings = {};
  try { pageSettings = settingsData ? JSON.parse(settingsData) : {}; } catch {}

  const title = pageSettings?.seo?.metaTitle || pageSettings?.hero?.title || 'پایگاه داده فوتیج و محتوای راش و خام';
  const description = pageSettings?.seo?.metaDescription || pageSettings?.hero?.subtitle || 'بارگیری رایگان راش‌های ویدیویی، فوتیج‌های مستند بدون واترمارک و اسناد خام در پلتفرم مکتوم.';

  return constructPageMetadata({
    title,
    description,
    path: '/f',
  });
}

export default async function RawContentFrontPage() {
  const [settingsData, rawDataFromDB] = await Promise.all([
    getSetting('raw_page_settings'),
    getContents({ type: 'RAW', status: 'PUBLISHED', limit: 12 })
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
    url: `/f/${item.slug}`
  }));

  const breadcrumbs = [
    { label: 'مکتوم', href: '/' },
    { label: 'محتوای خام و فوتیج' }
  ];

  return (
    <SharedArchivePage 
      activeTheme={THEME_RAW}
      breadcrumbs={breadcrumbs}
      hero={pageSettings.hero || {}}
      featuredList={pageSettings.featuredList || []}
      archiveItems={archiveItems}
      hasMore={archiveItems.length >= 12}
      emptyStateTitle="هیچ محتوای خامی یافت نشد!"
    />
  );
}