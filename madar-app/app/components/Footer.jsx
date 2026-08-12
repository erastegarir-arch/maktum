'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

// تابع کمکی برای مدیریت تمیز کلاس‌های Tailwind
const cn = (...inputs) => twMerge(clsx(inputs));

function SocialIconItem({ social, allIcons }) {
  const iconSvg = allIcons.find(i => i.name === social.iconName)?.svgCode;

  return (
    <div className="relative group/tooltip">
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link
          href={social.url || '#'}
          className="block p-1 text-gray-400 transition-colors duration-300 hover:text-[var(--hover-color)]"
          style={{ '--hover-color': social.hoverColor || '#10b981' }}
        >
          {iconSvg ? (
            <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: iconSvg }} />
          ) : (
            <Icon name="link" className="w-6 h-6" />
          )}
        </Link>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {social.tooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-30 pointer-events-none"
          >
            {social.tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0f19]"></div>
          </motion.div>
        )}
      </AnimatePresence>
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

  const footerIconSvg = allIcons.find(i => i.name === footerIcon)?.svgCode;

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full bg-[#080c16] border-t border-white/10 text-gray-300 py-12 px-4 md:px-8 mt-auto relative z-10 overflow-hidden font-sans"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        
        {/* لوگو و توضیحات */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center gap-3 w-fit">
            {footerIconSvg && (
              <div className="w-10 h-10 text-[#06b6d4] [&>svg]:w-full [&>svg]:h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" dangerouslySetInnerHTML={{ __html: footerIconSvg }} />
            )}
            {footerText && (
              <span className="text-white font-black text-xl tracking-wider">{footerText}</span>
            )}
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">{footerDesc}</p>
        </div>

        {/* لیست‌ها (دسترسی سریع و همراهان) */}
        {[
          { title: 'دسترسی سریع', links: fastLinks, color: '#06b6d4' },
          { title: 'همراهان', links: companionLinks, color: '#a855f7' }
        ].map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color, boxShadow: `0 0 10px ${section.color}` }}></span>
              <h3 className="text-white font-bold text-base">{section.title}</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {section.links.length > 0 ? (
                section.links.map((link) => (
                  <motion.li 
                    key={link.id} 
                    whileHover={{ x: -5 }}
                    className="flex items-center gap-2 group relative"
                  >
                    <span className="w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: section.color }}></span>
                    <Link href={link.url || '#'} className="hover:text-white transition-colors">
                      {link.title}
                    </Link>
                  </motion.li>
                ))
              ) : (
                <li className="text-gray-500 text-xs">موردی ثبت نشده است</li>
              )}
            </ul>
          </div>
        ))}

        {/* شبکه‌های اجتماعی و نمادها */}
        <div className="space-y-6 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-4">
            {socialLinks.map((social) => (
              <SocialIconItem key={social.id} social={social} allIcons={allIcons} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {[{data: enamad, name: 'اینماد'}, {data: samandehi, name: 'ساماندهی'}, {data: satra, name: 'ساترا'}].map((badge, idx) => (
              <div key={idx}>
                {badge.data.type === 'code' && badge.data.code && (
                  <div dangerouslySetInnerHTML={{ __html: badge.data.code }} />
                )}
                {badge.data.type === 'image' && badge.data.img && (
                  <Link href={badge.data.url || '#'} target="_blank" className="hover:opacity-80 transition-opacity">
                    <img src={badge.data.img} alt={badge.name} className="h-14 w-auto object-contain" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 text-center text-xs text-gray-500 relative z-10">
        {copyrightText}
      </div>
    </motion.footer>
  );
}