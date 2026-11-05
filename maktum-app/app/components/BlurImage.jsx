'use client';
import { useState } from 'react';

export default function BlurImage({ src, alt, className = "", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* 
        ۱. لایه زیرین: اسکلتون شیمر شیشه‌ای
        تا زمانی که عکس لود نشده، این افکت در پس‌زمینه نمایش داده می‌شود
      */}
      <div 
        className={`absolute inset-0 bg-[#050810]/60 backdrop-blur-xl border border-white/[0.05] transition-opacity duration-700 z-0 flex items-center justify-center overflow-hidden ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      
      {/* ۲. عکس اصلی */}
      <img
        src={src}
        alt={alt || 'تصویر مکتومم'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`
          relative z-10
          ${className} 
          ${isLoaded ? 'blur-0 opacity-100' : 'blur-2xl opacity-0'}
        `}
        style={{ 
          transitionProperty: 'filter, opacity, transform',
          transitionDuration: '700ms',
          transitionTimingFunction: 'ease-out'
        }}
        {...props}
      />
    </>
  );
}