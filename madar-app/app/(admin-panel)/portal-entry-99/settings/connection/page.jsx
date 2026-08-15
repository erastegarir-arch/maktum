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
        loading: 'در حال ذخیره‌سازی اتصالات...',
        success: ([res1, res2]) => {
          setSaving(false);
          if (res1?.success && res2?.success) {
            router.refresh();
            return 'تنظیمات اتصال با موفقیت به‌روزرسانی شد.';
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
    <div className="max-w-4xl space-y-8 font-sans text-right select-none">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          اتصال
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت اتصال سایت به سرویس‌های خارجی و کدهای رهگیری</p>
      </div>

      {/* کانتینر اصلی کارت با ساختار شیشه‌ای ایزوله گرافیک کلی1 */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله ثابت */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت - دقیقاً مماس بر خط لبه‌ی بالایی بدون هیچ فاصله‌ای */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 relative z-10">
          
          {/* گوگل تگ منیجر */}
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-[#10b981]/30 transition-all duration-300">
            <div>
              <span className="font-bold text-gray-100 block mb-1">گوگل تگ منیجر (GTM)</span>
              <span className="text-xs text-gray-400 leading-relaxed block max-w-lg">
                با فعال‌سازی این گزینه، کدهای رهگیری و آمارگیری گوگل روی سایت فعال می‌شوند.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setGtmEnabled(!gtmEnabled)}
              className={cn(
                "w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 flex-shrink-0 cursor-pointer shadow-inner",
                gtmEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-800 justify-start'
              )}
            >
              <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md"></motion.div>
            </button>
          </div>

          {/* پشتیبانی آنلاین (گفتینو) */}
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-[#10b981]/30 transition-all duration-300">
            <div>
              <span className="font-bold text-gray-100 block mb-1">پشتیبانی آنلاین (گفتینو)</span>
              <span className="text-xs text-gray-400 leading-relaxed block max-w-lg">
                با فعال‌سازی این گزینه، ویجت چت در گوشه پایین سایت برای کاربران فعال می‌شود.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setGoftinoEnabled(!goftinoEnabled)}
              className={cn(
                "w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 flex-shrink-0 cursor-pointer shadow-inner",
                goftinoEnabled ? 'bg-[#10b981] justify-end' : 'bg-gray-800 justify-start'
              )}
            >
              <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md"></motion.div>
            </button>
          </div>

          {/* دکمه ذخیره */}
          <div className="flex justify-end pt-4 border-t border-white/10">
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
    </div>
  );
}