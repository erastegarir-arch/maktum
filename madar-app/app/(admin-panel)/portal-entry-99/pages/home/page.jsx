'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { getSetting, saveSetting } from '@/app/actions/settings';
import { getCreatorsList } from '@/app/actions/homepage';
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import toast from 'react-hot-toast';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

// پالت ۲۰ رنگ اختصاصی مدار
const PALETTE = [
  '#f43f5e', '#e11d48', '#f97316', '#ea580c', '#f59e0b', 
  '#eab308', '#84cc16', '#10b981', '#059669', '#14b8a6', 
  '#06b6d4', '#0891b2', '#0ea5e9', '#3b82f6', '#2563eb', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#db2777'  
];

// ماموریت و هیرو از اینجا حذف شده‌اند (هیرو فقط ثابت نمایش داده می‌شود)
const DEFAULT_LAYOUT = [
  { id: 'news', label: 'نوار تازه‌ها', isActive: true },
  { id: 'stats', label: 'آمار هولوگرافیک', isActive: true },
  { id: 'countdown', label: 'شمارشگر معکوس', isActive: true },
  { id: 'dossiers', label: 'پرونده‌های باز', isActive: true },
  { id: 'radar', label: 'رادار موضوعی', isActive: true },
  { id: 'blog', label: 'آخرین مطالب بلاگ', isActive: true },
  { id: 'raw', label: 'محتوای راش', isActive: true },
  { id: 'produced', label: 'محتوای تولیدی', isActive: true },
  { id: 'tools', label: 'ابزارهای کاربردی', isActive: true },
  { id: 'timeline', label: 'تایم‌لاین افشاگری‌ها', isActive: true },
  { id: 'investigators', label: 'پدیدآورندگان شاخص', isActive: true },
  { id: 'cta', label: 'باکس ارسال سند (پورتال امن)', isActive: true },
];

export default function HomePageSettings() {
  const router = useRouter();
  
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
      // فقط مدیرانی که تیک ویرایش صفحه اصلی را دارند مجاز به ورود هستند
      setHasAccess(user.isSuperAdmin || (can && can('HOMEPAGE_EDIT')));
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
  // ۲. استیت‌های محتوا
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('LAYOUT');
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const [dbCreators, setDbCreators] = useState([]);
  const [searchCreator, setSearchCreator] = useState('');

  const [layoutOrder, setLayoutOrder] = useState(DEFAULT_LAYOUT);
  const [heroSlides, setHeroSlides] = useState([]);
  const [newsTicker, setNewsTicker] = useState([]);
  const [stats, setStats] = useState([]);
  
  const [dossiersConfig, setDossiersConfig] = useState({ title: 'پرونده‌های باز', subtitle: 'مجموعه اسناد، مقالات و ویدیوهای مرتبط با یک کلان‌موضوع' });
  const [dossiers, setDossiers] = useState([]);

  const [radarConfig, setRadarConfig] = useState({ title: 'رادار موضوعی', subtitle: 'داغ‌ترین موضوعات در حال پیگیری' });
  const [radarTopics, setRadarTopics] = useState([]);
  
  const [selectedInvestigators, setSelectedInvestigators] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  
  const [countdown, setCountdown] = useState({ targetDate: '', title: 'بازگشایی پرونده فوق‌سری', desc: '', lockedText: 'مسدود است', unlockedText: 'دریافت اسناد', tooltip: 'پس از پایان زمان باز می‌شود', link: '#' });
  const [ctaBox, setCtaBox] = useState({ preTitle: 'پورتال ارتباط امن', title: 'سندی در دست دارید؟', desc: '', btnText: 'ارسال امن سند', btnLink: '/submit' });

  const [contentConfig, setContentConfig] = useState({
    blog: { title: 'آخرین مطالب بلاگ', subtitle: 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی' },
    raw: { title: 'محتوای راش و خام', subtitle: 'اسناد مکتوب، تصاویر و ویدیوها' },
    produced: { title: 'محتوای تولیدی', subtitle: 'مستندهای اختصاصی و پادکست‌ها' },
    tools: { title: 'ابزارهای کاربردی', subtitle: 'تسهیل در پژوهش با ابزارهای هوشمند' }
  });

  const [seoConfig, setSeoConfig] = useState({
    metaTitle: 'شبکه مدار - صفحه اصلی'
  });

  useEffect(() => {
    async function loadData() {
      if (!hasAccess) return;
      try {
        const creatorsRes = await getCreatorsList();
        if (creatorsRes.success) setDbCreators(creatorsRes.data);

        const parseJSON = (str, fallback) => { try { return str ? JSON.parse(str) : fallback; } catch { return fallback; } };

        const savedLayout = parseJSON(await getSetting('home_layout'), DEFAULT_LAYOUT);
        setLayoutOrder(savedLayout.filter(item => item.id !== 'mission' && item.id !== 'hero')); 

        setHeroSlides(parseJSON(await getSetting('home_hero'), []));
        setNewsTicker(parseJSON(await getSetting('home_news'), []));
        setStats(parseJSON(await getSetting('home_stats'), []));
        setDossiersConfig(parseJSON(await getSetting('home_dossiers_config'), { title: 'پرونده‌های باز', subtitle: '' }));
        setDossiers(parseJSON(await getSetting('home_dossiers'), []));
        setRadarConfig(parseJSON(await getSetting('home_radar_config'), { title: 'رادار موضوعی', subtitle: '' }));
        setRadarTopics(parseJSON(await getSetting('home_radar'), []));
        setSelectedInvestigators(parseJSON(await getSetting('home_investigators'), []));
        setTimelineEvents(parseJSON(await getSetting('home_timeline'), []));
        setCountdown(parseJSON(await getSetting('home_countdown'), { targetDate: '', title: '', desc: '', lockedText: 'مسدود است', unlockedText: 'دریافت اسناد', tooltip: '', link: '#' }));
        setCtaBox(parseJSON(await getSetting('home_cta'), { preTitle: 'پورتال ارتباط امن', title: 'سندی در دست دارید؟', desc: '', btnText: 'ارسال امن سند', btnLink: '/submit' }));
        
        setContentConfig(parseJSON(await getSetting('home_content_config'), {
          blog: { title: 'آخرین مطالب بلاگ', subtitle: 'مقالات، گزارش‌ها و یادداشت‌های تحلیلی' },
          raw: { title: 'محتوای راش و خام', subtitle: 'اسناد مکتوب، تصاویر و ویدیوها' },
          produced: { title: 'محتوای تولیدی', subtitle: 'مستندهای اختصاصی و پادکست‌ها' },
          tools: { title: 'ابزارهای کاربردی', subtitle: 'تسهیل در پژوهش با ابزارهای هوشمند' }
        }));
        
        setSeoConfig(parseJSON(await getSetting('home_seo_config'), { metaTitle: 'شبکه مدار - صفحه اصلی' }));

      } catch (err) {
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    }
    if (hasAccess) loadData();
  }, [hasAccess]);

  const handleSave = async () => {
    if (!can('HOMEPAGE_EDIT')) return toast.error('شما مجوز ذخیره و تغییر چیدمان صفحه اصلی را ندارید.');
    
    setSaving(true);
    try {
      await saveSetting('home_layout', JSON.stringify(layoutOrder), 'HOME');
      await saveSetting('home_hero', JSON.stringify(heroSlides), 'HOME');
      await saveSetting('home_news', JSON.stringify(newsTicker), 'HOME');
      await saveSetting('home_stats', JSON.stringify(stats), 'HOME');
      await saveSetting('home_dossiers_config', JSON.stringify(dossiersConfig), 'HOME');
      await saveSetting('home_dossiers', JSON.stringify(dossiers), 'HOME');
      await saveSetting('home_radar_config', JSON.stringify(radarConfig), 'HOME');
      await saveSetting('home_radar', JSON.stringify(radarTopics), 'HOME');
      await saveSetting('home_investigators', JSON.stringify(selectedInvestigators), 'HOME');
      await saveSetting('home_timeline', JSON.stringify(timelineEvents), 'HOME');
      await saveSetting('home_countdown', JSON.stringify(countdown), 'HOME');
      await saveSetting('home_cta', JSON.stringify(ctaBox), 'HOME');
      await saveSetting('home_content_config', JSON.stringify(contentConfig), 'HOME');
      await saveSetting('home_seo_config', JSON.stringify(seoConfig), 'HOME');
      
      toast.success('تنظیمات صفحه اصلی با موفقیت ذخیره شد.');
      router.refresh();
    } catch (err) {
      toast.error('خطا در ذخیره‌سازی!');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const { type, id } = deletingItem;
    if (type === 'hero') setHeroSlides(heroSlides.filter(i => i.id !== id));
    if (type === 'news') setNewsTicker(newsTicker.filter(i => i.id !== id));
    if (type === 'stats') setStats(stats.filter(i => i.id !== id));
    if (type === 'dossier') setDossiers(dossiers.filter(i => i.id !== id));
    if (type === 'radar') setRadarTopics(radarTopics.filter(i => i.id !== id));
    if (type === 'timeline') setTimelineEvents(timelineEvents.filter(i => i.id !== id));
    
    setDeletingItem(null);
    toast.success('آیتم با موفقیت حذف شد.');
  };

  const ColorPicker = ({ selected, onChange }) => (
    <div className="flex flex-wrap gap-2 mt-2 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner max-w-[400px]">
      {PALETTE.map(c => (
        <div 
          key={c} onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full cursor-pointer transition-all ${selected === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0f19] scale-110' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
          style={{ backgroundColor: c, boxShadow: selected === c ? `0 0 15px ${c}` : 'none' }}
        />
      ))}
    </div>
  );

  const updateItem = (setter, id, field, value) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // ==========================================
  // ۳. کنترل رندر لودینگ و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null || (hasAccess && loading)) return <AdminLoading />;

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
    <div className="max-w-6xl mx-auto space-y-8 pb-32 font-sans text-right select-none">
      
      <div className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0f172a]/40 backdrop-blur-2xl border border-transparent">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-90 pointer-events-none z-20" />

        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3 relative z-10">
          <Icon name="layout" className="w-6 h-6 text-cyan-400" /> مدیریت صفحه اصلی سایت
        </h1>
        <p className="text-sm text-gray-400 font-light mb-6 relative z-10">کنترل کامل چیدمان، فعال/غیرفعال‌سازی بخش‌ها و تنظیم محتوای داینامیک صفحه اصلی.</p>
        
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 relative z-10">
          {[
            { key: 'LAYOUT', label: 'چیدمان' },
            { key: 'HERO', label: 'هیرو اسلایدر' },
            { key: 'NEWS', label: 'تازه‌ها' },
            { key: 'STATS', label: 'آمار (۴ باکس)' },
            { key: 'DOSSIERS', label: 'پرونده‌ها' },
            { key: 'RADAR', label: 'رادار موضوعی' },
            { key: 'CONTENT_TITLES', label: 'عناوین محتوا' },
            { key: 'TIMELINE', label: 'تایم‌لاین' },
            { key: 'COUNTDOWN', label: 'شمارشگر معکوس' },
            { key: 'INVESTIGATORS', label: 'پدیدآورندگان' },
            { key: 'CTA', label: 'باکس انتهای صفحه' },
            { key: 'SEO', label: 'تب مرورگر (سئو)' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border border-transparent ${activeTab === tab.key ? 'bg-cyan-500/20 text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 shadow-inner'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. تب چیدمان داینامیک (Drag & Drop) */}
      {activeTab === 'LAYOUT' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <p className="text-sm text-gray-300 leading-loose bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
            ترتیب بخش‌ها را در صفحه اصلی با کشیدن و رها کردن تغییر دهید. با دکمه سوییچ می‌توانید یک بخش را کاملاً مخفی کنید. محتوای ردیف‌ها اتوماتیک جدیدترین مطالب را نشان می‌دهند.
          </p>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 shadow-inner">
              <div className="flex items-center gap-3">
                <Icon name="lockKey" className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-bold text-cyan-400">هیرو اسلایدر (همیشه در بالا)</span>
              </div>
              <span className="text-xs text-cyan-500 font-bold px-3 py-1 bg-cyan-500/10 rounded-full shadow-inner border border-cyan-500/20">نمایش ثابت</span>
            </div>

            <Reorder.Group axis="y" values={layoutOrder} onReorder={setLayoutOrder} className="flex flex-col space-y-4">
              {layoutOrder.map((section) => (
                <Reorder.Item key={section.id} value={section} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors shadow-lg">
                  <div className="flex items-center gap-4">
                    <Icon name="grid" className="w-5 h-5 text-gray-500 cursor-grab" />
                    <span className={`text-sm md:text-base font-bold transition-colors ${section.isActive ? 'text-white' : 'text-gray-500 line-through'}`}>{section.label}</span>
                  </div>
                  <button onClick={() => setLayoutOrder(prev => prev.map(s => s.id === section.id ? { ...s, isActive: !s.isActive } : s))} className={`w-14 h-7 rounded-full relative transition-colors border border-transparent shadow-inner ${section.isActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-md ${section.isActive ? 'left-1' : 'right-1'}`} />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. تب هیرو اسلایدر */}
      {activeTab === 'HERO' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#050810]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            <h2 className="text-lg font-bold text-cyan-400 pl-2">تنظیمات اسلایدر اصلی (هیرو)</h2>
            <button onClick={() => setHeroSlides([{ id: Date.now(), preTitle: '', title: '', desc: '', btnText: '', btnLink: '', colorStart: '#ffffff', colorEnd: '#06b6d4', preTitleColor: PALETTE[10], btnColor: PALETTE[10], imgDesktop: '', imgMobile: '' }, ...heroSlides])} className="text-xs bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 hover:text-gray-900 transition-colors border border-transparent shadow-inner"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>

          <Reorder.Group axis="y" values={heroSlides} onReorder={setHeroSlides} className="flex flex-col space-y-6">
            {heroSlides.map((slide) => (
              <Reorder.Item key={slide.id} value={slide} className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-xl cursor-grab active:cursor-grabbing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <input type="text" placeholder="روتیتر (مثال: پژوهش برگزیده)" value={slide.preTitle || ''} onChange={e => updateItem(setHeroSlides, slide.id, 'preTitle', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
                    <input type="text" placeholder="عنوان اصلی (بزرگ)" value={slide.title || ''} onChange={e => updateItem(setHeroSlides, slide.id, 'title', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 font-black transition-all select-text shadow-inner" />
                    <textarea rows="3" placeholder="توضیحات زیر عنوان..." value={slide.desc || ''} onChange={e => updateItem(setHeroSlides, slide.id, 'desc', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 resize-none transition-all select-text shadow-inner" />
                    <div className="flex gap-3">
                      <input type="text" placeholder="متن دکمه" value={slide.btnText || ''} onChange={e => updateItem(setHeroSlides, slide.id, 'btnText', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
                      <input type="text" placeholder="لینک دکمه" value={slide.btnLink || ''} onChange={e => updateItem(setHeroSlides, slide.id, 'btnLink', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 dir-ltr text-right transition-all select-text shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="space-y-3 border-b border-white/5 pb-4">
                      <span className="text-xs text-gray-300 font-bold block">رنگ گرادیانت عنوان</span>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input type="color" value={slide.colorStart || '#ffffff'} onChange={(e) => updateItem(setHeroSlides, slide.id, 'colorStart', e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                          <span className="text-xs text-gray-500">رنگ شروع</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="color" value={slide.colorEnd || '#06b6d4'} onChange={(e) => updateItem(setHeroSlides, slide.id, 'colorEnd', e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                          <span className="text-xs text-gray-500">رنگ پایان</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-400 font-bold">رنگ روتیتر (از پالت ۲۰ رنگ):</span>
                        <ColorPicker selected={slide.preTitleColor || PALETTE[10]} onChange={(c) => updateItem(setHeroSlides, slide.id, 'preTitleColor', c)} />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-400 font-bold">رنگ دکمه و هاله نور:</span>
                        <ColorPicker selected={slide.btnColor || PALETTE[10]} onChange={(c) => updateItem(setHeroSlides, slide.id, 'btnColor', c)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <label className="text-[10px] text-cyan-400 font-bold">تصویر دسکتاپ (16:9 افقی)</label>
                        {slide.imgDesktop ? (
                           <div className="relative group p-1 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                             <img src={slide.imgDesktop} className="w-full h-24 object-cover rounded-md" alt="" />
                             <button onClick={() => updateItem(setHeroSlides, slide.id, 'imgDesktop', '')} className="absolute inset-1 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-sm font-bold shadow-lg"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                           </div>
                        ) : (
                          <button onClick={() => setMediaPickerTarget(`heroDesk_${slide.id}`)} className="w-full h-24 bg-black/40 hover:bg-black/60 rounded-lg text-xs text-gray-400 border border-dashed border-white/20 transition-colors flex items-center justify-center gap-2 shadow-inner"><Icon name="image" className="w-4 h-4"/> انتخاب تصویر</button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-cyan-400 font-bold">تصویر موبایل (16:9 عمودی)</label>
                        {slide.imgMobile ? (
                           <div className="relative group p-1 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                             <img src={slide.imgMobile} className="w-full h-24 object-cover rounded-md" alt="" />
                             <button onClick={() => updateItem(setHeroSlides, slide.id, 'imgMobile', '')} className="absolute inset-1 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-sm font-bold shadow-lg"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                           </div>
                        ) : (
                          <button onClick={() => setMediaPickerTarget(`heroMob_${slide.id}`)} className="w-full h-24 bg-black/40 hover:bg-black/60 rounded-lg text-xs text-gray-400 border border-dashed border-white/20 transition-colors flex items-center justify-center gap-2 shadow-inner"><Icon name="image" className="w-4 h-4"/> انتخاب تصویر</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button onClick={() => setDeletingItem({ type: 'hero', id: slide.id, title: slide.title || 'اسلاید بی‌نام' })} className="text-xs text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-inner"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. تب تازه‌ها */}
      {activeTab === 'NEWS' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-cyan-400">نوار اخبار متحرک (تازه‌ها)</h2>
            <button onClick={() => setNewsTicker([{ id: Date.now(), tag: '', text: '', color: PALETTE[10], link: '#' }, ...newsTicker])} className="text-xs bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 hover:text-black border border-transparent shadow-inner"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>
          
          <Reorder.Group axis="y" values={newsTicker} onReorder={setNewsTicker} className="flex flex-col space-y-4">
            {newsTicker.map((news) => (
              <Reorder.Item key={news.id} value={news} className="flex flex-col gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner cursor-grab active:cursor-grabbing">
                <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
                  <input type="text" placeholder="بخش رنگی (مثال: انتشار مستند)" value={news.tag || ''} onChange={e => updateItem(setNewsTicker, news.id, 'tag', e.target.value)} className="w-full md:w-1/4 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
                  <input type="text" placeholder="بخش سفید (متن خبر)" value={news.text || ''} onChange={e => updateItem(setNewsTicker, news.id, 'text', e.target.value)} className="w-full md:flex-1 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
                  <input type="text" placeholder="لینک مقصد" value={news.link || ''} onChange={e => updateItem(setNewsTicker, news.id, 'link', e.target.value)} className="w-full md:w-1/4 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none dir-ltr text-right focus:border-cyan-500 transition-all select-text shadow-inner" />
                  <button onClick={() => setDeletingItem({ type: 'news', id: news.id, title: news.text || 'خبر بی‌نام' })} className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors shrink-0 text-sm font-bold shadow-inner border border-transparent"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 font-bold">رنگ تگ خبر:</span>
                  <ColorPicker selected={news.color || PALETTE[10]} onChange={c => updateItem(setNewsTicker, news.id, 'color', c)} />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* ======================================================= */}
      {/* 4. تب آمار (Stats) */}
      {activeTab === 'STATS' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-amber-400">باکس‌های آمار هولوگرافیک (حداکثر ۴ عدد)</h2>
            <button onClick={() => setStats([...stats, { id: Date.now(), iconUrl: '', title: '', desc: '', color: PALETTE[4] }])} disabled={stats.length >= 4} className="text-xs bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg font-bold hover:bg-amber-500 hover:text-black disabled:opacity-50 shadow-inner border border-transparent"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>
          
          <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                <div className="flex gap-4">
                  <div className="w-16 h-16 shrink-0 bg-black/60 border border-white/5 rounded-xl flex items-center justify-center relative group overflow-hidden shadow-inner">
                    {stat.iconUrl ? (
                      <>
                        <img src={stat.iconUrl} className="w-8 h-8 object-contain" alt="" />
                        <button onClick={() => updateItem(setStats, stat.id, 'iconUrl', '')} className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer shadow-lg"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                      </>
                    ) : (
                      <button onClick={() => setMediaPickerTarget(`statIcon_${stat.id}`)} className="text-[10px] text-gray-400 hover:text-white cursor-pointer w-full h-full font-bold">انتخاب آیکون</button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="عنوان باکس (مثال: بزرگترین آرشیو)" value={stat.title || ''} onChange={e => updateItem(setStats, stat.id, 'title', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none font-bold transition-all select-text shadow-inner focus:border-amber-500" />
                    <input type="text" placeholder="زیر عنوان (مثال: ۴ ترابایت سند)" value={stat.desc || ''} onChange={e => updateItem(setStats, stat.id, 'desc', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none transition-all select-text shadow-inner focus:border-amber-500" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <span className="text-[11px] text-gray-500 font-bold">رنگ باکس:</span>
                  <ColorPicker selected={stat.color || PALETTE[4]} onChange={c => updateItem(setStats, stat.id, 'color', c)} />
                </div>
                
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button onClick={() => setDeletingItem({ type: 'stats', id: stat.id, title: stat.title || 'باکس بی‌نام' })} className="text-xs text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-inner border border-transparent"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

{/* ======================================================= */}
      {/* 5. تب پرونده‌ها */}
      {activeTab === 'DOSSIERS' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5 mb-8 shadow-inner">
            <h3 className="text-sm font-bold text-indigo-400 border-b border-white/5 pb-2">تنظیمات کلی بخش پرونده‌ها</h3>
            <input type="text" placeholder="عنوان سکشن" value={dossiersConfig.title || ''} onChange={e => setDossiersConfig({...dossiersConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 transition-all select-text shadow-inner" />
            <input type="text" placeholder="زیرعنوان سکشن" value={dossiersConfig.subtitle || ''} onChange={e => setDossiersConfig({...dossiersConfig, subtitle: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 transition-all select-text shadow-inner" />
          </div>

          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-indigo-400">باکس‌های پرونده‌های باز</h2>
            <button onClick={() => setDossiers([{ id: Date.now(), title: '', subtitle: '', color: PALETTE[15], link: '#' }, ...dossiers])} className="text-xs bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg font-bold hover:bg-indigo-500 hover:text-black border border-transparent shadow-inner"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>
          
          <p className="text-xs text-gray-400">با کشیدن و رها کردن پرونده‌ها را جابجا کنید.</p>
          
          <Reorder.Group axis="y" values={dossiers} onReorder={setDossiers} className="flex flex-col space-y-4 max-w-4xl mx-auto">
            {dossiers.map((dos) => (
              <Reorder.Item key={dos.id} value={dos} className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-4 cursor-grab active:cursor-grabbing shadow-lg">
                <div className="space-y-3">
                   <input type="text" placeholder="عنوان پرونده" value={dos.title || ''} onChange={e => updateItem(setDossiers, dos.id, 'title', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none font-bold focus:border-indigo-500 transition-all select-text shadow-inner" />
                   <input type="text" placeholder="زیر عنوان" value={dos.subtitle || ''} onChange={e => updateItem(setDossiers, dos.id, 'subtitle', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 transition-all select-text shadow-inner" />
                   <input type="text" placeholder="لینک پرونده" value={dos.link || ''} onChange={e => updateItem(setDossiers, dos.id, 'link', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none dir-ltr text-right focus:border-indigo-500 transition-all select-text shadow-inner" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-bold block mb-2">رنگ پرونده (انتخاب از پالت ۲۰ رنگ):</span>
                  <ColorPicker selected={dos.color || PALETTE[15]} onChange={c => updateItem(setDossiers, dos.id, 'color', c)} />
                </div>
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button onClick={() => setDeletingItem({ type: 'dossier', id: dos.id, title: dos.title || 'پرونده بی‌نام' })} className="text-xs text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-inner border border-transparent"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* ======================================================= */}
      {/* 6. تب رادار موضوعی */}
      {activeTab === 'RADAR' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5 mb-8 shadow-inner">
            <h3 className="text-sm font-bold text-cyan-400 border-b border-white/5 pb-2">تنظیمات کلی بخش رادار</h3>
            <input type="text" placeholder="عنوان سکشن" value={radarConfig.title || ''} onChange={e => setRadarConfig({...radarConfig, title: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none font-bold focus:border-cyan-500 transition-all select-text shadow-inner" />
            <input type="text" placeholder="زیرعنوان سکشن" value={radarConfig.subtitle || ''} onChange={e => setRadarConfig({...radarConfig, subtitle: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
          </div>

          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-cyan-400">آیتم‌های روی رادار</h2>
            <button onClick={() => setRadarTopics([{ id: Date.now(), name: '', color: PALETTE[10], link: '#' }, ...radarTopics])} className="text-xs bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 hover:text-black border border-transparent shadow-inner"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>
          
          <div className="flex flex-col space-y-4">
            {radarTopics.map((topic) => (
              <div key={topic.id} className="flex flex-col gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
                  <input type="text" placeholder="عنوان (مثال: #جنگ_سرد)" value={topic.name || ''} onChange={e => updateItem(setRadarTopics, topic.id, 'name', e.target.value)} className="w-full md:w-1/3 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500 font-bold transition-all select-text shadow-inner" />
                  <input type="text" placeholder="لینک مقصد" value={topic.link || ''} onChange={e => updateItem(setRadarTopics, topic.id, 'link', e.target.value)} className="w-full md:flex-1 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none dir-ltr text-right focus:border-cyan-500 transition-all select-text shadow-inner" />
                  <button onClick={() => setDeletingItem({ type: 'radar', id: topic.id, title: topic.name || 'آیتم بی‌نام' })} className="p-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors text-sm font-bold shadow-inner border border-transparent"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-gray-500 font-bold block mb-2">رنگ شناور (از پالت ۲۰ رنگ):</span>
                  <ColorPicker selected={topic.color || PALETTE[10]} onChange={c => updateItem(setRadarTopics, topic.id, 'color', c)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 7. تب عناوین محتوای چهارگانه */}
      {activeTab === 'CONTENT_TITLES' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-8 shadow-inner">
          <p className="text-sm text-gray-400 font-light mb-6 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
            در این بخش می‌توانید عنوان و زیرتیتر مربوط به ۴ بخش محتوایی سایت (بلاگ، راش، تولیدی و ابزارها) را شخصی‌سازی کنید. محتوای این بخش‌ها مستقیماً از دیتابیس پست‌ها خوانده می‌شود.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* بلاگ */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3 shadow-inner">
              <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2"><Icon name="blog" className="w-4 h-4"/> بخش بلاگ</h3>
              <input type="text" placeholder="عنوان اصلی" value={contentConfig.blog.title} onChange={e => setContentConfig({...contentConfig, blog: {...contentConfig.blog, title: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-amber-500 transition-all select-text shadow-inner" />
              <input type="text" placeholder="زیر تیتر" value={contentConfig.blog.subtitle} onChange={e => setContentConfig({...contentConfig, blog: {...contentConfig.blog, subtitle: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-amber-500 transition-all select-text shadow-inner" />
            </div>

            {/* راش */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3 shadow-inner">
              <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2"><Icon name="footage" className="w-4 h-4"/> بخش محتوای خام (راش)</h3>
              <input type="text" placeholder="عنوان اصلی" value={contentConfig.raw.title} onChange={e => setContentConfig({...contentConfig, raw: {...contentConfig.raw, title: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-500 transition-all select-text shadow-inner" />
              <input type="text" placeholder="زیر تیتر" value={contentConfig.raw.subtitle} onChange={e => setContentConfig({...contentConfig, raw: {...contentConfig.raw, subtitle: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-yellow-500 transition-all select-text shadow-inner" />
            </div>

            {/* تولیدی */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3 shadow-inner">
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2"><Icon name="product" className="w-4 h-4"/> بخش محتوای تولیدی</h3>
              <input type="text" placeholder="عنوان اصلی" value={contentConfig.produced.title} onChange={e => setContentConfig({...contentConfig, produced: {...contentConfig.produced, title: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-rose-500 transition-all select-text shadow-inner" />
              <input type="text" placeholder="زیر تیتر" value={contentConfig.produced.subtitle} onChange={e => setContentConfig({...contentConfig, produced: {...contentConfig.produced, subtitle: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-rose-500 transition-all select-text shadow-inner" />
            </div>

            {/* ابزارها */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-3 shadow-inner">
              <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2"><Icon name="pen-nib" className="w-4 h-4"/> بخش ابزارهای کاربردی</h3>
              <input type="text" placeholder="عنوان اصلی" value={contentConfig.tools.title} onChange={e => setContentConfig({...contentConfig, tools: {...contentConfig.tools, title: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500 transition-all select-text shadow-inner" />
              <input type="text" placeholder="زیر تیتر" value={contentConfig.tools.subtitle} onChange={e => setContentConfig({...contentConfig, tools: {...contentConfig.tools, subtitle: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500 transition-all select-text shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 8. تب تایم لاین */}
      {activeTab === 'TIMELINE' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-amber-400">تایم‌لاین افشاگری‌ها</h2>
            <button onClick={() => setTimelineEvents([{ id: Date.now(), year: '', title: '', desc: '', color: PALETTE[4] }, ...timelineEvents])} className="text-xs bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg font-bold hover:bg-amber-500 hover:text-black border border-transparent shadow-inner"><Icon name="plus" className="w-3.5 h-3.5" /></button>
          </div>
          
          <Reorder.Group axis="y" values={timelineEvents} onReorder={setTimelineEvents} className="flex flex-col space-y-4 max-w-4xl mx-auto">
            {timelineEvents.map((ev) => (
              <Reorder.Item key={ev.id} value={ev} className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-4 cursor-grab active:cursor-grabbing shadow-lg">
                <div className="flex flex-col md:flex-row gap-3">
                  <input type="text" placeholder="سال (مثال: ۱۴۰۲)" value={ev.year || ''} onChange={e => updateItem(setTimelineEvents, ev.id, 'year', e.target.value)} className="w-full md:w-32 bg-black/60 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 font-bold text-center transition-all select-text shadow-inner" />
                  <input type="text" placeholder="عنوان رویداد" value={ev.title || ''} onChange={e => updateItem(setTimelineEvents, ev.id, 'title', e.target.value)} className="flex-1 bg-black/60 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 font-bold transition-all select-text shadow-inner" />
                </div>
                <textarea rows="3" placeholder="توضیحات رویداد (راست‌چین و جاستیفای)" value={ev.desc || ''} onChange={e => updateItem(setTimelineEvents, ev.id, 'desc', e.target.value)} className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 resize-none leading-relaxed transition-all select-text shadow-inner"></textarea>
                
                <div className="pt-2">
                  <span className="text-[11px] text-gray-500 font-bold block mb-2">رنگ نقطه رویداد:</span>
                  <ColorPicker selected={ev.color || PALETTE[4]} onChange={c => updateItem(setTimelineEvents, ev.id, 'color', c)} />
                </div>
                
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button onClick={() => setDeletingItem({ type: 'timeline', id: ev.id, title: ev.title || 'رویداد بی‌نام' })} className="text-xs text-rose-500 bg-rose-500/10 px-4 py-2 rounded-lg font-bold hover:bg-rose-500 hover:text-white transition-colors shadow-inner border border-transparent"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* ======================================================= */}
      {/* 9. تب شمارشگر معکوس */}
      {activeTab === 'COUNTDOWN' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <h2 className="text-lg font-bold text-rose-400 border-b border-white/5 pb-4">تنظیمات دقیق شمارشگر معکوس</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner max-w-4xl mx-auto">
            <div className="space-y-2 md:col-span-2 bg-black/40 p-4 rounded-xl border border-rose-500/20 shadow-inner">
              <label className="text-sm text-rose-400 font-bold flex items-center gap-2"><Icon name="clock" className="w-4 h-4"/> تاریخ پایان</label>
              <p className="text-[11px] text-gray-400 leading-loose">تاریخ دقیق را با فرمت میلادی به شکل <code className="bg-black/60 px-2 py-0.5 rounded text-cyan-400 border border-white/5">YYYY-MM-DDTHH:MM:SS</code> وارد کنید. مثال: <code>2026-12-31T23:59:59</code></p>
              <input type="text" value={countdown.targetDate || ''} onChange={e => setCountdown({...countdown, targetDate: e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-base text-white outline-none dir-ltr text-left font-mono font-bold focus:border-rose-500 transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-bold">عنوان اصلی باکس</label>
              <input type="text" value={countdown.title || ''} onChange={e => setCountdown({...countdown, title: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 font-bold transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-bold">توضیحات زیر عنوان</label>
              <input type="text" value={countdown.desc || ''} onChange={e => setCountdown({...countdown, desc: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-bold">متن دکمه در زمان <span className="text-rose-400">قفل بودن</span></label>
              <input type="text" value={countdown.lockedText || ''} onChange={e => setCountdown({...countdown, lockedText: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-bold">متن پیام تولتیپ در زمان قفل بودن</label>
              <input type="text" value={countdown.tooltip || ''} onChange={e => setCountdown({...countdown, tooltip: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[11px] text-gray-400 font-bold">متن دکمه در زمان <span className="text-emerald-400">باز شدن (صفر شدن)</span></label>
              <input type="text" value={countdown.unlockedText || ''} onChange={e => setCountdown({...countdown, unlockedText: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 transition-all select-text shadow-inner" />
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[11px] text-gray-400 font-bold">لینک مقصد پس از باز شدن</label>
              <input type="text" value={countdown.link || ''} onChange={e => setCountdown({...countdown, link: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none dir-ltr text-right focus:border-emerald-500 transition-all select-text shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 10. تب پدیدآورندگان */}
      {activeTab === 'INVESTIGATORS' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <h2 className="text-lg font-bold text-purple-400 border-b border-white/5 pb-4">پدیدآورندگان شاخص</h2>
          
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner space-y-4 max-w-4xl mx-auto">
            <p className="text-xs text-gray-400">نام پدیدآورنده را جستجو کنید و برای افزودن به لیست روی آن کلیک کنید.</p>
            <div className="relative">
              <Icon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="جستجو در دیتابیس..." 
                value={searchCreator || ''} 
                onChange={e => setSearchCreator(e.target.value)} 
                className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pr-12 pl-4 text-sm text-white outline-none focus:border-purple-500 transition-colors shadow-inner select-text" 
              />
            </div>
            
            {searchCreator && (
              <div className="bg-black/40 rounded-xl border border-white/5 max-h-[200px] overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-inner">
                {dbCreators.filter(c => c.name.includes(searchCreator) && !selectedInvestigators.includes(c.id)).map(creator => (
                  <div key={creator.id} onClick={() => { setSelectedInvestigators([...selectedInvestigators, creator.id]); setSearchCreator(''); }} className="flex items-center gap-3 p-3 bg-black/60 hover:bg-purple-500/20 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-500/30">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black/50 shrink-0 border border-white/5">
                      {creator.imageUrl ? <img src={creator.imageUrl} className="w-full h-full object-cover" alt="" /> : <Icon name="user" className="w-4 h-4 m-2 text-gray-500" />}
                    </div>
                    <span className="text-xs text-white font-bold select-none">{creator.name}</span>
                    <Icon name="plus" className="w-4 h-4 text-purple-400 ml-auto" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            {selectedInvestigators.map(id => {
              const creator = dbCreators.find(c => c.id === id);
              if (!creator) return null;
              return (
                <div key={id} className="relative p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center text-center group shadow-lg">
                  <button onClick={() => setSelectedInvestigators(selectedInvestigators.filter(sid => sid !== id))} className="absolute -top-2 -left-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg font-bold border border-rose-400/50">✕</button>
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-black/50 mb-3 border-2 border-purple-500/30 shadow-inner">
                    {creator.imageUrl ? <img src={creator.imageUrl} className="w-full h-full object-cover" alt="" /> : <Icon name="user" className="w-6 h-6 m-4 text-gray-500" />}
                  </div>
                  <span className="text-sm text-white font-bold select-none">{creator.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 11. تب باکس پورتال امن */}
      {activeTab === 'CTA' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <h2 className="text-lg font-bold text-cyan-400 border-b border-white/5 pb-4">باکس انتهای صفحه</h2>
          
          <div className="space-y-4 bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5 shadow-inner max-w-3xl mx-auto">
            <input type="text" placeholder="روتیتر" value={ctaBox.preTitle || ''} onChange={e => setCtaBox({...ctaBox, preTitle: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-cyan-500 font-bold transition-all select-text shadow-inner" />
            <input type="text" placeholder="عنوان اصلی" value={ctaBox.title || ''} onChange={e => setCtaBox({...ctaBox, title: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xl font-black text-white outline-none focus:border-cyan-500 transition-all select-text shadow-inner" />
            <textarea rows="4" placeholder="متن توضیحات..." value={ctaBox.desc || ''} onChange={e => setCtaBox({...ctaBox, desc: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-cyan-500 leading-relaxed text-justify transition-all select-text shadow-inner" />
            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-white/5">
              <input type="text" placeholder="متن دکمه" value={ctaBox.btnText || ''} onChange={e => setCtaBox({...ctaBox, btnText: e.target.value})} className="w-full md:w-1/3 bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-cyan-500 font-bold transition-all select-text shadow-inner" />
              <input type="text" placeholder="لینک دکمه (مثال: /submit)" value={ctaBox.btnLink || ''} onChange={e => setCtaBox({...ctaBox, btnLink: e.target.value})} className="w-full md:flex-1 bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none dir-ltr text-right focus:border-cyan-500 transition-all select-text shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 12. تب سئو و تب مرورگر */}
      {activeTab === 'SEO' && (
        <div className="p-6 bg-[#050810]/50 rounded-3xl border border-white/5 space-y-6 shadow-inner">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Icon name="layout" className="w-6 h-6 text-fuchsia-400" />
            <h2 className="text-lg font-bold text-fuchsia-400">تنظیمات تب مرورگر (اختصاصی صفحه اصلی)</h2>
          </div>
          
          <div className="space-y-6 bg-black/20 p-6 md:p-8 rounded-2xl border border-white/5 shadow-inner max-w-3xl mx-auto">
            <p className="text-xs text-gray-400 leading-loose bg-black/40 p-4 rounded-xl border border-fuchsia-500/20 shadow-inner">
              این تنظیم <strong>کاملاً مجزا از تنظیمات کل سایت</strong> عمل می‌کند. عنوانی که در اینجا می‌نویسید، فقط در تب مرورگرِ کاربرانی که وارد صفحه اصلی (`/`) می‌شوند نمایش داده خواهد شد.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white pl-1">عنوان تب مرورگر (Meta Title)</label>
              <input type="text" placeholder="مثال: شبکه مدار - کشف حقیقت" value={seoConfig.metaTitle || ''} onChange={e => setSeoConfig({...seoConfig, metaTitle: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-fuchsia-500 font-bold transition-all select-text shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* دکمه ذخیره نهایی شناور */}
      <div className="fixed bottom-8 left-8 z-50">
        <button onClick={handleSave} disabled={saving} className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-black shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-transparent">
          {saving ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>

      {/* ======================================================= */}
      {/* مودال انتخابگر رسانه */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setMediaPickerTarget(null)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-90 pointer-events-none" />
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0">
                  <h3 className="text-white font-bold flex items-center gap-2"><Icon name="image" className="w-5 h-5 text-cyan-400" /> انتخاب فایل رسانه</h3>
                  <button onClick={() => setMediaPickerTarget(null)} className="p-1.5 text-gray-400 bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl z-10 transition-colors border border-transparent shadow-inner">
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                  <MediaLibraryPage
                    isPickerMode={true}
                    onSelectMedia={(media) => {
                      const [type, id] = mediaPickerTarget.split('_');
                      if (type === 'heroDesk') updateItem(setHeroSlides, parseInt(id), 'imgDesktop', media.url);
                      if (type === 'heroMob') updateItem(setHeroSlides, parseInt(id), 'imgMobile', media.url);
                      if (type === 'statIcon') updateItem(setStats, parseInt(id), 'iconUrl', media.url);
                      setMediaPickerTarget(null);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* پاپ‌آپ سراسری تایید حذف */}
      <AnimatePresence>
        {deletingItem && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setDeletingItem(null)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              >
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-inner">
                  <Icon name="trash" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تایید حذف</h3>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  آیا از حذف <span className="text-rose-400 font-bold select-text">"{deletingItem.title}"</span> مطمئن هستید؟ این عملیات غیرقابل بازگشت است.
                </p>
                <div className="flex gap-3">
                  <button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(225,29,72,0.3)] border border-transparent">بله</button>
                  <button onClick={() => setDeletingItem(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-colors border border-transparent shadow-inner">انصراف</button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}      