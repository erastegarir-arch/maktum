'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Tooltip({ 
  children, 
  content, 
  position = 'top', // top, bottom, left, right
  delay = 200,      // تاخیر در نمایش (کاهش یافت برای تجربه بهتر)
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
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

  // تنظیمات موقعیت برای انیمیشن
  const getVariants = () => {
    switch(position) {
      case 'top': return { hidden: { opacity: 0, y: 8, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } };
      case 'bottom': return { hidden: { opacity: 0, y: -8, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } };
      case 'left': return { hidden: { opacity: 0, x: 8, scale: 0.95 }, visible: { opacity: 1, x: 0, scale: 1 } };
      case 'right': return { hidden: { opacity: 0, x: -8, scale: 0.95 }, visible: { opacity: 1, x: 0, scale: 1 } };
      default: return { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };
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
      className="relative inline-flex items-center justify-center cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.span 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={getVariants()}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn("absolute z-[100] pointer-events-none", positionClasses[position])}
          >
            <span className={cn(
              "block bg-[#050810]/95 backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.08] text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl whitespace-nowrap font-sans text-center",
              className
            )}>
              {content}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}