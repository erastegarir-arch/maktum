'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function RulesContent({ hero = {}, rules = [] }) {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12">
      {/* هدر */}
      {hero?.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card transform-gpu relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] rounded-3xl shadow-2xl"
        >
          <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Icon name="law" className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-4 pt-4 pb-2 leading-relaxed overflow-visible text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
              {hero?.title || 'قوانین و مقررات مدار'}
            </h1>
            
            <div className="text-gray-300 text-sm md:text-base leading-loose font-light text-center space-y-4">
              {Array.isArray(hero?.paragraphs) && hero.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          {hero?.showUpdateDate !== false && hero?.updateDate && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm z-20">
              <Icon name="calendar" className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-[11px] text-gray-400 font-light">آخرین به‌روزرسانی:</span>
              <span className="text-xs text-white font-bold tracking-widest dir-ltr">{hero.updateDate}</span>
            </div>
          )}
        </motion.section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* فهرست مندرجات (مجهز به انیمیشن ورود نرم) */}
        <motion.aside 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3 sticky top-32 glass-card p-6 hidden lg:block shadow-xl rounded-2xl"
        >
          <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-sm">
            <Icon name="listBullets" className="text-[#06b6d4] w-5 h-5" /> فهرست مندرجات
          </h2>
          <ul className="space-y-3 text-sm">
            {Array.isArray(rules) && rules.filter(r => r?.enabled !== false).map((rule) => (
              <li key={`toc-${rule.id}`}>
                <a 
                  href={`#${rule.id}`} 
                  onClick={(e) => scrollToSection(e, rule.id)}
                  className="text-gray-400 hover:text-[#06b6d4] transition-colors flex items-center gap-2 py-1 cursor-pointer"
                >
                  <Icon name="arrowLeft" className="w-3 h-3 text-[#06b6d4]" /> 
                  <span>{rule.number} {rule.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </motion.aside>

        {/* محتوای قوانین */}
        <div className="lg:col-span-9 space-y-6">
          {Array.isArray(rules) && rules.filter(r => r?.enabled !== false).map((rule) => (
            <motion.section 
              key={rule.id} 
              id={rule.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-6 md:p-8 border-t-2 border-t-transparent hover:border-t-[#06b6d4]/40 transition-all duration-300 rounded-3xl"
            >
              <h3 className="text-white text-xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                <span className="text-[#06b6d4] font-sans">{rule.number}</span> {rule.title}
              </h3>
              <div 
                className={cn(
                  "rich-text-content text-gray-300 leading-[2] font-light text-justify",
                  "[&>p]:mb-4 [&>ul]:list-disc [&>ul]:pr-6 [&>ul>li]:mb-2 [&>ol]:list-decimal [&>ol]:pr-6 [&>strong]:text-white"
                )}
                dangerouslySetInnerHTML={{ __html: rule.content || '' }} 
              />
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}