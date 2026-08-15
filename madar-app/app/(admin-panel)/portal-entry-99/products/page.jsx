'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getContents, deleteContent } from '@/app/actions/content';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// نگاشت نوع محتوا برای نمایش در جدول (رنگ و آیکون)
const TYPE_MAP = {
  PRODUCED: { label: 'تولیدی', icon: 'videoCamera', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  RAW: { label: 'خام', icon: 'fileText', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  TOOL: { label: 'ابزار', icon: 'setting', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  BLOG: { label: 'بلاگ', icon: 'browser', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
};

// نگاشت وضعیت محتوا
const STATUS_MAP = {
  PUBLISHED: { label: 'منتشر شده', dot: 'bg-emerald-500', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  DRAFT: { label: 'پیش‌نویس', dot: 'bg-gray-400', color: 'text-gray-400 border-white/10 bg-white/5' },
  ARCHIVED: { label: 'بایگانی', dot: 'bg-rose-500', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' }
};

export default function ProductsListPage() {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  // استیت‌های فیلتر و جستجو
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // دریافت اطلاعات با توجه به فیلترها
  const fetchContents = async () => {
    setIsLoading(true);
    const data = await getContents({ search: searchQuery, type: filterType, status: filterStatus });
    setContents(data || []);
    setIsLoading(false);
  };

  // هر بار که فیلترها تغییر کنند، دیتا دوباره گرفته می‌شود
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContents();
    }, 500); // 500ms تاخیر برای جلوگیری از درخواست‌های مکرر هنگام تایپ جستجو

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterType, filterStatus]);

  // عملیات حذف محتوا
  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این محتوا اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;
    
    setIsDeleting(id);
    const res = await deleteContent(id);
    if (res.success) {
      toast.success('محتوا با موفقیت حذف شد.');
      setContents(prev => prev.filter(c => c.id !== id));
    } else {
      toast.error(res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 font-sans text-right select-none">
      
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            مدیریت محتوا
          </h1>
          <p className="text-sm text-gray-400 font-light">فهرست تمامی محصولات، فایل‌ها و مقالات سایت.</p>
        </div>
        <Link 
          href="/portal-entry-99/products/create"
          className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shrink-0"
        >
          <Icon name="plus" className="w-4 h-4" /> افزودن محتوای جدید
        </Link>
      </div>

      {/* نوار فیلتر و جستجو (شیشه‌ای بر اساس گرافیک کلی1) */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="p-4 flex flex-col md:flex-row items-center gap-4 relative z-10">
          
          {/* باکس جستجو */}
          <div className="relative flex-1 w-full">
            <Icon name="search" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="جستجو در عنوان یا پیوند یکتا..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c16] border border-white/10 rounded-xl pr-12 pl-4 py-3 text-sm text-white focus:border-[#10b981] outline-none transition-all font-sans"
            />
          </div>

          {/* فیلتر نوع محتوا */}
          <div className="w-full md:w-48 shrink-0">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-[#10b981] outline-none cursor-pointer transition-all font-sans"
            >
              <option value="ALL">همه انواع محتوا</option>
              <option value="PRODUCED">محتوای تولیدی</option>
              <option value="RAW">محتوای خام</option>
              <option value="TOOL">ابزارها</option>
              <option value="BLOG">مقاله / بلاگ</option>
            </select>
          </div>

          {/* فیلتر وضعیت */}
          <div className="w-full md:w-48 shrink-0">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-[#10b981] outline-none cursor-pointer transition-all font-sans"
            >
              <option value="ALL">همه وضعیت‌ها</option>
              <option value="PUBLISHED">منتشر شده</option>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="ARCHIVED">بایگانی شده</option>
            </select>
          </div>

        </div>
      </div>

      {/* جدول نمایش دیتا (شیشه‌ای بر اساس گرافیک کلی1) */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-black/40 text-gray-400 font-bold border-b border-white/10">
              <tr>
                <th className="px-6 py-4 rounded-tr-2xl">عنوان محتوا</th>
                <th className="px-6 py-4">نوع</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">آمار بازدید</th>
                <th className="px-6 py-4 rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-sans">
                    در حال دریافت اطلاعات...
                  </td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-sans">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Icon name="browser" className="w-10 h-10 text-gray-600" />
                      هیچ محتوایی یافت نشد.
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {contents.map((item) => {
                    const typeConfig = TYPE_MAP[item.type] || { label: item.type, icon: 'fileText', color: 'text-gray-400 bg-white/5 border-white/10' };
                    const statusConfig = STATUS_MAP[item.status] || { label: item.status, dot: 'bg-gray-400', color: 'text-gray-400 border-white/10 bg-white/5' };
                    
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
                          <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {item.coverDesktop ? (
                              <img src={item.coverDesktop} alt={item.titleBase} className="w-full h-full object-cover opacity-80 group-hover/row:opacity-100 group-hover/row:scale-110 transition-all duration-300" />
                            ) : (
                              <Icon name="image" className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 max-w-xs md:max-w-md truncate">
                            <span className="text-white font-bold truncate">
                              {item.titleBase} {item.titleHighlight && <span className="text-[#10b981]">{item.titleHighlight}</span>}
                            </span>
                            <span className="text-xs text-gray-500 truncate dir-ltr text-left font-mono">/{item.slug}</span>
                          </div>
                        </td>

                        {/* نوع محتوا */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeConfig.color}`}>
                            <Icon name={typeConfig.icon} className="w-3.5 h-3.5 fill-current" />
                            {typeConfig.label}
                          </div>
                        </td>

                        {/* وضعیت */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                            {statusConfig.label}
                          </div>
                        </td>

                        {/* بازدید */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Icon name="eye" className="w-4 h-4 text-[#10b981]" />
                            <span className="font-sans font-bold">{item.viewCount ? item.viewCount.toLocaleString('fa-IR') : '۰'}</span>
                          </div>
                        </td>

                        {/* عملیات (ویرایش/حذف) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/portal-entry-99/products/edit/${item.id}`}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#06b6d4] text-gray-400 hover:text-[#06b6d4] transition-all"
                              title="ویرایش محتوا"
                            >
                              <Icon name="pencil" className="w-4 h-4" />
                            </Link>
                            
                            <button 
                              onClick={() => handleDelete(item.id)}
                              disabled={isDeleting === item.id}
                              className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 text-rose-500 transition-all disabled:opacity-50 cursor-pointer"
                              title="حذف دائمی"
                            >
                              {isDeleting === item.id ? (
                                <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                              ) : (
                                <Icon name="trash" className="w-4 h-4" />
                              )}
                            </button>
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

    </div>
  );
}