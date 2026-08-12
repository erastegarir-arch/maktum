'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import Icon from './Icon';

const cn = (...inputs) => twMerge(clsx(inputs));

const BaseSkeleton = ({ className = "" }) => (
  <div className={cn("relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm rounded-xl", className)}>
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onCloseRef.current?.();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setStep(1);
      setPhone('');
      setOtp(['', '', '', '', '']);
      setIsInitializing(true);
      
      const initTimer = setTimeout(() => {
        setIsInitializing(false);
      }, 400);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(initTimer);
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
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
    if (e.key === 'Enter' && phone.length >= 3 && !isLoading) {
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
        handleSubmitOtp();
      }, 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitPhone = async () => {
    if (phone.length < 3 || isLoading) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setStep(2);
    setTimer(120);
    toast.success('کد تایید ارسال شد');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleSubmitOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success('با موفقیت وارد شدید!');
    onLoginSuccess?.();
    onCloseRef.current?.();
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={() => !isLoading && onCloseRef.current?.()}
      >
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md glass-card rounded-[32px] overflow-hidden p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-t-2 border-t-amber-500/50"
        >
          <div className="absolute inset-0 pointer-events-none rounded-inherit z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)]" />

          <button 
            onClick={() => onCloseRef.current?.()} 
            disabled={isLoading}
            className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-20 disabled:opacity-50 cursor-pointer"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>

          {isInitializing ? (
            <div className="py-6 space-y-6 flex flex-col items-center">
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
                    className="w-full text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mb-6 mx-auto border border-white/10">
                      <Icon name="fingerprint" className="w-8 h-8 text-amber-500" />
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-left text-lg text-white outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                      />
                    </div>

                    <button 
                      onClick={handleSubmitPhone}
                      disabled={phone.length < 3 || isLoading}
                      className="w-full bg-amber-500 text-black py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
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
                    className="w-full text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mb-6 mx-auto border border-white/10">
                      <Icon name="password" className="w-8 h-8 text-cyan-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">تایید هویت</h2>
                    <p className="text-sm text-gray-400 font-light mb-8">
                      کد ارسال شده به <span dir="ltr" className="text-cyan-400">{phone}</span> را وارد کنید.
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
                          className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white outline-none focus:border-cyan-400 transition-all disabled:opacity-50"
                        />
                      ))}
                    </div>

                    <button 
                      onClick={handleSubmitOtp}
                      disabled={isLoading}
                      className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? <Icon name="loading" className="w-6 h-6 animate-spin mx-auto" /> : 'تایید و ورود'}
                    </button>

                    <div className="w-full flex items-center justify-between mt-6 text-xs text-gray-400">
                      <button onClick={() => setStep(1)} disabled={isLoading} className="hover:text-white transition-colors cursor-pointer">
                        اصلاح شماره
                      </button>
                      <span>{formatTime(timer)}</span>
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