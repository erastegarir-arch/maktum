import React from 'react';
import Icon from './Icon'; // بسته به محل قرارگیری فایل، مسیر را تنظیم کنید

export default function Breadcrumbs({ items }) {
  return (
    <nav className="pt-28 lg:pt-32 flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 mb-8 font-sans w-full relative z-10">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <Icon name="caretLeft" className="w-3 h-3 text-gray-600" />
            )}

            {isLast ? (
              <span className="text-white font-medium px-2.5 py-1 rounded-lg bg-white/5 backdrop-blur-sm shadow-sm">
                {item.label}
              </span>
            ) : (
              <a 
                href={item.href || '#'} 
                className="text-gray-400 hover:text-[#06b6d4] hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-300 px-2.5 py-1 rounded-lg hover:bg-white/5"
              >
                {item.label}
              </a>
            )}
          </div>
        );
      })}
    </nav>
  );
}