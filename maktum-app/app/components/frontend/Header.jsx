// مسیر فایل: app/components/frontend/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ✅ اضافه شدن هوک‌های مرتبط با اسکرول از Framer Motion
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

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

function HeaderTooltip({ text, children }) {
  if (!text) return children;
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      {children}
      <div className="absolute top-full mt-3 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap font-sans font-bold">
          {text}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  
  // ✅ استیت جدید برای تشخیص اسکرول شدن صفحه
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // مانیتور کردن وضعیت اسکرول
  useMotionValueEvent(scrollY, "change", (latest) => {
    // اگر از بالای صفحه 10 پیکسل رد شدیم، هدر فشرده می‌شود
    if (latest > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [headerSettings, setHeaderSettings] = useState({
    logoIcon: 'allah',
    logoColor: '#06b6d4',
    logoHoverColor: '#38bdf8',
    siteTitle: 'مکتوم',
    showSiteTitle: true,
    headerOpacity: 80,
    activeColor: '#06b6d4',
    navItems: [],
    mobileHeaderCenterImg: '',
    bottomNavLinks: []
  });

  useEffect(() => {
    setIsMounted(true);
    async function loadInitialData() {
      try {
        const session = await getSessionUser();
        if (session) {
          setIsLoggedIn(true);
          const count = await getUserUnreadNotificationCountAction();
          setUnreadNotifications(count);
        }

        const stored = await getSetting('header_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setHeaderSettings(prev => ({
            ...prev,
            ...parsed,
            navItems: Array.isArray(parsed.navItems) ? parsed.navItems : prev.navItems,
            bottomNavLinks: Array.isArray(parsed.bottomNavLinks) ? parsed.bottomNavLinks : prev.bottomNavLinks
          }));
        } else {
          const fallbackIcon = await getSetting('header_icon');
          const fallbackText = await getSetting('header_text');
          
          setHeaderSettings(prev => ({
            ...prev,
            logoIcon: fallbackIcon || 'allah',
            siteTitle: fallbackText || 'مکتوم'
          }));
        }
      } catch (e) {
        console.error("خطا در دریافت اطلاعات اولیه هدر:", e);
      } finally {
        setIsSettingsLoaded(true);
      }
    }
    loadInitialData();
  }, []);

  if (pathname?.startsWith('/portal-entry-99') || pathname?.startsWith('/admin')) {
    return null; 
  }

  if (!isMounted || !isSettingsLoaded) {
    return null;
  }

  const safeOpacity = Number(headerSettings.headerOpacity);
  const opacityValue = !isNaN(safeOpacity) ? safeOpacity / 100 : 0.8;
  const activeColor = headerSettings.activeColor || '#06b6d4';

  const renderLogoIcon = () => {
    const icon = headerSettings.logoIcon || 'allah';
    if (!icon) return null;

    if (icon.startsWith('<svg')) {
      return (
        <div 
          className="w-7 h-7 flex items-center justify-center text-[var(--logo-color)] md:group-hover:text-[var(--logo-hover-color)] transition-colors duration-300 [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    
    if (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('.')) {
      return <img src={icon} alt="Logo" className="w-7 h-7 object-contain drop-shadow-md" />;
    }

    return <Icon name={icon} className="w-7 h-7 text-[var(--logo-color)] md:group-hover:text-[var(--logo-hover-color)] transition-colors duration-300" />;
  };

  const safeBottomNavLinks = Array.isArray(headerSettings.bottomNavLinks) ? headerSettings.bottomNavLinks : [];

  return (
    <>
      {/* ==================================================================================== */}
      {/* 1. هدر شناور مخصوص دسکتاپ (داینامیک و هوشمند بر اساس اسکرول) */}
      {/* ==================================================================================== */}
      <header className="hidden md:block fixed top-4 inset-x-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans select-none pointer-events-none">
        
        {/* کانتینر اصلی هدر که نسبت به حالت اسکرول تغییر اندازه و استایل می‌دهد */}
        <motion.div 
          animate={{
            // اگر اسکرول شده بود، کمی جمع‌تر می‌شود (مانند سایت اپل)
            padding: isScrolled ? "0px 12px" : "0px 0px",
            y: isScrolled ? -6 : 0 // کمی به سقف می‌چسبد
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative rounded-full overflow-hidden group pointer-events-auto mx-auto transition-all"
        >
          
          {/* پس‌زمینه گلس‌مورفیک داینامیک */}
          {/* در حالت بالا: شفاف. در حالت اسکرول: تارتر و کدرتر تا محتوای زیرین مزاحم خوانایی هدر نشود */}
          <motion.div 
            animate={{
              backgroundColor: isScrolled 
                ? `rgba(5, 8, 16, ${Math.max(opacityValue, 0.65)})` 
                : `rgba(5, 8, 16, 0.2)`,
              backdropFilter: isScrolled ? "blur(30px)" : "blur(10px)",
              borderColor: isScrolled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)"
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] border rounded-full pointer-events-none -z-10" 
          />

          {/* خط نوری بالای هدر */}
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80 pointer-events-none z-20" />

          {/* کانتینر داخلی هدر (پدینگ‌ها داینامیک شدند) */}
          <motion.div 
            animate={{
              paddingTop: isScrolled ? "0.5rem" : "0.75rem", // py-2 بجای py-3
              paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
            }}
            transition={{ duration: 0.4 }}
            className="px-6 flex items-center justify-between relative z-10"
          >
            <div className="flex items-center gap-6">
              
              <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
                <div 
                  className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    '--logo-color': headerSettings.logoColor || '#06b6d4',
                    '--logo-hover-color': headerSettings.logoHoverColor || '#38bdf8'
                  }}
                >
                  {renderLogoIcon()}
                </div>

                {headerSettings.showSiteTitle !== false && headerSettings.siteTitle && (
                  <span className="font-black text-xl text-white group-hover:text-gray-200 transition-colors font-sans drop-shadow-md">
                    {headerSettings.siteTitle}
                  </span>
                )}
              </Link>

              <nav className="hidden md:flex items-center gap-1 mr-2">
                {headerSettings.navItems?.map((item, idx) => {
                  const isActive = pathname === item.href || (item.href !== '/' && (pathname === item.href || pathname.startsWith(item.href + '/')));

                  return (
                    <Link
                      key={item.href || idx}
                      href={item.href || '#'}
                      style={{ '--active-color': activeColor }}
                      className={cn(
                        "relative text-sm font-bold transition-all duration-300 cursor-pointer flex items-center font-sans",
                        // پدینگ منوها نیز در زمان اسکرول فشرده‌تر می‌شود
                        isScrolled ? "py-1.5 px-3" : "py-2 px-4",
                        isActive ? "text-[var(--active-color)] drop-shadow-sm" : "text-gray-300 hover:text-[#06b6d4]"
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          style={{ backgroundColor: activeColor, boxShadow: `0 0 10px ${activeColor}` }}
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <HeaderTooltip text="جستجو در سایت">
                <div 
                  role="button" 
                  id="desktop-search-btn"
                  onClick={() => setIsSearchOpen(true)}
                  className={cn(
                    "rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/10 flex items-center justify-center text-gray-300 hover:text-[#06b6d4] transition-all cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] z-[60]",
                    // کوچک‌شدن دکمه‌ها در زمان اسکرول
                    isScrolled ? "w-8 h-8" : "w-10 h-10"
                  )}
                >
                  <Icon name="search" className={cn("pointer-events-none transition-all", isScrolled ? "w-4 h-4" : "w-5 h-5")} />
                </div>
              </HeaderTooltip>

              {isLoggedIn ? (
                <HeaderTooltip text="ورود به داشبورد و مدیریت اعلان‌ها">
                  <Link 
                    href="/profile" 
                    id="desktop-user-btn"
                    className={cn(
                      "relative rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/10 flex items-center justify-center text-gray-300 hover:text-[#06b6d4] transition-all cursor-pointer shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] z-10",
                      isScrolled ? "w-8 h-8" : "w-10 h-10"
                    )}
                  >
                    <Icon name="user" className={cn("pointer-events-none transition-all", isScrolled ? "w-4 h-4" : "w-5 h-5")} />
                    
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center border border-[#0b0f19] font-sans pt-0.5 shadow-md">
                          {unreadNotifications > 9 ? '+۹' : toPersianDigits(unreadNotifications)}
                        </span>
                      </span>
                    )}
                  </Link>
                </HeaderTooltip>
              ) : (
                <HeaderTooltip text="از این قسمت وارد حساب کاربری بشوید یا عضو شوید">
                  <div 
                    role="button"
                    id="desktop-auth-btn"
                    onClick={() => setIsAuthOpen(true)}
                    className={cn(
                      "rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 text-gray-200 hover:text-[#06b6d4] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 font-sans shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] z-10",
                      isScrolled ? "px-3 py-1.5" : "px-4 py-2"
                    )}
                  >
                    <Icon name="user" className={cn("text-[#06b6d4] pointer-events-none transition-all", isScrolled ? "w-3 h-3" : "w-4 h-4")} />
                    <span>ورود / عضویت</span>
                  </div>
                </HeaderTooltip>
              )}
            </div>
          </motion.div>
        </motion.div>
      </header>


      {/* ==================================================================================== */}
      {/* 2. هدر آزاد و متحرک بالای موبایل (بدون هیچ تغییری) */}
      {/* ==================================================================================== */}
      <div className="md:hidden absolute top-6 inset-x-4 z-30 flex items-center justify-between font-sans select-none pointer-events-none" dir="rtl">
        <div className="flex flex-col items-center justify-center shrink-0 w-12 pointer-events-auto">
          <Link href="/" style={{ '--logo-color': headerSettings.logoColor || '#06b6d4' }}>
            {renderLogoIcon()}
          </Link>
        </div>

        <div className="flex-1 flex justify-center items-center px-4 h-full pointer-events-auto">
          {headerSettings.mobileHeaderCenterImg && (
            <img src={headerSettings.mobileHeaderCenterImg} alt="Banner" className="max-h-12 max-w-full object-contain drop-shadow-lg" />
          )}
        </div>

        <div className="w-12 shrink-0"></div>
      </div>


      {/* ==================================================================================== */}
      {/* 3. دکمه ثابت ورود/عضویت موبایل (بدون تغییر) */}
      {/* ==================================================================================== */}
      <div id="mobile-user-container" className="md:hidden fixed top-4 left-4 z-[50] flex items-center justify-start font-sans select-none pointer-events-auto" dir="rtl">
        {isLoggedIn ? (
          <Link href="/profile" id="mobile-user-btn" className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#06b6d4]/20 to-[#38bdf8]/10 text-[#06b6d4] border border-[#06b6d4]/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all">
            <Icon name="user" className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center border border-[#0b0f19] font-sans pt-0.5 shadow-md">
                  {unreadNotifications > 9 ? '+۹' : toPersianDigits(unreadNotifications)}
                </span>
              </span>
            )}
          </Link>
        ) : (
          <div className="relative flex flex-col items-start">
            <div role="button" onClick={() => setIsAuthOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.05] backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.1] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.5)] opacity-80 hover:opacity-100 cursor-pointer">
              <Icon name="user" className="w-5 h-5 pointer-events-none" />
            </div>
            <span className="absolute top-full mt-2 left-0 whitespace-nowrap text-[10px] font-bold bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] px-3 py-1.5 rounded-lg animate-pulse shadow-md pointer-events-none z-50">
              ورود | عضویت
            </span>
          </div>
        )}
      </div>


      {/* ==================================================================================== */}
      {/* 4. دکمه شناور سرچ و نوار ناوبری پایین مخصوص موبایل (بدون تغییر) */}
      {/* ==================================================================================== */}
      <div 
        role="button"
        id="mobile-search-btn"
        onClick={() => setIsSearchOpen(true)}
        className="md:hidden fixed bottom-24 left-6 z-[60] w-11 h-11 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] text-gray-300 flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.5)] hover:text-white hover:bg-[#06b6d4]/20 active:scale-90 transition-all cursor-pointer pointer-events-auto"
      >
        <Icon name="search" className="w-5 h-5 pointer-events-none" />
      </div>

      <nav className="md:hidden fixed bottom-6 inset-x-6 z-40 font-sans select-none pointer-events-none" dir="rtl">
        <div className="relative rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/[0.05] pointer-events-auto">
          
          <div className="absolute inset-0 rounded-3xl backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] pointer-events-none -z-10" style={{ backgroundColor: `rgba(10, 15, 30, ${opacityValue || 0.7})`, overflow: 'hidden' }} />

          <div className="flex items-center justify-around px-2 py-2 h-16 w-full relative z-10">
            
            <Link href="/" className="relative flex flex-col items-center justify-center w-full h-full group z-20">
              {pathname === '/' && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-[#06b6d4]/15 rounded-2xl border border-[#06b6d4]/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="flex flex-col items-center gap-1 transition-transform duration-300 group-active:scale-90">
                <div style={{ '--logo-color': pathname === '/' ? '#06b6d4' : '#6b7280' }} className="w-5 h-5 flex items-center justify-center">
                   {renderLogoIcon()}
                </div>
                <span className={cn(
                  "text-[9px] font-bold transition-colors duration-300", 
                  pathname === '/' ? "text-[#06b6d4] drop-shadow-sm" : "text-gray-400"
                )}>
                  خانه
                </span>
              </div>
            </Link>

            {safeBottomNavLinks.slice(0, 4).map((link, idx) => {
              const isActive = pathname === link.url || (link.url !== '/' && (pathname === link.url || pathname.startsWith(link.url + '/')));
              
              return (
                <Link key={idx} href={link.url || '#'} className="relative flex flex-col items-center justify-center w-full h-full group z-20">
                  
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute inset-0 bg-[#06b6d4]/15 rounded-2xl border border-[#06b6d4]/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="flex flex-col items-center gap-1 transition-transform duration-300 group-active:scale-90">
                    {link.iconImg ? (
                      <img 
                        src={link.iconImg} 
                        alt={link.title} 
                        className={cn("w-5 h-5 object-contain transition-all duration-300", isActive ? "brightness-150 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "opacity-60 grayscale")} 
                      />
                    ) : (
                      <Icon name="grid" className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-[#06b6d4] drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "text-gray-400")} />
                    )}
                    <span className={cn(
                      "text-[9px] font-bold transition-colors duration-300 text-center px-1 line-clamp-1 w-full", 
                      isActive ? "text-[#06b6d4] drop-shadow-sm" : "text-gray-400"
                    )}>
                      {link.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ==================================================================================== */}
      {/* مودال‌های سرچ و لاگین */}
      {/* ==================================================================================== */}
      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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