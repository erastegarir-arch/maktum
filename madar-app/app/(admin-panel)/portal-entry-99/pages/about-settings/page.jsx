'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATIC_SOCIALS = [
  { id: 'aparat', title: 'آپارات', icon: 'aparat' },
  { id: 'eitaa', title: 'ایتا', icon: 'eitaa' },
  { id: 'x', title: 'ایکس', icon: 'x' },
  { id: 'instagram', title: 'اینستاگرام', icon: 'instagram' },
  { id: 'bale', title: 'بله', icon: 'bale' },
  { id: 'telegram', title: 'تلگرام', icon: 'telegram' },
  { id: 'jebhe', title: 'جبهه', icon: 'jebhe' },
  { id: 'jaryan', title: 'جریان', icon: 'jaryan' },
  { id: 'rubika', title: 'روبیکا', icon: 'rubika' },
  { id: 'soroush', title: 'سروش', icon: 'soroush' },
  { id: 'github', title: 'گیت‌هاب', icon: 'github' },
  { id: 'linkedin', title: 'لینکدین', icon: 'linkedin' },
  { id: 'mydote', title: 'مای‌دات', icon: 'mydote' },
  { id: 'whatsapp', title: 'واتساپ', icon: 'whatsapp' },
  { id: 'virasty', title: 'ویراستی', icon: 'virasty' },
  { id: 'virgool', title: 'ویرگول', icon: 'virgool' },
  { id: 'youtube', title: 'یوتیوب', icon: 'youtube' },
  { id: 'site1', title: 'سایت 1', icon: 'site' },
  { id: 'site2', title: 'سایت 2', icon: 'site' },
  { id: 'site3', title: 'سایت 3', icon: 'site' },
  { id: 'public_link', title: 'لینک عمومی', icon: 'link' },
];

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
    phone: { value: "", tooltip: "" }
  },
  socials: STATIC_SOCIALS.map(net => ({ id: net.id, url: '', tooltip: net.title, color: '#06b6d4' }))
};

const SectionToggle = ({ checked, onChange, colorClass }) => (
  <label className="flex items-center cursor-pointer gap-2">
    <span className={cn("text-xs font-bold", checked !== false ? 'text-white' : 'text-gray-500')}>
      {checked !== false ? 'نمایش در سایت' : 'مخفی در سایت'}
    </span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked !== false} onChange={e => onChange(e.target.checked)} />
      <div className={cn("block w-10 h-6 rounded-full transition-colors", checked !== false ? colorClass : 'bg-white/10')}></div>
      <div className={cn("absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform", checked !== false ? 'transform translate-x-4' : '')}></div>
    </div>
  </label>
);

export default function AboutSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const stored = await getSetting('about_page_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mergedSocials = STATIC_SOCIALS.map(staticNet => {
            const found = (parsed.socials || []).find(s => s.id === staticNet.id || s.id === staticNet.icon) || {};
            return {
              id: staticNet.id,
              url: found.url || '',
              tooltip: found.tooltip || staticNet.title,
              color: found.color || '#06b6d4'
            };
          });

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
              phone: { ...defaultPageData.contact.phone, ...(parsed.contact?.phone || {}) }
            },
            socials: mergedSocials
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

  const handleSocialChange = (id, field, value) => {
    setData(prev => {
      const updatedSocials = (prev.socials || []).map(s => s.id === id ? { ...s, [field]: value } : s);
      return { ...prev, socials: updatedSocials };
    });
  };

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تنظیمات صفحه درباره ما</h1>
        <p className="text-sm text-gray-400">مدیریت متن‌ها، راه‌های ارتباطی و شبکه‌های اجتماعی</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-10 backdrop-blur-md">
        
        {/* ۱. معرفی */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.hero.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#06b6d4]">۱. بخش اول (Hero - معرفی اصلی)</h2>
            <SectionToggle checked={data.hero.enabled} onChange={val => setData(prev => ({...prev, hero: {...prev.hero, enabled: val}}))} colorClass="bg-[#06b6d4]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-300">عنوان اصلی</label>
            <input type="text" value={data.hero.title || ''} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-xs text-gray-300 font-bold">پاراگراف‌های توضیحات</label>
            {(data.hero.paragraphs || []).map((p, i) => (
              <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('hero', i, e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
            ))}
          </div>
        </div>

        {/* ۲. عهد آسمانی */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.waqf.enabled !== false ? 'border-amber-500/20' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-amber-500">۲. بخش عهد آسمانی</h2>
            <SectionToggle checked={data.waqf.enabled} onChange={val => setData(prev => ({...prev, waqf: {...prev.waqf, enabled: val}}))} colorClass="bg-amber-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان اول</label>
              <input type="text" value={data.waqf.titlePart1 || ''} onChange={e => setData(prev => ({ ...prev, waqf: { ...prev.waqf, titlePart1: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان دوم</label>
              <input type="text" value={data.waqf.titlePart2 || ''} onChange={e => setData(prev => ({ ...prev, waqf: { ...prev.waqf, titlePart2: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-xs text-gray-300 font-bold">پاراگراف‌های وقف‌نامه</label>
            {(data.waqf.paragraphs || []).map((p, i) => (
              <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('waqf', i, e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500" />
            ))}
          </div>
        </div>

        {/* ۳. زیست‌بوم */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.ecosystem.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#a855f7]">۳. بخش زیست‌بوم رسانه‌ای</h2>
            <SectionToggle checked={data.ecosystem.enabled} onChange={val => setData(prev => ({...prev, ecosystem: {...prev.ecosystem, enabled: val}}))} colorClass="bg-[#a855f7]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">بج (نشان شناور)</label>
              <input type="text" value={data.ecosystem.badge || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, badge: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#a855f7]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان سطر اول</label>
              <input type="text" value={data.ecosystem.titlePart1 || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, titlePart1: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#a855f7]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان سطر دوم</label>
              <input type="text" value={data.ecosystem.titlePart2 || ''} onChange={e => setData(prev => ({ ...prev, ecosystem: { ...prev.ecosystem, titlePart2: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#a855f7]" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-xs text-gray-300 font-bold">پاراگراف‌های زیست‌بوم</label>
            {(data.ecosystem.paragraphs || []).map((p, i) => (
              <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('ecosystem', i, e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#a855f7]" />
            ))}
          </div>
        </div>

        {/* ۴. اتصال */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.connection.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#f59e0b]">۴. بخش پر کردن خلأها</h2>
            <SectionToggle checked={data.connection.enabled} onChange={val => setData(prev => ({...prev, connection: {...prev.connection, enabled: val}}))} colorClass="bg-[#f59e0b]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-300">عنوان بخش</label>
            <input type="text" value={data.connection.title || ''} onChange={e => setData(prev => ({ ...prev, connection: { ...prev.connection, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#f59e0b]" />
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-xs text-gray-300 font-bold">پاراگراف‌ها</label>
            {(data.connection.paragraphs || []).map((p, i) => (
              <textarea key={i} rows="3" value={p} onChange={e => handleParagraphChange('connection', i, e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#f59e0b]" />
            ))}
          </div>
        </div>

        {/* ۵. کارت‌ها */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.features.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#10b981]">۵. کارت‌های خدمات اصلی</h2>
            <SectionToggle checked={data.features.enabled} onChange={val => setData(prev => ({...prev, features: {...prev.features, enabled: val}}))} colorClass="bg-[#10b981]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-300">عنوان اصلی گرید</label>
              <input type="text" value={data.features.title || ''} onChange={e => setData(prev => ({ ...prev, features: { ...prev.features, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#10b981]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-300">زیرعنوان</label>
              <input type="text" value={data.features.subtitle || ''} onChange={e => setData(prev => ({ ...prev, features: { ...prev.features, subtitle: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#10b981]" />
            </div>
          </div>
          <div className="space-y-4 pt-2">
            {(data.features.items || []).map((item, idx) => (
              <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-2">عنوان کارت</label>
                    <input type="text" value={item.title || ''} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].title = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-2">رنگ کارت</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={item.color || '#06b6d4'} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].color = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={item.color || '#06b6d4'} readOnly className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-white dir-ltr text-center outline-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">توضیحات کوتاه</label>
                  <textarea rows="2" value={item.desc || ''} onChange={e => setData(prev => { const updated = [...prev.features.items]; updated[idx].desc = e.target.value; return { ...prev, features: { ...prev.features, items: updated } } })} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ۶. اطلاعات تماس */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.contact.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#10b981]">۶. اطلاعات تماس</h2>
            <SectionToggle checked={data.contact.enabled} onChange={val => setData(prev => ({...prev, contact: {...prev.contact, enabled: val}}))} colorClass="bg-[#10b981]" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-300">عنوان بخش تماس</label>
              <input type="text" value={data.contact.title || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-300">توضیحات متنی</label>
              <textarea rows="3" value={data.contact.description || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, description: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5 mt-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-300">آدرس ایمیل</label>
                <input type="text" value={data.contact.email?.value || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, email: { ...prev.contact.email, value: e.target.value } } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" placeholder="آدرس ایمیل..." />
                <input type="text" value={data.contact.email?.tooltip || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, email: { ...prev.contact.email, tooltip: e.target.value } } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-gray-300" placeholder="توضیح تول‌تیپ..." />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-300">شماره تماس</label>
                <input type="text" value={data.contact.phone?.value || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: { ...prev.contact.phone, value: e.target.value } } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" placeholder="شماره تماس..." />
                <input type="text" value={data.contact.phone?.tooltip || ''} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: { ...prev.contact.phone, tooltip: e.target.value } } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-gray-300" placeholder="توضیح تول‌تیپ..." />
              </div>
            </div>
          </div>
        </div>

        {/* ۷. مدیریت ۲۱ شبکه اجتماعی مرتب‌شده بر اساس الفبا */}
        <div className="space-y-6 p-5 bg-black/20 rounded-2xl border border-white/5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-[#06b6d4]">۷. مدیریت ۲۱ شبکه اجتماعی</h2>
            <p className="text-xs text-gray-400 mt-1">
              هرکدام که آدرس لینک (URL) داشته باشد در سایت فعال می‌شود و جاهای خالی خودکار پر می‌شوند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STATIC_SOCIALS.map((staticNet) => {
              const currentData = (data.socials || []).find(s => s.id === staticNet.id) || { url: '', tooltip: staticNet.title, color: '#06b6d4' };

              return (
                <div key={staticNet.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#06b6d4]"><Icon name={staticNet.icon} className="w-5 h-5" /></span>
                      <span className="text-sm font-bold text-white">{staticNet.title}</span>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded", currentData.url?.trim() ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400')}>
                      {currentData.url?.trim() ? 'روشن' : 'خاموش'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">آدرس لینک (URL)</label>
                      <input 
                        type="text" 
                        value={currentData.url || ''} 
                        onChange={e => handleSocialChange(staticNet.id, 'url', e.target.value)} 
                        className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-white dir-ltr text-left focus:border-[#06b6d4]" 
                        placeholder="https://..." 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">تول‌تیپ (Tooltip)</label>
                        <input 
                          type="text" 
                          value={currentData.tooltip || ''} 
                          onChange={e => handleSocialChange(staticNet.id, 'tooltip', e.target.value)} 
                          className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#06b6d4]" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">رنگ هاور</label>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="color" 
                            value={currentData.color || '#06b6d4'} 
                            onChange={e => handleSocialChange(staticNet.id, 'color', e.target.value)} 
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" 
                          />
                          <input 
                            type="text" 
                            value={currentData.color || '#06b6d4'} 
                            onChange={e => handleSocialChange(staticNet.id, 'color', e.target.value)} 
                            className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-white dir-ltr text-center uppercase" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer">
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات'}
          </button>
        </div>

      </form>
    </div>
  );
}