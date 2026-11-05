'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from '../Breadcrumbs';
import Icon from '../Icon';

const cn = (...inputs) => twMerge(clsx(inputs));

const HERO_ICON = "rocket";
const PROPOSAL_ICON = "lightbulb";
const CARD_ICONS = ["footage", "product", "networking", "group", "portfolio", "code"];

export default function CollaborationContent({ pageData }) {
  const hero = pageData.hero || {};
  const options = pageData.collaborationOptions || [];
  const proposal = pageData.proposal || {};

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 
        حذف پدینگ بالا (pt) طبق استاندارد. 
        فاصله المان‌ها در موبایل (space-y-6) نصف دسکتاپ (space-y-12) شد. 
      */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مکتوم', href: '/' },
            { label: 'همکاری با ما' }
          ]} 
        />

        {/* بخش ۱: هدر اصلی */}
        {/* هدر اصلی صفحه همکاری با ما (کاملاً یکپارچه و هماهنگ با قوانین و درباره ما) */}
        {hero.enabled !== false && (
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            // اصلاح گلس‌مورفیسم برای عبور نور (حذف رنگ تیره)
            className="relative rounded-3xl p-6 md:p-10 text-center overflow-hidden border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80" />
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              
              {/* آیکون هدر: گوشه‌گرد با پس‌زمینه تیره، هاله نورانی فیروزه‌ای و هاور بدون چرخش */}
              <div className="group/icon cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-[#0b0f19] border border-white/5 hover:border-[#06b6d4]/40 flex items-center justify-center text-[#06b6d4] mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(6,182,212,0.1),0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.25),0_0_30px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 transition-all duration-300">
                <Icon 
                  name={HERO_ICON} 
                  className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover/icon:scale-110" 
                />
              </div>
              
              {/* عنوان هدر با گرادینت یکپارچه */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                {hero.badge} {hero.highlight}
              </h1>
              
              {/* متن توضیحات هدر (جاستیفای و وسط‌چین) */}
              <div className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify [text-align-last:center] w-full px-1 md:px-0 space-y-3 md:space-y-4">
                {hero.paragraphs?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

            </div>
          </motion.section>
        )}

        {/* بخش ۲: گزینه‌های همکاری */}
        {options.length > 0 && (
          <section className="mt-6 md:mt-12">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {options.map((option, index) => {
                if (option.enabled === false) return null;
                const currentIcon = CARD_ICONS[index] || "database";
                const cardColor = option.color || '#06b6d4';

                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    // اعمال قانون جدید: استفاده از flex-col به جای flex-col-reverse برای قرار گرفتن آیکون در بالا
                    className="relative rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center text-center group cursor-pointer overflow-hidden border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                  >
                    {/* اصلاح گلس‌مورفیسم پس‌زمینه کارت (حذف تیرگی مسدودکننده نور) */}
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05]" />

                    <div 
                      className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                      style={{
                        boxShadow: `inset 0 0 25px ${cardColor}1a, 0 10px 30px -10px ${cardColor}25`
                      }}
                    />

                    <div 
                      className="absolute top-0 inset-x-4 md:inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100"
                      style={{ 
                        background: `linear-gradient(90deg, transparent 0%, ${cardColor} 50%, transparent 100%)` 
                      }}
                    />
                    
                    {/* آیکون کارت - طبق استاندارد همیشه در بالای متن قرار می‌گیرد */}
                    <div 
                      className="w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-6 transition-all duration-300 group-hover:scale-110 shadow-inner"
                      style={{ backgroundColor: `${cardColor}1a`, color: cardColor, boxShadow: `0 0 10px ${cardColor}33` }}
                    >
                      <Icon name={currentIcon} className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    
                    <div className="flex flex-col items-center flex-grow w-full">
                      <h3 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-3 transition-colors group-hover:text-[var(--hover-color)] leading-tight" style={{ '--hover-color': cardColor }}>
                        {option.title}
                      </h3>
                      
                      {/* متن توضیحات کارت (جاستیفای و وسط‌چین) */}
                      <div className="text-[10px] md:text-sm text-gray-400 leading-relaxed md:leading-loose font-light w-full text-justify [text-align-last:center]">
                        <p>{option.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* بخش ۳: پیشنهاد آزاد */}
        {proposal.enabled !== false && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="w-full mt-6 md:mt-12"
          >
            <div className="relative rounded-3xl p-6 md:p-16 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden border border-transparent shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              
              {/* اصلاح گلس‌مورفیسم باکس نهایی */}
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05]" />

              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100 -z-10"
                style={{
                  boxShadow: `inset 0 0 35px ${proposal.color || '#fbbf24'}1a, 0 10px 40px -10px ${proposal.color || '#fbbf24'}25`
                }}
              />

              <div 
                className="absolute top-0 inset-x-8 md:inset-x-12 h-[2px] transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                style={{ 
                  background: `linear-gradient(90deg, transparent 0%, ${proposal.color || '#fbbf24'} 50%, transparent 100%)` 
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
               {/* آیکون بخش پیشنهاد آزاد (بزرگ‌شدن کل کادر درجا بدون چرخش) */}
                <div 
                  className="w-12 h-12 md:w-20 md:h-20 flex-shrink-0 rounded-2xl border flex items-center justify-center shadow-inner mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    color: proposal.color || '#fbbf24',
                    borderColor: `${proposal.color || '#fbbf24'}40`,
                    backgroundColor: `${proposal.color || '#fbbf24'}1a`,
                    boxShadow: `0 0 15px ${proposal.color || '#fbbf24'}33`
                  }}
                >
                  <Icon name={PROPOSAL_ICON} className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                
                <h3 className="text-lg md:text-4xl font-bold text-white mb-3 md:mb-6 leading-tight">
                  {proposal.title}
                </h3>
                
                {/* متن توضیحات باکس آخر (جاستیفای و وسط‌چین) */}
                <div className="text-xs md:text-base text-gray-300 leading-relaxed md:leading-loose font-light text-justify [text-align-last:center] w-full px-1">
                  {proposal.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
                </div>
              </div>
            </div>
          </motion.section>
        )}

      </main>
    </div>
  );
}