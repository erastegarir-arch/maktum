'use client';
import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

// === کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // لودینگ اولیه اسکلتون مودال
  const [timer, setTimer] = useState(120);
  
  const cardRef = useRef(null);
  const otpRefs = useRef([]);

  // مدیریت بسته شدن با دکمه Esc و ریست کردن فرم همراه با اسکلتون اولیه هنگام باز شدن
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setStep(1);
      setPhone('');
      setOtp(['', '', '', '', '']);
      setIsInitializing(true);
      
      // شبیه‌سازی دریافت اطلاعات اولیه مودال (اسکلتون کوتاه)
      const initTimer = setTimeout(() => {
        setIsInitializing(false);
      }, 400);

      return () => clearTimeout(initTimer);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // تایمر معکوس برای مرحله دوم
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // افکت نوری ماوس (Spotlight)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // اعتبارسنجی شماره موبایل
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) setPhone(value);
  };

  // مدیریت فشردن کلید Enter در فیلد شماره موبایل
  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Enter' && phone.length >= 3 && !isLoading) {
      handleSubmitPhone();
    }
  };

  // مدیریت ورودی‌های OTP، فوکوس خودکار و بررسی تکمیل شدن خودکار کد
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }

    // بررسی اینکه آیا هر ۵ خانه پر شده‌اند تا به صورت خودکار لاگین انجام شود
    const isComplete = newOtp.every((digit) => digit !== '');
    if (isComplete && !isLoading) {
      setTimeout(() => {
        handleSubmitOtp();
      }, 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // مرحله ۱: رفتن به مرحله بعد
  const handleSubmitPhone = () => {
    if (phone.length < 3 || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setTimer(120);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 800);
  };

  // مرحله ۲: تایید نهایی کد و ورود به داشبورد
  const handleSubmitOtp = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      onClose();
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
      onClick={() => !isLoading && onClose()}
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 glass-card rounded-[32px] overflow-hidden p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-t-2 border-t-neon-amber animate-[scaleIn_0.3s_ease-out]"
      >
        <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)]" />

        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${step === 1 ? 'bg-neon-amber/25' : 'bg-neon-cyan/25'}`}></div>

        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20 border border-white/5 disabled:opacity-50 cursor-pointer"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>

        {/* حالت لودینگ اسکلتون هنگام باز شدن مودال */}
        {isInitializing ? (
          <div className="py-6 space-y-6 flex flex-col items-center animate-pulse">
            <BaseSkeleton className="w-16 h-16" rounded="rounded-2xl" />
            <div className="w-full space-y-3 flex flex-col items-center">
              <BaseSkeleton className="w-48 h-7" rounded="rounded-lg" />
              <BaseSkeleton className="w-full h-12" rounded="rounded-md" />
            </div>
            <BaseSkeleton className="w-full h-14" rounded="rounded-xl" />
            <BaseSkeleton className="w-40 h-4 mx-auto" rounded="rounded-md" />
          </div>
        ) : (
          <>
            {/* ================= مرحله ۱: شماره موبایل ================= */}
            {step === 1 && (
              <div className="relative z-10 flex flex-col items-center animate-[fadeIn_0.4s_ease-in]">
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <Icon name="fingerprint" className="w-8 h-8 text-neon-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">ورود به شبکه مدار</h2>
                <div className="rich-text text-sm text-gray-400 text-center font-light mb-8">
                  <p>برای ورود به شبکه مدار و دسترسی به محتوا، شماره موبایل خود را وارد کنید.</p>
                </div>

                <div className="w-full relative mb-6">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Icon name="mobile" className="w-6 h-6 text-gray-500" />
                  </div>
                  <input 
                    type="tel" 
                    dir="ltr" 
                    autoFocus
                    placeholder="09..." 
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/10 focus:border-neon-amber focus:bg-white/10 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] rounded-xl py-4 pl-4 pr-12 text-left font-sans tracking-widest text-lg placeholder-gray-600 outline-none text-white transition-all disabled:opacity-50"
                  />
                </div>

                <button 
                  onClick={handleSubmitPhone}
                  disabled={phone.length < 3 || isLoading}
                  className="w-full btn-glow bg-neon-amber text-deep-base py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  {isLoading ? (
                     <Icon name="loading" className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>دریافت کد تایید</span>
                      <Icon name="arrowLeft" className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <div className="rich-text text-xs text-gray-500 mt-6 text-center">
                  <p>با ورود یا ثبت‌نام، شما <a href="/terms" className="text-neon-cyan hover:underline">قوانین و مقررات</a> مدار را می‌پذیرید.</p>
                </div>
              </div>
            )}

            {/* ================= مرحله ۲: کد تایید OTP ================= */}
            {step === 2 && (
              <div className="relative z-10 flex flex-col items-center animate-[fadeIn_0.4s_ease-in]">
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <Icon name="password" className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">تایید هویت</h2>
                <div className="rich-text text-sm text-gray-400 text-center font-light mb-8">
                  <p>کد تایید ارسال شده به شماره <span dir="ltr" className="font-sans text-neon-cyan tracking-widest">{phone}</span> را وارد کنید.</p>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-6" dir="ltr">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text" 
                      maxLength={1} 
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={isLoading}
                      className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center font-sans text-xl font-bold text-white outline-none focus:border-neon-cyan focus:bg-white/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all disabled:opacity-50"
                    />
                  ))}
                </div>

                <button 
                  onClick={handleSubmitOtp}
                  disabled={isLoading}
                  className="w-full btn-glow bg-neon-cyan text-deep-base py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  {isLoading ? (
                     <Icon name="loading" className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Icon name="check" className="w-6 h-6" />
                      <span>تایید و ورود</span>
                    </>
                  )}
                </button>

                <div className="w-full flex items-center justify-between mt-6 text-xs">
                  <button 
                    onClick={() => setStep(1)} 
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Icon name="pencil" className="w-4 h-4" /> اصلاح شماره
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-sans tracking-widest">{formatTime(timer)}</span>
                    {timer > 0 ? (
                      <span className="text-gray-600 cursor-not-allowed">ارسال مجدد</span>
                    ) : (
                      <button onClick={() => setTimer(120)} className="text-neon-cyan hover:text-cyan-300 font-bold transition-colors cursor-pointer">
                        ارسال مجدد
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}