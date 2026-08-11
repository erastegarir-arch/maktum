'use client';

import { useState, useEffect } from 'react';
import { getSetting, saveSetting } from '@/app/actions/settings';

export default function GeneralSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [footerText, setFooterText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    async function loadSettings() {
      const title = await getSetting('site_title');
      const desc = await getSetting('site_description');
      const email = await getSetting('contact_email');
      const footer = await getSetting('footer_text');

      setSiteTitle(title || 'شبکه رسانه‌ای مدار');
      setSiteDescription(desc || 'پلتفرم مستقل آرشیو و تبادل دانش');
      setContactEmail(email || 'info@madar.ir');
      setFooterText(footer || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.');
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', isError: false });

    const results = await Promise.all([
      saveSetting('site_title', siteTitle, 'IDENTITY'),
      saveSetting('site_description', siteDescription, 'IDENTITY'),
      saveSetting('contact_email', contactEmail, 'IDENTITY'),
      saveSetting('footer_text', footerText, 'IDENTITY'),
    ]);

    setSaving(false);

    const hasError = results.some((res) => !res.success);
    if (!hasError) {
      setStatusMessage({ text: 'تنظیمات عمومی با موفقیت در دیتابیس ذخیره شد.', isError: false });
    } else {
      setStatusMessage({ text: 'خطا در ثبت برخی تنظیمات!', isError: true });
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-6">در حال دریافت اطلاعات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
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

        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-sm ${statusMessage.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات'}
          </button>
        </div>

      </form>
    </div>
  );
}