'use client';

import { useState, useEffect } from 'react';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
import IconPicker from '@/app/components/IconPicker';

export default function IdentitySettingsPage() {
  // ۱. استیت‌های هویت بصری و متنی (هدر، فوتر، کپی‌رایت)
  const [headerIcon, setHeaderIcon] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerIcon, setFooterIcon] = useState('');
  const [footerText, setFooterText] = useState('');
  const [favicon, setFavicon] = useState('');
  const [footerDesc, setFooterDesc] = useState('');
  const [copyrightText, setCopyrightText] = useState('');

  // ۲. استیت‌های نمادهای اعتماد (دو حالته)
  const [enamadType, setEnamadType] = useState('code');
  const [enamadCode, setEnamadCode] = useState('');
  const [enamadImg, setEnamadImg] = useState('');
  const [enamadUrl, setEnamadUrl] = useState('');

  const [samandehiType, setSamandehiType] = useState('code');
  const [samandehiCode, setSamandehiCode] = useState('');
  const [samandehiImg, setSamandehiImg] = useState('');
  const [samandehiUrl, setSamandehiUrl] = useState('');

  const [satraType, setSatraType] = useState('code');
  const [satraCode, setSatraCode] = useState('');
  const [satraImg, setSatraImg] = useState('');
  const [satraUrl, setSatraUrl] = useState('');

  // ۳. استیت‌های داینامیک (لیست‌ها)
  const [headerLinks, setHeaderLinks] = useState([]);
  const [fastLinks, setFastLinks] = useState([]);
  const [companionLinks, setCompanionLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const parseJSON = (data) => {
    try { return data ? JSON.parse(data) : []; } 
    catch { return []; }
  };

  useEffect(() => {
    async function loadSettings() {
      setHeaderIcon(await getSetting('header_icon') || '');
      setHeaderText(await getSetting('header_text') || '');
      setFooterIcon(await getSetting('footer_icon') || '');
      setFooterText(await getSetting('footer_text') || '');
      setFavicon(await getSetting('favicon') || '');
      setFooterDesc(await getSetting('footer_desc') || '');
      setCopyrightText(await getSetting('copyright_text') || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.');

      setEnamadType(await getSetting('enamad_type') || 'code');
      setEnamadCode(await getSetting('enamad_code') || '');
      setEnamadImg(await getSetting('enamad_img') || '');
      setEnamadUrl(await getSetting('enamad_url') || '');

      setSamandehiType(await getSetting('samandehi_type') || 'code');
      setSamandehiCode(await getSetting('samandehi_code') || '');
      setSamandehiImg(await getSetting('samandehi_img') || '');
      setSamandehiUrl(await getSetting('samandehi_url') || '');

      setSatraType(await getSetting('satra_type') || 'code');
      setSatraCode(await getSetting('satra_code') || '');
      setSatraImg(await getSetting('satra_img') || '');
      setSatraUrl(await getSetting('satra_url') || '');

      setHeaderLinks(parseJSON(await getSetting('header_links')));
      setFastLinks(parseJSON(await getSetting('footer_fast_links')));
      setCompanionLinks(parseJSON(await getSetting('footer_companion_links')));
      setSocialLinks(parseJSON(await getSetting('footer_social_links')));

      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', isError: false });

    const results = await Promise.all([
      saveSetting('header_icon', headerIcon, 'IDENTITY'),
      saveSetting('header_text', headerText, 'IDENTITY'),
      saveSetting('footer_icon', footerIcon, 'IDENTITY'),
      saveSetting('footer_text', footerText, 'IDENTITY'),
      saveSetting('favicon', favicon, 'IDENTITY'),
      saveSetting('footer_desc', footerDesc, 'IDENTITY'),
      saveSetting('copyright_text', copyrightText, 'IDENTITY'),

      saveSetting('enamad_type', enamadType, 'TRUST_SEALS'),
      saveSetting('enamad_code', enamadCode, 'TRUST_SEALS'),
      saveSetting('enamad_img', enamadImg, 'TRUST_SEALS'),
      saveSetting('enamad_url', enamadUrl, 'TRUST_SEALS'),

      saveSetting('samandehi_type', samandehiType, 'TRUST_SEALS'),
      saveSetting('samandehi_code', samandehiCode, 'TRUST_SEALS'),
      saveSetting('samandehi_img', samandehiImg, 'TRUST_SEALS'),
      saveSetting('samandehi_url', samandehiUrl, 'TRUST_SEALS'),

      saveSetting('satra_type', satraType, 'TRUST_SEALS'),
      saveSetting('satra_code', satraCode, 'TRUST_SEALS'),
      saveSetting('satra_img', satraImg, 'TRUST_SEALS'),
      saveSetting('satra_url', satraUrl, 'TRUST_SEALS'),

      saveSetting('header_links', JSON.stringify(headerLinks), 'IDENTITY_LINKS'),
      saveSetting('footer_fast_links', JSON.stringify(fastLinks), 'IDENTITY_LINKS'),
      saveSetting('footer_companion_links', JSON.stringify(companionLinks), 'IDENTITY_LINKS'),
      saveSetting('footer_social_links', JSON.stringify(socialLinks), 'IDENTITY_LINKS'),
    ]);

    setSaving(false);
    if (results.every(res => res.success)) {
      setStatusMessage({ text: 'تنظیمات با موفقیت در دیتابیس ذخیره شد.', isError: false });
    } else {
      setStatusMessage({ text: 'خطا در ثبت برخی تنظیمات!', isError: true });
    }
  };

  const addItem = (setter, template) => setter(prev => [...prev, { id: Date.now(), ...template }]);
  const updateItem = (setter, id, field, value) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));

  if (loading) return <div className="text-gray-400 p-6">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">هویت بصری و ساختار سایت</h1>
        <p className="text-sm text-gray-400">مدیریت لوگوها، منوها، شبکه‌های اجتماعی و نمادهای اعتماد</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-10 backdrop-blur-md">
        
        {/* ۱. لوگوها و نام‌ها */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۱. نماد و نام سایت</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* تنظیمات هدر */}
            <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">نماد هدر (بالای سایت)</h3>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">آیکون سایت</label>
                <IconPicker value={headerIcon} onChange={setHeaderIcon} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">نوشته کنار آیکون (اختیاری)</label>
                <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="مثال: شبکه رسانه‌ای مدار" className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#10b981]" />
              </div>
            </div>

            {/* تنظیمات فوتر */}
            <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">نماد فوتر (پایین سایت)</h3>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">آیکون فوتر</label>
                <IconPicker value={footerIcon} onChange={setFooterIcon} />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">نوشته کنار آیکون (اختیاری)</label>
                <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="مثال: مدار" className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#10b981]" />
              </div>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-black/20 rounded-xl border border-white/5 w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-300">فایو آیکون (تصویر زبانه مرورگر)</label>
            <input type="text" value={favicon} onChange={(e) => setFavicon(e.target.value)} placeholder="آدرس URL (مثال: /favicon.ico)" className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-gray-200 text-sm focus:border-[#10b981] dir-ltr text-right" />
          </div>
        </div>

        {/* ۲. منوی هدر */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#10b981]">۲. منوی هدر (کلمات لینک شده)</h2>
            <button type="button" onClick={() => addItem(setHeaderLinks, { title: '', url: '' })} className="text-xs bg-[#10b981]/20 text-[#10b981] px-3 py-1 rounded-md hover:bg-[#10b981]/40 cursor-pointer">+ افزودن لینک</button>
          </div>
          {headerLinks.map((link) => (
            <div key={link.id} className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
              <input type="text" placeholder="عنوان (مثل: محتوای خام)" value={link.title} onChange={e => updateItem(setHeaderLinks, link.id, 'title', e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
              <input type="text" placeholder="لینک (مثل: /archive)" value={link.url} onChange={e => updateItem(setHeaderLinks, link.id, 'url', e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" />
              <button type="button" onClick={() => removeItem(setHeaderLinks, link.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 cursor-pointer">حذف</button>
            </div>
          ))}
        </div>

        {/* ۳. ستون‌های فوتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* دسترسی سریع */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h2 className="text-lg font-bold text-[#06b6d4]">۳. فوتر: دسترسی سریع (نور آبی)</h2>
              <button type="button" onClick={() => addItem(setFastLinks, { title: '', url: '', tooltip: '' })} className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-3 py-1 rounded-md cursor-pointer">+ افزودن</button>
            </div>
            {fastLinks.map((link) => (
              <div key={link.id} className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative">
                <input type="text" placeholder="عنوان" value={link.title} onChange={e => updateItem(setFastLinks, link.id, 'title', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                <input type="text" placeholder="لینک" value={link.url} onChange={e => updateItem(setFastLinks, link.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" />
                <input type="text" placeholder="تول‌تیپ (راهنما)" value={link.tooltip} onChange={e => updateItem(setFastLinks, link.id, 'tooltip', e.target.value)} className="col-span-2 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                <button type="button" onClick={() => removeItem(setFastLinks, link.id)} className="absolute -top-2 -left-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
              </div>
            ))}
          </div>

          {/* همراهان */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h2 className="text-lg font-bold text-[#a855f7]">۴. فوتر: همراهان (نور بنفش)</h2>
              <button type="button" onClick={() => addItem(setCompanionLinks, { title: '', url: '', tooltip: '' })} className="text-xs bg-[#a855f7]/20 text-[#a855f7] px-3 py-1 rounded-md cursor-pointer">+ افزودن</button>
            </div>
            {companionLinks.map((link) => (
              <div key={link.id} className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative">
                <input type="text" placeholder="عنوان" value={link.title} onChange={e => updateItem(setCompanionLinks, link.id, 'title', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                <input type="text" placeholder="لینک" value={link.url} onChange={e => updateItem(setCompanionLinks, link.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" />
                <input type="text" placeholder="تول‌تیپ (راهنما)" value={link.tooltip} onChange={e => updateItem(setCompanionLinks, link.id, 'tooltip', e.target.value)} className="col-span-2 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                <button type="button" onClick={() => removeItem(setCompanionLinks, link.id)} className="absolute -top-2 -left-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* ۴. شبکه‌های اجتماعی داینامیک */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-[#10b981]">۵. شبکه‌های اجتماعی</h2>
            <button type="button" onClick={() => addItem(setSocialLinks, { iconName: '', url: '', tooltip: '', hoverColor: '#06b6d4' })} className="text-xs bg-[#10b981]/20 text-[#10b981] px-3 py-1 rounded-md cursor-pointer">+ افزودن شبکه اجتماعی</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks.map((social) => (
              <div key={social.id} className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/5 relative">
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">آیکون شبکه</label>
                  <IconPicker value={social.iconName} onChange={(val) => updateItem(setSocialLinks, social.id, 'iconName', val)} />
                </div>

                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-300">رنگ موس روی آیکون (Hover):</span>
                  <input
                    type="color"
                    value={social.hoverColor || '#06b6d4'}
                    onChange={e => updateItem(setSocialLinks, social.id, 'hoverColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={social.hoverColor || '#06b6d4'}
                    onChange={e => updateItem(setSocialLinks, social.id, 'hoverColor', e.target.value)}
                    placeholder="#06b6d4"
                    className="w-24 bg-[#0b0f19] border border-white/10 rounded p-1 text-xs text-white dir-ltr text-center"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <input type="text" placeholder="آدرس لینک (مثلا: https://t.me/madar)" value={social.url} onChange={e => updateItem(setSocialLinks, social.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right" />
                  <input type="text" placeholder="تول‌تیپ (عنوان شناور)" value={social.tooltip} onChange={e => updateItem(setSocialLinks, social.id, 'tooltip', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white" />
                </div>

                <button type="button" onClick={() => removeItem(setSocialLinks, social.id)} className="absolute -top-2 -left-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* ۵. توضیحات فوتر و نمادها */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۶. توضیحات فوتر و نمادهای اعتماد</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">متن توضیحات درباره مدار (درباره ما)</label>
              <textarea rows="3" value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} placeholder="توضیحات درباره فعالیت پلتفرم مدار..." className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-gray-200 text-sm focus:border-[#10b981]"></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">متن کپی‌رایت (پایین‌ترین بخش سایت)</label>
              <input type="text" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} placeholder="تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-gray-200 text-sm focus:border-[#10b981]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* اینماد */}
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">اینماد (eNamad)</span>
                <select value={enamadType} onChange={e => setEnamadType(e.target.value)} className="bg-[#0b0f19] text-xs text-emerald-400 p-1 rounded border border-white/10 outline-none">
                  <option value="code">کد اسکریپت</option>
                  <option value="image">عکس + لینک</option>
                </select>
              </div>
              {enamadType === 'code' ? (
                <textarea rows="3" value={enamadCode} onChange={e => setEnamadCode(e.target.value)} placeholder="کد جاوا اسکریپت اینماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none"></textarea>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={enamadImg} onChange={e => setEnamadImg(e.target.value)} placeholder="آدرس عکس نماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                  <input type="text" value={enamadUrl} onChange={e => setEnamadUrl(e.target.value)} placeholder="لینک مقصد اینماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                </div>
              )}
            </div>

            {/* ساماندهی */}
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">ساماندهی</span>
                <select value={samandehiType} onChange={e => setSamandehiType(e.target.value)} className="bg-[#0b0f19] text-xs text-emerald-400 p-1 rounded border border-white/10 outline-none">
                  <option value="code">کد اسکریپت</option>
                  <option value="image">عکس + لینک</option>
                </select>
              </div>
              {samandehiType === 'code' ? (
                <textarea rows="3" value={samandehiCode} onChange={e => setSamandehiCode(e.target.value)} placeholder="کد ساماندهی..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none"></textarea>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={samandehiImg} onChange={e => setSamandehiImg(e.target.value)} placeholder="آدرس عکس نماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                  <input type="text" value={samandehiUrl} onChange={e => setSamandehiUrl(e.target.value)} placeholder="لینک مقصد ساماندهی..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                </div>
              )}
            </div>

            {/* ساترا */}
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">ساترا</span>
                <select value={satraType} onChange={e => setSatraType(e.target.value)} className="bg-[#0b0f19] text-xs text-emerald-400 p-1 rounded border border-white/10 outline-none">
                  <option value="code">کد اسکریپت</option>
                  <option value="image">عکس + لینک</option>
                </select>
              </div>
              {satraType === 'code' ? (
                <textarea rows="3" value={satraCode} onChange={e => setSatraCode(e.target.value)} placeholder="کد ساترا..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none"></textarea>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={satraImg} onChange={e => setSatraImg(e.target.value)} placeholder="آدرس عکس نماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                  <input type="text" value={satraUrl} onChange={e => setSatraUrl(e.target.value)} placeholder="لینک مقصد ساترا..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none" />
                </div>
              )}
            </div>

          </div>
        </div>

        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-sm ${statusMessage.isError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer">
            {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات هویت'}
          </button>
        </div>

      </form>
    </div>
  );
}