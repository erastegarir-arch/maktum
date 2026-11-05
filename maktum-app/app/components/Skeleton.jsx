'use client';

// ۱. کامپوننت پایه برای ساخت قطعات مختلف اسکلتی
export const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/[0.04] backdrop-blur-md border border-white/[0.02] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] ${rounded} ${className}`}>
      {/* هاله نورانی متحرک (Shimmer Effect) */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
};

// ۲. کامپوننت اختصاصی کارت محتوا (شبیه‌ساز دقیق کارت‌های مکتومم)
export const CardSkeleton = () => {
  return (
    <div className="flex flex-col p-4 rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-xl relative overflow-hidden h-full shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* بخش تصویر کاور */}
      <BaseSkeleton className="w-full aspect-square md:aspect-video mb-4" rounded="rounded-2xl" />
      
      {/* بخش عنوان */}
      <div className="flex-grow space-y-3 mb-4 mt-2">
        <BaseSkeleton className="w-full h-4 md:h-5" rounded="rounded-md md:rounded-lg" />
        <BaseSkeleton className="w-2/3 h-4 md:h-5" rounded="rounded-md md:rounded-lg" />
      </div>
      
      {/* بخش متادیتا (پایین کارت) */}
      <div className="mt-auto pt-4 border-t border-white/[0.05] flex justify-between items-center">
        <BaseSkeleton className="w-20 md:w-24 h-3 md:h-4" rounded="rounded-full" />
        <BaseSkeleton className="w-10 md:w-12 h-3 md:h-4" rounded="rounded-full" />
      </div>
    </div>
  );
};

export default BaseSkeleton;