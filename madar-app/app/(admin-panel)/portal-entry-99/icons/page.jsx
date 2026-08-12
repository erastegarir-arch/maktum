'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="max-w-7xl mx-auto space-y-6 pb-10 font-sans text-right">
      
      {/* هدر صفحه و جستجو */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">کتابخانه آیکون‌های SVG</h1>
          <p className="text-sm text-gray-400">آپلود و مدیریت آیکون‌های برداری برای استفاده داینامیک در سایت</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* باکس جستجو */}
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="جستجوی آیکون..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080c16] border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm text-white focus:border-[#06b6d4] outline-none transition-colors"
            />
            <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] shrink-0 cursor-pointer"
          >
            <span className="text-xl leading-none">+</span>
            <span className="hidden sm:inline">آیکون جدید</span>
          </button>
        </div>
      </div>

      {/* گرید آیکون‌ها */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-sans">در حال بارگذاری آیکون‌ها...</div>
      ) : filteredIcons.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <p className="text-gray-400 font-sans">هیچ آیکونی یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredIcons.map((icon) => (
            <div 
              key={icon.id} 
              onClick={() => setSelectedIcon(icon)}
              className="group cursor-pointer bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-[#06b6d4] transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] aspect-square flex flex-col items-center justify-center p-4 relative"
            >
              <div 
                className="w-10 h-10 text-gray-300 group-hover:text-[#06b6d4] transition-colors [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: icon.svgCode }}
              />
              <span className="mt-3 text-[10px] text-gray-400 truncate w-full text-center dir-ltr">
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* مُدال آپلود آیکون جدید */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-md" onClick={closeModal}></div>
          
          <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-right">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">آپلود آیکون SVG</h3>
            
            <form onSubmit={submitUpload} className="space-y-4">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">فایل SVG *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={cn(
                    "w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                    newIconData.file ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/20 hover:border-[#06b6d4] bg-white/5'
                  )}
                >
                  <input type="file" ref={fileInputRef} accept=".svg" onChange={handleFileChange} className="hidden" />
                  <span className={cn("text-sm", newIconData.file ? 'text-[#10b981]' : 'text-gray-400')}>
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
                  className="w-full bg-[#080c16] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#06b6d4] dir-ltr text-left outline-none transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">نام فارسی (برای جستجو)</label>
                <input 
                  type="text" 
                  value={newIconData.label} 
                  onChange={(e) => setNewIconData({...newIconData, label: e.target.value})} 
                  placeholder="مثال: فلش راست" 
                  className="w-full bg-[#080c16] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#06b6d4] outline-none transition-colors" 
                />
              </div>

              {uploadError && <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{uploadError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 transition-colors cursor-pointer">انصراف</button>
                <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 cursor-pointer">
                  {uploading ? 'در حال آپلود...' : 'ذخیره آیکون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مُدال پیش‌نمایش و جزئیات آیکون */}
      {selectedIcon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-md" onClick={() => setSelectedIcon(null)}></div>
          
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-right">
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">جزئیات و استفاده از آیکون</h3>
              <button onClick={() => setSelectedIcon(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* پیش‌نمایش بزرگ */}
            <div className="w-full bg-[#080c16] rounded-xl border border-white/5 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 to-[#06b6d4]/20 blur-2xl"></div>
              
              <div 
                className="w-32 h-32 text-white relative z-10 [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                dangerouslySetInnerHTML={{ __html: selectedIcon.svgCode }}
              />
            </div>

            {/* کدهای استفاده */}
            <div className="space-y-4">
              <div className="space-y-1 bg-black/30 p-4 rounded-xl border border-white/5 dir-ltr text-left">
                <p className="text-xs text-gray-500 mb-1 font-sans">کد استفاده در کامپوننت‌ها:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#06b6d4] bg-[#080c16] p-2 rounded-lg break-all font-mono">
                    {`<DynamicIcon name="${selectedIcon.name}" />`}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(`<DynamicIcon name="${selectedIcon.name}" />`)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-xs shrink-0 cursor-pointer"
                  >
                    {copied ? 'کپی شد!' : 'کپی'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 font-sans">
                <span>شناسه: {selectedIcon.name}</span>
                <span>فارسی: {selectedIcon.label || 'ندارد'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                onClick={() => setDeletingIcon(selectedIcon)}
                className="px-5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                حذف دائم آیکون
              </button>
            </div>

          </div>
        </div>
      )}

      {/* پاپ‌آپ اختصاصی و مدرن تأیید حذف آیکون */}
      {deletingIcon && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#080c16]/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative overflow-hidden text-right space-y-5">
            
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">حذف آیکون SVG</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                آیا از حذف آیکون <span className="text-rose-400 font-bold dir-ltr inline-block">«{deletingIcon.name}»</span> اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
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
                onClick={() => setDeletingIcon(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}