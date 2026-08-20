'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import BlurImage from '@/app/components/BlurImage';
import toast from 'react-hot-toast';
import Link from 'next/link';

// === اکشن‌های بک‌اند ===
import { getAllDossiersAdmin, saveDossier, deleteDossier, updateDossiersOrder, getHubSettings, saveHubSettings } from '@/app/actions/dossier';
import { getTaxonomies } from '@/app/actions/taxonomies'; 
import { getContents } from '@/app/actions/content';   
import { getMedia } from '@/app/actions/media';       

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px #080c16 inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

const Tooltip = ({ children, text }) => (
  <div className="relative group/tooltip flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
      <div className="bg-[#0b0f19] text-white text-[10px] py-1.5 px-3 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap font-bold font-sans">
        {text}
      </div>
      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[5px] border-t-[#0b0f19] -mt-[1px]"></div>
    </div>
  </div>
);

export default function AdminDossiersManager() {
  const [activeTab, setActiveTab] = useState('HUB_SETTINGS'); 
  const [dossiers, setDossiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // دیتابیس زنده (Live Data) برای جستجو
  const [allTaxonomies, setAllTaxonomies] = useState([]);
  const [allContents, setAllContents] = useState([]);

  // استیت‌های تب هاب
  const [hubSettings, setHubSettings] = useState({ title: '', description: '', metaTitle: '', metaDesc: '' });
  const [isSavingHub, setIsSavingHub] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // استیت‌های لیست پرونده‌ها
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });

  // استیت‌های مودال رسانه
  const [mediaModal, setMediaModal] = useState({ isOpen: false, targetField: null });
  const [mediaItems, setMediaItems] = useState([]);

  // استیت‌های ویرایشگر جامع
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isSavingDossier, setIsSavingDossier] = useState(false);
  const [editorTab, setEditorTab] = useState('basic'); 
  
  const [tagSearch, setTagSearch] = useState('');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');

  const [formData, setFormData] = useState({
    id: null, slug: '', title: '', preTitle: '', description: '',
    metaTitle: '', metaDesc: '', hubCoverDesktop: '', hubCoverMobile: '',
    coverDesktop: '', coverMobile: '', themeColor: '#06b6d4',
    showRadar: true, radarTitle: 'رادار موضوعی پرونده', selectedTopics: [],
    showCreators: true, creatorsTitle: 'اشخاص و پدیدآورندگان مرتبط', selectedCreators: [],
    selectedContents: [], showTipLine: true, tipPreTitle: 'پورتال ارتباط امن', 
    tipTitle: 'سندی در دست دارید؟', tipDesc: '', tipBtnText: 'ارسال امن سند', tipBtnLink: '#', tipBtnIcon: 'upload'
  });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [hubRes, dosRes, taxRes, contRes, mediaRes] = await Promise.all([
        getHubSettings(), getAllDossiersAdmin(), getTaxonomies(), getContents(), getMedia()
      ]);

      if (hubRes) setHubSettings(hubRes);
      if (dosRes?.success) setDossiers(dosRes.data);
      if (taxRes?.success) setAllTaxonomies(taxRes.data);
      if (contRes) setAllContents(contRes);
      if (mediaRes) setMediaItems(mediaRes);
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات دیتابیس');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHubSettings = async () => {
    setIsSavingHub(true);
    const res = await saveHubSettings(hubSettings);
    setIsSavingHub(false);
    if(res.success) toast.success('تنظیمات متنی صفحه هاب ذخیره شد.');
    else toast.error('خطا در ذخیره تنظیمات');
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const newItems = [...dossiers];
    const draggedItemContent = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedItemContent);
    setDraggedItem(index);
    setDossiers(newItems);
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    const orderedIds = dossiers.map(d => d.id);
    await updateDossiersOrder(orderedIds);
    toast.success('ترتیب جدید ذخیره شد!');
  };

  const toggleDossierVisibility = async (id) => {
    const d = dossiers.find(x => x.id === id);
    const updated = { ...d, isVisibleInHub: !d.isVisibleInHub };
    setDossiers(prev => prev.map(x => x.id === id ? updated : x));
    await saveDossier({ ...updated, selectedTopics: updated.taxonomies.filter(t => t.type !== 'CREATOR'), selectedCreators: updated.taxonomies.filter(t => t.type === 'CREATOR'), selectedContents: updated.contents });
    toast.success('وضعیت نمایش تغییر کرد.');
  };

  const confirmDelete = async () => {
    const res = await deleteDossier(deleteModal.id);
    if (res.success) {
      setDossiers(prev => prev.filter(d => d.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, title: '' });
      toast.success('پرونده با موفقیت حذف شد.');
    }
  };

  const openEditor = (dossier = null) => {
    if (dossier) {
      setFormData({
        ...dossier,
        selectedTopics: dossier.taxonomies?.filter(t => t.type === 'CATEGORY' || t.type === 'HASHTAG') || [],
        selectedCreators: dossier.taxonomies?.filter(t => t.type === 'CREATOR') || [],
        selectedContents: dossier.contents || []
      });
    } else {
      setFormData({
        id: null, slug: '', title: '', preTitle: '', description: '', metaTitle: '', metaDesc: '',
        hubCoverDesktop: '', hubCoverMobile: '', coverDesktop: '', coverMobile: '', themeColor: '#06b6d4',
        showRadar: true, radarTitle: 'رادار موضوعی پرونده', selectedTopics: [],
        showCreators: true, creatorsTitle: 'اشخاص و پدیدآورندگان مرتبط', selectedCreators: [],
        selectedContents: [], showTipLine: true, tipPreTitle: 'پورتال ارتباط امن', 
        tipTitle: 'سندی در دست دارید؟', tipDesc: '', tipBtnText: 'ارسال امن سند', tipBtnLink: '#', tipBtnIcon: 'upload'
      });
    }
    setEditorTab('basic');
    setIsDossierModalOpen(true);
  };

  const handleSaveDossier = async () => {
    if(!formData.title || !formData.slug) return toast.error('عنوان و اسلاگ الزامی است.');
    setIsSavingDossier(true);
    const res = await saveDossier(formData);
    setIsSavingDossier(false);
    
    if(res.success) {
      toast.success('پرونده با موفقیت ذخیره شد.');
      setIsDossierModalOpen(false);
      loadAllData();
    } else {
      toast.error(res.error || 'خطا در ذخیره');
    }
  };

  const handleSelectMedia = (url) => {
    if(mediaModal.targetField) {
      setFormData({ ...formData, [mediaModal.targetField]: url });
    }
    setMediaModal({ isOpen: false, targetField: null });
  };

  const filteredDossiers = dossiers.filter(d => d.title.includes(searchQuery) || d.slug.includes(searchQuery));
  const searchResultsTags = allTaxonomies.filter(t => (t.type === 'CATEGORY' || t.type === 'HASHTAG') && t.name.includes(tagSearch) && !formData.selectedTopics.find(st => st.id === t.id));
  const searchResultsCreators = allTaxonomies.filter(t => t.type === 'CREATOR' && t.name.includes(creatorSearch) && !formData.selectedCreators.find(sc => sc.id === t.id));
  const searchResultsContents = allContents.filter(c => c.titleBase.includes(contentSearch) && !formData.selectedContents.find(sc => sc.id === c.id));

  const renderEditorForm = () => {
    switch(editorTab) {
      case 'basic':
        return (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-xs text-gray-400 mb-2">لینک اختصاصی (Slug)</label><input type="text" dir="ltr" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="مثال: us-embassy" /></div>
              <div><label className="block text-xs text-gray-400 mb-2">رنگ اصلی (Theme)</label><input type="color" value={formData.themeColor} onChange={(e) => setFormData({...formData, themeColor: e.target.value})} className="w-full h-[46px] bg-[#080c16] border border-white/10 rounded-xl cursor-pointer" /></div>
              <div><label className="block text-xs text-gray-400 mb-2">روتیتر هدر</label><input type="text" value={formData.preTitle} onChange={(e) => setFormData({...formData, preTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="اسناد محرمانه سفارت" /></div>
              <div><label className="block text-xs text-gray-400 mb-2">عنوان اصلی پرونده</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="لانه جاسوسی" /></div>
              <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-2">توضیح دو خطی هدر</label><textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] resize-none placeholder-white/30" style={autofillFixStyle} placeholder="در این پرونده ویژه به بررسی عمیق..."></textarea></div>
            </div>
            
            <div className="p-5 border border-white/10 rounded-2xl bg-white/5 space-y-4 mt-6">
              <h4 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">تنظیمات تصاویر <Icon name="image" className="w-4 h-4 text-gray-400" /></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs text-emerald-400 mb-2 font-sans">کاور دسکتاپ هاب (۱۶:۹)</label>
                  <div className="flex gap-2"><input type="text" readOnly value={formData.hubCoverDesktop} placeholder="انتخاب نشده" className="w-full bg-[#080c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 placeholder-white/30" /><button onClick={() => setMediaModal({ isOpen: true, targetField: 'hubCoverDesktop' })} className="px-4 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer">انتخاب رسانه</button></div>
                </div>
                <div>
                  <label className="block text-xs text-emerald-400 mb-2 font-sans">کاور موبایل هاب (۱:۱)</label>
                  <div className="flex gap-2"><input type="text" readOnly value={formData.hubCoverMobile} placeholder="انتخاب نشده" className="w-full bg-[#080c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 placeholder-white/30" /><button onClick={() => setMediaModal({ isOpen: true, targetField: 'hubCoverMobile' })} className="px-4 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer">انتخاب رسانه</button></div>
                </div>
                <div>
                  <label className="block text-xs text-cyan-400 mb-2 font-sans">کاور هدر دسکتاپ داخل پرونده (۱۶:۹)</label>
                  <div className="flex gap-2"><input type="text" readOnly value={formData.coverDesktop} placeholder="انتخاب نشده" className="w-full bg-[#080c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 placeholder-white/30" /><button onClick={() => setMediaModal({ isOpen: true, targetField: 'coverDesktop' })} className="px-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer">انتخاب رسانه</button></div>
                </div>
                <div>
                  <label className="block text-xs text-cyan-400 mb-2 font-sans">کاور هدر موبایل داخل پرونده (۱:۱)</label>
                  <div className="flex gap-2"><input type="text" readOnly value={formData.coverMobile} placeholder="انتخاب نشده" className="w-full bg-[#080c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 placeholder-white/30" /><button onClick={() => setMediaModal({ isOpen: true, targetField: 'coverMobile' })} className="px-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer">انتخاب رسانه</button></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'radar':
        return (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-sm font-bold text-white">نمایش رادار موضوعی (ابر تگ‌ها)</span>
              <button onClick={() => setFormData({...formData, showRadar: !formData.showRadar})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.showRadar ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.showRadar ? 'left-1' : 'right-1'}`} />
              </button>
            </div>
            
            <div className={`transition-opacity space-y-4 ${!formData.showRadar && 'opacity-30 pointer-events-none'}`}>
              <div><label className="block text-xs text-gray-400 mb-2">عنوان رادار موضوعی</label><input type="text" value={formData.radarTitle} onChange={(e) => setFormData({...formData, radarTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="رادار موضوعی پرونده" /></div>
              
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-2">انتخاب هشتگ‌ها و دسته‌بندی‌ها</label>
                <div className="w-full bg-[#080c16] border border-white/10 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 items-start">
                   {formData.selectedTopics.map((topic, i) => (
                     <span key={i} className="bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                       {topic.name} 
                       {/* باگ دکمه حذف اینجا برطرف شد */}
                       <button type="button" onClick={() => setFormData({...formData, selectedTopics: formData.selectedTopics.filter(t => t.id !== topic.id)})} className="hover:text-rose-500 transition-colors ml-1">
                         <Icon name="close" className="w-3 h-3"/>
                       </button>
                     </span>
                   ))}
                   <input type="text" value={tagSearch} onChange={e => setTagSearch(e.target.value)} placeholder={formData.selectedTopics.length === 0 ? "جستجو..." : ""} className="bg-transparent text-sm text-white outline-none flex-grow min-w-[150px] border-none py-1 placeholder-white/30" />
                </div>
                {tagSearch && searchResultsTags.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 max-h-48 overflow-y-auto">
                    {searchResultsTags.map(t => (
                      <button key={t.id} onClick={() => { setFormData({...formData, selectedTopics: [...formData.selectedTopics, t]}); setTagSearch(''); }} className="w-full text-right px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-white flex justify-between"><span>{t.name}</span> <span className="text-[10px] text-gray-500">{t.type}</span></button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mt-8">
              <span className="text-sm font-bold text-white">نمایش اشخاص و پدیدآورندگان</span>
              <button onClick={() => setFormData({...formData, showCreators: !formData.showCreators})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.showCreators ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.showCreators ? 'left-1' : 'right-1'}`} />
              </button>
            </div>
            
            <div className={`transition-opacity space-y-4 ${!formData.showCreators && 'opacity-30 pointer-events-none'}`}>
              <div><label className="block text-xs text-gray-400 mb-2">عنوان بخش پدیدآورندگان</label><input type="text" value={formData.creatorsTitle} onChange={(e) => setFormData({...formData, creatorsTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="اشخاص و پدیدآورندگان مرتبط" /></div>
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-2">جستجو و انتخاب اشخاص</label>
                <div className="w-full bg-[#080c16] border border-white/10 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 items-start">
                   {formData.selectedCreators.map((creator, i) => (
                     <span key={i} className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                       {creator.name} 
                       {/* باگ دکمه حذف اینجا برطرف شد */}
                       <button type="button" onClick={() => setFormData({...formData, selectedCreators: formData.selectedCreators.filter(c => c.id !== creator.id)})} className="hover:text-rose-400 transition-colors ml-1">
                         <Icon name="close" className="w-3 h-3"/>
                       </button>
                     </span>
                   ))}
                   <input type="text" value={creatorSearch} onChange={e => setCreatorSearch(e.target.value)} placeholder={formData.selectedCreators.length === 0 ? "جستجوی شخص..." : ""} className="bg-transparent text-sm text-white outline-none flex-grow min-w-[150px] border-none py-1 placeholder-white/30" />
                </div>
                {creatorSearch && searchResultsCreators.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 max-h-48 overflow-y-auto">
                    {searchResultsCreators.map(c => (
                      <button key={c.id} onClick={() => { setFormData({...formData, selectedCreators: [...formData.selectedCreators, c]}); setCreatorSearch(''); }} className="w-full text-right px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-emerald-400">{c.name}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
             <p className="text-sm text-gray-400 mb-4">با جستجو در فیلد زیر، محتواها را به این پرونده الصاق کنید. محدودیت تعدادی وجود ندارد.</p>
             <div className="relative">
                <Icon name="search" className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" />
                <input type="text" value={contentSearch} onChange={e => setContentSearch(e.target.value)} placeholder="جستجوی عنوان محتوا..." className="w-full bg-[#080c16] border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" />
                
                {contentSearch && searchResultsContents.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#0b0f19] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 max-h-60 overflow-y-auto">
                    {searchResultsContents.map(c => (
                      <button key={c.id} onClick={() => { setFormData({...formData, selectedContents: [c, ...formData.selectedContents]}); setContentSearch(''); }} className="w-full text-right px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-white flex justify-between">
                         <span className="text-[#06b6d4]">{c.titleBase}</span> <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">{c.type}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>
             
             {formData.selectedContents.length > 0 ? (
               <div className="border border-white/10 rounded-2xl p-4 bg-black/20 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {formData.selectedContents.map((c, i) => (
                    <div key={c.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                       <span className="text-sm font-bold text-white">{c.titleBase}</span>
                       <div className="flex items-center gap-4">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/50 text-emerald-400 font-sans`}>{c.type}</span>
                         {/* باگ دکمه حذف اینجا برطرف شد */}
                         <button type="button" onClick={() => setFormData({...formData, selectedContents: formData.selectedContents.filter(item => item.id !== c.id)})} className="hover:text-rose-500 transition-colors">
                           <Icon name="close" className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="border border-white/10 border-dashed rounded-2xl p-10 text-center text-gray-600 text-sm">هیچ محتوایی متصل نشده است.</div>
             )}
          </div>
        );
      case 'cta':
        return (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-sm font-bold text-white">نمایش باکس پورتال ارتباط امن (انتهای صفحه)</span>
              <button onClick={() => setFormData({...formData, showTipLine: !formData.showTipLine})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.showTipLine ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.showTipLine ? 'left-1' : 'right-1'}`} />
              </button>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${!formData.showTipLine && 'opacity-30 pointer-events-none'}`}>
              <div><label className="block text-xs text-gray-400 mb-2">روتیتر پورتال</label><input type="text" value={formData.tipPreTitle} onChange={(e) => setFormData({...formData, tipPreTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="پورتال ارتباط امن" /></div>
              <div><label className="block text-xs text-gray-400 mb-2">تیتر اصلی پورتال</label><input type="text" value={formData.tipTitle} onChange={(e) => setFormData({...formData, tipTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="سندی در دست دارید؟" /></div>
              <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-2">متن توضیحات (دو خطی)</label><textarea rows="3" value={formData.tipDesc} onChange={(e) => setFormData({...formData, tipDesc: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] resize-none placeholder-white/30" style={autofillFixStyle} placeholder="توضیحات باکس پورتال را بنویسید..."></textarea></div>
              
              <div><label className="block text-xs text-gray-400 mb-2">متن روی دکمه</label><input type="text" value={formData.tipBtnText} onChange={(e) => setFormData({...formData, tipBtnText: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="ارسال امن سند" /></div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-2">آیکون دکمه</label>
                <div className="flex gap-2">
                  <div className="w-12 h-[46px] flex items-center justify-center bg-white/5 border border-white/10 rounded-xl"><Icon name={formData.tipBtnIcon || 'folder'} className="w-5 h-5 text-gray-400" /></div>
                  <button onClick={() => setMediaModal({ isOpen: true, targetField: 'tipBtnIcon' })} className="flex-grow bg-[#080c16] border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-xs transition-colors cursor-pointer text-center">انتخاب آیکون از رسانه</button>
                </div>
              </div>
              
              <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-2">لینک اتصال دکمه</label><input type="text" dir="ltr" value={formData.tipBtnLink} onChange={(e) => setFormData({...formData, tipBtnLink: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-white/30" style={autofillFixStyle} placeholder="https://..." /></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans text-right select-none pb-20">
      
      {/* هدر صفحه و تب‌های اصلی مدیریت */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Icon name="folder" className="w-8 h-8 text-[#06b6d4]" /> مدیریت منظومه‌ها (پرونده‌ها)
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-xl leading-relaxed">
              مدیریت یکپارچه محتوای هاب اصلی و ساخت/ویرایش پرونده‌های تخصصی.
            </p>
          </div>
          
          <div className="flex bg-[#080c16] p-1.5 rounded-2xl border border-white/10 shadow-inner w-full lg:w-auto">
            <button onClick={() => setActiveTab('HUB_SETTINGS')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'HUB_SETTINGS' ? 'bg-[#06b6d4]/20 text-white border border-[#06b6d4]/30 shadow-md' : 'text-gray-400 hover:text-white'}`}>تنظیمات هاب</button>
            <button onClick={() => setActiveTab('DOSSIER_LIST')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'DOSSIER_LIST' ? 'bg-[#8b5cf6]/20 text-white border border-[#8b5cf6]/30 shadow-md' : 'text-gray-400 hover:text-white'}`}>مدیریت پرونده‌ها</button>
          </div>
        </div>
      </motion.div>

      {/* ======================================================= */}
      {/* تب اول: تنظیمات هاب */}
      <AnimatePresence mode="wait">
        {activeTab === 'HUB_SETTINGS' && (
          <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="relative rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">متون صفحه اصلی منظومه‌ها</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-xs text-gray-400 mb-2">عنوان اصلی صفحه (H1)</label><input type="text" value={hubSettings.title} onChange={(e)=>setHubSettings({...hubSettings, title: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#06b6d4]" /></div>
                <div><label className="block text-xs text-gray-400 mb-2">متن متا سئو</label><input type="text" value={hubSettings.metaTitle} onChange={(e)=>setHubSettings({...hubSettings, metaTitle: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#06b6d4]" /></div>
                <div><label className="block text-xs text-gray-400 mb-2">توضیح دو خطی هدر</label><textarea rows="3" value={hubSettings.description} onChange={(e)=>setHubSettings({...hubSettings, description: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#06b6d4] resize-none"></textarea></div>
                <div><label className="block text-xs text-gray-400 mb-2">توضیحات متا سئو</label><textarea rows="3" value={hubSettings.metaDesc} onChange={(e)=>setHubSettings({...hubSettings, metaDesc: e.target.value})} className="w-full bg-[#080c16] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#06b6d4] resize-none"></textarea></div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleSaveHubSettings} disabled={isSavingHub} className="px-8 py-3 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer">
                  {isSavingHub ? 'در حال ذخیره...' : 'ذخیره متون'}
                </button>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">چیدمان پرونده‌ها در هاب</h2>
                  <p className="text-xs text-gray-400">ردیف ۱: ویژه (بزرگ) | ردیف ۲ و ۳: کناری | سایر: گرید استاندارد. با موس درگ کنید.</p>
                </div>
              </div>

              {isLoading ? (
                <div className="py-10 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#06b6d4]" /></div>
              ) : dossiers.length === 0 ? (
                <div className="py-10 text-center text-gray-500 font-bold">هیچ پرونده‌ای ساخته نشده است.</div>
              ) : (
                <div className="space-y-3">
                  {dossiers.map((dossier, index) => (
                    <div 
                      key={dossier.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${draggedItem === index ? 'bg-white/5 border-dashed border-gray-500' : 'bg-[#080c16] border-white/5 hover:border-white/20 shadow-lg'}`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon name="list" className="w-5 h-5 text-gray-500 cursor-grab" />
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs border border-white/10" style={{ backgroundColor: `${dossier.themeColor}30`, borderColor: dossier.themeColor }}>
                           {toPersianDigits(index + 1)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{dossier.title}</h4>
                          <span className="text-[10px] text-gray-500 font-sans">تعداد محتوا: {toPersianDigits(dossier._count?.contents || 0)} فایل</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 hidden sm:block">
                           {index === 0 ? 'ویژه (بزرگ بالا)' : index === 1 || index === 2 ? 'ویژه (کناری)' : 'گرید استاندارد'}
                         </span>
                         <Tooltip text={dossier.isVisibleInHub ? "عدم نمایش در هاب" : "نمایش در هاب"}>
                           <button onClick={() => toggleDossierVisibility(dossier.id)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner cursor-pointer ${dossier.isVisibleInHub ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                             <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${dossier.isVisibleInHub ? 'left-1' : 'right-1'}`} />
                           </button>
                         </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* تب دوم: لیست پرونده‌ها */}
        {activeTab === 'DOSSIER_LIST' && (
          <motion.div key="dossiers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[500px]">
            <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
            
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20">
              <h2 className="text-xl font-bold text-white">آرشیو تمام پرونده‌ها</h2>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                   <Icon name="search" className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
                   <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="جستجوی عنوان..." className="w-full bg-[#080c16] border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:border-[#8b5cf6] placeholder-gray-600" />
                </div>
                <button onClick={() => openEditor()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer whitespace-nowrap">
                  <Icon name="plus" className="w-4 h-4" /> پرونده جدید
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="py-20 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#8b5cf6]" /></div>
              ) : filteredDossiers.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-bold">پرونده‌ای یافت نشد.</div>
              ) : (
                <>
                  <table className="w-full text-sm text-right text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-white/5 border-b border-white/10">
                      <tr><th className="px-6 py-4">عنوان پرونده</th><th className="px-6 py-4 text-center">محتوا</th><th className="px-6 py-4 text-center">رنگ تم</th><th className="px-6 py-4 text-center">عملیات</th></tr>
                    </thead>
                    <tbody>
                      {filteredDossiers.slice(0, visibleCount).map(d => (
                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{d.title}</td>
                          <td className="px-6 py-4 text-center font-sans">{toPersianDigits(d._count?.contents || 0)}</td>
                          <td className="px-6 py-4 text-center"><div className="w-6 h-6 rounded-full mx-auto shadow-md" style={{ backgroundColor: d.themeColor || '#06b6d4' }} /></td>
                          <td className="px-6 py-4 flex justify-center gap-2">
                            <Tooltip text="نمایش صفحه (فرانت‌اِند)"><Link href={`/c/${d.slug}`} target="_blank" className="p-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors cursor-pointer inline-block"><Icon name="eye" className="w-4 h-4" /></Link></Tooltip>
                            <Tooltip text="ویرایش پرونده"><button onClick={() => openEditor(d)} className="p-2 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors cursor-pointer"><Icon name="edit" className="w-4 h-4" /></button></Tooltip>
                            <Tooltip text="حذف دائمی"><button onClick={() => setDeleteModal({ isOpen: true, id: d.id, title: d.title })} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"><Icon name="trash" className="w-4 h-4" /></button></Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDossiers.length > visibleCount && (
                    <div className="mt-8 flex justify-center"><button onClick={() => setVisibleCount(prev => prev + 5)} className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white rounded-full transition-colors cursor-pointer">نمایش بیشتر</button></div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال تایید حذف */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#0b0f19] border border-white/10 p-6 rounded-3xl shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"><Icon name="shield" className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-white mb-2">حذف پرونده</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-8">آیا از حذف پرونده «<span className="text-white font-bold">{deleteModal.title}</span>» اطمینان دارید؟</p>
              <div className="flex gap-3">
                <button onClick={confirmDelete} className="flex-1 py-3 text-white rounded-xl text-sm font-bold transition-all bg-rose-500 hover:bg-rose-600 cursor-pointer">بله، حذف کن</button>
                <button onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors cursor-pointer">انصراف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال گالری رسانه (Media Picker) */}
      <AnimatePresence>
        {mediaModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-4xl h-[80vh] bg-[#0b0f19] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
               <div className="bg-[#0b0f19] border-b border-white/10 p-5 flex justify-between items-center z-20">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2"><Icon name="image" className="w-5 h-5 text-emerald-400" /> انتخاب فایل از کتابخانه رسانه</h2>
                 <button onClick={() => setMediaModal({ isOpen: false, targetField: null })} className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-xl cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
               </div>
               <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaItems.map(media => (
                      <div key={media.id} onClick={() => handleSelectMedia(media.url)} className="group relative aspect-square bg-[#080c16] rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-emerald-500/50">
                        {media.fileType === 'IMAGE' ? (
                          <BlurImage src={media.url} alt={media.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Icon name="document" className="w-10 h-10 text-gray-600" /></div>
                        )}
                        <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">انتخاب</span></div>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال ویرایشگر جامع پرونده */}
      <AnimatePresence>
        {isDossierModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsDossierModalOpen(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-5xl h-[90vh] bg-[#0b0f19] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="bg-[#0b0f19] border-b border-white/10 p-5 flex justify-between items-center z-20 shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Icon name="folder" className="w-6 h-6 text-[#8b5cf6]" /> ویرایشگر جامع پرونده</h2>
                <button onClick={() => setIsDossierModalOpen(false)} className="p-2.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-xl cursor-pointer"><Icon name="close" className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-1/4 bg-white/5 border-l border-white/10 p-4 space-y-2 overflow-y-auto">
                  {[
                    { id: 'basic', label: 'هدر و سئو', icon: 'document' },
                    { id: 'radar', label: 'رادار موضوعی و اشخاص', icon: 'trend' },
                    { id: 'content', label: 'الصاق محتوا', icon: 'video' },
                    { id: 'cta', label: 'باکس اقدام (پورتال)', icon: 'shield' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setEditorTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${editorTab === tab.id ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                      <Icon name={tab.icon} className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>
                <div className="w-3/4 p-6 overflow-y-auto custom-scrollbar relative">
                   {renderEditorForm()}
                </div>
              </div>
              <div className="bg-[#080c16] border-t border-white/10 p-4 flex justify-end gap-3 shrink-0 z-20">
                <button onClick={() => setIsDossierModalOpen(false)} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors cursor-pointer">انصراف</button>
                <button onClick={handleSaveDossier} disabled={isSavingDossier} className="px-8 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50">
                  {isSavingDossier ? 'در حال ذخیره...' : 'ذخیره پرونده'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}