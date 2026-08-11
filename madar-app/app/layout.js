import './globals.css';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getSetting } from '@/app/actions/settings';
import { getIcons } from '@/app/actions/icons';

export default async function RootLayout({ children }) {
  // ۱. دریافت کل آیکون‌ها و تنظیمات روی سرور (بدون هیچ تاخیری برای کاربر)
  const allIcons = await getIcons();

  // تنظیمات هدر
  const headerIcon = await getSetting('header_icon') || '';
  const headerText = await getSetting('header_text') || '';
  const headerLinksStr = await getSetting('header_links');
  const headerLinks = headerLinksStr ? JSON.parse(headerLinksStr) : [];

  // تنظیمات فوتر
  const footerIcon = await getSetting('footer_icon') || '';
  const footerText = await getSetting('footer_text') || '';
  const footerDesc = await getSetting('footer_desc') || 'شبکه رسانه‌ای مدار؛ پلتفرم مستقل آرشیو و تبادل دانش.';
  const copyrightText = await getSetting('copyright_text') || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.';

  const fastStr = await getSetting('footer_fast_links');
  const fastLinks = fastStr ? JSON.parse(fastStr) : [];

  const compStr = await getSetting('footer_companion_links');
  const companionLinks = compStr ? JSON.parse(compStr) : [];

  const socStr = await getSetting('footer_social_links');
  const socialLinks = socStr ? JSON.parse(socStr) : [];

  // نمادها
  const enamad = {
    type: await getSetting('enamad_type') || 'code',
    code: await getSetting('enamad_code') || '',
    img: await getSetting('enamad_img') || '',
    url: await getSetting('enamad_url') || '',
  };

  const samandehi = {
    type: await getSetting('samandehi_type') || 'code',
    code: await getSetting('samandehi_code') || '',
    img: await getSetting('samandehi_img') || '',
    url: await getSetting('samandehi_url') || '',
  };

  const satra = {
    type: await getSetting('satra_type') || 'code',
    code: await getSetting('satra_code') || '',
    img: await getSetting('satra_img') || '',
    url: await getSetting('satra_url') || '',
  };

  // بسته‌بندی داده‌ها برای فرستادن به هدر و فوتر
  const headerData = { headerIcon, headerText, headerLinks, allIcons };
  const footerData = {
    footerIcon, footerText, footerDesc, copyrightText,
    fastLinks, companionLinks, socialLinks, allIcons,
    enamad, samandehi, satra
  };

  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#080c16] text-white min-h-screen flex flex-col antialiased">
        <Header initialData={headerData} />
        <main className="flex-1">{children}</main>
        <Footer initialData={footerData} />
      </body>
    </html>
  );
}