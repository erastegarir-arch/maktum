'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// داده‌های اولیه بدون اطلاعات آیکون
const defaultPageData = {
  hero: {
    enabled: true,
    badge: "همکاری با شبکه",
    highlight: "مدار",
    paragraphs: [
      "ما در مدار به دنبال توسعه یک زنجیره قدرتمند از پژوهشگران، برنامه‌نویسان، هنرمندان رسانه‌ای و فعالان فرهنگی هستیم. اگر در مسیر تبیین حقایق و ارزش‌های انقلاب اسلامی قدم برمی‌دارید، جای شما در مدار خالی است."
    ]
  },
  collaborationOptions: [
    { enabled: true, title: "ارسال محتوای خام", desc: "ارسال عکس، فیلم و راش‌های صوتی جهت عرضه در سایت و استفاده دیگر پژوهشگران در راستای رشد و تبیین ارزش‌های انقلاب اسلامی.", color: "#fbbf24" },
    { enabled: true, title: "محتوای تولیدی", desc: "آیا محتوایی با استفاده از راش‌های مدار تولید کرده‌اید؟ یا محتوای باکیفیتی دارید که راضی به انتشار رایگان آن هستید؟ ما در دیده شدن آن کمک می‌کنیم.", color: "#f43f5e" },
    { enabled: true, title: "شبکه توزیع و نشر", desc: "اگر در انتشار و وایرال کردن محتوای تولید شده در شبکه‌های اجتماعی توانمندی دارید و می‌توانید صدای پلتفرم مدار را به گوش مخاطبان بیشتری برسانید.", color: "#06b6d4" },
    { enabled: true, title: "پیوستن به شبکه فعالان", desc: "اگر توانایی در عرصه‌های مختلف رسانه‌ای دارید (تدوین، گرافیک، پژوهش و...) فرم رزومه را تکمیل کنید تا در صورت وجود پروژه به شما اطلاع دهیم.", color: "#10b981" },
    { enabled: true, title: "درخواست نیروی سازمان‌ها", desc: "اگر سازمان یا گروهی هستید که برای پیشبرد پروژه‌های خود نیاز به معرفی نیروی فعال، توانمند و انقلابی دارید، درخواست خود را برای ما ارسال کنید.", color: "#d946ef" },
    { enabled: true, title: "توسعه زیرساخت فنی", desc: "مدار یک پلتفرم در حال رشد است. اگر در زمینه برنامه‌نویسی، توسعه ابزارهای هوش مصنوعی و زیرساخت‌های سروری تخصص دارید، دست یاری شما را می‌فشاریم.", color: "#3b82f6" }
  ],
  proposal: {
    enabled: true,
    title: "پیشنهاد و ایده آزاد",
    paragraphs: [
      "ایده‌ای خارج از چارچوب‌های بالا دارید؟ توانمندی و پیشنهاد خاصی دارید که فکر می‌کنید می‌تواند به جریان انقلاب اسلامی و پلتفرم مدار کمک کند؟ ما مشتاقانه آماده شنیدن ایده‌های شما هستیم."
    ],
    color: "#fbbf24"
  }
};

const SectionToggle = ({ checked, onChange, colorClass = "bg-[#06b6d4]" }) => (
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

export default function CollaborationSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const stored = await getSetting('collaboration_page_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({
          hero: { ...defaultPageData.hero, ...(parsed.hero || {}) },
          collaborationOptions: parsed.collaborationOptions?.length === 6 ? parsed.collaborationOptions : defaultPageData.collaborationOptions,
          proposal: { ...defaultPageData.proposal, ...(parsed.proposal || {}) }
        });
      } catch {
        setData(defaultPageData);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const savePromise = saveSetting('collaboration_page_data', JSON.stringify(data), 'COLLABORATION_PAGE');

    toast.promise(
      savePromise,
      {
        loading: 'در حال ذخیره‌سازی اطلاعات...',
        success: (res) => {
          setSaving(false);
          if (res.success) {
            router.refresh();
            return 'اطلاعات با موفقیت ذخیره شد!';
          } else {
            throw new Error('خطا در ثبت اطلاعات!');
          }
        },
        error: () => {
          setSaving(false);
          return 'خطا در برقراری ارتباط با دیتابیس!';
        }
      }
    );
  };

  const handleHeroParagraphChange = (index, value) => {
    setData(prev => {
      const updated = [...prev.hero.paragraphs];
      updated[index] = value;
      return { ...prev, hero: { ...prev.hero, paragraphs: updated } };
    });
  };

  const handleProposalParagraphChange = (index, value) => {
    setData(prev => {
      const updated = [...prev.proposal.paragraphs];
      updated[index] = value;
      return { ...prev, proposal: { ...prev.proposal, paragraphs: updated } };
    });
  };

  const handleOptionChange = (index, field, value) => {
    setData(prev => {
      const updated = [...prev.collaborationOptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, collaborationOptions: updated };
    });
  };

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تنظیمات صفحه همکاری با ما</h1>
        <p className="text-sm text-gray-400">آیکون‌های صفحه ثابت هستند، در اینجا فقط متون، رنگ تم و روشن/خاموش بودن را مدیریت کنید.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-10 backdrop-blur-md">
        
        {/* ۱. هدر اصلی */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.hero.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#06b6d4]">۱. هدر اصلی (معرفی)</h2>
            <SectionToggle checked={data.hero.enabled} onChange={val => setData(prev => ({...prev, hero: {...prev.hero, enabled: val}}))} colorClass="bg-[#06b6d4]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">متن خاکستری (بج)</label>
              <input type="text" value={data.hero.badge || ''} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, badge: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300">کلمه رنگی (هایلایت)</label>
              <input type="text" value={data.hero.highlight || ''} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, highlight: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-300 font-bold">پاراگراف‌های توضیحات</label>
              <button type="button" onClick={() => setData(prev => ({...prev, hero: {...prev.hero, paragraphs: [...prev.hero.paragraphs, ""]}}))} className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-3 py-1 rounded-lg hover:bg-[#06b6d4]/30 cursor-pointer">+ افزودن پاراگراف</button>
            </div>
            {(data.hero.paragraphs || []).map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <textarea rows="3" value={p} onChange={e => handleHeroParagraphChange(i, e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
                <button type="button" onClick={() => setData(prev => ({...prev, hero: {...prev.hero, paragraphs: prev.hero.paragraphs.filter((_, idx) => idx !== i)}}))} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 text-xs shrink-0 cursor-pointer">حذف</button>
              </div>
            ))}
          </div>
        </div>

        {/* ۲. کارت‌های همکاری */}
        <div className="space-y-4 p-5 bg-black/20 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-white">۲. کارت‌های گزینه‌های همکاری</h2>
          </div>

          <div className="space-y-4 pt-2">
            {data.collaborationOptions.map((item, idx) => (
              <div key={idx} className={cn("p-4 bg-white/5 border rounded-xl space-y-3 relative transition-colors", item.enabled !== false ? 'border-white/10' : 'border-rose-500/30 opacity-60')}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400 font-bold">کارت {idx + 1}</span>
                  
                  <label className="flex items-center cursor-pointer gap-2">
                    <span className="text-[10px] text-gray-400">نمایش کارت</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={item.enabled !== false} onChange={e => handleOptionChange(idx, 'enabled', e.target.checked)} />
                      <div className={cn("block w-8 h-4 rounded-full transition-colors", item.enabled !== false ? 'bg-emerald-500' : 'bg-white/10')}></div>
                      <div className={cn("absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform", item.enabled !== false ? 'transform translate-x-4' : '')}></div>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-2">عنوان کارت</label>
                    <input type="text" value={item.title || ''} onChange={e => handleOptionChange(idx, 'title', e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-2">رنگ تم (هاور و سایه)</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={item.color || '#06b6d4'} onChange={e => handleOptionChange(idx, 'color', e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={item.color || '#06b6d4'} onChange={e => handleOptionChange(idx, 'color', e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs text-white dir-ltr text-center uppercase" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">توضیحات کوتاه</label>
                  <textarea rows="2" value={item.desc || ''} onChange={e => handleOptionChange(idx, 'desc', e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ۳. پیشنهاد آزاد */}
        <div className={cn("space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors", data.proposal.enabled !== false ? 'border-amber-500/30' : 'border-rose-500/30 opacity-60')}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#fbbf24]">۳. بخش پیشنهاد و ایده آزاد</h2>
            <SectionToggle checked={data.proposal.enabled} onChange={val => setData(prev => ({...prev, proposal: {...prev.proposal, enabled: val}}))} colorClass="bg-[#fbbf24]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان بخش</label>
              <input type="text" value={data.proposal.title || ''} onChange={e => setData(prev => ({ ...prev, proposal: { ...prev.proposal, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#fbbf24]" />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-2">رنگ تم بخش</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={data.proposal.color || '#fbbf24'} onChange={e => setData(prev => ({ ...prev, proposal: { ...prev.proposal, color: e.target.value } }))} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                <input type="text" value={data.proposal.color || '#fbbf24'} onChange={e => setData(prev => ({ ...prev, proposal: { ...prev.proposal, color: e.target.value } }))} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-xs text-white dir-ltr text-center uppercase" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-300 font-bold">پاراگراف‌های توضیحات</label>
              <button type="button" onClick={() => setData(prev => ({...prev, proposal: {...prev.proposal, paragraphs: [...prev.proposal.paragraphs, ""]}}))} className="text-xs bg-[#fbbf24]/20 text-[#fbbf24] px-3 py-1 rounded-lg hover:bg-[#fbbf24]/30 cursor-pointer">+ افزودن پاراگراف</button>
            </div>
            {(data.proposal.paragraphs || []).map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <textarea rows="3" value={p} onChange={e => handleProposalParagraphChange(i, e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#fbbf24]" />
                <button type="button" onClick={() => setData(prev => ({...prev, proposal: {...prev.proposal, paragraphs: prev.proposal.paragraphs.filter((_, idx) => idx !== i)}}))} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 text-xs shrink-0 cursor-pointer">حذف</button>
              </div>
            ))}
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