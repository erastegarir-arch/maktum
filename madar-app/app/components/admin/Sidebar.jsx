'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false); // وضعیت جمع‌شدگی سایدبار
  const [openSubmenu, setOpenSubmenu] = useState(null); // مدیریت آکاردئونی زیرمنوها

  // ساختار دقیق منوهای پنل مدیریت مدار
  const menuItems = [
    { name: 'پیشخوان', href: '/portal-entry-99', icon: 'home' },
    { name: 'آمار و گزارش', href: '/portal-entry-99/stats', icon: 'chart' },
    {
      name: 'صفحات',
      icon: 'layout',
      subItems: [
        { name: 'مدار', href: '/portal-entry-99/pages/home' },
        { name: 'محتوای خام', href: '/portal-entry-99/pages/raw' },
        { name: 'محتوای تولیدی', href: '/portal-entry-99/pages/produced' },
        { name: 'ابزارها', href: '/portal-entry-99/pages/tools' },
        { name: 'بلاگ', href: '/portal-entry-99/pages/blog' },
        { name: 'درباره', href: '/portal-entry-99/pages/about-settings' },
        { name: 'همکاری', href: '/portal-entry-99/pages/collaboration-settings' },
        { name: 'قوانین', href: '/portal-entry-99/pages/rules-settings' },
      ]
    },
    { name: 'محتوا', href: '/portal-entry-99/products', icon: 'browser' },
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
        { name: 'تاریخ و زمان', href: '/portal-entry-99/settings/datetime' },
      ]
    },
  ];

  const toggleSubmenu = (name) => {
    if (isCollapsed) setIsCollapsed(false); // اگر منو جمع بود، ابتدا باز شود
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300 z-50 relative select-none`}
    >
      {/* هدر سایدبار + دکمه جمع‌کننده */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        {!isCollapsed && (
          <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 truncate">
            پنل مدیریت <span className="text-[#10b981]">مدار</span>
          </h1>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors mr-auto"
          title={isCollapsed ? 'باز کردن منو' : 'بستن منو'}
        >
          <Icon name={isCollapsed ? 'caretRight' : 'caretLeft'} className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* لیست منوها */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const hasSub = !!item.subItems;
          const isOpen = openSubmenu === item.name;
          const isActive = pathname === item.href;

          if (hasSub) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-white/5 hover:text-gray-200 ${
                    isOpen ? 'bg-white/5 text-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={item.icon || 'star'} className="w-5 h-5 fill-current shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <Icon 
                      name="caretDown" 
                      className={`w-4 h-4 fill-current transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                {/* زیرمنوی کشویی (آکاردئونی) */}
                {isOpen && !isCollapsed && (
                  <div className="pr-8 space-y-1 py-1 border-r border-white/10 mr-4">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSubActive 
                              ? 'text-[#10b981] bg-[#10b981]/10 font-bold' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon name={item.icon || 'star'} className="w-5 h-5 fill-current shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* دکمه خروج */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium text-sm">
          <Icon name="logout" className="w-5 h-5 fill-current shrink-0" />
          {!isCollapsed && <span>خروج</span>}
        </button>
      </div>
    </aside>
  );
}