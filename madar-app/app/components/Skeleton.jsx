'use client';

// ۱. کامپوننت پایه برای ساخت قطعات مختلف اسکلتی
export const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      {/* هاله نورانی متحرک (Shimmer Effect) */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

// ۲. کامپوننت اختصاصی کارت محتوا (شبیه‌ساز دقیق کارت‌های مدار)
export const CardSkeleton = () => {
  return (
    <div className="glass-card flex flex-col p-4 rounded-3xl border-t border-b-2 relative overflow-hidden h-full">
      {/* بخش تصویر کاور */}
      <BaseSkeleton className="w-full h-48 mb-4" rounded="rounded-2xl" />
      
      {/* بخش عنوان (دو خط شبیه‌سازی شده) */}
      <div className="flex-grow space-y-3 mb-4">
        <BaseSkeleton className="w-full h-4" rounded="rounded-md" />
        <BaseSkeleton className="w-2/3 h-4" rounded="rounded-md" />
      </div>
      
      {/* بخش متادیتا (پایین کارت) */}
      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
        <BaseSkeleton className="w-24 h-3" rounded="rounded-sm" />
        <BaseSkeleton className="w-12 h-3" rounded="rounded-sm" />
      </div>
    </div>
  );
};

export default BaseSkeleton;