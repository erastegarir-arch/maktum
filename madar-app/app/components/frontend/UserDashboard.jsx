'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import Icon from '../Icon'; 
import Breadcrumbs from '../Breadcrumbs';
import EmptyState from '../EmptyState'; 
import BlurImage from '../BlurImage'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { logoutAction } from '@/app/actions/auth';
import { updateUserProfileAction, updatePasswordAction } from '@/app/actions/user';
import { toggleFavoriteAction } from '@/app/actions/interactions'; 
import { getUserNotificationsAction, markNotificationAsReadAction } from '@/app/actions/notifications';

import { iranLocations } from '@/lib/iranLocations';
import ModalPortal from '@/app/components/admin/ModalPortal';

// ==========================================
// توابع کمکی
// ==========================================
const cn = (...inputs) => twMerge(clsx(inputs));

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const safeParse = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { 
      let parsed = JSON.parse(val); 
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch { return fallback; }
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
    case 'BLOG': return { label: 'مقاله بلاگ', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'PRODUCED': return { label: 'محتوای تولیدی', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    case 'RAW': return { label: 'محتوای خام', color: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' };
    case 'TOOL': return { label: 'ابزارها', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    default: return { label: 'محتوا', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
};

const EDUCATION_DEGREES = [
  "زیر دیپلم", "دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکترا", 
  "سطح ۱ حوزوی", "سطح ۲ حوزوی", "سطح ۳ حوزوی", "سطح ۴ حوزوی"
];

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px rgba(255, 255, 255, 0) inset',
  transition: 'background-color 5000s ease-in-out 0s'
};

const getDynamicStyle = (value) => ({
  ...autofillFixStyle,
  WebkitTextFillColor: value ? 'white' : 'rgba(255, 255, 255, 0.4)'
});

// ==========================================
// کامپوننت تولتیپ هوشمند
// ==========================================
const Tooltip = ({ children, text }) => {
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
  };

  const hideTooltip = () => setCoords(null);

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={hideTooltip}
      className="relative flex items-center justify-center"
    >
      {children}
      {coords && text && (
        <ModalPortal>
          <div 
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed -translate-x-1/2 -translate-y-full z-[999999] pointer-events-none animate-[fadeIn_0.15s_ease-out]"
          >
            <div className="bg-[#050810]/95 backdrop-blur-xl border border-white/20 text-gray-100 text-[10px] py-1.5 px-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.9)] whitespace-nowrap font-bold font-sans">
              {text}
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

// ==========================================
// کامپوننت لیست کشویی شیشه‌ای اختصاصی
// ==========================================
const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => 
    (typeof opt === 'object' ? opt.value : opt) === value
  );

  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  return (
    <div ref={containerRef} className="relative h-[45px] md:h-[52px] w-full select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-full bg-white/[0.03] backdrop-blur-sm border shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] rounded-2xl px-4 flex items-center justify-between text-xs md:text-sm font-sans outline-none transition-all",
          disabled ? "opacity-50 cursor-not-allowed border-white/[0.05]" : "cursor-pointer hover:bg-white/[0.06]",
          isOpen ? "border-[#06b6d4] bg-white/[0.08] shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border-white/[0.05]",
          value ? "text-white" : "text-white/40"
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <Icon 
          name="caretDown" 
          className={cn("w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180 text-[#06b6d4]")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 left-0 top-[calc(100%+8px)] z-[150] bg-[#080c16]/95 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(255,255,255,0.03)] py-2 max-h-56 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt, idx) => {
              const optValue = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = value === optValue;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "mx-2 my-0.5 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-sans cursor-pointer transition-all flex items-center justify-between",
                    isSelected 
                      ? "bg-[#06b6d4]/20 text-[#06b6d4] font-bold border border-[#06b6d4]/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.15)]" 
                      : "text-gray-300 hover:bg-white/[0.07] hover:text-white border border-transparent"
                  )}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
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

  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const [favorites, setFavorites] = useState(initialUser?.favorites || []);
  const [uniqueDownloads, setUniqueDownloads] = useState([]);
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, favId: null, contentId: null });

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
  const [selectedNotification, setSelectedNotification] = useState(null); 
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const cardRef = useRef(null);
  const asideRef = useRef(null);
  const [asideHeight, setAsideHeight] = useState(140);
  const [isNavSticky, setIsNavSticky] = useState(false);

  const joinedDate = initialUser?.createdAt 
    ? toPersianDigits(new Date(initialUser.createdAt).toLocaleDateString('fa-IR')) 
    : 'نامشخص';

  const provinces = Object.keys(iranLocations);
  const availableCities = formData.province ? iranLocations[formData.province] : [];

  useEffect(() => {
    if (!asideRef.current) return;
    const updateHeight = () => {
      if (asideRef.current && window.innerWidth < 1024) {
        setAsideHeight(asideRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(asideRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isNavSticky]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) {
        setIsNavSticky(false);
        return;
      }
      const navAnchor = document.getElementById('nav-anchor');
      if (navAnchor) {
        const top = navAnchor.getBoundingClientRect().top;
        setIsNavSticky(prev => {
          if (!prev && top <= -12) return true;
          if (prev && top >= -2) return false;
          return prev;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const anchor = document.getElementById('nav-anchor');
        if (anchor) {
          const anchorTop = anchor.getBoundingClientRect().top + window.scrollY;
          if (window.scrollY > anchorTop + 16 || isNavSticky) {
            window.scrollTo({ top: anchorTop + 14, behavior: 'smooth' });
          }
        }
      }, 40);
    }
  };

  // ========================================================
  // مخفی کردن قطعی و بی‌رحمانه تمام آیکون‌های هدر (سرچ و آدمک)
  // ========================================================
  useEffect(() => {
    const hideHeaderIcons = () => {
      // انتخاب هر لینکی و دکمه‌ای که در صفحه هست
      const candidates = document.querySelectorAll('a, button, div[role="button"]');
      
      candidates.forEach(el => {
        // به المان‌های داخل داشبورد کاری نداریم تا پنل خراب نشود
        if (el.closest('aside') || el.closest('main') || el.closest('#dashboard-content') || el.closest('[role="dialog"]')) return;

        // فقط دکمه‌های آیکونی کوچک (بدون متن) مخفی شوند تا لوگو و عناوین لینک‌دار حفظ شوند
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < 120 && rect.width < 55 && !el.textContent.trim()) {
          el.style.setProperty('display', 'none', 'important');
          el.classList.add('dashboard-hidden-icon');
        }
      });
    };

    hideHeaderIcons();
    // تکرار در بازه‌های مختلف برای مقابله با رندرهای تاخیری ری‌اکت
    const interval = setInterval(hideHeaderIcons, 300);

    return () => {
      clearInterval(interval);
      document.querySelectorAll('.dashboard-hidden-icon').forEach(el => {
        el.style.removeProperty('display');
        el.classList.remove('dashboard-hidden-icon');
      });
    };
  }, []);

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

  useEffect(() => {
    async function fetchNotifications() {
      setIsLoadingNotifications(true);
      const res = await getUserNotificationsAction(50);
      if (res.success) {
        setNotifications(res.data);
      }
      setIsLoadingNotifications(false);
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
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

    if (!formData.firstName?.trim()) {
      toast.error('لطفاً حداقل «نام» خود را برای ثبت در پروفایل وارد کنید.');
      return;
    }

    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('فرمت ایمیل وارد شده صحیح نیست (مثال: name@domain.com).');
      return;
    }

    const sanitizedPayload = {
      firstName: formData.firstName?.trim() || null,
      lastName: formData.lastName?.trim() || null,
      gender: formData.gender === 'MALE' || formData.gender === 'FEMALE' ? formData.gender : null,
      birthYear: formData.birthYear?.trim() || null,
      province: formData.province?.trim() || null,
      city: formData.city?.trim() || null,
      educationDegree: formData.educationDegree?.trim() || null,
      major: formData.major?.trim() || null,
      email: formData.email?.trim() || null,
      artResearchField: formData.artResearchField?.trim() || null,
      cooperationInterests: formData.cooperationInterests?.trim() || null,
    };

    setIsSaving(true);
    const res = await updateUserProfileAction(sanitizedPayload);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message || 'اطلاعات پروفایل با موفقیت ذخیره شد.');
      router.refresh();
    } else {
      toast.error(res.error || 'خطا در ثبت اطلاعات. لطفاً مقادیر وارد شده را بررسی کنید.');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('تکرار رمز عبور جدید با رمز وارد شده مطابقت ندارد.');
      return;
    }
    setIsSavingPassword(true);
    const res = await updatePasswordAction(passwordData.oldPassword, passwordData.newPassword);
    setIsSavingPassword(false);
    if (res.success) {
      toast.success(res.message);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(res.error);
    }
  };

  const requestRemoveFavorite = (favId, contentId) => {
    setConfirmDialog({ isOpen: true, favId, contentId });
  };

  const executeRemoveFavorite = async () => {
    const { favId, contentId } = confirmDialog;
    setConfirmDialog({ isOpen: false, favId: null, contentId: null });
    
    setFavorites(prev => prev.filter(f => f.id !== favId));
    const res = await toggleFavoriteAction(contentId);
    if (res.success) toast.success('محتوا از علاقه‌مندی‌های شما حذف شد.');
    else toast.error('خطا در حذف علاقه‌مندی.');
  };

  const handleOpenNotification = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      await markNotificationAsReadAction(notif.id);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabs = [
    { id: 'profile', label: 'مشخصات فردی', shortLabel: 'مشخصات', icon: 'idCard', accent: '#06b6d4', count: null },
    { id: 'downloads', label: 'دانلودهای من', shortLabel: 'دانلودها', icon: 'download', accent: '#38bdf8', count: uniqueDownloads.length > 0 ? toPersianDigits(uniqueDownloads.length) : null },
    { id: 'favorites', label: 'علاقه‌مندی‌ها', shortLabel: 'علاقه‌مندی‌ها', icon: 'heart', accent: '#f43f5e', count: favorites.length > 0 ? toPersianDigits(favorites.length) : null },
    { id: 'notifications', label: 'اعلان‌ها و پیام‌ها', shortLabel: 'اعلان‌ها', icon: 'bell', accent: '#f59e0b', badge: unreadCount > 0 ? toPersianDigits(unreadCount) : null },
    { id: 'security', label: 'تغییر رمز عبور', shortLabel: 'امنیت', icon: 'password', accent: '#10b981', count: null },
  ];

  const displayName = formData.firstName || formData.lastName
    ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
    : (initialUser?.firstName || initialUser?.lastName ? `${initialUser.firstName || ''} ${initialUser.lastName || ''}`.trim() : 'کاربر مدار');

  const renderEyeButton = (fieldKey) => {
    const isVisible = showPasswords[fieldKey];
    return (
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
        <Tooltip text={isVisible ? "مخفی کردن رمز" : "مشاهده رمز"}>
          <button
            type="button"
            onClick={() => setShowPasswords(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }))}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            {isVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] md:w-[45vw] md:h-[45vw] rounded-full blur-[90px] md:blur-[120px] opacity-10 bg-[radial-gradient(circle,rgba(6,182,212,0.22)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[90vw] h-[90vw] md:w-[55vw] md:h-[55vw] rounded-full blur-[90px] md:blur-[120px] opacity-10 bg-[radial-gradient(circle,rgba(217,70,239,0.18)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      {/* ========================================================= */}
      {/* استایل‌های جامع گلس‌مورفیسم تقویم و منوهای کشویی */}
      {/* ========================================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        /* یک اطمینان اضافه برای مخفی کردن آیکون‌های هدر با CSS */
        .z-50, .z-60 { display: none !important; }

        select option {
          background-color: #050810 !important;
          color: #e5e7eb !important;
          padding: 12px !important;
        }
        select option:hover, select option:focus, select option:checked {
          background-color: #06b6d4 !important;
          color: #000 !important;
        }

        /* تقویم باید از هدر چسبان (z-9999) بالاتر باشد تا روی آن نیفتد */
        .rmdp-portal, .rmdp-container {
          z-index: 99999 !important;
        }

        /* ظاهر گلس‌مورفیسم عالی برای تقویم مشابه CustomSelect */
        .rmdp-wrapper {
          background: rgba(8, 12, 22, 0.95) !important;
          backdrop-filter: blur(32px) !important;
          -webkit-backdrop-filter: blur(32px) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.03) !important;
          border-radius: 1.25rem !important;
          padding: 10px !important;
          font-family: inherit !important;
        }

        .rmdp-month-picker, 
        .rmdp-year-picker {
          background: rgba(11, 15, 25, 0.9) !important;
          backdrop-filter: blur(28px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
          border-radius: 1.25rem !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.03) !important;
          inset: 6px !important;
        }

        .rmdp-top-class { justify-content: space-between !important; margin-bottom: 6px !important; }
        .rmdp-header { margin-bottom: 4px !important; border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; padding-bottom: 8px !important; }
        .rmdp-header-values { color: #ffffff !important; font-weight: 900 !important; font-size: 0.9rem !important; }
        .rmdp-header-values span { padding: 4px 8px !important; border-radius: 8px !important; transition: all 0.2s ease !important; cursor: pointer; }
        .rmdp-header-values span:hover { background-color: rgba(6, 182, 212, 0.18) !important; color: #22d3ee !important; }

        .rmdp-arrow { border: solid #06b6d4 !important; border-width: 0 2px 2px 0 !important; width: 7px !important; height: 7px !important; margin: 0 !important; }
        .rmdp-arrow-container { background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 10px !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s ease !important; box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.02) !important; }
        .rmdp-arrow-container:hover { background-color: rgba(6, 182, 212, 0.2) !important; border-color: rgba(6, 182, 212, 0.4) !important; box-shadow: 0 0 12px rgba(6, 182, 212, 0.25) !important; }

        .rmdp-week-day { color: #22d3ee !important; font-weight: 800 !important; font-size: 0.75rem !important; }

        .rmdp-day span, .rmdp-month-picker .rmdp-day span, .rmdp-year-picker .rmdp-day span { color: #f1f5f9 !important; border-radius: 10px !important; font-size: 0.8rem !important; font-weight: 500 !important; transition: all 0.18s ease !important; background-color: transparent !important; }
        .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover, .rmdp-month-picker .rmdp-day:not(.rmdp-disabled) span:hover, .rmdp-year-picker .rmdp-day:not(.rmdp-disabled) span:hover { background-color: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; color: #ffffff !important; }

        .rmdp-day.rmdp-today span { background-color: rgba(255, 255, 255, 0.06) !important; color: #38bdf8 !important; border: 1px dashed rgba(56, 189, 248, 0.5) !important; font-weight: 800 !important; }
        .rmdp-day.rmdp-selected span:not(.highlight), .rmdp-month-picker .rmdp-day.rmdp-selected span, .rmdp-year-picker .rmdp-day.rmdp-selected span { background-color: rgba(6, 182, 212, 0.25) !important; color: #22d3ee !important; border: 1px solid rgba(6, 182, 212, 0.6) !important; box-shadow: 0 0 15px rgba(6, 182, 212, 0.3), inset 0 0 10px rgba(6, 182, 212, 0.2) !important; font-weight: 900 !important; }

        .ep-arrow { display: none !important; }

        /* جلوگیری از بیرون زدن تقویم در موبایل (به علت قرارگیری در ستون چپ) */
        @media (max-width: 640px) {
          .rmdp-wrapper {
             left: 6vw !important; /* فاصله‌گیری اجباری از لبه چپ موبایل */
             right: auto !important;
             transform-origin: top left !important;
          }
        }
      `}} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 relative z-10 pt-0 w-full">

        <div className="mb-6 md:mb-10">
          <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'حساب کاربری' }]} />
        </div>

        <div className="block lg:flex lg:flex-row gap-0 lg:gap-8 relative items-start">
          <div id="nav-anchor" className="lg:hidden w-full h-px -mt-px opacity-0 pointer-events-none" />

          {isNavSticky && (
            <div 
              className="lg:hidden w-full pointer-events-none" 
              style={{ height: `${asideHeight + 12}px` }}
            />
          )}

          <aside 
            ref={asideRef}
            className={cn(
              "w-full lg:w-[290px] xl:w-[310px] flex-shrink-0 self-start transition-all duration-300",
              "lg:sticky lg:top-28 lg:z-20 lg:mb-0 lg:px-0 lg:block",
              isNavSticky 
                ? "fixed top-0 left-0 right-0 z-[9999] w-full px-0" 
                : "relative z-[60] mb-3" 
            )}
          >
            <div className={cn(
              "relative overflow-hidden transition-all duration-300 border border-white/[0.05]",
              isNavSticky
                ? "px-4 py-2.5 rounded-b-[2rem] rounded-t-none bg-white/[0.03] backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.85),inset_0_0_15px_rgba(255,255,255,0.02)]" 
                : "p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.02)]"
            )}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-50 pointer-events-none z-20" />

              <div className={cn(
                "flex items-center justify-between border-b border-white/[0.07] relative z-10 transition-all duration-300",
                isNavSticky ? "pb-2 mb-2" : "pb-4 mb-4 md:pb-6 md:mb-5"
              )}>
                <div className="flex items-center gap-3 md:gap-3.5 min-w-0">
                  <div className={cn(
                    "relative shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#06b6d4]/20 via-[#06b6d4]/5 to-white/[0.02] backdrop-blur-md border border-[#06b6d4]/30 text-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.18),inset_0_0_12px_rgba(6,182,212,0.12)] transition-all duration-300",
                    isNavSticky ? "w-9 h-9 rounded-xl" : "w-12 h-12 md:w-14 md:h-14"
                  )}>
                    <Icon name="user" className={cn("transition-all drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]", isNavSticky ? "w-4 h-4" : "w-6 h-6 md:w-7 md:h-7")} />
                  </div>
                  
                  <div className="flex flex-col justify-center min-w-0">
                    <h2 className={cn(
                      "text-white font-black font-sans truncate transition-all",
                      isNavSticky ? "text-xs sm:text-sm" : "text-sm md:text-base"
                    )}>
                      {displayName}
                    </h2>
                    <p className="font-bold text-gray-400 font-sans tracking-wider dir-ltr text-right transition-all text-[10px] md:text-[11px] mt-0.5 flex items-center gap-2">
                       <span className="text-[#06b6d4]">{toPersianDigits(initialUser?.phone)}</span>
                       {!isNavSticky && (
                         <>
                           <span className="w-1 h-1 rounded-full bg-white/20"></span>
                           <span className="text-gray-400">{joinedDate}</span>
                         </>
                       )}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex lg:flex-col items-center lg:items-stretch justify-between gap-1 sm:gap-1.5 lg:gap-2.5 w-full relative z-10">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => handleTabClick(tab.id)} 
                      className={cn(
                        "group/nav relative flex flex-col lg:flex-row items-center justify-center lg:justify-between rounded-xl transition-all duration-300 font-sans cursor-pointer shrink-0 outline-none flex-1 lg:flex-none bg-transparent border-0",
                        isNavSticky ? "py-1 px-0.5 lg:px-2 lg:py-1.5" : "py-1.5 px-0.5 lg:px-2 lg:py-1.5",
                        isActive ? "text-white lg:w-full" : "text-gray-400 hover:text-gray-200 lg:w-full"
                      )}
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 min-w-0 w-full lg:w-auto">
                        <div 
                          style={isActive ? {
                            backgroundColor: `${tab.accent}20`,
                            borderColor: `${tab.accent}50`,
                            color: tab.accent,
                            boxShadow: `0 0 18px ${tab.accent}25, inset 0 0 10px ${tab.accent}15`
                          } : undefined}
                          className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-[1rem] flex items-center justify-center shrink-0 transition-all duration-300 mx-auto lg:mx-0 border relative",
                            !isActive && "bg-white/[0.04] border-white/[0.08] text-gray-400 group-hover/nav:bg-white/[0.08] group-hover/nav:border-white/[0.15] group-hover/nav:text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
                          )}
                        >
                          <Icon name={tab.icon} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                          {tab.badge && (
                            <div className="lg:hidden absolute -top-1 -right-1">
                              <span className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 min-w-[14px] px-1 bg-rose-600 border border-[#050810] text-[8px] font-bold text-white items-center justify-center shadow-md font-sans">
                                  {tab.badge}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                        <span 
                          style={isActive ? { color: tab.accent } : undefined}
                          className={cn(
                            "font-bold text-[9px] sm:text-[10px] lg:text-sm whitespace-nowrap transition-colors drop-shadow-md",
                            !isActive && "text-gray-400 group-hover/nav:text-white"
                          )}
                        >
                          <span className="lg:hidden block truncate">{tab.shortLabel}</span>
                          <span className="hidden lg:inline">{tab.label}</span>
                        </span>
                      </div>

                      <div className="hidden lg:flex items-center gap-2">
                        {tab.count && !tab.badge && (
                          <span 
                            style={isActive ? { backgroundColor: `${tab.accent}15`, color: tab.accent, borderColor: `${tab.accent}35` } : undefined}
                            className={cn(
                              "inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors border",
                              !isActive && "bg-white/[0.03] text-gray-400 border-white/[0.05]"
                            )}
                          >
                            {tab.count}
                          </span>
                        )}
                        {tab.badge && (
                          <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-[18px] min-w-[18px] px-1 bg-rose-600 border border-white/10 text-[10px] font-bold text-white items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.5)] font-sans">
                              {tab.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                <div className="hidden lg:block h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1.5 w-full" />

                <Tooltip text="خروج امن از سیستم">
                  <button 
                    onClick={() => setIsLogoutModalOpen(true)} 
                    className={cn(
                      "group/logout flex flex-col lg:flex-row items-center justify-center lg:justify-between rounded-xl transition-all font-sans cursor-pointer shrink-0 outline-none flex-1 lg:flex-none lg:w-full bg-transparent border-0",
                      isNavSticky ? "py-1 px-0.5 lg:px-2 lg:py-1.5" : "py-1.5 px-0.5 lg:px-2 lg:py-1.5"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3.5 min-w-0 w-full lg:w-auto">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[1rem] bg-rose-500/10 border border-rose-500/25 text-rose-400 group-hover/logout:bg-rose-500 group-hover/logout:text-white group-hover/logout:border-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)] flex items-center justify-center transition-all mx-auto lg:mx-0">
                        <Icon name="signOut" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      </div>
                      <span className="font-bold text-[9px] sm:text-[10px] lg:text-sm text-rose-400 group-hover/logout:text-rose-300 whitespace-nowrap transition-colors text-center lg:text-right drop-shadow-md">
                        <span className="lg:hidden block truncate">خروج</span>
                        <span className="hidden lg:inline">خروج از سیستم</span>
                      </span>
                    </div>
                  </button>
                </Tooltip>
              </nav>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* بخش اصلی محتوای داشبورد */}
          {/* ========================================================= */}
          <div id="dashboard-content" className="flex-1 w-full relative z-10 min-w-0">
            <div 
              ref={cardRef} 
              onMouseMove={handleMouseMove} 
              className="relative rounded-[2rem] md:rounded-[3rem] p-5 sm:p-7 md:p-10 min-h-[560px] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col group border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-50 pointer-events-none z-20" />
              
              <div className="relative z-10 animate-[fadeIn_0.35s_ease-out] flex-grow">
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="border-b border-white/5 pb-4 space-y-2"><BaseSkeleton className="w-40 md:w-48 h-6 md:h-8" rounded="rounded-lg" /><BaseSkeleton className="w-60 md:w-72 h-3 md:h-4" rounded="rounded" /></div>
                    <div className="space-y-4 pt-4"><BaseSkeleton className="w-full h-10 md:h-12" rounded="rounded-2xl" /><BaseSkeleton className="w-full h-10 md:h-12" rounded="rounded-2xl" /><BaseSkeleton className="w-full h-20 md:h-24" rounded="rounded-2xl" /></div>
                  </div>
                ) : (
                  <>
                    {/* ========================================================= */}
                    {/* ۱. تب مشخصات فردی */}
                    {/* ========================================================= */}
                    {activeTab === 'profile' && (
                      <div>
                        <div className="mb-6 md:mb-8 border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 drop-shadow-md">
                              <span className="w-10 h-10 rounded-[1rem] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#06b6d4] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                                <Icon name="idCard" className="w-5 h-5" />
                              </span>
                              مشخصات فردی
                            </h2>
                            <p className="text-xs md:text-sm text-gray-300 mt-2 font-light">
                              <strong className="text-white font-bold">تنها درج «نام» الزامی است</strong>؛ تکمیل سایر موارد کاملاً اختیاری بوده و به شخصی‌سازی تجربه شما کمک می‌کند.
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4 md:space-y-6">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            <div className="grid grid-cols-2 gap-3 w-full">
                              <div className="relative">
                                <label className="text-[11px] md:text-xs text-rose-500 font-bold mb-1.5 md:mb-2 pl-1 flex items-center gap-1">
                                  نام <span className="text-lg leading-none">*</span> <span className="text-[9px] font-normal hidden sm:inline">(الزامی)</span>
                                </label>
                                <input name="firstName" value={formData.firstName} onChange={handleFormChange} type="text" className="w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-rose-500/30 shadow-[inset_0_0_10px_rgba(244,63,94,0.05)] hover:bg-white/[0.06] focus:border-rose-500 focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm outline-none transition-all font-sans select-text text-white" placeholder="نام خود را وارد کنید..." style={getDynamicStyle(formData.firstName)} />
                              </div>
                              <div>
                                <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">نام خانوادگی</label>
                                <input name="lastName" value={formData.lastName} onChange={handleFormChange} type="text" className="w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm outline-none transition-all font-sans select-text text-white" placeholder="نام خانوادگی..." style={getDynamicStyle(formData.lastName)} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 w-full">
                              <div>
                                <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">جنسیت</label>
                                <CustomSelect
                                  value={formData.gender}
                                  onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                                  placeholder="انتخاب..."
                                  options={[
                                    { value: 'MALE', label: 'مرد' },
                                    { value: 'FEMALE', label: 'زن' }
                                  ]}
                                />
                              </div>
                              <div>
                                 <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">تاریخ تولد (شمسی)</label>
                                 <div className="h-[45px] md:h-[52px] w-full">
                                   <DatePicker
                                      portal
                                      zIndex={99999}
                                      value={formData.birthYear || ''}
                                      onChange={(date) => setFormData({...formData, birthYear: date?.format('YYYY/MM/DD') || ''})}
                                      calendar={persian}
                                      locale={persian_fa}
                                      calendarPosition="bottom-left"
                                      fixMainPosition={true}
                                      offsetY={6}
                                      editable={false}
                                      containerStyle={{ width: "100%", height: "100%" }}
                                      inputClass={`w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm font-sans outline-none transition-all cursor-pointer select-text ${formData.birthYear ? 'text-white' : 'text-white/40'}`}
                                      placeholder="انتخاب تقویم..."
                                   />
                                 </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            <div className="grid grid-cols-2 gap-3 w-full">
                              <div>
                                <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">استان</label>
                                <CustomSelect
                                  value={formData.province}
                                  onChange={(val) => setFormData(prev => ({ ...prev, province: val, city: '' }))}
                                  placeholder="انتخاب استان..."
                                  options={provinces}
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">شهر</label>
                                <CustomSelect
                                  value={formData.city}
                                  onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                                  disabled={!formData.province}
                                  placeholder={formData.province ? "انتخاب شهر..." : "ابتدا استان..."}
                                  options={availableCities}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                              <div>
                                 <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">مدرک تحصیلی</label>
                                 <CustomSelect
                                   value={formData.educationDegree}
                                   onChange={(val) => setFormData(prev => ({ ...prev, educationDegree: val }))}
                                   placeholder="انتخاب مدرک..."
                                   options={EDUCATION_DEGREES}
                                 />
                              </div>
                              <div>
                                <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">رشته تحصیلی</label>
                                <input name="major" value={formData.major} onChange={handleFormChange} type="text" className="w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm outline-none transition-all font-sans select-text text-white" placeholder="مثال: ارتباطات" style={getDynamicStyle(formData.major)} />
                              </div>
                            </div>
                          </div>
                            
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            <div>
                              <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">ایمیل</label>
                              <input name="email" value={formData.email} onChange={handleFormChange} type="email" dir="ltr" className="w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm outline-none transition-all text-left font-sans select-text text-white" placeholder="example@email.com" style={getDynamicStyle(formData.email)} />
                            </div>
                            <div>
                              <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">حوزه فعالیت هنری/پژوهشی</label>
                              <input name="artResearchField" value={formData.artResearchField} onChange={handleFormChange} type="text" className="w-full h-[45px] md:h-[52px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 text-xs md:text-sm outline-none transition-all font-sans select-text text-white" placeholder="تخصص اصلی..." style={getDynamicStyle(formData.artResearchField)} />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 pl-1">زمینه‌های تمایل به همکاری با مدار</label>
                            <textarea name="cooperationInterests" value={formData.cooperationInterests} onChange={handleFormChange} rows="3" className="w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-[#06b6d4] focus:bg-white/[0.08] rounded-2xl px-4 py-3.5 md:py-4 text-xs md:text-sm outline-none transition-all resize-none text-justify font-sans select-text text-white" placeholder="علاقه‌مندی‌های همکاری..." style={getDynamicStyle(formData.cooperationInterests)}></textarea>
                          </div>

                          <div className="flex justify-end pt-6 border-t border-white/5 mt-4">
                            <Tooltip text="ذخیره تغییرات در پایگاه داده">
                              <button disabled={isSaving} type="submit" className="w-full md:w-auto relative group bg-[#06b6d4] hover:bg-[#0891b2] text-gray-900 px-10 py-3.5 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 cursor-pointer disabled:opacity-50 border border-transparent text-sm">
                                {isSaving && <Icon name="loading" className="w-5 h-5 animate-spin" />}
                                <span className="font-sans">{isSaving ? 'در حال ذخیره...' : 'ذخیره مشخصات'}</span>
                              </button>
                            </Tooltip>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* ۲. تب امنیت و رمز عبور */}
                    {/* ========================================================= */}
                    {activeTab === 'security' && (
                      <div>
                        <div className="mb-6 md:mb-8 border-b border-white/10 pb-5">
                          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 drop-shadow-md">
                            <span className="w-10 h-10 rounded-[1rem] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-emerald-400 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                              <Icon name="password" className="w-5 h-5" />
                            </span>
                            تغییر رمز عبور
                          </h2>
                          <div className="text-xs md:text-sm text-gray-300 mt-2 text-justify font-light">
                            <p>رمز عبور خود را تنظیم کنید تا از این پس بتوانید بدون نیاز به پیامک یکبارمصرف و سریع‌تر وارد حساب کاربری خود شوید.</p>
                          </div>
                        </div>

                        <form onSubmit={handleSavePassword} className="space-y-4 md:space-y-6 max-w-xl mx-auto md:mx-0">
                          <div>
                            <label className="block text-[11px] md:text-xs text-emerald-400 font-bold mb-1.5 md:mb-2 pl-1">رمز عبور فعلی <span className="text-gray-500 font-normal">(اگر قبلاً رمزی نداشته‌اید خالی بگذارید)</span></label>
                            <div className="relative">
                              <input 
                                name="oldPassword" 
                                type={showPasswords.old ? "text" : "password"} 
                                dir="ltr"
                                value={passwordData.oldPassword} 
                                onChange={handlePasswordFormChange} 
                                className="w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] hover:bg-white/[0.06] focus:border-emerald-500 focus:bg-white/[0.08] rounded-2xl px-4 py-3.5 md:py-4 pl-12 text-sm tracking-widest outline-none transition-all font-sans select-text text-white" 
                                placeholder="***" 
                                style={getDynamicStyle(passwordData.oldPassword)}
                              />
                              {renderEyeButton('old')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-2">
                            <div>
                              <label className="block text-[11px] md:text-xs text-emerald-400 font-bold mb-1.5 md:mb-2 pl-1">رمز عبور جدید</label>
                              <div className="relative">
                                <input 
                                  name="newPassword" 
                                  type={showPasswords.new ? "text" : "password"} 
                                  dir="ltr"
                                  value={passwordData.newPassword} 
                                  onChange={handlePasswordFormChange} 
                                  className="w-full bg-emerald-500/[0.05] backdrop-blur-sm border border-emerald-500/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)] hover:bg-emerald-500/10 focus:border-emerald-500 focus:bg-emerald-500/15 rounded-2xl px-4 py-3.5 md:py-4 pl-12 text-sm tracking-widest outline-none transition-all font-sans select-text text-white" 
                                  placeholder="حداقل ۶ حرف" 
                                  style={getDynamicStyle(passwordData.newPassword)}
                                />
                                {renderEyeButton('new')}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-[11px] md:text-xs text-emerald-400 font-bold mb-1.5 md:mb-2 pl-1">تکرار رمز عبور جدید</label>
                              <div className="relative">
                                <input 
                                  name="confirmPassword" 
                                  type={showPasswords.confirm ? "text" : "password"} 
                                  dir="ltr"
                                  value={passwordData.confirmPassword} 
                                  onChange={handlePasswordFormChange} 
                                  className="w-full bg-emerald-500/[0.05] backdrop-blur-sm border border-emerald-500/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)] hover:bg-emerald-500/10 focus:border-emerald-500 focus:bg-emerald-500/15 rounded-2xl px-4 py-3.5 md:py-4 pl-12 text-sm tracking-widest outline-none transition-all font-sans select-text text-white" 
                                  placeholder="تکرار همان رمز" 
                                  style={getDynamicStyle(passwordData.confirmPassword)}
                                />
                                {renderEyeButton('confirm')}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-6 border-t border-white/5 mt-4">
                            <Tooltip text="ذخیره رمز عبور در پایگاه داده">
                              <button disabled={isSavingPassword || !passwordData.newPassword} type="submit" className="w-full md:w-auto relative group bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-3.5 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-50 border border-transparent text-sm">
                                {isSavingPassword && <Icon name="loading" className="w-5 h-5 animate-spin" />}
                                <span className="font-sans">{isSavingPassword ? 'در حال ثبت...' : 'تنظیم رمز عبور'}</span>
                              </button>
                            </Tooltip>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* ۳. تب دانلودها */}
                    {/* ========================================================= */}
                    {activeTab === 'downloads' && (
                      <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                        <div className="mb-6 border-b border-white/10 pb-5 flex items-center justify-between">
                          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 font-sans drop-shadow-md">
                            <span className="w-10 h-10 rounded-[1rem] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#06b6d4] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                              <Icon name="download" className="w-5 h-5" />
                            </span>
                            محتواهای دانلود شده
                          </h2>
                          <span className="text-xs font-bold text-[#06b6d4] bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 rounded-full shadow-inner">
                            {toPersianDigits(uniqueDownloads.length)} اثر
                          </span>
                        </div>

                        {uniqueDownloads.length === 0 ? (
                          <EmptyState icon="download" title="هنوز فایلی دانلود نشده" description="مستندات و فایل‌هایی که دانلود می‌کنید در اینجا نمایش داده خواهند شد." color="text-[#06b6d4]" />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:max-h-[65vh] lg:overflow-y-auto custom-scrollbar pr-1 pb-4">
                            {uniqueDownloads.map((content) => {
                              const typeLabel = getContentTypeLabel(content.type);
                              return (
                                <Link 
                                  key={content.id} 
                                  href={getContentLink(content.type, content.slug)} 
                                  className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#06b6d4]/40 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] hover:bg-white/[0.06] rounded-3xl p-4 flex gap-4 items-center transition-all duration-300 group cursor-pointer h-max"
                                >
                                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden bg-black/50 border border-white/5 relative flex items-center justify-center">
                                    <BlurImage src={content.coverMobile || content.coverDesktop || '/placeholder.jpg'} alt={content.titleBase} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85 group-hover:opacity-100" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-[#06b6d4] transition-colors font-sans select-text">
                                      {content.titleBase} {content.titleHighlight}
                                    </h3>
                                    <div className="mt-2.5 flex items-center gap-2">
                                      <span className={`text-[9px] md:text-[10px] font-bold px-2.5 py-0.5 rounded-md border shadow-inner font-sans ${typeLabel.color}`}>
                                        {typeLabel.label}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white/[0.05] text-[#06b6d4] group-hover:bg-[#06b6d4] group-hover:text-gray-900 flex items-center justify-center transition-all border border-white/[0.1] shadow-inner">
                                    <Icon name="arrowLeft" className="w-5 h-5" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* ۴. تب علاقه‌مندی‌ها */}
                    {/* ========================================================= */}
                    {activeTab === 'favorites' && (
                      <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                        <div className="mb-6 border-b border-white/10 pb-5 flex items-center justify-between">
                          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 font-sans drop-shadow-md">
                            <span className="w-10 h-10 rounded-[1rem] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-rose-400 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                              <Icon name="heart" className="w-5 h-5" />
                            </span>
                            محتواهای نشان‌شده
                          </h2>
                          <span className="text-xs font-bold text-rose-400 bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 rounded-full shadow-inner">
                            {toPersianDigits(favorites.length)} مورد
                          </span>
                        </div>

                        {favorites.length === 0 ? (
                          <EmptyState icon="heart" title="لیست علاقه‌مندی‌ها خالی است" description="محتواهایی که نشان می‌کنید برای دسترسی سریع‌تر اینجا قرار می‌گیرند." color="text-rose-500" />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:max-h-[65vh] lg:overflow-y-auto custom-scrollbar pr-1 pb-4">
                            {favorites.map((fav) => {
                              const content = fav.content;
                              if (!content) return null;
                              const typeLabel = getContentTypeLabel(content.type);
                              return (
                                <div 
                                  key={fav.id} 
                                  className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-rose-500/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] hover:bg-white/[0.06] rounded-3xl p-4 flex gap-4 items-center transition-all duration-300 group h-max"
                                >
                                  <Link href={getContentLink(content.type, content.slug)} className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden bg-black/50 border border-white/5 relative cursor-pointer flex items-center justify-center">
                                    <BlurImage src={content.coverMobile || content.coverDesktop || '/placeholder.jpg'} alt={content.titleBase} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85 group-hover:opacity-100" />
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <Link href={getContentLink(content.type, content.slug)} className="block cursor-pointer">
                                      <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors font-sans select-text">
                                        {content.titleBase} {content.titleHighlight}
                                      </h3>
                                    </Link>
                                    <div className="mt-2.5 flex items-center gap-2">
                                      <span className={`text-[9px] md:text-[10px] font-bold px-2.5 py-0.5 rounded-md border shadow-inner font-sans ${typeLabel.color}`}>
                                        {typeLabel.label}
                                      </span>
                                    </div>
                                  </div>
                                  <Tooltip text="حذف از علاقه‌مندی‌ها">
                                    <button 
                                      onClick={() => requestRemoveFavorite(fav.id, content.id)} 
                                      className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white/[0.05] hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/[0.1] hover:border-rose-500 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
                                    >
                                      <Icon name="heart" className="w-5 h-5 fill-current" />
                                    </button>
                                  </Tooltip>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* ۵. تب اعلان‌ها و پیام‌ها */}
                    {/* ========================================================= */}
                    {activeTab === 'notifications' && (
                      <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                        
                        <div className="mb-6 md:mb-8 border-b border-white/10 pb-5">
                          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5 drop-shadow-md">
                            <span className="w-10 h-10 rounded-[1rem] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-amber-500 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                              <Icon name="bell" className="w-5 h-5" />
                            </span>
                            اعلان‌ها و پیام‌ها
                          </h2>
                          <div className="text-xs md:text-sm text-gray-300 mt-2 text-justify font-light">
                            <p>اطلاعیه‌های سیستمی، اخبار و پیام‌های اختصاصی خود را در این بخش مدیریت کنید.</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] p-3.5 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] text-[10px] md:text-xs font-sans w-full md:w-auto self-start">
                          <span className="text-gray-400">صندوق پیام: <strong className="text-white ml-0.5">{toPersianDigits(notifications.length)}</strong></span>
                          <div className="w-1 h-1 rounded-full bg-white/20"></div>
                          <span className="text-gray-400">جدید: <strong className="text-rose-400 ml-0.5">{toPersianDigits(unreadCount)}</strong></span>
                          <div className="w-1 h-1 rounded-full bg-white/20"></div>
                          <span className="text-gray-400">خوانده شده: <strong className="text-emerald-400 ml-0.5">{toPersianDigits(notifications.length - unreadCount)}</strong></span>
                        </div>

                        {isLoadingNotifications ? (
                          <div className="flex justify-center items-center py-20">
                            <Icon name="loading" className="w-8 h-8 text-amber-500 animate-spin" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <EmptyState icon="bell" title="صندوق پیام خالی است" description="اطلاعیه‌های سیستم و پیام‌های دریافتی از مدیریت در این بخش قابل مشاهده است." color="text-amber-500" />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-h-[65vh] overflow-y-auto overflow-x-hidden custom-scrollbar px-2 pb-6 pt-2 -mx-2">
                            {notifications.map(notif => {
                              const notifData = notif.notification;
                              const themeColor = notifData.themeColor || '#10b981';
                              const isUnread = !notif.isRead;

                              return (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={notif.id}
                                  onClick={() => handleOpenNotification(notif)}
                                  className={cn(
                                    "relative group cursor-pointer overflow-hidden rounded-[1.5rem] md:rounded-3xl border transition-all duration-500 min-h-[120px] md:min-h-[140px] flex flex-col justify-between p-4 md:p-5 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] backdrop-blur-md",
                                    isUnread 
                                      ? "border-white/[0.1] bg-white/[0.05]" 
                                      : "border-transparent bg-white/[0.02] opacity-75 hover:opacity-100 hover:bg-white/[0.04] hover:border-white/[0.05]"
                                  )}
                                >
                                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.5rem] md:rounded-3xl z-0">
                                    <motion.div 
                                      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
                                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[45px]"
                                      style={{ backgroundColor: themeColor }}
                                    />
                                    <motion.div 
                                      animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.05, 0.15, 0.05] }}
                                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                      className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-[35px]"
                                      style={{ backgroundColor: themeColor }}
                                    />
                                  </div>

                                  <div className="relative z-10 flex gap-3 md:gap-4 items-start">
                                    <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.1] shadow-inner flex items-center justify-center relative">
                                      {notifData.coverUrl || notifData.iconUrl ? (
                                        <BlurImage src={notifData.coverUrl || notifData.iconUrl} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90" />
                                      ) : (
                                        <Icon name="bell" className="w-5 h-5 text-gray-300" />
                                      )}
                                      
                                      {isUnread && (
                                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: themeColor }}></span>
                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: themeColor }}></span>
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-1">
                                      <h3 className={cn(
                                        "text-sm md:text-base font-bold truncate transition-colors font-sans drop-shadow-md select-text",
                                        isUnread ? "text-white" : "text-gray-300 group-hover:text-white"
                                      )}>
                                        {notifData.title}
                                      </h3>
                                      <div className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-gray-400 font-light line-clamp-2 leading-relaxed font-sans select-text" dangerouslySetInnerHTML={{ __html: notifData.bodyHtml?.replace(/<[^>]+>/g, '') || '' }} />
                                    </div>
                                  </div>

                                  <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-[9px] md:text-[10px] text-gray-500 font-sans select-text">
                                      {toPersianDigits(new Date(notifData.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }))}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity font-sans flex items-center gap-1 select-none" style={{ color: themeColor }}>
                                      مشاهده پیام <Icon name="arrowLeft" className="w-3 h-3" />
                                    </span>
                                  </div>
                                </motion.div>
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
      </main>

      {/* ================================================================= */}
      {/* پاپ‌آپ مشاهده جزئیات اعلان (Modal) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {selectedNotification && (
          <ModalPortal>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 font-sans select-none">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedNotification(null)}></div>
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 15 }} 
                className="relative z-10 w-full max-w-lg flex flex-col max-h-[85vh] rounded-[2rem]" 
                onClick={(e) => e.stopPropagation()}
              >
                {/* لایه پس‌زمینه و گلس‌مورفیسم کاملاً جدا از محتوا (حل قطعی باگ محو شدن دکمه در کروم/سافاری) */}
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] overflow-hidden pointer-events-none -z-10">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.3, 0.15] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} 
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[60px]" 
                    style={{ backgroundColor: selectedNotification.notification.themeColor || '#10b981' }} 
                  />
                </div>

                {/* دکمه بستن آزاد روی همه چیز قرار می‌گیرد و تابع translateZ برای رندر تضمینی لایه اضافه شده است */}
                <button 
                  onClick={() => setSelectedNotification(null)} 
                  className="absolute top-3 left-3 md:top-4 md:left-4 w-10 h-10 rounded-xl bg-[#080c16]/95 hover:bg-rose-500 flex items-center justify-center text-gray-200 hover:text-white transition-all cursor-pointer z-[99999] shadow-[0_4px_15px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/10"
                  style={{ transform: 'translateZ(100px)' }}
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>

                {/* بخش محتوای اسکرول‌دار */}
                <div className="overflow-y-auto custom-scrollbar relative z-10 rounded-[2rem]">
                  {selectedNotification.notification.coverUrl && (
                    <div className="w-full aspect-video sm:aspect-[21/9] bg-black/40 relative shrink-0 border-b border-white/[0.05] shadow-inner">
                      <img src={selectedNotification.notification.coverUrl} alt="cover" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 sm:p-8">
                    <div className="flex gap-3 md:gap-4 items-start mb-5 md:mb-6">
                      {selectedNotification.notification.iconUrl ? (
                        <div className="w-14 h-14 rounded-[1.2rem] bg-white/[0.05] backdrop-blur-md border border-white/[0.1] shadow-inner flex items-center justify-center shrink-0">
                          <img src={selectedNotification.notification.iconUrl} className="w-8 h-8 object-contain" alt="icon" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-[1.2rem] bg-white/[0.05] backdrop-blur-md border border-white/[0.1] shadow-inner flex items-center justify-center shrink-0">
                          <Icon name="bell" className="w-7 h-7 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-base md:text-xl text-white mb-2 font-sans leading-snug pr-2 drop-shadow-md select-text">{selectedNotification.notification.title}</h3>
                        <span className="text-[9px] md:text-[11px] text-gray-300 font-sans block pr-2 bg-white/[0.05] backdrop-blur-md w-max px-3 py-1.5 rounded-xl border border-white/[0.1] shadow-inner select-text">
                          {toPersianDigits(new Date(selectedNotification.notification.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
                        </span>
                      </div>
                    </div>

                    <div className="rich-text text-xs md:text-sm text-gray-200 leading-loose font-light font-sans text-justify mb-6 bg-white/[0.03] backdrop-blur-md p-6 rounded-2xl border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.01)] select-text">
                      <div dangerouslySetInnerHTML={{ __html: selectedNotification.notification.bodyHtml }} />
                    </div>

                    {safeParse(selectedNotification.notification.ctaButtons).length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {safeParse(selectedNotification.notification.ctaButtons).map(btn => (
                          <a 
                            key={btn.id} 
                            href={btn.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-xs px-6 py-4 rounded-xl text-white hover:brightness-110 transition-all font-bold font-sans shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] select-text"
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
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* پاپ‌آپ تایید خروج از حساب */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 select-none">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsLogoutModalOpen(false)}></div>
              
              <div className="relative z-10 bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] md:rounded-3xl w-full max-w-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
                <div className="flex flex-col items-center text-center mb-6 pt-2">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-rose-500/10 border border-rose-500/20 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)] flex items-center justify-center text-rose-400 mb-4"><Icon name="signOut" className="w-8 h-8" /></div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 font-sans">خروج از حساب کاربری</h3>
                  <div className="rich-text text-[11px] md:text-xs text-gray-300 leading-relaxed text-center font-light font-sans"><p>آیا مطمئن هستید که می‌خواهید از حساب کاربری خود در مدار خارج شوید؟</p></div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer font-sans border border-white/[0.05] shadow-inner">انصراف</button>
                  <button onClick={confirmLogout} disabled={isLoading} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 font-sans border border-transparent">{isLoading ? 'در حال خروج...' : 'بله، خارج می‌شوم'}</button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* پاپ‌آپ تایید حذف علاقه‌مندی */}
      {/* ================================================================= */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 select-none">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setConfirmDialog({ isOpen: false, favId: null, contentId: null })}></div>
              
              <div className="relative z-10 bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] md:rounded-3xl w-full max-w-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
                <div className="flex flex-col items-center text-center mb-6 pt-2">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-rose-500/10 border border-rose-500/20 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)] flex items-center justify-center text-rose-400 mb-4"><Icon name="trash" className="w-8 h-8" /></div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 font-sans">حذف از نشان‌شده‌ها</h3>
                  <div className="rich-text text-[11px] md:text-xs text-gray-300 leading-relaxed text-center font-light font-sans"><p>آیا مطمئن هستید می‌خواهید این محتوا را از لیست علاقه‌مندی‌های خود حذف کنید؟</p></div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button onClick={() => setConfirmDialog({ isOpen: false, favId: null, contentId: null })} className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer font-sans border border-white/[0.05] shadow-inner">انصراف</button>
                  <button onClick={executeRemoveFavorite} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer font-sans border border-transparent">بله، حذف کن</button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}