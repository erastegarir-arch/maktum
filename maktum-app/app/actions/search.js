'use server';

import { prisma } from '@/lib/prisma';

// نگهبان جلوگیری از پر شدن دیتابیس در صورت جستجوهای رگباری تکراری
const searchLogCooldown = new Map();

// تابع دقیق تشخیص مسیر صحیح هر نوع محتوا (جلوگیری از خطای 404 در راش و تولیدات)
function getPrefixByType(type) {
  const t = type?.toUpperCase();
  if (t === 'BLOG') return '/blog';
  if (t === 'RAW') return '/f';
  if (t === 'PRODUCED') return '/p';
  if (t === 'TOOL') return '/tool';
  return '/p';
}

// موتور کاوش جامع مکتوم با قابلیت وزن‌دهی و صفحه‌بندی
export async function searchArchive({ keyword, filters = [], page = 1, limit = 8 }) {
  try {
    const safeKeyword = typeof keyword === 'string' ? keyword.trim().slice(0, 100) : '';
    
    if (safeKeyword.length < 2) {
      return { success: true, data: [], hasMore: false };
    }

    const skip = (Math.max(1, Number(page) || 1) - 1) * limit;

    // ۱. آماده‌سازی صافی‌ها
    const contentTypes = ['PRODUCED', 'RAW', 'BLOG', 'TOOL'];
    let searchContents = true;
    let searchDossiers = true;
    let activeContentTypes = contentTypes;

    if (Array.isArray(filters) && filters.length > 0) {
      searchDossiers = filters.includes('DOSSIER');
      activeContentTypes = filters.filter(f => contentTypes.includes(f));
      searchContents = activeContentTypes.length > 0;
    }

    // ۲. اجرای کوئری‌ها به صورت همزمان (Parallel Promise)
    let contentResults = [];
    let dossierResults = [];
    const queries = [];

    if (searchContents) {
      queries.push(
        prisma.content.findMany({
          where: {
            status: 'PUBLISHED',
            type: { in: activeContentTypes },
            OR: [
              { titleBase: { contains: safeKeyword } },
              { titleHighlight: { contains: safeKeyword } },
              { categories: { some: { name: { contains: safeKeyword } } } },
              { tags: { some: { name: { contains: safeKeyword } } } },
              { creators: { some: { name: { contains: safeKeyword } } } },
              { subtitle: { contains: safeKeyword } },
              { lead: { contains: safeKeyword } },
              { metaDesc: { contains: safeKeyword } },
              { body: { contains: safeKeyword } }
            ]
          },
          include: {
            categories: { select: { name: true } }
          },
          orderBy: { publishedAt: 'desc' },
          take: limit + 1,
          skip: skip
        }).then(res => { contentResults = res; })
      );
    }

    if (searchDossiers) {
      queries.push(
        prisma.dossier.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: safeKeyword } },
              { preTitle: { contains: safeKeyword } },
              { description: { contains: safeKeyword } },
              { metaDesc: { contains: safeKeyword } },
              { taxonomies: { some: { name: { contains: safeKeyword } } } }
            ]
          },
          orderBy: { publishedAt: 'desc' },
          take: limit + 1,
          skip: skip
        }).then(res => { dossierResults = res; })
      );
    }

    await Promise.all(queries);

    // ۳. یکپارچه‌سازی و قالب‌بندی نتایج با لینک‌های اصلاح‌شده (/f و /p)
    const formattedContents = contentResults.map(item => ({
      id: item.id,
      type: item.type,
      title: `${item.titleBase} ${item.titleHighlight || ''}`.trim(),
      subtitle: item.subtitle || item.lead || item.readTime || '',
      image: item.coverDesktop || item.coverMobile || '',
      url: `${getPrefixByType(item.type)}/${item.slug}`,
      category: item.categories?.[0]?.name || getCategoryName(item.type),
      date: item.publishedAt,
      color: getColorByType(item.type)
    }));

    const formattedDossiers = dossierResults.map(item => ({
      id: item.id,
      type: 'DOSSIER',
      title: item.title,
      subtitle: item.preTitle || item.description || '',
      image: item.coverDesktop || item.hubCoverDesktop || '',
      url: `/c/${item.slug}`,
      category: 'پرونده ویژه (منظومه)',
      date: item.publishedAt,
      color: item.themeColor || '#06b6d4'
    }));

    const combinedResults = [...formattedDossiers, ...formattedContents];
    combinedResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    const hasMore = combinedResults.length > limit;
    const finalResults = combinedResults.slice(0, limit);

    // ۴. ذخیره هوشمند لاگ کاوش (با محافظ ضداسپم ۱۰ ثانیه‌ای برای کلمات تکراری)
    if (page === 1) {
      const now = Date.now();
      const lastLogged = searchLogCooldown.get(safeKeyword) || 0;
      if (now - lastLogged > 10000) {
        searchLogCooldown.set(safeKeyword, now);
        if (searchLogCooldown.size > 1000) searchLogCooldown.clear();

        prisma.searchLog.create({
          data: {
            keyword: safeKeyword,
            resultsCount: contentResults.length + dossierResults.length 
          }
        }).catch(err => console.error('Failed to log search:', err));
      }
    }

    return { 
      success: true, 
      data: finalResults,
      hasMore: hasMore 
    };

  } catch (error) {
    console.error("Search Error:", error);
    return { success: false, error: 'خطا در ارتباط با پایگاه داده کاوش', data: [] };
  }
}

function getCategoryName(type) {
  switch (type) {
    case 'BLOG': return 'مقاله';
    case 'RAW': return 'سند خام';
    case 'PRODUCED': return 'محتوای تولیدی';
    case 'TOOL': return 'ابزار';
    default: return 'محتوا';
  }
}

function getColorByType(type) {
  switch (type) {
    case 'BLOG': return '#a855f7';
    case 'RAW': return '#fbbf24';
    case 'PRODUCED': return '#06b6d4';
    case 'TOOL': return '#10b981';
    default: return '#6b7280';
  }
}