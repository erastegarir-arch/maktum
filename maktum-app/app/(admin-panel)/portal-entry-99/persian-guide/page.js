// src/app/(admin-panel)/portal-entry-99/persian-guide/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import { defaultPersianGuideData } from '@/lib/persianGuideDefaults';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';

const cn = (...inputs) => twMerge(clsx(inputs));

const SectionToggle = ({ checked, onChange, colorClass }) => (
  <label className="flex items-center cursor-pointer gap-2 select-none">
    <span className={cn('text-xs font-bold transition-colors', checked !== false ? 'text-white' : 'text-gray-500')}>
      {checked !== false ? 'نمایش در سامانه' : 'مخفی در سامانه'}
    </span>
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked !== false}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={cn(
          'block w-10 h-6 rounded-full transition-colors border border-transparent shadow-inner',
          checked !== false ? colorClass : 'bg-black/40 border-white/5'
        )}
      />
      <div
        className={cn(
          'absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md',
          checked !== false ? 'transform translate-x-4' : ''
        )}
      />
    </div>
  </label>
);

const inputClass =
  'w-full bg-black/40 border border-white/5 shadow-inner rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 focus:border focus:bg-black/60 transition-all outline-none select-text';

export default function PersianGuideSettingsPage() {
  const router = useRouter();

  const { user, isLoading: authIsLoading, loading: authLoading, isFetching, can } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const isWorking = authIsLoading || authLoading || isFetching;
    if (isWorking) return;

    if (user) {
      setHasAccess(Boolean(user.isSuperAdmin || (can && can('PERSIAN_GUIDE_EDIT'))));
    } else if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setHasAccess(false);
      } else {
        const timer = setTimeout(() => setHasAccess(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authIsLoading, authLoading, isFetching, can]);

  const [data, setData] = useState(defaultPersianGuideData);
  const [pledgeStats, setPledgeStats] = useState({
    count: defaultPersianGuideData.pledge.initialPledgeCount || 1405,
    recentPledgers: defaultPersianGuideData.pledge.recentPledgers || [],
    pendingPledgers: [],
  });
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!hasAccess) return;
      try {
        const stored = await getSetting('persian_guide_page_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          setData({
            seo: { ...defaultPersianGuideData.seo, ...(parsed.seo || {}) },
            breadcrumb: { ...defaultPersianGuideData.breadcrumb, ...(parsed.breadcrumb || {}) },
            uiLabels: { ...defaultPersianGuideData.uiLabels, ...(parsed.uiLabels || {}) },
            hero: {
              ...defaultPersianGuideData.hero,
              ...(parsed.hero || {}),
              paragraphs: parsed.hero?.paragraphs || defaultPersianGuideData.hero.paragraphs,
            },
            manifesto: {
              ...defaultPersianGuideData.manifesto,
              ...(parsed.manifesto || {}),
              paragraphs: parsed.manifesto?.paragraphs || defaultPersianGuideData.manifesto.paragraphs,
              pillars: parsed.manifesto?.pillars || defaultPersianGuideData.manifesto.pillars,
            },
            tone: {
              ...defaultPersianGuideData.tone,
              ...(parsed.tone || {}),
              paragraphs: parsed.tone?.paragraphs || defaultPersianGuideData.tone.paragraphs,
              principles: parsed.tone?.principles || defaultPersianGuideData.tone.principles,
              comparisons: parsed.tone?.comparisons || defaultPersianGuideData.tone.comparisons,
            },
            orthography: {
              ...defaultPersianGuideData.orthography,
              ...(parsed.orthography || {}),
              paragraphs: parsed.orthography?.paragraphs || defaultPersianGuideData.orthography.paragraphs,
              subSections: parsed.orthography?.subSections || defaultPersianGuideData.orthography.subSections,
            },
            punctuation: {
              ...defaultPersianGuideData.punctuation,
              ...(parsed.punctuation || {}),
              paragraphs: parsed.punctuation?.paragraphs || defaultPersianGuideData.punctuation.paragraphs,
              rules: parsed.punctuation?.rules || defaultPersianGuideData.punctuation.rules,
            },
            lexicon: {
              ...defaultPersianGuideData.lexicon,
              ...(parsed.lexicon || {}),
              paragraphs: parsed.lexicon?.paragraphs || defaultPersianGuideData.lexicon.paragraphs,
              items: parsed.lexicon?.items || defaultPersianGuideData.lexicon.items,
            },
            refiner: {
              ...defaultPersianGuideData.refiner,
              ...(parsed.refiner || {}),
            },
            toolkit: {
              ...defaultPersianGuideData.toolkit,
              ...(parsed.toolkit || {}),
              paragraphs: parsed.toolkit?.paragraphs || defaultPersianGuideData.toolkit.paragraphs,
              osTabs: parsed.toolkit?.osTabs || defaultPersianGuideData.toolkit.osTabs,
            },
            faq: {
              ...defaultPersianGuideData.faq,
              ...(parsed.faq || {}),
              items: parsed.faq?.items || defaultPersianGuideData.faq.items,
            },
            pledge: {
              ...defaultPersianGuideData.pledge,
              ...(parsed.pledge || {}),
              paragraphs: parsed.pledge?.paragraphs || defaultPersianGuideData.pledge.paragraphs,
              ecosystemLinks: parsed.pledge?.ecosystemLinks || defaultPersianGuideData.pledge.ecosystemLinks,
            },
          });
        }

        const rawStats = await getSetting('persian_guide_pledge_stats');
        if (rawStats) {
          const parsedStats = JSON.parse(rawStats);
          setPledgeStats({
            count: Number(parsedStats.count) || 1405,
            recentPledgers: Array.isArray(parsedStats.recentPledgers)
              ? parsedStats.recentPledgers
              : defaultPersianGuideData.pledge.recentPledgers,
            pendingPledgers: Array.isArray(parsedStats.pendingPledgers)
              ? parsedStats.pendingPledgers
              : [],
          });
        }

        const rawSuggestions = await getSetting('persian_guide_user_suggestions');
        if (rawSuggestions) {
          setUserSuggestions(JSON.parse(rawSuggestions) || []);
        }
      } catch {
        setData(defaultPersianGuideData);
      }
      setLoading(false);
    }
    if (hasAccess) loadData();
  }, [hasAccess]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const allowed = Boolean(user?.isSuperAdmin || (can && can('PERSIAN_GUIDE_EDIT')));
    if (!allowed) {
      return toast.error('شما مجوز «شیوه‌نامه فارسی‌نویسی» را برای ذخیره اطلاعات این صفحه ندارید.');
    }

    setSaving(true);
    const loadingToast = toast.loading('در حال ذخیره‌سازی اطلاعات شیوه‌نامه...');

    try {
      const approvedList = Array.isArray(pledgeStats.recentPledgers)
        ? pledgeStats.recentPledgers
        : [];
      const realApprovedCount = approvedList.length;

      // برای امنیت و حریم خصوصی، در داده‌های عمومی فرانت‌اند فقط نام‌ها ذخیره می‌شوند
      const publicNamesOnly = approvedList.map((item) =>
        typeof item === 'object' ? item.name : String(item)
      );

      const syncedData = {
        ...data,
        pledge: {
          ...data.pledge,
          initialPledgeCount: realApprovedCount,
          recentPledgers: publicNamesOnly,
        },
      };

      const updatedStats = {
        ...pledgeStats,
        count: realApprovedCount,
        recentPledgers: approvedList,
      };

      const resMain = await saveSetting(
        'persian_guide_page_data',
        JSON.stringify(syncedData),
        'PERSIAN_GUIDE_PAGE'
      );
      if (!resMain?.success) {
        throw new Error(resMain?.error || 'خطا در ذخیره اطلاعات');
      }

      await saveSetting('persian_guide_seo_title', syncedData.seo?.title || '', 'PERSIAN_GUIDE_PAGE');
      await saveSetting('persian_guide_seo_desc', syncedData.seo?.description || '', 'PERSIAN_GUIDE_PAGE');
      await saveSetting('persian_guide_pledge_stats', JSON.stringify(updatedStats), 'PERSIAN_GUIDE_PAGE');
      await saveSetting('persian_guide_user_suggestions', JSON.stringify(userSuggestions), 'PERSIAN_GUIDE_PAGE');

      setData(syncedData);
      setPledgeStats(updatedStats);
      setSaving(false);
      toast.success('اطلاعات شیوه‌نامه فارسی‌نویسی با موفقیت ذخیره شد!', { id: loadingToast });
      router.refresh();
    } catch (err) {
      setSaving(false);
      toast.error(err?.message || 'خطا در ثبت اطلاعات در پایگاه داده!', { id: loadingToast });
    }
  };

  const handleResetToDefault = () => {
    setData(defaultPersianGuideData);
    toast.success('مقادیر پیش‌فرض بازگردانی شد. برای ثبت نهایی، دکمه «ذخیره» را بزنید.');
  };

  const copyHelperChar = (char, label) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(char);
      toast.success(`${label} در بریده‌دان رونوشت شد!`);
    }
  };

  const updateParagraph = (section, index, value) => {
    setData((prev) => {
      const updated = [...(prev[section].paragraphs || [])];
      updated[index] = value;
      return { ...prev, [section]: { ...prev[section], paragraphs: updated } };
    });
  };

  const addParagraph = (section) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        paragraphs: [...(prev[section].paragraphs || []), ''],
      },
    }));
  };

  const removeParagraph = (section, index) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        paragraphs: (prev[section].paragraphs || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (section, arrayKey, index, field, value) => {
    setData((prev) => {
      const list = [...(prev[section][arrayKey] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: { ...prev[section], [arrayKey]: list } };
    });
  };

  const addArrayItem = (section, arrayKey, emptyTemplate) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [arrayKey]: [...(prev[section][arrayKey] || []), emptyTemplate],
      },
    }));
  };

  const removeArrayItem = (section, arrayKey, index) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [arrayKey]: (prev[section][arrayKey] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateSubSectionField = (subIdx, field, value) => {
    setData((prev) => {
      const subs = [...(prev.orthography.subSections || [])];
      subs[subIdx] = { ...subs[subIdx], [field]: value };
      return { ...prev, orthography: { ...prev.orthography, subSections: subs } };
    });
  };

  const addSubSection = () => {
    setData((prev) => ({
      ...prev,
      orthography: {
        ...prev.orthography,
        subSections: [
          ...(prev.orthography.subSections || []),
          {
            title: 'زیربخش جدید ویرایشی',
            desc: '',
            color: '#06b6d4',
            examples: [{ wrong: '', right: '', rule: '' }],
          },
        ],
      },
    }));
  };

  const removeSubSection = (subIdx) => {
    setData((prev) => ({
      ...prev,
      orthography: {
        ...prev.orthography,
        subSections: (prev.orthography.subSections || []).filter((_, i) => i !== subIdx),
      },
    }));
  };

  const updateSubSectionExample = (subIdx, exIdx, field, value) => {
    setData((prev) => {
      const subs = [...(prev.orthography.subSections || [])];
      const examples = [...(subs[subIdx].examples || [])];
      examples[exIdx] = { ...examples[exIdx], [field]: value };
      subs[subIdx] = { ...subs[subIdx], examples };
      return { ...prev, orthography: { ...prev.orthography, subSections: subs } };
    });
  };

  const addSubSectionExample = (subIdx) => {
    setData((prev) => {
      const subs = [...(prev.orthography.subSections || [])];
      subs[subIdx] = {
        ...subs[subIdx],
        examples: [...(subs[subIdx].examples || []), { wrong: '', right: '', rule: '' }],
      };
      return { ...prev, orthography: { ...prev.orthography, subSections: subs } };
    });
  };

  const removeSubSectionExample = (subIdx, exIdx) => {
    setData((prev) => {
      const subs = [...(prev.orthography.subSections || [])];
      subs[subIdx] = {
        ...subs[subIdx],
        examples: (subs[subIdx].examples || []).filter((_, i) => i !== exIdx),
      };
      return { ...prev, orthography: { ...prev.orthography, subSections: subs } };
    });
  };

  const updateOsTabField = (tabIdx, field, value) => {
    setData((prev) => {
      const tabs = [...(prev.toolkit.osTabs || [])];
      tabs[tabIdx] = { ...tabs[tabIdx], [field]: value };
      return { ...prev, toolkit: { ...prev.toolkit, osTabs: tabs } };
    });
  };

  const addOsTab = () => {
    setData((prev) => ({
      ...prev,
      toolkit: {
        ...prev.toolkit,
        osTabs: [
          ...(prev.toolkit.osTabs || []),
          {
            id: `os_${Date.now()}`,
            osName: 'سیستم‌عامل جدید',
            color: '#10b981',
            shortcuts: [{ action: '', keys: '', desc: '' }],
          },
        ],
      },
    }));
  };

  const removeOsTab = (tabIdx) => {
    setData((prev) => ({
      ...prev,
      toolkit: {
        ...prev.toolkit,
        osTabs: (prev.toolkit.osTabs || []).filter((_, i) => i !== tabIdx),
      },
    }));
  };

  const updateShortcutField = (tabIdx, scIdx, field, value) => {
    setData((prev) => {
      const tabs = [...(prev.toolkit.osTabs || [])];
      const shortcuts = [...(tabs[tabIdx].shortcuts || [])];
      shortcuts[scIdx] = { ...shortcuts[scIdx], [field]: value };
      tabs[tabIdx] = { ...tabs[tabIdx], shortcuts };
      return { ...prev, toolkit: { ...prev.toolkit, osTabs: tabs } };
    });
  };

  const addShortcut = (tabIdx) => {
    setData((prev) => {
      const tabs = [...(prev.toolkit.osTabs || [])];
      tabs[tabIdx] = {
        ...tabs[tabIdx],
        shortcuts: [...(tabs[tabIdx].shortcuts || []), { action: '', keys: '', desc: '' }],
      };
      return { ...prev, toolkit: { ...prev.toolkit, osTabs: tabs } };
    });
  };

  const removeShortcut = (tabIdx, scIdx) => {
    setData((prev) => {
      const tabs = [...(prev.toolkit.osTabs || [])];
      tabs[tabIdx] = {
        ...tabs[tabIdx],
        shortcuts: (tabs[tabIdx].shortcuts || []).filter((_, i) => i !== scIdx),
      };
      return { ...prev, toolkit: { ...prev.toolkit, osTabs: tabs } };
    });
  };

  if (!isMounted || hasAccess === null || (hasAccess && loading)) return <AdminLoading />;

  if (hasAccess === false) {
    return (
          <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
              <Icon name="lock" className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
            <p className="text-gray-400">شما مجوز ورود به این بخش از درگاه را ندارید.</p>
          </div>
        );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-12 font-sans text-right select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
            تنظیمات صفحه شیوه‌نامه فارسی‌نویسی
          </h1>
          <p className="text-sm text-gray-400 font-light">
            مدیریت کامل متون، قواعد نگارشی، جدول واژه‌گزینی، طومار پاسداران و پیشنهادهای واژه کاربران
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => copyHelperChar('\u200c', 'نویسه نیم‌فاصله')}
            className="px-3 py-2 rounded-xl bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#06b6d4] border border-[#06b6d4]/30 text-xs font-bold cursor-pointer transition-colors"
          >
            رونوشت نیم‌فاصله
          </button>
          <button
            type="button"
            onClick={() => copyHelperChar('«»', 'گیومه فارسی «»')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold cursor-pointer transition-colors"
          >
            رونوشت « »
          </button>
          <button
            type="button"
            onClick={() => copyHelperChar('هٔ', 'نویسه «هٔ»')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold cursor-pointer transition-colors"
          >
            رونوشت «هٔ»
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold cursor-pointer transition-colors"
          >
            بازنشانی به پیش‌فرض مکتوم
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-10 relative z-10">
          {/* ۰-الف. تنظیمات سئو فنی و مسیر راهنما (Breadcrumb) */}
          <div className="space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border border-white/5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">۰. تنظیمات سئو فنی و مسیر راهنما (Breadcrumb)</h2>
              <SectionToggle
                checked={data.breadcrumb?.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, breadcrumb: { ...prev.breadcrumb, enabled: val } }))
                }
                colorClass="bg-[#10b981]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان سئو (Meta Title)</label>
                <input
                  type="text"
                  value={data.seo?.title || ''}
                  onChange={(e) => setData((prev) => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">مسیر کانونیکال (Canonical Path)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={data.seo?.canonicalPath || '/persian-guide'}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, seo: { ...prev.seo, canonicalPath: e.target.value } }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981] text-left')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان ریشه در مسیر راهنما</label>
                <input
                  type="text"
                  value={data.breadcrumb?.homeLabel || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      breadcrumb: { ...prev.breadcrumb, homeLabel: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">عنوان صفحه جاری در مسیر راهنما</label>
                <input
                  type="text"
                  value={data.breadcrumb?.currentLabel || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      breadcrumb: { ...prev.breadcrumb, currentLabel: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">توضیحات متا (Meta Description)</label>
              <textarea
                rows={2}
                value={data.seo?.description || ''}
                onChange={(e) => setData((prev) => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                className={cn(inputClass, 'focus:border-[#10b981] resize-none')}
              />
            </div>
          </div>

          {/* ۰-ب. برچسب‌های رابط کاربری (پویایی مطلق فرانت‌اند) */}
          <div className="space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border border-white/5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#06b6d4]">
                برچسب‌ها، دکمه‌ها و اعلان‌های رابط کاربری (بدون هیچ متن ثابتی در فرانت‌اند)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'tocTitle', label: 'عنوان فهرست کناری' },
                { key: 'tocCountUnit', label: 'واحد شمارش سرفصل‌ها (بخش)' },
                { key: 'xrayToggleLabel', label: 'متن دکمه پرتو ایکس نیم‌فاصله' },
                { key: 'xrayTooltipText', label: 'پیام راهنمای نقطه نیم‌فاصله' },
                { key: 'correctBadge', label: 'برچسب کارت «درست بنویسیم»' },
                { key: 'incorrectBadge', label: 'برچسب کارت «نادرست ننویسیم»' },
                { key: 'copiedToastText', label: 'پیام اعلان رونوشت شدن (پایین صفحه)' },
                { key: 'whyLabel', label: 'پیشوند توضیح قاعده ویرایشی' },
                { key: 'searchPlaceholder', label: 'متن راهنمای قاب کاوش واژه‌نامه' },
                { key: 'allCategoriesLabel', label: 'دکمه همه رده‌ها در واژه‌نامه' },
                { key: 'colForeign', label: 'ستون اول جدول (واژه بیگانه)' },
                { key: 'colPersian', label: 'ستون دوم جدول (برابرنهاد)' },
                { key: 'colCategory', label: 'ستون سوم جدول (حوزه کاربرد)' },
                { key: 'colNote', label: 'ستون چهارم جدول (توضیح)' },
                { key: 'noLexiconMatch', label: 'پیام پیدا نشدن واژه در کاوش' },
                { key: 'viewModeCards', label: 'دکمه نمای فیش‌ها' },
                { key: 'viewModeTable', label: 'دکمه نمای جدولی' },
                { key: 'refinerInputLabel', label: 'برچسب کادر ورودی پالایشگر' },
                { key: 'refinerOutputLabel', label: 'برچسب کادر خروجی پالایشگر' },
                { key: 'refinerSampleBtn', label: 'دکمه درج متن آزمایشی' },
                { key: 'refinerClearBtn', label: 'دکمه پاک‌سازی قاب پالایشگر' },
                { key: 'statDigitsLabel', label: 'عنوان آمار ارقام فارسی‌شده' },
                { key: 'statCharsLabel', label: 'عنوان آمار نویسه‌های بومی‌شده' },
                { key: 'statZwnjLabel', label: 'عنوان آمار نیم‌فاصله‌ها' },
                { key: 'pledgeBoxTitle', label: 'عنوان قاب طومار پاسداران' },
                { key: 'pledgeCountUnit', label: 'واحد شمارنده طومار (هم‌پیمان)' },
                { key: 'recentPledgersTitle', label: 'تیتر ۱۰ هم‌پیمان اخیر' },
                { key: 'pledgeNamePlaceholder', label: 'راهنمای ورودی نام هم‌پیمان' },
                { key: 'pledgePhonePlaceholder', label: 'راهنمای ورودی شماره همراه' },
                { key: 'pledgeAlreadyRegisteredText', label: 'متن کوتاه دکمه پس از ثبت قبلی' },
                { key: 'pledgeInvalidNameToast', label: 'پیام خطای نام غیرمجاز' },
                { key: 'pledgeInvalidPhoneToast', label: 'پیام خطای شماره همراه نامعتبر' },
                { key: 'suggestTitle', label: 'عنوان قاب پیشنهاد برابرنهاد' },
                { key: 'suggestForeignPlaceholder', label: 'راهنمای ورودی واژه بیگانه' },
                { key: 'suggestPersianPlaceholder', label: 'راهنمای ورودی برابرنهاد پیشنهادی' },
                { key: 'suggestSubmitBtn', label: 'متن دکمه ثبت پیشنهاد واژه' },
                { key: 'suggestSubmittingText', label: 'متن دکمه در حال ثبت پیشنهاد' },
                { key: 'suggestSuccessToast', label: 'اعلان موفقیت ثبت پیشنهاد واژه' },
                { key: 'suggestErrorToast', label: 'اعلان خطای ثبت پیشنهاد واژه' },
              ].map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="text-[11px] text-gray-400 font-bold pl-1 block">{item.label}</label>
                  <input
                    type="text"
                    value={data.uiLabels?.[item.key] || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        uiLabels: { ...prev.uiLabels, [item.key]: e.target.value },
                      }))
                    }
                    className="w-full bg-black/40 border border-white/5 shadow-inner rounded-lg p-2.5 text-xs text-white focus:border focus:border-[#06b6d4] outline-none select-text"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ۱. بخش پیشانی (Hero) */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.hero.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">۱. بخش پیشانی صفحه (Hero) و نماد</h2>
              <SectionToggle
                checked={data.hero.enabled}
                onChange={(val) => setData((prev) => ({ ...prev, hero: { ...prev.hero, enabled: val } }))}
                colorClass="bg-[#10b981]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">نام نماد (Icon Name)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={data.hero.iconName || 'persian'}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, hero: { ...prev.hero, iconName: e.target.value } }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981] text-center')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">نشان بالای عنوان</label>
                <input
                  type="text"
                  value={data.hero.badge || ''}
                  onChange={(e) => setData((prev) => ({ ...prev, hero: { ...prev.hero, badge: e.target.value } }))}
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">بخش اول عنوان اصلی</label>
                <input
                  type="text"
                  value={data.hero.titlePart1 || ''}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, hero: { ...prev.hero, titlePart1: e.target.value } }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold pl-1">بخش دوم عنوان اصلی</label>
                <input
                  type="text"
                  value={data.hero.titlePart2 || ''}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, hero: { ...prev.hero, titlePart2: e.target.value } }))
                  }
                  className={cn(inputClass, 'focus:border-[#10b981]')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">جمله طلایی / شعار در ستایش زبان فارسی</label>
              <input
                type="text"
                value={data.hero.quote || ''}
                onChange={(e) => setData((prev) => ({ ...prev, hero: { ...prev.hero, quote: e.target.value } }))}
                className={cn(inputClass, 'focus:border-[#10b981]')}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">بندهای توضیحات پیشانی</label>
                <button
                  type="button"
                  onClick={() => addParagraph('hero')}
                  className="text-xs bg-white/5 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold transition-colors"
                >
                  + افزودن بند
                </button>
              </div>
              {(data.hero.paragraphs || []).map((p, i) => (
                <div key={i} className="relative">
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => updateParagraph('hero', i, e.target.value)}
                    className={cn(inputClass, 'focus:border-[#10b981] resize-none pl-10')}
                  />
                  <button
                    type="button"
                    onClick={() => removeParagraph('hero', i)}
                    className="absolute top-2.5 left-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ۲. بخش اول شیوه‌نامه: منظومه فکری ما + بیانات رهبر شهید انقلاب اسلامی */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.manifesto.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">۲. بخش منظومه فکری ما و رهنمودهای رهبر شهید انقلاب اسلامی</h2>
              <SectionToggle
                checked={data.manifesto.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, enabled: val } }))
                }
                colorClass="bg-[#10b981]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="عنوان در منوی کناری"
                value={data.manifesto.navTitle || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, navTitle: e.target.value } }))
                }
                className={cn(inputClass, 'focus:border-[#10b981]')}
              />
              <input
                type="text"
                placeholder="نشان بالای بخش"
                value={data.manifesto.badge || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, badge: e.target.value } }))
                }
                className={cn(inputClass, 'focus:border-[#10b981]')}
              />
              <input
                type="text"
                placeholder="بخش اول عنوان"
                value={data.manifesto.titlePart1 || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, titlePart1: e.target.value } }))
                }
                className={cn(inputClass, 'focus:border-[#10b981]')}
              />
              <input
                type="text"
                placeholder="بخش دوم عنوان"
                value={data.manifesto.titlePart2 || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, titlePart2: e.target.value } }))
                }
                className={cn(inputClass, 'focus:border-[#10b981]')}
              />
            </div>

            {/* قاب تنظیمات بیانات رهبر شهید انقلاب اسلامی */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-[#10b981]/20 space-y-3">
              <label className="text-xs text-[#10b981] font-bold block">
                قاب شیشه‌ای بیانات رهبر شهید انقلاب اسلامی (عنوان، متن و تاریخ/عنوان دیدار)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="عنوان بالای قاب بیانات"
                  value={data.manifesto.leaderQuoteTitle || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      manifesto: { ...prev.manifesto, leaderQuoteTitle: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                />
                <input
                  type="text"
                  placeholder="عنوان جلسه و تاریخ (مثال: دیدار شاعران و اهالی فرهنگ — ۱۴۰۲/۰۱/۲۵)"
                  value={data.manifesto.leaderQuoteMeta || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      manifesto: { ...prev.manifesto, leaderQuoteMeta: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                />
              </div>
              <textarea
                rows={2}
                placeholder="متن بیانات رهبر شهید انقلاب اسلامی..."
                value={data.manifesto.leaderQuoteText || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    manifesto: { ...prev.manifesto, leaderQuoteText: e.target.value },
                  }))
                }
                className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981] resize-none')}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">بندهای متن منظومه فکری</label>
                <button
                  type="button"
                  onClick={() => addParagraph('manifesto')}
                  className="text-xs bg-white/5 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold transition-colors"
                >
                  + افزودن بند
                </button>
              </div>
              {(data.manifesto.paragraphs || []).map((p, i) => (
                <div key={i} className="relative">
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => updateParagraph('manifesto', i, e.target.value)}
                    className={cn(inputClass, 'focus:border-[#10b981] resize-none pl-10')}
                  />
                  <button
                    type="button"
                    onClick={() => removeParagraph('manifesto', i)}
                    className="absolute top-2.5 left-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">فیش‌های سه‌گانه منظومه فکری</label>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem('manifesto', 'pillars', {
                      title: 'عنوان جدید',
                      desc: '',
                      color: '#10b981',
                    })
                  }
                  className="text-xs bg-white/5 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold transition-colors"
                >
                  + افزودن فیش
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.manifesto.pillars || []).map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeArrayItem('manifesto', 'pillars', idx)}
                      className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      placeholder="عنوان فیش"
                      value={pillar.title || ''}
                      onChange={(e) =>
                        updateArrayItem('manifesto', 'pillars', idx, 'title', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                    />
                    <textarea
                      rows={3}
                      placeholder="توضیح فیش..."
                      value={pillar.desc || ''}
                      onChange={(e) =>
                        updateArrayItem('manifesto', 'pillars', idx, 'desc', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981] resize-none')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ۳. بخش دوم شیوه‌نامه: لحن و سبک نگارش */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.tone.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#06b6d4]">۳. بخش لحن و سبک نگارش مکتوم</h2>
              <SectionToggle
                checked={data.tone.enabled}
                onChange={(val) => setData((prev) => ({ ...prev, tone: { ...prev.tone, enabled: val } }))}
                colorClass="bg-[#06b6d4]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">
                  کارت‌های مقایسه‌ای «درست بنویسیم / نادرست ننویسیم» در لحن
                </label>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem('tone', 'comparisons', { wrong: '', right: '', rule: '' })
                  }
                  className="text-xs bg-white/5 text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold"
                >
                  + افزودن مقایسه
                </button>
              </div>

              <div className="space-y-4">
                {(data.tone.comparisons || []).map((comp, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tone', 'comparisons', idx)}
                      className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <textarea
                        rows={2}
                        placeholder="جمله نادرست"
                        value={comp.wrong || ''}
                        onChange={(e) =>
                          updateArrayItem('tone', 'comparisons', idx, 'wrong', e.target.value)
                        }
                        className={cn(inputClass, 'p-2.5 text-xs focus:border-rose-500 resize-none')}
                      />
                      <textarea
                        rows={2}
                        placeholder="جمله درست"
                        value={comp.right || ''}
                        onChange={(e) =>
                          updateArrayItem('tone', 'comparisons', idx, 'right', e.target.value)
                        }
                        className={cn(inputClass, 'p-2.5 text-xs focus:border-emerald-500 resize-none')}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="توضیح قاعده ویرایشی..."
                      value={comp.rule || ''}
                      onChange={(e) =>
                        updateArrayItem('tone', 'comparisons', idx, 'rule', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-[#06b6d4]')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ۴. بخش سوم شیوه‌نامه: الفبای درست‌نویسی و ویرایش صوری */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.orthography.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#a855f7]">
                ۴. بخش الفبای درست‌نویسی (نیم‌فاصله، همزه و تنوین)
              </h2>
              <SectionToggle
                checked={data.orthography.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, orthography: { ...prev.orthography, enabled: val } }))
                }
                colorClass="bg-[#a855f7]"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">
                  زیربخش‌های قواعد ویرایشی و مثال‌ها
                </label>
                <button
                  type="button"
                  onClick={addSubSection}
                  className="text-xs bg-white/5 text-[#a855f7] hover:bg-[#a855f7] hover:text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold"
                >
                  + افزودن زیربخش جدید
                </button>
              </div>

              {(data.orthography.subSections || []).map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="p-5 bg-black/30 rounded-2xl border border-white/10 space-y-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeSubSection(sIdx)}
                    className="absolute -top-2.5 -left-2.5 bg-rose-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    ×
                  </button>

                  <input
                    type="text"
                    value={sub.title || ''}
                    onChange={(e) => updateSubSectionField(sIdx, 'title', e.target.value)}
                    className={cn(inputClass, 'p-2.5 text-xs focus:border-[#a855f7]')}
                  />
                  <textarea
                    rows={2}
                    value={sub.desc || ''}
                    onChange={(e) => updateSubSectionField(sIdx, 'desc', e.target.value)}
                    className={cn(inputClass, 'p-2.5 text-xs focus:border-[#a855f7] resize-none')}
                  />

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-300 font-bold">مثال‌های این قاعده</span>
                      <button
                        type="button"
                        onClick={() => addSubSectionExample(sIdx)}
                        className="text-[11px] bg-white/5 hover:bg-[#a855f7] text-gray-200 hover:text-white px-2.5 py-1 rounded-lg cursor-pointer font-bold"
                      >
                        + افزودن مثال
                      </button>
                    </div>

                    {(sub.examples || []).map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3.5 bg-white/5 rounded-xl space-y-2.5 relative border border-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => removeSubSectionExample(sIdx, eIdx)}
                          className="absolute -top-2 -left-2 bg-rose-500/80 hover:bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="املای نادرست"
                            value={ex.wrong || ''}
                            onChange={(e) =>
                              updateSubSectionExample(sIdx, eIdx, 'wrong', e.target.value)
                            }
                            className={cn(inputClass, 'p-2.5 text-xs focus:border-rose-500')}
                          />
                          <input
                            type="text"
                            placeholder="املای درست"
                            value={ex.right || ''}
                            onChange={(e) =>
                              updateSubSectionExample(sIdx, eIdx, 'right', e.target.value)
                            }
                            className={cn(inputClass, 'p-2.5 text-xs focus:border-emerald-500')}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="توضیح قاعده..."
                          value={ex.rule || ''}
                          onChange={(e) =>
                            updateSubSectionExample(sIdx, eIdx, 'rule', e.target.value)
                          }
                          className={cn(inputClass, 'p-2 text-xs focus:border-[#a855f7]')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ۵. بخش چهارم شیوه‌نامه: علایم نگارشی و اعداد فارسی */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.punctuation.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#f59e0b]">۵. بخش علایم نگارشی (سجاوندی) و اعداد فارسی</h2>
              <SectionToggle
                checked={data.punctuation.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, punctuation: { ...prev.punctuation, enabled: val } }))
                }
                colorClass="bg-[#f59e0b]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">قواعد و مثال‌های نشانه‌گذاری</label>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem('punctuation', 'rules', { wrong: '', right: '', rule: '' })
                  }
                  className="text-xs bg-white/5 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold"
                >
                  + افزودن قاعده
                </button>
              </div>

              {(data.punctuation.rules || []).map((r, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl space-y-2.5 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('punctuation', 'rules', idx)}
                    className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={r.wrong || ''}
                      onChange={(e) =>
                        updateArrayItem('punctuation', 'rules', idx, 'wrong', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-rose-500')}
                    />
                    <input
                      type="text"
                      value={r.right || ''}
                      onChange={(e) =>
                        updateArrayItem('punctuation', 'rules', idx, 'right', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-emerald-500')}
                    />
                  </div>
                  <input
                    type="text"
                    value={r.rule || ''}
                    onChange={(e) =>
                      updateArrayItem('punctuation', 'rules', idx, 'rule', e.target.value)
                    }
                    className={cn(inputClass, 'p-2.5 text-xs focus:border-[#f59e0b]')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ۶. جدول جامع واژه‌گزینی */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.lexicon.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">
                ۶. جدول جامع واژه‌گزینی و برابرنهادهای مکتوم ({(data.lexicon.items || []).length} واژه)
              </h2>
              <SectionToggle
                checked={data.lexicon.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, lexicon: { ...prev.lexicon, enabled: val } }))
                }
                colorClass="bg-[#10b981]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">فهرست واژگان جدول رسمی</label>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem('lexicon', 'items', {
                      foreign: '',
                      persian: '',
                      category: 'عمومی و سامانه',
                      note: '',
                    })
                  }
                  className="text-xs bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3.5 py-1.5 rounded-xl cursor-pointer font-bold transition-colors"
                >
                  + افزودن واژه جدید به جدول
                </button>
              </div>

              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 custom-scrollbar">
                {(data.lexicon.items || []).map((row, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2.5 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeArrayItem('lexicon', 'items', idx)}
                      className="absolute top-2.5 left-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-8">
                      <input
                        type="text"
                        placeholder="واژه بیگانه"
                        value={row.foreign || ''}
                        onChange={(e) =>
                          updateArrayItem('lexicon', 'items', idx, 'foreign', e.target.value)
                        }
                        className={cn(inputClass, 'p-2.5 text-xs focus:border-rose-500')}
                      />
                      <input
                        type="text"
                        placeholder="برابرنهاد فارسی مکتوم"
                        value={row.persian || ''}
                        onChange={(e) =>
                          updateArrayItem('lexicon', 'items', idx, 'persian', e.target.value)
                        }
                        className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                      />
                      <input
                        type="text"
                        placeholder="رده‌بندی"
                        value={row.category || ''}
                        onChange={(e) =>
                          updateArrayItem('lexicon', 'items', idx, 'category', e.target.value)
                        }
                        className={cn(inputClass, 'p-2.5 text-xs focus:border-[#06b6d4]')}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="توضیح و بافتار استفاده..."
                      value={row.note || ''}
                      onChange={(e) =>
                        updateArrayItem('lexicon', 'items', idx, 'note', e.target.value)
                      }
                      className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ۷. جعبه ابزار و کلیدهای میانبر */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.toolkit.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#a855f7]">۷. بخش جعبه ابزار و کلیدهای میانبر</h2>
              <SectionToggle
                checked={data.toolkit.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, toolkit: { ...prev.toolkit, enabled: val } }))
                }
                colorClass="bg-[#a855f7]"
              />
            </div>

            <div className="space-y-4 pt-2">
              {(data.toolkit.osTabs || []).map((tab, tIdx) => (
                <div
                  key={tIdx}
                  className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <input
                      type="text"
                      value={tab.osName || ''}
                      onChange={(e) => updateOsTabField(tIdx, 'osName', e.target.value)}
                      className={cn(inputClass, 'p-2.5 text-xs max-w-sm focus:border-[#a855f7]')}
                    />
                    <button
                      type="button"
                      onClick={() => addShortcut(tIdx)}
                      className="text-[11px] bg-white/5 hover:bg-[#a855f7] text-gray-200 hover:text-white px-3 py-1.5 rounded-lg cursor-pointer font-bold"
                    >
                      + افزودن میانبر
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(tab.shortcuts || []).map((sc, sIdx) => (
                      <div key={sIdx} className="p-3 bg-white/5 rounded-xl space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => removeShortcut(tIdx, sIdx)}
                          className="absolute -top-1.5 -left-1.5 bg-rose-500/80 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                        <input
                          type="text"
                          value={sc.action || ''}
                          onChange={(e) => updateShortcutField(tIdx, sIdx, 'action', e.target.value)}
                          className={cn(inputClass, 'p-2 text-xs focus:border-[#a855f7]')}
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={sc.keys || ''}
                          onChange={(e) => updateShortcutField(tIdx, sIdx, 'keys', e.target.value)}
                          className={cn(inputClass, 'p-2 text-xs text-center focus:border-[#06b6d4]')}
                        />
                        <textarea
                          rows={2}
                          value={sc.desc || ''}
                          onChange={(e) => updateShortcutField(tIdx, sIdx, 'desc', e.target.value)}
                          className={cn(inputClass, 'p-2 text-xs focus:border-[#a855f7] resize-none')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ۸. پرسش‌های متداول (FAQ) */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.faq.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#f59e0b]">۸. بخش پرسش‌های متداول نگارشی (FAQ)</h2>
              <SectionToggle
                checked={data.faq.enabled}
                onChange={(val) => setData((prev) => ({ ...prev, faq: { ...prev.faq, enabled: val } }))}
                colorClass="bg-[#f59e0b]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold pl-1">پرسش‌ها و پاسخ‌ها</label>
                <button
                  type="button"
                  onClick={() => addArrayItem('faq', 'items', { question: '', answer: '' })}
                  className="text-xs bg-white/5 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold"
                >
                  + افزودن پرسش
                </button>
              </div>

              {(data.faq.items || []).map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl space-y-2.5 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('faq', 'items', idx)}
                    className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    value={item.question || ''}
                    onChange={(e) => updateArrayItem('faq', 'items', idx, 'question', e.target.value)}
                    className={cn(inputClass, 'p-2.5 text-xs focus:border-[#f59e0b]')}
                  />
                  <textarea
                    rows={2}
                    value={item.answer || ''}
                    onChange={(e) => updateArrayItem('faq', 'items', idx, 'answer', e.target.value)}
                    className={cn(inputClass, 'p-2.5 text-xs focus:border-[#f59e0b] resize-none')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ۹. آزمایشگاه پالایش متن */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.refiner.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#06b6d4]">۹. بخش آزمایشگاه زنده پالایش متن</h2>
              <SectionToggle
                checked={data.refiner.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, refiner: { ...prev.refiner, enabled: val } }))
                }
                colorClass="bg-[#06b6d4]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">توضیح راهنمای آزمایشگاه</label>
              <textarea
                rows={2}
                value={data.refiner.description || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, refiner: { ...prev.refiner, description: e.target.value } }))
                }
                className={cn(inputClass, 'focus:border-[#06b6d4] resize-none')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold pl-1">متن نمونه پراشتباه پیش‌فرض</label>
              <textarea
                rows={3}
                value={data.refiner.sampleRawText || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    refiner: { ...prev.refiner, sampleRawText: e.target.value },
                  }))
                }
                className={cn(inputClass, 'focus:border-[#06b6d4] resize-none')}
              />
            </div>
          </div>

          {/* ۱۰. بخش پایانی صفحه: پیمان فارسی‌نویسی و پیوندهای زیست‌بوم */}
          <div
            className={cn(
              'space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border transition-colors',
              data.pledge.enabled !== false ? 'border-white/5' : 'border-rose-500/30 opacity-60'
            )}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">
                ۱۰. بخش پیمان فارسی‌نویسی و پیوند به صفحات کلیدی
              </h2>
              <SectionToggle
                checked={data.pledge.enabled}
                onChange={(val) =>
                  setData((prev) => ({ ...prev, pledge: { ...prev.pledge, enabled: val } }))
                }
                colorClass="bg-[#10b981]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-bold">متن دکمه هم‌پیمانی</label>
                <input
                  type="text"
                  value={data.pledge.pledgeButtonText || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      pledge: { ...prev.pledge, pledgeButtonText: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-bold">متن پس از ثبت پیمان</label>
                <input
                  type="text"
                  value={data.pledge.pledgeSuccessText || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      pledge: { ...prev.pledge, pledgeSuccessText: e.target.value },
                    }))
                  }
                  className={cn(inputClass, 'p-2.5 text-xs focus:border-[#10b981]')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/10">
              {(data.pledge.ecosystemLinks || []).map((card, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl space-y-2.5 relative">
                  <input
                    type="text"
                    value={card.badge || ''}
                    onChange={(e) =>
                      updateArrayItem('pledge', 'ecosystemLinks', idx, 'badge', e.target.value)
                    }
                    className={cn(inputClass, 'p-2 text-xs focus:border-[#10b981]')}
                  />
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) =>
                      updateArrayItem('pledge', 'ecosystemLinks', idx, 'title', e.target.value)
                    }
                    className={cn(inputClass, 'p-2 text-xs focus:border-[#10b981]')}
                  />
                  <textarea
                    rows={3}
                    value={card.desc || ''}
                    onChange={(e) =>
                      updateArrayItem('pledge', 'ecosystemLinks', idx, 'desc', e.target.value)
                    }
                    className={cn(inputClass, 'p-2 text-xs focus:border-[#10b981] resize-none')}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={card.ctaText || ''}
                      onChange={(e) =>
                        updateArrayItem('pledge', 'ecosystemLinks', idx, 'ctaText', e.target.value)
                      }
                      className={cn(inputClass, 'p-2 text-xs focus:border-[#10b981]')}
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={card.url || ''}
                      onChange={(e) =>
                        updateArrayItem('pledge', 'ecosystemLinks', idx, 'url', e.target.value)
                      }
                      className={cn(inputClass, 'p-2 text-xs text-left focus:border-[#06b6d4]')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ۱۱. نظارت و تأیید اسامی طومار پاسداران زبان فارسی */}
          <div className="space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border border-[#10b981]/20">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#10b981]">
                ۱۱. نظارت و تأیید اسامی «طومار پاسداران زبان فارسی»
              </h2>
              <div className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs text-gray-300 font-bold">تعداد واقعی هم‌پیمانان تأییدشده:</span>
                <span className="text-sm text-[#10b981] font-black">
                  {(pledgeStats.recentPledgers || []).length} نفر
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs text-amber-400 font-bold block">
                الف) اسامی جدید در انتظار تأیید مدیر ({(pledgeStats.pendingPledgers || []).length} مورد)
              </label>
              {(pledgeStats.pendingPledgers || []).length === 0 ? (
                <p className="text-xs text-gray-500 bg-black/30 p-3 rounded-xl">
                  نامی در صف انتظار تأیید وجود ندارد.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pledgeStats.pendingPledgers.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-white/5 rounded-xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-2"
                    >
                      <input
                        type="text"
                        maxLength={35}
                        value={item.name || ''}
                        onChange={(e) => {
                          const updated = [...pledgeStats.pendingPledgers];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setPledgeStats((prev) => ({ ...prev, pendingPledgers: updated }));
                        }}
                        className="flex-1 min-w-[130px] bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none select-text"
                      />
                      <span
                        dir="ltr"
                        className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/5 text-[11px] text-cyan-300 font-mono select-text"
                      >
                        {item.phone || 'بدون شماره'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const approvedObj = {
                            id: item.id || Date.now(),
                            name: (item.name || '').trim(),
                            phone: item.phone || 'بدون شماره',
                            date: item.date || new Date().toLocaleDateString('fa-IR'),
                          };
                          setPledgeStats((prev) => {
                            const updatedApproved = [approvedObj, ...(prev.recentPledgers || [])];
                            return {
                              ...prev,
                              count: updatedApproved.length,
                              recentPledgers: updatedApproved,
                              pendingPledgers: prev.pendingPledgers.filter((_, i) => i !== idx),
                            };
                          });
                          toast.success(`نام «${approvedObj.name}» همراه با شماره همراه به فهرست تأییدشده‌ها منتقل شد. دکمه ذخیره را بزنید.`);
                        }}
                        className="px-2.5 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                      >
                        تأیید
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPledgeStats((prev) => ({
                            ...prev,
                            pendingPledgers: prev.pendingPledgers.filter((_, i) => i !== idx),
                          }))
                        }
                        className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center">
                <label className="text-xs text-emerald-400 font-bold">
                  ب) فهرست کل هم‌پیمانان تأییدشده به همراه شماره همراه (در فرانت‌اند فقط ۱۰ نام آخر بدون شماره نمایش داده می‌شود)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPledgeStats((prev) => {
                      const updatedApproved = [
                        { id: Date.now(), name: 'نام هم‌پیمان جدید', phone: '۰۹۱۲۰۰۰۰۰۰۰' },
                        ...(prev.recentPledgers || []),
                      ];
                      return {
                        ...prev,
                        count: updatedApproved.length,
                        recentPledgers: updatedApproved,
                      };
                    })
                  }
                  className="text-xs bg-white/5 text-[#10b981] hover:bg-[#10b981] hover:text-white px-3 py-1 rounded-lg cursor-pointer font-bold"
                >
                  + افزودن دستی هم‌پیمان
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {(pledgeStats.recentPledgers || []).map((entry, idx) => {
                  const isObj = typeof entry === 'object' && entry !== null;
                  const entryName = isObj ? entry.name || '' : String(entry);
                  const entryPhone = isObj ? entry.phone || '' : '';

                  return (
                    <div
                      key={isObj && entry.id ? entry.id : idx}
                      className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5"
                    >
                      <input
                        type="text"
                        maxLength={35}
                        placeholder="نام هم‌پیمان"
                        value={entryName}
                        onChange={(e) => {
                          const updated = [...pledgeStats.recentPledgers];
                          updated[idx] = isObj
                            ? { ...entry, name: e.target.value }
                            : { id: Date.now() + idx, name: e.target.value, phone: '' };
                          setPledgeStats((prev) => ({ ...prev, recentPledgers: updated }));
                        }}
                        className="flex-1 min-w-[120px] bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none select-text"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={15}
                        placeholder="شماره همراه"
                        value={entryPhone}
                        onChange={(e) => {
                          const updated = [...pledgeStats.recentPledgers];
                          updated[idx] = isObj
                            ? { ...entry, phone: e.target.value }
                            : { id: Date.now() + idx, name: entryName, phone: e.target.value };
                          setPledgeStats((prev) => ({ ...prev, recentPledgers: updated }));
                        }}
                        className="w-32 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-cyan-300 font-mono text-center outline-none select-text"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPledgeStats((prev) => {
                            const updatedApproved = prev.recentPledgers.filter((_, i) => i !== idx);
                            return {
                              ...prev,
                              count: updatedApproved.length,
                              recentPledgers: updatedApproved,
                            };
                          })
                        }
                        className="text-rose-400 hover:bg-rose-500 hover:text-white w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ۱۲. بررسی و افزودن «پیشنهادهای برابرنهاد فارسی کاربران» */}
          <div className="space-y-4 p-6 bg-[#050810]/50 shadow-inner rounded-2xl border border-[#06b6d4]/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-[#06b6d4]">
                ۱۲. پیشنهادهای برابرنهاد فارسی ارسالی توسط کاربران
              </h2>
              <span className="text-xs text-[#06b6d4] font-bold">
                {userSuggestions.length} پیشنهاد در صف بررسی
              </span>
            </div>

            {userSuggestions.length === 0 ? (
              <p className="text-xs text-gray-500 bg-black/30 p-4 rounded-xl text-center">
                هنوز پیشنهادی از سوی کاربران ثبت نشده است.
              </p>
            ) : (
              <div className="space-y-3">
                {userSuggestions.map((sug, idx) => (
                  <div
                    key={sug.id || idx}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        value={sug.foreign || ''}
                        onChange={(e) => {
                          const updated = [...userSuggestions];
                          updated[idx] = { ...updated[idx], foreign: e.target.value };
                          setUserSuggestions(updated);
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-rose-300 outline-none select-text"
                        placeholder="واژه بیگانه"
                      />
                      <input
                        type="text"
                        value={sug.persian || ''}
                        onChange={(e) => {
                          const updated = [...userSuggestions];
                          updated[idx] = { ...updated[idx], persian: e.target.value };
                          setUserSuggestions(updated);
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-emerald-400 font-bold outline-none select-text"
                        placeholder="برابرنهاد پیشنهادی"
                      />
                      <div className="text-[11px] text-gray-400 flex items-center px-2">
                        پیشنهاددهنده: {sug.author || 'کاربر'} ({sug.date || ''})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          addArrayItem('lexicon', 'items', {
                            foreign: sug.foreign,
                            persian: sug.persian,
                            category: 'عمومی و سامانه',
                            note: sug.author ? `پیشنهادشده توسط ${sug.author}` : 'پیشنهاد کاربران سامانه',
                          });
                          setUserSuggestions((prev) => prev.filter((_, i) => i !== idx));
                          toast.success('به جدول جامع واژه‌گزینی اضافه شد! دکمه ذخیره را بزنید.');
                        }}
                        className="px-3 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        + افزودن به جدول رسمی
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUserSuggestions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="flex justify-end p-6 md:p-8 pt-0 relative z-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-transparent"
          >
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره'}
          </button>
        </div>
      </div>
    </div>
  );
}