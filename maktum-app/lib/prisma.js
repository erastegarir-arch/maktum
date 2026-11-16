import { PrismaClient } from '@prisma/client';

// نگهداری اتصال در حافظه سراسری سرور برای جلوگیری از باز شدن اتصال‌های تکراری
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// ذخیره در تمام محیط‌ها (چه آزمایشی و چه سرور اصلی) برای پایداری کامل
globalForPrisma.prisma = prisma;

// فعال‌سازی حالت WAL و تنظیمات ضد-قفل دیتابیس SQLite
async function initSqliteHighConcurrency() {
  if (globalForPrisma.prismaInitialized) return;
  
  try {
    globalForPrisma.prismaInitialized = true;
    
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
    await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;');
    await prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;');
    await prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;');
    
    console.log('✅ [SQLite] WAL Mode & High Concurrency PRAGMAs activated.');
  } catch (err) {
    globalForPrisma.prismaInitialized = false; // اگر خطا داد، دفعه بعد دوباره تلاش کند
    console.error('❌ [SQLite] PRAGMA init error:', err);
  }
}

initSqliteHighConcurrency();