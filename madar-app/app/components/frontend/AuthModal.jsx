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
  <div className={cn("relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-xl", className)}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
  </div>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1);
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

  // ==========================================
  // اصلاحیه اول: فقط مدیریت باز شدن و ریست فرم (بدون وابستگی به لودینگ)
  // ==========================================
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

  // ==========================================
  // اصلاحیه دوم: فقط مدیریت دکمه بستن (Escape)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onCloseRef.current?.();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isLoading]);

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
    
    // ارسال واقعی به اکشن بک‌اند
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

    toast.success('ورود با موفقیت انجام شد!');
    
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('isLoggedIn', 'true');
      onLoginSuccess?.();
      onCloseRef.current?.();
    }, 1500); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const currentColor = step === 1 ? '#f59e0b' : '#06b6d4';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
        onClick={() => !isLoading && onCloseRef.current?.()}
      >
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-[32px] overflow-hidden p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] group"
        >
          <div className="absolute inset-0 bg-[#0b0f19]/85 backdrop-blur-xl rounded-[32px] pointer-events-none -z-10" />

          <div 
            className="absolute top-0 inset-x-0 h-[2px] transition-all duration-500 opacity-90 z-20 pointer-events-none"
            style={{ 
              background: `linear-gradient(90deg, transparent 0%, ${currentColor} 50%, transparent 100%)` 
            }}
          />

          <div className="absolute inset-0 pointer-events-none rounded-[32px] z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)]" />

          <button 
            onClick={() => onCloseRef.current?.()} 
            disabled={isLoading}
            className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all z-20 disabled:opacity-50 cursor-pointer"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>

          {isInitializing ? (
            <div className="py-6 space-y-6 flex flex-col items-center relative z-10">
              <BaseSkeleton className="w-16 h-16 rounded-2xl" />
              <div className="w-full space-y-3">
                <BaseSkeleton className="w-full h-12" />
              </div>
              <BaseSkeleton className="w-full h-14" />
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    transition={{ duration: 0.3 }}
                    className="w-full text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:border-amber-500/40 transition-colors duration-300">
                      <Icon name="fingerprint" className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">ورود به شبکه مدار</h2>
                    <p className="text-sm text-gray-400 font-light mb-8">شماره موبایل خود را وارد کنید.</p>

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
                        className="w-full bg-white/5 rounded-xl py-4 px-4 text-left text-lg text-white outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                      />
                    </div>

                    <button 
                      onClick={handleSubmitPhone}
                      disabled={phone.length < 10 || isLoading}
                      className="w-full bg-amber-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? <Icon name="loading" className="w-6 h-6 animate-spin mx-auto" /> : 'دریافت کد تایید'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    transition={{ duration: 0.3 }}
                    className="w-full text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/40 transition-colors duration-300">
                      <Icon name="password" className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">تایید هویت</h2>
                    <p className="text-sm text-gray-400 font-light mb-8">
                      کد ارسال شده به <span dir="ltr" className="text-cyan-400 font-sans font-bold">{phone}</span> را وارد کنید.
                    </p>

                    <div className="flex items-center justify-center gap-2 w-full mb-6" dir="ltr">
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
                          className="w-12 h-14 bg-white/5 rounded-xl text-center text-xl font-bold text-white outline-none focus:border-cyan-400 transition-all disabled:opacity-50"
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => handleSubmitOtp()}
                      disabled={isLoading}
                      className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold text-lg hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? <Icon name="loading" className="w-6 h-6 animate-spin mx-auto" /> : 'تایید و ورود'}
                    </button>

                    <div className="w-full flex items-center justify-between mt-6 text-xs text-gray-400">
                      <button onClick={() => setStep(1)} disabled={isLoading} className="hover:text-white transition-colors cursor-pointer">
                        اصلاح شماره
                      </button>
                      <span className="font-sans dir-ltr">{formatTime(timer)}</span>
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