'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function DateTimeSettingsPage() {
  const router = useRouter();
  const [timezone, setTimezone] = useState('Asia/Tehran');
  const [useDst, setUseDst] = useState(false); // ساعت تابستانی
  const [calendarType, setCalendarType] = useState('jalali'); // jalali | gregorian
  const [dateFormat, setDateFormat] = useState('full'); // short | full | relative

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    <div className="max-w-4xl space-y-6 pb-10 font-sans text-right">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">تاریخ و زمان</h1>
        <p className="text-sm text-gray-400">مدیریت منطقه زمانی، نوع تقویم و فرمت نمایش تاریخ در سراسر سایت</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-8 backdrop-blur-md">
        
        {/* ۱. منطقه زمانی */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۱. منطقه زمانی (Timezone)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">منطقه زمانی پیش‌فرض</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:border-[#10b981] dir-ltr text-right cursor-pointer"
              >
                <option value="Asia/Tehran">ایران (Asia/Tehran +3:30)</option>
                <option value="Asia/Dubai">دبی (Asia/Dubai +4:00)</option>
                <option value="Europe/London">لندن (Europe/London +0:00)</option>
                <option value="UTC">جهانی (UTC 0:00)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 mt-auto">
              <div>
                <span className="font-bold text-sm text-gray-100 block mb-1">ساعت تابستانی (DST)</span>
                <span className="text-xs text-gray-400">کشیدن ساعت به جلو در ۶ ماه اول سال</span>
              </div>
              <button
                type="button"
                onClick={() => setUseDst(!useDst)}
                className={cn(
                  "w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 flex-shrink-0 cursor-pointer",
                  useDst ? 'bg-[#10b981] justify-end' : 'bg-gray-700 justify-start'
                )}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

        {/* ۲. تقویم */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۲. تقویم (Calendar)</h2>
          <div className="flex gap-6">
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
          <p className="text-xs text-gray-500">نکته: در صورت دوزبانه شدن سایت در آینده، سیستم به صورت هوشمند تقویم شمسی را برای کاربران فارسی و میلادی را برای کاربران انگلیسی نمایش خواهد داد.</p>
        </div>

        {/* ۳. فرمت نمایش */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۳. فرمت نمایش تاریخ</h2>
          <div className="space-y-3">
            
            <label className="flex items-center gap-3 cursor-pointer group bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input type="radio" name="format" value="short" checked={dateFormat === 'short'} onChange={(e) => setDateFormat(e.target.value)} className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 text-sm font-bold">عددی کوتاه</span>
                <span className="text-gray-500 text-xs">مثال: ۱۴۰۳/۰۵/۲۲</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input type="radio" name="format" value="full" checked={dateFormat === 'full'} onChange={(e) => setDateFormat(e.target.value)} className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 text-sm font-bold">متنی کامل</span>
                <span className="text-gray-500 text-xs">مثال: ۲۲ مرداد ۱۴۰۳</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                <input type="radio" name="format" value="relative" checked={dateFormat === 'relative'} onChange={(e) => setDateFormat(e.target.value)} className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-gray-500 rounded-full peer-checked:border-[#10b981] transition-colors"></div>
                <div className="absolute w-2.5 h-2.5 bg-[#10b981] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 text-sm font-bold">زمان‌گذشته (نسبی)</span>
                <span className="text-gray-500 text-xs">مثال: ۲ ساعت پیش، ۳ روز پیش</span>
              </div>
            </label>

          </div>
        </div>

        {/* دکمه ذخیره */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer">
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات تاریخ'}
          </button>
        </div>

      </form>
    </div>
  );
}