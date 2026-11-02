'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../Icon';
import { useAuth } from '@/app/hooks/useAuth'; 

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, can, canAny, logout } = useAuth(); 

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // ========================================================
  // آرایه منوها مجهز به سیستم سطوح دسترسی دانه‌ریز (RBAC)
  // منطبق با کلیدهای تعریف شده در lib/rbac.js
  // ========================================================
  const ALL_MENU_ITEMS = useMemo(() => [
    { name: 'پیشخوان', href: '/portal-entry-99', icon: 'home', requiredAny: null },
    {
      name: 'چیدمان',
      icon: 'layout',
      requiredAny: ['IDENTITY_EDIT', 'HOMEPAGE_EDIT', 'PAGES_EDIT', 'ABOUT_EDIT', 'CAREER_EDIT', 'TERMS_EDIT'],
      subItems: [
        { name: 'هویت', href: '/portal-entry-99/pages/identity', permission: 'IDENTITY_EDIT' },
        { name: 'صفحه اصلی', href: '/portal-entry-99/pages/home', permission: 'HOMEPAGE_EDIT' },
        { name: 'صفحات فرعی', href: '/portal-entry-99/pages/main-page', permission: 'PAGES_EDIT' },
        { name: 'درباره ما', href: '/portal-entry-99/pages/about-settings', permission: 'ABOUT_EDIT' },
        { name: 'همکاری با ما', href: '/portal-entry-99/pages/collaboration-settings', permission: 'CAREER_EDIT' },
        { name: 'قوانین', href: '/portal-entry-99/pages/rules-settings', permission: 'TERMS_EDIT' },
      ]
    },    
    // دیدن این ۴ بخش طبق rbac.js برای همه مدیران آزاد است و دکمه‌های داخلی آن‌ها کنترل می‌شود
    { name: 'کتابخانه رسانه', href: '/portal-entry-99/media', icon: 'image', requiredAny: null },    
    { name: 'طبقه‌بندی', href: '/portal-entry-99/taxonomies', icon: 'foldertree', requiredAny: null },    
    { name: 'محتوا', href: '/portal-entry-99/products', icon: 'browser', requiredAny: null },
    { name: 'منظومه', href: '/portal-entry-99/dossiers', icon: 'dossiers', requiredAny: ['HUB_SETTINGS', 'DOSSIER_EDIT', 'DOSSIER_CREATE', 'DOSSIER_DELETE'] },    
    
    // بخش‌هایی که ورود به آن‌ها نیازمند داشتن حداقل یکی از تیک‌های مربوطه است
    { name: 'اعلانات', href: '/portal-entry-99/notifications', icon: 'bell', requiredAny: ['NOTIF_CREATE', 'NOTIF_DELETE'] },
    { name: 'نظرات', href: '/portal-entry-99/comments', icon: 'chat', requiredAny: ['COMMENT_EDIT_REPLY', 'COMMENT_APPROVE_REJECT'] },
    { name: 'کاربران', href: '/portal-entry-99/users', icon: 'users', requiredAny: ['USERS_VIEW', 'USERS_EXPORT', 'USERS_CREATE', 'USERS_EDIT', 'USERS_GRANT_ADMIN', 'USERS_BAN'] },
  ], []);

  // فیلتر هوشمند منوها و زیرمنوها بر اساس دسترسی‌های کاربر
  const menuItems = useMemo(() => {
    if (!user) return [];

    return ALL_MENU_ITEMS.reduce((acc, item) => {
      // اگر آیتم زیرمنو دارد (مثل چیدمان)، فقط زیرمنوهای مجاز را نگه می‌داریم
      if (item.subItems) {
        const allowedSubs = item.subItems.filter(sub => !sub.permission || (can && can(sub.permission)));
        if (allowedSubs.length > 0) {
          acc.push({ ...item, subItems: allowedSubs });
        }
        return acc;
      }

      // اگر آیتم نیاز به مجوز خاصی ندارد (برای همه مدیران آزاد است)
      if (!item.requiredAny || item.requiredAny.length === 0) {
        acc.push(item);
        return acc;
      }

      // بررسی داشتن حداقل یکی از مجوزهای مورد نیاز بخش
      if (canAny && canAny(item.requiredAny)) {
        acc.push(item);
      }

      return acc;
    }, []);
  }, [ALL_MENU_ITEMS, user, can, canAny]);

  useEffect(() => {
    if (isCollapsed) setOpenSubmenu(null);
  }, [isCollapsed]);

  const toggleSubmenu = (name) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    toast.success('با موفقیت از حساب کاربری خارج شدید.');
    if (logout) {
      await logout();
    } else {
      router.push('/');
    }
  };

  // ========================================================
  // محاسبه دقیق تراز تول‌تیپ‌ها (اصلاح‌شده برای قرارگیری دقیق در سمت چپ سایدبار)
  // ========================================================
  const showTooltip = (e, text, forceShow = false) => {
    if (window.innerWidth < 768) return; 
    if (!isCollapsed && !forceShow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    setActiveTooltip({
      text,
      top: rect.top + rect.height / 2, // تراز عمودی: دقیقاً وسط دکمه
      // با کسر کردن از پهنای کل صفحه، لبه‌ی راستِ تول‌تیپ را محاسبه می‌کنیم
      right: window.innerWidth - rect.left + 12, // ۱۲ پیکسل فاصله از لبه چپِ دکمه به سمت داخلِ سایت
    });
  };

  const hideTooltip = () => setActiveTooltip(null);

  // ========================================================
  // موتور رندر آیتم‌های منو
  // ========================================================
  const renderMenuItems = (forMobile = false) => (
    <div className="flex-1 overflow-y-auto py-5 px-3 space-y-2 custom-scrollbar relative z-10 w-full">
      {menuItems.map((item) => {
        const hasSub = !!item.subItems;
        const isOpen = openSubmenu === item.name;
        const isActive = pathname === item.href;
        const isParentActive = hasSub && item.subItems.some(sub => pathname === sub.href);

        if (hasSub) {
          return (
            <div key={item.name} className="space-y-1 relative">
              <button
                onClick={() => toggleSubmenu(item.name)}
                onMouseEnter={(e) => !forMobile && showTooltip(e, item.name)}
                onMouseLeave={hideTooltip}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 cursor-pointer group border ${
                  isOpen || isParentActive 
                    ? 'bg-gradient-to-l from-[#10b981]/15 to-transparent text-white border-white/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon name={item.icon || 'star'} className={`w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-300 ${isOpen || isParentActive ? 'text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  {(!isCollapsed || forMobile) && <span className="font-bold text-sm tracking-wide truncate">{item.name}</span>}
                </div>
                {(!isCollapsed || forMobile) && (
                  <Icon 
                    name="arrowLeft" 
                    className={`w-3 h-3 fill-current transition-transform duration-300 ${isOpen ? '-rotate-90 text-[#10b981]' : 'opacity-40'}`} 
                  />
                )}
              </button>

              <AnimatePresence>
                {isOpen && (!isCollapsed || forMobile) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden pr-8 mr-2 border-r border-white/5 space-y-1 py-2"
                  >
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link key={sub.name} href={sub.href} onClick={() => forMobile && setIsMobileDrawerOpen(false)}
                          className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                            isSubActive 
                              ? 'text-[#10b981] bg-white/[0.03] font-bold shadow-inner' 
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                          }`}
                        >
                          <span className="relative">
                            {isSubActive && <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#10b981]" />}
                            {sub.name}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div key={item.name} className="relative">
            <Link href={item.href} onClick={() => forMobile && setIsMobileDrawerOpen(false)}
              onMouseEnter={(e) => !forMobile && showTooltip(e, item.name)} onMouseLeave={hideTooltip}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-300 group border ${
                isActive 
                  ? 'bg-gradient-to-l from-[#10b981]/15 to-[#10b981]/5 text-white border-white/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] font-bold' 
                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 font-medium'
              }`}
            >
              <Icon name={item.icon || 'star'} className={`w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-300 ${isActive ? 'text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {(!isCollapsed || forMobile) && <span className="text-sm tracking-wide truncate">{item.name}</span>}
            </Link>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* ۱. سایدبار دسکتاپ */}
      {/* ======================================================== */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 84 : 260 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen z-50 sticky top-0 right-0 select-none shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.4)] bg-[#050810]/60 backdrop-blur-3xl border-l border-white/[0.04]"
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/80 to-transparent z-20 pointer-events-none" />

        <div className="h-20 flex items-center justify-between px-5 shrink-0 relative z-10 border-b border-white/[0.04]">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
                className="text-base font-black text-white tracking-wide truncate"
              >
                پنل مدیریت <span className="text-[#10b981]">مدار</span>
              </motion.h1>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => { setIsCollapsed(!isCollapsed); hideTooltip(); }}
            onMouseEnter={(e) => showTooltip(e, isCollapsed ? 'گسترش منو' : 'جمع کردن منو', true)}
            onMouseLeave={hideTooltip}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all mr-auto cursor-pointer flex items-center justify-center shrink-0 border border-white/5"
          >
            <Icon name={isCollapsed ? 'arrowLeft' : 'arrowRight'} className="w-4 h-4 fill-current" />
          </button>
        </div>

        {renderMenuItems(false)}

        <div className="p-4 shrink-0 relative z-10 border-t border-white/[0.04] bg-gradient-to-t from-black/20 to-transparent">
          <button 
            onClick={() => { hideTooltip(); setShowLogoutModal(true); }}
            onMouseEnter={(e) => showTooltip(e, 'خروج از سیستم')} onMouseLeave={hideTooltip}
            className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-sm cursor-pointer group shadow-inner border border-rose-500/20 hover:border-transparent"
          >
            <Icon name="logout" className="w-5 h-5 fill-current shrink-0 group-hover:-translate-x-1 transition-transform duration-300" />
            {!isCollapsed && <span>خروج از حساب</span>}
          </button>
        </div>
      </motion.aside>

      {/* ======================================================== */}
      {/* ۲. نوار ناوبری چسبان پایین (موبایل) */}
      {/* ======================================================== */}
      <div className="md:hidden fixed bottom-0 inset-x-0 h-16 z-40 bg-[#050810]/85 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center justify-around px-2 pb-safe font-sans">
        {[
          { name: 'پیشخوان', href: '/portal-entry-99', icon: 'home' },
          { name: 'کتابخانه رسانه', href: '/portal-entry-99/media', icon: 'image' },
          { name: 'طبقه‌بندی', href: '/portal-entry-99/taxonomies', icon: 'foldertree' },
        ].map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 h-full gap-1.5 group relative">
              {isActive && <div className="absolute -top-[1px] w-8 h-[3px] bg-gradient-to-b from-[#10b981] to-transparent rounded-b-full shadow-[0_2px_10px_#10b981]" />}
              <div className={`transition-all duration-300 ${isActive ? 'text-[#10b981] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}>
                <Icon name={item.icon} className="w-[22px] h-[22px]" />
              </div>
              <span className={`text-[9px] font-bold transition-colors ${isActive ? 'text-[#10b981]' : 'text-gray-500'}`}>{item.name}</span>
            </Link>
          )
        })}
        
        <button onClick={() => setIsMobileDrawerOpen(true)} className="flex flex-col items-center justify-center w-16 h-full gap-1.5 group">
          <div className="text-gray-500 group-hover:text-gray-300 transition-all duration-300">
            <Icon name="menu" className="w-[22px] h-[22px]" />
          </div>
          <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors">منو کامل</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ۳. کشوی منوی کامل موبایل */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 z-[60] bg-[#050810]/80 backdrop-blur-md"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-[100dvh] w-4/5 max-w-[320px] bg-[#070b14]/95 backdrop-blur-3xl border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[70] flex flex-col font-sans"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 z-20 pointer-events-none" />
              
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.04] shrink-0 bg-white/[0.01]">
                <h2 className="font-black text-white text-base">منوی <span className="text-[#10b981]">مدار</span></h2>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-rose-500 transition-colors border border-transparent shadow-inner">
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {renderMenuItems(true)}

              <div className="p-6 border-t border-white/[0.04] shrink-0 pb-safe bg-gradient-to-t from-black/20 to-transparent">
                <button 
                  onClick={() => { setIsMobileDrawerOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center justify-center gap-3 px-3 py-3.5 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-sm cursor-pointer border border-rose-500/20"
                >
                  <Icon name="logout" className="w-5 h-5 fill-current shrink-0" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* Tooltip (اصلاح شده برای قرارگیری دقیق در سمت چپ و داخل سایت) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: -10, scale: 0.95 }} 
            transition={{ duration: 0.15, ease: 'easeOut' }}
            dir="ltr"
            style={{ 
              position: 'fixed', 
              top: activeTooltip.top, 
              right: activeTooltip.right, 
              transform: 'translateY(-50%)' 
            }}
            className="z-[9999] pointer-events-none hidden md:flex items-center"
          >
            <div dir="rtl" className="relative bg-[#070b14] text-gray-200 text-xs font-bold px-3.5 py-2 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 whitespace-nowrap z-10">
              {activeTooltip.text}
            </div>
            <div className="w-2.5 h-2.5 bg-[#070b14] border-t border-r border-white/10 rotate-45 -ml-1.5 z-0 drop-shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* پاپ‌آپ (مودال) تأیید خروج سراسری */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-[100dvh] z-[99999] flex items-center justify-center bg-[#050810]/70 backdrop-blur-xl p-4 font-sans"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-[2rem] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#070b14]/95 backdrop-blur-3xl border border-white/10"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />

              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                <Icon name="logout" className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white mb-2">تأیید خروج از سیستم</h3>
              <p className="text-sm text-gray-400 font-light mb-8 leading-relaxed">
                آیا برای خروج از پنل مدیریت <span className="text-[#10b981] font-bold">مدار</span> مطمئن هستید؟ برای ورود مجدد به رمز عبور نیاز خواهید داشت.
              </p>

              <div className="flex items-center gap-3">
                <button onClick={handleConfirmLogout} className="flex-1 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer">
                  بله، خروج
                </button>
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-sm transition-all cursor-pointer border border-white/10">
                  انصراف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}