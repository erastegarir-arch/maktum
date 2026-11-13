import { PrismaClient } from '@prisma/client';

// در جاوااسکریپت نیازی به تعریف تایپ نیست
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// فعال‌سازی حالت WAL و تنظیمات ضد-قفل
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
    console.error('❌ [SQLite] PRAGMA init error:', err);
  }
}

initSqliteHighConcurrency();