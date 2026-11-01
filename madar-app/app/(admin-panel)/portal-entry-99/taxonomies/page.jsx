'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getTaxonomies, createTaxonomy, deleteTaxonomy, updateTaxonomy, getArchiveSettingsAction, saveArchiveSettingsAction } from '@/app/actions/taxonomies';
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

// تول‌تیپ بازنویسی شده منطبق بر تم تاریک و گلس‌مورفیک سایت (Deep Dark UI)
function Tooltip({ text, children }) {
  if (!text) return children;
  return (
    <div className="relative z-30 group/tooltip inline-flex items-center justify-center select-none">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-[60] pointer-events-none animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-[#050810]/95 backdrop-blur-xl border border-white/10 text-gray-200 text-[11px] py-1.5 px-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-nowrap font-sans font-bold">
          {text}
        </div>
      </div>
    </div>
  );
}

export default function TaxonomiesPage() {
  const router = useRouter();

  // ==========================================
  // ۱. منطق احراز هویت بدون پرش (Wait & Verify)
  // ==========================================
  const { user, isLoading: authIsLoading, loading: authLoading, isFetching } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const isWorking = authIsLoading || authLoading || isFetching;
    if (isWorking) return;

    if (user) {
      setHasAccess(!!(user.isAdmin || user.isSuperAdmin));
    } else if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setHasAccess(false);
      } else {
        const timer = setTimeout(() => setHasAccess(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authIsLoading, authLoading, isFetching]);

  // ==========================================
  // ۲. استیت‌ها و داده‌های صفحه
  // ==========================================
  const [activeTab, setActiveTab] = useState('CATEGORY'); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [preTitle, setPreTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [pageBadge, setPageBadge] = useState('بایگانی مرجع مدار');
  const [pageTitle, setPageTitle] = useState('کاوش در بایگانی مدار');
  const [pageDesc, setPageDesc] = useState('جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان.');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-');
    setSlug(autoSlug);
  };

  const loadData = async () => {
    if(activeTab === 'SETTINGS' || !hasAccess) return; 

    setLoading(true);
    try {
      const res = await getTaxonomies(activeTab);
      if (res.success) {
        setItems(res.data);
      } else {
        toast.error('خطا در دریافت لیست اطلاعات!');
      }
    } catch (error) {
      toast.error('خطا در برقراری ارتباط با دیتابیس!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setPreTitle('');
    setDescription('');
    setImageUrl('');
    setErrorMsg('');
  };

  // آپدیتِ useEffect برای لود کردن اطلاعاتِ دیتابیس در زمان باز کردن تب تنظیمات
  useEffect(() => {
    if (hasAccess) {
      if (activeTab !== 'SETTINGS') {
        loadData();
        resetForm();
        setSearchQuery('');
        setVisibleCount(10);
      } else {
        // خواندن مقادیر واقعی از دیتابیس هنگام باز شدن تب تنظیمات
        const fetchSettings = async () => {
          setLoading(true);
          const res = await getArchiveSettingsAction();
          if (res.success && res.data) {
            setPageBadge(res.data.archive_badge || 'بایگانی مرجع مدار');
            setPageTitle(res.data.archive_title || 'کاوش در بایگانی مدار');
            setPageDesc(res.data.archive_desc || 'جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان.');
          }
          setLoading(false);
        };
        fetchSettings();
      }
    }
  }, [activeTab, hasAccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('نام آیتم الزامی است.');
      toast.error('لطفاً نام آیتم را وارد کنید.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      type: activeTab,
      name,
      slug,
      preTitle,
      description,
      imageUrl: activeTab === 'CREATOR' ? imageUrl : null
    };

    const actionPromise = editingId 
      ? updateTaxonomy(editingId, payload)
      : createTaxonomy(payload);

    toast.promise(
      actionPromise,
      {
        loading: editingId ? 'در حال ویرایش آیتم...' : 'در حال ثبت آیتم جدید...',
        success: (res) => {
          setSubmitting(false);
          if (res.success) {
            resetForm();
            loadData();
            router.refresh();
            return editingId ? 'آیتم با موفقیت ویرایش شد.' : 'آیتم با موفقیت ثبت شد.';
          }
          setErrorMsg(res.error || 'خطایی رخ داد.');
          throw new Error(res.error || 'خطا در ثبت اطلاعات');
        },
        error: (err) => {
          setSubmitting(false);
          return err?.message || 'خطا در انجام عملیات!';
        }
      }
    );
  };

  // آپدیتِ تابع ذخیره‌سازی برای ارسال اطلاعات به دیتابیس
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const res = await saveArchiveSettingsAction({
      badge: pageBadge,
      title: pageTitle,
      description: pageDesc
    });
    
    setSubmitting(false);
    if (res.success) {
      toast.success('تنظیمات صفحه طبقه‌بندی‌ها با موفقیت در دیتابیس ذخیره شد.');
    } else {
      toast.error(res.error || 'خطا در ذخیره تنظیمات');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setPreTitle(item.preTitle || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    toast.promise(
      deleteTaxonomy(deletingItem.id),
      {
        loading: 'در حال حذف آیتم...',
        success: (res) => {
          setIsDeleting(false);
          if (res.success) {
            setDeletingItem(null);
            loadData();
            router.refresh();
            return 'آیتم با موفقیت حذف شد.';
          }
          throw new Error(res.error || 'خطا در حذف آیتم');
        },
        error: (err) => {
          setIsDeleting(false);
          return err?.message || 'خطا در حذف آیتم!';
        }
      }
    );
  };

  const getTabTitle = () => {
    if (activeTab === 'CATEGORY') return 'دسته‌بندی‌ها';
    if (activeTab === 'HASHTAG') return 'هشتگ‌ها';
    return 'پدیدآورندگان';
  };

  const getSingularTitle = () => {
    if (activeTab === 'CATEGORY') return 'دسته‌بندی';
    if (activeTab === 'HASHTAG') return 'هشتگ';
    return 'پدیدآورنده';
  };

  const filteredItems = items.filter(item => 
    item.name.includes(searchQuery) || item.slug.includes(searchQuery)
  );
  
  const displayedItems = filteredItems.slice(0, visibleCount);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans text-right select-none relative">
      
      {/* هدر صفحه */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3 relative z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          مدیریت طبقه‌بندی‌ها
        </h1>
        <p className="text-sm text-gray-400 font-light relative z-10">مدیریت مستقل دسته‌بندی‌ها، هشتگ‌ها، پدیدآورندگان و ظاهر صفحه طبقه‌بندی‌ها</p>
        
        {/* تب‌ها */}
        <div className="flex flex-wrap gap-3 mt-6 border-b border-white/5 pb-4 relative z-10">
          {[
            { key: 'CATEGORY', label: 'دسته‌بندی‌ها', icon: 'folder' },
            { key: 'HASHTAG', label: 'هشتگ‌ها', icon: 'hash' },
            { key: 'CREATOR', label: 'پدیدآورندگان', icon: 'users' },
            { key: 'SETTINGS', label: 'تنظیمات صفحه مرجع', icon: 'setting' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border border-transparent shadow-inner",
                activeTab === tab.key 
                  ? 'bg-[#10b981]/20 text-[#10b981] shadow-[inset_0_0_15px_rgba(16,185,129,0.2)] border-[#10b981]/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {tab.key === 'SETTINGS' && <Icon name="gear" className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ======================================================== */}
        {/* حالت اول: فرم‌ها و لیست‌های مربوط به هشتگ/دسته/پدیدآورنده */}
        {/* ======================================================== */}
        {activeTab !== 'SETTINGS' ? (
          <>
            {/* فرم افزودن / ویرایش */}
            <div className="lg:col-span-1 sticky top-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden h-fit group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

              <div className="p-6 space-y-4 relative z-10 bg-[#050810]/50 shadow-inner rounded-3xl">
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  <Icon name="plus" className="w-4 h-4 text-[#10b981]" />
                  {editingId ? `ویرایش ${getSingularTitle()}` : `افزودن ${getSingularTitle()} جدید`}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 pl-1">نام (عنوان) *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={handleNameChange} 
                      placeholder={`مثال: ${activeTab === 'CREATOR' ? 'آنتونی گیدنز' : 'فلسفه'}`} 
                      className="w-full bg-black/40 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#10b981] border border-white/5 transition-colors shadow-inner select-text font-sans" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 pl-1">لینک انگلیسی (Slug)</label>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      placeholder="تولید خودکار یا دستی..." 
                      className="w-full bg-black/40 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#10b981] border border-white/5 dir-ltr text-left transition-colors font-sans shadow-inner select-text" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 pl-1">روتیتر (باکس بالای عنوان)</label>
                    <input 
                      type="text" 
                      value={preTitle} 
                      onChange={(e) => setPreTitle(e.target.value)} 
                      placeholder="مثال: پرونده ویژه / استاد برجسته" 
                      className="w-full bg-black/40 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#10b981] border border-white/5 transition-colors shadow-inner select-text font-sans" 
                    />
                  </div>

                  {activeTab === 'CREATOR' && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-300 pl-1">تصویر پروفایل پدیدآورنده</label>
                      {imageUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl shadow-inner">
                          <img src={imageUrl} alt="تصویر پروفایل" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-white/5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-emerald-400 font-bold truncate">تصویر انتخاب شد</p>
                            <p className="text-[10px] text-gray-500 truncate dir-ltr text-right font-sans select-text">{imageUrl}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsMediaModalOpen(true)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-[#10b981] text-white text-xs rounded-lg transition-colors cursor-pointer shrink-0 font-bold border border-transparent shadow-inner"
                          >
                            <Icon name="change" className="w-3.5 h-3.5" />
                          </button>
                          <Tooltip text="حذف تصویر">
                            <button 
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer shrink-0 border border-transparent shadow-inner"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setIsMediaModalOpen(true)}
                          className="w-full py-4 bg-black/40 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#10b981] text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner font-sans"
                        >
                          <Icon name="image" className="w-5 h-5 text-[#10b981]" />
                          انتخاب تصویر از رسانه
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 pl-1">توضیحات</label>
                    <textarea 
                      rows="3" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="توضیحات تکمیلی..." 
                      className="w-full bg-black/40 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#10b981] border border-white/5 transition-colors shadow-inner resize-none select-text font-sans" 
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-transparent shadow-inner font-sans">{errorMsg}</p>}

                  <div className="flex gap-2 mt-2 border-t border-white/5 pt-3">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="flex-1 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95 border border-transparent font-sans"
                    >
                      {submitting ? 'در حال ثبت...' : 'ذخیره'}
                    </button>
                    
                    {editingId && (
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all cursor-pointer border border-transparent shadow-inner font-sans"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* لیست موجودیت‌ها */}
            <div className="lg:col-span-2 relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

              <div className="p-6 space-y-4 relative z-10 bg-[#050810]/50 shadow-inner rounded-3xl min-h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
                    <Icon name="folder" className="w-5 h-5 text-[#10b981]" />
                    لیست {getTabTitle()} ثبت‌شده
                  </h2>
                  
                  <div className="relative">
                    <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisibleCount(10);
                      }}
                      placeholder="جستجو..." 
                      className="bg-black/40 rounded-full py-2 pr-9 pl-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#10b981] border border-white/5 w-full sm:w-64 transition-all shadow-inner select-text font-sans"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-gray-400 text-sm font-sans">در حال دریافت اطلاعات...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-20 bg-black/20 rounded-xl border border-white/5 shadow-inner text-gray-500 text-sm font-sans">
                    موردی یافت نشد.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 shadow-inner rounded-xl hover:bg-white/5 transition-all duration-300 group/item">
                        <div className="flex items-center gap-4">
                          {activeTab === 'CREATOR' && (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Icon name="user" className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm select-text font-sans">{item.name}</h3>
                              {item.preTitle && (
                                <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-md font-bold select-text font-sans border border-transparent shadow-inner">
                                  {item.preTitle}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dir-ltr text-right font-sans select-text">/{item.slug}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tooltip text="مشاهده صفحه">
                            <a 
                              href={`/t/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs border border-transparent shadow-inner"
                            >
                              <Icon name="arrowUpRight" className="w-4 h-4" />
                            </a>
                          </Tooltip>
                          <Tooltip text="ویرایش">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2.5 text-[#10b981] hover:bg-[#10b981]/10 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs border border-transparent shadow-inner"
                            >
                              <Icon name="pencil" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip text="حذف">
                            <button 
                              onClick={() => setDeletingItem(item)}
                              className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs border border-transparent shadow-inner"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    
                    {visibleCount < filteredItems.length && (
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 font-bold transition-all cursor-pointer border border-transparent shadow-inner font-sans"
                      >
                        نمایش بیشتر ({filteredItems.length - visibleCount} مورد دیگر)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ======================================================== */
          /* حالت دوم: فرم تنظیمات صفحه اصلی بایگانی (/t) */
          /* ======================================================== */
          <div className="lg:col-span-3 relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-90 pointer-events-none z-20" />

            <div className="p-8 space-y-6 relative z-10 bg-[#050810]/50 shadow-inner rounded-3xl">
              <h2 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-3 font-sans">
                <Icon name="layout" className="w-6 h-6 text-[#3b82f6]" />
                ویرایش ظاهر صفحه طبقه‌بندی‌ها (دامنه /t)
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300 pl-1 font-sans">روتیتر</label>
                    <input 
                      type="text" 
                      value={pageBadge} 
                      onChange={(e) => setPageBadge(e.target.value)} 
                      placeholder="مثال: بایگانی مرجع مدار" 
                      className="w-full bg-black/40 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#3b82f6] transition-colors border border-white/5 shadow-inner select-text font-sans" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300 pl-1 font-sans">عنوان</label>
                    <input 
                      type="text" 
                      value={pageTitle} 
                      onChange={(e) => setPageTitle(e.target.value)} 
                      placeholder="مثال: کاوش در بایگانی مدار" 
                      className="w-full bg-black/40 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#3b82f6] transition-colors font-black border border-white/5 shadow-inner select-text font-sans" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300 pl-1 font-sans">متن توضیحات</label>
                    <textarea 
                      rows="4" 
                      value={pageDesc} 
                      onChange={(e) => setPageDesc(e.target.value)} 
                      placeholder="متنی برای معرفی این صفحه بنویسید..." 
                      className="w-full bg-black/40 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border focus:border-[#3b82f6] transition-colors leading-relaxed border border-white/5 shadow-inner resize-none select-text font-sans" 
                    />
                    <p className="text-xs text-gray-500 pt-1 font-sans">این متن هم در ظاهر صفحه و هم در توضیحات سئو گوگل نمایش داده می‌شود.</p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full py-4 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95 border border-transparent mt-2 font-sans"
                    >
                      {submitting ? 'در حال ذخیره...' : 'ذخیره'}
                    </button>
                  </div>
                </form>

                {/* پیش‌نمایش زنده */}
                <div className="hidden lg:flex flex-col justify-center items-center p-8 rounded-3xl bg-black/20 relative overflow-hidden border border-white/5 shadow-inner select-none">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#3b82f6]/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <span className="text-[10px] text-gray-500 px-3 py-1 rounded-full mb-2 font-sans">پیش‌نمایش ظاهر هدر</span>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3b82f6]/10 rounded-full text-xs font-bold text-[#3b82f6] tracking-widest shadow-inner border border-transparent select-none font-sans">
                      {pageBadge || 'روتیتر'}
                    </div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg select-none font-sans">
                      <span className="text-[#3b82f6]">{pageTitle || 'عنوان'}</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed max-w-xs text-justify [text-align-last:center] font-light select-none font-sans">
                      {pageDesc || 'توضیحات معرفی صفحه...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مودال تأیید حذف با استفاده از ModalPortal */}
      <AnimatePresence>
        {deletingItem && (
          <ModalPortal>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none font-sans">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setDeletingItem(null)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-3xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 bg-[#0f172a]/95 backdrop-blur-3xl"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />

                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-inner border border-transparent">
                  <Icon name="trash" className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 font-sans">حذف {getSingularTitle()}</h3>
                <p className="text-sm text-gray-300 font-light mb-6 leading-relaxed select-text font-sans">
                  آیا از حذف <span className="text-rose-400 font-bold">«{deletingItem.name}»</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
                </p>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer disabled:opacity-50 border border-transparent font-sans"
                  >
                    {isDeleting ? 'در حال حذف...' : 'حذف'}
                  </button>
                  <button 
                    onClick={() => setDeletingItem(null)}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm rounded-xl transition-all cursor-pointer border border-transparent shadow-inner font-sans"
                  >
                    انصراف
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* مدیا پیکر با استفاده از ModalPortal */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none font-sans">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsMediaModalOpen(false)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl max-h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />
                
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0 relative z-20">
                  <h3 className="text-white font-bold flex items-center gap-2 font-sans"><Icon name="image" className="w-5 h-5 text-[#10b981]" /> انتخاب تصویر پدیدآورنده</h3>
                  <button 
                    type="button"
                    onClick={() => setIsMediaModalOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl z-10 transition-colors cursor-pointer border border-transparent shadow-inner"
                  >
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar relative z-10">
                  <MediaLibraryPage
                    isPickerMode={true}
                    onSelectMedia={(media) => {
                      setImageUrl(media.url);
                      setIsMediaModalOpen(false);
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