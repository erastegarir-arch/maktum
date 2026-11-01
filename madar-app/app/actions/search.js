'use server';

import { prisma } from '@/lib/prisma';

// موتور جستجوی جامع مدار با قابلیت وزن‌دهی و صفحه‌بندی
export async function searchArchive({ keyword, filters = [], page = 1, limit = 8 }) {
  try {
    const safeKeyword = keyword?.trim() || '';
    
    // اگر طول کلمه کمتر از ۲ حرف بود، برای جلوگیری از فشار به دیتابیس جستجو متوقف می‌شود
    if (safeKeyword.length < 2) {
      return { success: true, data: [], hasMore: false };
    }

    const skip = (page - 1) * limit;

    // ۱. آماده‌سازی فیلترها (اگر فیلتری انتخاب نشده بود، همه چیز جستجو می‌شود)
    const contentTypes = ['PRODUCED', 'RAW', 'BLOG', 'TOOL'];
    let searchContents = true;
    let searchDossiers = true;
    let activeContentTypes = contentTypes;

    if (filters.length > 0) {
      searchDossiers = filters.includes('DOSSIER');
      activeContentTypes = filters.filter(f => contentTypes.includes(f));
      searchContents = activeContentTypes.length > 0;
    }

    // ۲. اجرای کوئری‌ها به صورت همزمان (Parallel Promise) برای بالاترین سرعت ممکن
    let contentResults = [];
    let dossierResults = [];
    const queries = [];

    // جستجو در جدول محتوا (مقالات، تولیدات، ابزارها، راش‌ها)
    if (searchContents) {
      queries.push(
        prisma.content.findMany({
          where: {
            status: 'PUBLISHED',
            type: { in: activeContentTypes },
            OR: [
              // وزن اول: تطبیق مستقیم در عناوین اصلی
              { titleBase: { contains: safeKeyword } },
              { titleHighlight: { contains: safeKeyword } },
              // وزن دوم: جستجوی رابطه‌ای (اگر کلمه در نام دسته‌بندی، هشتگ یا سازنده بود)
              { categories: { some: { name: { contains: safeKeyword } } } },
              { tags: { some: { name: { contains: safeKeyword } } } },
              { creators: { some: { name: { contains: safeKeyword } } } },
              // وزن سوم: توضیحات و لید
              { subtitle: { contains: safeKeyword } },
              { lead: { contains: safeKeyword } },
              { metaDesc: { contains: safeKeyword } },
              // وزن چهارم: بدنه متن (در SQLite با Contains سرچ می‌شود)
              { body: { contains: safeKeyword } }
            ]
          },
          include: {
            categories: { select: { name: true } }
          },
          orderBy: { publishedAt: 'desc' },
          take: limit + 1, // یکی بیشتر می‌گیریم تا بفهمیم آیا صفحه بعدی وجود دارد یا نه
          skip: skip
        }).then(res => contentResults = res)
      );
    }

    // جستجو در جدول پرونده‌های باز (منظومه‌ها / Dossiers)
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
        }).then(res => dossierResults = res)
      );
    }

    // منتظر می‌مانیم تا هر دو کوئری به صورت موازی تمام شوند
    await Promise.all(queries);

    // ۳. یکپارچه‌سازی و فرمت‌بندی نتایج برای فرانت‌اند (Bento Grid)
    const formattedContents = contentResults.map(item => ({
      id: item.id,
      type: item.type, // 'BLOG', 'RAW', 'PRODUCED', 'TOOL'
      title: `${item.titleBase} ${item.titleHighlight || ''}`.trim(),
      subtitle: item.subtitle || item.lead || item.readTime || '',
      image: item.coverDesktop || item.coverMobile || '',
      url: `/${item.type.toLowerCase()}/${item.slug}`,
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

    // ترکیب همه نتایج و سورت کردن مجدد براساس تاریخ انتشار
    const combinedResults = [...formattedDossiers, ...formattedContents];
    combinedResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    // تشخیص دکمه «نمایش بیشتر»
    const hasMore = combinedResults.length > limit;
    const finalResults = combinedResults.slice(0, limit);

    // ۴. ذخیره لاگ جستجو به صورت Fire-and-Forget (بدون ایجاد تاخیر برای کاربر)
    if (page === 1) {
      prisma.searchLog.create({
        data: {
          keyword: safeKeyword,
          // ثبت تعداد واقعی نتایجی که پیدا شد
          resultsCount: contentResults.length + dossierResults.length 
        }
      }).catch(err => console.error('Failed to log search:', err));
    }

    return { 
      success: true, 
      data: finalResults,
      hasMore: hasMore 
    };

  } catch (error) {
    console.error("Search Error:", error);
    return { success: false, error: 'خطا در ارتباط با پایگاه داده جستجو', data: [] };
  }
}

// ------------------------------------------------
// توابع کمکی برای تزریق رنگ و نام فارسی به فرانت‌اند
// ------------------------------------------------
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
    case 'BLOG': return '#a855f7'; // بنفش
    case 'RAW': return '#fbbf24';  // کهربایی
    case 'PRODUCED': return '#06b6d4'; // فیروزه‌ای
    case 'TOOL': return '#10b981'; // سبز
    default: return '#6b7280'; // خاکستری
  }
}