'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import RichTextEditor from '@/app/components/RichTextEditor';

import { 
  saveAndDispatchNotificationAction, 
  getAdminNotificationsListAction,
  toggleNotificationTemplateStatusAction 
} from '@/app/actions/notifications';

import { getSetting, saveSetting } from '@/app/actions/settings';

const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const IRAN_PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری",
  "خراسان جنوبی", "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان", "لرستان",
  "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

const calculateSmsStats = (text) => {
  if (!text) return { chars: 0, parts: 0, type: 'فارسی (Unicode)' };
  let isUnicode = false;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) { isUnicode = true; break; }
  }
  const len = text.length;
  const limit = isUnicode ? 70 : 160;
  const multiLimit = isUnicode ? 67 : 153;
  let parts = len === 0 ? 0 : (len <= limit ? 1 : Math.ceil(len / multiLimit));
  return { chars: len, parts, type: isUnicode ? 'فارسی (Unicode)' : 'انگلیسی (GSM)' };
};

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px #080c16 inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState('CAMPAIGN'); 
  const [isSaving, setIsSaving] = useState(false);

  // استیت‌های کمپین و اتوماسیون
  const [audienceType, setAudienceType] = useState('ALL'); 
  const [manualPhones, setManualPhones] = useState('');
  const [filters, setFilters] = useState({ province: 'ALL', gender: 'ALL' });
  const [sendInApp, setSendInApp] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [themeColor, setThemeColor] = useState('#8b5cf6');
  const [iconUrl, setIconUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaButtons, setCtaButtons] = useState([]);
  const [smsText, setSmsText] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('WELCOME');
  const [isActiveTemplate, setIsActiveTemplate] = useState(true);

  // استیت‌های تاریخچه و گزارشات
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // استیت‌های تنظیمات درگاه کاوه‌نگار
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsSenderNum, setSmsSenderNum] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); 
  const [editorInstance, setEditorInstance] = useState(null);

  const smsStats = calculateSmsStats(smsText);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      loadHistory();
    }
    if (activeTab === 'SETTINGS') {
      loadSmsSettings();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const res = await getAdminNotificationsListAction();
    if (res.success) setHistoryList(res.data);
    setIsLoadingHistory(false);
  };

  const loadSmsSettings = async () => {
    const key = await getSetting('sms_api_key');
    const sender = await getSetting('sms_sender_number');
    if (key) setSmsApiKey(key);
    if (sender) setSmsSenderNum(sender);
  };

  const handleSaveSmsSettings = async () => {
    setIsSavingSettings(true);
    await saveSetting('sms_api_key', smsApiKey, 'SMS_GATEWAY');
    await saveSetting('sms_sender_number', smsSenderNum, 'SMS_GATEWAY');
    setIsSavingSettings(false);
    toast.success('تنظیمات درگاه پیامک با موفقیت ذخیره و در لحظه اعمال شد.');
  };

  const addCtaButton = () => setCtaButtons(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), label: '', url: '' }]);
  const updateCtaButton = (id, field, value) => setCtaButtons(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  const removeCtaButton = (id) => setCtaButtons(prev => prev.filter(b => b.id !== id));

  const handleOpenMediaForEditor = (editor) => {
    setEditorInstance(editor);
    setMediaPickerTarget('editor');
  };

  const handleSaveAndDispatch = async (e) => {
    e.preventDefault();
    if (!sendInApp && !sendSms) return toast.error('حداقل باید یک کانال ارسال (سایت یا پیامک) را انتخاب کنید.');
    if (sendInApp && !title) return toast.error('برای اعلان سایت، درج عنوان الزامی است.');
    if (sendSms && !smsText.trim()) return toast.error('برای ارسال پیامک، متن پیام نمی‌تواند خالی باشد.');

    setIsSaving(true);
    const payload = {
      type: activeTab === 'TEMPLATE' ? 'SYSTEM' : 'BULK',
      isTemplate: activeTab === 'TEMPLATE',
      triggerEvent: activeTab === 'TEMPLATE' ? triggerEvent : null,
      audienceType,
      manualPhones,
      filters,
      sendInApp,
      title,
      bodyHtml,
      themeColor,
      iconUrl,
      coverUrl,
      ctaButtons,
      sendSms,
      smsText
    };

    const res = await saveAndDispatchNotificationAction(payload);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      if (activeTab !== 'TEMPLATE') {
        setManualPhones(''); setTitle(''); setBodyHtml(''); setSmsText(''); setCtaButtons([]); setIconUrl(''); setCoverUrl('');
      }
    } else {
      toast.error(res.error);
    }
  };

  const toggleTemplateStatus = async (id, currentStatus) => {
    const res = await toggleNotificationTemplateStatusAction(id, currentStatus);
    if (res.success) {
      toast.success(res.message);
      loadHistory();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 font-sans text-right select-none relative">
      
      {/* هدر استودیو */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 font-sans">
              <Icon name="bell" className="w-8 h-8 text-[#8b5cf6]" /> کمپین‌ها و اعلان‌های هوشمند
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-xl leading-relaxed font-sans">
              مدیریت جامع اطلاع‌رسانی. از ارسال کمپین‌های پیامکی تا پیگیری گزارشات و تنظیمات اتصال به درگاه.
            </p>
          </div>
          
          <div className="flex flex-wrap bg-[#080c16] p-1.5 rounded-2xl shadow-inner w-full lg:w-auto border border-transparent">
            <button onClick={() => setActiveTab('CAMPAIGN')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${activeTab === 'CAMPAIGN' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-transparent shadow-md' : 'text-gray-400 hover:text-white'}`}>ارسال کمپین</button>
            <button onClick={() => setActiveTab('TEMPLATE')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${activeTab === 'TEMPLATE' ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-transparent shadow-md' : 'text-gray-400 hover:text-white'}`}>اتوماسیون‌ها</button>
            <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${activeTab === 'HISTORY' ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-transparent shadow-md' : 'text-gray-400 hover:text-white'}`}>گزارشات</button>
            <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${activeTab === 'SETTINGS' ? 'bg-rose-500/20 text-rose-400 border border-transparent shadow-md' : 'text-gray-400 hover:text-white'}`}><Icon name="settings" className="w-4 h-4 inline-block ml-1"/>درگاه</button>
          </div>
        </div>
      </motion.div>

      {/* ======================= تب تنظیمات درگاه پیامک ======================= */}
      {activeTab === 'SETTINGS' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden p-8 max-w-2xl mx-auto group">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 pointer-events-none z-20" />
          
          <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6 font-sans relative z-10">
            <Icon name="settings" className="w-6 h-6 text-rose-500" /> پیکربندی سامانه کاوه‌نگار
          </h2>
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400 font-bold font-sans">کلید دسترسی (API Key)</label>
              <input type="text" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} dir="ltr" placeholder="Kavenegar API Key..." className="w-full bg-[#080c16] border border-transparent rounded-xl p-3 text-white text-sm focus:border-rose-500 outline-none text-left font-sans shadow-inner" style={autofillFixStyle} />
              <p className="text-[10px] text-gray-500 font-sans mt-1">این کلید در داشبورد کاوه‌نگار بخش تنظیمات حساب قابل دریافت است.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-400 font-bold font-sans">شماره فرستنده (Sender Number)</label>
              <input type="text" value={smsSenderNum} onChange={e => setSmsSenderNum(e.target.value)} dir="ltr" placeholder="مثال: 10008663" className="w-full bg-[#080c16] border border-transparent rounded-xl p-3 text-white text-sm focus:border-rose-500 outline-none text-left font-sans shadow-inner" style={autofillFixStyle} />
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button onClick={handleSaveSmsSettings} disabled={isSavingSettings} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer font-sans disabled:opacity-50">
                {isSavingSettings ? 'در حال ذخیره...' : 'ثبت و اعمال فوری'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================= تب تاریخچه و گزارشات ======================= */}
      {activeTab === 'HISTORY' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
          
          <div className="p-6 border-b border-white/10 bg-black/20 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 font-sans">
              <Icon name="trend" className="w-6 h-6 text-[#06b6d4]" /> تاریخچه ارسال‌ها و آمار کمپین‌ها
            </h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar p-6 relative z-10">
            <table className="w-full text-sm text-right text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-4 font-bold font-sans">عنوان اعلان / اتوماسیون</th>
                  <th className="px-4 py-4 font-bold font-sans text-center">بستر ارسال</th>
                  <th className="px-4 py-4 font-bold font-sans text-center">آمار بازدید سایت</th>
                  <th className="px-4 py-4 font-bold font-sans text-center">آمار پیامک</th>
                  <th className="px-4 py-4 font-bold font-sans text-center">وضعیت (اتوماسیون)</th>
                  <th className="px-4 py-4 font-bold font-sans text-left">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  <tr><td colSpan="6" className="text-center py-16"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#06b6d4]" /></td></tr>
                ) : historyList.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-16 text-gray-500 font-bold font-sans">هیچ گزارشی یافت نشد.</td></tr>
                ) : (
                  historyList.map(h => (
                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <span className="block text-white font-bold font-sans mb-1">{h.title || 'پیامک بدون عنوان سیستمی'}</span>
                        <span className="text-[10px] text-gray-500 font-sans">{h.isTemplate ? `اتوماسیون: ${h.triggerEvent}` : 'ارسال کمپین دستی'}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {h.sendInApp && <Icon name="browser" className="w-4 h-4 text-[#8b5cf6]" title="سایت" />}
                          {h.sendSms && <Icon name="chat" className="w-4 h-4 text-[#06b6d4]" title="پیامک" />}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {h.sendInApp ? (
                          <div className="flex flex-col text-xs font-sans">
                            <span className="text-gray-300">ارسال: {toPersianDigits(h.targetCount)}</span>
                            <span className="text-emerald-400 font-bold">دیده شده: {toPersianDigits(h.readCount)}</span>
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {h.sendSms ? (
                          <div className="flex flex-col text-xs font-sans">
                            <span className="text-emerald-400 font-bold">موفق: {toPersianDigits(h.smsSentCount)}</span>
                            {h.smsFailCount > 0 && <span className="text-rose-400">خطا: {toPersianDigits(h.smsFailCount)}</span>}
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {h.isTemplate ? (
                          <button 
                            onClick={() => toggleTemplateStatus(h.id, h.isActive)} 
                            className={`px-3 py-1 rounded text-[10px] font-bold font-sans transition-colors border cursor-pointer ${h.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'}`}
                          >
                            {h.isActive ? 'فعال (توقف)' : 'خاموش (روشن‌کردن)'}
                          </button>
                        ) : <span className="text-gray-600 text-xs font-sans">یکبار ارسال</span>}
                      </td>
                      <td className="px-4 py-4 text-left font-sans text-xs text-gray-400 dir-ltr">
                        {toPersianDigits(new Date(h.createdAt).toLocaleDateString('fa-IR'))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ======================= تب‌های اصلی استودیو (فرم‌ساز و پیش‌نمایش) ======================= */}
      {(activeTab === 'CAMPAIGN' || activeTab === 'TEMPLATE') && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* ستون راست: استودیو فرم‌ساز */}
          <div className="xl:col-span-7 space-y-6">
            <form id="notificationForm" onSubmit={handleSaveAndDispatch} className="space-y-6">
              
              {/* ۱. تنظیمات مخاطبین */}
              {activeTab === 'CAMPAIGN' ? (
                <div className="relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-transparent">
                  <div className="p-5 space-y-5">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                      <Icon name="users" className="w-5 h-5 text-[#8b5cf6]" /> ۱. انتخاب مخاطبان هدف
                    </h2>
                    <div className="flex bg-[#080c16] border border-transparent p-1.5 rounded-xl font-sans">
                      <button type="button" onClick={() => setAudienceType('ALL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${audienceType === 'ALL' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}>همه کاربران</button>
                      <button type="button" onClick={() => setAudienceType('FILTERED')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${audienceType === 'FILTERED' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}>فیلتر پیشرفته</button>
                      <button type="button" onClick={() => setAudienceType('MANUAL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${audienceType === 'MANUAL' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}>شماره‌های دستی</button>
                    </div>

                    {audienceType === 'FILTERED' && (
                      <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease-out]">
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-2 font-sans">فیلتر استان</label>
                          <select value={filters.province} onChange={e => setFilters({...filters, province: e.target.value})} className="w-full bg-[#080c16] border border-transparent rounded-lg p-2.5 text-xs text-white outline-none focus:border focus:border-[#8b5cf6] font-sans">
                            <option value="ALL" className="bg-[#0b0f19]">تمامی استان‌ها</option>
                            <option value="EMPTY" className="bg-rose-500/20 text-rose-300">مواردی که استان را پر نکرده‌اند</option>
                            {IRAN_PROVINCES.map(p => <option key={p} value={p} className="bg-[#0b0f19]">{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-400 mb-2 font-sans">فیلتر جنسیت</label>
                          <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})} className="w-full bg-[#080c16] border border-transparent rounded-lg p-2.5 text-xs text-white outline-none focus:border focus:border-[#8b5cf6] font-sans">
                            <option value="ALL" className="bg-[#0b0f19]">همه</option>
                            <option value="EMPTY" className="bg-rose-500/20 text-rose-300">پر نکرده‌اند</option>
                            <option value="MALE" className="bg-[#0b0f19]">مرد</option>
                            <option value="FEMALE" className="bg-[#0b0f19]">زن</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {audienceType === 'MANUAL' && (
                      <div className="animate-[fadeIn_0.3s_ease-out] space-y-2">
                        <label className="block text-[11px] text-gray-400 font-sans">شماره موبایل‌ها را با اینتر یا کاما جدا کنید</label>
                        <textarea rows="4" value={manualPhones} onChange={e => setManualPhones(e.target.value)} dir="ltr" placeholder="0912...&#10;0919..." className="w-full bg-[#080c16] border border-transparent rounded-lg p-3 text-white text-sm font-sans focus:border focus:border-[#8b5cf6] outline-none resize-none text-left shadow-inner"></textarea>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-transparent p-5 space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                    <Icon name="update" className="w-5 h-5 text-[#f59e0b]" /> ۱. انتخاب رویداد سیستمی
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] text-gray-400 font-sans">نوع اتوماسیون</label>
                      <select value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)} className="w-full bg-[#080c16] border border-transparent rounded-lg p-2.5 text-xs text-white outline-none focus:border focus:border-[#f59e0b] font-sans">
                        <option value="WELCOME" className="bg-[#0b0f19]">خوشامدگویی بعد از ثبت‌نام</option>
                        <option value="BIRTHDAY" className="bg-[#0b0f19]">تبریک سالروز تولد (۱۰ صبح)</option>
                        <option value="INCOMPLETE_PROFILE" className="bg-[#0b0f19]">یادآوری پروفایل ناقص (بعد از ۳ روز)</option>
                        <option value="DORMANT_USER" className="bg-[#0b0f19]">کاربر خاموش (بعد از ۳۰ روز)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer group bg-[#080c16] border border-transparent p-2.5 rounded-lg w-full hover:border-[#10b981]/50 transition-all font-sans">
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors border ${isActiveTemplate ? 'bg-[#10b981] border-transparent' : 'border-gray-500'}`}>
                          {isActiveTemplate && <Icon name="check" className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" checked={isActiveTemplate} onChange={e => setIsActiveTemplate(e.target.checked)} className="hidden" />
                        <span className="text-xs text-white font-bold">این اتوماسیون فعال باشد</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ۲. انتخاب کانال‌ها */}
              <div className="relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-transparent p-5 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                  <Icon name="rocket" className="w-5 h-5 text-emerald-400" /> ۲. کانال‌های ارسال
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 cursor-pointer group p-4 rounded-xl border transition-all ${sendInApp ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50' : 'bg-[#080c16] hover:border-white/30 border-transparent'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sendInApp ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-500'}`}>
                      {sendInApp && <Icon name="check" className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={sendInApp} onChange={e => setSendInApp(e.target.checked)} className="hidden" />
                    <div>
                      <span className="block text-sm font-bold text-white mb-0.5 font-sans">اعلان در سایت</span>
                      <span className="block text-[10px] text-gray-400 font-sans">کارت گرافیکی در پنل کاربر</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 cursor-pointer group p-4 rounded-xl border transition-all ${sendSms ? 'bg-[#06b6d4]/10 border-[#06b6d4]/50' : 'bg-[#080c16] hover:border-white/30 border-transparent'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sendSms ? 'bg-[#06b6d4] border-[#06b6d4]' : 'border-gray-500'}`}>
                      {sendSms && <Icon name="check" className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} className="hidden" />
                    <div>
                      <span className="block text-sm font-bold text-white mb-0.5 font-sans">پیامک (SMS)</span>
                      <span className="block text-[10px] text-gray-400 font-sans">ارسال به موبایل کاربر</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ۳. تنظیمات محتوای سایت */}
              <AnimatePresence>
                {sendInApp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative rounded-2xl border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-white/[0.02] backdrop-blur-2xl p-5 space-y-6">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                      <Icon name="browser" className="w-5 h-5 text-[#8b5cf6]" /> ۳. طراحی اعلان سایت
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[11px] text-gray-400 font-sans">عنوان اعلان</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: خبر ویژه برای شما..." className="w-full bg-[#080c16] border border-transparent rounded-lg p-2.5 text-sm text-white outline-none focus:border focus:border-[#8b5cf6] font-sans shadow-inner" style={autofillFixStyle} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-gray-400 font-sans">رنگ نوار کناری (تم)</label>
                        <div className="flex items-center gap-2 bg-[#080c16] border border-transparent p-1.5 rounded-lg shadow-inner">
                          <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer" />
                          <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-full bg-transparent text-xs text-white dir-ltr text-center uppercase outline-none font-sans" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[11px] text-gray-400 font-sans">آیکون شاخص (نماد کوچک)</label>
                        {iconUrl ? (
                          <div className="flex items-center gap-2 p-1.5 bg-[#080c16] border border-transparent rounded-lg shadow-inner">
                            <img src={iconUrl} alt="icon" className="w-8 h-8 object-contain rounded" />
                            <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="flex-1 py-1 text-[10px] bg-white/10 hover:bg-[#8b5cf6] rounded transition-colors text-white font-sans cursor-pointer">تغییر</button>
                            <button type="button" onClick={() => setIconUrl('')} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"><Icon name="close" className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="w-full py-2.5 bg-[#080c16] border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans">
                            <Icon name="image" className="w-4 h-4" /> انتخاب آیکون از رسانه
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-gray-400 font-sans">تصویر کاور (بنر بزرگ - اختیاری)</label>
                        {coverUrl ? (
                          <div className="flex items-center gap-2 p-1.5 bg-[#080c16] border border-transparent rounded-lg shadow-inner">
                            <img src={coverUrl} alt="cover" className="w-12 h-8 object-cover rounded" />
                            <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="flex-1 py-1 text-[10px] bg-white/10 hover:bg-[#8b5cf6] rounded transition-colors text-white font-sans cursor-pointer">تغییر بنر</button>
                            <button type="button" onClick={() => setCoverUrl('')} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"><Icon name="close" className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="w-full py-2.5 bg-[#080c16] border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans">
                            <Icon name="image" className="w-4 h-4" /> انتخاب بنر از رسانه
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] text-gray-400 font-sans">متن و توضیحات کامل</label>
                      <RichTextEditor 
                        value={bodyHtml} 
                        onChange={setBodyHtml} 
                        activeTheme={{ color: `text-[${themeColor}]` }}
                        onOpenMedia={handleOpenMediaForEditor} 
                        placeholder="متن اعلان را بنویسید (پشتیبانی از فرمت‌های مختلف)..."
                      />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] text-gray-400 font-sans">دکمه‌های اقدام (Call to Action)</label>
                        <button type="button" onClick={addCtaButton} className="text-[10px] bg-white/10 text-white px-2 py-1 rounded hover:bg-[#8b5cf6] transition-colors cursor-pointer font-sans">+ افزودن دکمه</button>
                      </div>
                      {ctaButtons.map((btn) => (
                        <div key={btn.id} className="flex gap-2 p-2 bg-[#080c16] border border-transparent rounded-lg relative pr-8 shadow-inner">
                          <button type="button" onClick={() => removeCtaButton(btn.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          <input type="text" placeholder="عنوان دکمه" value={btn.label} onChange={e => updateCtaButton(btn.id, 'label', e.target.value)} className="w-1/3 bg-transparent border-l text-xs text-white px-2 outline-none font-sans" />
                          <input type="text" placeholder="لینک (داخل یا خارج سایت)" value={btn.url} onChange={e => updateCtaButton(btn.id, 'url', e.target.value)} className="flex-1 bg-transparent text-xs text-white px-2 outline-none dir-ltr text-right font-sans" />
                        </div>
                      ))}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* ۴. تنظیمات محتوای پیامک */}
              <AnimatePresence>
                {sendSms && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative rounded-2xl border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-white/[0.02] backdrop-blur-2xl p-5 space-y-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                      <Icon name="chat" className="w-5 h-5 text-[#06b6d4]" /> ۴. متن و محتوای پیامک
                    </h2>
                    <div className="space-y-2">
                      <label className="block text-[11px] text-gray-400 font-sans">متن پیامک (پشتیبانی از ایموجی)</label>
                      <textarea 
                        rows="4" 
                        value={smsText} 
                        onChange={e => setSmsText(e.target.value)} 
                        placeholder="سلام، خبر جدیدی برای شما داریم... لینک: https://madar.ir/link 🚀"
                        className="w-full bg-[#080c16] border border-transparent rounded-xl p-3 text-sm text-white outline-none focus:border focus:border-[#06b6d4] resize-none font-sans leading-relaxed shadow-inner"
                      />
                    </div>
                    {/* شمارنده هوشمند پیامک */}
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><span className="block text-[10px] text-gray-500 font-sans">تعداد کاراکتر</span><span className="font-bold text-sm text-white font-sans">{toPersianDigits(smsStats.chars)}</span></div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="text-center"><span className="block text-[10px] text-gray-500 font-sans">تعداد پیامک</span><span className={`font-bold text-sm font-sans ${smsStats.parts > 1 ? 'text-amber-400' : 'text-[#06b6d4]'}`}>{toPersianDigits(smsStats.parts)}</span></div>
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] text-gray-500 mb-0.5 font-sans">استاندارد ارسال</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-sans ${smsStats.type.includes('Unicode') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                          {smsStats.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </div>

          {/* ستون چپ: پیش‌نمایش زنده */}
          <div className="xl:col-span-5 space-y-6">
            <div className="sticky top-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#8b5cf6] pb-1 font-sans">
                  <Icon name="eye" className="w-5 h-5 text-[#8b5cf6]" /> پیش‌نمایش زنده
                </h3>
                <button form="notificationForm" type="submit" disabled={isSaving} className="px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 font-sans">
                  {isSaving ? <Icon name="loading" className="w-4 h-4 animate-spin" /> : <Icon name="rocket" className="w-4 h-4" />}
                  {isSaving ? 'در حال ارسال...' : (activeTab === 'TEMPLATE' ? 'ذخیره اتوماسیون' : 'پخش و ارسال کمپین')}
                </button>
              </div>

              <AnimatePresence>
                {sendInApp && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                    <span className="text-[11px] text-gray-400 font-bold px-2 block font-sans">نمای اعلان در کادر شیشه‌ای داشبورد کاربر</span>
                    <div className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1.5 h-full" style={{ backgroundColor: themeColor }}></div>
                      <div className="pr-4">
                        {coverUrl && (
                          <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-[#080c16]">
                            <img src={coverUrl} alt="cover" className="w-full h-full object-cover opacity-90" />
                          </div>
                        )}
                        <div className="flex gap-3 mb-3">
                          {iconUrl ? (
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><img src={iconUrl} className="w-6 h-6 object-contain" /></div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Icon name="bell" className="w-5 h-5 text-gray-400" /></div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-white mb-1 font-sans">{title || 'عنوان اعلان اینجا قرار می‌گیرد...'}</h4>
                            <span className="text-[10px] text-gray-500 font-sans">همین الان - خوانده نشده</span>
                          </div>
                        </div>
                        <div className="rich-text text-xs text-gray-300 leading-relaxed font-light line-clamp-4 font-sans">
                          {bodyHtml ? <div dangerouslySetInnerHTML={{ __html: bodyHtml }} /> : 'متن توضیحات اعلان شما در این قسمت نمایش داده خواهد شد...'}
                        </div>
                        {ctaButtons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                            {ctaButtons.map(btn => (
                              <span key={btn.id} className="text-[10px] px-3 py-1.5 rounded bg-white/10 text-white font-sans">{btn.label || 'دکمه بدون نام'}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {sendSms && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2 pt-4">
                  <span className="text-[11px] text-gray-400 font-bold px-2 block font-sans">نمای پیامک در موبایل کاربر</span>
                  <div className="w-72 mx-auto bg-[#000] border-4 border-gray-800 rounded-[2.5rem] h-[500px] relative overflow-hidden shadow-2xl flex flex-col">
                    <div className="absolute top-0 inset-x-0 h-6 bg-black flex justify-center z-10"><div className="w-24 h-4 bg-gray-800 rounded-b-xl"></div></div>
                    <div className="pt-8 pb-4 bg-gray-900/50 flex flex-col items-center border-b border-white/5">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-1"><Icon name="user" className="w-6 h-6" /></div>
                      <span className="text-xs text-white font-bold font-sans">MADAR</span>
                    </div>
                    <div className="flex-1 p-4 bg-[#000] flex flex-col justify-end">
                      <div className="bg-[#1c1c1e] text-white p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] self-start shadow-md relative">
                        <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">{smsText || 'متن پیامک اینجا نمایش داده می‌شود...'}</p>
                        <span className="text-[9px] text-gray-500 font-sans block text-right mt-1.5">{toPersianDigits(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-white/20 w-1/3 mx-auto mb-2 rounded-full mt-2"></div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* پاپ آپ مودال کتابخانه رسانه */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl font-sans" onClick={() => setMediaPickerTarget(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl h-[90vh] bg-[#0b0f19]/80 backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-3xl overflow-hidden flex flex-col">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent">
                <h3 className="text-white font-bold flex items-center gap-2 font-sans"><Icon name="image" className="w-5 h-5 text-[#8b5cf6]" /> انتخاب فایل از رسانه</h3>
                <button onClick={() => setMediaPickerTarget(null)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <MediaLibraryPage
                  isPickerMode={true}
                  onSelectMedia={(media) => {
                    if (mediaPickerTarget === 'iconUrl') setIconUrl(media.url);
                    else if (mediaPickerTarget === 'coverUrl') setCoverUrl(media.url);
                    else if (mediaPickerTarget === 'editor' && editorInstance) {
                      if (media.type?.includes('video')) editorInstance.commands.insertContent(`<video controls src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;"></video>`);
                      else if (media.type?.includes('audio')) editorInstance.commands.insertContent(`<audio controls src="${media.url}" style="width:100%; margin: 10px 0;"></audio>`);
                      else editorInstance.commands.insertContent(`<img src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;" alt="Media" />`);
                    }
                    setMediaPickerTarget(null);
                    setEditorInstance(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}