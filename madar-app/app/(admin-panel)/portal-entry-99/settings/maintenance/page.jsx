'use client';

import { useState, useEffect } from 'react';
import { getSetting, saveSetting } from '@/app/actions/settings';

export default function MaintenancePage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  // لود کردن اطلاعات اولیه از دیتابیس
  useEffect(() => {
    async function loadSettings() {
      const mode = await getSetting('maintenance_mode');
      const msg = await getSetting('maintenance_message');
      
      setIsMaintenance(mode === 'true');
      setMessage(msg || 'سایت در حال به روزرسانی و تعمیرات می‌باشد. لطفاً بعداً مراجعه فرمایید.');
      setLoading(false);
    }
    loadSettings();
  }, []);

  // ذخیره در دیتابیس
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', isError: false });

    const res1 = await saveSetting('maintenance_mode', isMaintenance ? 'true' : 'false', 'MAINTENANCE');
    const res2 = await saveSetting('maintenance_message', message, 'MAINTENANCE');

    setSaving(false);

    if (res1.success && res2.success) {
      setStatusMessage({ text: 'تنظیمات با موفقیت در دیتابیس ذخیره شد.', isError: false });
    } else {
      setStatusMessage({ text: 'خطا در ثبت اطلاعات در دیتابیس!', isError: true });
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-6">در حال دریافت اطلاعات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تعمیر و نگهداری</h1>
        <p className="text-sm text-gray-400">مدیریت وضعیت در دسترس بودن سایت و پیغام خروج از دسترس</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        
        {/* کلید سوئیچ فعال/غیرفعال */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
          <div>
            <span className="font-bold text-gray-100 block">حالت تعمیر و نگهداری</span>
            <span className="text-xs text-gray-400">با فعال‌سازی این گزینه، دسترسی کاربران عادی به سایت مسدود می‌شود.</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMaintenance(!isMaintenance)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isMaintenance ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        {/* متن پیام برای کاربران */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">پیام نمایش داده شده به کاربران</label>
          <textarea
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="متن پیام خود را بنویسید..."
            className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] transition-colors"
          ></textarea>
        </div>

        {/* پیام وضعیت ذخیره */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-sm ${statusMessage.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* دکمه ذخیره */}
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