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

export default function DateTimeSettingsPage() {
  const router = useRouter();
  const [timezone, setTimezone] = useState('Asia/Tehran');
  const [useDst, setUseDst] = useState(false); // ساعت تابستانی
  const [calendarType, setCalendarType] = useState('jalali'); // jalali | gregorian
  const [dateFormat, setDateFormat] = useState('full'); // short | full | relative

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // لود کردن تنظیمات از دیتابیس
  useEffect(() => {
    async function loadSettings() {
      try {
        const [tz, dst, cal, format] = await Promise.all([
          getSetting('timezone'),
          getSetting('use_dst'),
          getSetting('calendar_type'),
          getSetting('date_format')
        ]);
        
        setTimezone(tz || 'Asia/Tehran');
        setUseDst(dst === 'true');
        setCalendarType(cal || 'jalali');
        setDateFormat(format || 'full');
      } catch (error) {
        toast.error('خطا در دریافت تنظیمات از دیتابیس!');
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
      saveSetting('timezone', timezone, 'DATETIME'),
      saveSetting('use_dst', useDst ? 'true' : 'false', 'DATETIME'),
      saveSetting('calendar_type', calendarType, 'DATETIME'),
      saveSetting('date_format', dateFormat, 'DATETIME'),
    ]);

    toast.promise(
      savePromise,
      {
        loading: 'در حال ذخیره‌سازی تنظیمات...',
        success: (results) => {
          setSaving(false);
          if (results.every(res => res?.success)) {
            router.refresh();
            return 'تنظیمات تاریخ و زمان با موفقیت ذخیره شد.';
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

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت تنظیمات...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-10 font-sans text-right select-none">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          تاریخ و زمان
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت منطقه زمانی، نوع تقویم و فرمت نمایش تاریخ در سراسر سایت</p>
      </div>

      {/* کانتینر اصلی کارت با ساختار شیشه‌ای ایزوله گرافیک کلی1 */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله ثابت */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت - دقیقاً روی خط مرزی بالای کارت بدون هیچ فاصله‌ای */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        {/* فرم تنظیمات */}
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8 relative z-10">
          
          {/* ۱. منطقه زمانی */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#10b981] border-b border-white/10 pb-2 flex items-center gap-2">
              <Icon name="world" className="w-4 h-4" /> ۱. منطقه زمانی (Timezone)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">منطقه زمانی پیش‌فرض</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#080c16] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:border-[#10b981] outline-none dir-ltr text-right cursor-pointer transition-all"
                >
                  <option value="Asia/Tehran">ایران (Asia/Tehran +3:30)</option>
                  <option value="Asia/Dubai">دبی (Asia/Dubai +4:00)</option>
                  <option value="Europe/London">لندن (Europe/London +0:00)</option>
                  <option value="UTC">جهانی (UTC 0:00)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors mt-auto">
                <div>
                  <span className="font-bold text-sm text-gray-100 block mb-1">ساعت تابستانی (DST)</span>
                  <span className="text-xs text-gray-400">کشیدن ساعت به جلو در ۶ ماه اول سال</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseDst(!useDst)}
                  className={cn(
                    "w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 flex-shrink-0 cursor-pointer shadow-inner",
                    useDst ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
                  )}
                >
                  <motion.div layout className="w-6 h-6 rounded-full bg-white shadow-md"></motion.div>
                </button>
              </div>
            </div>
          </div>

          {/* ۲. تقویم */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#10b981] border-b border-white/10 pb-2 flex items-center gap-2">
              <Icon name="calendar" className="w-4 h-4" /> ۲. تقویم (Calendar)
            </h2>
            <div className="flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input type="radio" name="calendar" value="jalali" checked={calendarType === 'jalali'} onChange={(e) => setCalendarType(e.target.value)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                  <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors text-sm">جلالی (شمسی)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input type="radio" name="calendar" value="gregorian" checked={calendarType === 'gregorian'} onChange={(e) => setCalendarType(e.target.value)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                  <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors text-sm">میلادی (Gregorian)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic">نکته: در صورت دوزبانه شدن سایت در آینده، سیستم به صورت هوشمند تقویم شمسی را برای کاربران فارسی و میلادی را برای کاربران انگلیسی نمایش خواهد داد.</p>
          </div>

          {/* ۳. فرمت نمایش */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#10b981] border-b border-white/10 pb-2 flex items-center gap-2">
               <Icon name="textFormat" className="w-4 h-4" /> ۳. فرمت نمایش تاریخ
            </h2>
            <div className="space-y-3">
              {[
                { id: 'short', title: 'عددی کوتاه', desc: 'مثال: ۱۴۰۳/۰۵/۲۲' },
                { id: 'full', title: 'متنی کامل', desc: 'مثال: ۲۲ مرداد ۱۴۰۳' },
                { id: 'relative', title: 'زمان‌گذشته (نسبی)', desc: 'مثال: ۲ ساعت پیش، ۳ روز پیش' }
              ].map((format) => (
                <label key={format.id} className="flex items-center gap-3 cursor-pointer group bg-black/20 p-4 rounded-xl border border-white/5 hover:border-[#10b981]/30 transition-all">
                  <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <input type="radio" name="format" value={format.id} checked={dateFormat === format.id} onChange={(e) => setDateFormat(e.target.value)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                    <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-200 text-sm font-bold">{format.title}</span>
                    <span className="text-gray-500 text-xs">{format.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* دکمه ذخیره */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
            >
              {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات تاریخ'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}