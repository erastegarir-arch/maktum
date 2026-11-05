'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getContents, deleteContent } from '@/app/actions/content';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDisplayDate } from '@/app/utils/CalendarUtils';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

// نگاشت نوع محتوا برای نمایش در جدول
const TYPE_MAP = {
  PRODUCED: { label: 'تولیدی', icon: 'product', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  RAW: { label: 'خام', icon: 'footage', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  TOOL: { label: 'ابزار', icon: 'pen-nib', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  BLOG: { label: 'بلاگ', icon: 'blog', color: 'text-blue-400 bg-blue-500/10 border border-blue-500/20' }
};

// نگاشت وضعیت محتوا (حذف وضعیت بایگانی)
const STATUS_MAP = {
  PUBLISHED: { label: 'منتشر شده', dot: 'bg-emerald-500', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  DRAFT: { label: 'پیش‌نویس', dot: 'bg-gray-400', color: 'text-gray-400 bg-white/5 border-transparent' }
};

export default function ProductsListPage() {

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
      // این صفحه برای تمام مدیران جهت مشاهده لیست باز است
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
  }, [user, authIsLoading, authLoading, isFetching, can]);

  // ==========================================
  // ۲. استیت‌ها و مدیریت داده‌ها
  // ==========================================
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchContents = async () => {
    if (!hasAccess) return;
    setIsLoading(true);
    try {
      const data = await getContents({ search: searchQuery, type: filterType, status: filterStatus });
      setContents(Array.isArray(data) ? data : []);
    } catch {
      toast.error('خطا در دریافت لیست محتواها.');
      setContents([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasAccess) {
      const delayDebounceFn = setTimeout(() => {
        fetchContents();
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, filterType, filterStatus, hasAccess]);

  const stats = useMemo(() => {
    const total = contents.length;
    const published = contents.filter(c => c.status === 'PUBLISHED').length;
    const draft = contents.filter(c => c.status === 'DRAFT').length;
    return { total, published, draft };
  }, [contents]);

  const confirmDelete = async () => {
    if (!deleteModalItem) return;
    if (!can('CONTENT_DELETE')) return toast.error('شما مجوز حذف محتوا را ندارید.');
    
    setIsDeleting(true);
    const res = await deleteContent(deleteModalItem.id);
    if (res.success) {
      toast.success('محتوا با موفقیت حذف شد.');
      setContents(prev => prev.filter(c => c.id !== deleteModalItem.id));
      setDeleteModalItem(null);
    } else {
      toast.error(res.error || 'خطا در حذف محتوا.');
    }
    setIsDeleting(false);
  };

  const getFrontendUrl = (item) => {
    if (!item?.slug) return '#';
    if (item.type === 'BLOG') return `/blog/${item.slug}`;
    if (item.type === 'PRODUCED') return `/p/${item.slug}`;
    if (item.type === 'RAW') return `/f/${item.slug}`;
    if (item.type === 'TOOL') return `/tool/${item.slug}`;
    return `/products/${item.slug}`;
  };

  const renderDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      return formatDisplayDate(dateVal) || new Date(dateVal).toLocaleDateString('fa-IR');
    } catch {
      return '—';
    }
  };

  // ==========================================
  // ۳. کنترل رندر لودینگ و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null) return <AdminLoading />;

  if (hasAccess === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <Icon name="lock" className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
        <p className="text-gray-400">شما مجوز لازم برای مدیریت و ویرایش محتوا را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 font-sans text-right select-none relative">
      
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            مدیریت محتوا
          </h1>
          <p className="text-sm text-gray-400 font-light">فهرست تمامی محتوا، فایل‌ها و مقالات پایگاه مکتوم.</p>
        </div>
        {can('CONTENT_CREATE') && (
          <Link 
            href="/portal-entry-99/products/create"
            className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shrink-0 border border-transparent"
          >
            <Icon name="plus" className="w-4 h-4" />افزودن محتوا
          </Link>
        )}
      </div>

      {/* ۱. کارت‌های آمار سریع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-[fadeIn_0.4s_ease-out]">
        
        <div className="relative rounded-3xl p-4 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-transparent flex items-center justify-between overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs text-gray-400 font-light">کل محتواها</span>
            <p className="text-xl font-black text-white font-sans">{stats.total.toLocaleString('fa-IR')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner border border-transparent relative z-10">
            <Icon name="fileText" className="w-5 h-5" />
          </div>
        </div>

        <div className="relative rounded-3xl p-4 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-transparent flex items-center justify-between overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs text-gray-400 font-light">منتشر شده</span>
            <p className="text-xl font-black text-emerald-400 font-sans">{stats.published.toLocaleString('fa-IR')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner border border-transparent relative z-10">
            <Icon name="checkCircle" className="w-5 h-5" />
          </div>
        </div>

        <div className="relative rounded-3xl p-4 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-transparent flex items-center justify-between overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs text-gray-400 font-light">پیش‌نویس</span>
            <p className="text-xl font-black text-amber-400 font-sans">{stats.draft.toLocaleString('fa-IR')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner border border-transparent relative z-10">
            <Icon name="pencil" className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ۲. نوار فیلتر و جستجو */}
      <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent animate-[fadeIn_0.5s_ease-out] bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="p-5 flex flex-col md:flex-row items-center gap-4 relative z-10 bg-[#050810]/50 shadow-inner">
          
          {/* باکس جستجو */}
          <div className="relative flex-1 w-full">
            <Icon name="search" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="جستجو در عنوان یا پیوند یکتا (Slug)..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl pr-12 pl-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:border focus:border-[#10b981] outline-none transition-all font-sans select-text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* فیلتر نوع محتوا */}
          <div className="w-full md:w-48 shrink-0">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-4 py-3.5 text-sm text-white focus:border focus:border-[#10b981] outline-none cursor-pointer transition-all font-sans select-text appearance-none"
            >
              <option value="ALL" className="bg-[#0b0f19]">همه انواع محتوا</option>
              <option value="PRODUCED" className="bg-[#0b0f19]">محتوای تولیدی</option>
              <option value="RAW" className="bg-[#0b0f19]">محتوای خام</option>
              <option value="TOOL" className="bg-[#0b0f19]">ابزارها</option>
              <option value="BLOG" className="bg-[#0b0f19]">مقاله / بلاگ</option>
            </select>
          </div>

          {/* فیلتر وضعیت */}
          <div className="w-full md:w-48 shrink-0">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-4 py-3.5 text-sm text-white focus:border focus:border-[#10b981] outline-none cursor-pointer transition-all font-sans select-text appearance-none"
            >
              <option value="ALL" className="bg-[#0b0f19]">همه وضعیت‌ها</option>
              <option value="PUBLISHED" className="bg-[#0b0f19]">منتشر شده</option>
              <option value="DRAFT" className="bg-[#0b0f19]">پیش‌نویس</option>
            </select>
          </div>

        </div>
      </div>

      {/* ۳. جدول نمایش دیتا */}
      <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent animate-[fadeIn_0.6s_ease-out] bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="overflow-x-auto custom-scrollbar relative z-10 bg-[#050810]/50 shadow-inner">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-black/20 text-gray-400 font-bold border-b border-white/10 shadow-inner">
              <tr>
                <th className="px-6 py-4 rounded-tr-3xl">عنوان محتوا</th>
                <th className="px-6 py-4">نوع</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">تاریخ انتشار</th>
                <th className="px-6 py-4 text-center rounded-tl-3xl">عملیات</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-sans">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-white/20 border-t-[#10b981] rounded-full animate-spin"></div>
                      <span>در حال دریافت اطلاعات...</span>
                    </div>
                  </td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-sans">
                    <div className="flex flex-col items-center justify-center gap-3 bg-black/20 p-6 rounded-xl border border-white/5 shadow-inner mx-4">
                      <Icon name="browser" className="w-10 h-10 text-gray-600" />
                      <span>هیچ محتوایی با این مشخصات یافت نشد.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {contents.map((item) => {
                    const typeConfig = TYPE_MAP[item.type] || { label: item.type, icon: 'fileText', color: 'text-gray-400 bg-white/5' };
                    const statusConfig = STATUS_MAP[item.status] || { label: item.status, dot: 'bg-gray-400', color: 'text-gray-400 bg-white/5 border-transparent' };
                    const frontendUrl = getFrontendUrl(item);

                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group/row"
                      >
                        {/* عنوان و کاور */}
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-black/30 border border-transparent shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                            {item.coverDesktop || item.coverMobile ? (
                              <img 
                                src={item.coverDesktop || item.coverMobile} 
                                alt={item.titleBase || 'Cover'} 
                                className="w-full h-full object-cover opacity-80 group-hover/row:opacity-100 group-hover/row:scale-110 transition-all duration-300" 
                              />
                            ) : (
                              <Icon name="image" className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 max-w-xs md:max-w-md truncate">
                            <span className="text-white font-bold truncate select-text">
                              {item.titleBase} {item.titleHighlight && <span className="text-[#10b981]">{item.titleHighlight}</span>}
                            </span>
                            <span className="text-xs text-gray-500 truncate dir-ltr text-left font-sans select-text">/{item.slug}</span>
                          </div>
                        </td>

                        {/* نوع محتوا */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-inner ${typeConfig.color}`}>
                            <Icon name={typeConfig.icon} className="w-3.5 h-3.5 fill-current" />
                            {typeConfig.label}
                          </div>
                        </td>

                        {/* وضعیت */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-inner ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                            {statusConfig.label}
                          </div>
                        </td>

                        {/* تاریخ انتشار شمسی */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300 font-sans text-xs select-text">
                            <Icon name="calendar" className="w-3.5 h-3.5 text-gray-500" />
                            <span>{renderDate(item.publishedAt || item.createdAt)}</span>
                          </div>
                        </td>

                        {/* عملیات */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            
                            <div className="relative group/tooltip flex items-center justify-center z-20">
                              <a 
                                href={frontendUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-white/5 hover:border-[#10b981] text-gray-400 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all cursor-pointer shadow-inner flex items-center justify-center border border-transparent"
                              >
                                <Icon name="arrowUpRight" className="w-4 h-4" />
                              </a>
                              <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
                                <div className="bg-[#0f172a]/95 text-white text-[10px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap font-bold font-sans border border-white/10">
                                  مشاهده در سایت
                                </div>
                              </div>
                            </div>

                            {can('CONTENT_EDIT') && (
                              <div className="relative group/tooltip flex items-center justify-center z-20">
                                <Link 
                                  href={`/portal-entry-99/products/edit/${item.id}`}
                                  className="p-2.5 rounded-xl bg-white/5 hover:border-[#06b6d4] text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-all shadow-inner flex items-center justify-center border border-transparent"
                                >
                                  <Icon name="pencil" className="w-4 h-4" />
                                </Link>
                                <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
                                  <div className="bg-[#0f172a]/95 text-white text-[10px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap font-bold font-sans border border-white/10">
                                    ویرایش محتوا
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {can('CONTENT_DELETE') && (
                              <div className="relative group/tooltip flex items-center justify-center z-20">
                                <button 
                                  onClick={() => setDeleteModalItem(item)}
                                  className="p-2.5 rounded-xl bg-rose-500/10 border border-transparent hover:border-rose-500/50 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer shadow-inner flex items-center justify-center"
                                >
                                  <Icon name="trash" className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
                                  <div className="bg-[#0f172a]/95 text-rose-400 text-[10px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap font-bold font-sans border border-rose-500/30">
                                    حذف دائمی
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* پاپ‌آپ اختصاصی و شیشه‌ای تأیید حذف */}
      <AnimatePresence>
        {deleteModalItem && (
          <ModalPortal>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 select-none font-sans bg-black/70 backdrop-blur-md">
              <div 
                className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" 
                onClick={() => !isDeleting && setDeleteModalItem(null)} 
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl w-full max-w-sm p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden" 
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />

                <div className="flex flex-col items-center text-center mb-6 pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-transparent shadow-inner flex items-center justify-center text-rose-400 mb-4">
                    <Icon name="trash" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-sans">حذف دائمی محتوا</h3>
                  <p className="text-xs text-gray-300 leading-relaxed text-center font-light font-sans select-text">
                    آیا از حذف <span className="text-white font-bold">«{deleteModalItem.titleBase}»</span> اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={confirmDelete} 
                    disabled={isDeleting}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border border-transparent font-sans"
                  >
                    {isDeleting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'بله، حذف شود'
                    )}
                  </button>
                  <button 
                    onClick={() => setDeleteModalItem(null)} 
                    disabled={isDeleting}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 border border-transparent shadow-inner font-sans"
                  >
                    انصراف
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}