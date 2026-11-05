'use client';
import Icon from './Icon';

export default function EmptyState({ 
  icon = "folderSlash", 
  title = "هیچ موردی یافت نشد", 
  description = "متأسفانه در حال حاضر اطلاعاتی برای نمایش وجود ندارد.",
  actionText,
  onAction,
  color = "text-gray-400"
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 text-center h-full min-h-[250px] md:min-h-[300px] animate-[fadeIn_0.4s_ease-out] w-full">
      
      {/* افکت نوری و آیکون مرکزی */}
      <div className="relative flex items-center justify-center mb-5 md:mb-6">
        {/* هاله نور در پس‌زمینه آیکون */}
        <div className={`absolute inset-0 blur-[30px] md:blur-[40px] opacity-20 bg-current ${color} pointer-events-none`}></div>
        
        {/* باکس شیشه‌ای آیکون */}
        <div className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center ${color}`}>
          <Icon name={icon} className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
        </div>
      </div>
      
      {/* متون */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-2 md:mb-3 tracking-wide font-sans">
        {title}
      </h3>
      <p className="text-xs md:text-base text-gray-400 font-light max-w-[260px] sm:max-w-sm md:max-w-md mx-auto leading-relaxed mb-6 md:mb-8 text-center font-sans">
        {description}
      </p>
      
      {/* دکمه عملیات (Call to Action) - در صورت وجود */}
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-white/5 hover:bg-white/10 border border-white/5 shadow-inner text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2.5 group cursor-pointer hover:-translate-y-0.5 active:translate-y-0 font-sans"
        >
          <span>{actionText}</span>
          <Icon name="arrowLeft" className="w-4 h-4 md:w-5 md:h-5 text-[#06b6d4] group-hover:-translate-x-1.5 transition-transform" />
        </button>
      )}

    </div>
  );
}