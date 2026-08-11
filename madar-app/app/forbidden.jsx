'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './components/Icon'; // اتصال به کامپوننت مرکزی آیکون‌ها

export default function Forbidden() {
  const cardRef = useRef(null);
  const router = useRouter(); // هوک مسیردهی برای بازگشت به صفحه قبل

  // افکت نوری ماوس (Spotlight)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    // استفاده از overflow-x-clip برای رفع مشکل پرش اسکرول سمت چپ
    <div className="relative bg-transparent text-gray-100 font-sans flex flex-col overflow-x-clip selection:bg-rose-500/30 selection:text-white">
      
      {/* استایل‌های انیمیشنی اختصاصی (تزریق مستقیم برای عملکرد مستقل) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radarPulse {
            0% { transform: scale(0.8) translate(-50%, -50%); opacity: 0.8; transform-origin: 0 0; }
            100% { transform: scale(2.5) translate(-20%, -20%); opacity: 0; transform-origin: 0 0; }
        }
        @keyframes floatBlob {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, 40px) scale(1.1); }
        }
        @keyframes lockShake {
            0%, 100% { transform: rotate(0deg) translateX(-50%); }
            25% { transform: rotate(-5deg) translateX(-50%); }
            75% { transform: rotate(5deg) translateX(-50%); }
        }
        @keyframes floatElement {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        .anim-radar { animation: radarPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .anim-blob { animation: floatBlob 20s infinite ease-in-out alternate; }
        .anim-shake { animation: lockShake 4s ease-in-out infinite; transform-origin: center bottom; }
        .anim-float { animation: floatElement 6s ease-in-out infinite; }
      `}} />

      {/* پس‌زمینه نئونی شناور (شفاف شده) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full blur-[80px] opacity-25 bg-[radial-gradient(circle,rgba(244,63,94,0.15)_0%,transparent_70%)] anim-blob" />
        <div className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[80px] opacity-25 bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] anim-blob" style={{ animationDelay: '-5s' }} />
      </div>

      {/* محتوای اصلی ۴۰۳ */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 pt-52 pb-12">
        <section className="max-w-3xl w-full text-center relative flex flex-col items-center">
            
          {/* افکت‌های رادار و درخشش پشت عدد */}
          <div className="absolute top-[40%] left-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full border border-rose-500/30 anim-radar pointer-events-none"></div>
          <div className="absolute top-[40%] left-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full border border-purple-500/20 anim-radar pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* گرافیک عدد 403 */}
          <div className="relative z-10 anim-float mb-6">
            <div className="absolute -top-10 left-1/2 text-rose-500/80 anim-shake">
              <Icon name="lockKey" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] fill-current" />
            </div>
            
            <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-gradient-to-br from-white via-rose-500 to-purple-500 bg-clip-text drop-shadow-[0_0_40px_rgba(244,63,94,0.4)]" dir="rtl">
              ۴۰۳
            </h1>
            
            <div className="absolute top-1/4 right-0 w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div>
          </div>
          
          {/* باکس متن خطا */}
          <div 
            ref={cardRef} 
            onMouseMove={handleMouseMove} 
            className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 border-t-2 border-t-rose-500 relative overflow-hidden w-full transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(244,63,94,0.2)] hover:border-rose-500/30 group"
          >
            {/* لایه Spotlight */}
            <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-xs font-bold text-rose-500 tracking-widest mb-4">
                <Icon name="shieldWarning" className="w-4 h-4 fill-current" /> منطقه طبقه‌بندی شده
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">دسترسی به این بخش محدود است!</h2>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light max-w-xl mx-auto mb-10 text-justify">
                شما مجوز لازم برای ورود به این بخش را ندارید. این محتوا ممکن است ویژه کاربران با سطح دسترسی بیشتر باشد و یا برای مشاهده آن نیازمند ورود به حساب کاربری خود باشید.
              </p>
              
              {/* دکمه‌های عملیاتی */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#" className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-purple-500 text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-all duration-300 transform hover:-translate-y-1">
                  <Icon name="user" className="w-5 h-5 fill-current" /> ورود به حساب کاربری
                </a>
                
                {/* دکمه بازگشت هوشمند با استفاده از روتر Next.js */}
                <button 
                  onClick={() => router.back()} 
                  className="w-full sm:w-auto bg-white/5 border border-white/5 text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:border-rose-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  <Icon name="arrowRight" className="w-5 h-5 text-rose-500" /> بازگشت به صفحه قبل
                </button>
              </div>
            </div>
          </div>

        </section>
      </main>

    </div>
  );
}