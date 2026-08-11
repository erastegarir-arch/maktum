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
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center h-full min-h-[300px] animate-[fadeIn_0.4s_ease-out]">
      {/* افکت نوری و آیکون مرکزی */}
      <div className="relative">
        <div className={`absolute inset-0 blur-2xl opacity-20 bg-current ${color}`}></div>
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl glass-card flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10 ${color}`}>
          <Icon name={icon} className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-sm md:text-base text-gray-400 font-light max-w-md mx-auto leading-relaxed mb-8 text-center md:text-justify">
        {description}
      </p>
      
      {/* دکمه عملیات (Call to Action) - در صورت وجود */}
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#06b6d4]/50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <span>{actionText}</span>
          <Icon name="arrowLeft" className="w-4 h-4 text-[#06b6d4] group-hover:-translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}