'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon';
import Tooltip from '@/app/components/Tooltip';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function AboutContent({ pageData = {} }) {
  const [isSocialPopupOpen, setIsSocialPopupOpen] = useState(false);

  const hero = pageData.hero || {};
  const waqf = pageData.waqf || {};
  const eco = pageData.ecosystem || {};
  const conn = pageData.connection || {};
  const feats = pageData.features || {};
  const contact = pageData.contact || {};
  
  const contactEmail = contact.email || {};
  const contactPhone = contact.phone || {};
  const contactAddress = contact.address?.value || '';
  const socialConn = contact.socialConnection || {};
  
  const socialSettings = pageData.socials || [];
  const validSocials = socialSettings.filter(s => s.url && s.iconUrl);

  const hasEmail = Boolean(contactEmail.value?.trim());
  const hasPhone = Boolean(contactPhone.value?.trim());
  const hasAddress = Boolean(contactAddress.trim());
  const hasSocialConn = Boolean(socialConn.triggerWord?.trim());

  return (
    // پدینگ بالا (pt) افزایش یافت تا فاصله بِرِدکرامب از هدر در هر دو حالت موبایل و دسکتاپ حفظ شود.
    // space-y حذف شد تا فاصله‌ها به صورت دستی روی هر section کنترل شود (برای نصف کردن فاصله).
    // اضافه شدن کلاس select-none به تگ main برای جلوگیری از انتخاب متن در تمام صفحه
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 pb-20 w-full relative z-10 pt-0 select-none">
      
      <div className="mb-6 md:mb-10">
        <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'درباره ما' }]} />
      </div>

      {/* ۱. معرفی */}
      {/* هدر اصلی صفحه درباره ما (گلس‌مورفیسم کاملاً شفاف) */}
      {hero?.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-6 md:p-10 text-center overflow-hidden border border-white/[0.05] bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.5)]"
        >
          {/* نوار نوری گرادینت بالای هدر */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-80" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* آیکون هدر: گلس‌مورفیسم ملایم به جای رنگ ثابت تیره */}
            <div className="group/icon cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-white/[0.03] backdrop-blur-md border border-white/[0.05] hover:border-[#06b6d4]/40 flex items-center justify-center text-[#06b6d4] mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(6,182,212,0.1),0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.25),0_0_30px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 transition-all duration-300">
              <Icon 
                name="solarsystem" 
                className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover/icon:scale-110" 
              />
            </div>
            
            {/* عنوان هدر با گرادینت فیروزه‌ای-بنفش */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 pt-1 pb-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
              {hero?.title}
            </h1>
            
            {/* متن توضیحات هدر (وسط‌چین، جاستیفای و کاملاً غیرقابل انتخاب) */}
            <div className="text-gray-300 text-xs md:text-sm lg:text-base leading-loose font-light text-justify [text-align-last:center] w-full px-1 md:px-0 space-y-3 md:space-y-4 select-none drop-shadow-md">
              {hero?.paragraphs?.map((p, idx) => (
                <p key={idx} className="select-none">{p}</p>
              ))}
            </div>

          </div>
        </motion.section>
      )}

      {/* ۲. عهد آسمانی */}
      {waqf.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl border border-amber-500/20 p-5 md:p-14 text-center group shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden mt-6 md:mt-12 bg-white/[0.02] backdrop-blur-2xl"
        >
          {/* حذف پس‌زمینه کدر و جایگزینی با هاله نوری درونی طلایی */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-70" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 md:mb-6 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Icon name="ya-fatemeh" className="w-16 h-16 md:w-24 md:h-24 stroke-[0.5] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-xl md:text-4xl font-black text-amber-50 mb-4 md:mb-6 tracking-wide drop-shadow-md">
              {waqf.titlePart1}{waqf.titlePart2}
            </h2>
            {/* متن عهد آسمانی (وسط‌چین و جاستیفای) */}
            <div className="max-w-3xl text-amber-100/80 text-xs md:text-base leading-loose font-light space-y-3 md:space-y-4 text-justify [text-align-last:center] drop-shadow-md">
                {waqf.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </div>
        </motion.section>
      )}

      {/* ۳. زیست‌بوم رسانه‌ای */}
      {eco.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          // برای استاندارد بودن چیدمان، در موبایل متن بالا و المان گرافیکی پایین قرار گرفت (flex-col-reverse)
          className="relative rounded-3xl p-5 md:p-12 overflow-hidden group flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent mt-6 md:mt-12"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-90" />

          {/* در موبایل متن‌ها وسط‌چین شدند */}
          <div className="relative z-10 lg:w-1/2 flex flex-col items-center md:items-start text-center md:text-right w-full">
            {eco.badge && (
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full text-[10px] md:text-xs font-bold text-[#a855f7] mb-4 shadow-inner">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#a855f7] animate-pulse"></span>
                {eco.badge}
              </div>
            )}
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 leading-tight">
              {eco.titlePart1} <br className="hidden md:block"/>
              <span className="text-[#a855f7]">{eco.titlePart2}</span>
            </h2>
            {/* متن زیست‌بوم (در موبایل وسط‌چین، در دسکتاپ راست‌چین و جاستیفای) */}
            <div className="space-y-3 md:space-y-4 text-gray-300 text-xs md:text-base leading-loose font-light text-justify [text-align-last:center] md:[text-align-last:right] w-full">
              {eco.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </div>

          <div className="relative z-10 lg:w-1/2 flex items-center justify-center w-full h-56 md:h-96">
            <div className="relative w-48 h-48 md:w-80 md:h-80 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent absolute"></div>
                <div className="h-full w-px bg-gradient-to-b from-transparent via-[#06b6d4]/50 to-transparent absolute"></div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent absolute rotate-45"></div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent absolute -rotate-45"></div>
              </div>
              
              <div className="relative z-20 w-16 h-16 md:w-24 md:h-24 bg-[#080c16] border border-[#a855f7] rounded-full flex items-center justify-center shadow-[inset_0_0_15px_rgba(168,85,247,0.2),0_0_30px_rgba(168,85,247,0.4)]">
                <Icon name="cube" className="w-6 h-6 md:w-10 md:h-10 text-[#a855f7]" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 md:-translate-y-4 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#080c16] border border-[#06b6d4] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] text-[#06b6d4]">
                  <Icon name="footage" className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 md:translate-y-4 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#080c16] border border-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)] text-[#f59e0b]">
                  <Icon name="portfolio" className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#080c16] border border-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] text-[#10b981]">
                  <Icon name="product" className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 animate-[float_4.5s_ease-in-out_infinite_0.5s]">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#080c16] border border-[#f43f5e] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.3)] text-[#f43f5e]">
                  <Icon name="networking" className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ۴. پر کردن خلأها */}
      {conn.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          // تغییر به flex-col-reverse برای قرار گرفتن متن در بالا
          className="relative rounded-3xl px-5 py-6 md:px-12 overflow-hidden group flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent mt-6 md:mt-12"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-90" />

          <div className="relative z-10 lg:w-2/3 flex flex-col items-center md:items-start text-center md:text-right w-full">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2 md:gap-3">
              <Icon name="target" className="w-6 h-6 md:w-7 md:h-7 text-[#f59e0b]" /> 
              {conn.title}
            </h2>
            {/* متن پر کردن خلأها (در موبایل وسط‌چین، در دسکتاپ راست‌چین و جاستیفای) */}
            <div className="space-y-3 text-gray-300 text-xs md:text-base leading-loose font-light text-justify [text-align-last:center] md:[text-align-last:right] w-full">
               {conn.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </div>

          <div className="relative z-10 lg:w-1/3 flex items-center justify-center w-full h-48 md:h-80">
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              
              <div className="absolute inset-4 md:inset-4 rounded-full border border-dashed border-emerald-500/40 animate-[spin_18s_linear_infinite]">
                <div className="absolute -bottom-1 md:-bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981]"></div>
              </div>

              <div className="absolute inset-8 md:inset-10 rounded-full border border-dotted border-white/40 animate-[spin_12s_linear_infinite_reverse]">
                <div className="absolute top-1/2 -right-1 md:-right-1.5 -translate-y-1/2 w-1.5 h-1.5 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_12px_#ffffff]"></div>
              </div>

              <div className="absolute inset-12 md:inset-16 rounded-full border border-dashed border-red-500/40 animate-[spin_8s_linear_infinite]">
                <div className="absolute -top-1 md:-top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-3 md:h-3 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]"></div>
              </div>

              <div className="relative z-20 flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer">
                <Icon name="allah" className="w-12 h-12 md:w-20 md:h-20 text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]" />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ۵. ارکان فعالیت (کارت‌ها) */}
      {feats.enabled !== false && (
        <section className="mt-6 md:mt-12 space-y-5 md:space-y-8">
          <div className="text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">{feats.title}</h2>
            <p className="text-[11px] md:text-sm text-gray-400 font-light">{feats.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {feats.items?.map((feature, idx) => {
              const cardIcons = ["footage", "portfolio", "pen-nib", "networking"];
              const currentIcon = cardIcons[idx] || "database";
              const cardColor = feature.color || '#06b6d4';
              
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center text-center group cursor-pointer overflow-hidden border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />

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

                  <div 
                    className="w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-6 transition-all duration-300 group-hover:scale-110 shadow-inner"
                    style={{ backgroundColor: `${cardColor}1a`, color: cardColor, boxShadow: `0 0 10px ${cardColor}33` }}
                  >
                    <Icon name={currentIcon} className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <h3 
                    className="text-sm md:text-lg font-bold text-white mb-2 md:mb-3 transition-colors group-hover:text-[var(--hover-color)] leading-tight" 
                    style={{ '--hover-color': cardColor }}
                  >
                    {feature.title}
                  </h3>
                  {/* متن کارت‌ها (وسط‌چین و جاستیفای) */}
                  <p className="text-[10px] md:text-sm text-gray-400 leading-relaxed md:leading-loose font-light text-justify [text-align-last:center]">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ۶. راه‌های ارتباطی و شبکه‌های اجتماعی */}
      {contact.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-5 md:p-12 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] group border border-transparent mt-6 md:mt-12"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />
          
          <div className="text-center mb-8 md:mb-10 relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center justify-center gap-2">
              <Icon name="chat" className="w-6 h-6 md:w-7 md:h-7 text-[#10b981]" />
              {contact.title}
            </h2>
            {/* متن ارتباط با ما (وسط‌چین و جاستیفای) */}
            <p className="text-xs md:text-base text-gray-300 font-light leading-loose max-w-3xl mx-auto text-justify [text-align-last:center] px-1">
              {contact.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-6 relative z-10 mt-6 md:mt-8 border-t border-white/10 pt-6 md:pt-8">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6">
              
              {hasEmail && (
                <Tooltip content={contactEmail.tooltip} position="top">
                  {/* اعمال گلس‌مورفیسم کامل */}
                  <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] px-5 md:px-8 py-4 md:py-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group/box w-full sm:w-auto justify-center sm:justify-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform shrink-0">
                      <Icon name="email" className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="w-full sm:w-auto text-center sm:text-right">
                      <p className="text-[10px] md:text-xs text-gray-400 mb-1">پست الکترونیک</p>
                      <a href={`mailto:${contactEmail.value}`} dir="ltr" className="text-sm md:text-base text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactEmail.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}

              {hasPhone && (
                <Tooltip content={contactPhone.tooltip} position="top">
                  {/* اعمال گلس‌مورفیسم کامل */}
                  <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] px-5 md:px-8 py-4 md:py-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group/box w-full sm:w-auto justify-center sm:justify-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform shrink-0">
                      <Icon name="phone" className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="w-full sm:w-auto text-center sm:text-right">
                      <p className="text-[10px] md:text-xs text-gray-400 mb-1">شماره تماس (پشتیبانی)</p>
                      <a href={`tel:${contactPhone.value?.replace(/\D/g,'')}`} dir="ltr" className="text-sm md:text-base text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactPhone.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}

              {hasSocialConn && (
                <Tooltip content={socialConn.triggerTooltip} position="top">
                  {/* اعمال گلس‌مورفیسم کامل */}
                  <div onClick={() => setIsSocialPopupOpen(true)} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] px-5 md:px-8 py-4 md:py-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group/box w-full sm:w-auto justify-center sm:justify-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform overflow-hidden p-2.5 md:p-3 shrink-0">
                      {socialConn.triggerIconUrl ? (
                        <div 
                          className="w-full h-full bg-current transition-colors"
                          style={{
                            maskImage: `url(${socialConn.triggerIconUrl})`,
                            WebkitMaskImage: `url(${socialConn.triggerIconUrl})`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                          }}
                        />
                      ) : (
                        <Icon name="hash" className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </div>
                    <div className="w-full sm:w-auto text-center sm:text-right">
                      <p className="text-[10px] md:text-xs text-gray-400 mb-1">ارتباط مجازی</p>
                      <span className="text-sm md:text-base text-white font-sans font-bold group-hover/box:text-[#10b981] transition-colors block">
                        {socialConn.triggerWord || 'راه‌های ارتباطی'}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              )}

            </div>

            {hasAddress && (
              <div className="w-full max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] px-5 md:px-8 py-4 md:py-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4 text-center sm:text-right">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner shrink-0">
                  <Icon name="location" className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 pt-1 w-full text-center sm:text-right">
                  <p className="text-[10px] md:text-xs text-gray-400 mb-1 md:mb-2">آدرس دفتر / مرکز</p>
                  <p className="text-[11px] md:text-sm text-white font-sans leading-relaxed text-justify [text-align-last:center] sm:[text-align-last:right]">
                    {contactAddress}
                  </p>
                </div>
              </div>
            )}

            {validSocials.length > 0 && (
              <div className="border-t border-white/10 pt-5 md:pt-8 mt-2 md:mt-4">
                {/* متن شبکه‌های اجتماعی (وسط‌چین و جاستیفای) */}
                <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 font-light text-justify [text-align-last:center]">ما را در شبکه‌های اجتماعی دنبال کنید</p>
                <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8 max-w-4xl mx-auto">
                  {validSocials.map((network) => (
                    <Tooltip key={network.id} content={network.tooltip} position="top">
                      <motion.a 
                        whileHover={{ scale: 1.25, rotate: -5 }}
                        href={network.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ '--hover-color': network.color || '#06b6d4' }}
                        className="text-white/40 hover:text-[var(--hover-color)] transition-all duration-300 drop-shadow-md inline-block p-1"
                      >
                        <div 
                          className="w-6 h-6 md:w-8 md:h-8 bg-current transition-colors"
                          style={{
                            maskImage: `url(${network.iconUrl})`,
                            WebkitMaskImage: `url(${network.iconUrl})`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                          }}
                        />
                      </motion.a>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.section>
      )}

      {/* پاپ‌آپ شبکه‌های اجتماعی */}
      <AnimatePresence>
        {isSocialPopupOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#050810]/60 backdrop-blur-md" onClick={() => setIsSocialPopupOpen(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              // تغییر bg-[#0b0f19]/95 به گلس‌مورفیسم کاملاً شفاف
              className="relative w-full max-w-sm md:max-w-md bg-white/[0.03] backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.08] text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />
              <button onClick={() => setIsSocialPopupOpen(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer border border-transparent shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                <Icon name="close" className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-[#10b981] mx-auto mb-4 md:mb-6 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] border border-white/[0.05]">
                <Icon name="hash" className="w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>

              <h3 className="text-lg md:text-xl font-bold text-white mb-2 drop-shadow-md">{socialConn.popupTitle || 'ارتباط با ما'}</h3>
              <p className="text-xs md:text-sm text-gray-300 font-light mb-6 md:mb-8 leading-relaxed px-2 text-justify [text-align-last:center]">
                {socialConn.popupDesc || 'از طریق پیام‌‌رسان‌های زیر با ما در ارتباط باشید.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {(socialConn.popupLinks || []).map(link => {
                  if (!link.url || !link.iconUrl) return null;
                  return (
                    <Tooltip key={link.id} content={link.tooltip} position="top">
                      <motion.a 
                        whileHover={{ scale: 1.15 }}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ '--hover-color': link.hoverColor || '#10b981' }}
                        className="text-white/40 hover:text-[var(--hover-color)] transition-all duration-300 group/poplink block p-2 drop-shadow-md"
                      >
                        <div 
                          className="w-8 h-8 md:w-10 md:h-10 bg-current transition-colors"
                          style={{
                            maskImage: `url(${link.iconUrl})`,
                            WebkitMaskImage: `url(${link.iconUrl})`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center',
                          }}
                        />
                      </motion.a>
                    </Tooltip>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}