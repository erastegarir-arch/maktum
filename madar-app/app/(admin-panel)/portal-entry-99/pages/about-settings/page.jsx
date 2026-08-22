'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const defaultPageData = {
  hero: { enabled: true, title: "در مدار انقلاب اسلامی", paragraphs: [""] },
  waqf: { enabled: true, titlePart1: "نذر فرهنگی و ", titlePart2: "عهد آسمانی", paragraphs: [""] },
  ecosystem: { enabled: true, badge: "یک زیست‌بوم زنده", titlePart1: "فراتر از یک آرشیو؛", titlePart2: "یک اکوسیستم رسانه‌ای", paragraphs: [""] },
  connection: { enabled: true, title: "پر کردن خلأها؛ اتصال در مدار انقلاب", paragraphs: [""] },
  features: {
    enabled: true, title: "در مدار چه می‌گذرد؟", subtitle: "خدمات اصلی زیست‌بوم رسانه‌ای مدار",
    items: [
      { title: "تأمین راش و مصالح تولید", desc: "", color: "#f59e0b" },
      { title: "مرکز داده و شبکه‌سازی انسانی", desc: "", color: "#06b6d4" },
      { title: "جعبه ابزار رسانه‌ای", desc: "", color: "#10b981" },
      { title: "حمایت از انتشار", desc: "", color: "#a855f7" }
    ]
  },
  contact: {
    enabled: true, title: "هم‌افزایی در این موکب رسانه‌ای", description: "",
    email: { value: "", tooltip: "" },
    phone: { value: "", tooltip: "" },
    address: { value: "" },
    socialConnection: {
      triggerWord: "راه‌های ارتباطی",
      triggerTooltip: "مشاهده شبکه‌های اجتماعی",
      triggerIconUrl: "",
      popupTitle: "ارتباط با ما",
      popupDesc: "از طریق پیام‌رسان‌های زیر با ما در ارتباط باشید.",
      popupLinks: []
    }
  },
  socials: [] // شبکه‌های اجتماعی پایین صفحه که حالا داینامیک هستند
};

const SectionToggle = ({ checked, onChange, colorClass }) => (
  <label className="flex items-center cursor-pointer gap-2">
    <span className={cn("text-xs font-bold", checked !== false ? 'text-white' : 'text-gray-500')}>
      {checked !== false ? 'نمایش در سایت' : 'مخفی در سایت'}
    </span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked !== false} onChange={e => onChange(e.target.checked)} />
      <div className={cn("block w-10 h-6 rounded-full transition-colors border border-transparent shadow-inner", checked !== false ? colorClass : 'bg-black/30')}></div>
      <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md", checked !== false ? 'transform translate-x-4' : '')}></div>
    </div>
  </label>
);

export default function AboutSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // استیت پاپ‌آپ انتخابگر رسانه
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);

  useEffect(() => {
    async function loadData() {
      const stored = await getSetting('about_page_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          setData({
            hero: { ...defaultPageData.hero, ...(parsed.hero || {}) },
            waqf: { ...defaultPageData.waqf, ...(parsed.waqf || {}) },
            ecosystem: { ...defaultPageData.ecosystem, ...(parsed.ecosystem || {}) },
            connection: { ...defaultPageData.connection, ...(parsed.connection || {}) },
            features: {
              ...defaultPageData.features,
              ...(parsed.features || {}),
              items: parsed.features?.items || defaultPageData.features.items
            },
            contact: {
              ...defaultPageData.contact,
              ...(parsed.contact || {}),
              email: { ...defaultPageData.contact.email, ...(parsed.contact?.email || {}) },
              phone: { ...defaultPageData.contact.phone, ...(parsed.contact?.phone || {}) },
              address: { ...defaultPageData.contact.address, ...(parsed.contact?.address || {}) },
              socialConnection: { ...defaultPageData.contact.socialConnection, ...(parsed.contact?.socialConnection || {}) }
            },
            socials: parsed.socials || []
          });
        } catch {
          setData(defaultPageData);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    toast.promise(
      saveSetting('about_page_data', JSON.stringify(data), 'ABOUT_PAGE'),
      {
        loading: 'در حال ذخیره‌سازی اطلاعات...',
        success: (res) => {
          setSaving(false);
          if (res.success) {
            router.refresh();
            return 'اطلاعات با موفقیت ذخیره شد!';
          } else {
            throw new Error();
          }
        },
        error: () => {
          setSaving(false);
          return 'خطا در ثبت اطلاعات!';
        }
      }
    );
  };

  const handleParagraphChange = (section, index, value) => {
    setData(prev => {
      const updated = [...prev[section].paragraphs];
      updated[index] = value;
      return { ...prev, [section]: { ...prev[section], paragraphs: updated } };
    });
  };

  // رفع باگ String/Number در جستجوی ID و اصلاح متغیرها
  const addSocial = () => setData(prev => ({ ...prev, socials: [...(prev.socials || []), { id: Date.now(), iconUrl: '', url: '', tooltip: '', color: '#06b6d4' }] }));
  const updateSocial = (id, field, value) => setData(prev => ({ ...prev, socials: prev.socials.map(s => String(s.id) === String(id) ? { ...s, [field]: value } : s) }));
  const removeSocial = (id) => setData(prev => ({ ...prev, socials: prev.socials.filter(s => String(s.id) !== String(id)) }));

  const addPopupSocial = () => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, popupLinks: [...(prev.contact.socialConnection.popupLinks || []), { id: Date.now(), iconUrl: '', url: '', tooltip: '', hoverColor: '#10b981' }] } } }));
  const updatePopupSocial = (id, field, value) => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, popupLinks: prev.contact.socialConnection.popupLinks.map(s => String(s.id) === String(id) ? { ...s, [field]: value } : s) } } }));
  const removePopupSocial = (id) => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, popupLinks: prev.contact.socialConnection.popupLinks.filter(s => String(s.id) !== String(id)) } } }));

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right select-none">
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          تنظیمات صفحه درباره ما
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت متن‌ها، راه‌های ارتباطی و شبکه‌های اجتماعی</p>
      </div>

      <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-10 relative z-10">
          
          {/* ۱. معرفی */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.hero.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#06b6d4]">۱. بخش اول (Hero - معرفی اصلی)</h2>
              <SectionToggle checked={data.hero.enabled} onChange={val => setData(prev => ({...prev, hero: {...prev.hero, enabled: val}}))} colorClass="bg-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">عنوان اصلی</label>
              <input type="text" value={data.hero.title || ''} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#06b6d4] focus:bg-white/20 transition-all outline-none" />
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-xs text-gray-300 font-bold pl-1">پاراگراف‌های توضیحات</label>
              {(data.hero.paragraphs || []).map((p, i) => (
                <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('hero', i, e.target.value)} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#06b6d4] focus:bg-white/20 transition-all outline-none resize-none" />
              ))}
            </div>
          </div>

          {/* ۲. عهد آسمانی */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.waqf.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-amber-500">۲. بخش عهد آسمانی</h2>
              <SectionToggle checked={data.waqf.enabled} onChange={val => setData(prev => ({...prev, waqf: {...prev.waqf, enabled: val}}))} colorClass="bg-amber-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان اول</label>
                <input type="text" value={data.waqf.titlePart1 || ''} onChange={e => setData(prev => ({ ...prev, waqf: { ...prev.waqf, titlePart1: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-amber-500 focus:bg-white/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان دوم</label>
                <input type="text" value={data.waqf.titlePart2 || ''} onChange={e => setData(prev => ({ ...prev, waqf: { ...prev.waqf, titlePart2: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-amber-500 focus:bg-white/20 transition-all outline-none" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-xs text-gray-300 font-bold pl-1">پاراگراف‌های وقف‌نامه</label>
              {(data.waqf.paragraphs || []).map((p, i) => (
                <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('waqf', i, e.target.value)} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-amber-500 focus:bg-white/20 transition-all outline-none resize-none" />
              ))}
            </div>
          </div>

          {/* ۳. زیست‌بوم */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.ecosystem.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#a855f7]">۳. بخش زیست‌بوم رسانه‌ای</h2>
              <SectionToggle checked={data.ecosystem.enabled} onChange={val => setData(prev => ({...prev, ecosystem: {...prev.ecosystem, enabled: val}}))} colorClass="bg-[#a855f7]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">بج (نشان شناور)</label>
                <input type="text" value={data.ecosystem.badge || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, badge: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#a855f7] focus:bg-white/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان سطر اول</label>
                <input type="text" value={data.ecosystem.titlePart1 || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, titlePart1: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#a855f7] focus:bg-white/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان سطر دوم</label>
                <input type="text" value={data.ecosystem.titlePart2 || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, titlePart2: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#a855f7] focus:bg-white/20 transition-all outline-none" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-xs text-gray-300 font-bold pl-1">پاراگراف‌های زیست‌بوم</label>
              {(data.ecosystem.paragraphs || []).map((p, i) => (
                <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('ecosystem', i, e.target.value)} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#a855f7] focus:bg-white/20 transition-all outline-none resize-none" />
              ))}
            </div>
          </div>

          {/* ۴. اتصال */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.connection.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#f59e0b]">۴. بخش پر کردن خلأها</h2>
              <SectionToggle checked={data.connection.enabled} onChange={val => setData(prev => ({...prev, connection: {...prev.connection, enabled: val}}))} colorClass="bg-[#f59e0b]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">عنوان بخش</label>
              <input type="text" value={data.connection.title || ''} onChange={e => setData(prev => ({ ...prev, connection: { ...prev.connection, title: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#f59e0b] focus:bg-white/20 transition-all outline-none" />
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-xs text-gray-300 font-bold pl-1">پاراگراف‌ها</label>
              {(data.connection.paragraphs || []).map((p, i) => (
                <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('connection', i, e.target.value)} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#f59e0b] focus:bg-white/20 transition-all outline-none resize-none" />
              ))}
            </div>
          </div>

          {/* ۵. کارت‌ها */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.features.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">۵. کارت‌های خدمات اصلی</h2>
              <SectionToggle checked={data.features.enabled} onChange={val => setData(prev => ({...prev, features: {...prev.features, enabled: val}}))} colorClass="bg-[#10b981]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان اصلی گرید</label>
                <input type="text" value={data.features.title || ''} onChange={e => setData(prev => ({ ...prev, features: { ...prev.features, title: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">زیرعنوان</label>
                <input type="text" value={data.features.subtitle || ''} onChange={e => setData(prev => ({ ...prev, features: { ...prev.features, subtitle: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 transition-all outline-none" />
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {(data.features.items || []).map((item, idx) => (
                <div key={idx} className="p-5 bg-white/5 shadow-inner border border-transparent rounded-xl space-y-4 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] text-gray-400 font-bold block mb-2 pl-1">عنوان کارت</label>
                      <input type="text" value={item.title || ''} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].title = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-3 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-bold block mb-2 pl-1">رنگ کارت</label>
                      <div className="flex gap-2 items-center bg-white/10 border border-white/10 shadow-inner p-1.5 rounded-lg">
                        <input type="color" value={item.color || '#06b6d4'} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].color = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                        <input type="text" value={item.color || '#06b6d4'} readOnly className="flex-1 bg-transparent rounded-lg p-2 text-xs text-white dir-ltr text-center outline-none font-sans" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-bold block mb-2 pl-1">توضیحات کوتاه</label>
                    <textarea rows="2" value={item.desc || ''} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].desc = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-3 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 outline-none transition-all resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ۶. اطلاعات تماس یکپارچه (تلفن، ایمیل، آدرس و شبکه اجتماعی) */}
          <div className={cn("space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border transition-colors", data.contact.enabled !== false ? 'border-transparent' : 'border-rose-500/30 opacity-60')}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">۶. اطلاعات تماس و آدرس‌ها</h2>
              <SectionToggle checked={data.contact.enabled} onChange={val => setData(prev => ({...prev, contact: {...prev.contact, enabled: val}}))} colorClass="bg-[#10b981]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان بخش تماس</label>
                <input type="text" value={data.contact.title || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, title: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">توضیحات متنی</label>
                {/* افزایش ارتفاع باکس متنی به ۴ ردیف - اعمال شد */}
                <textarea rows="4" value={data.contact.description || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, description: e.target.value } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white focus:border focus:border-[#10b981] focus:bg-white/20 transition-all outline-none resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5 mt-6">
              {/* ایمیل */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-transparent shadow-inner">
                <h4 className="text-sm font-bold text-white flex items-center gap-2"><Icon name="email" className="w-4 h-4 text-[#10b981]" /> ایمیل</h4>
                <div className="space-y-2">
                  <input type="text" value={data.contact.email?.value || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, email: { ...prev.contact.email, value: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-sm text-white placeholder:text-white/40 dir-ltr text-right outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="آدرس ایمیل..." />
                  <input type="text" value={data.contact.email?.tooltip || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, email: { ...prev.contact.email, tooltip: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="توضیح تول‌تیپ..." />
                </div>
              </div>

              {/* شماره تماس */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-transparent shadow-inner">
                <h4 className="text-sm font-bold text-white flex items-center gap-2"><Icon name="phone" className="w-4 h-4 text-[#10b981]" /> شماره پشتیبانی</h4>
                <div className="space-y-2">
                  <input type="text" value={data.contact.phone?.value || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: { ...prev.contact.phone, value: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-sm text-white placeholder:text-white/40 dir-ltr text-right outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="شماره تماس..." />
                  <input type="text" value={data.contact.phone?.tooltip || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: { ...prev.contact.phone, tooltip: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="توضیح تول‌تیپ..." />
                </div>
              </div>

              {/* کادر شبکه‌های اجتماعی (لینک + پاپ‌آپ) */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-transparent shadow-inner">
                <h4 className="text-sm font-bold text-white flex items-center gap-2"><Icon name="hash" className="w-4 h-4 text-[#10b981]" /> ارتباط مجازی (پاپ‌آپ)</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-400 font-bold pl-1">آیکون دکمه</label>
                    {data.contact.socialConnection?.triggerIconUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-white/10 border border-white/10 shadow-inner rounded-lg">
                        <img src={data.contact.socialConnection.triggerIconUrl} alt="آیکون" className="w-8 h-8 object-contain bg-black/40 rounded p-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-emerald-400 font-bold truncate">آیکون انتخاب شد</p>
                        </div>
                        <button type="button" onClick={() => setMediaPickerTarget('triggerIcon')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0 border border-transparent shadow-inner">تغییر</button>
                        <button type="button" onClick={() => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, triggerIconUrl: '' } } }))} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-colors cursor-pointer shrink-0 border border-transparent shadow-inner" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget('triggerIcon')} className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 shadow-inner text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans">
                        <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب آیکون از رسانه
                      </button>
                    )}
                  </div>
                  {/* فیلد آدرس لینک حذف شد و فقط کلمه کلیک‌شونده و تول‌تیپ باقی ماند */}
                  <input type="text" value={data.contact.socialConnection?.triggerWord || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, triggerWord: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="کلمه کلیک‌شونده (مثال: راه‌های ارتباطی)" />
                  <input type="text" value={data.contact.socialConnection?.triggerTooltip || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, triggerTooltip: e.target.value } } }))} className="w-full bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" placeholder="توضیح تول‌تیپ دکمه..." />
                </div>
              </div>
            </div>

            {/* آدرس (کشیده زیر تمام کادرها) */}
            <div className="pt-2">
              <label className="text-xs text-gray-300 font-bold pl-1 block mb-2">آدرس فیزیکی دفتر / مرکز</label>
              <textarea rows="2" value={data.contact.address?.value || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, value: e.target.value } } }))} placeholder="آدرس کامل جهت نمایش در نقشه و سایت..." className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-4 text-sm text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all resize-none"></textarea>
            </div>

            {/* مدیریت محتوای پاپ‌آپ شبکه‌های اجتماعی */}
            <div className="mt-8 p-5 bg-black/20 rounded-2xl border border-transparent shadow-inner space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">محتوای پاپ‌آپ شبکه‌های اجتماعی</h3>
                  <p className="text-[10px] text-gray-400 mt-1">این پاپ‌آپ وقتی باز می‌شود که کاربر روی دکمه «{data.contact.socialConnection?.triggerWord || 'کلمه کلیک‌شونده'}» کلیک کند.</p>
                </div>
                <button type="button" onClick={addPopupSocial} className="text-xs bg-white/5 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold border border-transparent shadow-inner transition-colors">+ افزودن آیکون به پاپ‌آپ</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" value={data.contact.socialConnection?.popupTitle || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, popupTitle: e.target.value } } }))} placeholder="عنوان پاپ‌آپ (مثل: ارتباط با ما)" className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" />
                <input type="text" value={data.contact.socialConnection?.popupDesc || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, popupDesc: e.target.value } } }))} placeholder="توضیحات کوتاه پاپ‌آپ..." className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {(data.contact.socialConnection?.popupLinks || []).map((social) => (
                  <div key={social.id} className="flex flex-col gap-3 p-4 bg-white/5 border border-transparent shadow-inner rounded-xl relative">
                    <div className="space-y-2">
                      <label className="text-[11px] text-gray-400 font-bold pl-1">آیکون اتصال</label>
                      {social.iconUrl ? (
                        <div className="flex items-center gap-3 p-2 bg-white/10 border border-white/10 shadow-inner rounded-lg">
                          <img src={social.iconUrl} alt="Icon" className="w-6 h-6 object-contain bg-black/40 rounded p-1" />
                          <div className="flex-1 min-w-0"><p className="text-[10px] text-emerald-400 font-bold truncate">تنظیم شد</p></div>
                          <button type="button" onClick={() => setMediaPickerTarget(`popupSocial_${social.id}`)} className="px-2 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[10px] rounded transition-colors cursor-pointer shrink-0 border border-transparent shadow-inner">تغییر</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget(`popupSocial_${social.id}`)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 shadow-inner text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans">
                          <Icon name="image" className="w-3.5 h-3.5 text-[#10b981]" /> انتخاب از رسانه
                        </button>
                      )}
                    </div>
                    
                    {/* باکس تنظیم رنگ هاور برای آیکون پاپ‌آپ */}
                    <div className="flex items-center gap-2 bg-white/5 border border-transparent shadow-inner p-2 rounded-lg mt-1">
                      <span className="text-[11px] text-gray-300 font-bold pl-1">رنگ موس روی آیکون:</span>
                      <input type="color" value={social.hoverColor || '#10b981'} onChange={e => updatePopupSocial(social.id, 'hoverColor', e.target.value)} className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={social.hoverColor || '#10b981'} onChange={e => updatePopupSocial(social.id, 'hoverColor', e.target.value)} placeholder="#10b981" className="w-20 bg-white/10 border border-white/10 shadow-inner rounded p-1.5 text-xs text-white dir-ltr text-center outline-none font-sans" />
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-1">
                      <input type="text" placeholder="آدرس لینک (URL)" value={social.url} onChange={e => updatePopupSocial(social.id, 'url', e.target.value)} className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white placeholder:text-white/40 dir-ltr text-right outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" />
                      <input type="text" placeholder="تول‌تیپ راهنما" value={social.tooltip} onChange={e => updatePopupSocial(social.id, 'tooltip', e.target.value)} className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-xs text-white placeholder:text-white/40 text-right outline-none focus:border focus:border-[#10b981] focus:bg-white/20 transition-all" />
                    </div>
                    <button type="button" onClick={() => removePopupSocial(social.id)} className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer shadow-lg border border-rose-600 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ۷. مدیریت شبکه‌های اجتماعی فوتر (داینامیک شده با رسانه) */}
          <div className="space-y-4 p-6 bg-white/5 shadow-inner rounded-2xl border border-transparent">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#06b6d4]">۷. شبکه‌های اجتماعی اصلی سایت (پایین صفحه)</h2>
                <p className="text-xs text-gray-400 mt-1">آیکون و لینک حساب‌های رسمی مدار را اینجا مدیریت کنید.</p>
              </div>
              <button type="button" onClick={addSocial} className="text-xs bg-white/5 text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold border border-transparent shadow-inner transition-colors">+ افزودن شبکه جدید</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {(data.socials || []).map((social) => (
                <div key={social.id} className="flex flex-col gap-3 p-4 bg-white/5 border border-transparent shadow-inner rounded-xl relative">
                  
                  <div className="space-y-2">
                    <label className="text-[11px] text-gray-400 font-bold pl-1">آیکون شبکه اجتماعی</label>
                    {/* اصلاح باگ خواندن تصویر برای آیکون شبکه‌های اصلی */}
                    {social.iconUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-white/10 border border-white/10 shadow-inner rounded-lg">
                        <img src={social.iconUrl} alt="آیکون شبکه" className="w-8 h-8 object-contain bg-black/40 rounded p-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-emerald-400 font-bold truncate">تصویر تنظیم شد</p>
                        </div>
                        <button type="button" onClick={() => setMediaPickerTarget(`mainSocial_${social.id}`)} className="px-2 py-1 bg-white/10 hover:bg-[#06b6d4] text-white text-[10px] rounded transition-colors cursor-pointer shrink-0 border border-transparent shadow-inner">تغییر</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget(`mainSocial_${social.id}`)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 shadow-inner text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans">
                        <Icon name="image" className="w-4 h-4 text-[#06b6d4]" /> انتخاب از کتابخانه
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 border border-transparent shadow-inner p-2 rounded-lg">
                    <span className="text-[11px] text-gray-300 font-bold pl-1">رنگ موس روی آیکون:</span>
                    <input type="color" value={social.color || '#06b6d4'} onChange={e => updateSocial(social.id, 'color', e.target.value)} className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={social.color || '#06b6d4'} onChange={e => updateSocial(social.id, 'color', e.target.value)} placeholder="#06b6d4" className="w-20 bg-white/10 border border-white/10 shadow-inner rounded p-1.5 text-xs text-white dir-ltr text-center outline-none font-sans" />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input type="text" placeholder="آدرس لینک (URL)" value={social.url} onChange={e => updateSocial(social.id, 'url', e.target.value)} className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-sm text-white placeholder:text-white/40 dir-ltr text-right outline-none focus:border focus:border-[#06b6d4] focus:bg-white/20 transition-all font-sans" />
                    <input type="text" placeholder="تول‌تیپ راهنما" value={social.tooltip} onChange={e => updateSocial(social.id, 'tooltip', e.target.value)} className="bg-white/10 border border-white/10 shadow-inner rounded-lg p-2.5 text-sm text-white placeholder:text-white/40 text-right outline-none focus:border focus:border-[#06b6d4] focus:bg-white/20 transition-all font-sans" />
                  </div>

                  <button type="button" onClick={() => removeSocial(social.id)} className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer shadow-lg border border-rose-600 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>

        </form>

        <div className="flex justify-end p-6 md:p-8 pt-0 relative z-10">
          <button onClick={handleSave} disabled={saving} className="px-8 py-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-transparent">
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات صفحه'}
          </button>
        </div>
      </div>

      {/* پاپ آپ مودال کتابخانه رسانه */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[30] flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl"
            onClick={() => setMediaPickerTarget(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#0b0f19]/90 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent"
            >
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />
              
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0">
                <h3 className="text-white font-bold flex items-center gap-2 font-sans"><Icon name="image" className="w-5 h-5 text-[#10b981]" /> انتخاب فایل آیکون</h3>
                <button 
                  type="button"
                  onClick={() => setMediaPickerTarget(null)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full z-10 transition-colors cursor-pointer border border-transparent shadow-inner"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <MediaLibraryPage
                  isPickerMode={true}
                  onSelectMedia={(media) => {
                    if (mediaPickerTarget === 'triggerIcon') {
                      setData(prev => ({ ...prev, contact: { ...prev.contact, socialConnection: { ...prev.contact.socialConnection, triggerIconUrl: media.url } } }));
                    } else if (mediaPickerTarget.startsWith('mainSocial_')) {
                      const id = parseInt(mediaPickerTarget.split('_')[1]);
                      updateSocial(id, 'iconUrl', media.url);
                    } else if (mediaPickerTarget.startsWith('popupSocial_')) {
                      const id = parseInt(mediaPickerTarget.split('_')[1]);
                      updatePopupSocial(id, 'iconUrl', media.url);
                    }
                    setMediaPickerTarget(null);
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