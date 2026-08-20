'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '../Icon';

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function RulesContent({ hero = {}, rules = [] }) {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // تابع کمکی برای استخراج امن محتوای HTML از ساختار جدید ادیتور یا ساختار قدیمی
  const getRuleHtml = (rule) => {
    if (rule?.content && typeof rule.content === 'string' && rule.content.trim() !== '') {
      return rule.content;
    }
    
    // فال‌بک برای پشتیبانی از دیتای قدیمی
    let fallbackHtml = '';
    if (Array.isArray(rule?.paragraphs) && rule.paragraphs.length > 0) {
      fallbackHtml += rule.paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    if (Array.isArray(rule?.list) && rule.list.length > 0) {
      fallbackHtml += '<ul>' + rule.list.map(item => `<li>${item}</li>`).join('') + '</ul>';
    }
    return fallbackHtml || '<p>محتوایی برای این ماده ثبت نشده است.</p>';
  };

  return (
    <div className="space-y-12">
      {/* هدر اصلی */}
      {hero?.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl border border-white/10 p-8 md:p-12 text-center shadow-2xl overflow-hidden group"
        >
          {/* ۱. لایه پس‌زمینه شیشه‌ای ثابت */}
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

          {/* ۲. نوار نوری گرادینت بالای هدر */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90" />
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* آیکون هدر */}
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-[#06b6d4]/40 transition-colors duration-300">
              <Icon name="law" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-4 pt-4 pb-2 leading-relaxed text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
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
        {/* فهرست مندرجات (سایدبار) */}
        <motion.aside 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-3 sticky top-32 rounded-2xl border border-white/10 p-6 hidden lg:block shadow-xl overflow-hidden group"
        >
          {/* پس‌زمینه شیشه‌ای ایزوله */}
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />

          {/* نوار نوری گرادینت بالای فهرست */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-70" />

          <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-sm relative z-10">
            <Icon name="listBullets" className="text-[#06b6d4] w-5 h-5" /> فهرست مندرجات
          </h2>
          <ul className="space-y-3 text-sm relative z-10">
            {Array.isArray(rules) && rules.filter(r => r?.enabled !== false).map((rule) => (
              <li key={`toc-${rule.id}`}>
                <a 
                  href={`#${rule.id}`} 
                  onClick={(e) => scrollToSection(e, rule.id)}
                  className="text-gray-400 hover:text-[#06b6d4] transition-colors flex items-center gap-2 py-1 cursor-pointer group/link"
                >
                  <Icon name="arrowLeft" className="w-3 h-3 text-[#06b6d4] transition-transform group-hover/link:-translate-x-1 shrink-0" /> 
                  <span className="truncate">{rule.number} {rule.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </motion.aside>

        {/* محتوای بندهای قوانین */}
        <div className="lg:col-span-9 space-y-6">
          {Array.isArray(rules) && rules.filter(r => r?.enabled !== false).map((rule, idx) => (
            <motion.section 
              key={rule.id} 
              id={rule.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="relative rounded-3xl border border-white/10 p-6 md:p-8 shadow-lg overflow-hidden group"
            >
              {/* ۱. پس‌زمینه شیشه‌ای ثابت */}
              <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />

              {/* ۲. هاله هوور مجزا */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                style={{
                  boxShadow: 'inset 0 0 25px rgba(6, 182, 212, 0.1), 0 10px 30px -10px rgba(6, 182, 212, 0.15)'
                }}
              />

              {/* ۳. نوار نوری گرادینت بالای کارت */}
              <div 
                className="absolute top-0 inset-x-8 h-[2px] transition-opacity duration-300 opacity-60 group-hover:opacity-100"
                style={{ 
                  background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)' 
                }}
              />

              <h3 className="text-white text-xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-2 relative z-10">
                <span className="text-[#06b6d4] font-sans">{rule.number}</span> {rule.title}
              </h3>
              
              {/* رندر بی‌نقص HTML ادیتور با فراخوانی کلاس‌های گلوبال */}
              <div 
                className="rich-text relative z-10"
                dangerouslySetInnerHTML={{ __html: getRuleHtml(rule) }} 
              />
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}