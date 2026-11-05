'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import Icon from '../Icon';

import { 
  sendOtpAction, 
  verifyOtpAction, 
  loginWithPasswordAction, 
  registerAction
} from '@/app/actions/auth'; 

const cn = (...inputs) => twMerge(clsx(inputs));

// ==========================================
// توابع تبدیل اعداد فارسی و انگلیسی
// ==========================================
const toPersianDigits = (str) => {
  if (!str && str !== 0) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (x) => persianDigits[x]);
};

const toEnglishDigits = (str) => {
  if (!str) return '';
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let result = str.toString();
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], i);
  }
  return result;
};

const BaseSkeleton = ({ className = "" }) => (
  <div className={cn("relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl", className)}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
  </div>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [view, setView] = useState('login'); 
  const [loginType, setLoginType] = useState('password'); 
  const [step, setStep] = useState(1); 
  
  // استیت‌های مقادیر همیشه مقادیر انگلیسی استاندارد را ذخیره می‌کنند تا برای بک‌اند مشکلی پیش نیاید
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [timer, setTimer] = useState(120);
  const [mockCode, setMockCode] = useState(''); 
  
  // استیت وضعیت هوشمند برای رنگ‌بندی و ویبره فرم (idle | error | success)
  const [authStatus, setAuthStatus] = useState('idle');

  const cardRef = useRef(null);
  const otpRefs = useRef([]);
  
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setView('login');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setOtp(['', '', '', '', '', '']);
      setAuthStatus('idle');
      setIsInitializing(true);
      const initTimer = setTimeout(() => setIsInitializing(false), 400);
      return () => {
        clearTimeout(initTimer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading && step !== 3) onCloseRef.current?.();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isLoading, step]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // هندلرها
  const handlePhoneChange = (e) => {
    const engValue = toEnglishDigits(e.target.value).replace(/\D/g, '');
    if (engValue.length <= 11) setPhone(engValue);
  };

  const handleOtpChange = (index, value) => {
    const val = toEnglishDigits(value).replace(/\D/g, '');
    if (!val && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) otpRefs.current[index + 1]?.focus();

    const isComplete = newOtp.every((digit) => digit !== '');
    if (isComplete && !isLoading) {
      setTimeout(() => handleSubmitOtp(newOtp.join('')), 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // توابع تحریک تم خطا و موفقیت
  const triggerError = () => {
    setAuthStatus('error');
    setTimeout(() => {
      setAuthStatus((prev) => prev === 'error' ? 'idle' : prev);
    }, 2000);
  };

  const triggerSuccess = (callback) => {
    setAuthStatus('success');
    setTimeout(() => {
      callback();
    }, 1500); // 1.5 ثانیه مکث برای دیده شدن تم سبز و سپس اقدام بعدی
  };

  const handleMainSubmit = async () => {
    if (phone.length < 11 || !phone.startsWith('09')) {
      toast.error('شماره موبایل نامعتبر است. (مثال: ۰۹۱۲...)');
      triggerError();
      return;
    }

    if (view === 'register') {
      if (password.length < 6) {
        toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        triggerError();
        return;
      }
      if (password !== confirmPassword) {
        toast.error('تکرار رمز عبور مطابقت ندارد.');
        triggerError();
        return;
      }
      handleSendOtp();
    } 
    else if (view === 'login') {
      if (loginType === 'password') {
        if (!password) {
          toast.error('لطفاً رمز عبور را وارد کنید.');
          triggerError();
          return;
        }
        setIsLoading(true);
        const res = await loginWithPasswordAction(phone, password);
        if(res.success) {
          triggerSuccess(() => handleSuccessAnimation());
        } else {
          toast.error(res.error);
          setIsLoading(false);
          triggerError();
        }
      } else {
        handleSendOtp();
      }
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    const res = await sendOtpAction(phone);
    setIsLoading(false);

    if (!res.success) {
      if (res.error === 'BANNED') toast.error('حساب کاربری مسدود است.', { duration: 5000 });
      else toast.error(res.error);
      triggerError();
      return; 
    }

    setMockCode(res.mockCode); 
    setStep(2);
    setTimer(120);
    toast.success('کد ورود با موفقیت ارسال شد');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleSubmitOtp = async (codeString) => {
    if (isLoading) return;
    setIsLoading(true);
    
    const code = codeString || otp.join('');
    
    let res;
    if (view === 'register') {
      res = await registerAction(phone, password, code);
    } else {
      res = await verifyOtpAction(phone, code);
    }

    if (!res.success) {
      setIsLoading(false);
      toast.error(res.error || 'کد وارد شده اشتباه است.');
      setOtp(['', '', '', '', '', '']);
      triggerError();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }

    triggerSuccess(() => handleSuccessAnimation());
  };

  const handleSuccessAnimation = () => {
    setStep(3);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess?.();
      onCloseRef.current?.();
      window.location.reload(); 
    }, 2500); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050810]/75 backdrop-blur-xl p-4"
        onClick={() => !isLoading && step !== 3 && onCloseRef.current?.()}
      >
        {/* کانتینر دربرگیرنده برای قرارگیری مستقل دکمه بستن */}
        <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          
          {step !== 3 && (
            <div className="absolute -top-16 right-1/2 translate-x-1/2 md:-right-14 md:translate-x-0 md:-top-2 z-50 group/close">
              <button 
                onClick={() => onCloseRef.current?.()} 
                disabled={isLoading} 
                className="w-10 h-10 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/[0.1] shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>

              {/* تولتیپ سفارشی هماهنگ با تم مکتوم */}
              <div className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover/close:opacity-100 group-hover/close:scale-100 transition-all duration-200 ease-out flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0f19]/90 backdrop-blur-md border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.5)] whitespace-nowrap">
                <span className="text-[11px] font-sans font-medium text-gray-300">بستن</span>
                <span className="text-[9px] font-mono text-cyan-400/90 bg-white/[0.05] border border-white/10 px-1 py-0.5 rounded leading-none">Esc</span>
              </div>
            </div>
          )}

          <motion.div 
            ref={cardRef} onMouseMove={handleMouseMove}
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            // در صورت خطا، مودال درجا لرزش کرده و سپس ثابت می‌شود
            animate={
              authStatus === 'error' 
                ? { x: [-8, 8, -8, 8, 0], scale: 1, opacity: 1, y: 0, transition: { duration: 0.4 } }
                : { x: 0, scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
            }
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full rounded-[2rem] md:rounded-[32px] p-6 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border group transition-colors duration-500",
              authStatus === 'error' ? "border-rose-500/50 shadow-[0_0_40px_rgba(225,29,72,0.2)]" : 
              authStatus === 'success' ? "border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : 
              "border-white/[0.05]"
            )}
          >
            {/* لایه داخلی پس‌زمینه با overflow-hidden جهت برش دادن هاله‌های نور */}
            <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none -z-10">
              <div className={cn(
                "absolute inset-0 backdrop-blur-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] transition-colors duration-500",
                authStatus === 'error' ? "bg-[#1a0b10]/95" : 
                authStatus === 'success' ? "bg-[#0b1a14]/95" : 
                "bg-[#0b0f19]/80"
              )} />
              <div className="absolute top-0 inset-x-0 h-[2px] transition-all duration-500 opacity-90 z-20 pointer-events-none" 
                style={{ background: `linear-gradient(90deg, transparent 0%, ${authStatus === 'error' ? '#f43f5e' : authStatus === 'success' ? '#10b981' : '#06b6d4'} 50%, transparent 100%)` }} 
              />
              <div className={cn(
                "absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 opacity-20 blur-[50px] pointer-events-none -z-10 transition-colors duration-500",
                authStatus === 'error' ? "bg-rose-500" : 
                authStatus === 'success' ? "bg-emerald-500" : 
                "bg-[#06b6d4]"
              )} />
              <div className="hidden md:block absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.06),transparent_40%)]" />
            </div>

            {isInitializing ? (
              <div className="py-6 space-y-6 flex flex-col items-center relative z-10">
                <BaseSkeleton className="w-16 h-16 rounded-full" />
                <div className="w-full space-y-3">
                  <BaseSkeleton className="w-full h-12" />
                  <BaseSkeleton className="w-full h-12" />
                </div>
                <BaseSkeleton className="w-full h-14" />
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center">
                <AnimatePresence mode="wait">
                  
                  {/* ===================== مرحله ۱ ===================== */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full">
                      
                      <div className="flex p-1 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl mb-6">
                        <button onClick={() => setView('login')} className={cn("flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all font-sans cursor-pointer", view === 'login' ? "bg-[#06b6d4] text-gray-900 shadow-md" : "text-gray-400 hover:text-white hover:bg-white/[0.05]")}>ورود به حساب</button>
                        <button onClick={() => setView('register')} className={cn("flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all font-sans cursor-pointer", view === 'register' ? "bg-[#06b6d4] text-gray-900 shadow-md" : "text-gray-400 hover:text-white hover:bg-white/[0.05]")}>ثبت‌نام جدید</button>
                      </div>

                      <div className="text-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5 font-sans cursor-default select-none">{view === 'login' ? 'به مکتوم خوش آمدید!' : 'عضویت در مکتوم'}</h2>
                        <p className="text-xs md:text-sm text-gray-400 font-light font-sans">{view === 'login' ? 'اطلاعات کاربری خود را وارد کنید.' : 'با مکتوم به دنیای محتوا متصل شوید.'}</p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="relative">
                          <input 
                            type="tel" 
                            dir="ltr" 
                            placeholder="۰۹..." 
                            value={toPersianDigits(phone)} 
                            onChange={handlePhoneChange} 
                            disabled={isLoading} 
                            className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl py-3.5 px-4 pl-10 text-left text-base md:text-lg font-bold tracking-widest text-white outline-none focus:bg-white/[0.06] focus:border-cyan-400/50 transition-all font-sans" 
                          />
                          <Icon name="phone" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        </div>

                        {(view === 'register' || (view === 'login' && loginType === 'password')) && (
                          <div className="relative">
                            {/* رمز عبور به صورت انگلیسی نگه داشته شده است */}
                            <input 
                              type={showPassword ? "text" : "password"} 
                              dir="ltr" 
                              placeholder="رمز عبور" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              disabled={isLoading} 
                              className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl py-3.5 px-4 pl-10 text-left text-sm md:text-base font-bold tracking-widest text-white outline-none focus:bg-white/[0.06] focus:border-cyan-400/50 transition-all font-sans" 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1">
                              <Icon name={showPassword ? "eyeOff" : "eye"} className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                            </button>
                          </div>
                        )}

                        {view === 'register' && (
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              dir="ltr" 
                              placeholder="تکرار رمز عبور" 
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              disabled={isLoading} 
                              className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl py-3.5 px-4 pl-10 text-left text-sm md:text-base font-bold tracking-widest text-white outline-none focus:bg-white/[0.06] focus:border-cyan-400/50 transition-all font-sans" 
                            />
                            <Icon name="password" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <button onClick={handleMainSubmit} disabled={isLoading} className="w-full bg-[#06b6d4] border border-transparent shadow-[0_5px_20px_rgba(6,182,212,0.3)] text-gray-900 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-[#0891b2] hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 cursor-pointer font-sans flex items-center justify-center gap-2">
                        {isLoading ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : view === 'register' ? 'تایید و دریافت پیامک' : (loginType === 'password' ? 'ورود به حساب' : 'دریافت رمز یکبار مصرف')}
                      </button>

                      {view === 'login' && (
                        <div className="mt-5 flex items-center justify-between text-[11px] md:text-xs text-cyan-400 font-sans font-bold">
                          <button onClick={() => setLoginType(loginType === 'password' ? 'otp' : 'password')} className="hover:text-white transition-colors cursor-pointer">
                            {loginType === 'password' ? 'ورود با پیامک' : 'ورود با رمز عبور'}
                          </button>
                          {loginType === 'password' && (
                            <button onClick={() => setLoginType('otp')} className="hover:text-white transition-colors cursor-pointer text-gray-400">فراموشی رمز</button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ===================== مرحله ۲ ===================== */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full text-center">
                      <div className="mb-5 flex justify-center"><Icon name="password" className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse" /></div>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 font-sans">تایید شماره موبایل</h2>
                      <p className="text-xs md:text-sm text-gray-400 font-light mb-8 font-sans">کد ارسال شده به <span dir="ltr" className="text-cyan-400 font-bold ml-1">{toPersianDigits(phone)}</span> را وارد کنید.</p>

                      <div className="flex items-center justify-center gap-2 w-full mb-8" dir="ltr">
                        {otp.map((digit, idx) => (
                          <input 
                            key={idx} 
                            ref={(el) => (otpRefs.current[idx] = el)} 
                            type="tel" 
                            maxLength={1} 
                            value={toPersianDigits(digit)} 
                            onChange={(e) => handleOtpChange(idx, e.target.value)} 
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)} 
                            disabled={isLoading} 
                            className="w-10 h-12 md:w-12 md:h-14 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] rounded-xl text-center text-lg md:text-xl font-bold text-white outline-none focus:bg-white/[0.08] focus:border-cyan-400/50 transition-all disabled:opacity-50 font-sans" 
                          />
                        ))}
                      </div>

                      <button onClick={() => handleSubmitOtp()} disabled={isLoading} className="w-full bg-[#06b6d4] border border-transparent shadow-[0_5px_20px_rgba(6,182,212,0.3)] text-gray-900 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-[#0891b2] hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 cursor-pointer font-sans flex items-center justify-center gap-2">
                        {isLoading ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : 'تایید و ادامه'}
                      </button>

                      <div className="w-full flex items-center justify-between mt-6 px-1 text-xs text-gray-400">
                        <button onClick={() => setStep(1)} disabled={isLoading} className="hover:text-cyan-400 transition-colors cursor-pointer font-sans font-bold flex items-center gap-1"><Icon name="arrowRight" className="w-3.5 h-3.5" /> اصلاح شماره</button>
                        {timer > 0 ? (
                          <span className="font-sans font-bold dir-ltr bg-white/[0.05] backdrop-blur-sm border border-white/[0.05] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] px-3 py-1.5 rounded-lg">
                            {toPersianDigits(formatTime(timer))}
                          </span>
                        ) : (
                          <button onClick={handleSendOtp} disabled={isLoading} className="text-cyan-400 font-bold hover:text-white transition-colors cursor-pointer">ارسال مجدد کد</button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ===================== مرحله ۳ ===================== */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-full text-center py-6 md:py-8">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <Icon name="check" className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      </motion.div>
                      <h2 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 font-sans">عملیات موفق!</h2>
                      <p className="text-xs md:text-sm text-gray-300 font-light font-sans mb-6 md:mb-8 leading-relaxed">با موفقیت وارد حساب کاربری خود شدید.</p>
                      <div className="flex items-center justify-center gap-2 md:gap-3 text-cyan-400 text-[11px] md:text-xs font-bold font-sans">
                        <Icon name="loading" className="w-4 h-4 animate-spin" />
                        <span>در حال ورود به داشبورد...</span>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}