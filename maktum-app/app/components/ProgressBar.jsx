// src/app/components/ProgressBar.jsx
'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ProgressBar() {
  const { scrollYProgress } = useScroll();

  // تبدیل حرکت پله‌ای اسکرول موشواره به حرکت نرم و ابریشمی (60fps GPU)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-l from-[#06b6d4] via-[#38bdf8] to-[#10b981] origin-right z-[100] shadow-[0_0_12px_rgba(6,182,212,0.9)] pointer-events-none transform-gpu will-change-transform"
    />
  );
}