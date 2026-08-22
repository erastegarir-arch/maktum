'use client';

import { motion } from 'framer-motion';
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
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'همکاری با ما' }
          ]} 
        />

        {/* بخش ۱: هدر اصلی */}
        {hero.enabled !== false && (
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl p-8 md:p-12 text-center shadow-2xl overflow-hidden group"
          >
            {/* لایه پس‌زمینه شیشه‌ای کاملاً ثابت (بدون تغییر در هوور جهت متوقف کردن پرش) */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

            {/* نوار رنگی گرادینت بالای هدر */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80" />
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* آیکون هدر با انیمیشن بزرگ‌نمایی ساده و بدون چرخش (مشابه درباره ما) */}
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-[#06b6d4]/40 transition-colors duration-300">
                <Icon name={HERO_ICON} className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-4 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                {hero.badge} {hero.highlight}
              </h1>
              
              <div className="rich-text text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light text-justify md:text-center space-y-4">
                {hero.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
              </div>
            </div>
          </motion.section>
        )}

        {/* بخش ۲: گزینه‌های همکاری */}
        {options.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="relative rounded-3xl p-8 flex flex-col items-center text-center group cursor-pointer overflow-hidden"
                >
                  {/* ۱. لایه پس‌زمینه شیشه‌ای ثابت (جلوگیری ۱۰۰٪ از پرش رندر مرورگر) */}
                  <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

                  {/* ۲. هاله نور هوور بیرونی/داخلی مجزا با تغییر Opacity بدون درگیر کردن فیلتر بلور */}
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{
                      boxShadow: `inset 0 0 25px ${cardColor}1a, 0 10px 30px -10px ${cardColor}25`
                    }}
                  />

                  {/* ۳. خط نوری بالای کارت (Top Gradient Highlight) */}
                  <div 
                    className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100"
                    style={{ 
                      background: `linear-gradient(90deg, transparent 0%, ${cardColor} 50%, transparent 100%)` 
                    }}
                  />
                  
                  <div 
                    className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20"
                    style={{ color: cardColor }}
                  >
                    <Icon name={currentIcon} className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{option.title}</h3>
                  
                  <div className="rich-text text-sm text-gray-400 leading-relaxed font-light flex-grow w-full text-justify md:text-center">
                    <p>{option.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}

        {/* بخش ۳: پیشنهاد آزاد */}
        {proposal.enabled !== false && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="relative rounded-3xl p-8 md:p-16 flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden">
              
              {/* پس‌زمینه شیشه‌ای ثابت */}
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

              {/* هاله هوور مجزا */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100 -z-10"
                style={{
                  boxShadow: `inset 0 0 35px ${proposal.color || '#fbbf24'}1a, 0 10px 40px -10px ${proposal.color || '#fbbf24'}25`
                }}
              />

              {/* خط نوری بالایی */}
              <div 
                className="absolute top-0 inset-x-12 h-[2px] transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                style={{ 
                  background: `linear-gradient(90deg, transparent 0%, ${proposal.color || '#fbbf24'} 50%, transparent 100%)` 
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
                <div 
                  className="w-20 h-20 flex-shrink-0 rounded-2xl bg-white/5 border flex items-center justify-center shadow-lg mb-6 transition-all duration-300 group-hover:bg-white/10"
                  style={{ 
                    color: proposal.color || '#fbbf24',
                    borderColor: `${proposal.color || '#fbbf24'}40` 
                  }}
                >
                  <Icon name={PROPOSAL_ICON} className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                </div>
                
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-6">
                  {proposal.title}
                </h3>
                
                <div className="rich-text text-sm md:text-base text-gray-300 leading-relaxed font-light text-justify md:text-center w-full">
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