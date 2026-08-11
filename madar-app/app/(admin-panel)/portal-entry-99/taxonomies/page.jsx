'use client';

import { useState, useEffect } from 'react';
import { getTaxonomies, createTaxonomy, deleteTaxonomy, updateTaxonomy } from '@/app/actions/taxonomies';
import Icon from '@/app/components/Icon';

export default function TaxonomiesPage() {
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
  const [successMsg, setSuccessMsg] = useState('');

  // استیت‌های جستجو و صفحه‌بندی
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  
  // استیت مودال‌ها
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null); // آیتمی که قرار است حذف شود
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
    const res = await getTaxonomies(activeTab);
    if (res.success) {
      setItems(res.data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setPreTitle('');
    setDescription('');
    setImageUrl('');
    setErrorMsg('');
    setSuccessMsg('');
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
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      type: activeTab,
      name,
      slug,
      preTitle,
      description,
      imageUrl: activeTab === 'CREATOR' ? imageUrl : null
    };

    let res;
    if (editingId) {
      res = await updateTaxonomy(editingId, payload);
    } else {
      res = await createTaxonomy(payload);
    }

    if (res.success) {
      setSuccessMsg(editingId ? 'با موفقیت ویرایش شد.' : 'با موفقیت ثبت شد.');
      resetForm();
      loadData();
    } else {
      setErrorMsg(res.error || 'خطایی رخ داد.');
    }
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setPreTitle(item.preTitle || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setErrorMsg('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    const res = await deleteTaxonomy(deletingItem.id);
    if (res.success) {
      setDeletingItem(null);
      loadData();
    } else {
      alert(res.error || 'خطا در حذف آیتم');
    }
    setIsDeleting(false);
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans text-right relative">
      
      {/* هدر صفحه */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white mb-2">مدیریت طبقه‌بندی‌ها (Taxonomy)</h1>
        <p className="text-sm text-gray-400">مدیریت مستقل دسته‌بندی‌ها، هشتگ‌ها و پدیدآورندگان سایت</p>
        
        <div className="flex gap-3 mt-6 border-b border-white/10 pb-4">
          {[
            { key: 'CATEGORY', label: 'دسته‌بندی‌ها' },
            { key: 'HASHTAG', label: 'هشتگ‌ها' },
            { key: 'CREATOR', label: 'پدیدآورندگان' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.key 
                  ? 'bg-[#06b6d4] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* فرم افزودن / ویرایش */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-fit space-y-4 sticky top-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
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
                className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4]" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-300">لینک انگلیسی (Slug)</label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                placeholder="تولید خودکار یا دستی..." 
                className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4] dir-ltr text-left" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-300">روتیتر (باکس بالای عنوان)</label>
              <input 
                type="text" 
                value={preTitle} 
                onChange={(e) => setPreTitle(e.target.value)} 
                placeholder="مثال: پرونده ویژه / استاد برجسته" 
                className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4]" 
              />
            </div>

            {/* تصویر پروفایل برای پدیدآورندگان */}
            {activeTab === 'CREATOR' && (
              <div className="space-y-1">
                <label className="text-xs text-gray-300">تصویر پروفایل</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="لینک تصویر..." 
                    className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4] dir-ltr text-left" 
                  />
                  <button 
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="bg-white/10 hover:bg-[#06b6d4] text-white px-3 rounded-xl transition-colors cursor-pointer text-xs shrink-0"
                  >
                    رسانه
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-300">توضیحات</label>
              <textarea 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="توضیحات تکمیلی..." 
                className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4]" 
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-lg">{successMsg}</p>}

            <div className="flex gap-2 mt-2">
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer disabled:opacity-50"
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

        {/* لیست موجودیت‌ها */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">
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
                className="bg-[#080c16] border border-white/10 rounded-full py-2 pr-9 pl-4 text-sm text-white outline-none focus:border-[#06b6d4] w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">در حال دریافت اطلاعات...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/5 rounded-xl text-gray-500 text-sm">
              موردی یافت نشد.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#080c16] border border-white/10 rounded-xl hover:border-[#06b6d4]/40 transition-all">
                  
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
                          <span className="text-[10px] bg-[#06b6d4]/10 text-[#06b6d4] px-2 py-0.5 rounded-md border border-[#06b6d4]/20">
                            {item.preTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dir-ltr text-right">/{item.slug}</p>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات (ویرایش و حذف) */}
                  <div className="flex items-center gap-2">
                    {/* دکمه ویرایش */}
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2.5 text-[#06b6d4] hover:bg-[#06b6d4]/10 border border-transparent hover:border-[#06b6d4]/30 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs"
                      title="ویرایش"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* دکمه حذف */}
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

      {/* مودال تأیید حذف (اختصاصی قالب مدار) */}
      {deletingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#080c16]/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative overflow-hidden text-right space-y-5">
            
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">حذف {getSingularTitle()}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                آیا از حذف <span className="text-rose-400 font-bold">«{deletingItem.name}»</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'در حال حذف...' : 'حذف قطعی'}
              </button>
              <button
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>

          </div>
        </div>
      )}

      {/* مودال موقت انتخاب رسانه */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080c16]/80 backdrop-blur-md p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-right">
            <button 
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">انتخاب از کتابخانه رسانه</h3>
            <p className="text-sm text-gray-400 mb-6">آدرس تصویر مورد نظر را وارد کنید:</p>
            
            <input 
              type="text" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              placeholder="https://..." 
              className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#06b6d4] dir-ltr text-left mb-4" 
            />
            
            <button 
              onClick={() => setIsMediaModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[#06b6d4] text-white font-bold text-sm cursor-pointer"
            >
              تایید و بستن
            </button>
          </div>
        </div>
      )}

    </div>
  );
}