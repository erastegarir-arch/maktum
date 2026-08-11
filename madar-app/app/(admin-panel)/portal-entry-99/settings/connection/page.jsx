'use client';

import { useState, useEffect } from 'react';
import { getSetting, saveSetting } from '@/app/actions/settings';

export default function ConnectionSettingsPage() {
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [goftinoEnabled, setGoftinoEnabled] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  // لود کردن تنظیمات از دیتابیس
  useEffect(() => {
    async function loadSettings() {
      const gtm = await getSetting('gtm_enabled');
      const goftino = await getSetting('goftino_enabled');
      
      setGtmEnabled(gtm === 'true');
      setGoftinoEnabled(goftino === 'true');
      setLoading(false);
    }
    loadSettings();
  }, []);

  // ذخیره تنظیمات در دیتابیس
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', isError: false });

    // ذخیره مقادیر به صورت متنی (رشته) در دیتابیس
    const res1 = await saveSetting('gtm_enabled', gtmEnabled ? 'true' : 'false', 'CONNECTION');
    const res2 = await saveSetting('goftino_enabled', goftinoEnabled ? 'true' : 'false', 'CONNECTION');

    setSaving(false);

    if (res1.success && res2.success) {
      setStatusMessage({ text: 'تنظیمات اتصال با موفقیت در دیتابیس به‌روزرسانی شد.', isError: false });
    } else {
      setStatusMessage({ text: 'خطا در ثبت اطلاعات در دیتابیس!', isError: true });
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-6">در حال دریافت وضعیت اتصالات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">اتصال</h1>
        <p className="text-sm text-gray-400">مدیریت اتصال سایت به سرویس‌های خارجی و کدهای رهگیری</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        
        {/* گوگل تگ منیجر */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
          <div>
            <span className="font-bold text-gray-100 block mb-1">گوگل تگ منیجر (GTM)</span>
            <span className="text-xs text-gray-400 leading-relaxed block max-w-lg">
              با فعال‌سازی این گزینه، کدهای رهگیری و آمارگیری گوگل روی سایت فعال می‌شوند. 
              (نیاز است کد اصلی از قبل در سرور قرار گرفته باشد).
            </span>
          </div>

          <button
            type="button"
            onClick={() => setGtmEnabled(!gtmEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
              gtmEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        {/* پشتیبانی آنلاین (گفتینو) */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
          <div>
            <span className="font-bold text-gray-100 block mb-1">پشتیبانی آنلاین (گفتینو)</span>
            <span className="text-xs text-gray-400 leading-relaxed block max-w-lg">
              با فعال‌سازی این گزینه، ویجت چت و پشتیبانی آنلاین در گوشه پایین سایت برای کاربران به نمایش درمی‌آید.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setGoftinoEnabled(!goftinoEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
              goftinoEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        {/* پیام وضعیت */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-sm ${statusMessage.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* دکمه ذخیره */}
        <div className="flex justify-end pt-2">
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