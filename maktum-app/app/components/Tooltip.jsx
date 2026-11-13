'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Tooltip({ 
  children, 
  content, 
  position = 'top', // top, bottom, left, right
  delay = 150,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedPos, setResolvedPos] = useState(position);
  const [shiftX, setShiftX] = useState(0);

  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const adjustPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || typeof window === 'undefined') return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12; // حداقل فاصله امن از لبه‌های صفحه موبایل و دسکتاپ

    let nextPos = position;

    // ۱. در صفحات کوچک موبایل، اگر left یا right باعث خروج از کادر شود، به top تبدیل شود
    if (position === 'left' && triggerRect.left - tooltipRect.width < margin) {
      nextPos = 'top';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width > vw - margin) {
      nextPos = 'top';
    }

    // ۲. وارونه‌سازی هوشمند عمودی در صورت کمبود جا در بالا یا پایین صفحه
    if (nextPos === 'top' && triggerRect.top - tooltipRect.height - 14 < margin) {
      nextPos = 'bottom';
    } else if (nextPos === 'bottom' && triggerRect.bottom + tooltipRect.height + 14 > vh - margin) {
      nextPos = 'top';
    }

    // ۳. مهار افقی (جلوگیری ۱۰۰ درصدی از بیرون زدن از لبه چپ یا راست صفحه)
    let nextShiftX = 0;
    if (nextPos === 'top' || nextPos === 'bottom') {
      const center = triggerRect.left + triggerRect.width / 2;
      const halfWidth = tooltipRect.width / 2;

      if (center + halfWidth > vw - margin) {
        nextShiftX = (vw - margin) - (center + halfWidth);
      } else if (center - halfWidth < margin) {
        nextShiftX = margin - (center - halfWidth);
      }
    }

    setResolvedPos(nextPos);
    setShiftX(Math.round(nextShiftX));
  }, [position]);

  useIsomorphicLayoutEffect(() => {
    if (isVisible) {
      adjustPosition();
    } else {
      setShiftX(0);
      setResolvedPos(position);
    }
  }, [isVisible, content, position, adjustPosition]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (!content) return children;

  const getVariants = () => {
    switch (resolvedPos) {
      case 'top':
        return {
          hidden: { opacity: 0, y: 6, scale: 0.94 },
          visible: { opacity: 1, y: 0, scale: 1 }
        };
      case 'bottom':
        return {
          hidden: { opacity: 0, y: -6, scale: 0.94 },
          visible: { opacity: 1, y: 0, scale: 1 }
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: 6, scale: 0.94 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -6, scale: 0.94 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      default:
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: { opacity: 1, scale: 1 }
        };
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  };

  return (
    <span 
      ref={triggerRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.span 
            ref={tooltipRef}
            role="tooltip"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={getVariants()}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className={cn("absolute z-[99999] pointer-events-none flex flex-col items-center", positionClasses[resolvedPos])}
          >
            {/* بدنه گلس‌مورفیک سرمه‌ای تیره با شفافیت کنترل‌شده و جابجایی خودکار برای ماندن در صفحه */}
            <span 
              style={{ transform: shiftX ? `translateX(${shiftX}px)` : undefined }}
              className={cn(
                "relative overflow-hidden block bg-gradient-to-b from-[#132342]/92 to-[#0b1528]/94 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_32px_rgba(4,9,20,0.8),inset_0_1px_1px_rgba(255,255,255,0.18),0_0_15px_rgba(6,182,212,0.12)] border border-white/[0.14] text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-xl whitespace-normal sm:whitespace-nowrap max-w-[calc(100vw-24px)] sm:max-w-xs font-sans text-center leading-relaxed tracking-wide",
                className
              )}
            >
              {/* خط نوری ظریف بالای تولتیپ */}
              <span className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4]/60 to-transparent pointer-events-none" />
              <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {content}
              </span>
            </span>

            {/* پیکان راهنمای تولتیپ که همیشه دقیقاً روی مرکز المان هدف می‌ماند */}
            {resolvedPos === 'top' && (
              <span className="w-2 h-2 bg-[#0b1528]/94 border-r border-b border-white/[0.14] rotate-45 -mt-1 shrink-0" />
            )}
            {resolvedPos === 'bottom' && (
              <span className="w-2 h-2 bg-[#132342]/92 border-l border-t border-white/[0.14] rotate-45 -mb-1 order-first shrink-0" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}