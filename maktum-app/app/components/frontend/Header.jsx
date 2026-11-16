'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '@/app/components/Icon';
import SearchModal from '@/app/components/frontend/SearchModal';
import AuthModal from '@/app/components/frontend/AuthModal';
import { getSetting } from '@/app/actions/settings';
import { getSessionUser } from '@/app/actions/auth';
import { getUserUnreadNotificationCountAction } from '@/app/actions/notifications';

const cn = (...inputs) => twMerge(clsx(inputs));

// حافظه کش سطح ماژول برای جلوگیری از چشمک زدن یا درخواست تکراری هنگام جابه‌جایی بین صفحات
let cachedHeaderSettings = null;

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// ایمن‌سازی نشانی‌های پیوند در برابر پروتکل‌های مخرب (XSS Protection)
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '#';
  return trimmed;
};

// پاکسازی عمیق کدهای SVG در برابر اسکریپت‌ها و رویدادهای مخرب
const sanitizeSvg = (svg) => {
  if (!svg || typeof svg !== 'string') return '';
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<(iframe|object|embed|foreignObject)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(?:href|xlink:href)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');
};

// یکسان‌سازی ساختار مورد‌های منو (پشتیبانی هم‌زمان از title/url و label/href)
const normalizeNavItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, idx) => ({
      id: item?.id || idx,
      label: (item?.label ?? item?.title ?? '').trim(),
      href: sanitizeUrl(item?.href ?? item?.url ?? '#'),
    }))
    .filter((item) => item.label !== '');
};

// استخراج همگام (Synchronous) تنظیمات اولیه در لحظه صفر برای جلوگیری از خالی آمدن هدر (CLS = 0)
const buildInitialHeaderState = (initialData) => {
  if (cachedHeaderSettings) return cachedHeaderSettings;

  let parsedSettings = {};
  if (initialData?.headerSettings) {
    try {
      parsedSettings =
        typeof initialData.headerSettings === 'string'
          ? JSON.parse(initialData.headerSettings)
          : initialData.headerSettings;
    } catch (e) {}
  }

  let rawLinks = parsedSettings?.navItems || initialData?.headerLinks || [];
  if (typeof rawLinks === 'string') {
    try {
      rawLinks = JSON.parse(rawLinks);
    } catch (e) {
      rawLinks = [];
    }
  }

  const rawLogo =
    parsedSettings?.logoIcon ??
    parsedSettings?.headerIcon ??
    initialData?.headerIcon ??
    '';
  const cleanLogo = rawLogo === 'allah' ? '' : (rawLogo || '').trim();

  const initialState = {
    logoIcon: cleanLogo,
    logoColor: parsedSettings?.logoColor || '#06b6d4',
    logoHoverColor: parsedSettings?.logoHoverColor || '#38bdf8',
    siteTitle: parsedSettings?.siteTitle ?? initialData?.headerText ?? 'مکتوم',
    showSiteTitle: parsedSettings?.showSiteTitle !== false,
    activeColor: parsedSettings?.activeColor || '#06b6d4',
    navItems: normalizeNavItems(rawLinks),
    mobileHeaderCenterImg: parsedSettings?.mobileHeaderCenterImg || '',
    bottomNavLinks: Array.isArray(parsedSettings?.bottomNavLinks)
      ? parsedSettings.bottomNavLinks
      : [],
  };

  if (initialData && Object.keys(initialData).length > 0) {
    cachedHeaderSettings = initialState;
  }

  return initialState;
};

function HeaderTooltip({ text, pulse = false, children }) {
  if (!text) return children;
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      {children}
      <div
        role="tooltip"
        className="absolute top-full mt-3 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none animate-[fadeIn_0.18s_ease-out]"
      >
        <div
          className={cn(
            'w-1.5 h-1.5 bg-[#081020]/80 rotate-45 -mb-1 z-10 border-l border-t',
            pulse ? 'border-[#06b6d4]/40' : 'border-white/20'
          )}
        />
        {pulse ? (
          <motion.div
            animate={{
              opacity: [0.85, 1, 0.85],
              scale: [0.98, 1.02, 0.98],
              boxShadow: [
                '0 8px 20px rgba(0,0,0,0.45), 0 0 8px rgba(6,182,212,0.15)',
                '0 8px 25px rgba(0,0,0,0.55), 0 0 18px rgba(6,182,212,0.45)',
                '0 8px 20px rgba(0,0,0,0.45), 0 0 8px rgba(6,182,212,0.15)',
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-[#081020]/75 border border-[#06b6d4]/40 backdrop-blur-2xl backdrop-saturate-150 text-cyan-300 text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap font-sans font-bold"
          >
            {text}
          </motion.div>
        ) : (
          <div className="bg-[#081020]/75 border border-white/15 backdrop-blur-2xl backdrop-saturate-150 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] whitespace-nowrap font-sans font-bold">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Header({ initialData = {} }) {
  const pathname = usePathname();
  const [hoveredNavIdx, setHoveredNavIdx] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextScrolled = latest > 10;
    setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [brokenHeaderImgs, setBrokenHeaderImgs] = useState({});

  const markImgBroken = (url) => {
    if (!url) return;
    setBrokenHeaderImgs((prev) => ({ ...prev, [url]: true }));
  };

  const [headerSettings, setHeaderSettings] = useState(() =>
    buildInitialHeaderState(initialData)
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialData() {
      try {
        const [storedSettingsStr, fallbackLinksStr, session] =
          await Promise.all([
            getSetting('header_settings'),
            getSetting('header_links'),
            getSessionUser(),
          ]);

        if (isCancelled) return;

        if (storedSettingsStr) {
          try {
            const parsed = JSON.parse(storedSettingsStr);
            let fallbackLinks = [];
            if (fallbackLinksStr) {
              try {
                fallbackLinks = JSON.parse(fallbackLinksStr);
              } catch (e) {}
            }

            const resolvedNavItems = normalizeNavItems(
              Array.isArray(parsed.navItems) && parsed.navItems.length > 0
                ? parsed.navItems
                : fallbackLinks
            );

            const rawLogo =
              parsed.logoIcon ??
              parsed.headerIcon ??
              parsed.icon ??
              parsed.logo ??
              '';
            const cleanLogo = rawLogo === 'allah' ? '' : (rawLogo || '').trim();

            const nextSettings = {
              logoIcon: cleanLogo,
              logoColor: parsed.logoColor || '#06b6d4',
              logoHoverColor: parsed.logoHoverColor || '#38bdf8',
              siteTitle: parsed.siteTitle ?? 'مکتوم',
              showSiteTitle: parsed.showSiteTitle !== false,
              activeColor: parsed.activeColor || '#06b6d4',
              navItems: resolvedNavItems,
              mobileHeaderCenterImg: parsed.mobileHeaderCenterImg || '',
              bottomNavLinks: Array.isArray(parsed.bottomNavLinks)
                ? parsed.bottomNavLinks
                : [],
            };

            cachedHeaderSettings = nextSettings;
            setHeaderSettings(nextSettings);
          } catch (e) {}
        }

        if (session) {
          setIsLoggedIn(true);
          const count = await getUserUnreadNotificationCountAction();
          if (!isCancelled) setUnreadNotifications(count || 0);
        } else {
          setIsLoggedIn(false);
          setUnreadNotifications(0);
        }
      } catch (e) {
        console.error('خطا در دریافت اطلاعات تکمیلی هدر:', e);
      }
    }

    loadInitialData();
    return () => {
      isCancelled = true;
    };
  }, []);

  if (
    pathname?.startsWith('/portal-entry-99') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const isProfilePage = pathname?.startsWith('/profile');
  const activeColor = headerSettings.activeColor || '#06b6d4';
  const cleanLogoIcon = (headerSettings.logoIcon || '').trim();
  const hasLogoIcon = Boolean(
    cleanLogoIcon !== '' &&
      !brokenHeaderImgs[cleanLogoIcon] &&
      (cleanLogoIcon.startsWith('<svg') ||
        cleanLogoIcon.startsWith('http') ||
        cleanLogoIcon.startsWith('/') ||
        cleanLogoIcon.startsWith('.'))
  );
  const hasSiteTitle = Boolean(
    headerSettings.showSiteTitle !== false && headerSettings.siteTitle?.trim()
  );
  const hasBrandElement = hasLogoIcon || hasSiteTitle;

  const renderLogoIcon = (sizeClass = 'w-7 h-7') => {
    if (!hasLogoIcon) return null;

    if (cleanLogoIcon.startsWith('<svg')) {
      return (
        <div
          className={cn(
            sizeClass,
            'flex items-center justify-center text-[var(--logo-color)] md:group-hover:text-[var(--logo-hover-color)] transition-colors duration-300 [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]'
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(cleanLogoIcon) }}
        />
      );
    }

    return (
      <img
        src={cleanLogoIcon}
        onError={() => markImgBroken(cleanLogoIcon)}
        alt={headerSettings.siteTitle || 'لوگوی مکتوم'}
        decoding="async"
        className={cn(
          sizeClass,
          'object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]'
        )}
      />
    );
  };

  const safeBottomNavLinks = Array.isArray(headerSettings.bottomNavLinks)
    ? headerSettings.bottomNavLinks
    : [];

  return (
    <>
      {/* ======================================================================= */}
      {/* هماهنگ‌ساز خودکار لایه‌ها (Stacking Context) برای منوهای چسبان صفحات */}
      {/* تضمین قرارگیری باکس‌های عادی زیر هاله (z<25) و منوهای چسبان روی هاله (z=35) */}
      {/* ======================================================================= */}
      <style dangerouslySetInnerHTML={{ __html: `
        #maktum-top-halo ~ *:has(.sticky),
        #maktum-top-halo ~ * :is(main, section, article, div):has(.sticky):not(.sticky) {
          z-index: auto !important;
          isolation: auto !important;
        }
        #maktum-top-halo ~ * .sticky {
          z-index: 35 !important;
        }
        #maktum-top-halo ~ * .fixed.top-0 {
          z-index: 55 !important;
        }
      `}} />

      {/* ======================================================================= */}
      {/* ۱. هاله تیره پوشش شکاف بالای هدر و منوهای چسبان (لایه z-[25]) */}
      {/* بالاتر از باکس‌های صفحه (z-0..20) و پایین‌تر از منوهای چسبان (z-35) و هدر (z-40) */}
      {/* ======================================================================= */}
      <div
        id="maktum-top-halo"
        aria-hidden="true"
        className={cn(
          'fixed top-0 inset-x-0 z-[25] pointer-events-none select-none transition-opacity duration-300',
          'h-9 md:h-12',
          isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-90'
        )}
        style={{
          background:
            'linear-gradient(180deg, rgba(8, 15, 30, 0.98) 0%, rgba(8, 15, 30, 0.85) 42%, rgba(8, 15, 30, 0.35) 75%, transparent 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          maskImage:
            'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
        }}
      />

      {/* ======================================================================= */}
      {/* ۲. هدر شناور دسکتاپ (لایه z-40) */}
      {/* ======================================================================= */}
      <header className="hidden md:block fixed top-4 inset-x-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans select-none pointer-events-none">
        <motion.div
          animate={{
            padding: isScrolled ? '0px 12px' : '0px 0px',
            y: isScrolled ? -6 : 0,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative rounded-full overflow-visible group pointer-events-auto mx-auto transition-all transform-gpu"
        >
          {/* پس‌زمینه گلس‌مورفیسم کریستالی و شفاف با بلور عمیق */}
          <div
            className={cn(
              'absolute inset-0 rounded-full pointer-events-none -z-10 transition-all duration-300 border transform-gpu backdrop-blur-2xl backdrop-saturate-150',
              isScrolled
                ? 'bg-[#081020]/55 border-white/[0.13] shadow-[0_12px_32px_rgba(4,9,20,0.5),inset_0_1px_1px_rgba(255,255,255,0.16),inset_0_0_20px_rgba(255,255,255,0.03)]'
                : 'bg-[#081020]/32 border-white/[0.09] shadow-[0_6px_22px_rgba(4,9,20,0.3),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_0_15px_rgba(255,255,255,0.02)]'
            )}
          />

          {/* خط نوری فیروزه‌ای بالای هدر */}
          <div className="absolute top-0 inset-x-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-85 pointer-events-none z-20" />

          <motion.div
            animate={{
              paddingTop: isScrolled ? '0.45rem' : '0.65rem',
              paddingBottom: isScrolled ? '0.45rem' : '0.65rem',
            }}
            transition={{ duration: 0.3 }}
            className="px-6 flex items-center justify-between relative z-10"
          >
            <div className="flex items-center gap-5">
              {hasBrandElement && (
                <Link
                  href="/"
                  aria-label={headerSettings.siteTitle || 'صفحه اصلی'}
                  className="flex items-center gap-2.5 group cursor-pointer shrink-0"
                >
                  {hasLogoIcon && (
                    <div
                      className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        '--logo-color': headerSettings.logoColor || '#06b6d4',
                        '--logo-hover-color':
                          headerSettings.logoHoverColor || '#38bdf8',
                      }}
                    >
                      {renderLogoIcon('w-7 h-7')}
                    </div>
                  )}

                  {hasSiteTitle && (
                    <span className="font-black text-lg lg:text-xl text-white group-hover:text-[#06b6d4] transition-colors duration-300 font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wide">
                      {headerSettings.siteTitle}
                    </span>
                  )}
                </Link>
              )}

              <nav
                aria-label="منوی اصلی سامانه"
                onMouseLeave={() => setHoveredNavIdx(null)}
                className={cn(
                  'hidden md:flex items-center gap-1',
                  hasBrandElement ? 'mr-1' : 'mr-0'
                )}
              >
                {headerSettings.navItems?.map((item, idx) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' &&
                      (pathname === item.href ||
                        pathname?.startsWith(item.href + '/')));

                  return (
                    <Link
                      key={item.id || item.href || idx}
                      href={item.href || '#'}
                      aria-current={isActive ? 'page' : undefined}
                      onMouseEnter={() => setHoveredNavIdx(idx)}
                      style={{ '--active-color': activeColor }}
                      className={cn(
                        'relative text-sm font-bold transition-colors duration-300 cursor-pointer flex items-center font-sans rounded-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
                        isScrolled ? 'py-1.5 px-3.5' : 'py-2 px-4',
                        isActive
                          ? 'text-[var(--active-color)]'
                          : 'text-gray-200 hover:text-white'
                      )}
                    >
                      {hoveredNavIdx === idx && (
                        <motion.span
                          layoutId="headerHoverPill"
                          className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/[0.08] -z-10"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}

                      <span className="relative z-10">{item.label}</span>

                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          style={{
                            backgroundColor: activeColor,
                            boxShadow: `0 0 12px ${activeColor}`,
                          }}
                          className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* دکمه‌های سمت چپ هدر دسکتاپ */}
            <div className="flex items-center gap-2.5">
              <HeaderTooltip text="کاوش در سامانه">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="کاوش در سامانه"
                  aria-haspopup="dialog"
                  aria-expanded={isSearchOpen}
                  id="desktop-search-btn"
                  onClick={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsSearchOpen(true);
                    }
                  }}
                  className={cn(
                    'rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.09] hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center text-gray-200 hover:text-[#06b6d4] transition-all duration-300 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] z-[60]',
                    isScrolled ? 'w-8 h-8' : 'w-9 h-9'
                  )}
                >
                  <Icon
                    name="search"
                    className={cn(
                      'pointer-events-none transition-all',
                      isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
                    )}
                  />
                </div>
              </HeaderTooltip>

              {isLoggedIn ? (
                !isProfilePage && (
                  <HeaderTooltip text="ورود به حساب کاربری">
                    <Link
                      href="/profile"
                      id="desktop-user-btn"
                      aria-label="حساب کاربری"
                      className={cn(
                        'relative rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.09] hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center text-gray-200 hover:text-[#06b6d4] transition-all duration-300 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] z-10',
                        isScrolled ? 'w-8 h-8' : 'w-9 h-9'
                      )}
                    >
                      <Icon
                        name="user"
                        className={cn(
                          'pointer-events-none transition-all',
                          isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
                        )}
                      />

                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20 pointer-events-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center border border-[#0b0f19] font-sans pt-0.5 shadow-md">
                            {unreadNotifications > 9
                              ? '+۹'
                              : toPersianDigits(unreadNotifications)}
                          </span>
                        </span>
                      )}
                    </Link>
                  </HeaderTooltip>
                )
              ) : (
                !isProfilePage && (
                  <HeaderTooltip text="ورود یا عضویت" pulse={true}>
                    <div
                      role="button"
                      tabIndex={0}
                      id="desktop-auth-btn"
                      aria-label="ورود یا عضویت"
                      aria-haspopup="dialog"
                      aria-expanded={isAuthOpen}
                      onClick={() => setIsAuthOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsAuthOpen(true);
                        }
                      }}
                      className={cn(
                        'rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.09] hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/15 hover:shadow-[0_0_18px_rgba(6,182,212,0.25)] text-gray-200 hover:text-[#06b6d4] text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] z-10',
                        isScrolled ? 'px-3 py-1.5' : 'px-4 py-2'
                      )}
                    >
                      <Icon
                        name="user"
                        className={cn(
                          'text-[#06b6d4] pointer-events-none transition-all',
                          isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
                        )}
                      />
                      <span>ورود / عضویت</span>
                    </div>
                  </HeaderTooltip>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* ======================================================================= */}
      {/* ۳. نوار بالای موبایل (لوگوی مکتوم دقیقاً هم‌اندازه با آیکون کاربری: 42x42) */}
      {/* ======================================================================= */}
      <div
        className="md:hidden absolute top-4 inset-x-4 z-30 flex items-center justify-between font-sans select-none pointer-events-none"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center shrink-0 w-[42px] h-[42px] pointer-events-auto">
          {hasLogoIcon && (
            <Link
              href="/"
              aria-label={headerSettings.siteTitle || 'صفحه اصلی مکتوم'}
              style={{ '--logo-color': headerSettings.logoColor || '#06b6d4' }}
              className="flex items-center justify-center w-[42px] h-[42px] active:scale-95 transition-transform duration-200"
            >
              {renderLogoIcon('w-[42px] h-[42px]')}
            </Link>
          )}
        </div>

        <div className="flex-1 flex justify-center items-center px-3 h-full pointer-events-auto">
          {headerSettings.mobileHeaderCenterImg && !brokenHeaderImgs[headerSettings.mobileHeaderCenterImg] && (
            <img
              src={headerSettings.mobileHeaderCenterImg}
              onError={() => markImgBroken(headerSettings.mobileHeaderCenterImg)}
              alt={headerSettings.siteTitle || 'بنر هدر'}
              decoding="async"
              className="max-h-12 max-w-full object-contain drop-shadow-lg"
            />
          )}
        </div>

        {/* فضای متقارن سمت چپ هم‌اندازه با آیکون کاربری (42px) برای وسط‌چین ماندن دقیق بنر */}
        <div className="w-[42px] h-[42px] shrink-0" />
      </div>

      {/* ======================================================================= */}
      {/* ۴. نماد کاربری موبایل و دکمه کاوش (مخفی در صفحه پروفایل طبق تنظیمات اختصاصی) */}
      {/* ======================================================================= */}
      {!isProfilePage && (
        <>
          <div
            id="mobile-user-container"
            className="md:hidden fixed top-4 left-4 z-[90] flex items-center justify-start font-sans select-none pointer-events-auto"
            dir="rtl"
          >
            {isLoggedIn ? (
              <Link
                href="/profile"
                id="mobile-user-btn"
                aria-label="حساب کاربری"
                className="relative flex items-center justify-center w-[42px] h-[42px] rounded-full bg-[#081020]/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 text-[#06b6d4] shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.16)] hover:bg-[#06b6d4]/20 active:scale-95 transition-all z-[90]"
              >
                <Icon name="user" className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center border border-[#0b0f19] font-sans pt-0.5 shadow-md">
                      {unreadNotifications > 9
                        ? '+۹'
                        : toPersianDigits(unreadNotifications)}
                    </span>
                  </span>
                )}
              </Link>
            ) : (
              <div className="relative flex flex-col items-start group">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="ورود یا عضویت"
                  aria-haspopup="dialog"
                  aria-expanded={isAuthOpen}
                  onClick={() => setIsAuthOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsAuthOpen(true);
                    }
                  }}
                  className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-[#081020]/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 text-gray-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.16)] cursor-pointer z-[90]"
                >
                  <Icon name="user" className="w-5 h-5 pointer-events-none" />
                </div>

                {/* تولتیپ ورود | عضویت با حالت چشمک‌زن نرم */}
                <motion.span
                  onClick={() => setIsAuthOpen(true)}
                  animate={{
                    opacity: [0.75, 1, 0.75],
                    scale: [0.97, 1.03, 0.97],
                    boxShadow: [
                      '0 4px 12px rgba(0,0,0,0.25), 0 0 6px rgba(6,182,212,0.12), inset 0 1px 1px rgba(255,255,255,0.12)',
                      '0 6px 18px rgba(0,0,0,0.35), 0 0 16px rgba(6,182,212,0.42), inset 0 1px 1px rgba(255,255,255,0.22)',
                      '0 4px 12px rgba(0,0,0,0.25), 0 0 6px rgba(6,182,212,0.12), inset 0 1px 1px rgba(255,255,255,0.12)',
                    ],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-full mt-2 left-0 whitespace-nowrap text-[10px] font-bold bg-[#081020]/55 backdrop-blur-2xl backdrop-saturate-150 border border-[#06b6d4]/35 text-cyan-300 px-3 py-1.5 rounded-xl cursor-pointer z-[80]"
                >
                  ورود | عضویت
                </motion.span>
              </div>
            )}
          </div>

          <div
            role="button"
            tabIndex={0}
            id="mobile-search-btn"
            aria-label="کاوش در سامانه"
            aria-haspopup="dialog"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSearchOpen(true);
              }
            }}
            className="md:hidden fixed bottom-[82px] left-4 z-[60] w-11 h-11 rounded-full bg-[#081020]/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.14] text-gray-200 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_8px_25px_rgba(0,0,0,0.45)] hover:text-white hover:bg-[#06b6d4]/20 active:scale-90 transition-all cursor-pointer pointer-events-auto"
          >
            <Icon name="search" className="w-5 h-5 pointer-events-none" />
          </div>
        </>
      )}

      {/* ======================================================================= */}
      {/* ۵. هاله تیره و نوری پایین صفحه موبایل (به سبک تلگرام - لایه z-[38]) */}
      {/* ======================================================================= */}
      <div
        id="maktum-bottom-halo"
        aria-hidden="true"
        className="md:hidden fixed bottom-0 inset-x-0 h-20 z-[38] pointer-events-none select-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(6, 182, 212, 0.14) 0%, transparent 70%), linear-gradient(0deg, rgba(6, 11, 22, 0.96) 0%, rgba(8, 15, 30, 0.8) 45%, rgba(8, 15, 30, 0.25) 78%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage:
            'linear-gradient(0deg, black 0%, black 48%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(0deg, black 0%, black 48%, transparent 100%)',
        }}
      />

      {/* ======================================================================= */}
      {/* ۶. منوی ناوبری چسبان پایین موبایل (لایه z-40 با فاصله نزدیک به لبه پایین) */}
      {/* ======================================================================= */}
      <nav
        aria-label="منوی ناوبری موبایل"
        className="md:hidden fixed bottom-2.5 inset-x-4 z-40 pb-[env(safe-area-inset-bottom,0px)] font-sans select-none pointer-events-none"
        dir="rtl"
      >
        <div className="relative rounded-3xl shadow-[0_14px_38px_rgba(2,6,15,0.65)] border border-white/[0.13] pointer-events-auto">
          {/* خط نوری ظریف بالای نوار ناوبری موبایل */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

          <div className="absolute inset-0 rounded-3xl bg-[#081020]/52 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_22px_rgba(6,182,212,0.04)] pointer-events-none -z-10 overflow-hidden" />

          <div className="flex items-center justify-around px-2 py-1.5 h-[60px] w-full relative z-10">
            <Link
              href="/"
              aria-current={pathname === '/' ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center w-full h-full group z-20"
            >
              {pathname === '/' && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-[#06b6d4]/15 rounded-2xl border border-[#06b6d4]/35 shadow-[inset_0_0_12px_rgba(6,182,212,0.22),0_0_15px_rgba(6,182,212,0.15)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300 group-active:scale-90">
                {hasLogoIcon && (
                  <div
                    style={{
                      '--logo-color': pathname === '/' ? '#06b6d4' : '#9ca3af',
                    }}
                    className="w-5 h-5 flex items-center justify-center"
                  >
                    {renderLogoIcon('w-5 h-5')}
                  </div>
                )}
                <span
                  className={cn(
                    'font-bold transition-colors duration-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]',
                    hasLogoIcon ? 'text-[9.5px]' : 'text-[11px]',
                    pathname === '/' ? 'text-[#06b6d4]' : 'text-gray-200'
                  )}
                >
                  خانه
                </span>
              </div>
            </Link>

            {safeBottomNavLinks.slice(0, 4).map((link, idx) => {
              const safeUrl = sanitizeUrl(link.url);
              const isActive =
                pathname === safeUrl ||
                (safeUrl !== '/' &&
                  (pathname === safeUrl ||
                    pathname?.startsWith(safeUrl + '/')));
              const hasItemIcon = Boolean(
                link.iconImg && link.iconImg.trim() !== '' && !brokenHeaderImgs[link.iconImg]
              );

              return (
                <Link
                  key={link.id || idx}
                  href={safeUrl}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex flex-col items-center justify-center w-full h-full group z-20"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute inset-0 bg-[#06b6d4]/15 rounded-2xl border border-[#06b6d4]/35 shadow-[inset_0_0_12px_rgba(6,182,212,0.22),0_0_15px_rgba(6,182,212,0.15)] -z-10"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300 group-active:scale-90">
                    {hasItemIcon && (
                      <img
                        src={link.iconImg}
                        onError={() => markImgBroken(link.iconImg)}
                        alt={link.title || ''}
                        decoding="async"
                        className={cn(
                          'w-5 h-5 object-contain transition-all duration-300',
                          isActive
                            ? 'brightness-150 drop-shadow-[0_0_6px_rgba(6,182,212,0.85)]'
                            : 'opacity-75 grayscale'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'font-bold transition-colors duration-300 text-center px-1 line-clamp-1 w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]',
                        hasItemIcon ? 'text-[9.5px]' : 'text-[11px]',
                        isActive ? 'text-[#06b6d4]' : 'text-gray-200'
                      )}
                    >
                      {link.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
          }}
        />
      )}
    </>
  );
}