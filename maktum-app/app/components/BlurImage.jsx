'use client';
import { useState, useEffect, useRef } from 'react';

function isPlaceholderOrEmpty(url) {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  return trimmed === '' || trimmed.includes('placeholder-cover');
}

export default function BlurImage({ src, alt, className = '', ...props }) {
  const imgRef = useRef(null);
  const isInitiallyEmpty = isPlaceholderOrEmpty(src);

  const [isLoaded, setIsLoaded] = useState(isInitiallyEmpty);
  const [hasError, setHasError] = useState(isInitiallyEmpty);

  useEffect(() => {
    const empty = isPlaceholderOrEmpty(src);
    setHasError(empty);
    setIsLoaded(empty);
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || isPlaceholderOrEmpty(src)) return;

    if (img.complete) {
      if (img.naturalWidth === 0) {
        setHasError(true);
      }
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#050810]/60 backdrop-blur-xl border border-white/[0.05] z-0 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      {!hasError ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt || 'تصویر مکتوم'}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`
            relative z-10
            ${className} 
            ${isLoaded ? 'blur-0 opacity-100' : 'blur-2xl opacity-0'}
          `}
          style={{
            transitionProperty: 'filter, opacity, transform',
            transitionDuration: '700ms',
            transitionTimingFunction: 'ease-out',
          }}
          {...props}
        />
      ) : (
        <div
          aria-label={alt || 'بوم اختصاصی سامانه مکتوم'}
          className={`relative z-10 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c192e] via-[#070f1d] to-[#040811] select-none overflow-hidden ${className}`}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 bg-[#06b6d4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-36 h-36 md:w-52 md:h-52 rounded-full border border-[#06b6d4]/10 pointer-events-none" />
          <div className="absolute w-24 h-24 md:w-36 md:h-36 rounded-full border border-[#f59e0b]/10 rotate-45 pointer-events-none" />

          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 max-w-[65%] max-h-[65%] rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_0_20px_rgba(6,182,212,0.15),0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-center p-2.5">
            <div className="absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4]/70 to-transparent pointer-events-none" />
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]"
            >
              <rect x="20" y="20" width="60" height="60" rx="8" stroke="#f59e0b" strokeOpacity="0.45" strokeWidth="2" />
              <rect x="20" y="20" width="60" height="60" rx="8" transform="rotate(45 50 50)" stroke="#06b6d4" strokeOpacity="0.65" strokeWidth="2" />
              <path d="M34 68V48C34 36 50 28 50 28C50 28 66 36 66 48V68" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50 38L53 47L62 50L53 53L50 62L47 53L38 50L47 47L50 38Z" fill="#f59e0b" fillOpacity="0.85" />
              <circle cx="50" cy="50" r="3" fill="#ffffff" />
              <path d="M28 68H72" stroke="#f59e0b" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}