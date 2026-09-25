'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import Icon from '../Icon';
import { sendOtpAction, verifyOtpAction } from '@/app/actions/auth'; 

const cn = (...inputs) => twMerge(clsx(inputs));

const BaseSkeleton = ({ className = "" }) => (
  <div className={cn("relative overflow-hidden bg-white/5 border border-transparent shadow-inner backdrop-blur-sm rounded-xl", className)}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
  </div>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [timer, setTimer] = useState(120);
  
  const cardRef = useRef(null);
  const otpRefs = useRef([]);
  
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // مدیریت باز شدن و ریست فرم
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setPhone('');
      setOtp(['', '', '', '', '']);
      setIsInitializing(true);
      
      const initTimer = setTimeout(() => {
        setIsInitializing(false);
      }, 400);

      return () => {
        clearTimeout(initTimer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // مدیریت دکمه بستن (Escape)
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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) setPhone(value);
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Enter' && phone.length >= 10 && !isLoading) {
      handleSubmitPhone();
    }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }

    const isComplete = newOtp.every((digit) => digit !== '');
    if (isComplete && !isLoading) {
      setTimeout(() => {
        handleSubmitOtp(newOtp.join(''));
      }, 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitPhone = async () => {
    if (phone.length < 10 || isLoading) {
      if (phone.length > 0 && phone.length < 10) toast.error('شماره موبایل باید ۱۱ رقم باشد.');
      return;
    }
    
    setIsLoading(true);
    const res = await sendOtpAction(phone);
    setIsLoading(false);

    if (!res.success) {
      if (res.error === 'BANNED') {
        toast.error('دسترسی حساب کاربری شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید.', { duration: 5000 });
      } else {
        toast.error(res.error || 'خطا در ارسال کد.');
      }
      return; 
    }

    setStep(2);
    setTimer(120);
    toast.success('کد ارسال شد (جهت تست: 12345 وارد کنید)');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleSubmitOtp = async (codeString) => {
    if (isLoading) return;
    setIsLoading(true);
    
    const code = codeString || otp.join('');
    const res = await verifyOtpAction(phone, code);

    if (!res.success) {
      setIsLoading(false);
      toast.error(res.error || 'کد وارد شده اشتباه است.');
      setOtp(['', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }

    // تغییر استیت به مرحله ۳ (موفقیت‌آمیز) به جای بستن سریع
    setStep(3);
    
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('isLoggedIn', 'true');
      onLoginSuccess?.();
      onCloseRef.current?.();
    }, 2000); // دو ثانیه مکث برای تماشای انیمیشن ورود موفق
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
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050810]/70 backdrop-blur-xl p-4"
        onClick={() => !isLoading && step !== 3 && onCloseRef.current?.()}
      >
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md rounded-[32px] overflow-hidden p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-transparent group"
        >
          {/* پس‌زمینه گلس‌مورفیسم مودال */}
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />

          {/* خط نوری بالای مودال (همیشه فیروزه‌ای) */}
          <div 
            className="absolute top-0 inset-x-0 h-[2px] transition-all duration-500 opacity-90 z-20 pointer-events-none"
            style={{ 
              background: `linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)` 
            }}
          />
          {/* هاله نوری متمرکز در بالا */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#06b6d4] opacity-20 blur-[50px] pointer-events-none -z-10" />

          <div className="absolute inset-0 pointer-events-none rounded-[32px] z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.06),transparent_40%)]" />

          {/* دکمه بستن (در مرحله سوم مخفی می‌شود) */}
          {step !== 3 && (
            <button 
              onClick={() => onCloseRef.current?.()} 
              disabled={isLoading}
              className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 border border-transparent shadow-inner flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20 disabled:opacity-50 cursor-pointer"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
          )}

          {isInitializing ? (
            <div className="py-6 space-y-6 flex flex-col items-center relative z-10">
              <BaseSkeleton className="w-16 h-16 rounded-full" />
              <div className="w-full space-y-3">
                <BaseSkeleton className="w-full h-12" />
              </div>
              <BaseSkeleton className="w-full h-14" />
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <AnimatePresence mode="wait">
                
                {/* ===================== مرحله ۱: وارد کردن شماره ===================== */}
                {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    transition={{ duration: 0.3 }}
                    className="w-full text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <Icon name="fingerprint" className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 font-sans">ورود به شبکه مدار</h2>
                    <p className="text-sm text-gray-400 font-light mb-8 font-sans">شماره موبایل خود را جهت دریافت کد وارد کنید.</p>

                    <div className="w-full relative mb-6">
                      <input 
                        type="tel" 
                        dir="ltr" 
                        autoFocus 
                        placeholder="09..." 
                        value={phone}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        disabled={isLoading}
                        className="w-full bg-white/10 border border-transparent shadow-inner rounded-xl py-4 px-4 text-left text-lg font-bold tracking-widest text-white outline-none focus:bg-white/20 focus:border-cyan-400/50 transition-all disabled:opacity-50 font-sans"
                      />
                    </div>

                    <button 
                      onClick={handleSubmitPhone}
                      disabled={phone.length < 10 || isLoading}
                      className="w-full bg-[#06b6d4] border border-transparent shadow-[0_5px_20px_rgba(6,182,212,0.3)] text-white py-4 rounded-xl font-bold text-base hover:bg-[#0891b2] hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 cursor-pointer font-sans flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : 'دریافت کد تایید'}
                    </button>

                    <p className="mt-8 text-[11px] text-gray-500 font-sans font-light leading-relaxed">
                      ورود و عضویت شما در شبکه مدار به منزله مطالعه و پذیرش کامل{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-bold">
                        قوانین و مقررات
                      </a>
                      {' '}است.
                    </p>
                  </motion.div>
                )}

                {/* ===================== مرحله ۲: وارد کردن کد تایید ===================== */}
                {step === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    transition={{ duration: 0.3 }}
                    className="w-full text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <Icon name="password" className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 font-sans">تایید هویت</h2>
                    <p className="text-sm text-gray-400 font-light mb-8 font-sans">
                      کد ارسال شده به شماره <span dir="ltr" className="text-cyan-400 font-sans font-bold ml-1">{phone}</span> را وارد کنید.
                    </p>

                    <div className="flex items-center justify-center gap-3 w-full mb-8" dir="ltr">
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
                          className="w-14 h-16 bg-white/10 border border-transparent shadow-inner rounded-2xl text-center text-2xl font-bold text-white outline-none focus:bg-white/20 focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 font-sans"
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => handleSubmitOtp()}
                      disabled={isLoading}
                      className="w-full bg-[#06b6d4] border border-transparent shadow-[0_5px_20px_rgba(6,182,212,0.3)] text-white py-4 rounded-xl font-bold text-base hover:bg-[#0891b2] hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 cursor-pointer font-sans flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Icon name="loading" className="w-5 h-5 animate-spin" /> : 'تایید و ورود به حساب'}
                    </button>

                    <div className="w-full flex items-center justify-between mt-6 px-1 text-xs text-gray-400">
                      <button onClick={() => setStep(1)} disabled={isLoading} className="hover:text-cyan-400 transition-colors cursor-pointer font-sans font-bold flex items-center gap-1">
                        <Icon name="arrowRight" className="w-3.5 h-3.5" /> اصلاح شماره
                      </button>
                      <span className="font-sans font-bold dir-ltr bg-white/5 px-3 py-1.5 rounded-lg shadow-inner">{formatTime(timer)}</span>
                    </div>
                  </motion.div>
                )}

                {/* ===================== مرحله ۳: موفقیت و انتقال ===================== */}
                {step === 3 && (
                  <motion.div 
                    key="step3" 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-full text-center py-8"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                      <Icon name="check" className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    </motion.div>

                    <h2 className="text-2xl font-black text-white mb-3 font-sans">خوش آمدید!</h2>
                    <p className="text-sm text-gray-400 font-light font-sans mb-8">ورود شما با موفقیت انجام شد.</p>

                    <div className="flex items-center justify-center gap-3 text-cyan-400 text-xs font-bold font-sans">
                      <Icon name="loading" className="w-4 h-4 animate-spin" />
                      <span>در حال انتقال به داشبورد...</span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}