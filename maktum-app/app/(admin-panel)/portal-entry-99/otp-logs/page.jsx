'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';
import { useAuth } from '@/app/hooks/useAuth';
import { getOtpLogsAction, deleteOtpLogAction, clearAllOtpLogsAction } from '@/app/actions/admin-otp';

// ==========================================
// توابع کمکی
// ==========================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const safeDateTimeStr = (dateVal) => {
  if (!dateVal) return 'نامشخص';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'نامشخص';
    return toPersianDigits(`${d.toLocaleDateString('fa-IR')} - ساعت ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`);
  } catch { return 'نامشخص'; }
};

// ==========================================
// کامپوننت تول‌تیپ اختصاصی (هماهنگ با تم گلس)
// ==========================================
const Tooltip = ({ children, text, position = 'bottom-full mb-1.5' }) => (
  <div className="relative group/tooltip flex items-center justify-center print-hide z-40 select-none">
    {children}
    <div className={`absolute ${position} hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.15s_ease-out] pointer-events-none`}>
      <div className="bg-[#0f172a]/95 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-bold font-sans border border-white/10">
        {text}
      </div>
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#0f172a]/95"></div>
    </div>
  </div>
);

// ==========================================
// صفحه اصلی تاریخچه
// ==========================================
export default function OtpLogsPage() {
  const { user, can, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(null);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setHasAccess(false);
      return;
    }
    setHasAccess(user.isSuperAdmin || can('OTP_LOGS_VIEW'));
  }, [authLoading, user, can]);

  const loadData = async () => {
    setLoading(true);
    const res = await getOtpLogsAction();
    if (res.success) {
      setLogs(res.data);
    } else {
      toast.error(res.error || 'خطا در دریافت فهرست');
    }
    setLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    if (hasAccess === true) loadData();
  }, [hasAccess]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('کد در بریده‌دان رونوشت شد.');
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف گزارش پیامک',
      message: 'آیا از حذف این سابقه اطمینان دارید؟ این عمل غیرقابل بازگشت است.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        setIsProcessing(true);
        const res = await deleteOtpLogAction(id);
        if (res.success) {
          toast.success(res.message);
          loadData();
        } else {
          toast.error(res.error);
        }
        setIsProcessing(false);
      }
    });
  };

  const handleClearAll = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'پاکسازی کل تاریخچه',
      message: 'توجه: با این کار تمام سوابق کدهای ارسال شده برای همه کاربران پاک خواهد شد. آیا مطمئن هستید؟',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        setIsProcessing(true);
        const res = await clearAllOtpLogsAction();
        if (res.success) {
          toast.success(res.message);
          setLogs([]);
        } else {
          toast.error(res.error);
        }
        setIsProcessing(false);
      }
    });
  };

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'REGISTER': return { text: 'ثبت‌نام', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'LOGIN': return { text: 'ورود سریع', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'FORGOT_PASSWORD': return { text: 'فراموشی گذرواژه‌', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default: return { text: 'نامشخص', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
    }
  };

  if (!isMounted || authLoading || hasAccess === null) return <AdminLoading />;

  if (hasAccess === false) {
    return (
          <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
              <Icon name="lock" className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
            <p className="text-gray-400">شما مجوز ورود به این بخش از درگاه را ندارید.</p>
          </div>
        );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 font-sans text-right select-none pb-20">
      {/* هدر صفحه */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden group border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3 font-sans">
              <Icon name="message" className="w-7 h-7 text-[#8b5cf6]" /> تاریخچه پیامک‌های ورود
            </h1>
            <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl leading-relaxed font-sans">
              در زمان اختلال سامانه پیامک، می‌توانید کدهای ارسالی را از اینجا مشاهده کرده و به کاربران اعلام کنید.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={loadData} disabled={loading} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent shadow-inner disabled:opacity-50">
              <Icon name={loading ? "loading" : "refresh"} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> بروزرسانی
            </button>
            <button onClick={handleClearAll} disabled={isProcessing || logs.length === 0} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/20 shadow-inner disabled:opacity-50">
              <Icon name="trash" className="w-4 h-4" /> پاکسازی همه
            </button>
          </div>
        </div>
      </motion.div>

      {/* محتوای اصلی - ریسپانسیو: جدول برای دسکتاپ، فیش برای موبایل */}
      <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] min-h-[500px] border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl overflow-hidden">
          
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Icon name="loading" className="w-10 h-10 animate-spin text-[#8b5cf6]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Icon name="message" className="w-16 h-16 opacity-30 mb-4" />
              <p className="font-bold">هیچ درخواستی ثبت نشده است.</p>
            </div>
          ) : (
            <>
              {/* نمایش جدولی برای کامپیوتر */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar p-2">
                <table className="w-full text-sm text-right text-gray-400 border-separate border-spacing-y-2">
                  <thead className="text-[11px] text-gray-400 uppercase bg-transparent">
                    <tr>
                      <th className="px-6 py-4 font-bold font-sans">شماره موبایل</th>
                      <th className="px-6 py-4 font-bold font-sans text-center">کد تولید شده</th>
                      <th className="px-6 py-4 font-bold font-sans text-center">دلیل درخواست</th>
                      <th className="px-6 py-4 font-bold font-sans text-center">وضعیت ارسال</th>
                      <th className="px-6 py-4 font-bold font-sans text-center">استفاده شده</th>
                      <th className="px-6 py-4 font-bold font-sans text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const purposeInfo = getPurposeLabel(log.purpose);
                      return (
                        <tr key={log.id} className="bg-[#050810]/40 hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 rounded-r-xl border border-transparent group-hover:border-white/5 border-l-0">
                            <div className="font-bold text-white text-base tracking-widest" dir="ltr">{toPersianDigits(log.phone)}</div>
                            <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3"/> {safeDateTimeStr(log.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5 text-center">
                            <div className="inline-flex items-center gap-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 px-3 py-1.5 rounded-xl shadow-inner">
                              <span className="font-bold text-[#8b5cf6] text-lg tracking-widest leading-none">{toPersianDigits(log.code)}</span>
                              <Tooltip text="رونوشت گرفتن از کد">
                                <button onClick={() => handleCopyCode(log.code)} className="text-[#8b5cf6] hover:text-white transition-colors cursor-pointer border-r border-[#8b5cf6]/20 pr-2 mr-1">
                                  <Icon name="copy" className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5 text-center">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border shadow-inner ${purposeInfo.color}`}>{purposeInfo.text}</span>
                          </td>
                          <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5 text-center">
                            {log.isSuccess ? (
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-1 w-max mx-auto shadow-inner"><Icon name="checkCircle" className="w-3 h-3"/> ارسال موفق</span>
                            ) : (
                              <Tooltip text={log.errorMsg || 'خطای نامشخص'}>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center gap-1 w-max mx-auto shadow-inner cursor-help"><Icon name="close" className="w-3 h-3"/> ناموفق</span>
                              </Tooltip>
                            )}
                          </td>
                          <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5 text-center">
                            {log.isUsed ? (
                              <Tooltip text="کاربر با این کد وارد شده است"><div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20"><Icon name="check" className="w-4 h-4"/></div></Tooltip>
                            ) : (
                              <Tooltip text="هنوز وارد نشده است"><div className="w-6 h-6 rounded-full bg-gray-500/10 text-gray-500 flex items-center justify-center mx-auto border border-gray-500/20"><span className="w-2.5 h-0.5 bg-gray-500 rounded-full"></span></div></Tooltip>
                            )}
                          </td>
                          <td className="px-6 py-4 rounded-l-xl border border-transparent group-hover:border-white/5 border-r-0 text-left">
                            <Tooltip text="حذف سابقه">
                              <button onClick={() => handleDelete(log.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner inline-flex">
                                <Icon name="trash" className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* نمایش فیشی برای موبایل */}
              <div className="md:hidden flex flex-col gap-3 p-4">
                {logs.map(log => {
                  const purposeInfo = getPurposeLabel(log.purpose);
                  return (
                    <div key={log.id} className="bg-[#050810]/60 border border-white/5 rounded-2xl p-4 shadow-inner">
                      <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                        <div>
                          <div className="font-bold text-white text-base tracking-widest mb-1" dir="ltr">{toPersianDigits(log.phone)}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1"><Icon name="calendarBlank" className="w-3 h-3"/> {safeDateTimeStr(log.createdAt)}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border shadow-inner shrink-0 ${purposeInfo.color}`}>{purposeInfo.text}</span>
                      </div>

                      <div className="flex justify-between items-center bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 p-3 rounded-xl mb-4 shadow-inner">
                        <span className="text-[11px] text-[#8b5cf6]/70 font-bold">کد:</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#8b5cf6] text-xl tracking-widest">{toPersianDigits(log.code)}</span>
                          <button onClick={() => handleCopyCode(log.code)} className="p-1.5 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white rounded-lg transition-colors border border-[#8b5cf6]/20 cursor-pointer">
                            <Icon name="copy" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {log.isSuccess ? (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shadow-inner"><Icon name="checkCircle" className="w-3 h-3"/> ارسال موفق</span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 shadow-inner"><Icon name="close" className="w-3 h-3"/> ناموفق: {log.errorMsg || 'خطا'}</span>
                          )}

                          {log.isUsed && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 shadow-inner"><Icon name="check" className="w-3 h-3"/> استفاده شد</span>}
                        </div>
                        <button onClick={() => handleDelete(log.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* مودال تایید حذف */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center border border-white/10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-inner bg-rose-500/10 text-rose-500">
                  <Icon name="trash" className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans">{confirmModal.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-8 font-sans">{confirmModal.message}</p>
                <div className="flex gap-3">
                  <button onClick={confirmModal.onConfirm} disabled={isProcessing} className="flex-1 py-3 text-white rounded-xl text-sm font-bold transition-all cursor-pointer font-sans border border-transparent bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)] disabled:opacity-50">
                    بله، حذف کن
                  </button>
                  <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })} disabled={isProcessing} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors cursor-pointer font-sans border border-transparent shadow-inner disabled:opacity-50">
                    انصراف
                  </button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}