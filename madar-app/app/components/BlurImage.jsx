'use client';
import { useState } from 'react';

export default function BlurImage({ src, alt, className = "", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* 
        ۱. لایه زیرین: اسکلتون شیمر متحرک 
        تا زمانی که عکس لود نشده، این افکت نوری در پس‌زمینه نمایش داده می‌شود
      */}
      <div 
        className={`absolute inset-0 bg-[#080c16] transition-opacity duration-500 z-0 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      
      {/* 
        ۲. عکس اصلی: با لودینگ تنبل مرورگر (loading="lazy")
        وقتی لود تمام شد، تاری از بین می‌رود و عکس نمایان می‌شود
      */}
      <img
        src={src}
        alt={alt || 'تصویر مدار'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`
          relative z-10
          ${className} 
          ${isLoaded ? 'blur-0' : 'blur-xl opacity-0'}
        `}
        style={{ 
          transitionProperty: 'filter, opacity',
          transitionDuration: '500ms',
          transitionTimingFunction: 'ease-out'
        }}
        {...props}
      />
    </>
  );
}