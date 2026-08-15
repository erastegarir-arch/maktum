'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcons, uploadIcon, deleteIcon } from '@/app/actions/icons';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function IconLibraryPage() {
  const router = useRouter();
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // استیت‌های مُدال آپلود
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newIconData, setNewIconData] = useState({ name: '', label: '', file: null });

  // استیت‌های مُدال نمایش
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // استیت‌های مُدال اختصاصی حذف
  const [deletingIcon, setDeletingIcon] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef(null);

  const loadIcons = async () => {
    setLoading(true);
    try {
      const data = await getIcons();
      setIcons(data || []);
    } catch (error) {
      toast.error('خطا در بارگذاری آیکون‌ها!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIcons(); }, []);

  // فیلتر کردن آیکون‌ها بر اساس سرچ (نام انگلیسی یا فارسی)
  const filteredIcons = icons.filter(ic => 
    ic.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (ic.label && ic.label.includes(searchTerm))
  );

  // انتخاب فایل و پر کردن خودکار شناسه انگلیسی
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      if (isSvg) {
        const autoSlug = file.name
          .replace(/\.svg$/i, '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');

        setNewIconData(prev => ({
          ...prev,
          file,
          name: prev.name ? prev.name : autoSlug
        }));
        setUploadError('');
      } else {
        const errorText = 'لطفاً فقط فایل با فرمت SVG انتخاب کنید.';
        setUploadError(errorText);
        toast.error(errorText);
      }
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setNewIconData({ name: '', label: '', file: null });
    setUploadError('');
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!newIconData.file || !newIconData.name) {
      const errorText = 'نام انگلیسی و فایل SVG الزامی است.';
      setUploadError(errorText);
      toast.error(errorText);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', newIconData.file);
    formData.append('name', newIconData.name);
    formData.append('label', newIconData.label);

    toast.promise(
      uploadIcon(formData),
      {
        loading: 'در حال آپلود آیکون...',
        success: (res) => {
          setUploading(false);
          if (res.success) {
            closeModal();
            loadIcons();
            router.refresh();
            return 'آیکون با موفقیت آپلود و ذخیره شد.';
          }
          setUploadError(res.error || 'خطا در آپلود آیکون');
          throw new Error(res.error || 'خطا در آپلود');
        },
        error: (err) => {
          setUploading(false);
          return err?.message || 'خطا در ثبت آیکون!';
        }
      }
    );
  };

  // تابع حذف قطعی پس از تایید در پاپ‌آپ
  const confirmDelete = async () => {
    if (!deletingIcon) return;
    setIsDeleting(true);
    
    const targetId = deletingIcon.id;

    toast.promise(
      deleteIcon(targetId),
      {
        loading: 'در حال حذف آیکون...',
        success: (res) => {
          setIsDeleting(false);
          if (res.success) {
            setDeletingIcon(null);
            setSelectedIcon(null);
            setIcons(prev => prev.filter(i => i.id !== targetId));
            router.refresh();
            return 'آیکون با موفقیت حذف شد.';
          }
          throw new Error(res.error || 'خطا در حذف');
        },
        error: (err) => {
          setIsDeleting(false);
          return err?.message || 'خطا در حذف آیکون!';
        }
      }
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('کد استفاده در حافظه کپی شد!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 font-sans text-right select-none">
      
      {/* هدر صفحه و جستجو بر اساس گرافیک کلی1 با تم سبز زمردی */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
      >
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت بالای هدر */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

        <div>
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            کتابخانه آیکون‌های SVG
          </h1>
          <p className="text-sm text-gray-400 font-light">آپلود و مدیریت آیکون‌های برداری برای استفاده داینامیک در سایت</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* باکس جستجو */}
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="جستجوی آیکون..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm text-white focus:border-[#10b981] outline-none transition-all placeholder:text-gray-500 font-medium"
            />
            <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 cursor-pointer"
          >
            <span className="text-xl leading-none">+</span>
            <span className="hidden sm:inline">آیکون جدید</span>
          </button>
        </div>
      </motion.div>

      {/* گرید آیکون‌ها بر اساس گرافیک کلی1 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-sans">در حال بارگذاری آیکون‌ها...</div>
      ) : filteredIcons.length === 0 ? (
        <div className="relative rounded-2xl border border-white/10 p-20 text-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
          <p className="text-gray-400 font-sans">هیچ آیکونی یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredIcons.map((icon, idx) => (
            <motion.div 
              key={icon.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              onClick={() => setSelectedIcon(icon)}
              className="group cursor-pointer relative rounded-xl border border-white/10 overflow-hidden aspect-square flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-lg"
            >
              {/* پس‌زمینه شیشه‌ای ایزوله */}
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-xl pointer-events-none -z-10" />

              {/* هاله هوور مجزا */}
              <div 
                className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.15), 0 10px 25px -5px rgba(16, 185, 129, 0.25)'
                }}
              />

              {/* نوار نوری بالای کارت آیکون */}
              <div 
                className="absolute top-0 inset-x-3 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ 
                  background: 'linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%)' 
                }}
              />

              <div 
                className="w-10 h-10 text-gray-300 group-hover:text-[#10b981] group-hover:scale-110 transition-all duration-300 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: icon.svgCode }}
              />
              <span className="mt-3 text-[10px] text-gray-400 group-hover:text-white transition-colors truncate w-full text-center dir-ltr font-mono">
                {icon.name}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* مُدال آپلود آیکون جدید منطبق بر گرافیک کلی1 */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-white/10 p-6 flex flex-col gap-6 text-right shadow-2xl overflow-hidden"
            >
              {/* پس‌زمینه شیشه‌ای ایزوله */}
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />

              {/* نوار نوری گرادینت بالای مدال */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />

              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <Icon name="plus" className="w-5 h-5 text-[#10b981]" />
                آپلود آیکون SVG
              </h3>
              
              <form onSubmit={submitUpload} className="space-y-4 relative z-10">
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">فایل SVG *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className={cn(
                      "w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                      newIconData.file ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/20 hover:border-[#10b981] bg-white/5'
                    )}
                  >
                    <input type="file" ref={fileInputRef} accept=".svg" onChange={handleFileChange} className="hidden" />
                    <span className={cn("text-sm font-medium", newIconData.file ? 'text-[#10b981]' : 'text-gray-400')}>
                      {newIconData.file ? `انتخاب شد: ${newIconData.file.name}` : 'کلیک برای انتخاب فایل SVG'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">شناسه انگلیسی (یکتا) *</label>
                  <input 
                    required 
                    type="text" 
                    value={newIconData.name} 
                    onChange={(e) => setNewIconData({...newIconData, name: e.target.value})} 
                    placeholder="مثال: arrow-right" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#10b981] dir-ltr text-left outline-none transition-colors font-mono" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">نام فارسی (برای جستجو)</label>
                  <input 
                    type="text" 
                    value={newIconData.label} 
                    onChange={(e) => setNewIconData({...newIconData, label: e.target.value})} 
                    placeholder="مثال: فلش راست" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#10b981] outline-none transition-colors" 
                  />
                </div>

                {uploadError && <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{uploadError}</p>}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-colors cursor-pointer">انصراف</button>
                  <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {uploading ? 'در حال آپلود...' : 'ذخیره آیکون'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مُدال پیش‌نمایش و جزئیات آیکون منطبق بر گرافیک کلی1 */}
      <AnimatePresence>
        {selectedIcon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedIcon(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 flex flex-col gap-6 text-right shadow-2xl overflow-hidden"
            >
              {/* پس‌زمینه شیشه‌ای ایزوله */}
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />

              {/* نوار نوری گرادینت بالای مدال */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />

              <div className="flex justify-between items-start border-b border-white/10 pb-4 relative z-10">
                <h3 className="text-lg font-bold text-white">جزئیات و استفاده از آیکون</h3>
                <button onClick={() => setSelectedIcon(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {/* پیش‌نمایش بزرگ */}
              <div className="w-full bg-white/5 rounded-xl border border-white/10 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/15 to-transparent blur-2xl"></div>
                
                <div 
                  className="w-28 h-28 text-white relative z-10 [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  dangerouslySetInnerHTML={{ __html: selectedIcon.svgCode }}
                />
              </div>

              {/* کدهای استفاده */}
              <div className="space-y-4 relative z-10">
                <div className="space-y-1 bg-black/40 p-4 rounded-xl border border-white/10 dir-ltr text-left">
                  <p className="text-xs text-gray-400 mb-1 font-sans">کد استفاده در کامپوننت‌ها:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-[#10b981] bg-white/5 p-2.5 rounded-lg break-all font-mono border border-white/5">
                      {`<Icon name="${selectedIcon.name}" />`}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(`<Icon name="${selectedIcon.name}" />`)}
                      className="p-2.5 bg-[#10b981] hover:bg-[#059669] rounded-lg transition-colors text-white font-bold text-xs shrink-0 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    >
                      {copied ? 'کپی شد!' : 'کپی'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-300 font-sans">
                  <span>شناسه: <strong className="text-white font-mono">{selectedIcon.name}</strong></span>
                  <span>فارسی: <strong className="text-white">{selectedIcon.label || 'ندارد'}</strong></span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10 relative z-10">
                <button 
                  onClick={() => setDeletingIcon(selectedIcon)}
                  className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                >
                  حذف دائم آیکون
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* پاپ‌آپ اختصاصی و مدرن تأیید حذف آیکون منطبق بر گرافیک کلی1 */}
      <AnimatePresence>
        {deletingIcon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setDeletingIcon(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl overflow-hidden"
            >
              {/* پس‌زمینه شیشه‌ای ایزوله */}
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

              {/* نوار نوری گرادینت بالای مدال حذف */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />

              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <Icon name="close" className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">حذف آیکون SVG</h3>
              <p className="text-sm text-gray-300 font-light mb-6 leading-relaxed">
                آیا از حذف آیکون <span className="text-rose-400 font-bold dir-ltr inline-block font-mono">«{deletingIcon.name}»</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
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
                  onClick={() => setDeletingIcon(null)}
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

    </div>
  );
}