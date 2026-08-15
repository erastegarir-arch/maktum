'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../components/Icon'; // اتصال به کتابخانه مرکزی آیکون‌ها
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState'; // اضافه شدن کامپوننت حالت‌های خالی
import BlurImage from '../components/BlurImage'; // اضافه شدن کامپوننت لودینگ تنبل و بلور تصاویر
import { motion, AnimatePresence } from 'framer-motion';

// تابع تبدیل اعداد به فارسی
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// داده‌های تستی همراه با تم رنگی اختصاصی برای هر کارت دانلود
const mockDownloads = [
  { 
    id: 1, 
    title: 'اسناد پروژه‌های فضایی دهه ۶۰', 
    category: 'محتوای خام', 
    image: '/images/doc-1.jpg',
    theme: {
      borderTop: 'border-t-[#fbbf24]',
      badgeText: 'text-[#fbbf24]',
      gradientVia: 'via-[#fbbf24]',
      hoverShadow: 'hover:border-[#fbbf24]/40 hover:shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)]'
    }
  },
  { 
    id: 2, 
    title: 'راش ویدیویی لژ نیویورک', 
    category: 'راش ویدیویی', 
    image: '/images/doc-2.jpg',
    theme: {
      borderTop: 'border-t-[#06b6d4]',
      badgeText: 'text-[#06b6d4]',
      gradientVia: 'via-[#06b6d4]',
      hoverShadow: 'hover:border-[#06b6d4]/40 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]'
    }
  },
  { 
    id: 3, 
    title: 'کتابخانه ممنوعه واتیکان', 
    category: 'سند متنی', 
    image: '/images/doc-3.jpg',
    theme: {
      borderTop: 'border-t-[#a855f7]',
      badgeText: 'text-[#a855f7]',
      gradientVia: 'via-[#a855f7]',
      hoverShadow: 'hover:border-[#a855f7]/40 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]'
    }
  },
  { 
    id: 4, 
    title: 'شنود جلسات فراماسونری', 
    category: 'فایل صوتی', 
    image: '/images/doc-4.jpg',
    theme: {
      borderTop: 'border-t-[#10b981]',
      badgeText: 'text-[#10b981]',
      gradientVia: 'via-[#10b981]',
      hoverShadow: 'hover:border-[#10b981]/40 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]'
    }
  },
];

const mockFavorites = [
  { 
    id: 1, 
    title: 'سایه‌های معماری مدرن', 
    category: 'محتوای تولیدی', 
    image: '/images/fav-1.jpg',
    theme: {
      borderTop: 'border-t-[#f43f5e]',
      badgeText: 'text-[#f43f5e]',
      gradientVia: 'via-[#f43f5e]',
      hoverShadow: 'hover:border-[#f43f5e]/40 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]'
    }
  },
  { 
    id: 2, 
    title: 'نقشه‌های اصلی واشنگتن', 
    category: 'محتوای خام', 
    image: '/images/fav-2.jpg',
    theme: {
      borderTop: 'border-t-[#fbbf24]',
      badgeText: 'text-[#fbbf24]',
      gradientVia: 'via-[#fbbf24]',
      hoverShadow: 'hover:border-[#fbbf24]/40 hover:shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)]'
    }
  },
  { 
    id: 3, 
    title: 'فراماسونری در انقلاب فرانسه', 
    category: 'مقاله', 
    image: '/images/fav-3.jpg',
    theme: {
      borderTop: 'border-t-[#b45309]',
      badgeText: 'text-[#b45309]',
      gradientVia: 'via-[#b45309]',
      hoverShadow: 'hover:border-[#b45309]/40 hover:shadow-[0_20px_40px_-15px_rgba(180,83,9,0.3)]'
    }
  },
  { 
    id: 4, 
    title: 'ابزار گراف ارتباطات', 
    category: 'ابزار', 
    image: '/images/fav-4.jpg',
    theme: {
      borderTop: 'border-t-[#10b981]',
      badgeText: 'text-[#10b981]',
      gradientVia: 'via-[#10b981]',
      hoverShadow: 'hover:border-[#10b981]/40 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]'
    }
  },
];

// داده‌های اولیه اعلان‌ها
const initialNotifications = [
  { 
    id: 1, 
    title: 'انتشار ابزار جدید: گراف ارتباطات', 
    time: '۲ ساعت پیش', 
    text: 'ابزار پیشرفته گراف ارتباطات شبکه‌ای به پلتفرم مدار اضافه شد. هم‌اکنون می‌توانید برای کشف ارتباطات پنهان اسناد از آن استفاده کنید.', 
    isRead: false,
    image: '/images/notif-graph.png',
    link: '/tools/graph'
  },
  { 
    id: 2, 
    title: 'تکمیل و تأیید پروفایل کاربری', 
    time: 'دیروز', 
    text: 'پروفایل کاربری شما توسط سیستم تأیید شد. اکنون دسترسی کامل به آرشیو اسناد طبقه بندی نشده برای شما فراهم است.', 
    isRead: true, 
  },
  { 
    id: 3, 
    title: 'سند جدید در آرشیو: پرونده‌های لژ نیویورک', 
    time: '۳ روز پیش', 
    text: 'سند جدیدی شامل ۳۰ صفحه اطلاعات دسته‌اول از نشست‌های لژ نیویورک در دهه ۷۰ میلادی به بخش محتوای خام اضافه شد.', 
    isRead: true,
    link: '/raw-materials/new-york-lodge'
  },
  { 
    id: 4, 
    title: 'به‌روزرسانی قوانین سایت', 
    time: 'هفته گذشته', 
    text: 'قوانین و مقررات استفاده از محتوای پلتفرم به‌روزرسانی شده است. لطفاً برای جلوگیری از مسدود شدن حساب، تغییرات جدید را مطالعه نمایید.', 
    isRead: true,
  },
  { 
    id: 5, 
    title: 'پشتیبانی: درخواست شما بررسی شد', 
    time: 'ماه گذشته', 
    text: 'درخواست شما مبنی بر ارتقاء سطح کاربری بررسی و تایید گردید. هم‌اکنون سطح کاربری شما به «پژوهشگر ارشد» ارتقا یافته است.', 
    isRead: true,
  },
];

// === کامپوننت پایه اسکلتون با افکت Shimmer (گرافیک کلی1) ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // === استیت لودینگ برای اسکلتون ===
  const [isLoading, setIsLoading] = useState(true);

  // استیت‌های کنترل اعلان‌ها و فیلتر آن‌ها
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notifFilter, setNotifFilter] = useState('all'); 
  const [visibleNotifCount, setVisibleNotifCount] = useState(3);

  // استیت کنترل نمایش پنجره تأیید خروج و پاپ‌آپ جزئیات اعلان
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const cardRef = useRef(null);

  // بررسی وضعیت لاگین کاربر
  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    if (!logged) {
      router.push('/');
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  // شبیه‌سازی لودینگ هنگام تغییر تب‌ها
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // تابع خروج
  const confirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  // افکت نوری Spotlight
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // علامت‌گذاری همه به عنوان خوانده شده
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // کلیک روی اعلان
  const handleOpenNotification = (notif) => {
    setSelectedNotification(notif);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
  };

  // فیلتر اعلان‌ها
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.isRead;
    if (notifFilter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getDisplayCount = (count) => {
    if (count > 9) return '۹+';
    return toPersianDigits(count);
  };

  const displayUnreadCount = getDisplayCount(unreadCount);

  const tabs = [
    { id: 'profile', label: 'مشخصات', icon: 'user' },
    { id: 'downloads', label: 'دانلودها', icon: 'download' },
    { id: 'favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
    { id: 'notifications', label: 'اعلان‌ها', icon: 'bell', badge: unreadCount > 0 ? displayUnreadCount : null },
  ];

  if (!isLoggedIn) return null;

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      {/* پس‌زمینه نئونی */}
      <div className="fixed inset-0 z-[-10] bg-[#050810] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-20 bg-[radial-gradient(circle,rgba(217,70,239,0.2)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      {/* محتوای اصلی داشبورد */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 pt-0">
        
        <div className="flex flex-col gap-8">
          
          <div>
            <Breadcrumbs 
              items={[
                { label: 'مدار', href: '/' },
                { label: 'حساب کاربری' }
              ]} 
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* سایدبار ناوبری (گرافیک کلی1) - اصلاح کلاس تداخلی */}
            <aside className="w-full lg:w-1/4 flex-shrink-0 relative z-10">
              <div className="sticky top-32 rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
                
                <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#d946ef] p-0.5 shadow-lg">
                    <div className="w-full h-full bg-[#0b0f19] rounded-full flex items-center justify-center overflow-hidden">
                      <Icon name="user" className="w-8 h-8 text-gray-400 opacity-80" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">کاربر مدار</h2>
                    <p className="text-xs text-[#06b6d4] font-sans mt-1" dir="ltr">#MDR-8492</p>
                  </div>
                </div>

                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible hide-scroll pb-2 lg:pb-0 relative z-10">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const baseStyle = "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium w-full text-right transition-all group cursor-pointer border";
                    const activeStyle = isActive 
                      ? "bg-white/10 text-white border-white/15 shadow-[inset_3px_0_0_#06b6d4]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent";

                    return (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${baseStyle} ${activeStyle}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Icon name={tab.icon} className={`w-5 h-5 ${isActive ? 'text-[#06b6d4]' : 'text-gray-400 group-hover:text-white'}`} />
                            <span className="whitespace-nowrap font-bold">{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <div className="relative flex h-[18px] w-[18px] items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-rose-600 border-[1.5px] border-[#080c16] text-[9px] font-bold text-white items-center justify-center shadow-md font-sans">
                                {tab.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold w-full text-right text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all lg:mt-auto cursor-pointer"
                  >
                    <Icon name="signOut" className="w-5 h-5" />
                    <span className="whitespace-nowrap">خروج از حساب</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* بخش محتوای اصلی (گرافیک کلی1) */}
            <div className="w-full lg:w-3/4 relative z-10">
              <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                className="relative rounded-3xl border border-white/10 p-6 md:p-10 min-h-[600px] shadow-2xl overflow-hidden flex flex-col group"
              >
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
                
                <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.04),transparent_40%)] -z-10" />

                <div className="relative z-10 animate-[fadeIn_0.4s_ease-out] flex-grow">
                  
                  {/* حالت لودینگ اسکلتون */}
                  {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="border-b border-white/10 pb-4 space-y-2">
                        <BaseSkeleton className="w-48 h-8" rounded="rounded-lg" />
                        <BaseSkeleton className="w-72 h-4" rounded="rounded" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-black/40">
                        <BaseSkeleton className="h-14" rounded="rounded-lg" />
                        <BaseSkeleton className="h-14" rounded="rounded-lg" />
                        <BaseSkeleton className="h-14" rounded="rounded-lg" />
                      </div>
                      <div className="space-y-4 pt-4">
                        <BaseSkeleton className="w-full h-12" rounded="rounded-xl" />
                        <BaseSkeleton className="w-full h-12" rounded="rounded-xl" />
                        <BaseSkeleton className="w-full h-24" rounded="rounded-xl" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ۱. تب: مشخصات کاربری */}
                      {activeTab === 'profile' && (
                        <div>
                          <div className="mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                              <Icon name="idCard" className="text-[#06b6d4] w-6 h-6" /> مشخصات فردی
                            </h2>
                            <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light">
                              <p>اطلاعات حساب کاربری خود را تکمیل کنید تا دسترسی‌های متناسب با تخصص شما تنظیم شود.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl bg-[#080c16] border border-white/10 shadow-inner">
                            <div>
                              <label className="block text-[10px] text-gray-500 uppercase mb-1">شناسه سیستمی (ID)</label>
                              <div className="flex items-center gap-2 text-gray-300 font-sans text-sm bg-white/5 border border-white/5 px-3 py-2 rounded-xl cursor-not-allowed">
                                <Icon name="lock" className="w-4 h-4 text-gray-500" /> #MDR-8492
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 uppercase mb-1">تاریخ عضویت</label>
                              <div className="flex items-center gap-2 text-gray-300 font-sans text-sm bg-white/5 border border-white/5 px-3 py-2 rounded-xl cursor-not-allowed">
                                <Icon name="calendarBlank" className="w-4 h-4 text-gray-500" /> ۱۴۰۲/۰۸/۱۵
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 uppercase mb-1">شماره موبایل</label>
                              <div className="flex items-center justify-end gap-2 text-gray-300 font-sans text-sm bg-white/5 border border-white/5 px-3 py-2 rounded-xl cursor-not-allowed" dir="ltr">
                                <Icon name="lock" className="w-4 h-4 text-gray-500" /> +98 912 345 6789
                              </div>
                            </div>
                          </div>

                          <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm text-gray-300 mb-2 font-medium">نام</label>
                                <input type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner" placeholder="مثال: علی" />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2 font-medium">نام خانوادگی</label>
                                <input type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner" placeholder="مثال: علوی" />
                              </div>
                              
                              <div>
                                <label className="block text-sm text-gray-300 mb-2 font-medium">جنسیت</label>
                                <div className="relative">
                                  <select defaultValue="" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white outline-none appearance-none transition-all cursor-pointer shadow-inner">
                                    <option value="" disabled className="bg-[#0b0f19] text-gray-400">انتخاب کنید...</option>
                                    <option value="male" className="bg-[#0b0f19] text-white">مرد</option>
                                    <option value="female" className="bg-[#0b0f19] text-white">زن</option>
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2 font-medium">سال تولد</label>
                                <input type="number" dir="rtl" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner" placeholder="مثال: ۱۳۷۵" />
                              </div>

                              <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-gray-300 mb-2 font-medium">زمینه‌های تمایل به همکاری با مدار</label>
                                <textarea rows="3" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all resize-none text-justify shadow-inner font-light" placeholder="مثال: حمایت مالی، تدوین محتوا، ارسال اسناد..."></textarea>
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <button type="button" className="relative group bg-[#06b6d4] hover:bg-[#0891b2] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer">
                                <Icon name="save" className="w-5 h-5" />
                                <span>ذخیره تغییرات</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* ۲. تب: دانلودها */}
                      {activeTab === 'downloads' && (
                        <div className="flex flex-col h-full">
                          <div className="mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                              <Icon name="download" className="text-[#06b6d4] w-6 h-6" /> فایل‌های دانلود شده
                            </h2>
                            <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light">
                              <p>تاریخچه دسترسی شما به اسناد راش و محتوای خام شبکه مدار.</p>
                            </div>
                          </div>

                          {mockDownloads.length === 0 ? (
                            <EmptyState 
                              icon="download" 
                              title="هیچ فایلی دانلود نکرده‌اید!" 
                              description="شما هنوز هیچ سند یا فایل راشی را از بایگانی مدار دانلود نکرده‌اید. اسناد مورد نظر خود را از بخش آرشیو دریافت کنید."
                              actionText="ورود به بایگانی اسناد"
                              onAction={() => router.push('/archive')}
                              color="text-[#06b6d4]"
                            />
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                {mockDownloads.map(dl => (
                                  <div key={dl.id} className={`group flex flex-col p-4 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 ${dl.theme.hoverShadow} cursor-pointer shadow-lg`}>
                                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${dl.theme.gradientVia} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20`} />

                                    <div className="relative w-full h-44 rounded-2xl bg-gray-900 overflow-hidden mb-3 flex items-center justify-center border border-white/5">
                                      <BlurImage 
                                        src={dl.image} 
                                        alt={dl.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                                      />

                                      <button className="absolute bottom-3 left-3 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-[#06b6d4] hover:border-[#06b6d4] transition-colors cursor-pointer shadow-lg">
                                        <Icon name="downloadSimple" className="w-4 h-4 fill-current" />
                                      </button>
                                    </div>

                                    <div className="relative z-10 flex-grow px-1">
                                      <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed line-clamp-1 group-hover:${dl.theme.badgeText} transition-colors`}>{dl.title}</h3>
                                      <span className={`text-xs ${dl.theme.badgeText} font-bold opacity-90`}>{dl.category}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-auto flex justify-center pt-6 border-t border-white/10">
                                <button className="relative group bg-[#080c16] border border-white/10 text-white px-8 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/5 hover:border-[#06b6d4] hover:text-[#06b6d4] transition-all duration-300 cursor-pointer shadow-inner">
                                  <span>مشاهده همه دانلودها</span>
                                  <Icon name="caretDown" className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* ۳. تب: علاقه‌مندی‌ها */}
                      {activeTab === 'favorites' && (
                        <div className="flex flex-col h-full">
                          <div className="mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                              <Icon name="heart" className="text-rose-500 w-6 h-6" /> نشان‌شده‌ها
                            </h2>
                            <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light">
                              <p>مستندات، اخبار و ابزارهایی که برای دسترسی سریع‌تر ذخیره کرده‌اید.</p>
                            </div>
                          </div>

                          {mockFavorites.length === 0 ? (
                            <EmptyState 
                              icon="heart" 
                              title="هنوز هیچ موردی را نشان نکرده‌اید!" 
                              description="شما می‌توانید اسناد مهم بایگانی، مستندات یا مقالات را با زدن دکمه قلب نشانه‌گذاری کنید تا همیشه در این بخش در دسترس شما باشند."
                              actionText="کاوش در بایگانی اسناد"
                              onAction={() => router.push('/archive')}
                              color="text-rose-500"
                            />
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                {mockFavorites.map(fav => (
                                  <div key={fav.id} className={`group flex flex-col p-4 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-400 ease-out transform hover:-translate-y-1.5 ${fav.theme.hoverShadow} cursor-pointer shadow-lg`}>
                                    <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${fav.theme.gradientVia} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20`} />

                                    <div className="relative w-full h-44 rounded-2xl bg-gray-900 overflow-hidden mb-3 flex items-center justify-center border border-white/5">
                                      <BlurImage 
                                        src={fav.image} 
                                        alt={fav.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                                      />

                                      <button className="absolute bottom-3 left-3 z-20 w-9 h-9 rounded-full bg-rose-500 text-white backdrop-blur border border-rose-500/50 flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer shadow-lg">
                                        <Icon name="heart" className="w-4 h-4 fill-current" />
                                      </button>
                                    </div>

                                    <div className="relative z-10 flex-grow px-1">
                                      <h3 className={`text-sm font-bold text-white mb-2 leading-relaxed line-clamp-1 group-hover:${fav.theme.badgeText} transition-colors`}>{fav.title}</h3>
                                      <span className={`text-xs ${fav.theme.badgeText} font-bold opacity-90`}>{fav.category}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-auto flex justify-center pt-6 border-t border-white/10">
                                <button className="relative group bg-[#080c16] border border-white/10 text-white px-8 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/5 hover:border-rose-500 hover:text-rose-500 transition-all duration-300 cursor-pointer shadow-inner">
                                  <span>مشاهده همه علاقه‌مندی‌ها</span>
                                  <Icon name="caretDown" className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* ۴. تب: اعلان‌ها */}
                      {activeTab === 'notifications' && (
                        <div className="flex flex-col h-full">
                          <div className="mb-8 border-b border-white/10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <Icon name="bell" className="text-[#fbbf24] w-6 h-6" /> صندوق پیام‌ها
                              </h2>
                              <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light">
                                <p>اطلاعیه‌های سیستم و پیام‌های ارسالی از مدیریت مدار.</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                              <div className="flex gap-1 bg-[#080c16] p-1 rounded-xl border border-white/10 shadow-inner">
                                {[
                                  { id: 'all', label: 'همه' },
                                  { id: 'unread', label: 'خوانده نشده' },
                                  { id: 'read', label: 'خوانده شده' }
                                ].map(filter => (
                                  <button
                                    key={filter.id}
                                    onClick={() => setNotifFilter(filter.id)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${notifFilter === filter.id ? 'bg-white/15 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                                  >
                                    {filter.label}
                                  </button>
                                ))}
                              </div>

                              <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-gray-400 hover:text-[#06b6d4] transition-colors whitespace-nowrap cursor-pointer bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 font-bold"
                              >
                                خواندن همه
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            {filteredNotifications.length === 0 ? (
                              <EmptyState 
                                icon="bell" 
                                title="صندوق پیام‌های شما خالی است!" 
                                description="در حال حاضر هیچ اعلانی در این دسته وجود ندارد. اطلاعیه‌های سیستم و پیام‌های مدیریت مدار در این قسمت نمایش داده خواهند شد."
                                color="text-[#fbbf24]"
                              />
                            ) : (
                              filteredNotifications.slice(0, visibleNotifCount).map((notif) => (
                                <div 
                                  key={notif.id}
                                  onClick={() => handleOpenNotification(notif)}
                                  className={`block p-5 rounded-2xl transition-all relative overflow-hidden group cursor-pointer border ${
                                    notif.isRead 
                                      ? 'bg-white/5 border-white/5 hover:bg-white/10 opacity-70 hover:opacity-100' 
                                      : 'bg-white/10 border-[#06b6d4]/30 hover:bg-white/15 border-r-4 border-r-[#06b6d4] shadow-[0_5px_20px_-10px_rgba(6,182,212,0.3)]'
                                  }`}
                                >
                                  <div className="flex items-start gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${notif.isRead ? 'bg-gray-500/20 text-gray-400' : 'bg-[#06b6d4]/20 text-[#06b6d4]'}`}>
                                      {!notif.isRead && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-[#080c16]"></span>
                                        </span>
                                      )}
                                      <Icon name={notif.isRead ? "checkCircle" : "info"} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>{notif.title}</h4>
                                        <span className={`text-[10px] font-sans ${notif.isRead ? 'text-gray-500' : 'text-[#06b6d4]'}`}>{notif.time}</span>
                                      </div>
                                      <div className="rich-text text-xs leading-relaxed text-justify line-clamp-2 text-gray-300 font-light">
                                        <p>{notif.text}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {visibleNotifCount < filteredNotifications.length && (
                            <div className="mt-auto flex justify-center pt-6 border-t border-white/10">
                              <button 
                                onClick={() => setVisibleNotifCount(prev => prev + 3)}
                                className="relative group bg-[#080c16] border border-white/10 text-white px-8 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/5 hover:border-[#fbbf24] hover:text-[#fbbf24] transition-all duration-300 cursor-pointer shadow-inner"
                              >
                                <span>نمایش اعلان‌های بیشتر</span>
                                <Icon name="caretDown" className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* پنجره تأیید خروج از حساب کاربری */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsLogoutModalOpen(false)}></div>
            <div className="relative z-10 bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
              
              <button onClick={() => setIsLogoutModalOpen(false)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <Icon name="close" className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                  <Icon name="signOut" className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">خروج از حساب کاربری</h3>
                <div className="rich-text text-xs text-gray-300 leading-relaxed text-center font-light">
                  <p>آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer">خیر</button>
                <button onClick={confirmLogout} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer">بله، خارج می‌شوم</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* پنجره نمایش جزئیات اعلان */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedNotification(null)}></div>
            
            <div className="relative z-10 bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />

              <button onClick={() => setSelectedNotification(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <Icon name="close" className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6 pr-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${selectedNotification.isRead ? 'bg-gray-500/20 text-gray-400' : 'bg-[#06b6d4]/20 text-[#06b6d4]'}`}>
                  <Icon name={selectedNotification.isRead ? "checkCircle" : "info"} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight mb-1">{selectedNotification.title}</h3>
                  <span className="text-xs text-gray-500 font-sans">{selectedNotification.time}</span>
                </div>
              </div>

              {selectedNotification.image && (
                <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-video relative">
                  <BlurImage src={selectedNotification.image} alt={selectedNotification.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="rich-text text-sm text-gray-300 leading-relaxed text-justify mb-8 font-light">
                <p>{selectedNotification.text}</p>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
                {selectedNotification.link && (
                  <button onClick={() => {
                    setSelectedNotification(null);
                    router.push(selectedNotification.link);
                  }} className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2] text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex justify-center items-center gap-2">
                    <Icon name="link" className="w-4 h-4" /> مشاهده جزئیات بیشتر
                  </button>
                )}
                <button onClick={() => setSelectedNotification(null)} className={`bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${selectedNotification.link ? 'flex-1' : 'w-full'}`}>
                  بستن پنجره
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}