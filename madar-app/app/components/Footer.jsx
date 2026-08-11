'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

function SocialIconItem({ social, allIcons }) {
  const [isHovered, setIsHovered] = useState(false);
  const iconSvg = allIcons.find(i => i.name === social.iconName)?.svgCode;

  return (
    <div className="relative group/tooltip">
      <Link
        href={social.url || '#'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ color: isHovered ? (social.hoverColor || '#10b981') : '#9ca3af' }}
        className="transition-all duration-300 transform hover:scale-125 block p-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
      >
        {iconSvg ? (
          <div className="svg-inherit-color w-6 h-6 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: iconSvg }} />
        ) : (
          <Icon name="link" className="w-6 h-6" />
        )}
      </Link>

      {social.tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none">
          {social.tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0f19]"></div>
        </div>
      )}
    </div>
  );
}

export default function Footer({ initialData }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/portal-entry-99')) {
    return null;
  }

  // خواندن داده‌های آنی از ورودی سرور
  const allIcons = initialData?.allIcons || [];
  const footerIcon = initialData?.footerIcon || '';
  const footerText = initialData?.footerText || '';
  const footerDesc = initialData?.footerDesc || 'شبکه رسانه‌ای مدار؛ پلتفرم مستقل آرشیو و تبادل دانش.';
  const copyrightText = initialData?.copyrightText || 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.';

  const fastLinks = initialData?.fastLinks || [];
  const companionLinks = initialData?.companionLinks || [];
  const socialLinks = initialData?.socialLinks || [];

  const enamad = initialData?.enamad || {};
  const samandehi = initialData?.samandehi || {};
  const satra = initialData?.satra || {};

  const footerIconSvg = allIcons.find(i => i.name === footerIcon)?.svgCode;

  return (
    <footer className="w-full bg-[#080c16] border-t border-white/10 text-gray-300 py-12 px-4 md:px-8 mt-auto relative z-10 overflow-hidden font-sans">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* لوگو و توضیحات */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center gap-3 w-fit">
            {footerIconSvg && (
              <div className="svg-inherit-color w-10 h-10 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" dangerouslySetInnerHTML={{ __html: footerIconSvg }} />
            )}
            {footerText && (
              <span className="text-white font-black text-xl tracking-wider drop-shadow-md">{footerText}</span>
            )}
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">
            {footerDesc}
          </p>
        </div>

        {/* دسترسی سریع */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_10px_#06b6d4]"></span>
            <h3 className="text-white font-bold text-base">دسترسی سریع</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {fastLinks.length > 0 ? (
              fastLinks.map((link) => (
                <li key={link.id} className="flex items-center gap-2 group relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_6px_#06b6d4] transition-transform duration-300 group-hover:scale-150"></span>
                  <Link href={link.url || '#'} className="hover:text-[#06b6d4] transition-colors">
                    {link.title}
                  </Link>
                  {link.tooltip && (
                    <div className="absolute bottom-full mb-1 right-0 hidden group-hover:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none">
                      {link.tooltip}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-xs">لینکی ثبت نشده است</li>
            )}
          </ul>
        </div>

        {/* همراهان */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></span>
            <h3 className="text-white font-bold text-base">همراهان</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {companionLinks.length > 0 ? (
              companionLinks.map((link) => (
                <li key={link.id} className="flex items-center gap-2 group relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_6px_#a855f7] transition-transform duration-300 group-hover:scale-150"></span>
                  <Link href={link.url || '#'} className="hover:text-[#a855f7] transition-colors">
                    {link.title}
                  </Link>
                  {link.tooltip && (
                    <div className="absolute bottom-full mb-1 right-0 hidden group-hover:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none">
                      {link.tooltip}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-xs">لینکی ثبت نشده است</li>
            )}
          </ul>
        </div>

        {/* شبکه‌های اجتماعی و نمادها */}
        <div className="space-y-6 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-4">
            {socialLinks.map((social) => (
              <SocialIconItem key={social.id} social={social} allIcons={allIcons} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {enamad.type === 'code' && enamad.code && (
              <div dangerouslySetInnerHTML={{ __html: enamad.code }} />
            )}
            {enamad.type === 'image' && enamad.img && (
              <Link href={enamad.url || '#'} target="_blank" className="hover:opacity-80 transition-opacity">
                <img src={enamad.img} alt="اینماد" className="h-14 w-auto object-contain" />
              </Link>
            )}

            {samandehi.type === 'code' && samandehi.code && (
              <div dangerouslySetInnerHTML={{ __html: samandehi.code }} />
            )}
            {samandehi.type === 'image' && samandehi.img && (
              <Link href={samandehi.url || '#'} target="_blank" className="hover:opacity-80 transition-opacity">
                <img src={samandehi.img} alt="ساماندهی" className="h-14 w-auto object-contain" />
              </Link>
            )}

            {satra.type === 'code' && satra.code && (
              <div dangerouslySetInnerHTML={{ __html: satra.code }} />
            )}
            {satra.type === 'image' && satra.img && (
              <Link href={satra.url || '#'} target="_blank" className="hover:opacity-80 transition-opacity">
                <img src={satra.img} alt="ساترا" className="h-14 w-auto object-contain" />
              </Link>
            )}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 text-center text-xs text-gray-500 relative z-10">
        {copyrightText}
      </div>
    </footer>
  );
}