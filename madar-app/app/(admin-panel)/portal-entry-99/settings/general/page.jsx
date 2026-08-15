'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '@/app/components/Icon';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function GeneralSettingsPage() {
  const router = useRouter();
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [footerText, setFooterText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [title, desc, email, footer] = await Promise.all([
          getSetting('site_title'),
          getSetting('site_description'),
          getSetting('contact_email'),
          getSetting('footer_text'),
        ]);

        setSiteTitle(title || 'شبکه رسانه‌ای مدار');
        setSiteDescription(desc || 'پلتفرم مستقل آرشیو و تبادل دانش');
        setContactEmail(email || 'info@madar.ir');
        setFooterText(footer || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.');
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات از دیتابیس!');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const savePromise = Promise.all([
      saveSetting('site_title', siteTitle, 'IDENTITY'),
      saveSetting('site_description', siteDescription, 'IDENTITY'),
      saveSetting('contact_email', contactEmail, 'IDENTITY'),
      saveSetting('footer_text', footerText, 'IDENTITY'),
    ]);

    toast.promise(
      savePromise,
      {
        loading: 'در حال ذخیره‌سازی اطلاعات...',
        success: (results) => {
          setSaving(false);
          const hasError = results.some((res) => !res?.success);
          if (!hasError) {
            router.refresh();
            return 'تنظیمات عمومی با موفقیت در دیتابیس ذخیره شد.';
          }
          throw new Error('خطا در ثبت برخی تنظیمات!');
        },
        error: (err) => {
          setSaving(false);
          return err?.message || 'خطا در ثبت اطلاعات در دیتابیس!';
        },
      }
    );
  };

  if (loading) {
    return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 font-sans text-right select-none">
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            تنظیمات عمومی و هویت سایت
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت نام پلتفرم، توضیحات سئو و اطلاعات تماس</p>
      </div>

      <form onSubmit={handleSave} className="relative rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl isolate">
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله و ثابت طبق گرافیک کلی1 */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت بالای فرم */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />
        
        {/* عنوان سایت */}
        <div className="space-y-2 relative z-10">
          <label className="block text-sm font-medium text-gray-300">عنوان پلتفرم (Site Title)</label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="مثلا: شبکه رسانه‌ای مدار"
            className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* توضیحات سایت */}
        <div className="space-y-2 relative z-10">
          <label className="block text-sm font-medium text-gray-300">توضیحات کوتاه (Meta Description)</label>
          <textarea
            rows="3"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="توضیحات مختصر درباره فعالیت سایت..."
            className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] transition-colors"
          ></textarea>
        </div>

        {/* ایمیل تماس */}
        <div className="space-y-2 relative z-10">
          <label className="block text-sm font-medium text-gray-300">ایمیل اصلی پشتیبانی</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@madar.ir"
            className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] dir-ltr text-right transition-colors"
          />
        </div>

        {/* متن کپی‌رایت فوتر */}
        <div className="space-y-2 relative z-10">
          <label className="block text-sm font-medium text-gray-300">متن کپی‌رایت فوتر</label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* دکمه ذخیره */}
        <div className="flex justify-end pt-4 border-t border-white/10 relative z-10">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
          >
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات'}
          </button>
        </div>

      </form>
    </div>
  );
}