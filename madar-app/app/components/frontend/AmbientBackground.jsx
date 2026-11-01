// مسیر فایل: app/components/frontend/AmbientBackground.jsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

// ============================================================================
// تابع هوشمند برای جلوگیری از تداخل مسیرهای مشابه (مثل /p و /profile)
// این تابع بررسی می‌کند که مسیر "دقیقاً" برابر الگو باشد یا "زیرمجموعه واقعی" آن (با اسلش)
// ============================================================================
const isExactOrSub = (path, base) => path === base || path.startsWith(`${base}/`);

// ============================================================================
// ۱. بانک مرکزی پالت‌های رنگی (ادغام شده و رفع تداخل)
// ============================================================================
const THEME_REGISTRY = [
  {
    id: 'home-page',
    match: (p) => isExactOrSub(p, '/') || isExactOrSub(p, '/home'),
    colors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6'], // ۶ رنگ برای ۶ گوی
  },
  {
    id: 'dashboard-profile',
    match: (p) => isExactOrSub(p, '/profile') || isExactOrSub(p, '/dashboard'),
    colors: ['#06b6d4', '#d946ef', '#a855f7', '#3b82f6', '#ec4899', '#10b981'],
  },
  {
    id: 'search',
    match: (p) => isExactOrSub(p, '/search'),
    colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f43f5e', '#3b82f6', '#ec4899'],
  },
  {
    id: 'error-500',
    match: (p) => isExactOrSub(p, '/500') || isExactOrSub(p, '/error'),
    colors: ['#f43f5e', '#e11d48', '#9f1239', '#a855f7', '#fb7185', '#be123c'],
  },
  {
    id: 'error-403',
    match: (p) => isExactOrSub(p, '/403') || isExactOrSub(p, '/forbidden'),
    colors: ['#d946ef', '#f43f5e', '#a21caf', '#701a75', '#be123c', '#9d174d'],
  },
  {
    id: 'error-404',
    match: (p) => isExactOrSub(p, '/404') || isExactOrSub(p, '/not-found'),
    colors: ['#06b6d4', '#f43f5e', '#3b82f6', '#1e3a8a', '#9f1239', '#0ea5e9'],
  },
  {
    id: 'dossiers-hub',
    match: (p) => p === '/c' || p === '/collections', // هاب مرکزی باید دقیق مچ شود
    colors: ['#06b6d4', '#a855f7', '#e2e8f0', '#38bdf8', '#8b5cf6', '#c084fc'],
  },
  {
    id: 'dossier-detail',
    match: (p) => p.startsWith('/c/') || p.startsWith('/collections/'), // زیرمجموعه‌های هاب
    colors: ['#06b6d4', '#1e3a8a', '#6366f1', '#94a3b8', '#38bdf8', '#818cf8'],
  },
  {
    id: 'taxonomy-archives',
    match: (p) => isExactOrSub(p, '/t'),
    colors: ['#3b82f6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'],
  },
  {
    id: 'rules',
    match: (p) => isExactOrSub(p, '/rules') || isExactOrSub(p, '/terms') || isExactOrSub(p, '/privacy'),
    colors: ['#0ea5e9', '#6366f1', '#64748b', '#06b6d4', '#8b5cf6', '#3b82f6'],
  },
  {
    id: 'collaboration',
    match: (p) => isExactOrSub(p, '/collaboration'),
    colors: ['#06b6d4', '#fbbf24', '#10b981', '#8b5cf6', '#f43f5e', '#3b82f6'],
  },
  {
    id: 'auth',
    match: (p) => p.includes('/login') || p.includes('/auth'),
    colors: ['#06b6d4', '#1e1b4b', '#38bdf8', '#10b981', '#0891b2', '#0f172a'],
  },
  {
    id: 'about',
    match: (p) => isExactOrSub(p, '/about'),
    colors: ['#f59e0b', '#d97706', '#06b6d4', '#f8fafc', '#1e293b', '#fbbf24'],
  },
  {
    id: 'produced',
    match: (p) => isExactOrSub(p, '/p'), // تابع ما مشکل همپوشانی با /profile را حل می‌کند
    colors: ['#f43f5e', '#8b5cf6', '#06b6d4', '#e11d48', '#3b82f6', '#f59e0b'],
  },
  {
    id: 'raw',
    match: (p) => isExactOrSub(p, '/f'),
    colors: ['#eab308', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#d97706'],
  },
  {
    id: 'tools',
    match: (p) => isExactOrSub(p, '/tool'),
    colors: ['#10b981', '#06b6d4', '#14b8a6', '#3b82f6', '#8b5cf6', '#059669'],
  },
  {
    id: 'blog',
    match: (p) => isExactOrSub(p, '/blog'),
    colors: ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899'],
  }
];

const DEFAULT_PALETTE = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e'];

// ============================================================================
// ۲. ماتریس حرکتی
// ============================================================================
const ORB_MATRIX = [
  { pos: '-top-[12%] -right-[8%] w-[65vw] h-[65vw] max-w-[650px]', scale: [0.85, 1.25, 0.95, 0.85], opacity: [0.32, 0.44, 0.25, 0.32], x: [0, -90, 40, 0], y: [0, 70, -30, 0], duration: 18 },
  { pos: 'top-[5%] -left-[12%] w-[60vw] h-[60vw] max-w-[600px]', scale: [1.15, 0.8, 1.2, 1.15], opacity: [0.28, 0.38, 0.40, 0.25], x: [0, 100, -40, 0], y: [0, 60, 90, 0], duration: 22 },
  { pos: 'top-[38%] -right-[15%] w-[58vw] h-[58vw] max-w-[550px]', scale: [0.9, 1.3, 0.85, 0.9], opacity: [0.28, 0.32, 0.45, 0.28], x: [0, -110, -30, 0], y: [0, -80, 60, 0], duration: 20 },
  { pos: 'top-[45%] left-[8%] w-[55vw] h-[55vw] max-w-[520px]', scale: [1.2, 0.75, 1.1, 1.2], opacity: [0.27, 0.45, 0.25, 0.34], x: [0, 80, -70, 0], y: [0, -70, 50, 0], duration: 16 },
  { pos: '-bottom-[15%] -left-[8%] w-[65vw] h-[65vw] max-w-[650px]', scale: [0.8, 1.2, 0.95, 0.8], opacity: [0.45, 0.28, 0.32, 0.37], x: [0, 95, -30, 0], y: [0, -85, 20, 0], duration: 24 },
  { pos: '-bottom-[10%] right-[5%] w-[60vw] h-[60vw] max-w-[580px]', scale: [1.1, 0.85, 1.25, 1.1], opacity: [0.32, 0.45, 0.25, 0.32], x: [0, -85, 50, 0], y: [0, -65, -20, 0], duration: 19 },
];

export default function AmbientBackground() {
  const pathname = usePathname() || '/';
  
  // بررسی دسترسی‌پذیری سیستم کاربر
  const shouldReduceMotion = useReducedMotion();

  const isExcluded = pathname.startsWith('/admin') || pathname.startsWith('/portal-entry-99');

  const activeTheme = useMemo(() => {
    const found = THEME_REGISTRY.find((item) => item.match(pathname));
    return found ? found : { id: 'default', colors: DEFAULT_PALETTE };
  }, [pathname]);

  if (isExcluded) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060913]"
      aria-hidden="true"
    >
      {/* ۱. لایه گوی‌های نوری (تبدیل به انیمیشن فوق‌سبک با Color Morphing) */}
      <div className="absolute inset-0">
        {ORB_MATRIX.map((orb, idx) => {
          // چرخش هوشمند رنگ‌ها در صورت کمتر بودن تعداد رنگ‌ها از گوی‌ها
          const color = activeTheme.colors[idx % activeTheme.colors.length];
          
          return (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: color, // ترانزیشن مستقیم و زنده رنگ‌ها
                scale: orb.scale,
                opacity: orb.opacity,
                x: shouldReduceMotion ? 0 : orb.x,
                y: shouldReduceMotion ? 0 : orb.y,
              }}
              transition={{
                // ترانزیشن رنگ سریع‌تر انجام می‌شود تا کاربر تغییر صفحه را بلافاصله حس کند
                backgroundColor: { duration: 1.5, ease: 'easeInOut' },
                scale: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
                x: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
              }}
              className={`absolute rounded-full transform-gpu will-change-transform ${orb.pos}`}
              style={{
                // جایگزین جادویی فیلتر Blur که با GPU رندر می‌شود
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 40%, transparent 70%)',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 40%, transparent 70%)',
              }}
            />
          );
        })}
      </div>

      {/* ۲. ماسک وینیت (Vignette) برای وقار سازمانی */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 25%, rgba(5, 8, 16, 0.65) 100%)',
        }}
      />

      {/* ۳. لایه نویز سینماتیک برای جلوگیری از Color Banding */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}