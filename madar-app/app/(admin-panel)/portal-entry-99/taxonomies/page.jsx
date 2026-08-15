'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getTaxonomies, createTaxonomy, deleteTaxonomy, updateTaxonomy } from '@/app/actions/taxonomies';
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function TaxonomiesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('CATEGORY'); // CATEGORY, HASHTAG, CREATOR
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // استیت‌های فرم
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [preTitle, setPreTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // استیت‌های جستجو و صفحه‌بندی
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  // استیت مودال‌ها
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // تولید خودکار اسلاگ
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

  useEffect(() => {
    loadData();
    resetForm();
    setSearchQuery('');
    setVisibleCount(10);
  }, [activeTab]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans text-right select-none relative">
      
      {/* هدر صفحه (کارت شیشه‌ای ایزوله با خط نوری گرادینت و نشانگر سبز زمردی) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          مدیریت طبقه‌بندی‌ها (Taxonomy)
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت مستقل دسته‌بندی‌ها، هشتگ‌ها و پدیدآورندگان سایت</p>
        
        <div className="flex gap-3 mt-6 border-b border-white/10 pb-4">
          {[
            { key: 'CATEGORY', label: 'دسته‌بندی‌ها' },
            { key: 'HASHTAG', label: 'هشتگ‌ها' },
            { key: 'CREATOR', label: 'پدیدآورندگان' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
                activeTab === tab.key 
                  ? 'bg-[#10b981] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* فرم افزودن / ویرایش (کارت شیشه‌ای ایزوله استیکی با تم سبز زمردی) */}
        <div className="lg:col-span-1 sticky top-6 rounded-2xl border border-white/10 shadow-2xl overflow-hidden h-fit group">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

          <div className="p-6 space-y-4 relative z-10">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Icon name="plus" className="w-4 h-4 text-[#10b981]" />
              {editingId ? `ویرایش ${getSingularTitle()}` : `افزودن ${getSingularTitle()} جدید`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs text-gray-300">نام (عنوان) *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={handleNameChange} 
                  placeholder={`مثال: ${activeTab === 'CREATOR' ? 'آنتونی گیدنز' : 'فلسفه'}`} 
                  className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10b981] transition-colors" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300">لینک انگلیسی (Slug)</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  placeholder="تولید خودکار یا دستی..." 
                  className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10b981] dir-ltr text-left transition-colors font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300">روتیتر (باکس بالای عنوان)</label>
                <input 
                  type="text" 
                  value={preTitle} 
                  onChange={(e) => setPreTitle(e.target.value)} 
                  placeholder="مثال: پرونده ویژه / استاد برجسته" 
                  className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10b981] transition-colors" 
                />
              </div>

              {/* تصویر پروفایل متصل به کتابخانه رسانه برای پدیدآورندگان */}
              {activeTab === 'CREATOR' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-300">تصویر پروفایل پدیدآورنده</label>
                  {imageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-[#080c16] border border-white/10 rounded-xl">
                      <img src={imageUrl} alt="تصویر پروفایل" className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-emerald-400 font-bold truncate">تصویر با موفقیت انتخاب شد</p>
                        <p className="text-[10px] text-gray-400 truncate dir-ltr text-right font-mono">{imageUrl}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-[#10b981] text-white text-xs rounded-lg transition-colors cursor-pointer shrink-0 font-bold"
                      >
                        تغییر
                      </button>
                      <button 
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="حذف تصویر"
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="w-full py-4 bg-[#080c16] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="image" className="w-5 h-5 text-[#10b981]" />
                      انتخاب تصویر از کتابخانه رسانه
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-gray-300">توضیحات</label>
                <textarea 
                  rows="3" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="توضیحات تکمیلی..." 
                  className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10b981] transition-colors" 
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{errorMsg}</p>}

              <div className="flex gap-2 mt-2 border-t border-white/10 pt-3">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex-1 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {submitting ? 'در حال ثبت...' : 'ذخیره'}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* لیست موجودیت‌ها (کارت شیشه‌ای ایزوله با تم سبز) */}
        <div className="lg:col-span-2 relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

          <div className="p-6 space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="folder" className="w-5 h-5 text-[#10b981]" />
                لیست {getTabTitle()} ثبت‌شده
              </h2>
              
              {/* باکس سرچ */}
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
                  className="bg-[#080c16] border border-white/10 rounded-full py-2 pr-9 pl-4 text-sm text-white outline-none focus:border-[#10b981] w-full sm:w-64 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400 text-sm font-sans">در حال دریافت اطلاعات...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/5 rounded-xl text-gray-500 text-sm font-sans">
                موردی یافت نشد.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-[#080c16] border border-white/10 rounded-xl hover:border-[#10b981]/40 transition-all duration-300 group/item">
                    
                    <div className="flex items-center gap-4">
                      {activeTab === 'CREATOR' && (
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="user" className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm">{item.name}</h3>
                          {item.preTitle && (
                            <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-md border border-[#10b981]/20 font-bold">
                              {item.preTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dir-ltr text-right font-mono">/{item.slug}</p>
                      </div>
                    </div>

                    {/* دکمه‌های عملیات (ویرایش و حذف) */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2.5 text-[#10b981] hover:bg-[#10b981]/10 border border-transparent hover:border-[#10b981]/30 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
                        title="ویرایش"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setDeletingItem(item)}
                        className="p-2.5 text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                  </div>
                ))}
                
                {/* دکمه نمایش بیشتر */}
                {visibleCount < filteredItems.length && (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-3 mt-4 border border-white/10 hover:bg-white/5 rounded-xl text-sm text-gray-300 font-bold transition-all cursor-pointer"
                  >
                    نمایش بیشتر ({filteredItems.length - visibleCount} مورد دیگر)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* مودال تأیید حذف شیشه‌ای گرافیک کلی1 */}
      <AnimatePresence>
        {deletingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setDeletingItem(null)}
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
                <Icon name="close" className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">حذف {getSingularTitle()}</h3>
              <p className="text-sm text-gray-300 font-light mb-6 leading-relaxed">
                آیا از حذف <span className="text-rose-400 font-bold">«{deletingItem.name}»</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </p>

              <div className="flex items-center gap-3">
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'در حال حذف...' : 'حذف قطعی'}
                </button>
                <button 
                  onClick={() => setDeletingItem(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
                >
                  انصراف
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال کتابخانه رسانه برای انتخاب تصویر پدیدآورنده شیشه‌ای گرافیک کلی1 */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#0b0f19] border border-white/10 rounded-3xl overflow-y-auto p-6 shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />
              <button 
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full z-10 transition-colors cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
              <MediaLibraryPage
                isPickerMode={true}
                onSelectMedia={(media) => {
                  setImageUrl(media.url);
                  setIsMediaModalOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}