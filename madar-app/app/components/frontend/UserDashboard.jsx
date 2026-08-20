'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"; // ایمپورت تم تاریک تقویم

import { logoutAction } from '@/app/actions/auth';
import { updateUserProfileAction } from '@/app/actions/user';

// ==========================================
// توابع کمکی و دیتای ثابت
// ==========================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
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

// استایل ضد Autofill کروم (جلوگیری از سفید شدن پس‌زمینه فرم‌ها)
const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px #080c16 inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

// کامپوننت تول‌تیپ اختصاصی GKS1
const Tooltip = ({ children, text }) => (
  <div className="relative group/tooltip flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
      <div className="bg-[#0b0f19] text-white text-[10px] py-1.5 px-3 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap font-bold font-sans">
        {text}
      </div>
      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[5px] border-t-[#0b0f19] -mt-[1px]"></div>
    </div>
  </div>
);

const mockDownloads = []; 
const mockFavorites = []; 
const initialNotifications = []; 

const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
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

  const [notifications, setNotifications] = useState(initialNotifications);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const cardRef = useRef(null);

  const joinedDate = initialUser?.createdAt 
    ? toPersianDigits(new Date(initialUser.createdAt).toLocaleDateString('fa-IR')) 
    : 'نامشخص';

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

  const tabs = [
    { id: 'profile', label: 'مشخصات', icon: 'idCard' },
    { id: 'downloads', label: 'دانلودها', icon: 'download' },
    { id: 'favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
    { id: 'notifications', label: 'اعلان‌ها', icon: 'bell', badge: unreadCount > 0 ? toPersianDigits(unreadCount) : null },
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none text-right">
      <div className="fixed inset-0 z-[-10] bg-[#050810] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-20 bg-[radial-gradient(circle,rgba(217,70,239,0.2)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-[float_20s_infinite_ease-in-out_alternate-reverse]" />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 pt-0">
        <div className="flex flex-col gap-8">
          <div><Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'حساب کاربری' }]} /></div>

          <div className="flex flex-col lg:flex-row gap-8">
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
                    <h2 className="text-white font-bold text-lg font-sans">
                      {initialUser?.firstName || initialUser?.lastName ? `${initialUser.firstName || ''} ${initialUser.lastName || ''}` : 'کاربر مدار'}
                    </h2>
                    {/* نمایش شماره موبایل با فونت سایت و اعداد فارسی */}
                    <p className="text-sm font-bold text-[#06b6d4] font-sans mt-1" dir="ltr">{toPersianDigits(initialUser?.phone)}</p>
                  </div>
                </div>

                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible hide-scroll pb-2 lg:pb-0 relative z-10">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const baseStyle = "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold w-full text-right transition-all group cursor-pointer border";
                    const activeStyle = isActive 
                      ? "bg-white/10 text-white border-white/15 shadow-[inset_3px_0_0_#06b6d4]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent";

                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${baseStyle} ${activeStyle}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Icon name={tab.icon} className={`w-5 h-5 ${isActive ? 'text-[#06b6d4]' : 'text-gray-400 group-hover:text-white'}`} />
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
              <div ref={cardRef} onMouseMove={handleMouseMove} className="relative rounded-3xl border border-white/10 p-6 md:p-10 min-h-[600px] shadow-2xl overflow-hidden flex flex-col group">
                <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
                <div className="absolute inset-0 pointer-events-none rounded-inherit bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.04),transparent_40%)] -z-10" />

                <div className="relative z-10 animate-[fadeIn_0.4s_ease-out] flex-grow">
                  {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="border-b border-white/10 pb-4 space-y-2"><BaseSkeleton className="w-48 h-8" rounded="rounded-lg" /><BaseSkeleton className="w-72 h-4" rounded="rounded" /></div>
                      <div className="space-y-4 pt-4"><BaseSkeleton className="w-full h-12" rounded="rounded-xl" /><BaseSkeleton className="w-full h-12" rounded="rounded-xl" /><BaseSkeleton className="w-full h-24" rounded="rounded-xl" /></div>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'profile' && (
                        <div>
                          <div className="mb-8 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Icon name="idCard" className="text-[#06b6d4] w-6 h-6" /> مشخصات فردی</h2>
                            <div className="rich-text text-sm text-gray-400 mt-2 text-justify font-light"><p>اطلاعات حساب کاربری خود را تکمیل کنید تا دسترسی‌های متناسب با تخصص شما در پلتفرم تنظیم شود.</p></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl bg-[#080c16] border border-white/10 shadow-inner">
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">شناسه سیستمی (ID)</label><div className="flex items-center gap-2 text-gray-300 font-sans text-xs bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl cursor-not-allowed"><Icon name="lock" className="w-4 h-4 text-gray-500 shrink-0" /> <span className="truncate">#{initialUser?.id?.slice(-8).toUpperCase()}</span></div></div>
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">تاریخ عضویت</label><div className="flex items-center gap-2 text-gray-300 font-sans text-sm bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl cursor-not-allowed"><Icon name="calendarBlank" className="w-4 h-4 text-gray-500" /> {joinedDate}</div></div>
                            <div><label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">شماره موبایل</label><div className="flex items-center justify-end gap-2 text-gray-300 font-sans text-sm bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl cursor-not-allowed" dir="ltr"><Icon name="lock" className="w-4 h-4 text-gray-500" /> {toPersianDigits(initialUser?.phone)}</div></div>
                          </div>

                          <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">نام</label><input name="firstName" value={formData.firstName} onChange={handleFormChange} type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans" placeholder="مثال: علی" style={autofillFixStyle} /></div>
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">نام خانوادگی</label><input name="lastName" value={formData.lastName} onChange={handleFormChange} type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans" placeholder="مثال: علوی" style={autofillFixStyle} /></div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">جنسیت</label>
                                <div className="relative">
                                  <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none transition-all cursor-pointer shadow-inner font-sans" style={autofillFixStyle}>
                                    <option value="" disabled className="bg-[#0b0f19]">انتخاب کنید...</option><option value="MALE" className="bg-[#0b0f19]">مرد</option><option value="FEMALE" className="bg-[#0b0f19]">زن</option>
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div>
                                 <label className="block text-xs text-gray-400 font-bold mb-2">تاریخ تولد (تقویم شمسی)</label>
                                 <DatePicker
                                    value={formData.birthYear || ''}
                                    onChange={(date) => setFormData({...formData, birthYear: date?.format('YYYY/MM/DD') || ''})}
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    className="bg-dark"
                                    inputClass="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#06b6d4] font-sans outline-none transition-all shadow-inner"
                                    placeholder="انتخاب از تقویم..."
                                 />
                              </div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">استان</label>
                                <div className="relative">
                                  <select name="province" value={formData.province} onChange={handleFormChange} className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none transition-all cursor-pointer shadow-inner font-sans" style={autofillFixStyle}>
                                    <option value="" className="bg-[#0b0f19]">انتخاب استان...</option>
                                    {IRAN_PROVINCES.map(prov => <option key={prov} value={prov} className="bg-[#0b0f19]">{prov}</option>)}
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">شهر</label><input name="city" value={formData.city} onChange={handleFormChange} type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans" placeholder="مثال: کاشان" style={autofillFixStyle} /></div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">مدرک تحصیلی</label>
                                <div className="relative">
                                  <select name="educationDegree" value={formData.educationDegree} onChange={handleFormChange} className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none transition-all cursor-pointer shadow-inner font-sans" style={autofillFixStyle}>
                                    <option value="" className="bg-[#0b0f19]">انتخاب مدرک...</option>
                                    {EDUCATION_DEGREES.map(deg => <option key={deg} value={deg} className="bg-[#0b0f19]">{deg}</option>)}
                                  </select>
                                  <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                              </div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">رشته تحصیلی</label><input name="major" value={formData.major} onChange={handleFormChange} type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans" placeholder="مثال: مهندسی کامپیوتر" style={autofillFixStyle} /></div>
                              
                              <div><label className="block text-xs text-gray-400 font-bold mb-2">ایمیل</label><input name="email" value={formData.email} onChange={handleFormChange} type="email" dir="ltr" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans text-left" placeholder="user@example.com" style={autofillFixStyle} /></div>
                              
                              <div className="col-span-1 md:col-span-2 lg:col-span-3"><label className="block text-xs text-gray-400 font-bold mb-2">حوزه فعالیت هنری/پژوهشی</label><input name="artResearchField" value={formData.artResearchField} onChange={handleFormChange} type="text" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all shadow-inner font-sans" placeholder="مثال: پژوهشگر تاریخ معاصر" style={autofillFixStyle} /></div>

                              <div className="col-span-1 md:col-span-2 lg:col-span-3"><label className="block text-xs text-gray-400 font-bold mb-2">زمینه‌های تمایل به همکاری با مدار</label><textarea name="cooperationInterests" value={formData.cooperationInterests} onChange={handleFormChange} rows="3" className="w-full bg-[#080c16] border border-white/10 focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all resize-none text-justify shadow-inner font-light font-sans" placeholder="تخصص‌ها و حوزه‌هایی که تمایل به همکاری دارید را بنویسید..." style={autofillFixStyle}></textarea></div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/10">
                              <Tooltip text="ذخیره تغییرات در پایگاه داده">
                                <button disabled={isSaving} type="submit" className="relative group bg-[#06b6d4] hover:bg-[#0891b2] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-50">
                                  {isSaving ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : <Icon name="save" className="w-5 h-5" />}
                                  <span className="font-sans">{isSaving ? 'در حال ذخیره...' : 'ذخیره مشخصات'}</span>
                                </button>
                              </Tooltip>
                            </div>
                          </form>
                        </div>
                      )}
                      {activeTab === 'downloads' && <div className="flex flex-col h-full"><EmptyState icon="download" title="هنوز فایلی دانلود نشده" description="مستندات و فایل‌هایی که دانلود می‌کنید در اینجا نمایش داده خواهند شد." color="text-[#06b6d4]" /></div>}
                      {activeTab === 'favorites' && <div className="flex flex-col h-full"><EmptyState icon="heart" title="لیست علاقه‌مندی‌ها خالی است" description="محتواهایی که نشان می‌کنید برای دسترسی سریع‌تر اینجا قرار می‌گیرند." color="text-rose-500" /></div>}
                      {activeTab === 'notifications' && <div className="flex flex-col h-full"><EmptyState icon="bell" title="صندوق پیام خالی است" description="اطلاعیه‌های سیستم و پیام‌های دریافتی از مدیریت در این بخش قابل مشاهده است." color="text-amber-500" /></div>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsLogoutModalOpen(false)}></div>
            <div className="relative z-10 bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
              <button onClick={() => setIsLogoutModalOpen(false)} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
              <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]"><Icon name="signOut" className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans">خروج از حساب کاربری</h3>
                <div className="rich-text text-xs text-gray-300 leading-relaxed text-center font-light font-sans"><p>آیا مطمئن هستید که می‌خواهید از حساب کاربری خود در مدار خارج شوید؟</p></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer font-sans">خیر</button>
                <button onClick={confirmLogout} disabled={isLoading} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 font-sans">{isLoading ? 'در حال خروج...' : 'بله، خارج می‌شوم'}</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}