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
        whileHover={{ scale: 1.2, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={social.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          // رنگ پیش‌فرض شیشه‌ای (سفید شفاف) و در حالت هاور همرنگ شبکه با درخشش
          className="p-2 text-white/40 hover:text-[var(--hover-color)] hover:opacity-90 drop-shadow-none hover:drop-shadow-[0_0_12px_currentColor] flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{ '--hover-color': social.hoverColor || '#06b6d4' }}
        >
          {isUrl ? (
            <div 
              className="w-6 h-6 transition-all duration-300"
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
            <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: iconSvg }} />
          ) : (
            <Icon name="link" className="w-6 h-6" />
          )}
        </Link>
      </motion.div>

      {social.tooltip && (
        <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-sans font-bold">
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
      className="w-full bg-white/[0.01] backdrop-blur-3xl text-gray-300 py-12 px-4 md:px-8 mt-auto relative z-10 overflow-hidden font-sans select-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-transparent"
    >
      <div className="absolute inset-0 bg-[#050810]/50 pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.01)]" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 pointer-events-none z-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* لوگو و توضیحات */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center gap-3 w-fit group cursor-pointer">
            {isFooterIconUrl ? (
              <img src={footerIcon} alt="لوگوی فوتر" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" />
            ) : footerIconSvg ? (
              <div className="w-10 h-10 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-300" dangerouslySetInnerHTML={{ __html: footerIconSvg }} />
            ) : footerIcon ? (
              <Icon name={footerIcon} className="w-10 h-10 text-[#06b6d4] group-hover:scale-105 transition-transform duration-300" />
            ) : null}

            {footerText && (
              <span className="text-white font-black text-xl tracking-wider group-hover:text-cyan-400 transition-colors">{footerText}</span>
            )}
          </Link>
          <p className="text-sm text-gray-400 font-light leading-relaxed mt-2 text-justify">{footerDesc}</p>
        </div>

        {/* لیست‌ها (دسترسی سریع و همراهان) */}
        {[
          { title: 'دسترسی سریع', links: fastLinks, color: '#06b6d4' },
          { title: 'همراهان', links: companionLinks, color: '#a855f7' }
        ].map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-3">
              <span className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: section.color, boxShadow: `0 0 10px ${section.color}` }}></span>
              <h3 className="text-white font-bold text-sm md:text-base">{section.title}</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {section.links.length > 0 ? (
                section.links.map((link) => (
                  <motion.li 
                    key={link.id} 
                    whileHover={{ x: -5 }}
                    className="flex items-center gap-2 group/link relative w-fit"
                  >
                    <span className="w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover/link:scale-150" style={{ backgroundColor: section.color }}></span>
                    <Link 
                      href={link.url || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors font-medium text-xs md:text-sm"
                    >
                      {link.title}
                    </Link>

                    {link.tooltip && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/link:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-sans font-bold">
                          {link.tooltip}
                        </div>
                      </div>
                    )}
                  </motion.li>
                ))
              ) : (
                <li className="text-gray-500 text-xs">موردی ثبت نشده است</li>
              )}
            </ul>
          </div>
        ))}

        {/* شبکه‌های اجتماعی و نمادها */}
        <div className="space-y-6 flex flex-col justify-end pt-4 md:pt-0 border-t border-white/5 md:border-none">
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((social) => (
              <SocialIconItem key={social.id} social={social} allIcons={allIcons} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {[{data: enamad, name: 'اینماد'}, {data: samandehi, name: 'ساماندهی'}, {data: satra, name: 'ساترا'}].map((badge, idx) => (
              <div key={idx} className="transition-opacity hover:opacity-80">
                {badge.data.type === 'code' && badge.data.code && (
                  <div dangerouslySetInnerHTML={{ __html: badge.data.code }} />
                )}
                {badge.data.type === 'image' && badge.data.img && (
                  <Link href={badge.data.url || '#'} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={badge.data.img} alt={badge.name} className="h-12 w-auto object-contain" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 text-center text-[10px] md:text-xs text-gray-500 font-light relative z-10">
        {copyrightText}
      </div>
    </motion.footer>
  );
}