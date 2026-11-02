'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

const cn = (...inputs) => twMerge(clsx(inputs));

// ================= پیکربندی سربرگ‌ها و کلیدهای دیتابیس =================
const TABS = [
  { id: 'RAW', label: 'محتوای خام', color: '#fbbf24', bg: 'bg-[#fbbf24]', hover: 'hover:bg-[#fbbf24]', text: 'text-[#fbbf24]', border: 'border-[#fbbf24]', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]', key: 'raw_page_settings' },
  { id: 'PRODUCED', label: 'محتوای تولیدی', color: '#f43f5e', bg: 'bg-[#f43f5e]', hover: 'hover:bg-[#f43f5e]', text: 'text-[#f43f5e]', border: 'border-[#f43f5e]', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]', key: 'produced_page_settings' },
  { id: 'TOOL', label: 'ابزارهای کاربردی', color: '#10b981', bg: 'bg-[#10b981]', hover: 'hover:bg-[#10b981]', text: 'text-[#10b981]', border: 'border-[#10b981]', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', key: 'tool_page_settings' },
  { id: 'BLOG', label: 'اخبار و مقالات', color: '#b45309', bg: 'bg-[#b45309]', hover: 'hover:bg-[#b45309]', text: 'text-[#b45309]', border: 'border-[#b45309]', glow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]', key: 'blog_page_settings' }
];

const DEFAULT_STATE = { hero: { badge: '', titlePart1: '', titlePart2: '', description: '' }, featuredList: [], seo: { title: '', description: '' } };

export default function MainPagesManager() {
  
  // ==========================================
  // ۱. منطق احراز هویت بدون پرش (Wait & Verify)
  // ==========================================
  const { user, isLoading: authIsLoading, loading: authLoading, isFetching, can } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const isWorking = authIsLoading || authLoading || isFetching;
    if (isWorking) return;

    if (user) {
      // فقط مدیرانی که تیک ویرایش صفحات فرعی را دارند مجاز به ورود هستند
      setHasAccess(user.isSuperAdmin || (can && can('PAGES_EDIT')));
    } else if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setHasAccess(false);
      } else {
        const timer = setTimeout(() => setHasAccess(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authIsLoading, authLoading, isFetching, can]);

  // ==========================================
  // ۲. استیت‌های محتوا و دریافت داده
  // ==========================================
  const [activeTab, setActiveTab] = useState('RAW');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // { index: number }

  const [pagesData, setPagesData] = useState({
    RAW: JSON.parse(JSON.stringify(DEFAULT_STATE)),
    PRODUCED: JSON.parse(JSON.stringify(DEFAULT_STATE)),
    TOOL: JSON.parse(JSON.stringify(DEFAULT_STATE)),
    BLOG: JSON.parse(JSON.stringify(DEFAULT_STATE))
  });

  useEffect(() => {
    async function loadData() {
      if (!hasAccess) return;
      try {
        const promises = TABS.map(tab => getSetting(tab.key));
        const results = await Promise.all(promises);
        
        const newData = { ...pagesData };
        results.forEach((res, index) => {
          if (res) {
            const parsed = JSON.parse(res);
            if (!parsed.seo) parsed.seo = { title: '', description: '' };
            if (!parsed.hero) parsed.hero = { badge: '', titlePart1: '', titlePart2: '', description: '' };
            if (!parsed.featuredList) parsed.featuredList = [];
            newData[TABS[index].id] = parsed;
          }
        });
        setPagesData(newData);
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات صفحات');
      } finally {
        setIsLoading(false);
      }
    }
    if (hasAccess) loadData();
  }, [hasAccess]);

  const activeTheme = TABS.find(t => t.id === activeTab);
  const currentData = pagesData[activeTab];

  // ================= توابع آپدیت استیت =================
  const updateHero = (field, value) => {
    setPagesData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], hero: { ...prev[activeTab].hero, [field]: value } } }));
  };

  const updateSEO = (field, value) => {
    setPagesData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], seo: { ...prev[activeTab].seo, [field]: value } } }));
  };

  const addFeatured = () => {
    const newItem = { id: Date.now(), badge: '', title: '', description: '', btnText: '', btnUrl: '', image: '' };
    setPagesData(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], featuredList: [...prev[activeTab].featuredList, newItem] } }));
  };

  const updateFeatured = (id, field, value) => {
    setPagesData(prev => ({
      ...prev, [activeTab]: {
        ...prev[activeTab],
        featuredList: prev[activeTab].featuredList.map(item => item.id === id ? { ...item, [field]: value } : item)
      }
    }));
  };

  const removeFeatured = (id) => {
    setPagesData(prev => ({
      ...prev, [activeTab]: {
        ...prev[activeTab],
        featuredList: prev[activeTab].featuredList.filter(item => item.id !== id)
      }
    }));
  };

  const handleSave = async () => {
    if (!can('PAGES_EDIT')) return toast.error('شما مجوز ذخیره و ویرایش این صفحات را ندارید.');
    
    setIsSaving(true);
    try {
      await saveSetting(activeTheme.key, JSON.stringify(currentData), 'PAGES_CONFIG');
      toast.success(`تنظیمات صفحه «${activeTheme.label}» با موفقیت ذخیره شد!`);
    } catch (error) {
      toast.error('خطا در ذخیره‌سازی اطلاعات');
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // ۳. کنترل رندر لودینگ و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null || (hasAccess && isLoading)) return <AdminLoading />;

  if (hasAccess === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <Icon name="lock" className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
        <p className="text-gray-400">شما مجوز ورود به این بخش از پنل را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20 font-sans text-right select-none">
      
      {/* هدر صفحه و انتخابگر سربرگ‌ها */}
      <div className="space-y-6 relative z-10 bg-[#0f172a]/40 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 inset-x-0 h-[2px] opacity-90 transition-all duration-500" style={{ backgroundImage: `linear-gradient(to right, transparent, ${activeTheme.color}, transparent)` }} />
        <div>
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.bg} transition-colors duration-500 shadow-[0_0_10px_currentColor]`} style={{ color: activeTheme.color }}></span>
            مدیریت صفحات فرعی
          </h1>
          <p className="text-sm text-gray-400 font-light">باکس معرفی، اسلایدر محتوای منتخب و سئوی هر ۴ صفحه اصلی را از اینجا مدیریت کنید.</p>
        </div>

        {/* سربرگ‌ها (Tabs) */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 bg-[#050810]/50 border border-white/5 shadow-inner p-2 rounded-2xl">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-transparent ${
                  isActive 
                    ? `${tab.bg} text-gray-950 shadow-[inset_0_0_15px_rgba(255,255,255,0.4)] scale-[1.02]` 
                    : `text-gray-400 hover:bg-white/10 hover:text-white shadow-inner`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ناحیه محتوای فرم با انیمیشن تغییر تب */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* ================= ۱. باکس معرفی (Hero) ================= */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent bg-[#0f172a]/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            
            <div className="p-6 md:p-8 space-y-6 relative z-10">
              <h2 className={`text-lg font-bold ${activeTheme.text} flex items-center gap-2 border-b border-white/10 pb-3`}>
                <Icon name="star" className="w-5 h-5" /> باکس معرفی
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050810]/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">رو تیتر</label>
                  <input 
                    type="text" 
                    value={currentData.hero.badge} 
                    onChange={e => updateHero('badge', e.target.value)} 
                    placeholder="مثال: بانک داده مدار" 
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 focus:border outline-none transition-all select-text" 
                    style={{ '--tw-ring-color': activeTheme.color, borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">توضیحات زیر عنوان</label>
                  <textarea 
                    rows="2" 
                    value={currentData.hero.description} 
                    onChange={e => updateHero('description', e.target.value)} 
                    placeholder="توضیحات کوتاه برای معرفی این بخش..." 
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all resize-none select-text"
                    style={{ '--tw-ring-color': activeTheme.color, borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">بخش اول عنوان (رنگ سفید)</label>
                  <input 
                    type="text" 
                    value={currentData.hero.titlePart1} 
                    onChange={e => updateHero('titlePart1', e.target.value)} 
                    placeholder="مثال: محتوای" 
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all select-text" 
                    style={{ '--tw-ring-color': activeTheme.color, borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">بخش دوم عنوان (رنگ <span className={activeTheme.text}>اصلی</span>)</label>
                  <input 
                    type="text" 
                    value={currentData.hero.titlePart2} 
                    onChange={e => updateHero('titlePart2', e.target.value)} 
                    placeholder="مثال: خام و فوتیج" 
                    className={`w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm ${activeTheme.text} font-bold placeholder:text-gray-600 outline-none transition-all select-text`}
                    style={{ '--tw-ring-color': activeTheme.color, borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>
              </div>
            </div>
          </div>

{/* ================= ۲. محتوای منتخب (Featured Slider) ================= */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent bg-[#0f172a]/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            
            <div className="p-6 md:p-8 space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-3">
                <h2 className={`text-lg font-bold ${activeTheme.text} flex items-center gap-2`}>
                  <Icon name="playCircle" className="w-5 h-5" /> اسلایدر محتوای منتخب
                </h2>
                <button type="button" onClick={addFeatured} className={`text-xs bg-white/5 hover:bg-white/10 shadow-inner border border-transparent ${activeTheme.text} px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer`}><Icon name="plus" className="w-3.5 h-3.5" /></button>
              </div>

              {currentData.featuredList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">هیچ اسلایدی برای این صفحه تنظیم نشده است.</p>
              ) : (
                <div className="space-y-6">
                  {currentData.featuredList.map((slide, index) => (
                    <div key={slide.id} className="p-5 bg-[#050810]/50 border border-white/5 shadow-inner rounded-xl relative space-y-5">
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/10 text-white px-2 py-1 rounded text-[10px] font-bold shadow-inner">اسلاید {index + 1}</span>
                        <button type="button" onClick={() => removeFeatured(slide.id)} className="p-1.5 text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                        {/* انتخاب عکس */}
                        <div className="lg:col-span-3 space-y-2">
                          <label className="text-xs text-gray-300 font-bold block mb-1 pl-1">تصویر اسلاید (بدون پس‌زمینه)</label>
                          {slide.image ? (
                            <div className="relative w-full aspect-square bg-black/40 shadow-inner border border-white/5 rounded-xl flex items-center justify-center p-2 group/img">
                              <img src={slide.image} alt="preview" className="w-full h-full object-contain" />
                              <div className="absolute inset-0 bg-[#050810]/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-xl backdrop-blur-sm">
                                <button onClick={() => setMediaPickerTarget(slide.id)} className={`p-2 bg-white/10 hover:${activeTheme.bg} hover:text-gray-900 rounded-full text-white cursor-pointer transition-colors`}><Icon name="image" className="w-4 h-4" /></button>
                                <button onClick={() => updateFeatured(slide.id, 'image', '')} className="p-2 bg-white/10 hover:bg-rose-500 rounded-full text-white cursor-pointer transition-colors"><Icon name="close" className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setMediaPickerTarget(slide.id)} className="w-full aspect-square bg-black/40 hover:bg-white/10 border border-white/5 shadow-inner rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white transition-all cursor-pointer font-sans"
                            style={{ '--tw-ring-color': activeTheme.color }}
                            onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            onMouseEnter={(e) => e.target.style.borderColor = activeTheme.color}
                            >
                              <Icon name="image" className="w-6 h-6" /> <span className="text-[10px] font-bold">انتخاب عکس</span>
                            </button>
                          )}
                        </div>

                        {/* فیلدهای متنی */}
                        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] text-gray-300 font-bold pl-1">بج (بالای تیتر)</label>
                            <input 
                              type="text" 
                              value={slide.badge} 
                              onChange={e => updateFeatured(slide.id, 'badge', e.target.value)} 
                              placeholder="مثال: سند ویژه افشا شده" 
                              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-3 text-xs text-white placeholder:text-gray-600 outline-none transition-all select-text" 
                              style={{ borderColor: 'transparent' }}
                              onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                              onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[11px] text-gray-300 font-bold pl-1">عنوان اصلی اسلاید</label>
                            <input 
                              type="text" 
                              value={slide.title} 
                              onChange={e => updateFeatured(slide.id, 'title', e.target.value)} 
                              placeholder="عنوان محتوا..." 
                              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-3 text-xs text-white placeholder:text-gray-600 outline-none transition-all font-bold select-text" 
                              style={{ borderColor: 'transparent' }}
                              onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                              onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] text-gray-300 font-bold pl-1">توضیحات (زیر تیتر)</label>
                            <textarea 
                              rows="2" 
                              value={slide.description} 
                              onChange={e => updateFeatured(slide.id, 'description', e.target.value)} 
                              placeholder="توضیحات تکمیلی..." 
                              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-3 text-xs text-white placeholder:text-gray-600 outline-none transition-all resize-none leading-relaxed select-text"
                              style={{ borderColor: 'transparent' }}
                              onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                              onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            ></textarea>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] text-gray-300 font-bold pl-1">متن دکمه لینک‌دار</label>
                            <input 
                              type="text" 
                              value={slide.btnText} 
                              onChange={e => updateFeatured(slide.id, 'btnText', e.target.value)} 
                              placeholder="مثال: مشاهده کامل" 
                              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-3 text-xs text-white placeholder:text-gray-600 outline-none transition-all select-text" 
                              style={{ borderColor: 'transparent' }}
                              onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                              onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] text-gray-300 font-bold pl-1">آدرس لینک (URL)</label>
                            <input 
                              type="text" 
                              value={slide.btnUrl} 
                              onChange={e => updateFeatured(slide.id, 'btnUrl', e.target.value)} 
                              placeholder="/raw-materials/123" 
                              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-3 text-xs text-blue-300 placeholder:text-gray-600 outline-none dir-ltr text-left font-sans transition-all select-text" 
                              style={{ borderColor: 'transparent' }}
                              onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                              onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= ۳. تنظیمات سئو ================= */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent bg-[#0f172a]/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            
            <div className="p-6 md:p-8 space-y-6 relative z-10">
              <h2 className={`text-lg font-bold ${activeTheme.text} flex items-center gap-2 border-b border-white/10 pb-3`}>
                <Icon name="search" className="w-5 h-5" /> تنظیمات سئو
              </h2>

              <div className="bg-[#050810]/50 p-6 rounded-2xl border border-white/5 shadow-inner space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold flex justify-between pl-1">عنوان سئو (برای تب مرورگر و گوگل)</label>
                  <input 
                    type="text" 
                    value={currentData.seo.title} 
                    onChange={e => updateSEO('title', e.target.value)} 
                    placeholder={`مثال: پایگاه جامع ${activeTheme.label}`} 
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all select-text" 
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                  <p className="text-[10px] text-gray-500 pl-1">اگر این فیلد خالی باشد، سیستم به طور خودکار از عنوان سایت در تب مرورگر استفاده می‌کند.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">توضیحات سئو (Meta Description)</label>
                  <textarea 
                    rows="3" 
                    value={currentData.seo.description} 
                    onChange={e => updateSEO('description', e.target.value)} 
                    placeholder="چکیده‌ای جذاب که در نتایج گوگل نمایش داده می‌شود..." 
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all resize-none leading-relaxed select-text"
                    style={{ borderColor: 'transparent' }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme.color}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* دکمه ذخیره */}
          <div className="flex justify-end pt-4 pb-10">
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className={`px-8 py-4 rounded-xl ${activeTheme.bg} text-gray-950 font-black text-sm ${activeTheme.glow} transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 border border-transparent`}
            > 
              {isSaving ? 'در حال ذخیره‌سازی...' : `ذخیره تنظیمات صفحه ${activeTheme.label}`}
            </button>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* پاپ آپ مودال کتابخانه رسانه برای اسلایدر */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setMediaPickerTarget(null)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col border border-white/10"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] opacity-90" style={{ backgroundImage: `linear-gradient(to right, transparent, ${activeTheme.color}, transparent)` }} />
                
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent relative z-20">
                  <h3 className={`font-bold flex items-center gap-2 ${activeTheme.text}`}><Icon name="image" className="w-5 h-5" /> انتخاب تصویر اسلاید</h3>
                  <button onClick={() => setMediaPickerTarget(null)} className="p-1.5 text-gray-400 bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner">
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar relative z-10">
                  <MediaLibraryPage
                    isPickerMode={true}
                    onSelectMedia={(media) => {
                      updateFeatured(mediaPickerTarget, 'image', media.url);
                      setMediaPickerTarget(null);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}          