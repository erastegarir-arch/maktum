'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '@/app/components/Icon';
import SearchModal from '@/app/components/frontend/SearchModal';
import AuthModal from '@/app/components/frontend/AuthModal';
import { getSetting } from '@/app/actions/settings';
// 👇 اتصال هدر به سیستم احراز هویت سرور
import { getSessionUser } from '@/app/actions/auth'; 

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
        <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[6px] border-b-[#0b0f19]"></div>
        <div className="bg-[#0b0f19]/95 backdrop-blur-xl text-white text-[11px] py-1.5 px-3 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap font-sans font-medium">
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
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 👇 استیت‌های واقعی برای چک کردن لاگین بودن کاربر از سمت سرور
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [headerSettings, setHeaderSettings] = useState({
    logoIcon: 'allah',
    logoColor: '#06b6d4',
    logoHoverColor: '#38bdf8',
    siteTitle: 'مدار',
    showSiteTitle: true,
    headerOpacity: 80,
    activeColor: '#06b6d4',
    navItems: []
  });

  // دریافت تنظیمات هدر و وضعیت لاگین به صورت همزمان
  useEffect(() => {
    setIsMounted(true);
    async function loadInitialData() {
      try {
        // ۱. بررسی وضعیت لاگین از سرور
        const session = await getSessionUser();
        if (session) {
          setIsLoggedIn(true);
          // در آینده می‌توانیم تعداد اعلانات واقعی کاربر را هم از سرور بگیریم و اینجا ست کنیم
        }

        // ۲. دریافت تنظیمات هدر
        const stored = await getSetting('header_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setHeaderSettings(prev => ({
            ...prev,
            ...parsed,
            navItems: Array.isArray(parsed.navItems) ? parsed.navItems : prev.navItems
          }));
        } else {
          const fallbackIcon = await getSetting('header_icon');
          const fallbackText = await getSetting('header_text');
          
          setHeaderSettings(prev => ({
            ...prev,
            logoIcon: fallbackIcon || 'allah',
            siteTitle: fallbackText || 'مدار'
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
          className="w-7 h-7 flex items-center justify-center text-[var(--logo-color)] group-hover:text-[var(--logo-hover-color)] transition-colors duration-300 [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    
    if (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('.')) {
      return (
        <img src={icon} alt="Logo" className="w-7 h-7 object-contain" />
      );
    }

    return (
      <Icon 
        name={icon} 
        className="w-7 h-7 text-[var(--logo-color)] group-hover:text-[var(--logo-hover-color)] transition-colors duration-300" 
      />
    );
  };

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans select-none">
        <div className="relative rounded-full border border-white/10 shadow-2xl overflow-hidden group">
          
          <div 
            style={{ backgroundColor: `rgba(11, 15, 25, ${opacityValue})` }}
            className="absolute inset-0 backdrop-blur-xl rounded-full pointer-events-none -z-10" 
          />

          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />

          <div className="px-6 py-3 flex items-center justify-between relative z-10">
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
                  <span className="font-black text-xl text-white group-hover:text-gray-200 transition-colors">
                    {headerSettings.siteTitle}
                  </span>
                )}
              </Link>

              <nav className="hidden md:flex items-center gap-1 mr-2">
                {headerSettings.navItems?.map((item, idx) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href || idx}
                      href={item.href || '#'}
                      style={{ '--active-color': activeColor }}
                      className={cn(
                        "relative text-sm font-bold transition-all duration-300 py-2 px-4 cursor-pointer flex items-center",
                        isActive
                          ? "text-[var(--active-color)]"
                          : "text-gray-300 hover:text-[#06b6d4]"
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
                <button 
                  type="button" 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/10 flex items-center justify-center text-gray-300 hover:text-[#06b6d4] transition-all cursor-pointer shadow-inner"
                >
                  <Icon name="search" className="w-5 h-5" />
                </button>
              </HeaderTooltip>

              {isLoggedIn ? (
                <HeaderTooltip text="ورود به داشبورد کاربری">
                  <Link 
                    href="/profile" 
                    className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/10 flex items-center justify-center text-gray-300 hover:text-[#06b6d4] transition-all cursor-pointer shadow-inner"
                  >
                    <Icon name="user" className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[10px] font-bold items-center justify-center border border-[#0b0f19]">
                          {unreadNotifications > 9 ? '+۹' : toPersianDigits(unreadNotifications)}
                        </span>
                      </span>
                    )}
                  </Link>
                </HeaderTooltip>
              ) : (
                <HeaderTooltip text="از این قسمت وارد حساب کاربری بشوید یا عضو شوید">
                  <button 
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 text-gray-200 hover:text-[#06b6d4] text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="user" className="w-4 h-4 text-[#06b6d4]" />
                    <span>ورود / عضویت</span>
                  </button>
                </HeaderTooltip>
              )}
            </div>
          </div>
        </div>
      </header>

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