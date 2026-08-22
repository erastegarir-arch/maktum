'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import Icon from '../Icon'; 
import Breadcrumbs from '../Breadcrumbs';
import EmptyState from '../EmptyState'; 
import BlurImage from '../BlurImage'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// پکیج‌های تقویم شمسی
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"; 

import { logoutAction } from '@/app/actions/auth';
import { updateUserProfileAction } from '@/app/actions/user';
import { toggleFavoriteAction } from '@/app/actions/interactions'; 

// === ایمپورت توابع اعلان‌ها ===
import { getUserNotificationsAction, markNotificationAsReadAction } from '@/app/actions/notifications';

// ==========================================
// توابع کمکی و دیتای ثابت
// ==========================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

// تابع کمکی برای پارس امن JSON
const safeParse = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const getContentLink = (type, slug) => {
  switch(type) {
    case 'BLOG': return `/blog/${slug}`;
    case 'PRODUCED': return `/p/${slug}`;
    case 'RAW': return `/f/${slug}`;
    case 'TOOL': return `/tool/${slug}`;
    default: return `/p/${slug}`;
  }
};

const getContentTypeLabel = (type) => {
  switch(type) {
    case 'BLOG': return { label: 'مقاله بلاگ', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'PRODUCED': return { label: 'محتوای تولیدی', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    case 'RAW': return { label: 'محتوای خام', color: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' };
    case 'TOOL': return { label: 'ابزارها', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    default: return { label: 'محتوا', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
};

const IRAN_PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری",
  "خراسان جنوبی", "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان", "لرستان",
  "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

const EDUCATION_DEGREES = [
  "زیر دیپلم", "دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکترا", 
  "سطح ۱ حوزوی", "سطح ۲ حوزوی", "سطح ۳ حوزوی", "سطح ۴ حوزوی"
];

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px #080c16 inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

const Tooltip = ({ children, text }) => (
  <div className="relative group/tooltip flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
      <div className="bg-[#0b0f19] text-white text-[10px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-bold font-sans border border-white/10">
        {text}
      </div>
    </div>
  </div>
);

const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// ==========================================
// کامپوننت اصلی داشبورد کاربر
// ==========================================
export default function UserDashboard({ initialUser }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [favorites, setFavorites] = useState(initialUser?.favorites || []);
  const [uniqueDownloads, setUniqueDownloads] = useState([]);

  const [formData, setFormData] = useState({
    firstName: initialUser?.firstName || '',
    lastName: initialUser?.lastName || '',
    gender: initialUser?.gender || '',
    birthYear: initialUser?.birthYear || '',
    province: initialUser?.province || '',
    city: initialUser?.city || '',
    educationDegree: initialUser?.educationDegree || '',
    major: initialUser?.major || '',
    email: initialUser?.email || '',
    artResearchField: initialUser?.artResearchField || '',
    cooperationInterests: initialUser?.cooperationInterests || '',
  });

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null); // برای مودال اعلان
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const cardRef = useRef(null);

  const joinedDate = initialUser?.createdAt 
    ? toPersianDigits(new Date(initialUser.createdAt).toLocaleDateString('fa-IR')) 
    : 'نامشخص';

  useEffect(() => {
    if (initialUser?.downloadHistory) {
      const unique = [];
      const map = new Map();
      for (const item of initialUser.downloadHistory) {
        if (item.content && !map.has(item.content.id)) {
          map.set(item.content.id, true);
          unique.push(item.content);
        }
      }
      setUniqueDownloads(unique);
    }
  }, [initialUser]);

  // دریافت نوتیفیکیشن‌ها هنگام لود صفحه
  useEffect(() => {
    async function fetchNotifications() {
      setIsLoadingNotifications(true);
      const res = await getUserNotificationsAction(50); // دریافت 50 اعلان آخر
      if (res.success) {
        setNotifications(res.data);
      }
      setIsLoadingNotifications(false);
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const confirmLogout = async () => {
    setIsLoading(true);
    await logoutAction(); 
    localStorage.removeItem('isLoggedIn'); 
    setIsLogoutModalOpen(false);
    toast.success('با موفقیت خارج شدید.');
    router.push('/');
    router.refresh(); 
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateUserProfileAction(formData);
    setIsSaving(false);

    if (res.success) toast.success(res.message);
    else toast.error(res.error);
  };

  const handleRemoveFavorite = async (favoriteId, contentId) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    const res = await toggleFavoriteAction(contentId);
    if (res.success) {
      toast.success('محتوا از علاقه‌مندی‌های شما حذف شد.');
    } else {
      toast.error('خطا در حذف علاقه‌مندی.');
    }
  };

  const handleOpenNotification = async (notif) => {
    // باز کردن مودال اعلان
    setSelectedNotification(notif);

    // اگر خوانده نشده بود، به سرور پیام بفرست تا خوانده شده مارک شود
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      await markNotificationAsReadAction(notif.id);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.length - unreadCount;

  const tabs = [
    { id: 'profile', label: 'مشخصات', icon: 'idCard' },
    { id: 'downloads', label: 'دانلودها', icon: 'download' },
    { id: 'favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
    { id: 'notifications', label: 'اعلان‌ها', icon: 'bell', badge: unreadCount > 0 ? toPersianDigits(unreadCount) : null },
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-20 bg-[radial-gradient(circle,rgba(217,70,239,0.2)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 pt-0">
        <div className="flex flex-col gap-8">
          <div><Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'حساب کاربری' }]} /></div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-1/4 flex-shrink-0 relative z-10">
              <div className="sticky top-32 rounded-3xl p-6 shadow-2xl overflow-hidden border border-transparent">
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
                
                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#d946ef] p-0.5 shadow-lg">
                    <div className="w-full h-full bg-[#0b0f19] rounded-full flex items-center justify-center overflow-hidden">
                      <Icon name="user" className="w-8 h-8 text-gray-400 opacity-80" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg font-sans">
                      {initialUser?.firstName || initialUser?.lastName ? `${initialUser.firstName || ''} ${initialUser.lastName || ''}` : 'کاربر مدار'}
                    </h2>
                    <p className="text-sm font-bold text-[#06b6d4] font-sans mt-1" dir="ltr">{toPersianDigits(initialUser?.phone)}</p>
                  </div>
                </div>

                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible hide-scroll pb-2 lg:pb-0 relative z-10">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const baseStyle = "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold w-full text-right transition-all group cursor-pointer border border-transparent";
                    const activeStyle = isActive 
                      ? "bg-white/10 text-white border-white/10 shadow-[inset_3px_0_0_#06b6d4]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5";

                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${baseStyle} ${activeStyle}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Icon name={tab.icon} className={`w-5 h-5 ${isActive ? 'text-[#06b6d4]' : 'text-gray-400 group-hover:text-white transition-colors'}`} />
                            <span className="whitespace-nowrap font-sans">{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <div className="relative flex h-[18px] w-[18px] items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-rose-600 border-[1.5px] border-[#080c16] text-[10px] font-bold text-white items-center justify-center shadow-md font-sans pt-[2px]">
                                {tab.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  
                  <Tooltip text="خروج امن از سیستم">
                    <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold w-full text-right text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all lg:mt-auto cursor-pointer">
                      <Icon name="signOut" className="w-5 h-5" />
                      <span className="whitespace-nowrap font-sans">خروج از حساب</span>
                    </button>
                  </Tooltip>
                </nav>
              </div>
            </aside>

            <div className="w-full lg:w-3/4 relative z-10">
              <div ref={cardRef} onMouseMove={handleMouseMove} className="relative rounded-3xl p-6 md:p-10 min-h-[600px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col group border border-transparent">
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
                <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.04),transparent_40%)] -z-10" />

                <div className="relative z-10 animate-[fadeIn_0.4s_ease-out] flex-grow">
                  {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="border-b border-white/5 pb-4 space-y-2"><BaseSkeleton className="w-48 h-8" rounded="rounded-lg" /><BaseSkeleton className="w-72 h-4" rounded="rounded" /></div>
                      <div className="space-y-4 pt-4"><BaseSkeleton className="w-full h-12" rounded="rounded-xl" /><BaseSkeleton className="w-full h-12" rounded="rounded-xl" /><BaseSkeleton className="w-full h-24" rounded="rounded-xl" /></div>
                    </div>
                  ) : (
                    <>
                      {/* تب مشخصات فردی */}
                      {activeTab === 'profile' && (
                        <div>
                          <div className="mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Icon name="idCard" className="text-[#06b6d4] w-6 h-6" /> مشخصات فردی</h2>
                            <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light"><p>اطلاعات حساب کاربری خود را تکمیل کنید تا دسترسی‌های متناسب با تخصص شما در پلتفرم تنظیم شود.</p></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl bg-white/5 shadow-inner border border-transparent">
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">شناسه سیستمی (ID)</label><div className="flex items-center gap-2 text-gray-300 font-sans text-xs bg-black/20 px-3 py-2.5 rounded-xl cursor-not-allowed border border-transparent shadow-inner"><Icon name="lock" className="w-4 h-4 text-gray-500 shrink-0" /> <span className="truncate">#{initialUser?.id?.slice(-8).toUpperCase()}</span></div></div>
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">تاریخ عضویت</label><div className="flex items-center gap-2 text-gray-300 font-sans text-sm bg-black/20 px-3 py-2.5 rounded-xl cursor-not-allowed border border-transparent shadow-inner"><Icon name="calendarBlank" className="w-4 h-4 text-gray-500" /> {joinedDate}</div></div>
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">شماره موبایل</label><div className="flex items-center justify-end gap-2 text-gray-300 font-sans text-sm bg-black/20 px-3 py-2.5 rounded-xl cursor-not-allowed border border-transparent shadow-inner" dir="ltr"><Icon name="lock" className="w-4 h-4 text-gray-500" /> {toPersianDigits(initialUser?.phone)}</div></div>
                          </div>

                          <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">نام</label>
                                <input name="firstName" value={formData.firstName} onChange={handleFormChange} type="text" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all font-sans" placeholder="" style={autofillFixStyle} />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">نام خانوادگی</label>
                                <input name="lastName" value={formData.lastName} onChange={handleFormChange} type="text" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all font-sans" placeholder="" style={autofillFixStyle} />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">جنسیت</label>
                                <div className="relative">
                                  <select name="gender" value={formData.gender} onChange={handleFormChange} className={`w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm outline-none appearance-none transition-all cursor-pointer font-sans ${formData.gender ? 'text-white' : 'text-gray-500 font-light'}`} style={autofillFixStyle}>
                                    <option value="" disabled className="bg-[#0b0f19] text-gray-500">انتخاب کنید...</option>
                                    <option value="MALE" className="bg-[#0b0f19] text-white">مرد</option>
                                    <option value="FEMALE" className="bg-[#0b0f19] text-white">زن</option>
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div>
                                 <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">تاریخ تولد (تقویم شمسی)</label>
                                 <DatePicker
                                    value={formData.birthYear || ''}
                                    onChange={(date) => setFormData({...formData, birthYear: date?.format('YYYY/MM/DD') || ''})}
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    className="bg-dark"
                                    inputClass="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light font-sans outline-none transition-all cursor-pointer"
                                    placeholder=""
                                 />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">استان</label>
                                <div className="relative">
                                  <select name="province" value={formData.province} onChange={handleFormChange} className={`w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm outline-none appearance-none transition-all cursor-pointer font-sans ${formData.province ? 'text-white' : 'text-gray-500 font-light'}`} style={autofillFixStyle}>
                                    <option value="" className="bg-[#0b0f19] text-gray-500">انتخاب استان...</option>
                                    {IRAN_PROVINCES.map(prov => <option key={prov} value={prov} className="bg-[#0b0f19] text-white">{prov}</option>)}
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">شهر</label>
                                <input name="city" value={formData.city} onChange={handleFormChange} type="text" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all font-sans" placeholder="" style={autofillFixStyle} />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">مدرک تحصیلی</label>
                                <div className="relative">
                                  <select name="educationDegree" value={formData.educationDegree} onChange={handleFormChange} className={`w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm outline-none appearance-none transition-all cursor-pointer font-sans ${formData.educationDegree ? 'text-white' : 'text-gray-500 font-light'}`} style={autofillFixStyle}>
                                    <option value="" className="bg-[#0b0f19] text-gray-500">انتخاب مدرک...</option>
                                    {EDUCATION_DEGREES.map(deg => <option key={deg} value={deg} className="bg-[#0b0f19] text-white">{deg}</option>)}
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">رشته تحصیلی</label>
                                <input name="major" value={formData.major} onChange={handleFormChange} type="text" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all font-sans" placeholder="" style={autofillFixStyle} />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">ایمیل</label>
                                <input name="email" value={formData.email} onChange={handleFormChange} type="email" dir="ltr" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all text-left font-sans" placeholder="" style={autofillFixStyle} />
                              </div>
                              
                              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">حوزه فعالیت هنری/پژوهشی</label>
                                <input name="artResearchField" value={formData.artResearchField} onChange={handleFormChange} type="text" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all font-sans" placeholder="" style={autofillFixStyle} />
                              </div>

                              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <label className="block text-xs text-gray-400 font-bold mb-2 pl-1">زمینه‌های تمایل به همکاری با مدار</label>
                                <textarea name="cooperationInterests" value={formData.cooperationInterests} onChange={handleFormChange} rows="3" className="w-full bg-white/5 border border-transparent shadow-inner hover:bg-white/10 focus:border-[#06b6d4] focus:bg-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 placeholder:font-light outline-none transition-all resize-none text-justify font-sans" placeholder="" style={autofillFixStyle}></textarea>
                              </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5">
                              <Tooltip text="ذخیره تغییرات در پایگاه داده">
                                <button disabled={isSaving} type="submit" className="relative group bg-[#06b6d4] hover:bg-[#0891b2] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-50 border border-transparent">
                                  {isSaving ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : <Icon name="save" className="w-5 h-5" />}
                                  <span className="font-sans">{isSaving ? 'در حال ذخیره...' : 'ذخیره مشخصات'}</span>
                                </button>
                              </Tooltip>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* تب دانلودها */}
                      {activeTab === 'downloads' && (
                        <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">محتواهای دانلود شده</h2>
                          {uniqueDownloads.length === 0 ? (
                            <EmptyState icon="download" title="هنوز فایلی دانلود نشده" description="مستندات و فایل‌هایی که دانلود می‌کنید در اینجا نمایش داده خواهند شد." color="text-[#06b6d4]" />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {uniqueDownloads.map((content) => {
                                const typeLabel = getContentTypeLabel(content.type);
                                return (
                                  <Link key={content.id} href={getContentLink(content.type, content.slug)} className="bg-white/5 border border-transparent shadow-inner hover:bg-white/10 rounded-2xl p-3 flex gap-4 items-center transition-all group cursor-pointer">
                                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center">
                                      <BlurImage src={content.coverMobile || content.coverDesktop || '/placeholder.jpg'} alt={content.titleBase} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#06b6d4] transition-colors font-sans">{content.titleBase} {content.titleHighlight}</h3>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-inner font-sans ${typeLabel.color}`}>{typeLabel.label}</span>
                                      </div>
                                    </div>
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] group-hover:bg-[#06b6d4] group-hover:text-white flex items-center justify-center transition-colors border border-transparent shadow-inner">
                                      <Icon name="arrowLeft" className="w-4 h-4" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* تب علاقه‌مندی‌ها */}
                      {activeTab === 'favorites' && (
                        <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">محتواهای نشان‌شده</h2>
                          {favorites.length === 0 ? (
                            <EmptyState icon="heart" title="لیست علاقه‌مندی‌ها خالی است" description="محتواهایی که نشان می‌کنید برای دسترسی سریع‌تر اینجا قرار می‌گیرند." color="text-rose-500" />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {favorites.map((fav) => {
                                const content = fav.content;
                                if (!content) return null;
                                const typeLabel = getContentTypeLabel(content.type);
                                return (
                                  <div key={fav.id} className="bg-white/5 border border-transparent shadow-inner hover:bg-white/10 rounded-2xl p-3 flex gap-4 items-center transition-all group">
                                    <Link href={getContentLink(content.type, content.slug)} className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black/40 relative cursor-pointer flex items-center justify-center">
                                      <BlurImage src={content.coverMobile || content.coverDesktop || '/placeholder.jpg'} alt={content.titleBase} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                      <Link href={getContentLink(content.type, content.slug)} className="block cursor-pointer">
                                        <h3 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors font-sans">{content.titleBase} {content.titleHighlight}</h3>
                                      </Link>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-inner font-sans ${typeLabel.color}`}>{typeLabel.label}</span>
                                      </div>
                                    </div>
                                    <Tooltip text="حذف از علاقه‌مندی‌ها">
                                      <button onClick={() => handleRemoveFavorite(fav.id, content.id)} className="w-10 h-10 shrink-0 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-rose-600 shadow-inner">
                                        <Icon name="heart" className="w-4 h-4 fill-current" />
                                      </button>
                                    </Tooltip>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* تب اعلان‌ها */}
                      {activeTab === 'notifications' && (
                        <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/5 pb-4 gap-4">
                            <h2 className="text-xl font-bold text-white font-sans">اعلان‌ها و پیام‌ها</h2>
                            <div className="flex items-center gap-4 text-xs font-sans bg-black/20 px-4 py-2 rounded-xl shadow-inner border border-transparent">
                              <span className="text-gray-400">کل پیام‌ها: <strong className="text-white ml-1">{toPersianDigits(notifications.length)}</strong></span>
                              <div className="w-1 h-1 rounded-full bg-white/20"></div>
                              <span className="text-gray-400">خوانده نشده: <strong className="text-rose-400 ml-1">{toPersianDigits(unreadCount)}</strong></span>
                              <div className="w-1 h-1 rounded-full bg-white/20"></div>
                              <span className="text-gray-400">خوانده شده: <strong className="text-emerald-400 ml-1">{toPersianDigits(readCount)}</strong></span>
                            </div>
                          </div>

                          {isLoadingNotifications ? (
                            <div className="flex justify-center items-center py-20">
                              <Icon name="loading" className="w-8 h-8 text-amber-500 animate-spin" />
                            </div>
                          ) : notifications.length === 0 ? (
                            <EmptyState icon="bell" title="صندوق پیام خالی است" description="اطلاعیه‌های سیستم و پیام‌های دریافتی از مدیریت در این بخش قابل مشاهده است." color="text-amber-500" />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {notifications.map(notif => {
                                const notifData = notif.notification;
                                const themeColor = notifData.themeColor || '#10b981';
                                
                                return (
                                  <div 
                                    key={notif.id} 
                                    onClick={() => handleOpenNotification(notif)}
                                    className={`relative bg-white/5 border border-transparent shadow-inner hover:bg-white/10 rounded-2xl p-3 flex gap-4 items-center transition-all group cursor-pointer overflow-hidden ${!notif.isRead ? 'ring-1 ring-white/10' : 'opacity-70'}`}
                                  >
                                    <div className="absolute top-0 right-0 w-1.5 h-full" style={{ backgroundColor: themeColor }}></div>
                                    {!notif.isRead && (
                                      <span className="absolute top-3 right-4 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                      </span>
                                    )}

                                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center mr-2 shadow-inner">
                                      {notifData.coverUrl || notifData.iconUrl ? (
                                        <BlurImage src={notifData.coverUrl || notifData.iconUrl} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                      ) : (
                                        <Icon name="bell" className="w-8 h-8 text-gray-500" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-1">
                                      <h3 className="text-sm font-bold text-white truncate transition-colors font-sans mb-1" style={{ color: !notif.isRead ? '#ffffff' : '#9ca3af' }}>{notifData.title}</h3>
                                      <p className="text-[10px] text-gray-400 line-clamp-1 font-sans font-light" dangerouslySetInnerHTML={{ __html: notifData.bodyHtml?.replace(/<[^>]+>/g, '') || '' }}></p>
                                      
                                      <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[9px] text-gray-500 font-sans">{toPersianDigits(new Date(notifData.createdAt).toLocaleDateString('fa-IR'))}</span>
                                        <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity font-sans" style={{ color: themeColor }}>کلیک برای مشاهده کامل...</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
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

      {/* پاپ‌آپ مشاهده جزئیات اعلان */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedNotification(null)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }} 
              className="relative z-10 bg-[#050810]/95 backdrop-blur-2xl rounded-3xl w-full max-w-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-transparent overflow-hidden flex flex-col max-h-[85vh]" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-1.5 h-full z-20" style={{ backgroundColor: selectedNotification.notification.themeColor || '#10b981' }}></div>
              <button onClick={() => setSelectedNotification(null)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white hover:bg-rose-500 transition-colors cursor-pointer z-30 shadow-inner border border-transparent">
                <Icon name="close" className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto custom-scrollbar">
                {selectedNotification.notification.coverUrl && (
                  <div className="w-full aspect-video sm:aspect-[21/9] bg-black/40 relative shrink-0">
                    <img src={selectedNotification.notification.coverUrl} alt="cover" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-6 sm:p-8">
                  <div className="flex gap-4 items-start mb-6">
                    {selectedNotification.notification.iconUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-black/30 border border-transparent shadow-inner flex items-center justify-center shrink-0">
                        <img src={selectedNotification.notification.iconUrl} className="w-7 h-7 object-contain" alt="icon" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-black/30 border border-transparent shadow-inner flex items-center justify-center shrink-0">
                        <Icon name="bell" className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-lg text-white mb-1.5 font-sans leading-snug pr-2">{selectedNotification.notification.title}</h3>
                      <span className="text-[10px] text-gray-500 font-sans block pr-2">
                        {toPersianDigits(new Date(selectedNotification.notification.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
                      </span>
                    </div>
                  </div>

                  <div className="rich-text text-sm text-gray-300 leading-relaxed font-light font-sans text-justify mb-6 bg-white/5 p-5 rounded-2xl border border-transparent shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: selectedNotification.notification.bodyHtml }} />
                  </div>

                  {safeParse(selectedNotification.notification.ctaButtons, []).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {safeParse(selectedNotification.notification.ctaButtons, []).map(btn => (
                        <a 
                          key={btn.id} 
                          href={btn.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs px-6 py-3.5 rounded-xl text-white hover:brightness-110 transition-all font-bold font-sans shadow-md"
                          style={{ backgroundColor: selectedNotification.notification.themeColor || '#10b981' }}
                        >
                          {btn.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsLogoutModalOpen(false)}></div>
            <div className="relative z-10 bg-[#050810]/90 backdrop-blur-2xl rounded-3xl w-full max-w-sm p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-transparent overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
              <button onClick={() => setIsLogoutModalOpen(false)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-4 h-4" /></button>
              <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-transparent shadow-inner flex items-center justify-center text-rose-400 mb-4"><Icon name="signOut" className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans">خروج از حساب کاربری</h3>
                <div className="rich-text text-xs text-gray-300 leading-relaxed text-center font-light font-sans"><p>آیا مطمئن هستید که می‌خواهید از حساب کاربری خود در مدار خارج شوید؟</p></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer font-sans border border-transparent shadow-inner">خیر</button>
                <button onClick={confirmLogout} disabled={isLoading} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 font-sans border border-transparent">{isLoading ? 'در حال خروج...' : 'بله، خارج می‌شوم'}</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}