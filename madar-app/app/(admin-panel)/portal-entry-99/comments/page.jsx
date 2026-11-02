'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon'; 
import toast from 'react-hot-toast';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

import { 
  getAdminCommentsAction, 
  updateCommentStatusAction, 
  saveAdminReplyAction 
} from '@/app/actions/admin-comments';

const toPersianDigits = (num) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, x => farsiDigits[x]) || '۰';
};

const CONTENT_TYPES = {
  BLOG: { label: 'مقاله بلاگ', color: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' },
  PRODUCED: { label: 'محتوای تولیدی', color: 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/20' },
  RAW: { label: 'محتوای خام', color: 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20' },
  TOOL: { label: 'ابزارها', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' },
  UNKNOWN: { label: 'نامشخص', color: 'text-gray-400 bg-white/5' }
};

export default function AdminCommentsPage() {
  
  // ==========================================
  // ۱. منطق احراز هویت بدون پرش (Wait & Verify)
  // ==========================================
  const { user, isLoading: authIsLoading, loading: authLoading, isFetching, can, canAny } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const isWorking = authIsLoading || authLoading || isFetching;
    if (isWorking) return;

    if (user) {
      // فقط مدیرانی که حداقل یکی از تیک‌های مربوط به نظرات را دارند می‌توانند لیست را ببینند
      setHasAccess(user.isSuperAdmin || (canAny && canAny(['COMMENT_APPROVE_REJECT', 'COMMENT_EDIT_REPLY'])));
    } else if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setHasAccess(false);
      } else {
        const timer = setTimeout(() => setHasAccess(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authIsLoading, authLoading, isFetching, canAny]);

  // ==========================================
  // ۲. استیت‌ها و دریافت اطلاعات
  // ==========================================
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('PENDING'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); 

  const [visibleCount, setVisibleCount] = useState(10);
  
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyFormData, setReplyFormData] = useState({ userText: '', adminReply: '', autoApprove: true });

  useEffect(() => {
    setVisibleCount(10);
  }, [statusFilter, searchQuery, typeFilter, sortBy]);

  const loadComments = async () => {
    if (!hasAccess) return;
    setLoading(true);
    const res = await getAdminCommentsAction('ALL');
    if (res.success) {
      setComments(res.data);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasAccess) loadComments();
  }, [hasAccess]);

  const stats = useMemo(() => {
    return {
      total: comments.length,
      pending: comments.filter(c => c.status === 'PENDING').length,
      approved: comments.filter(c => c.status === 'APPROVED').length,
      rejected: comments.filter(c => c.status === 'REJECTED').length,
    };
  }, [comments]);

  const userCommentCounts = useMemo(() => {
    const counts = {};
    comments.forEach(c => {
      if (c.user?.id) counts[c.user.id] = (counts[c.user.id] || 0) + 1;
    });
    return counts;
  }, [comments]);

  const filteredAndSortedComments = useMemo(() => {
    let result = comments.filter(c => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchType = typeFilter === 'ALL' || c.content?.type === typeFilter;
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        c.text?.toLowerCase().includes(searchLower) ||
        c.user?.phone?.includes(searchLower) ||
        `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.toLowerCase().includes(searchLower);

      return matchStatus && matchType && matchSearch;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [comments, statusFilter, typeFilter, searchQuery, sortBy]);

  const visibleComments = filteredAndSortedComments.slice(0, visibleCount);

  const handleQuickStatusChange = async (id, status) => {
    if (!can('COMMENT_APPROVE_REJECT')) return toast.error('شما مجوز تایید یا رد سریع نظرات را ندارید.');
    
    setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    
    const res = await updateCommentStatusAction(id, status);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
      loadComments(); 
    }
  };

  const openReplyModal = (comment) => {
    if (!can('COMMENT_EDIT_REPLY')) return toast.error('شما مجوز ویرایش و پاسخ‌گویی به نظرات را ندارید.');
    
    setSelectedComment(comment);
    setReplyFormData({
      userText: comment.text,
      adminReply: comment.adminReply || '',
      autoApprove: comment.status !== 'APPROVED' 
    });
    setIsReplyModalOpen(true);
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!can('COMMENT_EDIT_REPLY')) return toast.error('شما مجوز ویرایش و پاسخ‌گویی را ندارید.');
    
    const toastId = toast.loading('در حال ثبت اطلاعات...');
    const res = await saveAdminReplyAction(
      selectedComment.id, 
      replyFormData.adminReply, 
      replyFormData.userText, 
      replyFormData.autoApprove
    );

    if (res.success) {
      toast.success(res.message, { id: toastId });
      setIsReplyModalOpen(false);
      loadComments(); 
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  // ==========================================
  // ۳. کنترل رندر لودینگ و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null || (hasAccess && loading)) return <AdminLoading />;

  if (hasAccess === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <Icon name="lock" className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
        <p className="text-gray-400">شما مجوز لازم برای بررسی و مدیریت نظرات را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-right select-none pb-20">
      
      {/* هدر صفحه ادمین */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group border border-transparent bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Icon name="chat" className="w-8 h-8 text-[#8b5cf6]" /> مدیریت نظرات <span className="text-base text-gray-500 font-medium">({toPersianDigits(stats.total)} کل)</span>
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-xl leading-relaxed">
              بررسی، ویرایش کلمات، تایید و پاسخگویی به دیدگاه‌های کاربران در مقالات و محتواهای سه‌گانه.
            </p>
          </div>
          
          {/* تب‌های فیلتر وضعیت با شمارنده */}
          <div className="flex bg-[#050810]/50 p-1.5 rounded-2xl shadow-inner w-full lg:w-auto overflow-x-auto hide-scroll border border-white/5">
            <button onClick={() => setStatusFilter('PENDING')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'PENDING' ? 'bg-[#f59e0b]/20 text-amber-400 border border-[#f59e0b]/30 shadow-md' : 'text-gray-400 hover:text-white'}`}>
              در انتظار بررسی ({toPersianDigits(stats.pending)})
            </button>
            <button onClick={() => setStatusFilter('APPROVED')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-gray-400 hover:text-white'}`}>
              تایید شده ({toPersianDigits(stats.approved)})
            </button>
            <button onClick={() => setStatusFilter('REJECTED')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${statusFilter === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md' : 'text-gray-400 hover:text-white'}`}>
              حذف شده ({toPersianDigits(stats.rejected)})
            </button>
          </div>
        </div>
      </motion.div>

      {/* نوار جستجو و فیلترهای پیشرفته */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-[#0f172a]/40 backdrop-blur-2xl rounded-2xl p-4 shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] border border-transparent flex flex-col md:flex-row gap-4 items-center z-20">
        <div className="relative w-full md:flex-1">
          <Icon name="search" className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در متن نظر، نام یا شماره موبایل کاربر..." 
            className="w-full bg-black/40 rounded-xl py-3 pr-12 pl-4 text-sm text-white outline-none focus:border focus:border-[#8b5cf6] border border-white/5 transition-all shadow-inner select-text"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-black/40 rounded-xl px-4 py-3 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-white/5 shadow-inner appearance-none cursor-pointer flex-1 md:flex-none min-w-[140px]">
            <option value="ALL">همه محتواها</option>
            <option value="BLOG">مقالات بلاگ</option>
            <option value="PRODUCED">محتوای تولیدی</option>
            <option value="RAW">محتوای خام</option>
            <option value="TOOL">ابزارها</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-black/40 rounded-xl px-4 py-3 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-white/5 shadow-inner appearance-none cursor-pointer flex-1 md:flex-none min-w-[140px]">
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
          </select>
        </div>
      </motion.div>

      {/* لیست نظرات */}
      <div className="grid grid-cols-1 gap-4">
        {visibleComments.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 text-gray-500 font-bold bg-[#0f172a]/40 backdrop-blur-xl border border-transparent rounded-3xl shadow-inner">
            <Icon name="chat" className="w-12 h-12 opacity-30" />
            هیچ نظری با این فیلتر یافت نشد.
          </div>
        ) : (
          <>
            {visibleComments.map(comment => {
              const contentType = CONTENT_TYPES[comment.content?.type] || CONTENT_TYPES.UNKNOWN;
              const userTotalComments = userCommentCounts[comment.user?.id] || 1;

              return (
                <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative bg-[#0f172a]/40 backdrop-blur-2xl rounded-2xl p-5 md:p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.4)] border border-transparent hover:border-[#8b5cf6]/30 transition-colors flex flex-col md:flex-row gap-6 group">
                  
                  {/* ستون راست: اطلاعات کاربر و مقاله */}
                  <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 border-b border-white/10 md:border-b-0 md:border-l pb-4 md:pb-0 md:pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/5 shadow-inner flex items-center justify-center shrink-0">
                        <Icon name="user" className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white select-text">
                          {comment.user?.firstName || comment.user?.lastName ? `${comment.user.firstName || ''} ${comment.user.lastName || ''}` : 'بدون نام'}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-sans block mt-0.5 select-text" dir="ltr">{toPersianDigits(comment.user?.phone)}</span>
                        {/* شمارنده نظرات کاربر */}
                        <span className="text-[9px] text-[#8b5cf6] font-bold mt-1 inline-block bg-[#8b5cf6]/10 px-2 py-0.5 rounded border border-[#8b5cf6]/20">
                          ثبت {toPersianDigits(userTotalComments)} نظر در سایت
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#050810]/50 border border-white/5 rounded-xl p-3 relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 h-full w-1 bg-gray-600/50"></div>
                      <span className="text-[10px] text-gray-500 mb-1.5 flex items-center justify-between">
                        ثبت شده در:
                        {/* تگ نوع محتوا */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${contentType.color}`}>
                          {contentType.label}
                        </span>
                      </span>
                      <a href={`/${comment.content?.type === 'BLOG' ? 'blog' : 'p'}/${comment.content?.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#8b5cf6] hover:text-white transition-colors line-clamp-2 leading-relaxed select-text">
                        {comment.content?.titleBase} {comment.content?.titleHighlight}
                      </a>
                      <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1.5 border-t border-white/5 pt-2 select-text">
                        <Icon name="calendarBlank" className="w-3 h-3" />
                        {toPersianDigits(new Date(comment.createdAt).toLocaleDateString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}
                      </div>
                    </div>
                  </div>

                  {/* ستون وسط: متن نظر و وضعیت */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider shadow-inner ${
                        comment.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        comment.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {comment.status === 'APPROVED' ? 'تایید شده' : comment.status === 'REJECTED' ? 'رد شده' : 'در انتظار بررسی'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-loose text-justify mb-4 select-text">
                      {comment.text}
                    </p>

                    {comment.adminReply && (
                      <div className="mt-auto bg-[#050810]/50 border border-white/5 border-r-2 border-r-[#8b5cf6] p-4 rounded-xl relative overflow-hidden shadow-inner">
                        <span className="text-[10px] text-[#8b5cf6] font-bold mb-2 flex items-center gap-1.5 relative z-10 select-none">
                          <Icon name="shieldCheck" className="w-3.5 h-3.5" /> پاسخ مدار:
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed relative z-10 select-text">{comment.adminReply}</p>
                      </div>
                    )}
                  </div>

                  {/* ستون چپ: دکمه‌های اکشن */}
                  <div className="flex md:flex-col gap-2 shrink-0 md:w-36 pt-4 md:pt-0 border-t border-white/10 md:border-t-0 mt-4 md:mt-0">
                    {can('COMMENT_EDIT_REPLY') && (
                      <button onClick={() => openReplyModal(comment)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-[#8b5cf6]/40 shadow-sm cursor-pointer">
                        <Icon name="pencil" className="w-4 h-4" /> ویرایش / پاسخ
                      </button>
                    )}
                    
                    {can('COMMENT_APPROVE_REJECT') && comment.status !== 'APPROVED' && (
                      <button onClick={() => handleQuickStatusChange(comment.id, 'APPROVED')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-emerald-500/40 shadow-sm cursor-pointer">
                        <Icon name="checkCircle" className="w-4 h-4" /> تایید سریع
                      </button>
                    )}
                    
                    {can('COMMENT_APPROVE_REJECT') && comment.status !== 'REJECTED' && (
                      <button onClick={() => handleQuickStatusChange(comment.id, 'REJECTED')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-rose-500/40 shadow-sm cursor-pointer">
                        <Icon name="trash" className="w-4 h-4" /> حذف
                      </button>
                    )}
                  </div>

                </motion.div>
              );
            })}
            
            {/* دکمه نمایش بیشتر */}
            {visibleCount < filteredAndSortedComments.length && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setVisibleCount(v => v + 10)} 
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-transparent shadow-inner cursor-pointer"
                >
                  <Icon name="chevronDown" className="w-4 h-4" /> نمایش موارد بیشتر
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================= */}
      {/* مودال پاسخگویی و ویرایش نظر */}
      <AnimatePresence>
        {isReplyModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none font-sans">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsReplyModalOpen(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-2xl bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
                
                <div className="bg-transparent border-b border-white/10 p-5 flex justify-between items-center shrink-0">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icon name="pencil" className="w-5 h-5 text-[#8b5cf6]" /> ویرایش و پاسخ به دیدگاه
                  </h2>
                  <button onClick={() => setIsReplyModalOpen(false)} className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-xl cursor-pointer transition-colors shadow-inner border border-transparent">
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-2 flex items-center justify-between">
                      <span>متن پیام کاربر (قابل ویرایش در صورت وجود کلمات نامناسب)</span>
                    </label>
                    <textarea 
                      rows="4" 
                      value={replyFormData.userText} 
                      onChange={(e) => setReplyFormData({...replyFormData, userText: e.target.value})} 
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-[#8b5cf6] outline-none leading-relaxed resize-none shadow-inner transition-colors select-text" 
                    />
                  </div>

                  <div className="bg-[#050810]/50 border border-white/5 shadow-inner p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#8b5cf6]"></div>
                    <label className="block text-sm font-bold text-[#8b5cf6] mb-3">پاسخ رسمی مدار به این کاربر</label>
                    <textarea 
                      rows="4" 
                      value={replyFormData.adminReply} 
                      onChange={(e) => setReplyFormData({...replyFormData, adminReply: e.target.value})} 
                      placeholder="پاسخ خود را اینجا بنویسید... (این متن با دیزاین متفاوت زیر نظر کاربر نمایش داده می‌شود)"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] outline-none leading-relaxed resize-none shadow-inner transition-colors select-text" 
                    />
                  </div>

                  {selectedComment?.status !== 'APPROVED' && can('COMMENT_APPROVE_REJECT') && (
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-transparent bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors shadow-inner">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${replyFormData.autoApprove ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 bg-black/40'}`}>
                        {replyFormData.autoApprove && <Icon name="checkCircle" className="w-3 h-3 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={replyFormData.autoApprove} onChange={() => setReplyFormData(prev => ({ ...prev, autoApprove: !prev.autoApprove }))} />
                      <span className="text-sm text-emerald-400 font-bold">همزمان با ثبت پاسخ، این نظر را تایید و منتشر کن.</span>
                    </label>
                  )}

                </div>

                <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end gap-3 shrink-0">
                  <button onClick={() => setIsReplyModalOpen(false)} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors cursor-pointer border border-transparent shadow-inner">انصراف</button>
                  <button onClick={handleSaveReply} disabled={!replyFormData.userText.trim()} className="px-8 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50 border border-transparent">
                    ثبت نهایی و ذخیره
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