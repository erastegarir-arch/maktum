'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ConnectionSettingsPage() {
  const router = useRouter();
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [goftinoEnabled, setGoftinoEnabled] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // لود کردن تنظیمات از دیتابیس
  useEffect(() => {
    async function loadSettings() {
      try {
        const gtm = await getSetting('gtm_enabled');
        const goftino = await getSetting('goftino_enabled');
        
        setGtmEnabled(gtm === 'true');
        setGoftinoEnabled(goftino === 'true');
      } catch (error) {
        toast.error('خطا در دریافت وضعیت اتصالات از دیتابیس!');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // ذخیره تنظیمات در دیتابیس
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const savePromise = Promise.all([
      saveSetting('gtm_enabled', gtmEnabled ? 'true' : 'false', 'CONNECTION'),
      saveSetting('goftino_enabled', goftinoEnabled ? 'true' : 'false', 'CONNECTION')
    ]);

    toast.promise(
      savePromise,
      {
        loading: 'در حال ذخیره‌سازی اتصالات در دیتابیس...',
        success: ([res1, res2]) => {
          setSaving(false);
          if (res1?.success && res2?.success) {
            router.refresh();
            return 'تنظیمات اتصال با موفقیت در دیتابیس به‌روزرسانی شد.';
          }
          throw new Error('خطا در ثبت اطلاعات');
        },
        error: () => {
          setSaving(false);
          return 'خطا در ثبت اطلاعات در دیتابیس!';
        }
      }
    );
  };

  if (loading) {
    return <div className="text-gray-400 p-6 font-sans">در حال دریافت وضعیت اتصالات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 font-sans text-right">
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
            className={cn(
              "w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 cursor-pointer",
              gtmEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
            )}
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
            className={cn(
              "w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 cursor-pointer",
              goftinoEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
            )}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
          </button>
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