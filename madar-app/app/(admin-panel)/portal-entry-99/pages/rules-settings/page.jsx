'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import PersianDatePicker from '@/app/components/PersianDatePicker';
import RichTextEditor from '@/app/components/RichTextEditor';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

// کامپوننت سوئیچ وضعیت گلس‌مورفی
const SectionToggle = ({ checked, onChange, colorClass = "bg-[#06b6d4]" }) => (
  <label className="flex items-center cursor-pointer gap-2 select-none group/toggle">
    <span className={`text-xs font-bold transition-colors ${checked !== false ? 'text-white' : 'text-gray-500'}`}>
      {checked !== false ? 'نمایش در سایت' : 'مخفی در سایت'}
    </span>
    <div className="relative">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked !== false} 
        onChange={e => onChange(e.target.checked)} 
      />
      <div className={`block w-11 h-6 rounded-full transition-colors border border-transparent shadow-inner ${checked !== false ? colorClass : 'bg-black/30'}`}></div>
      <div className={`absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${checked !== false ? '-translate-x-5' : ''}`}></div>
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

        // تبدیل فرمت قدیمی به content یکپارچه ادیتور در صورت وجود کدهای قدیمی
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
          title: "عنوان قانون",
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#06b6d4] rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-bold animate-pulse font-sans">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right select-none">

      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_10px_#06b6d4]"></span>
            تنظیمات صفحه قوانین و مقررات
          </h1>
          <p className="text-sm text-gray-400 font-light">مدیریت هدر، تاریخ آپدیت و مواد قانونی (ساخت فهرست مندرجات کاملاً خودکار است).</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 animate-[fadeIn_0.4s_ease-out]">

        {/* ۱. هدر اصلی و تاریخ به‌روزرسانی */}
        <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] group border border-transparent z-30">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl pointer-events-none -z-10 rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />

          <div className="p-6 md:p-8 space-y-6 relative z-10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="fileText" className="w-5 h-5 text-[#06b6d4]" /> ۱. هدر اصلی (معرفی)
              </h2>
              <SectionToggle 
                checked={data.hero.enabled} 
                onChange={val => setData(prev => ({...prev, hero: {...prev.hero, enabled: val}}))} 
                colorClass="bg-[#06b6d4]" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان اصلی صفحه</label>
                <input 
                  type="text" 
                  value={data.hero.title || ''} 
                  onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} 
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 focus:border focus:border-[#06b6d4] focus:bg-white/20 outline-none transition-all shadow-inner font-sans" 
                  placeholder="عنوان صفحه قوانین..."
                />
              </div>

              {/* تاریخ آخرین به‌روزرسانی */}
              <div className="space-y-2 p-4 bg-white/5 border border-transparent rounded-2xl relative shadow-inner z-40">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-amber-400 font-bold flex items-center gap-1.5 pl-1">
                    <Icon name="calendar" className="w-4 h-4" /> تاریخ آخرین به‌روزرسانی
                  </label>
                  <label className="flex items-center cursor-pointer gap-2">
                    <span className="text-[10px] text-gray-400 font-bold">نمایش تاریخ</span>
                    <input 
                      type="checkbox" 
                      checked={data.hero.showUpdateDate !== false} 
                      onChange={e => setData(prev => ({...prev, hero: {...prev.hero, showUpdateDate: e.target.checked}}))} 
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
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

            {/* پاراگراف‌های توضیحات */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">پاراگراف‌های مقدمه</label>
                <button 
                  type="button" 
                  onClick={addHeroParagraph} 
                  className="text-xs bg-white/5 border border-transparent shadow-inner text-[#06b6d4] hover:bg-[#06b6d4]/10 hover:text-white px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  + افزودن پاراگراف
                </button>
              </div>

              <div className="space-y-3">
                {(data.hero.paragraphs || []).map((p, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <textarea 
                      rows="2" 
                      value={p} 
                      onChange={e => handleHeroParagraphChange(i, e.target.value)} 
                      placeholder="متن مقدمه را اینجا وارد کنید..."
                      className="flex-1 w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 focus:border focus:border-[#06b6d4] focus:bg-white/20 transition-all outline-none resize-none font-light leading-relaxed text-justify" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeHeroParagraph(i)} 
                      className="p-3.5 bg-rose-500/10 border border-transparent text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs shrink-0 transition-colors cursor-pointer shadow-inner"
                      title="حذف این پاراگراف"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ۲. بخش مدیریت ماده‌ها (قوانین) */}
        <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent z-10">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

          <div className="p-6 md:p-8 space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="browser" className="w-5 h-5 text-[#10b981]" /> ۲. مدیریت مواد و تبصره‌های قانونی
                </h2>
                <p className="text-xs text-gray-400 font-light mt-1 pl-1">عناوین این باکس‌ها به صورت خودکار در «فهرست مندرجات» صفحه قرار می‌گیرند.</p>
              </div>
              <button 
                type="button" 
                onClick={addRule} 
                className="text-xs bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border border-transparent"
              >
                <Icon name="plus" className="w-4 h-4" /> افزودن ماده جدید
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <AnimatePresence>
                {data.rules.map((rule, idx) => (
                  <motion.div 
                    key={rule.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-6 bg-white/5 border border-transparent rounded-2xl relative transition-all shadow-inner space-y-5 ${rule.enabled !== false ? '' : 'border-rose-500/30 opacity-60'}`}
                  >
                    {/* هدر باکس قانون */}
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-sm font-bold text-[#06b6d4] pl-1">باکس قانونی شماره {idx + 1}</span>
                      <div className="flex items-center gap-4">
                        <SectionToggle 
                          checked={rule.enabled} 
                          onChange={val => handleRuleChange(idx, 'enabled', val)} 
                          colorClass="bg-[#10b981]" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeRule(idx)} 
                          className="text-xs bg-white/5 border border-transparent shadow-inner text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold mr-2 px-2 py-1 rounded"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" /> حذف
                        </button>
                      </div>
                    </div>

                    {/* عنوان دو قسمتی */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-1.5">
                        <label className="text-xs text-[#06b6d4] font-bold block pl-1">بخش اول عنوان (فیروزه‌ای)</label>
                        <input 
                          type="text" 
                          value={rule.number || ''} 
                          onChange={e => handleRuleChange(idx, 'number', e.target.value)} 
                          className="w-full bg-white/10 border border-[#06b6d4]/40 rounded-xl p-3.5 text-sm text-[#06b6d4] font-bold focus:border focus:border-[#06b6d4] focus:bg-white/20 outline-none transition-all shadow-inner font-sans" 
                          placeholder="مثلاً: ماده ۱." 
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs text-white font-bold block pl-1">بخش دوم عنوان (سفید)</label>
                        <input 
                          type="text" 
                          value={rule.title || ''} 
                          onChange={e => handleRuleChange(idx, 'title', e.target.value)} 
                          className="w-full bg-white/10 border border-white/10 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-white/40 font-bold focus:border focus:border-white/40 focus:bg-white/20 outline-none transition-all font-sans" 
                          placeholder="مثلاً: تعاریف و کلیات" 
                        />
                      </div>
                    </div>

                    {/* ادیتور متنی یکپارچه Tiptap برای محتوای ماده قانون */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-300 font-bold block pl-1">متن و بندهای این ماده</label>
                      <RichTextEditor 
                        value={rule.content || ''} 
                        onChange={(newContent) => handleRuleChange(idx, 'content', newContent)} 
                        placeholder="متن، توضیحات، نقل‌قول‌ها و لیست‌های این ماده را اینجا بنویسید..."
                        activeTheme={{ bg: 'bg-[#06b6d4]', text: 'text-[#06b6d4]' }}
                      />
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* دکمه ذخیره کلی */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={saving} 
            className="px-10 py-4 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2 border border-transparent"
          >
            <Icon name="checkCircle" className="w-5 h-5" />
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات قوانین'}
          </button>
        </div>

      </form>
    </div>
  );
}