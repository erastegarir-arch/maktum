'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSetting, saveSetting } from '@/app/actions/settings';
import Icon from '@/app/components/Icon';
// import IconPicker از اینجا حذف شد چون کتابخانه آیکون‌ها جایگزین شد
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function IdentitySettingsPage() {
  const router = useRouter();

  // ۱. استیت‌های هدر و لوگو
  const [headerIcon, setHeaderIcon] = useState('');
  const [logoColor, setLogoColor] = useState('#10b981');
  const [logoHoverColor, setLogoHoverColor] = useState('#059669');
  const [headerText, setHeaderText] = useState('مدار');
  const [showSiteTitle, setShowSiteTitle] = useState(true);
  const [headerOpacity, setHeaderOpacity] = useState(80);
  
  // استیت‌های پالت ۳ حالته منوی هدر
  const [navNormalColor, setNavNormalColor] = useState('#d1d5db');
  const [navHoverColor, setNavHoverColor] = useState('#059669');
  const [activeColor, setActiveColor] = useState('#10b981');

  // ۲. استیت‌های فوتر و فایوآیکون
  const [footerIcon, setFooterIcon] = useState('');
  const [footerText, setFooterText] = useState('');
  const [favicon, setFavicon] = useState('');
  const [footerDesc, setFooterDesc] = useState('');
  const [copyrightText, setCopyrightText] = useState('');

  // ۳. استیت‌های نمادهای اعتماد
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

  // ۴. استیت‌های داینامیک
  const [headerLinks, setHeaderLinks] = useState([]);
  const [fastLinks, setFastLinks] = useState([]);
  const [companionLinks, setCompanionLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  // ۵. استیت مودال انتخابگر رسانه
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const parseJSON = (data) => {
    try { return data ? JSON.parse(data) : []; } 
    catch { return []; }
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const hSettings = await getSetting('header_settings');
        if (hSettings) {
          try {
            const parsedH = JSON.parse(hSettings);
            setHeaderIcon(parsedH.logoIcon || parsedH.headerIcon || parsedH.icon || parsedH.logo || '');
            setLogoColor(parsedH.logoColor || '#10b981');
            setLogoHoverColor(parsedH.logoHoverColor || '#059669');
            setHeaderText(parsedH.siteTitle || 'مدار');
            setShowSiteTitle(parsedH.showSiteTitle !== false);
            setHeaderOpacity(parsedH.headerOpacity ?? 80);
            
            setNavNormalColor(parsedH.navNormalColor || '#d1d5db');
            setNavHoverColor(parsedH.navHoverColor || '#059669');
            setActiveColor(parsedH.activeColor || '#10b981');
          } catch (e) {}
        } else {
          setHeaderIcon(await getSetting('header_icon') || '');
          setHeaderText(await getSetting('header_text') || 'مدار');
        }

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
      } catch (err) {
        toast.error('خطا در دریافت اطلاعات هویت سایت!');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const headerSettingsObj = {
      logoIcon: headerIcon,
      headerIcon: headerIcon, 
      icon: headerIcon,
      logo: headerIcon,
      logoColor,
      logoHoverColor,
      siteTitle: headerText,
      showSiteTitle,
      headerOpacity: Number(headerOpacity),
      navNormalColor,
      navHoverColor,
      activeColor,
      navItems: headerLinks.map(l => ({
        label: l.title || l.label || '',
        href: l.url || l.href || '#'
      }))
    };

    const saveOps = Promise.all([
      saveSetting('header_settings', JSON.stringify(headerSettingsObj), 'IDENTITY'),
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

    toast.promise(
      saveOps,
      {
        loading: 'در حال ذخیره‌سازی تنظیمات هویت سایت...',
        success: (results) => {
          setSaving(false);
          if (results.every(res => res?.success)) {
            router.refresh();
            return 'تنظیمات با موفقیت ذخیره شد!';
          } else {
            throw new Error('خطا در ثبت برخی فیلدها');
          }
        },
        error: () => {
          setSaving(false);
          return 'خطا در برقراری ارتباط با دیتابیس!';
        }
      }
    );
  };

  const addItem = (setter, template) => setter(prev => [...prev, { id: Date.now(), ...template }]);
  const updateItem = (setter, id, field, value) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));

  if (loading) return <div className="text-gray-400 p-6 font-sans">در حال دریافت اطلاعات...</div>;

  return (
    <div className="max-w-5xl space-y-8 pb-10 font-sans text-right select-none">
      {/* هدر صفحه (با تم سبز زمردی) */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
          هویت بصری و ساختار سایت
        </h1>
        <p className="text-sm text-gray-400 font-light">مدیریت لوگوها، پالت‌های رنگی، شفافیت هدر، منوها، شبکه‌های اجتماعی و نمادهای اعتماد</p>
      </div>

      {/* کانتینر اصلی کارت با ساختار شیشه‌ای ایزوله گرافیک کلی1 */}
      <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
        
        {/* ۱. لایه پس‌زمینه شیشه‌ای ایزوله ثابت */}
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />

        {/* ۲. نوار نوری گرادینت سبز زمردی - دقیقاً مماس بر خط لبه‌ی بالایی */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none z-20" />

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-10 relative z-10">
          
          {/* ۱. لوگو، پالت‌های رنگی و هویت هدر */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۱. نماد، رنگ‌بندی و هویت هدر</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* تنظیمات لوگو و آیکون هدر */}
              <div className="space-y-4 p-5 bg-black/20 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Icon name="star" className="w-4 h-4 text-[#10b981]" />
                  لوگو و عنوان هدر
                </h3>
                
                {/* جایگزین شده با کتابخانه رسانه */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">نماد / لوگوی هدر (SVG, PNG, JPG)</label>
                  {headerIcon ? (
                    <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                      <img src={headerIcon} alt="لوگوی هدر" className="w-10 h-10 object-contain bg-black/40 rounded p-1 border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-emerald-400 font-bold truncate">تصویر لوگو انتخاب شد</p>
                      </div>
                      <button type="button" onClick={() => setMediaPickerTarget('headerLogo')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                      <button type="button" onClick={() => setHeaderIcon('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setMediaPickerTarget('headerLogo')} className="w-full py-2 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب تصویر از کتابخانه رسانه
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-400">رنگ آیکون (اولیه)</label>
                    <div className="flex items-center gap-2 bg-[#0b0f19] p-1.5 rounded-lg border border-white/10">
                      <input type="color" value={logoColor} onChange={e => setLogoColor(e.target.value)} className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={logoColor} onChange={e => setLogoColor(e.target.value)} className="w-full bg-transparent text-xs text-white dir-ltr text-center uppercase outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-400">رنگ آیکون (هاور/موس)</label>
                    <div className="flex items-center gap-2 bg-[#0b0f19] p-1.5 rounded-lg border border-white/10">
                      <input type="color" value={logoHoverColor} onChange={e => setLogoHoverColor(e.target.value)} className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={logoHoverColor} onChange={e => setLogoHoverColor(e.target.value)} className="w-full bg-transparent text-xs text-white dir-ltr text-center uppercase outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs text-gray-400">عنوان متنی سایت</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] text-gray-400">نمایش عنوان:</span>
                      <input type="checkbox" checked={showSiteTitle} onChange={e => setShowSiteTitle(e.target.checked)} className="accent-[#10b981] w-4 h-4 cursor-pointer" />
                    </label>
                  </div>
                  <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="مثال: مدار" className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#10b981] outline-none" />
                </div>
              </div>

              {/* تنظیمات شفافیت و رنگ‌بندی ۳ حالته منو */}
              <div className="space-y-4 p-5 bg-black/20 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Icon name="sliders" className="w-4 h-4 text-[#10b981]" />
                  استایل و شفافیت هدر
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-gray-300 font-medium">میزان شفافیت پس‌زمینه هدر</span>
                    <span className="text-[#10b981] font-bold dir-ltr">{headerOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={headerOpacity} 
                    onChange={e => setHeaderOpacity(e.target.value)}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10b981] focus:outline-none" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">کنترل درصد شیشه‌ای و شفاف بودن نوار هدر در بالای صفحه</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <label className="block text-xs font-bold text-[#10b981]">رنگ‌بندی کلمات منوی هدر (۳ حالت)</label>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-400">۱. حالت معمولی (لینک‌های غیرفعال):</label>
                    <div className="flex items-center gap-3 bg-[#0b0f19] p-2 rounded-xl border border-white/10">
                      <input type="color" value={navNormalColor} onChange={e => setNavNormalColor(e.target.value)} className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={navNormalColor} onChange={e => setNavNormalColor(e.target.value)} className="flex-1 bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-400">۲. حالت هاور (موس روی کلمه):</label>
                    <div className="flex items-center gap-3 bg-[#0b0f19] p-2 rounded-xl border border-white/10">
                      <input type="color" value={navHoverColor} onChange={e => setNavHoverColor(e.target.value)} className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={navHoverColor} onChange={e => setNavHoverColor(e.target.value)} className="flex-1 bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-gray-400">۳. حالت صفحه فعال + خط زیر کلمه:</label>
                    <div className="flex items-center gap-3 bg-[#0b0f19] p-2 rounded-xl border border-white/10">
                      <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="flex-1 bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-mono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-400">فایوآیکون (Favicon - زبانه مرورگر)</label>
                    {/* فایوآیکون با کتابخانه رسانه جایگزین شد */}
                    {favicon ? (
                      <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                        <img src={favicon} alt="Favicon" className="w-8 h-8 object-contain bg-black/40 rounded p-1 border border-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-emerald-400 font-bold truncate">فایوآیکون انتخاب شد</p>
                        </div>
                        <button type="button" onClick={() => setMediaPickerTarget('favicon')} className="px-2 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                        <button type="button" onClick={() => setFavicon('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"><Icon name="close" className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget('favicon')} className="w-full py-2 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب فایل (.ico, .png, .svg)
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ۲. منوی هدر (کلمات لینک شده پویا) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h2 className="text-lg font-bold text-[#10b981]">۲. منوی هدر (کلمات لینک‌شده از راست به چپ)</h2>
              <button type="button" onClick={() => addItem(setHeaderLinks, { title: '', url: '' })} className="text-xs bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-lg hover:bg-[#10b981]/40 transition-colors cursor-pointer font-bold">+ افزودن لینک منو</button>
            </div>
            <p className="text-xs text-gray-400 mb-2">لینک‌های ثبت شده دقیقاً به ترتیب از راست به چپ در هدر نمایش داده می‌شوند.</p>
            
            {headerLinks.map((link) => (
              <div key={link.id} className="flex gap-3 items-center p-3 bg-white/5 rounded-xl border border-white/5 text-right">
                <input type="text" placeholder="عنوان کلمه (مثل: محتوای تولیدی)" value={link.title || link.label || ''} onChange={e => updateItem(setHeaderLinks, link.id, 'title', e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2.5 text-sm text-white text-right outline-none focus:border-[#10b981]" />
                <input type="text" placeholder="آدرس مقصد (مثل: /products)" value={link.url || link.href || ''} onChange={e => updateItem(setHeaderLinks, link.id, 'url', e.target.value)} className="flex-1 bg-[#0b0f19] border border-white/10 rounded-lg p-2.5 text-sm text-white dir-ltr text-right outline-none focus:border-[#10b981]" />
                <button type="button" onClick={() => removeItem(setHeaderLinks, link.id)} className="p-2.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-lg transition-colors cursor-pointer text-xs font-bold shrink-0">حذف</button>
              </div>
            ))}
          </div>

          {/* ۳. نماد فوتر */}
          <div className="space-y-4 p-5 bg-black/20 rounded-xl border border-white/5">
            <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۳. نماد و عنوان فوتر (پایین سایت)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* جایگزین شده با کتابخانه رسانه */}
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">آیکون / لوگوی فوتر</label>
                {footerIcon ? (
                  <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                    <img src={footerIcon} alt="لوگوی فوتر" className="w-10 h-10 object-contain bg-black/40 rounded p-1 border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-emerald-400 font-bold truncate">نماد انتخاب شد</p>
                    </div>
                    <button type="button" onClick={() => setMediaPickerTarget('footerIcon')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                    <button type="button" onClick={() => setFooterIcon('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setMediaPickerTarget('footerIcon')} className="w-full py-2 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب نماد از کتابخانه رسانه
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-400">نوشته کنار آیکون فوتر</label>
                <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="مثال: مدار" className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#10b981] outline-none" />
              </div>
            </div>
          </div>

          {/* ۴. ستون‌های فوتر (دسترسی سریع و همراهان) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h2 className="text-lg font-bold text-[#10b981]">۴. فوتر: دسترسی سریع (نور زمردی)</h2>
                <button type="button" onClick={() => addItem(setFastLinks, { title: '', url: '', tooltip: '' })} className="text-xs bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-lg cursor-pointer font-bold">+ افزودن</button>
              </div>
              {fastLinks.map((link) => (
                <div key={link.id} className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative">
                  <input type="text" placeholder="عنوان" value={link.title} onChange={e => updateItem(setFastLinks, link.id, 'title', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white text-right outline-none" />
                  <input type="text" placeholder="لینک" value={link.url} onChange={e => updateItem(setFastLinks, link.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right outline-none" />
                  <input type="text" placeholder="تول‌تیپ (راهنما)" value={link.tooltip} onChange={e => updateItem(setFastLinks, link.id, 'tooltip', e.target.value)} className="col-span-2 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white text-right outline-none" />
                  <button type="button" onClick={() => removeItem(setFastLinks, link.id)} className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h2 className="text-lg font-bold text-[#a855f7]">۵. فوتر: همراهان (نور بنفش)</h2>
                <button type="button" onClick={() => addItem(setCompanionLinks, { title: '', url: '', tooltip: '' })} className="text-xs bg-[#a855f7]/20 text-[#a855f7] px-3 py-1.5 rounded-lg cursor-pointer font-bold">+ افزودن</button>
              </div>
              {companionLinks.map((link) => (
                <div key={link.id} className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative">
                  <input type="text" placeholder="عنوان" value={link.title} onChange={e => updateItem(setCompanionLinks, link.id, 'title', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white text-right outline-none" />
                  <input type="text" placeholder="لینک" value={link.url} onChange={e => updateItem(setCompanionLinks, link.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right outline-none" />
                  <input type="text" placeholder="تول‌تیپ (راهنما)" value={link.tooltip} onChange={e => updateItem(setCompanionLinks, link.id, 'tooltip', e.target.value)} className="col-span-2 bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white text-right outline-none" />
                  <button type="button" onClick={() => removeItem(setCompanionLinks, link.id)} className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* ۵. شبکه‌های اجتماعی داینامیک */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h2 className="text-lg font-bold text-[#10b981]">۶. شبکه‌های اجتماعی</h2>
              <button type="button" onClick={() => addItem(setSocialLinks, { iconName: '', url: '', tooltip: '', hoverColor: '#10b981' })} className="text-xs bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-lg cursor-pointer font-bold">+ افزودن شبکه اجتماعی</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialLinks.map((social) => (
                <div key={social.id} className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/5 relative">
                  
                  {/* جایگزین شده با کتابخانه رسانه */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">آیکون شبکه اجتماعی (فایل SVG / PNG)</label>
                    {social.iconName ? (
                      <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                        <img src={social.iconName} alt="آیکون شبکه" className="w-8 h-8 object-contain bg-black/40 rounded p-1 border border-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-emerald-400 font-bold truncate">تصویر تنظیم شد</p>
                        </div>
                        <button type="button" onClick={() => setMediaPickerTarget(`socialIcon_${social.id}`)} className="px-2 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[10px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget(`socialIcon_${social.id}`)} className="w-full py-2 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب تصویر از کتابخانه
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-300">رنگ موس روی آیکون (Hover):</span>
                    <input type="color" value={social.hoverColor || '#10b981'} onChange={e => updateItem(setSocialLinks, social.id, 'hoverColor', e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={social.hoverColor || '#10b981'} onChange={e => updateItem(setSocialLinks, social.id, 'hoverColor', e.target.value)} placeholder="#10b981" className="w-24 bg-[#0b0f19] border border-white/10 rounded p-1 text-xs text-white dir-ltr text-center outline-none" />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input type="text" placeholder="آدرس لینک" value={social.url} onChange={e => updateItem(setSocialLinks, social.id, 'url', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white dir-ltr text-right outline-none" />
                    <input type="text" placeholder="تول‌تیپ (عنوان شناور)" value={social.tooltip} onChange={e => updateItem(setSocialLinks, social.id, 'tooltip', e.target.value)} className="bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-sm text-white text-right outline-none" />
                  </div>

                  <button type="button" onClick={() => removeItem(setSocialLinks, social.id)} className="absolute -top-2 -left-2 bg-rose-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center cursor-pointer">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* ۶. توضیحات فوتر و نمادهای اعتماد */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#10b981] border-b border-white/10 pb-2">۷. توضیحات فوتر و نمادهای اعتماد</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">متن توضیحات درباره مدار (درباره ما)</label>
                <textarea rows="3" value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} placeholder="توضیحات درباره فعالیت پلتفرم مدار..." className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-gray-200 text-sm focus:border-[#10b981] text-right outline-none"></textarea>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">متن کپی‌رایت (پایین‌ترین بخش سایت)</label>
                <input type="text" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} placeholder="تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-3 text-gray-200 text-sm focus:border-[#10b981] text-right outline-none" />
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
                  <textarea rows="3" value={enamadCode} onChange={e => setEnamadCode(e.target.value)} placeholder="کد جاوا اسکریپت اینماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left"></textarea>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 block">تصویر اینماد</label>
                      {enamadImg ? (
                        <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                          <img src={enamadImg} alt="اینماد" className="w-10 h-10 object-contain bg-black/40 rounded p-1 border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-emerald-400 font-bold truncate">تصویر انتخاب شد</p>
                          </div>
                          <button type="button" onClick={() => setMediaPickerTarget('enamad')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                          <button type="button" onClick={() => setEnamadImg('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget('enamad')} className="w-full py-2.5 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب تصویر از کتابخانه
                        </button>
                      )}
                    </div>
                    <input type="text" value={enamadUrl} onChange={e => setEnamadUrl(e.target.value)} placeholder="لینک مقصد اینماد..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left" />
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
                  <textarea rows="3" value={samandehiCode} onChange={e => setSamandehiCode(e.target.value)} placeholder="کد ساماندهی..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left"></textarea>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 block">تصویر ساماندهی</label>
                      {samandehiImg ? (
                        <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                          <img src={samandehiImg} alt="ساماندهی" className="w-10 h-10 object-contain bg-black/40 rounded p-1 border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-emerald-400 font-bold truncate">تصویر انتخاب شد</p>
                          </div>
                          <button type="button" onClick={() => setMediaPickerTarget('samandehi')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                          <button type="button" onClick={() => setSamandehiImg('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget('samandehi')} className="w-full py-2.5 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب تصویر از کتابخانه
                        </button>
                      )}
                    </div>
                    <input type="text" value={samandehiUrl} onChange={e => setSamandehiUrl(e.target.value)} placeholder="لینک مقصد ساماندهی..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left" />
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
                  <textarea rows="3" value={satraCode} onChange={e => setSatraCode(e.target.value)} placeholder="کد ساترا..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left"></textarea>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 block">تصویر ساترا</label>
                      {satraImg ? (
                        <div className="flex items-center gap-3 p-2 bg-[#0b0f19] border border-white/10 rounded-lg">
                          <img src={satraImg} alt="ساترا" className="w-10 h-10 object-contain bg-black/40 rounded p-1 border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-emerald-400 font-bold truncate">تصویر انتخاب شد</p>
                          </div>
                          <button type="button" onClick={() => setMediaPickerTarget('satra')} className="px-2.5 py-1 bg-white/10 hover:bg-[#10b981] text-white text-[11px] rounded transition-colors cursor-pointer shrink-0">تغییر</button>
                          <button type="button" onClick={() => setSatraImg('')} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0" title="حذف"><Icon name="close" className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget('satra')} className="w-full py-2.5 bg-[#0b0f19] border border-dashed border-white/20 hover:border-[#10b981] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Icon name="image" className="w-4 h-4 text-[#10b981]" /> انتخاب تصویر از کتابخانه
                        </button>
                      )}
                    </div>
                    <input type="text" value={satraUrl} onChange={e => setSatraUrl(e.target.value)} placeholder="لینک مقصد ساترا..." className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2 text-xs dir-ltr outline-none text-left" />
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 transition-all">
              {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره'}
            </button>
          </div>

        </form>
      </div>

      {/* پاپ آپ یکپارچه مودال کتابخانه رسانه برای انتخاب تمامی تصاویر و آیکون‌ها */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#080c16]/80 backdrop-blur-md">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMediaPickerTarget(null)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full z-10 transition-colors cursor-pointer"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
            <MediaLibraryPage
              isPickerMode={true}
              onSelectMedia={(media) => {
                if (mediaPickerTarget === 'headerLogo') setHeaderIcon(media.url);
                else if (mediaPickerTarget === 'favicon') setFavicon(media.url);
                else if (mediaPickerTarget === 'footerIcon') setFooterIcon(media.url);
                else if (mediaPickerTarget === 'enamad') setEnamadImg(media.url);
                else if (mediaPickerTarget === 'samandehi') setSamandehiImg(media.url);
                else if (mediaPickerTarget === 'satra') setSatraImg(media.url);
                else if (mediaPickerTarget.startsWith('socialIcon_')) {
                  const sId = parseInt(mediaPickerTarget.split('_')[1]);
                  updateItem(setSocialLinks, sId, 'iconName', media.url);
                }
                setMediaPickerTarget(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}