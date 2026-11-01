'use client';
import { useState, useEffect } from 'react';

export default function ProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
      setScrollPercentage(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 md:h-1.5 z-[120] bg-white/[0.02] pointer-events-none backdrop-blur-sm">
      <div 
        className="h-full bg-gradient-to-r from-[#06b6d4] via-[#38bdf8] to-[#0ea5e9] shadow-[0_0_15px_rgba(6,182,212,0.9)] transition-all duration-150 ease-out rounded-r-full"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
}