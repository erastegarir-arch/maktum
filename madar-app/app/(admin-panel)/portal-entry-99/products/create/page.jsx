'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContent, getTaxonomies } from '@/app/actions/content';
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import RichTextEditor from '@/app/components/RichTextEditor';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import MyDateTimePicker from '@/app/components/MyDateTimePicker';
import { useDateSettings } from '@/app/components/providers/DateSettingsContext';

// === نگاشت تم پویا بر اساس نوع محتوا ===
const THEMES = {
  PRODUCED: { color: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', gradientVia: 'via-rose-500', hoverBg: 'hover:bg-rose-500', hoverBorder: 'hover:border-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
  RAW: { color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]', border: 'border-[#fbbf24]', gradientVia: 'via-[#fbbf24]', hoverBg: 'hover:bg-[#fbbf24]', hoverBorder: 'hover:border-[#fbbf24]', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' },
  TOOL: { color: 'text-[#10b981]', bg: 'bg-[#10b981]', border: 'border-[#10b981]', gradientVia: 'via-[#10b981]', hoverBg: 'hover:bg-[#10b981]', hoverBorder: 'hover:border-[#10b981]', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
  BLOG: { color: 'text-[#b45309]', bg: 'bg-[#b45309]', border: 'border-[#b45309]', gradientVia: 'via-[#b45309]', hoverBg: 'hover:bg-[#b45309]', hoverBorder: 'hover:border-[#b45309]', glow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]' }
};

// ================= کامپوننت جستجوی پویا (Autocomplete/Select) =================
const DynamicSelector = ({ options, selectedIds, onChange, placeholder, activeTheme, label }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(query.toLowerCase()) && !selectedIds.includes(opt.id)
  );

  const handleSelect = (id) => {
    onChange([...selectedIds, id]);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (id) => {
    onChange(selectedIds.filter(selId => selId !== id));
  };

  return (
    <div className="space-y-2 relative font-sans">
      <label className="text-xs text-gray-300 font-bold pl-1">{label}</label>
      
      {/* بج‌های انتخاب شده */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white/5 border border-transparent rounded-xl shadow-inner">
          {selectedIds.map(id => {
            const item = options.find(o => o.id === id);
            return item ? (
              <span key={id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white shadow-inner border border-transparent ${activeTheme.glow}`}>
                {item.name}
                <button type="button" onClick={() => handleRemove(id)} className="text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"><Icon name="close" className="w-3.5 h-3.5" /></button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* باکس سرچ */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white/10 rounded-xl p-3.5 text-white text-sm focus:bg-white/20 focus:border-white/30 border border-transparent placeholder:text-white/40 outline-none transition-all shadow-inner font-sans relative z-20"
        />
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-20" />
        
        {/* لیست کشویی (Dropdown) - اصلاح شد تا کدر باشد و روی متن‌های زیرین سایه نیندازد */}
        <AnimatePresence>
          {isOpen && query.trim() !== '' && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 w-full mt-2 bg-[#050810] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-48 overflow-y-auto custom-scrollbar font-sans"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-right px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-2`}
                  >
                    <Icon name="plus" className={`w-3.5 h-3.5 ${activeTheme.color}`} /> {opt.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center font-light">موردی یافت نشد.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

export default function CreateContentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [taxonomies, setTaxonomies] = useState([]);

  const { allowCommentsGlobally, isLoadingSettings } = useDateSettings();

  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); 
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(null); 
  const [activeFileIconIndex, setActiveFileIconIndex] = useState(null); 
  const [editorInstance, setEditorInstance] = useState(null);

  const [type, setType] = useState('PRODUCED'); 
  const activeTheme = THEMES[type] || THEMES.PRODUCED;

  const [status, setStatus] = useState('DRAFT'); 
  const [titleBase, setTitleBase] = useState('');
  const [titleHighlight, setTitleHighlight] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverDesktop, setCoverDesktop] = useState('');
  const [coverMobile, setCoverMobile] = useState('');
  
  const [publishedAt, setPublishedAt] = useState(new Date());
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDescription] = useState('');

  const [readTime, setReadTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  
  const [allowComments, setAllowComments] = useState(allowCommentsGlobally);
  
  const [showAgeRating, setShowAgeRating] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showReadTime, setShowReadTime] = useState(true);
  const [showViews, setShowViews] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [isDownloadActive, setIsDownloadActive] = useState(true);

  const [body, setBody] = useState(''); 
  
  const [lead, setLead] = useState('');

  const [formats, setFormats] = useState([]); 
  const [customFormat, setCustomFormat] = useState(''); 
  
  const [fileSpecs, setFileSpecs] = useState([]); 
  const [changelog, setChangelog] = useState([]); 
  const [downloadLinks, setDownloadLinks] = useState([]); 
  const [previewGallery, setPreviewGallery] = useState([]); 

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const taxData = await getTaxonomies();
      setTaxonomies(taxData || []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoadingSettings) {
      setAllowComments(allowCommentsGlobally);
    }
  }, [allowCommentsGlobally, isLoadingSettings]);

  const addItem = (setter, template) => setter(prev => [...prev, { id: Date.now().toString(), ...template }]);
  const prependItem = (setter, template) => setter(prev => [{ id: Date.now().toString(), ...template }, ...prev]);
  const updateItem = (setter, id, field, value) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));
  const toggleArrayItem = (setter, item) => setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const handleOpenMediaForEditor = (editor) => {
    setEditorInstance(editor);
    setMediaPickerTarget('editor');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!titleBase && !titleHighlight) return toast.error('حداقل یکی از بخش‌های عنوان باید وارد شود!');
    if (!slug) return toast.error('پیوند یکتا (Slug) الزامی است!');
    
    setIsSaving(true);
    
    let finalFormats = [...formats];
    if (customFormat.trim() !== '') finalFormats.push(`سایر: ${customFormat.trim()}`);

    const payload = {
      titleBase, titleHighlight, subtitle, slug, type, status,
      coverDesktop, coverMobile, publishedAt, updatedAt, readTime, ageRating, allowComments, body,
      metaTitle, metaDesc,
      displaySettings: JSON.stringify({ showAgeRating, showDate, showReadTime, showViews, showAuthor, isDownloadActive }),
      lead: type === 'BLOG' ? lead : null,
      formats: type !== 'BLOG' ? JSON.stringify(finalFormats) : null,
      fileSpecs: type !== 'BLOG' ? JSON.stringify(fileSpecs) : null,
      changelog: type !== 'BLOG' ? JSON.stringify(changelog) : null,
      downloadLinks: type !== 'BLOG' ? JSON.stringify(downloadLinks) : null,
      previewGallery: type !== 'BLOG' ? JSON.stringify(previewGallery) : null,
      categoryIds: selectedCategories,
      creatorIds: selectedCreators,
      tagIds: selectedTags
    };

    const res = await createContent(payload);
    
    if (res.success) {
      toast.success('محتوا با موفقیت ثبت شد!');
      router.push('/portal-entry-99/products'); 
    } else {
      toast.error(res.error || 'خطا در ثبت اطلاعات.');
    }
    setIsSaving(false);
  };

  const cats = taxonomies.filter(t => t.type === 'CATEGORY');
  const creators = taxonomies.filter(t => t.type === 'CREATOR');
  const tags = taxonomies.filter(t => t.type === 'HASHTAG');

  // ارور هیدریشن در خط بعدی (حذف کلاس اضافی z-10) برطرف شد
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 font-sans text-right select-none relative">
      
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.bg} ${activeTheme.glow}`}></span>
            ایجاد محتوای جدید
          </h1>
          <p className="text-sm text-gray-400 font-light">اطلاعات محتوا یا مقاله خود را تکمیل کنید.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-white/5 border border-transparent shadow-inner hover:bg-white/10 text-white text-sm font-bold transition-all cursor-pointer">
            انصراف
          </button>
          <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2.5 rounded-xl ${activeTheme.bg} border border-transparent text-white text-sm font-bold ${activeTheme.glow} transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 hover:brightness-110`}>
            <Icon name="checkCircle" className="w-4 h-4" /> {isSaving ? 'در حال ثبت...' : 'ذخیره'}
          </button>
        </div>
      </div>

      {/* انتخابگر نوع محتوا */}
      <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeIn_0.4s_ease-out] border border-transparent">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

        <div className="p-3 flex flex-wrap md:flex-nowrap gap-2 relative z-10">
          {[
            { id: 'RAW', label: 'محتوای خام', icon: 'footage', themeObj: THEMES.RAW },
            { id: 'PRODUCED', label: 'محتوای تولیدی', icon: 'product', themeObj: THEMES.PRODUCED },
            { id: 'TOOL', label: 'ابزارها', icon: 'pen-nib', themeObj: THEMES.TOOL },
            { id: 'BLOG', label: 'بلاگ', icon: 'blog', themeObj: THEMES.BLOG }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                type === t.id ? `bg-white/10 ${t.themeObj.color} border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]` : 'text-gray-400 hover:bg-white/10 hover:text-white border-transparent'
              }`}
            >
              <Icon name={t.icon} className="w-5 h-5 fill-current" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
        
        {/* ================= ستون راست (اصلی) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* باکس اطلاعات پایه */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <div className="p-6 md:p-8 space-y-5 relative z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Icon name="fileText" className={`w-5 h-5 ${activeTheme.color}`} /> اطلاعات پایه
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">بخش اول عنوان (سفید)</label>
                  <input type="text" value={titleBase} onChange={e => setTitleBase(e.target.value)} placeholder="مثلاً: بخش اول" className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none transition-all font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold pl-1">بخش دوم عنوان (رنگی - اختیاری)</label>
                  <input type="text" value={titleHighlight} onChange={e => setTitleHighlight(e.target.value)} placeholder="مثلاً: بخش دوم" className={`w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 ${activeTheme.color} text-sm focus:border focus:bg-white/20 outline-none transition-all font-bold placeholder:text-white/40 font-sans`} style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">زیرعنوان (توضیح کوتاه)</label>
                <textarea rows="2" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="توضیح کوتاه و جذابی برای نمایش زیر عنوان بنویسید..." className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none resize-none transition-all font-light text-justify" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold flex items-center justify-between pl-1">
                  <span>پیوند یکتا (Slug) انگلیسی</span>
                  <button type="button" className={`text-[10px] ${activeTheme.color} hover:underline font-bold cursor-pointer font-sans`} onClick={() => setSlug((titleBase + ' ' + titleHighlight).trim().replace(/\s+/g, '-').toLowerCase())}>تبدیل خودکار از عنوان</button>
                </label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} placeholder="my-custom-content-slug" className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none dir-ltr text-left transition-all font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>
          </div>

          {/* باکس سئو */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <div className="p-6 md:p-8 space-y-5 relative z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Icon name="search" className={`w-5 h-5 ${activeTheme.color}`} /> تنظیمات سئو (SEO Meta)
              </h2>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold flex justify-between pl-1">عنوان سئو (Meta Title) <span className="font-sans text-[10px] text-gray-500">{metaTitle.length} / 60</span></label>
                <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="عنوان جذاب برای موتورهای جستجو..." className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none transition-all font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold flex justify-between pl-1">توضیحات سئو (Meta Description) <span className="font-sans text-[10px] text-gray-500">{metaDesc.length} / 160</span></label>
                <textarea rows="3" value={metaDesc} onChange={e => setMetaDescription(e.target.value)} placeholder="چکیده‌ای که در نتایج گوگل نمایش داده می‌شود..." className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none resize-none transition-all text-justify font-light" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}></textarea>
              </div>
            </div>
          </div>

          {/* باکس متن اصلی / ادیتور */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <div className="p-6 md:p-8 space-y-5 relative z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Icon name="browser" className={`w-5 h-5 ${activeTheme.color}`} /> 
                {type === 'BLOG' ? 'محتوای متنی مقاله' : 'توضیحات و معرفی (Editor)'}
              </h2>

              {type === 'BLOG' && (
                <div className="space-y-2 mb-6">
                  <label className="text-xs text-gray-300 font-bold pl-1">لید خبر / چکیده برجسته</label>
                  <textarea rows="3" value={lead} onChange={e => setLead(e.target.value)} placeholder="پاراگراف جذابی که به عنوان مقدمه در ابتدای مقاله با استایل متفاوت نمایش داده می‌شود..." className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-4 text-white placeholder:text-white/40 text-sm focus:border focus:bg-white/20 outline-none resize-none transition-all font-light text-justify" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}></textarea>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">متن اصلی</label>
                <RichTextEditor 
                  value={body} 
                  onChange={setBody} 
                  activeTheme={activeTheme}
                  onOpenMedia={handleOpenMediaForEditor} 
                  placeholder="توضیحات و معرفی محتوا را اینجا بنویسید..."
                />
              </div>
            </div>
          </div>

          {/* ================= بخش‌های اختصاصی محصولات ================= */}
          {type !== 'BLOG' && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* گالری پیش‌نمایش محتوا */}
                <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="playCircle" className={`w-5 h-5 ${activeTheme.color}`} /> گالری پیش‌نمایش
                      </h2>
                      <button type="button" onClick={() => addItem(setPreviewGallery, { type: 'video', url: '', desc: '' })} className={`text-xs bg-white/5 border border-transparent shadow-inner hover:bg-white/10 ${activeTheme.color} px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer`}>+ افزودن مدیا</button>
                    </div>
                    
                    <div className="space-y-4">
                      {previewGallery.map((item) => (
                        <div key={item.id} className="p-5 bg-white/5 border border-transparent shadow-inner rounded-xl relative space-y-3">
                          <button type="button" onClick={() => removeItem(setPreviewGallery, item.id)} className="absolute top-2 left-2 p-1.5 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          
                          <div className="flex gap-4 items-start pr-6">
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400 font-bold pl-1">نوع</label>
                              <select value={item.type} onChange={(e) => updateItem(setPreviewGallery, item.id, 'type', e.target.value)} className="w-24 bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer focus:border focus:bg-white/20 font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                <option value="video" className="bg-[#0b0f19]">ویدیو</option>
                                <option value="image" className="bg-[#0b0f19]">تصویر</option>
                                <option value="audio" className="bg-[#0b0f19]">صوت</option>
                              </select>
                            </div>
                            
                            <div className="flex-1 space-y-1">
                              <label className="text-[10px] text-gray-400 font-bold pl-1">لینک از کتابخانه رسانه</label>
                              <div className="flex items-center gap-2">
                                <input type="text" value={item.url} readOnly placeholder="آدرس فایل..." className="w-full bg-black/30 border border-transparent shadow-inner rounded-lg p-2.5 text-xs text-gray-400 placeholder:text-white/40 outline-none dir-ltr text-left font-sans" />
                                <button type="button" onClick={() => { setMediaPickerTarget('gallery'); setActiveGalleryIndex(item.id); }} className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${activeTheme.bg} hover:brightness-110 shrink-0 border border-transparent`}>انتخاب</button>
                              </div>
                            </div>
                          </div>
                          <input type="text" placeholder="یک خط توضیح درباره این پیش‌نمایش بنویسید..." value={item.desc} onChange={e => updateItem(setPreviewGallery, item.id, 'desc', e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2 text-xs text-white placeholder:text-white/40 outline-none font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                        </div>
                      ))}
                      {previewGallery.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">هیچ پیش‌نمایشی اضافه نشده است.</p>}
                    </div>
                  </div>
                </div>

                {/* اطلاعات فایل‌ها */}
                <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="hardDrives" className={`w-5 h-5 ${activeTheme.color}`} /> مشخصات فایل‌ها
                      </h2>
                      <button type="button" onClick={() => addItem(setFileSpecs, { label: '', value: '', iconUrl: '' })} className={`text-xs bg-white/5 border border-transparent shadow-inner hover:bg-white/10 ${activeTheme.color} px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer`}>+ افزودن مشخصه</button>
                    </div>
                    <div className="space-y-3">
                      {fileSpecs.map(spec => (
                        <div key={spec.id} className="flex items-center gap-3 p-3 bg-white/5 border border-transparent shadow-inner rounded-xl">
                          <button type="button" onClick={() => { setMediaPickerTarget('fileIcon'); setActiveFileIconIndex(spec.id); }} className="w-10 h-10 shrink-0 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer overflow-hidden shadow-inner">
                            {spec.iconUrl ? <img src={spec.iconUrl} alt="icon" className="w-6 h-6 object-contain" /> : <Icon name="plus" className="w-4 h-4 text-gray-500" />}
                          </button>
                          <input type="text" placeholder="عنوان (مثال: کیفیت)" value={spec.label} onChange={e => updateItem(setFileSpecs, spec.id, 'label', e.target.value)} className="w-1/3 bg-transparent text-xs text-white placeholder:text-white/40 outline-none px-2 border-l border-white/10 font-sans" />
                          <input type="text" placeholder="مقدار (مثال: 4K UHD)" value={spec.value} onChange={e => updateItem(setFileSpecs, spec.id, 'value', e.target.value)} className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none px-2 font-sans" />
                          <button type="button" onClick={() => removeItem(setFileSpecs, spec.id)} className="p-2 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {fileSpecs.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">موردی ثبت نشده است.</p>}
                    </div>
                  </div>
                </div>

                {/* لینک‌های دانلود */}
                <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="download" className={`w-5 h-5 ${activeTheme.color}`} /> فایل‌های اصلی (لینک دانلود)
                      </h2>
                      <button type="button" onClick={() => addItem(setDownloadLinks, { title: '', desc: '', format: '', url: '' })} className={`text-xs bg-white/5 border border-transparent shadow-inner hover:bg-white/10 ${activeTheme.color} px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer`}>+ لینک جدید</button>
                    </div>
                    
                    <div className="space-y-4">
                      {downloadLinks.map(dl => (
                        <div key={dl.id} className="p-5 bg-white/5 border border-transparent shadow-inner rounded-xl relative space-y-4">
                          <button type="button" onClick={() => removeItem(setDownloadLinks, dl.id)} className="absolute top-2 left-2 p-1.5 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                            <input type="text" placeholder="عنوان فایل (مثال: مستند کامل)" value={dl.title} onChange={e => updateItem(setDownloadLinks, dl.id, 'title', e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-sm text-white placeholder:text-white/40 outline-none font-bold transition-all" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            <input type="text" placeholder="فرمت/کیفیت (مثال: MP4 - 1080p)" value={dl.format} onChange={e => updateItem(setDownloadLinks, dl.id, 'format', e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-xs text-white placeholder:text-white/40 outline-none font-sans transition-all" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            <input type="text" placeholder="توضیحات (مثال: بدون حذفیات - مناسب پژوهش)" value={dl.desc} onChange={e => updateItem(setDownloadLinks, dl.id, 'desc', e.target.value)} className="col-span-1 md:col-span-2 bg-transparent border-b border-white/10 pb-2 text-xs text-white placeholder:text-white/40 outline-none font-light transition-all" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            <input type="text" placeholder="لینک دانلود مستقیم (URL)" value={dl.url} onChange={e => updateItem(setDownloadLinks, dl.id, 'url', e.target.value)} className="col-span-1 md:col-span-2 bg-white/10 border border-white/10 rounded-lg p-3 text-xs text-blue-300 placeholder:text-white/40 dir-ltr text-left outline-none font-sans shadow-inner focus:border-blue-400 focus:bg-white/20 transition-all" />
                          </div>
                        </div>
                      ))}
                      {downloadLinks.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">هیچ لینکی اضافه نشده است.</p>}
                    </div>
                  </div>
                </div>

                {/* تاریخچه آپدیت‌ها */}
                <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="update" className={`w-5 h-5 ${activeTheme.color}`} /> تاریخچه به‌روزرسانی‌ها
                      </h2>
                      <button type="button" onClick={() => prependItem(setChangelog, { version: '', date: '', title: '', desc: '' })} className={`text-xs bg-white/5 border border-transparent shadow-inner hover:bg-white/10 ${activeTheme.color} px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer`}>+ آپدیت جدید</button>
                    </div>
                    
                    <div className="space-y-4 relative pl-4">
                      <div className="absolute right-3 top-2 bottom-2 w-0.5 bg-white/10 z-0"></div>
                      
                      {changelog.map((log, index) => (
                        <div key={log.id} className="relative z-10 pl-2 pr-8 bg-white/5 border border-transparent rounded-xl p-5 shadow-inner">
                          <div className={`absolute right-1.5 top-5 w-3 h-3 rounded-full ${index === 0 ? activeTheme.bg : 'bg-gray-600'} border-2 border-[#050810] z-10`}></div>
                          <button type="button" onClick={() => removeItem(setChangelog, log.id)} className="absolute top-2 left-2 p-1 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 pr-2">
                            <input type="text" placeholder="ورژن (مثال: v1.2)" value={log.version} onChange={e => updateItem(setChangelog, log.id, 'version', e.target.value)} className="bg-white/10 border border-transparent shadow-inner focus:border-white/30 rounded-md px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none font-sans text-center w-28 transition-all" />
                            <input type="text" placeholder="تاریخ شمسی" value={log.date} onChange={e => updateItem(setChangelog, log.id, 'date', e.target.value)} className="bg-transparent border-b border-white/10 text-xs text-white placeholder:text-white/40 outline-none text-right font-sans transition-all focus:border-white/40" />
                          </div>
                          <input type="text" placeholder="عنوان آپدیت (مهم)" value={log.title} onChange={e => updateItem(setChangelog, log.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2 text-sm font-bold text-white placeholder:text-white/40 outline-none mb-4 font-sans transition-all focus:border-white/40" />
                          <textarea rows="3" placeholder="توضیحات تکمیلی... (هر خط با زدن دکمه Enter یک نقطه بولت در سایت محسوب می‌شود)" value={log.desc} onChange={e => updateItem(setChangelog, log.id, 'desc', e.target.value)} className="w-full bg-transparent text-xs text-white placeholder:text-white/40 outline-none resize-none leading-relaxed font-light text-justify transition-all"></textarea>
                        </div>
                      ))}
                      {changelog.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">هیچ آپدیتی ثبت نشده است.</p>}
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ================= ستون چپ (تنظیمات سایدبار) ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* انتشار و تنظیمات نمایش */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-hidden border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <div className="p-6 space-y-6 relative z-10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">وضعیت و نمایش</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold pl-1">وضعیت انتشار</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3 text-sm text-white outline-none cursor-pointer focus:border focus:bg-white/20 transition-all font-sans">
                  <option value="DRAFT" className="bg-[#0b0f19]">پیش‌نویس (عدم نمایش در سایت)</option>
                  <option value="PUBLISHED" className="bg-[#0b0f19]">منتشر شده (عمومی)</option>
                  <option value="ARCHIVED" className="bg-[#0b0f19]">بایگانی شده (فقط آرشیو)</option>
                </select>
              </div>

              {/* بخش تاریخ ایجاد و آخرین ویرایش */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <label className="text-[10px] text-gray-400 font-bold block pl-1">تاریخ ایجاد</label>
                  <MyDateTimePicker
                    value={publishedAt}
                    onChange={setPublishedAt}
                    activeTheme={activeTheme}
                    inputClass="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 focus:border focus:bg-white/20 outline-none transition-all font-sans dir-ltr text-right"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-[10px] text-gray-400 font-bold block pl-1">آخرین ویرایش</label>
                  <MyDateTimePicker
                    value={updatedAt}
                    onChange={setUpdatedAt}
                    activeTheme={activeTheme}
                    inputClass="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 focus:border focus:bg-white/20 outline-none transition-all font-sans dir-ltr text-right"
                  />
                </div>
              </div>

              {/* تاگل‌های نمایش */}
              <div className="space-y-4 pt-5 border-t border-white/10">
                <label className="text-[10px] text-[#06b6d4] uppercase font-bold mb-2 block">تاگل‌های نمایش در سایت</label>
                
                <div className="bg-white/5 border border-transparent shadow-inner rounded-2xl p-4 space-y-3">
                  {[
                    { label: 'نمایش تاریخ', state: showDate, setter: setShowDate },
                    { label: 'نمایش زمان مطالعه', state: showReadTime, setter: setShowReadTime },
                    { label: 'نمایش آمار بازدید', state: showViews, setter: setShowViews },
                    { label: 'نمایش رده‌بندی سنی', state: showAgeRating, setter: setShowAgeRating },
                    { label: `نمایش نام ${type === 'BLOG' ? 'نویسنده' : 'تهیه‌کننده'}`, state: showAuthor, setter: setShowAuthor }
                  ].map((toggle, idx) => (
                    <label key={idx} className="flex items-center justify-between cursor-pointer group/toggle">
                      <span className="text-xs text-gray-300 group-hover/toggle:text-white transition-colors">{toggle.label}</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent ${toggle.state ? `${activeTheme.bg} shadow-md` : 'bg-black/40 shadow-inner'}`}>
                        {toggle.state && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={toggle.state} onChange={(e) => toggle.setter(e.target.checked)} />
                    </label>
                  ))}

                  {/* تاگل نظرات - همگام‌سازی شده با کانتکست */}
                  <label className="flex items-center justify-between cursor-pointer group/toggle border-t border-white/10 pt-3 mt-1">
                    <span className="text-xs text-[#10b981] font-bold">بخش نظرات فعال باشد؟</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent ${allowComments ? `bg-[#10b981] shadow-md` : 'bg-black/40 shadow-inner'}`}>
                      {allowComments && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                  </label>
                  
                  {type !== 'BLOG' && (
                    <label className="flex items-center justify-between cursor-pointer group/toggle border-t border-white/10 pt-3 mt-1">
                      <span className="text-xs text-[#06b6d4] font-bold">لینک‌های دانلود فعال باشند؟</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent ${isDownloadActive ? `bg-[#06b6d4] shadow-md` : 'bg-black/40 shadow-inner'}`}>
                        {isDownloadActive && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={isDownloadActive} onChange={(e) => setIsDownloadActive(e.target.checked)} />
                    </label>
                  )}
                </div>
              </div>

              {/* مقادیر دستی متادیتا */}
              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold text-center block">زمان مطالعه (دقیقه)</label>
                  <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="مثال: ۱۲" className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3 text-sm text-white placeholder:text-white/40 text-center outline-none focus:border focus:bg-white/20 transition-all font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold text-center block">رده سنی</label>
                  <input type="text" value={ageRating} onChange={e => setAgeRating(e.target.value)} placeholder="مثال: +۷" className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3 text-sm text-white placeholder:text-white/40 text-center outline-none dir-ltr font-bold focus:border focus:bg-white/20 transition-all font-sans" style={{ '--tw-ring-color': activeTheme.color }} onFocus={e => e.target.style.borderColor = activeTheme.color} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

            </div>
          </div>

          {/* طبقه‌بندی‌ها */}
          <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group overflow-visible border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10 rounded-3xl" />
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

            <div className="p-6 space-y-7 relative z-10">
              
              <DynamicSelector 
                label={type === 'BLOG' ? 'نویسندگان مقاله' : 'تهیه‌کنندگان مستند'}
                options={creators} 
                selectedIds={selectedCreators} 
                onChange={setSelectedCreators} 
                placeholder="تایپ کنید (مثال: استاد...)"
                activeTheme={activeTheme}
              />

              <div className="h-px bg-white/10 w-full" />

              <DynamicSelector 
                label="دسته‌بندی اصلی"
                options={cats} 
                selectedIds={selectedCategories} 
                onChange={setSelectedCategories} 
                placeholder="تایپ کنید (مثال: تاریخ...)"
                activeTheme={activeTheme}
              />

              <div className="h-px bg-white/10 w-full" />

              <DynamicSelector 
                label="هشتگ‌ها و برچسب‌ها"
                options={tags} 
                selectedIds={selectedTags} 
                onChange={setSelectedTags} 
                placeholder="تایپ کنید (مثال: #معماری...)"
                activeTheme={activeTheme}
              />

            </div>
          </div>
        </div>
      </div>

      {/* پاپ آپ مودال کتابخانه رسانه */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[30] flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl font-sans"
            onClick={() => setMediaPickerTarget(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl h-[90vh] bg-[#0b0f19]/90 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col border border-transparent"
            >
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none`} />
              
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent relative z-20">
                <h3 className={`font-bold flex items-center gap-2 ${activeTheme.text}`}><Icon name="image" className="w-5 h-5" /> انتخاب فایل از رسانه</h3>
                <button type="button" onClick={() => setMediaPickerTarget(null)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer border border-transparent shadow-inner">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar relative z-10">
                <MediaLibraryPage
                  isPickerMode={true}
                  onSelectMedia={(media) => {
                    if (mediaPickerTarget === 'desktop') setCoverDesktop(media.url);
                    if (mediaPickerTarget === 'mobile') setCoverMobile(media.url);
                    if (mediaPickerTarget === 'gallery' && activeGalleryIndex) {
                      updateItem(setPreviewGallery, activeGalleryIndex, 'url', media.url);
                    }
                    if (mediaPickerTarget === 'fileIcon' && activeFileIconIndex) {
                      updateItem(setFileSpecs, activeFileIconIndex, 'iconUrl', media.url);
                    }
                    if (mediaPickerTarget === 'editor' && editorInstance) {
                      if (media.type?.includes('video')) {
                        editorInstance.commands.insertContent(`<video controls src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;"></video>`);
                      } else if (media.type?.includes('audio')) {
                        editorInstance.commands.insertContent(`<audio controls src="${media.url}" style="width:100%; margin: 10px 0;"></audio>`);
                      } else {
                        editorInstance.commands.insertContent(`<img src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;" alt="Media" />`);
                      }
                    }

                    setMediaPickerTarget(null);
                    setActiveGalleryIndex(null);
                    setActiveFileIconIndex(null);
                    setEditorInstance(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}