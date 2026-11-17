'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ایمن‌سازی نشانی‌های اینترنتی در برابر حملات XSS (پروتکل‌های مخرب)
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '#';
  return trimmed;
};

// پاکسازی کدهای SVG از اسکریپت‌ها و رویدادهای درون‌خطی
const sanitizeSvg = (svg) => {
  if (!svg || typeof svg !== 'string') return '';
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
};

function SocialIconItem({ social, allIcons }) {
  const rawIcon = social?.iconName?.trim() || '';
  const isUrl = rawIcon && (rawIcon.includes('/') || rawIcon.startsWith('http') || rawIcon.startsWith('.'));
  const iconSvg = !isUrl && rawIcon ? allIcons.find(i => i.name === rawIcon)?.svgCode : null;

  // اگر هیچ نمادی انتخاب نشده و عنوانی هم ندارد، المان ناقص رندر نشود
  if (!isUrl && !iconSvg && !social?.tooltip) return null;

  const safeHref = sanitizeUrl(social.url);
  const hoverColor = social.hoverColor || '#06b6d4';

  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.12, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.tooltip || 'شبکه اجتماعی'}
          className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-[#101d38]/35 backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white/60 hover:text-[var(--hover-color)] hover:bg-[#101d38]/60 hover:border-[var(--hover-color)]/40 hover:shadow-[0_4px_16px_var(--hover-color-light),inset_0_0_8px_var(--hover-color-soft)] flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{ 
            '--hover-color': hoverColor,
            '--hover-color-light': `${hoverColor}40`,
            '--hover-color-soft': `${hoverColor}15`
          }}
        >
          {isUrl ? (
            <div 
              className="w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300"
              style={{
                backgroundColor: 'currentColor',
                WebkitMaskImage: `url("${encodeURI(rawIcon)}")`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url("${encodeURI(rawIcon)}")`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          ) : iconSvg ? (
            <div 
              className="w-3.5 h-3.5 md:w-4 md:h-4 [&>svg]:w-full [&>svg]:h-full" 
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(iconSvg) }} 
            />
          ) : (
            <span className="text-[9px] md:text-[11px] font-bold px-1.5 leading-none">
              {social.tooltip}
            </span>
          )}
        </Link>
      </motion.div>

      {/* تولتیپ سرمه‌ای تیره گلس‌مورفیک با شفافیت کنترل‌شده */}
      {social.tooltip && (
        <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-[99999] pointer-events-none animate-[fadeIn_0.18s_ease-out]">
          <div className="relative overflow-hidden bg-[#0e1b33]/90 border border-white/[0.15] backdrop-blur-2xl backdrop-saturate-150 text-white text-[9px] md:text-[11px] py-1 px-2.5 md:py-1.5 md:px-3 rounded-xl shadow-[0_10px_28px_rgba(4,9,20,0.75),inset_0_1px_1px_rgba(255,255,255,0.18)] whitespace-nowrap max-w-[calc(100vw-24px)] truncate font-sans font-bold">
            <span className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4]/60 to-transparent pointer-events-none" />
            {social.tooltip}
          </div>
          <div className="w-2 h-2 bg-[#0e1b33]/90 border-r border-b border-white/[0.15] rotate-45 -mt-1"></div>
        </div>
      )}
    </div>
  );
}

export default function Footer({ initialData }) {
  const pathname = usePathname();
  const [brokenFooterImgs, setBrokenFooterImgs] = useState({});
  const markFooterImgBroken = (url) => {
    if (!url) return;
    setBrokenFooterImgs((prev) => ({ ...prev, [url]: true }));
  };

  if (pathname?.startsWith('/portal-entry-99') || pathname?.startsWith('/admin')) {
    return null;
  }

  const { 
    allIcons = [], 
    footerIcon = '', 
    footerText = '', 
    footerDesc = 'شبکه رسانه‌ای مکتوم؛ پلتفرم مستقل پایگاه داده و تبادل دانش.', 
    copyrightText = 'تمامی حقوق برای شبکه رسانه‌ای مکتوم محفوظ است.',
    fastLinks = [], 
    companionLinks = [], 
    socialLinks = [],
    enamad = {}, 
    samandehi = {}, 
    satra = {}
  } = initialData || {};

  const cleanFooterIcon = footerIcon?.trim() || '';
  const isFooterIconUrl = Boolean(
    cleanFooterIcon &&
      !brokenFooterImgs[cleanFooterIcon] &&
      (cleanFooterIcon.includes('/') || cleanFooterIcon.startsWith('http') || cleanFooterIcon.startsWith('.'))
  );
  const footerIconSvg = !isFooterIconUrl && cleanFooterIcon ? allIcons.find(i => i.name === cleanFooterIcon)?.svgCode : null;
  const hasFooterIcon = Boolean(isFooterIconUrl || footerIconSvg);
  const hasFooterText = Boolean(footerText && footerText.trim() !== '');
  const hasBrandBlock = hasFooterIcon || hasFooterText;

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      aria-label="پاورقی سامانه"
      className="w-full bg-[#0b1426]/65 backdrop-blur-3xl backdrop-saturate-150 text-gray-300 pt-4 pb-24 md:pt-7 md:pb-5 px-3 md:px-8 mt-auto relative z-10 font-sans select-none shadow-[0_-12px_40px_rgba(4,9,20,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] border-t border-white/[0.08]"
    >
      {/* پس‌زمینه سرمه‌ای تیره و گلس‌مورفیک (حذف کامل رنگ سیاه #050810) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#101d38]/55 via-[#0b1426]/75 to-[#081020]/85 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-12 right-10 w-80 h-36 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.16)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -top-12 left-1/3 w-72 h-32 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.11)_0%,transparent_70%)] pointer-events-none" />
      </div>
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-85 pointer-events-none z-20" />

      <div className="max-w-7xl mx-auto flex flex-col gap-3 md:gap-4 relative z-10">
        
        {/* ردیف اول: لوگو و عنوان در سمت راست، و متن توضیحات با عرض محدود و استاندارد در کنار آن */}
        <div className="flex flex-row items-center md:items-start justify-start gap-2.5 md:gap-4 w-full">
          
          {hasBrandBlock && (
            <Link 
              href="/" 
              aria-label={footerText || 'صفحه اصلی مکتوم'}
              className="flex items-center gap-2 md:gap-2.5 shrink-0 group cursor-pointer"
            >
              {isFooterIconUrl ? (
                <img 
                  key={cleanFooterIcon}
                  src={cleanFooterIcon} 
                  onError={() => markFooterImgBroken(cleanFooterIcon)}
                  alt={footerText || 'لوگوی مکتوم'} 
                  loading="lazy"
                  decoding="async"
                  className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-[0_0_14px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" 
                />
              ) : footerIconSvg ? (
                <div 
                  className="w-7 h-7 md:w-10 md:h-10 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_14px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" 
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(footerIconSvg) }} 
                />
              ) : null}

              {hasFooterText && (
                <span className="text-white font-black text-sm md:text-xl tracking-wider group-hover:text-[#06b6d4] transition-colors duration-300 drop-shadow-sm">
                  {footerText}
                </span>
              )}
            </Link>
          )}

          {/* متن توضیحات با عرض کنترل‌شده در دسکتاپ */}
          {footerDesc && (
            <div className="flex-1 md:flex-initial md:max-w-[540px] lg:max-w-[580px] my-auto">
              <p 
                className="text-[9px] md:text-[13px] text-gray-300/90 font-light leading-[1.85] md:leading-[1.9] text-justify w-full" 
                style={{ textAlignLast: 'right' }}
              >
                {footerDesc}
              </p>
            </div>
          )}
        </div>

        {/* ردیف دوم: گرید ۳ ستونه برای پیوندها و شبکه‌های اجتماعی */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 w-full pt-0.5">
          
          {/* ستون‌های دسترسی سریع و همراهان */}
          {[
            { title: 'دسترسی سریع', links: fastLinks, color: '#06b6d4' },
            { title: 'همراهان', links: companionLinks, color: '#a855f7' }
          ].map((section, idx) => (
            <div key={idx} className="col-span-1 space-y-2 md:space-y-2.5">
              <div className="flex items-center justify-start gap-1.5 md:gap-2 pb-1.5 md:pb-2 relative">
                <span 
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: section.color, boxShadow: `0 0 8px ${section.color}` }}
                />
                <h3 className="text-white font-bold text-[10px] md:text-xs whitespace-nowrap tracking-wide">
                  {section.title}
                </h3>
                <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-l from-white/10 via-white/5 to-transparent" />
              </div>

              <ul className="space-y-1.5 md:space-y-2">
                {section.links.length > 0 ? (
                  section.links.map((link, lIdx) => {
                    const safeHref = sanitizeUrl(link.url);
                    const isExternal = safeHref.startsWith('http');

                    return (
                      <motion.li 
                        key={link.id || lIdx} 
                        whileHover={{ x: -3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="flex items-center gap-1.5 md:gap-2 group/link relative w-fit"
                      >
                        <span 
                          className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-300 group-hover/link:scale-125 shrink-0" 
                          style={{ backgroundColor: section.color, boxShadow: `0 0 6px ${section.color}80` }}
                        />
                        <Link 
                          href={safeHref} 
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="text-gray-300/85 group-hover/link:text-white transition-colors duration-200 font-medium text-[9px] md:text-xs whitespace-nowrap"
                        >
                          {link.title}
                        </Link>

                        {/* تولتیپ سرمه‌ای تیره گلس‌مورفیک */}
                        {link.tooltip && (
                          <div className="absolute bottom-full mb-2 right-0 hidden group-hover/link:flex flex-col items-end z-[99999] pointer-events-none animate-[fadeIn_0.18s_ease-out]">
                            <div className="relative overflow-hidden bg-[#0e1b33]/90 border border-white/[0.15] backdrop-blur-2xl backdrop-saturate-150 text-white text-[9px] md:text-[11px] py-1 px-2.5 md:py-1.5 md:px-3 rounded-xl shadow-[0_10px_28px_rgba(4,9,20,0.75),inset_0_1px_1px_rgba(255,255,255,0.18)] whitespace-nowrap max-w-[calc(100vw-24px)] truncate font-sans font-bold">
                              <span className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4]/60 to-transparent pointer-events-none" />
                              {link.tooltip}
                            </div>
                          </div>
                        )}
                      </motion.li>
                    );
                  })
                ) : (
                  <li className="text-gray-400 text-[9px] md:text-xs">بدون پیوند</li>
                )}
              </ul>
            </div>
          ))}

          {/* ستون شبکه‌های اجتماعی و مجوزها */}
          <div className="col-span-1 space-y-2 md:space-y-2.5">
            <div className="flex items-center justify-start gap-1.5 md:gap-2 pb-1.5 md:pb-2 relative">
              <h3 className="text-white font-bold text-[10px] md:text-xs whitespace-nowrap tracking-wide">
                شبکه‌های اجتماعی
              </h3>
              <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-l from-white/10 via-white/5 to-transparent" />
            </div>
            
            {/* نماد‌های شبکه‌های اجتماعی */}
            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 pt-0.5">
              {socialLinks.map((social, sIdx) => (
                <SocialIconItem key={social.id || sIdx} social={social} allIcons={allIcons} />
              ))}
            </div>

            {/* مجوزها از چپ به راست */}
            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2.5 pt-1 dir-ltr">
              {[{data: enamad, name: 'اینماد'}, {data: samandehi, name: 'ساماندهی'}, {data: satra, name: 'ساترا'}].map((badge, idx) => (
                <div key={idx} className="transition-transform duration-300 hover:scale-105">
                  {badge.data?.type === 'code' && badge.data?.code && (
                    <div className="scale-90 md:scale-105 origin-left" dangerouslySetInnerHTML={{ __html: badge.data.code }} />
                  )}
                  {badge.data?.type === 'image' && badge.data?.img && !brokenFooterImgs[badge.data.img] && (
                    <Link href={sanitizeUrl(badge.data.url)} target="_blank" rel="noopener noreferrer" className="block">
                      <img 
                        key={badge.data.img}
                        src={badge.data.img} 
                        onError={() => markFooterImgBroken(badge.data.img)}
                        alt={badge.name} 
                        loading="lazy"
                        decoding="async"
                        className="h-9 md:h-14 w-auto object-contain rounded-lg bg-[#101d38]/30 p-1 border border-white/10" 
                      />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ردیف سوم: متن حق مالکیت (وقف‌نامه) وسط‌چین، جاستیفای، با عرض محدود و غیرقابل انتخاب با ماوس */}
      {copyrightText && (
        <div className="max-w-7xl mx-auto mt-3.5 md:mt-5 pt-2.5 md:pt-3.5 border-t border-white/[0.06] relative z-10 select-none pointer-events-none">
          <p 
            className="max-w-[290px] sm:max-w-md md:max-w-[510px] mx-auto text-[8px] md:text-[11px] text-gray-400/80 font-light leading-[1.8] md:leading-[1.9] text-justify [text-align-last:center] select-none"
            style={{
              textAlign: 'justify',
              textAlignLast: 'center',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            {copyrightText}
          </p>
        </div>
      )}
    </motion.footer>
  );
}