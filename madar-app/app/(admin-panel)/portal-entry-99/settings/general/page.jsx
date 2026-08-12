'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    <div className="max-w-4xl space-y-6 font-sans text-right">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تنظیمات عمومی و هویت سایت</h1>
        <p className="text-sm text-gray-400">مدیریت نام پلتفرم، توضیحات سئو و اطلاعات تماس</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        
        {/* عنوان سایت */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">عنوان پلتفرم (Site Title)</label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="مثلا: شبکه رسانه‌ای مدار"
            className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* توضیحات سایت */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">توضیحات کوتاه (Meta Description)</label>
          <textarea
            rows="3"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="توضیحات مختصر درباره فعالیت سایت..."
            className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981]"
          ></textarea>
        </div>

        {/* ایمیل تماس */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">ایمیل اصلی پشتیبانی</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@madar.ir"
            className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] dir-ltr text-right"
          />
        </div>

        {/* متن کپی‌رایت فوتر */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">متن کپی‌رایت فوتر</label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* دکمه ذخیره */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات'}
          </button>
        </div>

      </form>
    </div>
  );
}