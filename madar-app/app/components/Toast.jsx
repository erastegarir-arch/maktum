'use client';

import React, { useState, useEffect } from 'react';

// تابع کمکی سراسری برای فراخوانی توست از هر جای برنامه
let triggerToast = null;

export const showToast = (title, message, type = 'info', duration = 4000) => {
    if (triggerToast) {
        triggerToast({ title, message, type, duration, id: Date.now() });
    }
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // ثبت شنونده برای دریافت درخواست‌های نمایش توست
        triggerToast = (newToast) => {
            setToasts((prev) => [...prev, newToast]);

            // بستن خودکار پس از اتمام زمان
            setTimeout(() => {
                removeToast(newToast.id);
            }, newToast.duration);
        };

        return () => {
            triggerToast = null;
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="madar-toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`madar-toast ${toast.type}`}>
                    <div className="madar-toast-content">
                        <span className="madar-toast-title">{toast.title}</span>
                        <span className="madar-toast-message">{toast.message}</span>
                    </div>
                    <button 
                        className="madar-toast-close" 
                        onClick={() => removeToast(toast.id)}
                    >
                        &times;
                    </button>
                    <div 
                        className="madar-toast-progress" 
                        style={{ animationDuration: `${toast.duration}ms` }}
                    ></div>
                </div>
            ))}
        </div>
    );
}