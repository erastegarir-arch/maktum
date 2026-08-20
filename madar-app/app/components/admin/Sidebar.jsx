'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Icon from '../Icon';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false); // وضعیت جمع‌شدگی سایدبار
  const [openSubmenu, setOpenSubmenu] = useState(null); // مدیریت آکاردئونی زیرمنوها
  const [showLogoutModal, setShowLogoutModal] = useState(false); // مدیریت مودال خروج
  const [activeTooltip, setActiveTooltip] = useState(null); // مدیریت تول‌تیپ شناور ثابت

  // ساختار دقیق منوهای پنل مدیریت مدار (بدون کوچک‌ترین تغییر در داده‌ها)
  const menuItems = [
    { name: 'پیشخوان', href: '/portal-entry-99', icon: 'home' },
    { name: 'آمار و گزارش', href: '/portal-entry-99/stats', icon: 'chart' },
    {
      name: 'صفحات',
      icon: 'layout',
      subItems: [
        { name: 'مدار', href: '/portal-entry-99/pages/home' },
        { name: 'مدیریت صفحات اصلی', href: '/portal-entry-99/pages/main-page' },
        { name: 'درباره ما', href: '/portal-entry-99/pages/about-settings' },
        { name: 'همکاری با ما', href: '/portal-entry-99/pages/collaboration-settings' },
        { name: 'قوانین', href: '/portal-entry-99/pages/rules-settings' },
      ]
    },
    { name: 'محتوا', href: '/portal-entry-99/products', icon: 'browser' },
    { name: 'منظومه', href: '/portal-entry-99/dossiers', icon: 'dossiers' },
    { name: 'طبقه‌بندی', href: '/portal-entry-99/taxonomies', icon: 'foldertree' },
    { name: 'کتابخانه رسانه', href: '/portal-entry-99/media', icon: 'image' },
    { name: 'کتابخانه آیکون', href: '/portal-entry-99/icons', icon: 'star' },
    { name: 'اعلان‌ها', href: '/portal-entry-99/notifications', icon: 'bell' },
    { name: 'نظرات', href: '/portal-entry-99/comments', icon: 'comment' },
    { name: 'کاربران', href: '/portal-entry-99/users', icon: 'users' },
    {
      name: 'تنظیمات هسته',
      icon: 'setting',
      subItems: [
        { name: 'اتصال', href: '/portal-entry-99/settings/connection' },
        { name: 'تعمیر و نگهداری', href: '/portal-entry-99/settings/maintenance' },
        { name: 'هویت', href: '/portal-entry-99/settings/identity' },
      ]
    },
  ];

  const toggleSubmenu = (name) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    toast.success('با موفقیت از حساب کاربری خارج شدید.');
    router.push('/');
  };

  // محاسبه دقیق موقعیت تول‌تیپ: ۱۲ پیکسل به سمت چپِ آیکون (کاملاً داخل فضای اصلی سایت)
  const showTooltip = (e, text, forceShow = false) => {
    if (!isCollapsed && !forceShow) return;
    const rect = e.currentTarget.getBoundingClientRect();

    setActiveTooltip({
      text,
      top: rect.top + rect.height / 2,
      left: rect.left - 12, // ۱۲ پیکسل فاصله به سمت چپ از مرز آیکون (به طرف داخل سایت)
    });
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-screen flex flex-col z-50 relative select-none shrink-0 shadow-2xl"
      >
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله و ثابت استاندارد گرافیک کلی1 */}
        <div className="absolute inset-0 bg-[#0b0f19]/85 backdrop-blur-xl border-l border-white/10 pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت بالای سایدبار (Top Gradient Highlight Bar) */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 z-20 pointer-events-none" />

        {/* هدر سایدبار + دکمه جمع‌کننده */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0 relative z-10">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="text-base font-black text-white truncate"
              >
                پنل مدیریت <span className="text-[#10b981]">مدار</span>
              </motion.h1>
            )}
          </AnimatePresence>
          
          {/* دکمه باز/بسته کردن سایدبار به همراه تول‌تیپ اختصاصی در هر دو حالت */}
          <button 
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              hideTooltip();
            }}
            onMouseEnter={(e) => showTooltip(e, isCollapsed ? 'باز کردن منو' : 'بستن منو', true)}
            onMouseLeave={hideTooltip}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white transition-all mr-auto cursor-pointer flex items-center justify-center shrink-0"
          >
            <Icon name={isCollapsed ? 'arrowLeft' : 'arrowRight'} className="w-4 h-4 fill-current text-[#10b981]" />
          </button>
        </div>

        {/* لیست منوها */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar relative z-10">
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
                    onMouseEnter={(e) => showTooltip(e, item.name)}
                    onMouseLeave={hideTooltip}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                      isOpen || isParentActive 
                        ? 'bg-white/10 text-white border border-white/10' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={item.icon || 'star'} className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-300 text-[#10b981]" />
                      {!isCollapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <Icon 
                        name="arrowLeft" 
                        className={`w-3.5 h-3.5 fill-current transition-transform duration-300 ${isOpen ? '-rotate-90 text-[#10b981]' : 'opacity-60'}`} 
                      />
                    )}
                  </button>

                  {/* زیرمنوی کشویی (آکاردئونی) */}
                  <AnimatePresence>
                    {isOpen && !isCollapsed && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pr-6 border-r border-[#10b981]/30 mr-4 space-y-1 py-1"
                      >
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isSubActive 
                                  ? 'text-[#10b981] bg-[#10b981]/15 font-bold border-r-2 border-[#10b981] pr-2 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                              }`}
                            >
                              {sub.name}
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
                <Link
                  href={item.href}
                  onMouseEnter={(e) => showTooltip(e, item.name)}
                  onMouseLeave={hideTooltip}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] font-bold' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon name={item.icon || 'star'} className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  {!isCollapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* دکمه خروج */}
        <div className="p-3 border-t border-white/10 shrink-0 relative z-10">
          <button 
            onClick={() => {
              hideTooltip();
              setShowLogoutModal(true);
            }}
            onMouseEnter={(e) => showTooltip(e, 'خروج از سیستم')}
            onMouseLeave={hideTooltip}
            className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all font-medium text-sm cursor-pointer group"
          >
            <Icon name="logout" className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-300" />
            {!isCollapsed && <span>خروج</span>}
          </button>
        </div>
      </motion.aside>

      {/* تول‌تیپ اختصاصی شیشه‌ای گرافیک کلی1 (رندر در سمت چپ آیکون به طرف داخل سایت) */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: activeTooltip.top,
              left: activeTooltip.left,
              transform: 'translate(-100%, -50%)',
            }}
            className="z-[9999] pointer-events-none"
          >
            <div className="relative bg-[#080c16]/95 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/15 shadow-[0_0_20px_rgba(16,185,129,0.25)] whitespace-nowrap flex items-center gap-2">
              <div className="absolute top-0 inset-x-2 h-[1.5px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />
              <span>{activeTooltip.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* پاپ‌آپ (مودال) تأیید خروج منطبق بر گرافیک کلی1 */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />

              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <Icon name="logout" className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">تأیید خروج</h3>
              <p className="text-sm text-gray-300 font-light mb-6 leading-relaxed">
                آیا برای خروج از پنل مدیریت <span className="text-[#10b981] font-bold">مدار</span> مطمئن هستید؟
              </p>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleConfirmLogout}
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
                >
                  بله، خروج
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
                >
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