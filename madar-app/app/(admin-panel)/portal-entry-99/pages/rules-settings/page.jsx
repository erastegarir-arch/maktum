'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import PersianDatePicker from '@/app/components/PersianDatePicker';
import RichTextEditor from '@/app/components/RichTextEditor';
import toast from 'react-hot-toast';

const defaultPageData = {
  hero: {
    enabled: true,
    title: "قوانین و مقررات پلتفرم مدار",
    showUpdateDate: true,
    updateDate: "۱۴۰۳/۰۵/۲۱",
    paragraphs: [
      "لطفاً پیش از استفاده از امکانات، ابزارها و بایگانی اسناد سایت مدار، مفاد این توافق‌نامه را با دقت مطالعه فرمایید."
    ]
  },
  rules: [
    {
      id: "section-1",
      enabled: true,
      number: "ماده ۱.",
      title: "تعاریف و کلیات",
      content: "<p>پلتفرم «مدار» یک بایگانی تحقیقاتی و رسانه‌ای است که با هدف جمع‌آوری و تحلیل اسناد تاریخی ایجاد شده است.</p><ul><li><strong>محتوای خام:</strong> فایل‌هایی که بدون ویرایش در اختیار قرار می‌گیرد.</li><li><strong>محتوای تولیدی:</strong> گزارش‌هایی که توسط تحریریه تولید شده‌اند.</li></ul>"
    }
  ]
};

const SectionToggle = ({ checked, onChange, colorClass = "bg-[#06b6d4]" }) => (
  <label className="flex items-center cursor-pointer gap-2">
    <span className={`text-xs font-bold ${checked !== false ? 'text-white' : 'text-gray-500'}`}>
      {checked !== false ? 'نمایش در سایت' : 'مخفی در سایت'}
    </span>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked !== false} onChange={e => onChange(e.target.checked)} />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked !== false ? colorClass : 'bg-white/10'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked !== false ? 'transform translate-x-4' : ''}`}></div>
    </div>
  </label>
);

export default function RulesSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const stored = await getSetting('rules_page_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // تبدیل فرمت قدیمی (پاراگراف + لیست) به یک content یکپارچه ادیتور در صورت وجود کدهای قدیمی
        const convertedRules = (parsed.rules || []).map(rule => {
          if (rule.content !== undefined) return rule;
          
          let combinedHtml = "";
          if (rule.paragraphs && rule.paragraphs.length > 0) {
            combinedHtml += rule.paragraphs.map(p => `<p>${p}</p>`).join("");
          }
          if (rule.list && rule.list.length > 0) {
            combinedHtml += "<ul>" + rule.list.map(l => `<li>${l}</li>`).join("") + "</ul>";
          }
          return {
            id: rule.id,
            enabled: rule.enabled,
            number: rule.number,
            title: rule.title,
            content: combinedHtml
          };
        });

        setData({
          hero: { ...defaultPageData.hero, ...(parsed.hero || {}) },
          rules: convertedRules.length > 0 ? convertedRules : defaultPageData.rules
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

    toast.promise(
      saveSetting('rules_page_data', JSON.stringify(data), 'RULES_PAGE'),
      {
        loading: 'در حال ذخیره‌سازی اطلاعات...',
        success: (res) => {
          setSaving(false);
          if (res.success) {
            router.refresh();
            return 'تغییرات صفحه قوانین با موفقیت ذخیره شد!';
          } else {
            throw new Error('خطا از سمت دیتابیس');
          }
        },
        error: () => {
          setSaving(false);
          return 'متأسفانه مشکلی در ثبت اطلاعات پیش آمد!';
        },
      }
    );
  };

  // --- مدیریت پاراگراف‌های بخش هدر ---
  const handleHeroParagraphChange = (index, value) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        paragraphs: (prev.hero.paragraphs || []).map((p, i) => (i === index ? value : p))
      }
    }));
  };

  const addHeroParagraph = () => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        paragraphs: [...(prev.hero.paragraphs || []), ""]
      }
    }));
  };

  const removeHeroParagraph = (index) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        paragraphs: (prev.hero.paragraphs || []).filter((_, i) => i !== index)
      }
    }));
  };

  // --- مدیریت باکس‌های قوانین (Rules) ---
  const addRule = () => {
    const newId = `section-${Date.now()}`;
    setData(prev => ({
      ...prev,
      rules: [
        ...(prev.rules || []),
        {
          id: newId,
          enabled: true,
          number: `ماده ${(prev.rules || []).length + 1}.`,
          title: "عنوان جدید",
          content: ""
        }
      ]
    }));
  };

  const removeRule = (index) => {
    setData(prev => ({
      ...prev,
      rules: (prev.rules || []).filter((_, i) => i !== index)
    }));
  };

  const handleRuleChange = (index, field, value) => {
    setData(prev => ({
      ...prev,
      rules: (prev.rules || []).map((rule, i) => (i === index ? { ...rule, [field]: value } : rule))
    }));
  };

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تنظیمات صفحه قوانین و مقررات</h1>
        <p className="text-sm text-gray-400">مدیریت هدر، تاریخ آپدیت و مواد قانونی (ساخت فهرست مندرجات سمت راست کاملاً خودکار است).</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-10 backdrop-blur-md">
        
        {/* ۱. هدر اصلی و تاریخ به‌روزرسانی */}
        <div className={`space-y-4 p-5 bg-black/20 rounded-2xl border transition-colors ${data.hero.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'}`}>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#06b6d4]">۱. هدر اصلی (معرفی)</h2>
            <SectionToggle checked={data.hero.enabled} onChange={val => setData(prev => ({...prev, hero: {...prev.hero, enabled: val}}))} colorClass="bg-[#06b6d4]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-300">عنوان اصلی</label>
              <input type="text" value={data.hero.title || ''} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
            </div>

            {/* تاریخ آخرین به‌روزرسانی با تقویم جلالی پاپ‌آپی */}
            <div className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-xl relative z-50">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Icon name="calendar" className="w-4 h-4" /> تاریخ آخرین به‌روزرسانی
                </label>
                <label className="flex items-center cursor-pointer gap-2">
                  <span className="text-[10px] text-gray-400">نمایش تاریخ</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={data.hero.showUpdateDate !== false} onChange={e => setData(prev => ({...prev, hero: {...prev.hero, showUpdateDate: e.target.checked}}))} />
                    <div className={`block w-8 h-4 rounded-full transition-colors ${data.hero.showUpdateDate !== false ? 'bg-amber-500' : 'bg-white/10'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${data.hero.showUpdateDate !== false ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              
              <div className="relative w-full">
                <PersianDatePicker 
                  value={data.hero.updateDate} 
                  onChange={(newDate) => setData(prev => ({ ...prev, hero: { ...prev.hero, updateDate: newDate } }))}
                  disabled={data.hero.showUpdateDate === false}
                  placeholder="انتخاب تاریخ شمسی..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-300 font-bold">پاراگراف‌های توضیحات</label>
              <button type="button" onClick={addHeroParagraph} className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-3 py-1 rounded-lg hover:bg-[#06b6d4]/30 cursor-pointer">+ افزودن پاراگراف</button>
            </div>
            {(data.hero.paragraphs || []).map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <textarea rows="3" value={p} onChange={e => handleHeroParagraphChange(i, e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4]" />
                <button type="button" onClick={() => removeHeroParagraph(i)} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 text-xs shrink-0 cursor-pointer">حذف</button>
              </div>
            ))}
          </div>
        </div>

        {/* ۲. بخش مدیریت ماده‌ها (قوانین) با ادیتور متنی یکپارچه */}
        <div className="space-y-4 p-5 bg-black/20 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">۲. مدیریت مواد و تبصره‌های قانونی</h2>
              <p className="text-[11px] text-gray-400 mt-1">عناوین این باکس‌ها به صورت خودکار در «فهرست مندرجات» قرار می‌گیرند و لینک می‌شوند.</p>
            </div>
            <button type="button" onClick={addRule} className="text-xs bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl hover:bg-emerald-500/30 cursor-pointer font-bold">+ افزودن باکس قانون جدید</button>
          </div>

          <div className="space-y-8 pt-4">
            {data.rules.map((rule, idx) => (
              <div key={rule.id} className={`p-5 bg-white/5 border rounded-2xl relative transition-colors ${rule.enabled !== false ? 'border-white/10' : 'border-rose-500/30 opacity-60'}`}>
                
                {/* هدر باکس قانون */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
                  <span className="text-sm font-bold text-[#06b6d4]">باکس قانونی {idx + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer gap-2">
                      <span className="text-[10px] text-gray-400">وضعیت نمایش</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={rule.enabled !== false} onChange={e => handleRuleChange(idx, 'enabled', e.target.checked)} />
                        <div className={`block w-8 h-4 rounded-full transition-colors ${rule.enabled !== false ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${rule.enabled !== false ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    <button type="button" onClick={() => removeRule(idx)} className="text-[11px] text-rose-400 hover:text-rose-300">حذف کل این باکس</button>
                  </div>
                </div>

                {/* عنوان دو قسمتی */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] text-[#06b6d4] block mb-1">بخش اول عنوان (متن آبی‌رنگ)</label>
                    <input type="text" value={rule.number || ''} onChange={e => handleRuleChange(idx, 'number', e.target.value)} className="w-full bg-[#0b0f19] border border-[#06b6d4]/30 rounded-lg p-2 text-sm text-[#06b6d4] font-bold focus:border-[#06b6d4]" placeholder="مثلاً: ماده ۱." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-white block mb-1">بخش دوم عنوان (متن سفیدرنگ)</label>
                    <input type="text" value={rule.title || ''} onChange={e => handleRuleChange(idx, 'title', e.target.value)} className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white font-bold focus:border-white/30" placeholder="مثلاً: تعاریف و کلیات" />
                  </div>
                </div>

                {/* ادیتور متنی یکپارچه برای محتوای ماده قانون */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 font-bold block">محتوا و توضیحات ماده قانون</label>
                  <RichTextEditor 
                    value={rule.content || ''} 
                    onChange={(newContent) => handleRuleChange(idx, 'content', newContent)} 
                    placeholder="محتوا، پاراگراف‌ها و لیست‌های این ماده را اینجا بنویسید..."
                  />
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer">
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات قوانین'}
          </button>
        </div>

      </form>
    </div>
  );
}