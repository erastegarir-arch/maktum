// مسیر فایل: app/components/frontend/RulesContent.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Icon from '../Icon';

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function RulesContent({ hero = {}, rules = [] }) {
  const sidebarWrapperRef = useRef(null);
  const tocBoxRef = useRef(null);

  // استیت‌های مربوط به فیکس شدن باکس زیر هدر (الگوبرداری شده از صفحه داخلی محتوا)
  const [stickyState, setStickyState] = useState('normal'); // 'normal' | 'fixed' | 'bottom'
  const [fixedStyle, setFixedStyle] = useState({});
  const [activeRuleId, setActiveRuleId] = useState('');

  const activeRules = Array.isArray(rules) ? rules.filter(r => r?.enabled !== false) : [];

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 105;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // منطق اسکرول و فیکس شدن دقیق زیر هدر دسکتاپ + تشخیص بخش فعال
  useEffect(() => {
    const TOP_OFFSET = 92; // فاصله دقیق زیر هدر شناور دسکتاپ

    const handleScrollAndResize = () => {
      const wrapper = sidebarWrapperRef.current;
      const box = tocBoxRef.current;
      if (!wrapper || !box) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const boxHeight = box.offsetHeight;

      if (wrapperRect.top <= TOP_OFFSET) {
        // اگر کاربر تا انتهای بخش قوانین (نزدیک فوتر) اسکرول کرد، باکس در ته ستون متوقف شود
        if (wrapperRect.bottom <= TOP_OFFSET + boxHeight) {
          setStickyState('bottom');
        } else {
          // فیکس شدن دقیق زیر هدر با حفظ عرض و موقعیت افقی ستون
          setStickyState('fixed');
          setFixedStyle({
            position: 'fixed',
            top: `${TOP_OFFSET}px`,
            left: `${wrapperRect.left}px`,
            width: `${wrapperRect.width}px`,
            zIndex: 30,
          });
        }
      } else {
        setStickyState('normal');
      }
    };

    // تشخیص ماده فعال در حین اسکرول (Scrollspy مشابه صفحه داخلی محتوا)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveRuleId(entry.target.id);
          }
        });
      },
      { rootMargin: '-110px 0px -60% 0px' }
    );

    activeRules.forEach((r) => {
      const el = document.getElementById(r.id);
      if (el) observer.observe(el);
    });

    handleScrollAndResize();
    window.addEventListener('scroll', handleScrollAndResize, { passive: true });
    window.addEventListener('resize', handleScrollAndResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [activeRules.length]);

  const getRuleHtml = (rule) => {
    if (rule?.content && typeof rule.content === 'string' && rule.content.trim() !== '') {
      return rule.content;
    }
    
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
    <>
      {/* تزریق استایل قطعی برای جلوگیری از انتخاب متن در تمامی لایه‌ها و متن‌های دیتابیس */}
      <style dangerouslySetInnerHTML={{ __html: `
        .strict-no-select, .strict-no-select * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `}} />

      <main className="strict-no-select flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0">
        
        {/* هدر اصلی قوانین و مقررات */}
        {hero?.enabled !== false && (
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl p-6 md:p-10 text-center overflow-hidden border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80" />
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              
              <div className="group/icon cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-[#0b0f19] border border-white/5 hover:border-[#06b6d4]/40 flex items-center justify-center text-[#06b6d4] mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(6,182,212,0.1),0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.25),0_0_30px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 transition-all duration-300">
                <Icon 
                  name="law" 
                  className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover/icon:scale-110" 
                />
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                {hero?.title || 'قوانین و مقررات پلتفرم مدار'}
              </h1>
              
              <div className="rich-text text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify md:text-center w-full px-1 md:px-0 space-y-3 md:space-y-4">
                {Array.isArray(hero?.paragraphs) && hero.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

            </div>

            {hero?.showUpdateDate !== false && hero?.updateDate && (
              <div className="mt-5 md:mt-8 relative z-20 flex justify-center w-full">
                <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-xl" dir="rtl">
                  <Icon name="calendar" className="w-3.5 h-3.5 text-[#06b6d4]" />
                  <span className="text-[10px] md:text-[11px] text-gray-400 font-light">آخرین به‌‌روزرسانی:</span>
                  <span className="text-[11px] md:text-xs text-white font-bold tracking-widest dir-ltr">{hero.updateDate}</span>
                </div>
              </div>
            )}

          </motion.section>
        )}
        
        {/* کانتینر دو ستونه (نگهدارنده ریل سایدبار و لیست قوانین) */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch relative w-full">
          
          {/* ستون لنگر (Anchor) سایدبار که جایگاه و عرض ستون را در صفحه حفظ می‌کند */}
          <div id="toc-anchor" ref={sidebarWrapperRef} className="hidden lg:block lg:w-3/12 shrink-0 relative">
            
            <aside
              ref={tocBoxRef}
              style={stickyState === 'fixed' ? fixedStyle : undefined}
              className={cn(
                "w-full z-30",
                stickyState === 'normal' && "relative top-0",
                stickyState === 'bottom' && "absolute bottom-0 left-0 right-0"
              )}
            >
              <div className="relative rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl flex flex-col max-h-[calc(100vh-120px)]">
                <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-70 pointer-events-none" />

                <h2 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-4 text-sm relative z-10 shrink-0">
                  <Icon name="list" className="text-[#06b6d4] w-5 h-5" /> فهرست مندرجات
                </h2>
                
                <ul className="space-y-3 text-sm relative z-10 pb-2 overflow-y-auto custom-scrollbar pl-1">
                  {activeRules.map((rule) => {
                    const isActive = activeRuleId === String(rule.id);
                    return (
                      <li key={`toc-${rule.id}`}>
                        <a 
                          href={`#${rule.id}`} 
                          onClick={(e) => scrollToSection(e, rule.id)}
                          className={cn(
                            "transition-colors flex items-center gap-2 py-1 cursor-pointer group/link",
                            isActive ? "text-[#06b6d4] font-bold" : "text-gray-400 hover:text-[#06b6d4]"
                          )}
                        >
                          <Icon 
                            name="arrowLeft" 
                            className={cn(
                              "w-3 h-3 text-[#06b6d4] transition-transform shrink-0",
                              isActive ? "-translate-x-1" : "group-hover/link:-translate-x-1"
                            )} 
                          /> 
                          <span className="truncate">{rule.number} {rule.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>

          {/* محتوای بندهای قوانین */}
          <div className="w-full lg:w-9/12 space-y-4 md:space-y-6 relative z-10">
            {activeRules.map((rule, idx) => (
              <motion.section 
                key={rule.id} 
                id={rule.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="relative rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden group border border-transparent scroll-mt-28 md:scroll-mt-32"
              >
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05]" />

                <div 
                  className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                  style={{
                    boxShadow: 'inset 0 0 25px rgba(6, 182, 212, 0.1), 0 10px 30px -10px rgba(6, 182, 212, 0.15)'
                  }}
                />

                <div 
                  className="absolute top-0 inset-x-6 md:inset-x-8 h-[2px] transition-opacity duration-300 opacity-60 group-hover:opacity-100"
                  style={{ 
                    background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)' 
                  }}
                />

                <h3 className="text-white text-lg md:text-xl font-bold border-b border-white/5 pb-3 md:pb-4 mb-4 md:mb-6 flex items-center gap-2 relative z-10 leading-tight">
                  <span className="text-[#06b6d4] font-sans shrink-0">{rule.number}</span> 
                  <span>{rule.title}</span>
                </h3>
                
                <div 
                  className="rich-text text-sm md:text-base leading-relaxed md:leading-loose text-gray-300 font-light text-justify relative z-10"
                  dangerouslySetInnerHTML={{ __html: getRuleHtml(rule) }} 
                />
              </motion.section>
            ))}
          </div>
        </div>
        
      </main>
    </>
  );
}