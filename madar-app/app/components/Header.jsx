'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

export default function Header({ initialData }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/portal-entry-99')) {
    return null;
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(15);

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(logged);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const toPersianDigits = (num) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => persianDigits[x]);
  };

  const getDisplayCount = (count) => {
    if (count > 9) return '۹+';
    return toPersianDigits(count);
  };

  const displayCount = getDisplayCount(notificationCount);

  const allIcons = initialData?.allIcons || [];
  const headerIcon = initialData?.headerIcon || '';
  const headerText = initialData?.headerText || '';
  const navItems = initialData?.headerLinks?.length > 0 
    ? initialData.headerLinks.map(i => ({ title: i.title, path: i.url || i.path || '#' }))
    : [
        { title: 'محتوای خام', path: '/archive' },
        { title: 'محتوای تولیدی', path: '/produced' },
        { title: 'ابزارها', path: '/tools' },
        { title: 'بلاگ', path: '/blog' },
        { title: 'دسته‌بندی‌ها', path: '/categories' }
      ];

  const headerIconSvg = allIcons.find(i => i.name === headerIcon)?.svgCode;

  return (
    <>
      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none font-sans">
        <div className="w-full max-w-7xl relative pointer-events-auto">
          
          <header className="glass-card px-4 md:px-6 py-3 w-full flex items-center justify-between border border-white/10 rounded-2xl md:rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] bg-[#080c16]/30 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:bg-[#080c16]/50 hover:border-white/20">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="flex items-center gap-6 lg:gap-10 relative z-10">
              
              <Link href="/" aria-label="مدار" className="flex items-center gap-3 group cursor-pointer py-1">
                {headerIconSvg && (
                  <div className="svg-inherit-color w-8 h-8 text-[#06b6d4] group-hover:text-[#a855f7] transition-colors duration-300 [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" dangerouslySetInnerHTML={{ __html: headerIconSvg }} />
                )}
                
                {headerText && (
                  <span className="text-white font-black text-lg tracking-wider drop-shadow-md transition-colors duration-300 group-hover:text-gray-200">
                    {headerText}
                  </span>
                )}
              </Link>
              
              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
                {navItems.map((item, index) => (
                  <Link key={index} href={item.path} className="relative py-2 group hover:text-white transition-colors">
                    <span>{item.title}</span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#06b6d4] rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0 shadow-[0_0_8px_#06b6d4]"></span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-3 relative z-10">
              
              <div className="relative group/tooltip flex items-center justify-center">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-[#06b6d4] hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all border border-white/5 cursor-pointer"
                >
                  <Icon name="search" className="w-5 h-5" />
                </button>
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  جستجو
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0b0f19]"></div>
                </div>
              </div>
              
              <div className="relative group/tooltip flex items-center justify-center">
                {!isLoggedIn ? (
                  <button 
                    onClick={() => setIsLoginOpen(true)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#06b6d4]/50 rounded-full px-4 md:px-5 py-2 text-sm font-bold transition-all text-white flex items-center gap-2 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] group"
                  >
                    <Icon name="user" className="w-4 h-4 text-[#06b6d4] group-hover:scale-110 transition-transform" /> 
                    <span className="hidden sm:inline">ورود / عضویت</span>
                    <span className="sm:hidden">ورود</span>
                  </button>
                ) : (
                  <Link 
                    href="/portal-entry-99" 
                    className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#06b6d4]/20 to-[#a855f7]/20 flex items-center justify-center text-white transition-all border border-[#06b6d4]/30 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group"
                  >
                    <Icon name="user" className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    
                    {notificationCount > 0 && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-rose-600 border-[1.5px] border-[#080c16] text-[9px] font-bold text-white items-center justify-center shadow-md">
                          {displayCount}
                        </span>
                      </div>
                    )}
                  </Link>
                )}
                
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  {isLoggedIn ? 'پیشخوان کاربری' : 'ورود یا عضویت'}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0b0f19]"></div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Icon name={isMobileMenuOpen ? "close" : "listBullets"} className="w-5 h-5" />
              </button>
            </div>
          </header>

          {isMobileMenuOpen && (
            <div className="absolute top-[75px] md:top-[85px] left-0 right-0 glass-card bg-[#080c16]/95 backdrop-blur-2xl border-t-2 border-t-[#06b6d4] rounded-3xl p-6 flex flex-col gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] lg:hidden animate-[slideUpFade_0.3s_ease-out]">
              <nav className="flex flex-col text-sm font-bold text-gray-300">
                {navItems.map((item, index) => (
                  <Link key={index} href={item.path} onClick={() => setIsMobileMenuOpen(false)} className="py-4 border-b border-white/5 hover:text-[#06b6d4] hover:bg-white/5 hover:pl-2 rounded-lg transition-all flex items-center gap-2 group">
                    <Icon name="caretLeft" className="w-3 h-3 text-gray-600 group-hover:text-[#06b6d4] transition-colors" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </>
  );
}