'use client';

import { useState, useEffect, useRef } from 'react';
import { getIcons, uploadIcon, deleteIcon } from '@/app/actions/icons';
import Icon from '@/app/components/Icon';

export default function IconLibraryPage() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // استیت‌های مُدال آپلود
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newIconData, setNewIconData] = useState({ name: '', label: '', file: null });

  // استیت‌های مُدال نمایش و حذف
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef(null);

  const loadIcons = async () => {
    setLoading(true);
    const data = await getIcons();
    setIcons(data);
    setLoading(false);
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
        // تبدیل نام فایل به شناسه استاندارد انگلیسی (حروف کوچک و خط‌تیره)
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
        setUploadError('لطفاً فقط فایل با فرمت SVG انتخاب کنید.');
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
      setUploadError('نام انگلیسی و فایل SVG الزامی است.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', newIconData.file);
    formData.append('name', newIconData.name);
    formData.append('label', newIconData.label);

    const res = await uploadIcon(formData);
    
    if (res.success) {
      closeModal();
      await loadIcons();
    } else {
      setUploadError(res.error);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این آیکون مطمئن هستید؟')) return;
    const res = await deleteIcon(id);
    if (res.success) {
      setSelectedIcon(null);
      setIcons(prev => prev.filter(i => i.id !== id));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      
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
        <div className="text-center py-20 text-gray-400">در حال بارگذاری آیکون‌ها...</div>
      ) : filteredIcons.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <p className="text-gray-400">هیچ آیکونی یافت نشد.</p>
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
          
          <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">آپلود آیکون SVG</h3>
            
            <form onSubmit={submitUpload} className="space-y-4">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">فایل SVG *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${newIconData.file ? 'border-[#10b981] bg-[#10b981]/10' : 'border-white/20 hover:border-[#06b6d4] bg-white/5'}`}
                >
                  <input type="file" ref={fileInputRef} accept=".svg" onChange={handleFileChange} className="hidden" />
                  <span className={`text-sm ${newIconData.file ? 'text-[#10b981]' : 'text-gray-400'}`}>
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
                  className="w-full bg-[#080c16] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#06b6d4] dir-ltr text-left outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">نام فارسی (برای جستجو)</label>
                <input 
                  type="text" 
                  value={newIconData.label} 
                  onChange={(e) => setNewIconData({...newIconData, label: e.target.value})} 
                  placeholder="مثال: فلش راست" 
                  className="w-full bg-[#080c16] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#06b6d4] outline-none" 
                />
              </div>

              {uploadError && <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg">{uploadError}</p>}

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
          
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
            
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
                onClick={() => handleDelete(selectedIcon.id)}
                className="px-5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                حذف دائم آیکون
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}