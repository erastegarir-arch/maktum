'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Icon from '@/app/components/Icon';
import Tooltip from '@/app/components/Tooltip';

const cn = (...inputs) => twMerge(clsx(inputs));

const STATIC_SOCIAL_NETWORKS = [
  { id: 'aparat', title: 'آپارات', icon: 'aparat' },
  { id: 'eitaa', title: 'ایتا', icon: 'eitaa' },
  { id: 'x', title: 'ایکس', icon: 'x' },
  { id: 'instagram', title: 'اینستاگرام', icon: 'instagram' },
  { id: 'bale', title: 'بله', icon: 'bale' },
  { id: 'telegram', title: 'تلگرام', icon: 'telegram' },
  { id: 'jebhe', title: 'جبهه', icon: 'jebhe' },
  { id: 'jaryan', title: 'جریان', icon: 'jaryan' },
  { id: 'rubika', title: 'روبیکا', icon: 'rubika' },
  { id: 'soroush', title: 'سروش', icon: 'soroush' },
  { id: 'github', title: 'گیت‌هاب', icon: 'github' },
  { id: 'linkedin', title: 'لینکدین', icon: 'linkedin' },
  { id: 'mydote', title: 'مای‌دات', icon: 'mydote' },
  { id: 'whatsapp', title: 'واتساپ', icon: 'whatsapp' },
  { id: 'virasty', title: 'ویراستی', icon: 'virasty' },
  { id: 'virgool', title: 'ویرگول', icon: 'virgool' },
  { id: 'youtube', title: 'یوتیوب', icon: 'youtube' },
  { id: 'site1', title: 'سایت 1', icon: 'site' },
  { id: 'site2', title: 'سایت 2', icon: 'site' },
  { id: 'site3', title: 'سایت 3', icon: 'site' },
  { id: 'public_link', title: 'لینک عمومی', icon: 'link' },
];

export default function AboutContent({ pageData = {} }) {
  const hero = pageData.hero || {};
  const waqf = pageData.waqf || {};
  const eco = pageData.ecosystem || {};
  const conn = pageData.connection || {};
  const feats = pageData.features || {};
  const contact = pageData.contact || {};
  const contactEmail = contact.email || {};
  const contactPhone = contact.phone || {};
  const socialSettings = pageData.socials || [];

  const hasEmail = Boolean(contactEmail.value?.trim());
  const hasPhone = Boolean(contactPhone.value?.trim());

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-18 md:pt-25">
      <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'درباره ما' }]} />

      {/* ۱. معرفی */}
      {hero.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="glass-card transform-gpu relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] rounded-3xl shadow-2xl"
        >
          <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            
            <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] group hover:border-[#06b6d4]/60 transition-colors">
              <Icon name="solarsystem" className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-6 pt-3 pb-2 leading-relaxed overflow-visible text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="transform-gpu relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-black to-[#1a1005] p-8 md:p-14 text-center group shadow-[0_0_40px_rgba(245,158,11,0.05)]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Icon name="ya-fatemeh" className="w-20 h-20 md:w-24 md:h-24 stroke-[0.5]" />
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="glass-card transform-gpu p-8 md:p-12 relative overflow-hidden group flex flex-col lg:flex-row items-center gap-12 border-t-2 border-t-[#a855f7] rounded-3xl"
        >
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#a855f7]/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#a855f7]/20 pointer-events-none"></div>
          <div className="relative z-10 lg:w-1/2">
            {eco.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full text-xs font-bold text-[#a855f7] mb-4">
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
              
              <div className="relative z-20 w-24 h-24 bg-[#080c16] border-2 border-[#a855f7] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <Icon name="treeStructure" className="w-10 h-10 text-[#a855f7]" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#06b6d4] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] text-[#06b6d4]">
                  <Icon name="videoCamera" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] text-[#f59e0b]">
                  <Icon name="users" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] text-[#10b981]">
                  <Icon name="pen-nib" className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 animate-[float_4.5s_ease-in-out_infinite_0.5s]">
                <div className="w-12 h-12 bg-[#080c16] border border-[#f43f5e] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)] text-[#f43f5e]">
                  <Icon name="shareNetwork" className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ۴. پر کردن خلأها */}
      {conn.enabled !== false && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="glass-card transform-gpu px-8 md:px-12 py-5 md:py-6 relative overflow-hidden group flex flex-col lg:flex-row items-center gap-8 border-t-2 border-t-[#f59e0b] rounded-3xl"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#f59e0b]/20"></div>
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
              const cardIcons = ["database", "users", "pen-nib", "shareNetwork"];
              const currentIcon = cardIcons[idx] || "database";
              
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="glass-card transform-gpu p-8 hover-lift flex flex-col items-center text-center group rounded-3xl" 
                  style={{ borderTopColor: feature.color, borderTopWidth: '2px' }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}1a`, color: feature.color, boxShadow: `0 0 10px ${feature.color}33` }}
                  >
                    <Icon name={currentIcon} className="w-8 h-8" />
                  </div>
                  <h3 
                    className="text-lg font-bold text-white mb-3 transition-colors group-hover:text-[var(--hover-color)]" 
                    style={{ '--hover-color': feature.color }}
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="glass-card transform-gpu p-8 md:p-12 relative overflow-hidden border-t-2 border-t-[#10b981] rounded-3xl"
        >
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Icon name="phoneCall" className="w-7 h-7 text-[#10b981]" />
              {contact.title}
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light leading-loose max-w-3xl mx-auto text-justify md:text-center">
              {contact.description}
            </p>
          </div>

          <div className="flex flex-col gap-10 relative z-10 mt-8 border-t border-white/5 pt-8">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
              {hasEmail && (
                <Tooltip content={contactEmail.tooltip} position="top">
                  <div className="bg-black/30 border border-white/5 px-8 py-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#10b981]">
                      <Icon name="envelope" className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">پست الکترونیک</p>
                      <a href={`mailto:${contactEmail.value}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactEmail.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}

              {hasPhone && (
                <Tooltip content={contactPhone.tooltip} position="top">
                  <div className="bg-black/30 border border-white/5 px-8 py-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#10b981]">
                      <Icon name="phone" className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">شماره تماس (پشتیبانی)</p>
                      <a href={`tel:${contactPhone.value?.replace(/\D/g,'')}`} dir="ltr" className="text-white font-sans font-bold hover:text-[#10b981] transition-colors block">
                        {contactPhone.value}
                      </a>
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>

            <div className="border-t border-white/5 pt-8">
              <p className="text-center text-sm text-gray-400 mb-6 font-light">ما را در شبکه‌های اجتماعی دنبال کنید</p>
              <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
                {STATIC_SOCIAL_NETWORKS.map((network) => {
                  const config = socialSettings.find(s => s.id === network.id || s.id === network.icon) || {};
                  
                  if (!config.url || config.url.trim() === '') return null;

                  return (
                    <Tooltip key={network.id} content={config.tooltip || network.title} position="top">
                      <motion.a 
                        whileHover={{ scale: 1.25, rotate: -5 }}
                        href={config.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ '--hover-color': config.color || '#06b6d4' }}
                        className="text-white hover:text-[var(--hover-color)] transition-all duration-300 drop-shadow-md inline-block p-1"
                      >
                        <Icon name={network.icon} className="w-8 h-8" />
                      </motion.a>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.section>
      )}

    </main>
  );
}