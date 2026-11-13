import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_CONFIG } from '@/lib/seo';

export async function GET() {
  // دریافت ۲۰ محتوای آخر منتشرشده
  const latestContents = await prisma.content.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: {
      titleBase: true,
      titleHighlight: true,
      metaDesc: true,
      subtitle: true,
      slug: true,
      type: true,
      publishedAt: true,
    }
  });

  // تولید کدهای XML استاندارد RSS 2.0
  const rssItemsXml = latestContents.map(content => {
    const fullTitle = `${content.titleBase || ''} ${content.titleHighlight || ''}`.trim();
    const desc = content.metaDesc || content.subtitle || '';
    
    // تعیین پیشوند نشانی بر اساس نوع محتوا
    let prefix = '/p';
    if (content.type === 'BLOG') prefix = '/blog';
    if (content.type === 'RAW') prefix = '/f';
    if (content.type === 'TOOL') prefix = '/tool';

    const url = `${SITE_URL}${prefix}/${content.slug}`;

    return `
      <item>
        <title><![CDATA[${fullTitle}]]></title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <description><![CDATA[${desc}]]></description>
        <pubDate>${new Date(content.publishedAt || new Date()).toUTCString()}</pubDate>
      </item>
    `;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${SITE_CONFIG.title}</title>
        <link>${SITE_URL}</link>
        <description>${SITE_CONFIG.description}</description>
        <language>fa-IR</language>
        <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
        ${rssItemsXml}
      </channel>
    </rss>
  `;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate', // کش یک ساعته برای سرعت بالا
    },
  });
}