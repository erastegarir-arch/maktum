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
  
  // فیلتر شبکه‌های اجتماعی اصلی سایت (فقط آن‌هایی که هم لینک و هم آیکون دارند)
  const validSocials = socialSettings.filter(s => s.url && s.iconUrl);

  const hasEmail = Boolean(contactEmail.value?.trim());
  const hasPhone = Boolean(contactPhone.value?.trim());
  const hasAddress = Boolean(contactAddress.trim());
  // شرط نمایش دکمه ارتباط مجازی این است که عنوان آن تنظیم شده باشد
  const hasSocialConn = Boolean(socialConn.triggerWord?.trim());

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-18 md:pt-25">
      <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'درباره ما' }]} />

      {/* ۱. معرفی */}
      {hero.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-8 md:p-12 text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90" />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#06b6d4] mb-6 shadow-inner group-hover:border-[#06b6d4]/50 transition-colors duration-300 border border-transparent">
              <Icon name="solarsystem" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-6 pt-3 pb-2 leading-relaxed text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
              {hero.title}
            </h1>
            <div className="text-gray-300 text-sm md:text-base leading-loose font-light text-justify md:text-center space-y-4">
              {hero.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
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
          className="relative rounded-3xl border border-amber-500/20 p-8 md:p-14 text-center group shadow-[0_10px_40px_rgba(245,158,11,0.05)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#120b03]/80 via-[#1a1005]/80 to-black/80 backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-90" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Icon name="ya-fatemeh" className="w-20 h-20 md:w-24 md:h-24 stroke-[0.5] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-amber-50 mb-6 tracking-wide drop-shadow-md">
              {waqf.titlePart1}{waqf.titlePart2}
            </h2>
            <div className="max-w-3xl text-amber-100/70 text-sm md:text-base leading-loose font-light space-y-4 text-justify md:text-center">
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
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden group flex flex-col lg:flex-row items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-90" />

          <div className="relative z-10 lg:w-1/2">
            {eco.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full text-xs font-bold text-[#a855f7] mb-4 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse"></span>
                {eco.badge}
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
              {eco.titlePart1} <br/>
              <span className="text-[#a855f7]">{eco.titlePart2}</span>
            </h2>
            <div className="space-y-4 text-gray-300 text-sm md:text-base leading-loose font-light text-justify">
              {eco.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </div>

          <div className="relative z-10 lg:w-1/2 flex items-center justify-center w-full h-72 md:h-96">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent absolute"></div>
                <div className="h-full w-px bg-gradient-to-b from-transparent via-[#06b6d4]/50 to-transparent absolute"></div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent absolute rotate-45"></div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent absolute -rotate-45"></div>
              </div>
              
              <div className="relative z-20 w-24 h-24 bg-[#080c16] border border-[#a855f7] rounded-full flex items-center justify-center shadow-[inset_0_0_15px_rgba(168,85,247,0.2),0_0_30px_rgba(168,85,247,0.4)]">
                <Icon name="cube" className="w-10 h-10 text-[#a855f7]" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#06b6d4] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] text-[#06b6d4]">
                  <Icon name="footage" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] text-[#f59e0b]">
                  <Icon name="portfolio" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] text-[#10b981]">
                  <Icon name="product" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 animate-[float_4.5s_ease-in-out_infinite_0.5s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#f43f5e] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)] text-[#f43f5e]">
                  <Icon name="networking" className="w-5 h-5" />
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
          className="relative rounded-3xl px-8 md:px-12 py-5 md:py-6 overflow-hidden group flex flex-col lg:flex-row items-center gap-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-90" />

          <div className="relative z-10 lg:w-2/3">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Icon name="target" className="w-7 h-7 text-[#f59e0b]" /> 
              {conn.title}
            </h2>
            <div className="space-y-3 text-gray-300 text-sm md:text-base leading-loose font-light text-justify">
               {conn.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
            </div>
          </div>

          <div className="relative z-10 lg:w-1/3 flex items-center justify-center w-full h-64 md:h-80">
            <div className="relative w-60 h-60 md:w-64 md:h-64 flex items-center justify-center">
              
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/40 animate-[spin_18s_linear_infinite]">
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981]"></div>
              </div>

              <div className="absolute inset-10 rounded-full border border-dotted border-white/40 animate-[spin_12s_linear_infinite_reverse]">
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_12px_#ffffff]"></div>
              </div>

              <div className="absolute inset-16 rounded-full border border-dashed border-red-500/40 animate-[spin_8s_linear_infinite]">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444]"></div>
              </div>

              <div className="relative z-20 flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer">
                <Icon name="allah" className="w-16 h-16 md:w-20 md:h-20 text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]" />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ۵. ارکان فعالیت (کارت‌ها) */}
      {feats.enabled !== false && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{feats.title}</h2>
            <p className="text-sm text-gray-400 font-light">{feats.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="relative rounded-3xl p-8 flex flex-col items-center text-center group cursor-pointer overflow-hidden border border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />

                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{
                      boxShadow: `inset 0 0 25px ${cardColor}1a, 0 10px 30px -10px ${cardColor}25`
                    }}
                  />

                  <div 
                    className="absolute top-0 inset-x-6 h-[2px] transition-opacity duration-300 opacity-70 group-hover:opacity-100"
                    style={{ 
                      background: `linear-gradient(90deg, transparent 0%, ${cardColor} 50%, transparent 100%)` 
                    }}
                  />

                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-inner"
                    style={{ backgroundColor: `${cardColor}1a`, color: cardColor, boxShadow: `0 0 10px ${cardColor}33` }}
                  >
                    <Icon name={currentIcon} className="w-8 h-8" />
                  </div>
                  <h3 
                    className="text-lg font-bold text-white mb-3 transition-colors group-hover:text-[var(--hover-color)]" 
                    style={{ '--hover-color': cardColor }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-loose font-light">{feature.desc}</p>
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
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] group border border-transparent"
        >
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl pointer-events-none -z-10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />
          
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Icon name="chat" className="w-7 h-7 text-[#10b981]" />
              {contact.title}
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light leading-loose max-w-3xl mx-auto text-justify md:text-center">
              {contact.description}
            </p>
          </div>

          <div className="flex flex-col gap-6 relative z-10 mt-8 border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
              
              {hasEmail && (
                <Tooltip content={contactEmail.tooltip} position="top">
                  <div className="bg-white/5 border border-transparent shadow-inner px-8 py-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group/box">
                    <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform">
                      <Icon name="email" className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">پست الکترونیک</p>
                      <a href={`mailto:${contactEmail.value}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactEmail.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}

              {hasPhone && (
                <Tooltip content={contactPhone.tooltip} position="top">
                  <div className="bg-white/5 border border-transparent shadow-inner px-8 py-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group/box">
                    <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform">
                      <Icon name="phone" className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">شماره تماس (پشتیبانی)</p>
                      <a href={`tel:${contactPhone.value?.replace(/\D/g,'')}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactPhone.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}

              {hasSocialConn && (
                <Tooltip content={socialConn.triggerTooltip} position="top">
                  <div onClick={() => setIsSocialPopupOpen(true)} className="bg-white/5 border border-transparent shadow-inner px-8 py-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group/box">
                    <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner group-hover/box:scale-105 transition-transform overflow-hidden p-3">
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
                        <Icon name="hash" className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">ارتباط مجازی</p>
                      <span className="text-white font-sans font-bold group-hover/box:text-[#10b981] transition-colors block">
                        {socialConn.triggerWord || 'راه‌های ارتباطی'}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              )}

            </div>

            {hasAddress && (
              <div className="w-full max-w-4xl mx-auto bg-white/5 border border-transparent shadow-inner px-8 py-5 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-[#10b981] shadow-inner shrink-0">
                  <Icon name="location" className="w-6 h-6" />
                </div>
                <div className="text-right flex-1 pt-1">
                  <p className="text-xs text-gray-400 mb-2">آدرس دفتر / مرکز</p>
                  <p className="text-sm text-white font-sans leading-relaxed text-justify">
                    {contactAddress}
                  </p>
                </div>
              </div>
            )}

            {validSocials.length > 0 && (
              <div className="border-t border-white/10 pt-8 mt-4">
                <p className="text-center text-sm text-gray-400 mb-6 font-light">ما را در شبکه‌های اجتماعی دنبال کنید</p>
                <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
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
                          className="w-8 h-8 bg-current transition-colors"
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

      {/* پاپ‌آپ شبکه‌های اجتماعی (بدون هیچ کادری برای آیکون‌ها) */}
      <AnimatePresence>
        {isSocialPopupOpen && (
          <div className="fixed inset-0 z-[30] flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl" onClick={() => setIsSocialPopupOpen(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0b0f19]/90 backdrop-blur-2xl rounded-3xl p-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] border border-transparent text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90" />
              <button onClick={() => setIsSocialPopupOpen(false)} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer border border-transparent shadow-inner">
                <Icon name="close" className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mx-auto mb-6 shadow-inner border border-transparent">
                <Icon name="hash" className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{socialConn.popupTitle || 'ارتباط با ما'}</h3>
              <p className="text-sm text-gray-400 font-light mb-8 leading-relaxed">
                {socialConn.popupDesc || 'از طریق پیام‌رسان‌های زیر با ما در ارتباط باشید.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {(socialConn.popupLinks || []).map(link => {
                  if (!link.url || !link.iconUrl) return null;
                  return (
                    <Tooltip key={link.id} content={link.tooltip} position="top">
                      {/* تگِ لینک به طور کامل نامرئی است و فقط آیکون و هاور رنگی نمایش داده می‌شود */}
                      <motion.a 
                        whileHover={{ scale: 1.15 }}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ '--hover-color': link.hoverColor || '#10b981' }}
                        className="text-white/40 hover:text-[var(--hover-color)] transition-all duration-300 group/poplink block p-2"
                      >
                        <div 
                          className="w-10 h-10 bg-current transition-colors"
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