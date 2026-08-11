'use client';
import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ 
  children, 
  content, 
  position = 'top', // top, bottom, left, right
  delay = 300,      // تاخیر در نمایش
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10); 
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 200); 
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l',
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

      {isRendered && (
        <span 
          className={`absolute ${positionClasses[position]} z-[100] transition-all duration-200 ease-out pointer-events-none
            ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95'}
            ${position === 'top' && !isVisible ? 'translate-y-1' : ''}
            ${position === 'bottom' && !isVisible ? '-translate-y-1' : ''}
            ${position === 'left' && !isVisible ? 'translate-x-1' : ''}
            ${position === 'right' && !isVisible ? '-translate-x-1' : ''}
          `}
        >
          <span className={`block bg-[#080c16]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap ${className}`}>
            {content}
          </span>

          <span className={`absolute w-2 h-2 bg-[#080c16] border-white/10 rotate-45 transform ${arrowClasses[position]}`}></span>
        </span>
      )}
    </span>
  );
}