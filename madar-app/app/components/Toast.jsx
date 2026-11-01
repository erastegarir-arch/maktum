'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon'; // فرض بر این است که Icon در همین پوشه است

let triggerToast = null;

export const showToast = (title, message, type = 'info', duration = 4000) => {
    if (triggerToast) {
        triggerToast({ title, message, type, duration, id: Date.now() });
    }
};

const TOAST_TYPES = {
    info: { color: '#06b6d4', icon: 'info' },
    success: { color: '#10b981', icon: 'checkCircle' },
    error: { color: '#f43f5e', icon: 'warning' },
    warning: { color: '#f59e0b', icon: 'warningCircle' }
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        triggerToast = (newToast) => {
            setToasts((prev) => [...prev, newToast]);
            setTimeout(() => removeToast(newToast.id), newToast.duration);
        };
        return () => triggerToast = null;
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

   return (
        // کلاس bottom-4 در موبایل به bottom-28 تغییر یافت تا بالاتر از نوار قرار گیرد
        <div className="fixed bottom-36 md:bottom-8 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-[9999] flex flex-col gap-3 w-full px-4 md:px-0 md:w-auto md:max-w-md pointer-events-none font-sans" dir="rtl">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const theme = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full overflow-hidden bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(255,255,255,0.02)] p-4 pr-12 rounded-2xl flex items-start pointer-events-auto"
                        >
                            {/* آیکون نوع پیام */}
                            <div className="absolute right-4 top-4 text-xl" style={{ color: theme.color }}>
                                <Icon name={theme.icon} className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0 pr-2 pb-1">
                                {toast.title && <h4 className="text-sm font-bold text-white mb-1 leading-snug drop-shadow-md">{toast.title}</h4>}
                                {toast.message && <p className="text-[11px] md:text-xs text-gray-300 font-light leading-relaxed">{toast.message}</p>}
                            </div>

                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="absolute left-3 top-3 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer border border-transparent shadow-inner"
                            >
                                <Icon name="close" className="w-3 h-3" />
                            </button>

                            {/* نوار پیشرفت */}
                            <motion.div 
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                                className="absolute bottom-0 inset-x-0 h-[2px]"
                                style={{ backgroundColor: theme.color }}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}