// app/(admin-panel)/portal-entry-99/products/create/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContent, getTaxonomies } from '@/app/actions/content';
// ✅ پاکسازی:getSetting دیگر اینجا نیاز نیست، کامپوننت جدید خودش هندل می‌کند.
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import RichTextEditor from '@/app/components/RichTextEditor';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ پاکسازی بنیادین: تمام اینپورت‌های سنگین قدیمی حذف شدند.

// ✅ گام جدید و استاندارد: استفاده از کامپوننت نهایی تقویم (فقط تاریخ - بدون ساعت)
import MyDateTimePicker from '@/app/components/MyDateTimePicker';

// ✅ گام جدید: استفاده از هوک کانتکست سراسری (برای صفحه تنظیمات شما)
import { useDateSettings } from '@/app/components/providers/DateSettingsContext';

// === نگاشت تم پویا بر اساس نوع محتوا (بدون تغییر) ===
const THEMES = {
 PRODUCED: { color: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', gradientVia: 'via-rose-500', hoverBg: 'hover:bg-rose-500', hoverBorder: 'hover:border-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
 RAW: { color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]', border: 'border-[#fbbf24]', gradientVia: 'via-[#fbbf24]', hoverBg: 'hover:bg-[#fbbf24]', hoverBorder: 'hover:border-[#fbbf24]', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' },
 TOOL: { color: 'text-[#10b981]', bg: 'bg-[#10b981]', border: 'border-[#10b981]', gradientVia: 'via-[#10b981]', hoverBg: 'hover:bg-[#10b981]', hoverBorder: 'hover:border-[#10b981]', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
 BLOG: { color: 'text-[#b45309]', bg: 'bg-[#b45309]', border: 'border-[#b45309]', gradientVia: 'via-[#b45309]', hoverBg: 'hover:bg-[#b45309]', hoverBorder: 'hover:border-[#b45309]', glow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]' }
};

// ================= کامپوننت جستجوی پویا (Autocomplete/Select) (بدون تغییر) =================
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
     <label className="text-xs text-gray-300 font-bold">{label}</label>
     
     {/* بج‌های انتخاب شده */}
     {selectedIds.length > 0 && (
       <div className="flex flex-wrap gap-2 mb-2 p-2 bg-[#080c16] rounded-xl border border-white/5 shadow-inner">
         {selectedIds.map(id => {
           const item = options.find(o => o.id === id);
           return item ? (
             <span key={id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-white ${activeTheme.glow}`}>
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
         className={`w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none transition-colors shadow-inner font-sans`}
       />
       <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
     </div>

     {/* لیست کشویی (Dropdown) */}
     <AnimatePresence>
       {isOpen && query.trim() !== '' && (
         <motion.div 
           initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
           className="absolute z-50 w-full mt-1 bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar font-sans"
         >
           {filteredOptions.length > 0 ? (
             filteredOptions.map(opt => (
               <button
                 key={opt.id}
                 type="button"
                 onClick={() => handleSelect(opt.id)}
                 className={`w-full text-right px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-2`}
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
     {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
   </div>
 );
};

// ================= پاکسازی بنیادین: کامپوننت CustomDateInput قدیمی کلاً حذف شد =================

export default function CreateContentPage() {
 const router = useRouter();
 const [isSaving, setIsSaving] = useState(false);
 const [taxonomies, setTaxonomies] = useState([]);

 // ✅ گام جدید: دریافت تنظیمات کانتکست سراسری (برای مثال، تاگل نظرات)
 const { allowCommentsGlobally, isLoadingSettings } = useDateSettings();

 // مودال انتخابگر تصویر/رسانه (بدون تغییر)
 const [mediaPickerTarget, setMediaPickerTarget] = useState(null); 
 const [activeGalleryIndex, setActiveGalleryIndex] = useState(null); 
 const [activeFileIconIndex, setActiveFileIconIndex] = useState(null); 
 const [editorInstance, setEditorInstance] = useState(null);

 // ================= استیت‌های مشترک (بدون تغییر) =================
 const [type, setType] = useState('PRODUCED'); 
 const activeTheme = THEMES[type] || THEMES.PRODUCED;

 const [status, setStatus] = useState('DRAFT'); 
 const [titleBase, setTitleBase] = useState('');
 const [titleHighlight, setTitleHighlight] = useState('');
 const [subtitle, setSubtitle] = useState('');
 const [slug, setSlug] = useState('');
 const [coverDesktop, setCoverDesktop] = useState('');
 const [coverMobile, setCoverMobile] = useState('');
 
 // تاریخ‌های مستقل ایجاد و آخرین ویرایش (بدون تغییر)
 const [publishedAt, setPublishedAt] = useState(new Date());
 const [updatedAt, setUpdatedAt] = useState(new Date());

 // ✅ پاکسازی بنیادین: استیتdateSettings کلاً حذف شد -> هیچ اعصاب‌خوردی ندارد.
 
 // متادیتا سئو (بدون تغییر)
 const [metaTitle, setMetaTitle] = useState('');
 const [metaDesc, setMetaDescription] = useState('');

 // فیلدهای نمایش متادیتا (بدون تغییر)
 const [readTime, setReadTime] = useState('');
 const [ageRating, setAgeRating] = useState('');
 
 // ✅ گام جدید: استیت لوکال نظرات با پیش‌فرضِ مقدار سراسری کانتکست
 const [allowComments, setAllowComments] = useState(allowCommentsGlobally);
 
 // تنظیمات نمایش در صفحه (بدون تغییر)
 const [showAgeRating, setShowAgeRating] = useState(true);
 const [showDate, setShowDate] = useState(true);
 const [showReadTime, setShowReadTime] = useState(true);
 const [showViews, setShowViews] = useState(true);
 const [showAuthor, setShowAuthor] = useState(true);
 const [isDownloadActive, setIsDownloadActive] = useState(true);

 const [body, setBody] = useState(''); 
 
 // ================= استیت‌های اختصاصی بلاگ (بدون تغییر) =================
 const [lead, setLead] = useState('');

 // ================= استیت‌های اختصاصی محصولات (بدون تغییر) =================
 const [formats, setFormats] = useState([]); 
 const [customFormat, setCustomFormat] = useState(''); 
 
 const [fileSpecs, setFileSpecs] = useState([]); 
 const [changelog, setChangelog] = useState([]); 
 const [downloadLinks, setDownloadLinks] = useState([]); 
 const [previewGallery, setPreviewGallery] = useState([]); 

 // ================= استیت‌های ارتباطات (طبقه‌بندی) (بدون تغییر) =================
 const [selectedCategories, setSelectedCategories] = useState([]);
 const [selectedCreators, setSelectedCreators] = useState([]);
 const [selectedTags, setSelectedTags] = useState([]);

 // ✅ گام جدید و بهینه‌سازی: دریافت اطلاعات سرشاخه‌ها (بدون تداخل با تقویم)
 useEffect(() => {
   async function fetchData() {
     // فقط دریافت تاکسونومی‌ها (getSetting حذف شد)
     const taxData = await getTaxonomies();
     setTaxonomies(taxData || []);
   }
   fetchData();
 }, []);

 // ✅ گام جدید: همگام‌سازی استیت لوکال نظرات با کانتکست (اگر لود شد)
 useEffect(() => {
   if (!isLoadingSettings) {
     setAllowComments(allowCommentsGlobally);
   }
 }, [allowCommentsGlobally, isLoadingSettings]);

 // مدیریت لیست‌ها (بدون تغییر)
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

 // تابع handleSave (بدون تغییر)
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

 return (
   <div className="max-w-[1400px] mx-auto space-y-6 pb-20 font-sans text-right select-none relative">
     
     {/* هدر صفحه (بدون تغییر) */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
       <div>
         <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
           <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.bg} ${activeTheme.glow}`}></span>
           ایجاد محتوای جدید
         </h1>
         <p className="text-sm text-gray-400 font-light">اطلاعات محتوا یا مقاله خود را تکمیل کنید.</p>
       </div>
       <div className="flex items-center gap-3">
         <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all cursor-pointer">
           انصراف
         </button>
         <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2.5 rounded-xl ${activeTheme.bg} text-white text-sm font-bold ${activeTheme.glow} transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 hover:brightness-110`}>
           <Icon name="checkCircle" className="w-4 h-4" /> {isSaving ? 'در حال ثبت...' : 'ذخیره'}
         </button>
       </div>
     </div>

     {/* انتخابگر نوع محتوا (بدون تغییر) */}
     <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-[fadeIn_0.4s_ease-out]">
       <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
       <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

       <div className="p-2 flex flex-wrap md:flex-nowrap gap-2 relative z-10">
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
               type === t.id ? `bg-white/10 ${t.themeObj.color} ${t.themeObj.border} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]` : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'
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
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-6 space-y-5 relative z-10">
             <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
               <Icon name="fileText" className={`w-5 h-5 ${activeTheme.color}`} /> اطلاعات پایه
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs text-gray-300 font-bold">بخش اول عنوان (سفید)</label>
                 <input type="text" value={titleBase} onChange={e => setTitleBase(e.target.value)} placeholder="مثلاً: بخش اول" className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none transition-colors shadow-inner font-sans" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-300 font-bold">بخش دوم عنوان (رنگی - اختیاری)</label>
                 <input type="text" value={titleHighlight} onChange={e => setTitleHighlight(e.target.value)} placeholder="مثلاً: بخش دوم" className={`w-full bg-[#080c16] border border-white/10 rounded-xl p-3 ${activeTheme.color} text-sm focus:border-white/30 outline-none transition-colors font-bold shadow-inner font-sans`} />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold">زیرعنوان (توضیح کوتاه)</label>
               <textarea rows="2" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="توضیح کوتاه و جذابی برای نمایش زیر عنوان بنویسید..." className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none resize-none transition-colors shadow-inner font-light text-justify"></textarea>
             </div>

             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold flex items-center justify-between">
                 <span>پیوند یکتا (Slug) انگلیسی</span>
                 <button type="button" className={`text-[10px] ${activeTheme.color} hover:underline font-bold cursor-pointer font-sans`} onClick={() => setSlug((titleBase + ' ' + titleHighlight).trim().replace(/\s+/g, '-').toLowerCase())}>تبدیل خودکار از عنوان</button>
               </label>
               <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} placeholder="my-custom-content-slug" className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-300 text-sm focus:border-white/30 outline-none dir-ltr text-left transition-colors font-sans shadow-inner" />
             </div>
           </div>
         </div>

         {/* باکس سئو */}
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-6 space-y-5 relative z-10">
             <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
               <Icon name="search" className={`w-5 h-5 ${activeTheme.color}`} /> تنظیمات سئو (SEO Meta)
             </h2>
             
             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold flex justify-between">عنوان سئو (Meta Title) <span className="font-sans text-[10px] text-gray-500">{metaTitle.length} / 60</span></label>
               <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="عنوان جذاب برای موتورهای جستجو..." className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none transition-colors shadow-inner font-sans" />
             </div>
             
             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold flex justify-between">توضیحات سئو (Meta Description) <span className="font-sans text-[10px] text-gray-500">{metaDesc.length} / 160</span></label>
               <textarea rows="3" value={metaDesc} onChange={e => setMetaDescription(e.target.value)} placeholder="چکیده‌ای که در نتایج گوگل نمایش داده می‌شود..." className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none resize-none transition-colors shadow-inner text-justify font-light"></textarea>
             </div>
           </div>
         </div>

         {/* باکس متن اصلی / ادیتور */}
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-6 space-y-5 relative z-10">
             <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
               <Icon name="browser" className={`w-5 h-5 ${activeTheme.color}`} /> 
               {type === 'BLOG' ? 'محتوای متنی مقاله' : 'توضیحات و معرفی (Editor)'}
             </h2>

             {type === 'BLOG' && (
               <div className="space-y-2 mb-6">
                 <label className="text-xs text-gray-300 font-bold">لید خبر / چکیده برجسته</label>
                 <textarea rows="3" value={lead} onChange={e => setLead(e.target.value)} placeholder="پاراگراف جذابی که به عنوان مقدمه در ابتدای مقاله با استایل متفاوت نمایش داده می‌شود..." className="w-full bg-[#080c16] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 outline-none resize-none transition-colors shadow-inner font-light text-justify"></textarea>
               </div>
             )}

             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold">متن اصلی</label>
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
               <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
                 <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

                 <div className="p-6 relative z-10">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                     <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Icon name="playCircle" className={`w-5 h-5 ${activeTheme.color}`} /> گالری پیش‌نمایش
                     </h2>
                     <button type="button" onClick={() => addItem(setPreviewGallery, { type: 'video', url: '', desc: '' })} className={`text-xs bg-white/5 hover:bg-white/10 ${activeTheme.color} px-3 py-1.5 rounded-lg font-bold border border-white/10 transition-colors cursor-pointer`}>+ افزودن مدیا</button>
                   </div>
                   
                   <div className="space-y-4">
                     {previewGallery.map((item) => (
                       <div key={item.id} className="p-4 bg-[#080c16] border border-white/10 rounded-xl relative space-y-3">
                         <button type="button" onClick={() => removeItem(setPreviewGallery, item.id)} className="absolute top-2 left-2 p-1.5 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                         
                         <div className="flex gap-4 items-start pr-6">
                           <div className="space-y-1">
                             <label className="text-[10px] text-gray-500 font-bold">نوع</label>
                             <select value={item.type} onChange={(e) => updateItem(setPreviewGallery, item.id, 'type', e.target.value)} className="w-24 bg-[#080c16] border border-white/10 rounded-lg p-2 text-xs text-white outline-none cursor-pointer focus:border-white/30 font-sans">
                               <option value="video" className="bg-[#0b0f19]">ویدیو</option>
                               <option value="image" className="bg-[#0b0f19]">تصویر</option>
                               <option value="audio" className="bg-[#0b0f19]">صوت</option>
                             </select>
                           </div>
                           
                           <div className="flex-1 space-y-1">
                             <label className="text-[10px] text-gray-500 font-bold">لینک از کتابخانه رسانه</label>
                             <div className="flex items-center gap-2">
                               <input type="text" value={item.url} readOnly placeholder="آدرس فایل..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-gray-400 outline-none dir-ltr text-left font-sans" />
                               <button type="button" onClick={() => { setMediaPickerTarget('gallery'); setActiveGalleryIndex(item.id); }} className={`px-3 py-2 rounded-lg text-xs font-bold text-white border border-white/10 transition-colors cursor-pointer ${activeTheme.bg} hover:brightness-110 shrink-0`}>انتخاب</button>
                             </div>
                           </div>
                         </div>
                         <input type="text" placeholder="یک خط توضیح درباره این پیش‌نمایش بنویسید..." value={item.desc} onChange={e => updateItem(setPreviewGallery, item.id, 'desc', e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2 text-xs text-white outline-none font-sans" />
                       </div>
                     ))}
                     {previewGallery.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">هیچ پیش‌نمایشی اضافه نشده است.</p>}
                   </div>
                 </div>
               </div>

               {/* اطلاعات فایل‌ها */}
               <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
                 <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

                 <div className="p-6 relative z-10">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                     <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Icon name="hardDrives" className={`w-5 h-5 ${activeTheme.color}`} /> مشخصات فایل‌ها
                     </h2>
                     <button type="button" onClick={() => addItem(setFileSpecs, { label: '', value: '', iconUrl: '' })} className={`text-xs bg-white/5 hover:bg-white/10 ${activeTheme.color} px-3 py-1.5 rounded-lg font-bold border border-white/10 transition-colors cursor-pointer`}>+ افزودن مشخصه</button>
                   </div>
                   <div className="space-y-3">
                     {fileSpecs.map(spec => (
                       <div key={spec.id} className="flex items-center gap-3 p-2 bg-[#080c16] border border-white/10 rounded-xl">
                         <button type="button" onClick={() => { setMediaPickerTarget('fileIcon'); setActiveFileIconIndex(spec.id); }} className="w-10 h-10 shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer overflow-hidden">
                           {spec.iconUrl ? <img src={spec.iconUrl} alt="icon" className="w-6 h-6 object-contain" /> : <Icon name="plus" className="w-4 h-4 text-gray-500" />}
                         </button>
                         <input type="text" placeholder="عنوان (مثال: کیفیت)" value={spec.label} onChange={e => updateItem(setFileSpecs, spec.id, 'label', e.target.value)} className="w-1/3 bg-transparent text-xs text-gray-300 outline-none px-2 border-l border-white/10 font-sans" />
                         <input type="text" placeholder="مقدار (مثال: 4K UHD)" value={spec.value} onChange={e => updateItem(setFileSpecs, spec.id, 'value', e.target.value)} className="flex-1 bg-transparent text-sm text-white outline-none px-2 font-sans" />
                         <button type="button" onClick={() => removeItem(setFileSpecs, spec.id)} className="p-2 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                       </div>
                     ))}
                     {fileSpecs.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">موردی ثبت نشده است.</p>}
                   </div>
                 </div>
               </div>

               {/* لینک‌های دانلود */}
               <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
                 <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

                 <div className="p-6 relative z-10">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                     <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Icon name="download" className={`w-5 h-5 ${activeTheme.color}`} /> فایل‌های اصلی (لینک دانلود)
                     </h2>
                     <button type="button" onClick={() => addItem(setDownloadLinks, { title: '', desc: '', format: '', url: '' })} className={`text-xs bg-white/5 hover:bg-white/10 ${activeTheme.color} px-3 py-1.5 rounded-lg font-bold border border-white/10 transition-colors cursor-pointer`}>+ لینک جدید</button>
                   </div>
                   
                   <div className="space-y-4">
                     {downloadLinks.map(dl => (
                       <div key={dl.id} className="p-4 bg-[#080c16] border border-white/10 rounded-xl relative space-y-4">
                         <button type="button" onClick={() => removeItem(setDownloadLinks, dl.id)} className="absolute top-2 left-2 p-1.5 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                           <input type="text" placeholder="عنوان فایل (مثال: مستند کامل)" value={dl.title} onChange={e => updateItem(setDownloadLinks, dl.id, 'title', e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-sm text-white outline-none font-bold" />
                           <input type="text" placeholder="فرمت/کیفیت (مثال: MP4 - 1080p)" value={dl.format} onChange={e => updateItem(setDownloadLinks, dl.id, 'format', e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-xs text-gray-400 outline-none font-sans" />
                           <input type="text" placeholder="توضیحات (مثال: بدون حذفیات - مناسب پژوهش)" value={dl.desc} onChange={e => updateItem(setDownloadLinks, dl.id, 'desc', e.target.value)} className="col-span-1 md:col-span-2 bg-transparent border-b border-white/10 pb-2 text-xs text-gray-400 outline-none font-light" />
                           <input type="text" placeholder="لینک دانلود مستقیم (URL)" value={dl.url} onChange={e => updateItem(setDownloadLinks, dl.id, 'url', e.target.value)} className="col-span-1 md:col-span-2 bg-black/40 rounded-lg p-2.5 text-xs text-blue-400 dir-ltr text-left outline-none border border-white/5 font-sans shadow-inner" />
                         </div>
                       </div>
                     ))}
                     {downloadLinks.length === 0 && <p className="text-xs text-gray-500 text-center py-2 font-light">هیچ لینکی اضافه نشده است.</p>}
                   </div>
                 </div>
               </div>

               {/* تاریخچه آپدیت‌ها */}
               <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
                 <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
                 <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

                 <div className="p-6 relative z-10">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                     <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Icon name="update" className={`w-5 h-5 ${activeTheme.color}`} /> تاریخچه به‌روزرسانی‌ها
                     </h2>
                     <button type="button" onClick={() => prependItem(setChangelog, { version: '', date: '', title: '', desc: '' })} className={`text-xs bg-white/5 hover:bg-white/10 ${activeTheme.color} px-3 py-1.5 rounded-lg font-bold border border-white/10 transition-colors cursor-pointer`}>+ آپدیت جدید</button>
                   </div>
                   
                   <div className="space-y-4 relative pl-4">
                     <div className="absolute right-3 top-2 bottom-2 w-0.5 bg-white/10 z-0"></div>
                     
                     {changelog.map((log, index) => (
                       <div key={log.id} className="relative z-10 pl-2 pr-8 bg-[#080c16] border border-white/10 rounded-xl p-4 shadow-inner">
                         <div className={`absolute right-1.5 top-5 w-3 h-3 rounded-full ${index === 0 ? activeTheme.bg : 'bg-gray-600'} border-2 border-[#080c16] z-10`}></div>
                         <button type="button" onClick={() => removeItem(setChangelog, log.id)} className="absolute top-2 left-2 p-1 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                         
                         <div className="grid grid-cols-2 gap-3 mb-3 pr-2">
                           <input type="text" placeholder="ورژن (مثال: v1.2)" value={log.version} onChange={e => updateItem(setChangelog, log.id, 'version', e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-gray-300 outline-none font-sans text-center w-24" />
                           <input type="text" placeholder="تاریخ شمسی" value={log.date} onChange={e => updateItem(setChangelog, log.id, 'date', e.target.value)} className="bg-transparent border-b border-white/10 text-xs text-gray-400 outline-none text-right font-sans" />
                         </div>
                         <input type="text" placeholder="عنوان آپدیت (مهم)" value={log.title} onChange={e => updateItem(setChangelog, log.id, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2 text-sm font-bold text-white outline-none mb-3 font-sans" />
                         <textarea rows="3" placeholder="توضیحات تکمیلی... (هر خط با زدن دکمه Enter یک نقطه بولت در سایت محسوب می‌شود)" value={log.desc} onChange={e => updateItem(setChangelog, log.id, 'desc', e.target.value)} className="w-full bg-transparent text-xs text-gray-400 outline-none resize-none leading-relaxed font-light text-justify"></textarea>
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
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-5 space-y-5 relative z-10">
             <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">وضعیت و نمایش</h3>
             
             <div className="space-y-2">
               <label className="text-[10px] text-gray-500 uppercase font-bold">وضعیت انتشار</label>
               <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer focus:border-white/30 transition-colors shadow-inner font-sans">
                 <option value="DRAFT">پیش‌نویس (عدم نمایش در سایت)</option>
                 <option value="PUBLISHED">منتشر شده (عمومی)</option>
                 <option value="ARCHIVED">بایگانی شده (فقط آرشیو)</option>
               </select>
             </div>

             {/* بخش تاریخ ایجاد و آخرین ویرایش (اصلاح شده و بدون بیرون‌زدگی) */}
             {/* بخش تاریخ ایجاد و آخرین ویرایش */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] text-gray-400 font-bold block">تاریخ ایجاد</label>
    <MyDateTimePicker
      value={publishedAt}
      onChange={setPublishedAt}
      activeTheme={activeTheme}
    />
  </div>
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] text-gray-400 font-bold block">آخرین ویرایش</label>
    <MyDateTimePicker
      value={updatedAt}
      onChange={setUpdatedAt}
      activeTheme={activeTheme}
    />
  </div>
</div>

             {/* تاگل‌های نمایش (بدون تغییر) */}
             <div className="space-y-3 pt-4 border-t border-white/10">
               <label className="text-[10px] text-[#06b6d4] uppercase font-bold mb-2 block">تاگل‌های نمایش در سایت</label>
               
               {[
                 { label: 'نمایش تاریخ', state: showDate, setter: setShowDate },
                 { label: 'نمایش زمان مطالعه', state: showReadTime, setter: setShowReadTime },
                 { label: 'نمایش آمار بازدید', state: showViews, setter: setShowViews },
                 { label: 'نمایش رده‌بندی سنی', state: showAgeRating, setter: setShowAgeRating },
                 { label: `نمایش نام ${type === 'BLOG' ? 'نویسنده' : 'تهیه‌کننده'}`, state: showAuthor, setter: setShowAuthor }
               ].map((toggle, idx) => (
                 <label key={idx} className="flex items-center justify-between cursor-pointer group/toggle">
                   <span className="text-xs text-gray-300 group-hover/toggle:text-white transition-colors">{toggle.label}</span>
                   <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border ${toggle.state ? `${activeTheme.bg} border-transparent` : 'bg-white/5 border-white/20 group-hover/toggle:border-white/50'}`}>
                     {toggle.state && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                   </div>
                   <input type="checkbox" className="hidden" checked={toggle.state} onChange={(e) => toggle.setter(e.target.checked)} />
                 </label>
               ))}

               {/* تاگل نظرات - همگام‌سازی شده با کانتکست */}
               <label className="flex items-center justify-between cursor-pointer group/toggle border-t border-white/5 pt-3 mt-3">
                 <span className="text-xs text-[#10b981] font-bold">بخش نظرات فعال باشد؟</span>
                 <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border ${allowComments ? `bg-[#10b981] border-transparent` : 'bg-white/5 border-white/20 group-hover/toggle:border-white/50'}`}>
                   {allowComments && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                 </div>
                 <input type="checkbox" className="hidden" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
               </label>
               
               {type !== 'BLOG' && (
                 <label className="flex items-center justify-between cursor-pointer group/toggle">
                   <span className="text-xs text-[#06b6d4] font-bold">لینک‌های دانلود فعال باشند؟</span>
                   <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border ${isDownloadActive ? `bg-[#06b6d4] border-transparent` : 'bg-white/5 border-white/20 group-hover/toggle:border-white/50'}`}>
                     {isDownloadActive && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                   </div>
                   <input type="checkbox" className="hidden" checked={isDownloadActive} onChange={(e) => setIsDownloadActive(e.target.checked)} />
                 </label>
               )}
             </div>

             {/* مقادیر دستی متادیتا (بدون تغییر) */}
             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
               <div className="space-y-1">
                 <label className="text-[10px] text-gray-500 font-bold text-center block">زمان مطالعه (دقیقه)</label>
                 <input type="text" value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="مثال: ۱۲" className="w-full bg-[#080c16] border border-white/10 rounded-lg p-2.5 text-xs text-white text-center outline-none focus:border-white/30 font-sans shadow-inner" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] text-gray-500 font-bold text-center block">رده سنی</label>
                 <input type="text" value={ageRating} onChange={e => setAgeRating(e.target.value)} placeholder="مثال: +۷" className="w-full bg-[#080c16] border border-white/10 rounded-lg p-2.5 text-xs text-white text-center outline-none dir-ltr font-bold focus:border-white/30 font-sans shadow-inner" />
               </div>
             </div>

           </div>
         </div>

         {/* فرمت‌های محتوا (بدون تغییر) */}
         {type !== 'BLOG' && (
           <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
             <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
             <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

             <div className="p-5 space-y-4 relative z-10">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                 <Icon name="monitorPlay" className={`w-5 h-5 ${activeTheme.color}`} /> فرمت‌های ارائه شده
               </h3>
               <div className="flex flex-wrap gap-4 items-center pt-2">
                 {['فیلم', 'تصویر', 'صوت', 'متن', 'پروژه'].map(fmt => {
                   const isChecked = formats.includes(fmt);
                   return (
                     <label key={fmt} className={`flex items-center gap-2 text-sm cursor-pointer transition-colors group/fmt`}>
                       <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 border ${isChecked ? `${activeTheme.bg} border-transparent` : 'bg-white/5 border-white/20 group-hover/fmt:border-white/50'}`}>
                         {isChecked && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                       </div>
                       <input type="checkbox" checked={isChecked} onChange={() => toggleArrayItem(setFormats, fmt)} className="hidden" />
                       <span className={isChecked ? 'text-white font-bold' : 'text-gray-400 group-hover/fmt:text-gray-200'}>{fmt}</span>
                     </label>
                   );
                 })}
                 <div className="w-full flex items-center gap-2 border-t border-white/5 pt-3 mt-1">
                   <span className="text-xs text-gray-400 whitespace-nowrap">سایر فرمت‌ها:</span>
                   <input type="text" value={customFormat} onChange={e => setCustomFormat(e.target.value)} placeholder="مثال: PDF یا 3D..." className="flex-1 bg-[#080c16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30 shadow-inner font-sans" />
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* تصاویر شاخص (بدون تغییر) */}
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-5 space-y-4 relative z-10">
             <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2"> تصاویر شاخص</h3>
             
             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold">کاور دسکتاپ (16:9)</label>
               {coverDesktop ? (
                 <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 group/img bg-black/50 shadow-inner">
                   <img src={coverDesktop} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                     <button onClick={() => setMediaPickerTarget('desktop')} className={`p-2.5 bg-white/10 hover:${activeTheme.bg} rounded-full text-white cursor-pointer transition-colors`}><Icon name="image" className="w-5 h-5" /></button>
                     <button onClick={() => setCoverDesktop('')} className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-full text-white cursor-pointer transition-colors"><Icon name="close" className="w-5 h-5" /></button>
                   </div>
                 </div>
               ) : (
                 <button onClick={() => setMediaPickerTarget('desktop')} className="w-full aspect-video rounded-xl border border-dashed border-white/20 hover:border-white/50 bg-[#080c16] flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white transition-all cursor-pointer shadow-inner">
                   <Icon name="device" className="w-6 h-6" /> <span className="text-xs font-bold">انتخاب تصویر</span>
                 </button>
               )}
             </div>

             <div className="space-y-2">
               <label className="text-xs text-gray-300 font-bold">کاور موبایل (1:1 مربعی)</label>
               {coverMobile ? (
                 <div className="relative w-full aspect-square max-w-[180px] mx-auto rounded-xl overflow-hidden border border-white/10 group/img bg-black/50 shadow-inner">
                   <img src={coverMobile} alt="Mobile Cover" className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                     <button onClick={() => setMediaPickerTarget('mobile')} className={`p-2.5 bg-white/10 hover:${activeTheme.bg} rounded-full text-white cursor-pointer transition-colors`}><Icon name="image" className="w-4 h-4" /></button>
                     <button onClick={() => setCoverMobile('')} className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-full text-white cursor-pointer transition-colors"><Icon name="close" className="w-4 h-4" /></button>
                   </div>
                 </div>
               ) : (
                 <button onClick={() => setMediaPickerTarget('mobile')} className="w-full aspect-square max-w-[180px] mx-auto rounded-xl border border-dashed border-white/20 hover:border-white/50 bg-[#080c16] flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white transition-all cursor-pointer shadow-inner">
                   <Icon name="deviceMobile" className="w-6 h-6" /> <span className="text-xs font-bold">انتخاب عکس</span>
                 </button>
               )}
             </div>
           </div>
         </div>

         {/* طبقه‌بندی‌ها (بدون تغییر) */}
         <div className="relative rounded-2xl border border-white/10 shadow-2xl group">
           <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
           <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20 rounded-t-2xl`} />

           <div className="p-5 space-y-6 relative z-10">
             
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

     {/* پاپ آپ مودال کتابخانه رسانه (بدون تغییر) */}
     <AnimatePresence>
       {mediaPickerTarget && (
         <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans"
           onClick={() => setMediaPickerTarget(null)}
         >
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
             onClick={(e) => e.stopPropagation()}
             className="relative w-full max-w-6xl h-[90vh] bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
           >
             <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${activeTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
             
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
               <h3 className="text-white font-bold flex items-center gap-2"><Icon name="image" className={`w-5 h-5 ${activeTheme.color}`} /> انتخاب فایل از رسانه</h3>
               <button onClick={() => setMediaPickerTarget(null)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                 <Icon name="close" className="w-4 h-4" />
               </button>
             </div>

             <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
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
                     // درج مدیا درون ادیتور
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