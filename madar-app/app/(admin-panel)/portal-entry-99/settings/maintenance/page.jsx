'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MaintenancePage() {
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // لود کردن اطلاعات اولیه از دیتابیس (به‌صورت موازی و بهینه)
  useEffect(() => {
    async function loadSettings() {
      try {
        const [mode, msg] = await Promise.all([
          getSetting('maintenance_mode'),
          getSetting('maintenance_message')
        ]);
        
        setIsMaintenance(mode === 'true');
        setMessage(msg || 'سایت در حال به‌روزرسانی و تعمیرات می‌باشد. لطفاً بعداً مراجعه فرمایید.');
      } catch (error) {
        toast.error('خطا در دریافت اطلاعات از دیتابیس!');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // ذخیره در دیتابیس (به‌صورت موازی با توست حرفه‌ای)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const savePromise = Promise.all([
      saveSetting('maintenance_mode', isMaintenance ? 'true' : 'false', 'MAINTENANCE'),
      saveSetting('maintenance_message', message, 'MAINTENANCE')
    ]);

    toast.promise(
      savePromise,
      {
        loading: 'در حال ذخیره‌سازی تنظیمات...',
        success: ([res1, res2]) => {
          setSaving(false);
          if (res1?.success && res2?.success) {
            router.refresh(); // رفرش برای اعمال سریع تغییرات در کش کل سایت
            return 'تنظیمات با موفقیت در دیتابیس ذخیره شد.';
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
    return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات از دیتابیس...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 font-sans text-right select-none">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          تعمیر و نگهداری
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت وضعیت در دسترس بودن سایت و پیغام خروج از دسترس</p>
      </div>

      {/* کانتینر اصلی کارت با ساختار شیشه‌ای ایزوله گرافیک کلی1 */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله ثابت */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت - دقیقاً مماس بر خط لبه‌ی بالایی بدون هیچ فاصله‌ای */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 relative z-10">
          
          {/* کلید سوئیچ فعال/غیرفعال */}
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-[#10b981]/30 transition-all duration-300">
            <div>
              <span className="font-bold text-gray-100 block mb-1">حالت تعمیر و نگهداری</span>
              <span className="text-xs text-gray-400 leading-relaxed block max-w-lg">
                با فعال‌سازی این گزینه، دسترسی کاربران عادی به سایت مسدود می‌شود.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMaintenance(!isMaintenance)}
              className={cn(
                "w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 flex-shrink-0 cursor-pointer shadow-inner",
                isMaintenance ? 'bg-[#10b981] justify-end' : 'bg-gray-800 justify-start'
              )}
            >
              <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md"></motion.div>
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
              className="w-full bg-[#080c16] border border-white/10 rounded-xl p-4 text-gray-200 text-sm focus:border-[#10b981] outline-none transition-all font-sans"
            ></textarea>
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