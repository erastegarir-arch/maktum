'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '../Icon';

const cn = (...inputs) => twMerge(clsx(inputs));

function SocialIconItem({ social, allIcons }) {
  const isUrl = social.iconName && (social.iconName.includes('/') || social.iconName.startsWith('http'));
  const iconSvg = !isUrl ? allIcons.find(i => i.name === social.iconName)?.svgCode : null;

  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.15, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={social.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] text-white/50 hover:text-[var(--hover-color)] hover:bg-white/[0.06] hover:border-white/[0.1] hover:shadow-[0_0_15px_var(--hover-color-light)] flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{ 
            '--hover-color': social.hoverColor || '#06b6d4',
            '--hover-color-light': `${social.hoverColor || '#06b6d4'}40` 
          }}
        >
          {isUrl ? (
            <div 
              className="w-3.5 h-3.5 md:w-5 md:h-5 transition-all duration-300"
              style={{
                backgroundColor: 'currentColor',
                WebkitMaskImage: `url(${social.iconName})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${social.iconName})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          ) : iconSvg ? (
            <div className="w-3.5 h-3.5 md:w-5 md:h-5 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: iconSvg }} />
          ) : (
            <Icon name="link" className="w-3.5 h-3.5 md:w-5 md:h-5" />
          )}
        </Link>
      </motion.div>

      {social.tooltip && (
        <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-[99999] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[9px] md:text-[11px] py-1 px-2 md:py-1.5 md:px-3 rounded-md md:rounded-lg shadow-2xl whitespace-nowrap font-sans font-bold">
            {social.tooltip}
          </div>
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

  const { 
    allIcons = [], footerIcon = '', footerText = '', 
    footerDesc = 'شبکه رسانه‌ای مدار؛ پلتفرم مستقل آرشیو و تبادل دانش.', 
    copyrightText = 'تمامی حقوق برای شبکه رسانه‌ای مدار محفوظ است.',
    fastLinks = [], companionLinks = [], socialLinks = [],
    enamad = {}, samandehi = {}, satra = {}
  } = initialData || {};

  const isFooterIconUrl = footerIcon && (footerIcon.includes('/') || footerIcon.startsWith('http'));
  const footerIconSvg = !isFooterIconUrl ? allIcons.find(i => i.name === footerIcon)?.svgCode : null;

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      // کلاس overflow-hidden حذف شد تا تولتیپ‌ها بدون مشکل نمایش داده شوند
      className="w-full bg-white/[0.015] backdrop-blur-3xl text-gray-300 py-6 pb-24 md:py-12 md:pb-12 px-3 md:px-8 mt-auto relative z-10 font-sans select-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/[0.05]"
    >
      <div className="absolute inset-0 bg-[#050810]/70 pointer-events-none -z-10 shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] overflow-hidden" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80 pointer-events-none z-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none -z-10 overflow-hidden"></div>

      {/* فاصله‌ها (gap) کاهش یافت تا بخش بالا به پایین نزدیک‌تر شود */}
      <div className="max-w-7xl mx-auto flex flex-col gap-3 md:gap-5 relative z-10">
        
        {/* ردیف اول: لوگو و عنوان (در DOM اول است پس سمت راست می‌افتد) و متن (سمت چپ) */}
        <div className="flex flex-row items-start justify-between gap-3 md:gap-6 w-full">
          
          {/* لوگو و عنوان - با چیدمان راست‌به‌چپ (لوگو سپس عنوان) */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group cursor-pointer pl-1 md:pl-4">
            {isFooterIconUrl ? (
              <img src={footerIcon} alt="لوگوی فوتر" className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" />
            ) : footerIconSvg ? (
              <div className="w-7 h-7 md:w-10 md:h-10 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" dangerouslySetInnerHTML={{ __html: footerIconSvg }} />
            ) : footerIcon ? (
              <Icon name={footerIcon} className="w-7 h-7 md:w-10 md:h-10 text-[#06b6d4] group-hover:scale-105 transition-transform duration-300" />
            ) : null}

            {footerText && (
              <span className="text-white font-black text-sm md:text-xl tracking-wider group-hover:text-cyan-400 transition-colors">{footerText}</span>
            )}
          </Link>

          {/* متن توضیحات */}
          <div className="flex-1 mt-1 md:mt-2">
            <p className="text-[9px] md:text-sm text-gray-400 font-light leading-[2] md:leading-relaxed text-justify w-full" style={{ textAlignLast: 'right' }}>
              {footerDesc}
            </p>
          </div>
        </div>

        {/* خط جداکننده افقی ممتد حذف شد */}

        {/* ردیف دوم: گرید 3 ستونه برای لینک‌ها و شبکه‌های اجتماعی */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 w-full">
          
          {/* ستون‌های دسترسی سریع و همراهان */}
          {[
            { title: 'دسترسی سریع', links: fastLinks, color: '#06b6d4' },
            { title: 'همراهان', links: companionLinks, color: '#a855f7' }
          ].map((section, idx) => (
            <div key={idx} className="col-span-1 space-y-2.5 md:space-y-4">
              <div className="flex items-center justify-start gap-1.5 md:gap-2 pb-2 md:pb-3 border-b border-white/5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-lg shrink-0" style={{ backgroundColor: section.color, boxShadow: `0 0 8px ${section.color}` }}></span>
                <h3 className="text-white font-bold text-[10px] md:text-sm whitespace-nowrap">{section.title}</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {section.links.length > 0 ? (
                  section.links.map((link) => (
                    <motion.li 
                      key={link.id} 
                      whileHover={{ x: -3 }}
                      className="flex items-center gap-1.5 md:gap-2 group/link relative w-fit"
                    >
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-transform duration-300 group-hover/link:scale-150 shrink-0" style={{ backgroundColor: section.color }}></span>
                      <Link 
                        href={link.url || '#'} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors font-medium text-[9px] md:text-sm whitespace-nowrap"
                      >
                        {link.title}
                      </Link>

                      {link.tooltip && (
                        <div className="absolute bottom-full mb-2 right-0 hidden group-hover/link:flex flex-col items-end z-[99999] animate-[fadeIn_0.2s_ease-out]">
                          <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[9px] md:text-[11px] py-1 px-2 md:py-1.5 md:px-3 rounded-md md:rounded-lg shadow-2xl whitespace-nowrap font-sans font-bold">
                            {link.tooltip}
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))
                ) : (
                  <li className="text-gray-500 text-[9px] md:text-xs">بدون لینک</li>
                )}
              </ul>
            </div>
          ))}

          {/* ستون شبکه‌های اجتماعی و مجوزها */}
          <div className="col-span-1 space-y-2.5 md:space-y-4">
            <div className="flex items-center justify-start gap-1.5 md:gap-2 pb-2 md:pb-3 border-b border-white/5">
              <h3 className="text-white font-bold text-[10px] md:text-sm whitespace-nowrap">شبکه‌های اجتماعی</h3>
            </div>
            
            {/* آیکون‌های شبکه‌های اجتماعی با قابلیت شکستن خط (Wrap) */}
            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2">
              {socialLinks.map((social) => (
                <SocialIconItem key={social.id} social={social} allIcons={allIcons} />
              ))}
            </div>

            {/* مجوزها از چپ به راست قرار می‌گیرند (افزایش ۳۰ درصدی سایز در h-9 و h-16) */}
            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-3 pt-1 md:pt-2 dir-ltr">
              {[{data: enamad, name: 'اینماد'}, {data: samandehi, name: 'ساماندهی'}, {data: satra, name: 'ساترا'}].map((badge, idx) => (
                <div key={idx} className="transition-opacity hover:opacity-80">
                  {badge.data.type === 'code' && badge.data.code && (
                    <div className="scale-90 md:scale-110 origin-left" dangerouslySetInnerHTML={{ __html: badge.data.code }} />
                  )}
                  {badge.data.type === 'image' && badge.data.img && (
                    <Link href={badge.data.url || '#'} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={badge.data.img} alt={badge.name} className="h-9 md:h-16 w-auto object-contain rounded-md" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 md:mt-12 pt-4 md:pt-6 border-t border-white/5 text-center text-[8px] md:text-xs text-gray-500 font-light relative z-10">
        {copyrightText}
      </div>
    </motion.footer>
  );
}