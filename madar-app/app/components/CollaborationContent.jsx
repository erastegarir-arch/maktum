'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Breadcrumbs from './Breadcrumbs';
import Icon from './Icon';

const cn = (...inputs) => twMerge(clsx(inputs));

const HERO_ICON = "treeStructure";
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card transform-gpu relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] rounded-3xl shadow-2xl"
          >
            <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] group hover:border-[#06b6d4]/30 transition-colors">
                <Icon name={HERO_ICON} className="w-8 h-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-4 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                {hero.badge} {hero.highlight}
              </h1>
              
              <div className="rich-text text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light text-justify md:text-center space-y-4">
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

              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card transform-gpu p-8 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-400 ease-out hover:-translate-y-1 cursor-pointer rounded-3xl"
                  style={{ 
                    borderTopWidth: '2px', 
                    borderTopColor: `${option.color}80`, 
                  }}
                >
                  <div 
                    className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl transition-all pointer-events-none group-hover:opacity-100 opacity-50"
                    style={{ backgroundColor: `${option.color}1a` }}
                  ></div>
                  
                  <div 
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 z-10 transition-colors duration-300 group-hover:bg-white/10"
                    style={{ color: option.color }}
                  >
                    <Icon name={currentIcon} className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 z-10">{option.title}</h3>
                  
                  <div className="rich-text text-sm text-gray-400 leading-relaxed font-light flex-grow z-10 w-full text-justify md:text-center">
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
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="glass-card transform-gpu p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-shadow duration-500 cursor-pointer rounded-3xl"
                 style={{ 
                   borderTopWidth: '2px', 
                   borderTopColor: proposal.color || '#fbbf24',
                 }}
            >
              <div 
                className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-50 group-hover:opacity-80"
                style={{ backgroundColor: `${proposal.color || '#fbbf24'}1a` }}
              ></div>
              <div 
                className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-50 group-hover:opacity-80"
                style={{ backgroundColor: `${proposal.color || '#fbbf24'}1a` }}
              ></div>
              
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
                <div 
                  className="w-24 h-24 flex-shrink-0 rounded-3xl bg-white/5 border flex items-center justify-center shadow-lg mb-6 transition-colors duration-500 group-hover:bg-white/10"
                  style={{ 
                    color: proposal.color || '#fbbf24',
                    borderColor: `${proposal.color || '#fbbf24'}4d` 
                  }}
                >
                  <Icon name={PROPOSAL_ICON} className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {proposal.title}
                </h3>
                
                <div className="rich-text text-base text-gray-300 leading-relaxed font-light text-justify md:text-center w-full">
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