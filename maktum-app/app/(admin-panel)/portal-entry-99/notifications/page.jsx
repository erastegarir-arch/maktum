'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import MediaLibraryPage from '@/app/(admin-panel)/portal-entry-99/media/page';
import RichTextEditor from '@/app/components/RichTextEditor';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

import { 
  saveAndDispatchNotificationAction, 
  getAdminNotificationsListAction,
  updateNotificationAction,
  deleteNotificationAction,
  getNotificationViewersAction,
  toggleNotificationTemplateStatusAction 
} from '@/app/actions/notifications';

// ============================================================================
// توابع کمکی و کامپوننت‌های پایه
// ============================================================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const IRAN_PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری",
  "خراسان جنوبی", "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان", "لرستان",
  "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px rgba(15, 23, 42, 0.6) inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

const Tooltip = ({ children, text }) => (
  <div className="relative group/tooltip flex items-center justify-center select-none">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
      <div className="bg-[#0f172a]/95 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-bold font-sans border border-white/10">
        {text}
      </div>
    </div>
  </div>
);

// ============================================================================
// کامپوننت اصلی
// ============================================================================
export default function AdminNotificationsPage() {
  
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
      // بررسی اینکه کاربر حداقل یکی از مجوزهای اعلانات را داشته باشد
      setHasAccess(!!(user?.isSuperAdmin || (canAny && canAny(['NOTIF_CREATE', 'NOTIF_DELETE']))));
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
  const [activeTab, setActiveTab] = useState('CAMPAIGN'); 
  const [isSaving, setIsSaving] = useState(false);

  // استیت‌های فرم اصلی
  const [audienceType, setAudienceType] = useState('ALL'); 
  const [manualPhones, setManualPhones] = useState('');
  const [filters, setFilters] = useState({ province: 'ALL', gender: 'ALL' });
  const [themeColor, setThemeColor] = useState('#10b981');
  const [iconUrl, setIconUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaButtons, setCtaButtons] = useState([]);
  
  // استیت‌های گزارشات و لیست‌ها
  const [rawHistoryList, setRawHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL'); 
  const [readFilter, setReadFilter] = useState('ALL'); // این خط اضافه شد
  const [sortOrder, setSortOrder] = useState('NEWEST');

  // استیت‌های مودال‌ها
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); 
  const [editorInstance, setEditorInstance] = useState(null);
  
  const [editModalData, setEditModalData] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  
  const [viewersModalData, setViewersModalData] = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [viewersList, setViewersList] = useState([]);
  const [viewersPage, setViewersPage] = useState(1);
  const [viewersFilter, setViewersFilter] = useState('ALL'); 
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);
  const [viewersTotalPages, setViewersTotalPages] = useState(1);

  const loadTemplateIntoForm = async () => {
    const res = await getAdminNotificationsListAction();
    if (res.success && Array.isArray(res.data)) {
      setRawHistoryList(res.data);
      const activeWelcome = res.data.find(n => n.isTemplate && n.triggerEvent === 'WELCOME') || res.data.find(n => n.isTemplate && n.isActive);
      if (activeWelcome) {
        let parsedCta = [];
        try {
          parsedCta = typeof activeWelcome.ctaButtons === 'string' ? JSON.parse(activeWelcome.ctaButtons) : (activeWelcome.ctaButtons || []);
          if (typeof parsedCta === 'string') parsedCta = JSON.parse(parsedCta);
        } catch {
          parsedCta = [];
        }
        setTitle(activeWelcome.title || '');
        setThemeColor(activeWelcome.themeColor || '#8b5cf6');
        setIconUrl(activeWelcome.iconUrl || '');
        setCoverUrl(activeWelcome.coverUrl || '');
        setBodyHtml(activeWelcome.bodyHtml || '');
        setCtaButtons(Array.isArray(parsedCta) ? parsedCta : []);
        return;
      }
    }
    // مقادیر پیش‌فرض در صورتی که هنوز هیچ الگوی خوش‌آمدگویی در دیتابیس ثبت نشده باشد
    setTitle('به پایگاه مکتوم خوش‌آمدید! 🌟');
    setThemeColor('#8b5cf6');
    setIconUrl('');
    setCoverUrl('');
    setBodyHtml('<p>سلام! حضور شما را در <strong>پایگاه مکتوم</strong> گرامی می‌داریم. ما در اینجا تلاش می‌کنیم تا بهترین تجربه و محتوا را در اختیار شما قرار دهیم. برای شروع، پیشنهاد می‌کنیم پروفایل خود را تکمیل کرده و از بخش‌های مختلف سایت دیدن کنید.</p>');
    setCtaButtons([{ id: 'default1', label: 'تکمیل پروفایل', url: '/profile' }]);
  };

  useEffect(() => {
    if (!hasAccess) return;

    if (activeTab === 'HISTORY') loadHistory();
    
    if (activeTab === 'TEMPLATE') {
      loadTemplateIntoForm();
    } else if (activeTab === 'CAMPAIGN') {
      resetForm();
    }
  }, [activeTab, hasAccess]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const res = await getAdminNotificationsListAction();
    if (res.success) setRawHistoryList(res.data);
    setIsLoadingHistory(false);
  };

  const loadViewers = async (notifId, page = 1, filter = 'ALL') => {
    setIsLoadingViewers(true);
    const res = await getNotificationViewersAction(notifId, page, 10, filter);
    if (res.success) {
      setViewersList(res.data);
      setViewersTotalPages(res.pagination.totalPages);
      setViewersPage(page);
    }
    setIsLoadingViewers(false);
  };

  const openViewersModal = (notif) => {
    setViewersModalData(notif);
    setViewersFilter('ALL');
    loadViewers(notif.id, 1, 'ALL');
  };

  const openLivePreviewModal = (notif) => {
    let parsedCta = [];
    try {
      parsedCta = typeof notif.ctaButtons === 'string' ? JSON.parse(notif.ctaButtons) : (notif.ctaButtons || []);
      if (typeof parsedCta === 'string') parsedCta = JSON.parse(parsedCta); 
    } catch {
      parsedCta = [];
    }
    
    setLivePreviewData({
      ...notif,
      themeColor: notif.themeColor || '#10b981',
      iconUrl: notif.iconUrl || '',
      coverUrl: notif.coverUrl || '',
      ctaButtons: Array.isArray(parsedCta) ? parsedCta : []
    });
  };

  const addCtaButton = () => setCtaButtons(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), label: '', url: '' }]);
  const updateCtaButton = (id, field, value) => setCtaButtons(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  const removeCtaButton = (id) => setCtaButtons(prev => prev.filter(b => b.id !== id));

  // توابع مدیریت دکمه‌های اقدام (CTA) در مودال ویرایش
  const addEditCtaButton = () => setEditModalData(prev => ({
    ...prev,
    ctaButtons: [...(prev.ctaButtons || []), { id: Math.random().toString(36).substr(2, 9), label: '', url: '' }]
  }));
  const updateEditCtaButton = (id, field, value) => setEditModalData(prev => ({
    ...prev,
    ctaButtons: (prev.ctaButtons || []).map(b => b.id === id ? { ...b, [field]: value } : b)
  }));
  const removeEditCtaButton = (id) => setEditModalData(prev => ({
    ...prev,
    ctaButtons: (prev.ctaButtons || []).filter(b => b.id !== id)
  }));

  const handleOpenMediaForEditor = (editor) => {
    setEditorInstance(editor);
    setMediaPickerTarget('editor');
  };

  const resetForm = () => {
    setManualPhones(''); setTitle(''); setBodyHtml(''); setCtaButtons([]); setIconUrl(''); setCoverUrl(''); setThemeColor('#10b981');
  };

  const handleSaveAndDispatch = async (e) => {
    e.preventDefault();
    if (!can('NOTIF_CREATE')) return toast.error('شما مجوز ارسال اعلان جدید را ندارید.');
    if (!title) return toast.error('درج عنوان اعلان الزامی است.');

    setIsSaving(true);
    const payload = {
      type: activeTab === 'TEMPLATE' ? 'SYSTEM' : 'BULK',
      isTemplate: activeTab === 'TEMPLATE',
      triggerEvent: activeTab === 'TEMPLATE' ? 'WELCOME' : null,
      audienceType,
      manualPhones,
      filters,
      title,
      bodyHtml,
      themeColor,
      iconUrl,
      coverUrl,
      ctaButtons,
    };

    const res = await saveAndDispatchNotificationAction(payload);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      if (activeTab !== 'TEMPLATE') resetForm();
    } else {
      toast.error(res.error);
    }
  };

  const openEditModal = (h) => {
    if (!can('NOTIF_CREATE')) return toast.error('شما مجوز ویرایش اعلانات را ندارید.');
    let parsedCta = [];
    try {
      parsedCta = typeof h.ctaButtons === 'string' ? JSON.parse(h.ctaButtons) : (h.ctaButtons || []);
      if (typeof parsedCta === 'string') parsedCta = JSON.parse(parsedCta); 
    } catch (e) {
      parsedCta = [];
    }
    setEditModalData({
      ...h,
      themeColor: h.themeColor || '#10b981',
      iconUrl: h.iconUrl || '',
      coverUrl: h.coverUrl || '',
      ctaButtons: Array.isArray(parsedCta) ? parsedCta : []
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!can('NOTIF_CREATE')) return toast.error('شما مجوز ویرایش اعلانات را ندارید.');
    if (!editModalData.title) return toast.error('عنوان نمی‌تواند خالی باشد.');
    
    setIsSaving(true);
    const res = await updateNotificationAction(editModalData.id, editModalData);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      setEditModalData(null);
      loadHistory();
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!can('NOTIF_DELETE')) return toast.error('شما مجوز حذف اعلانات را ندارید.');
    setIsSaving(true);
    const res = await deleteNotificationAction(deleteModalId);
    setIsSaving(false);
    
    if (res.success) {
      toast.success(res.message);
      setDeleteModalId(null);
      loadHistory();
    } else {
      toast.error(res.error);
    }
  };

  const toggleTemplateStatus = async (id, currentStatus) => {
    if (!can('NOTIF_CREATE')) return toast.error('شما مجوز تغییر وضعیت این الگو را ندارید.');
    const res = await toggleNotificationTemplateStatusAction(id, currentStatus);
    if (res.success) {
      toast.success(res.message);
      loadHistory();
    } else {
      toast.error(res.error);
    }
  };

  const filteredHistory = useMemo(() => {
    let list = [...rawHistoryList];
    if (historyFilter === 'BULK') list = list.filter(n => !n.isTemplate);
    if (historyFilter === 'TEMPLATE') list = list.filter(n => n.isTemplate);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.triggerEvent && n.triggerEvent.toLowerCase().includes(q)) ||
        (n.bodyHtml && n.bodyHtml.toLowerCase().includes(q))
      );
    }

    // منطق جدید: فیلتر بر اساس وضعیت بازدید
    if (readFilter === 'FULLY_READ') {
      list = list.filter(n => n.targetCount > 0 && n.readCount === n.targetCount);
    } else if (readFilter === 'NONE_READ') {
      list = list.filter(n => n.targetCount > 0 && n.readCount === 0);
    } else if (readFilter === 'PARTIALLY_READ') {
      list = list.filter(n => n.targetCount > 0 && n.readCount > 0 && n.readCount < n.targetCount);
    }

    if (sortOrder === 'NEWEST') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'OLDEST') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'MOST_VIEWS') {
      list.sort((a, b) => b.readCount - a.readCount);
    }

    return list;
  }, [rawHistoryList, historyFilter, searchQuery, sortOrder, readFilter]);


  // ==========================================
  // ۳. کنترل رندر لودینگ و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null) return <AdminLoading />;

  if (hasAccess === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <Icon name="lock" className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
        <p className="text-gray-400">شما مجوز لازم برای ارسال و مدیریت اعلانات را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-20 font-sans text-right select-none relative">
      
      {/* ======================= هدر استودیو ======================= */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden group border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3 font-sans drop-shadow-md">
              <Icon name="bell" className="w-7 h-7 text-[#8b5cf6]" /> مدیریت اعلانات
            </h1>
            <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl leading-relaxed font-sans">
              طراحی، زمان‌بندی و ارسال هوشمند اعلان به داشبورد کاربران سایت
            </p>
          </div>
          
          <div className="flex flex-wrap bg-[#050810]/50 p-1.5 rounded-2xl shadow-inner w-full lg:w-auto border border-white/5">
            <button onClick={() => setActiveTab('CAMPAIGN')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer border border-transparent ${activeTab === 'CAMPAIGN' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm border-[#8b5cf6]/30' : 'text-gray-400 hover:text-white'}`}>ارسال لیستی</button>
            <button onClick={() => setActiveTab('TEMPLATE')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer border border-transparent ${activeTab === 'TEMPLATE' ? 'bg-[#f59e0b]/20 text-[#f59e0b] shadow-sm border-[#f59e0b]/30' : 'text-gray-400 hover:text-white'}`}>خوش‌آمدگویی</button>
            <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer border border-transparent ${activeTab === 'HISTORY' ? 'bg-[#06b6d4]/20 text-[#06b6d4] shadow-sm border-[#06b6d4]/30' : 'text-gray-400 hover:text-white'}`}>آمار و وضعیت</button>
          </div>
        </div>
      </motion.div>

      {/* ======================= تب گزارشات و تاریخچه ======================= */}
      {activeTab === 'HISTORY' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl">
          <div className="p-6 border-b border-white/10 bg-[#050810]/50 flex flex-col xl:flex-row justify-between items-center gap-4 shadow-inner">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans whitespace-nowrap">
              <Icon name="trend" className="w-5 h-5 text-[#06b6d4]" /> پیگیری اعلانات
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl shadow-inner">
                <button onClick={() => setHistoryFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent ${historyFilter === 'ALL' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>همه</button>
                <button onClick={() => setHistoryFilter('BULK')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent ${historyFilter === 'BULK' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm' : 'text-gray-400 hover:text-white'}`}>لیستی</button>
                <button onClick={() => setHistoryFilter('TEMPLATE')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent ${historyFilter === 'TEMPLATE' ? 'bg-[#f59e0b]/20 text-[#f59e0b] shadow-sm' : 'text-gray-400 hover:text-white'}`}>خوش‌آمدگویی</button>
              </div>

              {/* دراپ‌داون جدید برای فیلتر وضعیت بازدید */}
              <div className="relative flex-1 sm:flex-none sm:w-36">
                <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#06b6d4] appearance-none cursor-pointer select-none">
                  <option value="ALL">وضعیت بازدید</option>
                  <option value="FULLY_READ">همه دیده‌اند</option>
                  <option value="PARTIALLY_READ">برخی دیده‌اند</option>
                  <option value="NONE_READ">هیچکس ندیده</option>
                </select>
                <Icon name="caretDown" className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:flex-none sm:w-36">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#06b6d4] appearance-none cursor-pointer select-none">
                  <option value="NEWEST">جدیدترین‌ها</option>
                  <option value="OLDEST">قدیمی‌ترین‌ها</option>
                  <option value="MOST_VIEWS">بیشترین بازدید</option>
                </select>
                <Icon name="caretDown" className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              <div className="relative w-full sm:w-56">
                <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="جستجو (عنوان/متن)..." 
                  className="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none focus:border-[#06b6d4] select-text transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar p-6">
            <table className="w-full text-sm text-right text-gray-300 border-separate border-spacing-y-2 select-none">
              <thead className="text-[11px] text-gray-400 uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-r-xl font-bold min-w-[200px] border-l border-white/5">مشخصات اعلان</th>
                  <th className="px-4 py-3 font-bold text-center min-w-[100px] border-l border-white/5">نوع ارسال</th>
                  <th className="px-4 py-3 font-bold text-center min-w-[130px] border-l border-white/5">وضعیت (نسخه)</th>
                  <th className="px-4 py-3 font-bold text-center min-w-[130px] border-l border-white/5">وضعیت بازدید</th>
                  <th className="px-4 py-3 font-bold text-center rounded-l-xl min-w-[150px]">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  <tr><td colSpan="5" className="text-center py-16"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#06b6d4]" /></td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-16 text-gray-400 font-bold font-sans bg-black/20 rounded-xl shadow-inner">هیچ گزارشی یافت نشد.</td></tr>
                ) : (
                  filteredHistory.map(h => (
                    <tr key={h.id} className="bg-black/20 hover:bg-white/5 transition-colors group shadow-inner">
                      
                      {/* ستون ۱: مشخصات */}
                      <td className="px-4 py-3 rounded-r-xl border-y border-transparent group-hover:border-white/5 border-l border-l-white/5">
                        <span className="block text-white font-bold font-sans mb-1 text-sm select-none">{h.title || 'بدون عنوان'}</span>
                        <span className="text-[10px] text-gray-500 font-sans flex items-center gap-1 select-none">
                          <Icon name="calendar" className="w-3 h-3" />
                          {toPersianDigits(new Date(h.createdAt).toLocaleDateString('fa-IR'))} - {toPersianDigits(new Date(h.createdAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}))}
                        </span>
                      </td>
                      
                      {/* ستون ۲: نوع ارسال */}
                      <td className="px-4 py-3 text-center border-y border-transparent group-hover:border-white/5 border-l border-l-white/5">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border shadow-inner ${h.isTemplate ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                          {h.isTemplate ? `خوش‌آمدگویی` : 'ارسال لیستی'}
                        </span>
                      </td>
                      
                      {/* ستون ۳: وضعیت و نسخه */}
                      <td className="px-4 py-3 text-center border-y border-transparent group-hover:border-white/5 border-l border-l-white/5">
                        <span className="text-gray-500 text-[10px] font-sans font-bold leading-relaxed block">
                          ارسال شد<br/>
                          <span className="text-[9px] text-amber-500/70">
                            (نسخه: {toPersianDigits(new Date(h.createdAt).toLocaleDateString('fa-IR'))} - {toPersianDigits(new Date(h.createdAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}))})
                          </span>
                        </span>
                      </td>
                      
                      {/* ستون ۴: وضعیت بازدید اختصاصی */}
                      <td className="px-4 py-3 text-center border-y border-transparent group-hover:border-white/5 border-l border-l-white/5">
                        {h.isTemplate ? (
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            {h.readCount > 0 ? (
                              <>
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                                  <Icon name="check" className="w-3.5 h-3.5" /> دیده شده
                                </span>
                                <span className="text-[9px] text-gray-500 font-sans font-bold">
                                  {toPersianDigits(new Date(h.readAt || h.updatedAt || h.createdAt).toLocaleDateString('fa-IR'))} - {toPersianDigits(new Date(h.readAt || h.updatedAt || h.createdAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}))}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 bg-gray-500/10 px-2 py-1 rounded-lg border border-gray-500/20 shadow-inner">
                                <Icon name="clock" className="w-3.5 h-3.5" /> دیده نشده
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-xs font-sans">
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/20 shadow-inner">
                              <Icon name="eye" className="w-3.5 h-3.5" /> دیده شده: {toPersianDigits(h.readCount)}
                            </span>
                            <span className="text-gray-400 text-[9px] mt-1.5 select-none">
                              از مجموع: {toPersianDigits(h.targetCount)} کاربر
                            </span>
                          </div>
                        )}
                      </td>
                      
                      {/* ستون ۵: عملیات (دقیقاً وسط‌چین) */}
                      <td className="px-4 py-3 rounded-l-xl border-y border-transparent group-hover:border-white/5 border-r-0">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* دکمه پیش‌نمایش برای همه مدیرانی که حق دیدن لیست را دارند مجاز است */}
                          <Tooltip text="پیش‌نمایش اعلان">
                            <button onClick={() => openLivePreviewModal(h)} className="p-1.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                              <Icon name="eye" className="w-4 h-4" />
                            </button>
                          </Tooltip>

                          {!h.isTemplate && (
                            <>
                              <Tooltip text="ریز بازدیدها">
                                <button onClick={() => openViewersModal(h)} className="p-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                                  <Icon name="users" className="w-4 h-4" />
                                </button>
                              </Tooltip>
                              {can('NOTIF_CREATE') && (
                                <Tooltip text="ویرایش اعلان">
                                  <button onClick={() => openEditModal(h)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                                    <Icon name="pencil" className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              )}
                            </>
                          )}

                          {h.isTemplate && can('NOTIF_CREATE') && (
                             <Tooltip text="ویرایش قالب">
                               <button onClick={() => openEditModal(h)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                                 <Icon name="pencil" className="w-4 h-4" />
                               </button>
                             </Tooltip>
                          )}

                          {can('NOTIF_DELETE') && (
                            <Tooltip text="حذف کامل">
                              <button onClick={() => setDeleteModalId(h.id)} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                                <Icon name="trash" className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ======================= تب‌های فرم‌ساز اصلی ======================= */}
      {(activeTab === 'CAMPAIGN' || activeTab === 'TEMPLATE') && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          
          {/* ستون راست: استودیو فرم‌ساز */}
          <div className="xl:col-span-7 space-y-6">
            <form id="notificationForm" onSubmit={handleSaveAndDispatch} className="space-y-6">
              
              {/* بخش ۱: تنظیمات مخاطبین / خوش‌آمدگویی */}
              {activeTab === 'CAMPAIGN' ? (
                <div className="relative rounded-2xl shadow-lg bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-5 space-y-5">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                    <Icon name="users" className="w-5 h-5 text-[#8b5cf6]" /> ۱. انتخاب مخاطبان هدف
                  </h2>
                  <div className="flex bg-[#050810]/50 border border-white/5 p-1 rounded-xl font-sans shadow-inner">
                    <button type="button" onClick={() => setAudienceType('ALL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent ${audienceType === 'ALL' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm' : 'text-gray-400 hover:text-white'}`}>همه کاربران</button>
                    <button type="button" onClick={() => setAudienceType('FILTERED')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent ${audienceType === 'FILTERED' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm' : 'text-gray-400 hover:text-white'}`}>فیلتر استانی/جنسیتی</button>
                    <button type="button" onClick={() => setAudienceType('MANUAL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent ${audienceType === 'MANUAL' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-sm' : 'text-gray-400 hover:text-white'}`}>شماره‌های دستی</button>
                  </div>

                  {audienceType === 'FILTERED' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease-out]">
                      <div>
                        <label className="block text-[11px] text-gray-300 mb-2 font-sans">فیلتر استان</label>
                        <select value={filters.province} onChange={e => setFilters({...filters, province: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-[#8b5cf6] font-sans shadow-inner select-none transition-all">
                          <option value="ALL">تمامی استان‌ها</option>
                          <option value="EMPTY">مواردی که استان ندارند</option>
                          <option value="EMPTY">مواردی که استان ندارند</option>
                          {IRAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-300 mb-2 font-sans">فیلتر جنسیت</label>
                        <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-[#8b5cf6] font-sans shadow-inner select-none transition-all">
                          <option value="ALL">همه</option>
                          <option value="EMPTY">نامشخص</option>
                          <option value="MALE">مرد</option>
                          <option value="FEMALE">زن</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {audienceType === 'MANUAL' && (
                    <div className="animate-[fadeIn_0.3s_ease-out] space-y-2">
                      <label className="block text-[11px] text-gray-300 font-sans">شماره موبایل‌های ثبت‌شده در دیتابیس را وارد کنید (هر خط یک شماره)</label>
                      <textarea rows="4" value={manualPhones} onChange={e => setManualPhones(e.target.value)} dir="ltr" placeholder="0912...&#10;0919..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white text-sm font-sans focus:border-[#8b5cf6] outline-none resize-none text-left shadow-inner select-text transition-all" style={autofillFixStyle}></textarea>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-2xl shadow-lg bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-5 space-y-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                    <Icon name="update" className="w-5 h-5 text-[#f59e0b]" /> ۱. تنظیمات خوش‌آمدگویی
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-gray-300 cursor-not-allowed shadow-inner select-none">
                      ارسال خودکار پس از عضویت در سایت یا افزودن توسط ادمین (هر تغییر جدید برای اعضای جدید اعمال می‌شود و پیام اعضای قدیمی دست‌نخورده می‌ماند)
                    </div>
                  </div>
                </div>
              )}

              {/* بخش ۲: طراحی ظاهر و محتوای اعلان */}
              <div className="relative rounded-2xl shadow-lg bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-5 space-y-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 font-sans">
                  <Icon name="browser" className="w-5 h-5 text-emerald-400" /> ۲. طراحی و محتوای اعلان داشبورد
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] text-gray-300 font-sans">عنوان پیام (اجباری)</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: خبر ویژه برای شما..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-[#8b5cf6] font-sans shadow-inner select-text transition-all" style={autofillFixStyle} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] text-gray-300 font-sans">رنگ سازمانی (تم کارت)</label>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1.5 rounded-xl shadow-inner">
                      <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                      <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-full bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-sans tracking-widest select-text" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] text-gray-300 font-sans">آیکون شاخص (مربع کوچک)</label>
                    {iconUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl shadow-inner">
                        <img src={iconUrl} alt="icon" className="w-8 h-8 object-contain rounded" />
                        <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-[#8b5cf6] rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر</button>
                        <button type="button" onClick={() => setIconUrl('')} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="w-full py-3 bg-black/40 border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans shadow-inner">
                        <Icon name="image" className="w-4 h-4" /> انتخاب تصویر
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] text-gray-300 font-sans">بنر یا کاور بالای اعلان (اختیاری)</label>
                    {coverUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl shadow-inner">
                        <img src={coverUrl} alt="cover" className="w-12 h-8 object-cover rounded" />
                        <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-[#8b5cf6] rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر بنر</button>
                        <button type="button" onClick={() => setCoverUrl('')} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="w-full py-3 bg-black/40 border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans shadow-inner">
                        <Icon name="image" className="w-4 h-4" /> آپلود بنر
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-gray-300 font-sans">متن و توضیحات کامل پیام</label>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                    <RichTextEditor 
                      value={bodyHtml} 
                      onChange={setBodyHtml} 
                      activeTheme={{ color: `text-[${themeColor}]` }}
                      onOpenMedia={handleOpenMediaForEditor} 
                      placeholder="متن اعلان را بنویسید (پشتیبانی از ویدیو و عکس)..."
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] text-gray-300 font-sans">دکمه‌های اقدام (Call to Action)</label>
                    <button type="button" onClick={addCtaButton} className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer font-sans shadow-sm border border-transparent">+ افزودن دکمه</button>
                  </div>
                  {ctaButtons.map((btn) => (
                    <div key={btn.id} className="flex flex-col sm:flex-row gap-2 p-2 bg-[#050810]/50 border border-white/5 rounded-xl relative pr-10 shadow-inner">
                      <button type="button" onClick={() => removeCtaButton(btn.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                      <input type="text" placeholder="عنوان دکمه (مثال: مشاهده)" value={btn.label} onChange={e => updateCtaButton(btn.id, 'label', e.target.value)} className="w-full sm:w-1/3 bg-black/40 border border-transparent rounded-lg p-2 text-xs text-white outline-none font-sans focus:border-[#8b5cf6] select-text transition-all" />
                      <input type="text" placeholder="لینک مستقیم (http://...)" value={btn.url} onChange={e => updateCtaButton(btn.id, 'url', e.target.value)} className="w-full sm:flex-1 bg-black/40 border border-transparent rounded-lg p-2 text-xs text-white outline-none dir-ltr text-right font-sans focus:border-[#8b5cf6] select-text transition-all" />
                    </div>
                  ))}
                </div>

              </div>
            </form>
          </div>

          {/* ستون چپ: پیش‌نمایش زنده */}
          <div className="xl:col-span-5 space-y-6">
            <div className="sticky top-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2 border-b border-[#8b5cf6] pb-2 font-sans">
                  <Icon name="eye" className="w-5 h-5 text-[#8b5cf6]" /> پیش‌نمایش در پنل کاربر
                </h3>
                <button form="notificationForm" type="submit" disabled={isSaving || !can('NOTIF_CREATE')} className="px-6 py-2.5 bg-gradient-to-l from-[#8b5cf6] to-indigo-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 font-sans border border-transparent">
                  {isSaving ? <Icon name="loading" className="w-4 h-4 animate-spin" /> : <Icon name="rocket" className="w-4 h-4" />}
                  {isSaving ? 'در حال اجرا...' : (activeTab === 'TEMPLATE' ? 'ذخیره خوش‌آمدگویی' : 'پخش اعلان')}
                </button>
              </div>

              {/* کارت گرافیکی پیش‌نمایش کاملاً گلس مورفیک و شناور */}
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
                  
                  {/* Container با نورهای متحرک */}
                  <div className="relative rounded-[2rem] p-4 sm:p-6 overflow-hidden bg-[#050810] border border-white/5 shadow-2xl group flex items-center justify-center min-h-[300px]">
                    
                    {/* نورهای تپنده و شناور پس‌زمینه */}
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }} 
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} 
                      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[45px] pointer-events-none" 
                      style={{ backgroundColor: themeColor }} 
                    />
                    <motion.div 
                      animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }} 
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} 
                      className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-[55px] pointer-events-none" 
                      style={{ backgroundColor: themeColor }} 
                    />

                    {/* کادر شیشه‌ای محتوا (Glass Card) */}
                    <div className="relative w-full z-10 bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-5 border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
                      {coverUrl && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/50 shadow-inner">
                          <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex gap-4 mb-4 items-center">
                        {iconUrl ? (
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm"><img src={iconUrl} className="w-7 h-7 object-contain" /></div>
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm"><Icon name="bell" className="w-6 h-6 text-gray-400" /></div>
                        )}
                        <div>
                          <h4 className="font-bold text-base text-white mb-1.5 font-sans leading-tight select-none">{title || 'عنوان اعلان در اینجا...'}</h4>
                          <span className="text-[10px] text-gray-400 font-sans bg-white/5 px-2 py-0.5 rounded-full border border-white/5 select-none">همین الان - خوانده نشده</span>
                        </div>
                      </div>
                      <div className="rich-text text-sm text-gray-300 leading-loose font-light line-clamp-4 font-sans bg-black/20 p-3 rounded-xl border border-white/5 select-none">
                        {bodyHtml ? <div dangerouslySetInnerHTML={{ __html: bodyHtml }} /> : 'متن و محتوای پیام شما به این شکل نمایش داده خواهد شد...'}
                      </div>
                      
                      {ctaButtons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
                          {ctaButtons.map(btn => (
                            <span key={btn.id} className="text-xs px-4 py-2 rounded-xl text-white font-bold font-sans shadow-md select-none cursor-default" style={{ backgroundColor: themeColor, boxShadow: `0 4px 15px ${themeColor}40` }}>
                              {btn.label || 'دکمه اقدام'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
                                مودال‌های پاپ‌آپ پیشرفته در پورتال
          ============================================================================ */}

      {/* ۱. مودال لیست بازدیدکنندگان (Read Receipts) */}
      <AnimatePresence>
        {viewersModalData && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans" onClick={() => setViewersModalData(null)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl h-[80vh] bg-[#0f172a]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0">
                  <div>
                    <h3 className="text-white font-bold text-lg font-sans select-none">گزارش بازدید: {viewersModalData.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 select-none">مشاهده وضعیت دریافت‌کنندگان در داشبورد</p>
                  </div>
                  <button onClick={() => setViewersModalData(null)} className="p-2 text-gray-400 hover:text-rose-500 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                
                <div className="p-4 flex gap-2 bg-[#050810]/50 border-b border-white/5 shrink-0 shadow-inner">
                  <button onClick={() => { setViewersFilter('ALL'); loadViewers(viewersModalData.id, 1, 'ALL'); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border border-transparent ${viewersFilter === 'ALL' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white'}`}>همه ({toPersianDigits(viewersModalData.targetCount)})</button>
                  <button onClick={() => { setViewersFilter('READ'); loadViewers(viewersModalData.id, 1, 'READ'); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border border-transparent ${viewersFilter === 'READ' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white'}`}>دیده شده ({toPersianDigits(viewersModalData.readCount)})</button>
                  <button onClick={() => { setViewersFilter('UNREAD'); loadViewers(viewersModalData.id, 1, 'UNREAD'); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border border-transparent ${viewersFilter === 'UNREAD' ? 'bg-gray-500/20 text-gray-300 shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white'}`}>دیده نشده ({toPersianDigits(Math.max(0, viewersModalData.targetCount - viewersModalData.readCount))})</button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                  {isLoadingViewers ? (
                    <div className="flex justify-center py-10"><Icon name="loading" className="w-8 h-8 animate-spin text-[#06b6d4]" /></div>
                  ) : viewersList.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-bold bg-black/20 rounded-xl shadow-inner border border-white/5">رکوردی یافت نشد.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewersList.map(item => (
                        <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#050810] flex items-center justify-center text-gray-500 border border-white/5"><Icon name="user" className="w-5 h-5" /></div>
                            <div>
                              <div className="text-sm text-white font-bold font-sans select-none">{item.user?.firstName} {item.user?.lastName}</div>
                              <div className="text-xs text-gray-400 font-sans dir-ltr select-none">{toPersianDigits(item.user?.phone)}</div>
                            </div>
                          </div>
                          {item.isRead ? (
                            <div className="flex flex-col items-end">
                              <Icon name="check" className="w-5 h-5 text-emerald-400 mb-1" />
                              <span className="text-[9px] text-emerald-400/80 select-none">
                                {toPersianDigits(new Date(item.readAt).toLocaleDateString('fa-IR', {month: 'short', day: 'numeric'}))} - {toPersianDigits(new Date(item.readAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}))}
                              </span>
                            </div>
                          ) : (
                            <Icon name="clock" className="w-5 h-5 text-gray-600" title="هنوز ندیده" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* صفحه‌بندی مودال */}
                {viewersTotalPages > 1 && (
                  <div className="p-4 border-t border-white/10 bg-[#050810]/50 flex items-center justify-center gap-2 shrink-0 shadow-inner">
                    <button disabled={viewersPage === 1} onClick={() => loadViewers(viewersModalData.id, viewersPage - 1, viewersFilter)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 border border-transparent cursor-pointer hover:bg-white/20 transition-colors">قبلی</button>
                    <span className="text-xs text-gray-400 select-none">صفحه {toPersianDigits(viewersPage)} از {toPersianDigits(viewersTotalPages)}</span>
                    <button disabled={viewersPage === viewersTotalPages} onClick={() => loadViewers(viewersModalData.id, viewersPage + 1, viewersFilter)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white disabled:opacity-30 border border-transparent cursor-pointer hover:bg-white/20 transition-colors">بعدی</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ۲. مودال ویرایش کامل اعلان (عنوان، رنگ، آیکون، کاور، متن و دکمه‌های اقدام) */}
      <AnimatePresence>
        {editModalData && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans" onClick={() => setEditModalData(null)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0">
                  <h3 className="text-white font-bold text-lg font-sans flex items-center gap-2"><Icon name="pencil" className="w-5 h-5 text-blue-400" /> ویرایش کامل اعلان</h3>
                  <button onClick={() => setEditModalData(null)} className="p-2 text-gray-400 hover:text-rose-500 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-6">
                  <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 mb-2">عنوان اعلان</label>
                        <input type="text" value={editModalData.title || ''} onChange={e => setEditModalData({...editModalData, title: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 select-text transition-all shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-2">رنگ سازمانی (تم کارت)</label>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1.5 rounded-xl shadow-inner">
                          <input type="color" value={editModalData.themeColor || '#10b981'} onChange={e => setEditModalData({...editModalData, themeColor: e.target.value})} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                          <input type="text" value={editModalData.themeColor || '#10b981'} onChange={e => setEditModalData({...editModalData, themeColor: e.target.value})} className="w-full bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-sans tracking-widest select-text" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-300">آیکون شاخص (مربع کوچک)</label>
                        {editModalData.iconUrl ? (
                          <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl shadow-inner">
                            <img src={editModalData.iconUrl} alt="icon" className="w-8 h-8 object-contain rounded" />
                            <button type="button" onClick={() => setMediaPickerTarget('edit_iconUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-blue-500 rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر</button>
                            <button type="button" onClick={() => setEditModalData({...editModalData, iconUrl: ''})} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setMediaPickerTarget('edit_iconUrl')} className="w-full py-3 bg-black/40 border border-dashed border-white/20 hover:border-blue-500 text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans shadow-inner">
                            <Icon name="image" className="w-4 h-4" /> انتخاب تصویر
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs text-gray-300">بنر یا کاور بالای اعلان (اختیاری)</label>
                        {editModalData.coverUrl ? (
                          <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl shadow-inner">
                            <img src={editModalData.coverUrl} alt="cover" className="w-12 h-8 object-cover rounded" />
                            <button type="button" onClick={() => setMediaPickerTarget('edit_coverUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-blue-500 rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر بنر</button>
                            <button type="button" onClick={() => setEditModalData({...editModalData, coverUrl: ''})} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setMediaPickerTarget('edit_coverUrl')} className="w-full py-3 bg-black/40 border border-dashed border-white/20 hover:border-blue-500 text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans shadow-inner">
                            <Icon name="image" className="w-4 h-4" /> آپلود بنر
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-2">متن اعلان</label>
                      <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden shadow-inner">
                        <RichTextEditor 
                          value={editModalData.bodyHtml || ''} 
                          onChange={val => setEditModalData({...editModalData, bodyHtml: val})} 
                          activeTheme={{ color: `text-[${editModalData.themeColor || '#10b981'}]` }}
                          onOpenMedia={handleOpenMediaForEditor} 
                          placeholder="توضیحات..." 
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs text-gray-300 font-sans">دکمه‌های اقدام (Call to Action)</label>
                        <button type="button" onClick={addEditCtaButton} className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer font-sans shadow-sm border border-transparent">+ افزودن دکمه</button>
                      </div>
                      {(editModalData.ctaButtons || []).map((btn) => (
                        <div key={btn.id} className="flex flex-col sm:flex-row gap-2 p-2 bg-[#050810]/50 border border-white/5 rounded-xl relative pr-10 shadow-inner">
                          <button type="button" onClick={() => removeEditCtaButton(btn.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                          <input type="text" placeholder="عنوان دکمه (مثال: مشاهده)" value={btn.label || ''} onChange={e => updateEditCtaButton(btn.id, 'label', e.target.value)} className="w-full sm:w-1/3 bg-black/40 border border-transparent rounded-lg p-2 text-xs text-white outline-none font-sans focus:border-blue-500 select-text transition-all" />
                          <input type="text" placeholder="لینک مستقیم (http://...)" value={btn.url || ''} onChange={e => updateEditCtaButton(btn.id, 'url', e.target.value)} className="w-full sm:flex-1 bg-black/40 border border-transparent rounded-lg p-2 text-xs text-white outline-none dir-ltr text-right font-sans focus:border-blue-500 select-text transition-all" />
                        </div>
                      ))}
                    </div>

                  </form>
                </div>
                
                <div className="p-5 border-t border-white/10 bg-[#050810]/80 flex justify-end gap-3 shrink-0 shadow-inner">
                  <button onClick={() => setEditModalData(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-bold text-sm cursor-pointer border border-transparent transition-colors">انصراف</button>
                  <button form="editForm" type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2 disabled:opacity-50 cursor-pointer border border-transparent transition-all">
                    {isSaving && <Icon name="loading" className="w-4 h-4 animate-spin" />} بروزرسانی اعلان
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ۳. مودال حذف (Confirmation) */}
      <AnimatePresence>
        {deleteModalId && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans select-none" onClick={() => setDeleteModalId(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-3xl rounded-[2rem] p-6 text-center border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 text-rose-500 shadow-inner"><Icon name="trash" className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-white mb-2 select-none">حذف قطعی اعلان</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed select-none font-sans">آیا از حذف این مورد اطمینان دارید؟ این اعلان بلافاصله از داشبورد تمام کاربران حذف خواهد شد و غیرقابل بازگشت است.</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteConfirm} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer border border-transparent transition-all">{isSaving ? 'در حال حذف...' : 'بله، حذف شود'}</button>
                  <button onClick={() => setDeleteModalId(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm cursor-pointer border border-transparent shadow-inner transition-colors">انصراف</button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ۴. مدیا پیکر */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl font-sans" onClick={() => setMediaPickerTarget(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-transparent shrink-0">
                  <h3 className="text-white font-bold flex items-center gap-2 font-sans"><Icon name="image" className="w-5 h-5 text-[#8b5cf6]" /> کتابخانه رسانه</h3>
                  <button onClick={() => setMediaPickerTarget(null)} className="p-2 text-gray-400 hover:text-rose-500 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-4 h-4" /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                  <MediaLibraryPage
                    isPickerMode={true}
                    onSelectMedia={(media) => {
                      if (mediaPickerTarget === 'iconUrl') setIconUrl(media.url);
                      else if (mediaPickerTarget === 'coverUrl') setCoverUrl(media.url);
                      else if (mediaPickerTarget === 'edit_iconUrl') setEditModalData(prev => ({ ...prev, iconUrl: media.url }));
                      else if (mediaPickerTarget === 'edit_coverUrl') setEditModalData(prev => ({ ...prev, coverUrl: media.url }));
                      else if (mediaPickerTarget === 'editor' && editorInstance) {
                        if (media.type?.includes('video')) editorInstance.commands.insertContent(`<video controls src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;"></video>`);
                        else if (media.type?.includes('audio')) editorInstance.commands.insertContent(`<audio controls src="${media.url}" style="width:100%; margin: 10px 0;"></audio>`);
                        else editorInstance.commands.insertContent(`<img src="${media.url}" style="max-width:100%; border-radius:12px; margin: 10px 0;" alt="Media" />`);
                      }
                      setMediaPickerTarget(null);
                      setEditorInstance(null);
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

        {/* ۵. مودال پیش‌نمایش زنده اعلان (آنچه کاربر می‌بیند) */}
      <AnimatePresence>
        {livePreviewData && (
          <ModalPortal>
            <div className="fixed inset-0 z-[140000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setLivePreviewData(null)}></div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-lg z-10"
              >
                <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-2">
                  <span className="text-white text-sm font-bold opacity-80 flex items-center gap-2"><Icon name="eye" className="w-4 h-4"/> پیش‌نمایش کاربری</span>
                  <button onClick={() => setLivePreviewData(null)} className="p-2 bg-white/10 hover:bg-rose-500 rounded-full text-white cursor-pointer transition-colors shadow-lg border border-white/10"><Icon name="close" className="w-4 h-4" /></button>
                </div>

                <div className="relative rounded-[2rem] p-4 sm:p-6 overflow-hidden bg-[#050810] border border-white/5 shadow-2xl group flex items-center justify-center min-h-[300px]">
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }} 
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} 
                      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[45px] pointer-events-none" 
                      style={{ backgroundColor: livePreviewData.themeColor }} 
                    />
                    <motion.div 
                      animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }} 
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} 
                      className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-[55px] pointer-events-none" 
                      style={{ backgroundColor: livePreviewData.themeColor }} 
                    />

                    <div className="relative w-full z-10 bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-5 border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
                      {livePreviewData.coverUrl && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/50 shadow-inner">
                          <img src={livePreviewData.coverUrl} alt="cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex gap-4 mb-4 items-center">
                        {livePreviewData.iconUrl ? (
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm"><img src={livePreviewData.iconUrl} className="w-7 h-7 object-contain" /></div>
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm"><Icon name="bell" className="w-6 h-6 text-gray-400" /></div>
                        )}
                        <div>
                          <h4 className="font-bold text-base text-white mb-1.5 font-sans leading-tight select-text">{livePreviewData.title}</h4>
                          <span className="text-[10px] text-gray-400 font-sans bg-white/5 px-2 py-0.5 rounded-full border border-white/5 select-none">لحظاتی پیش - خوانده نشده</span>
                        </div>
                      </div>
                      <div className="rich-text text-sm text-gray-300 leading-loose font-light line-clamp-4 font-sans bg-black/20 p-3 rounded-xl border border-white/5 select-text">
                        {livePreviewData.bodyHtml ? <div dangerouslySetInnerHTML={{ __html: livePreviewData.bodyHtml }} /> : ''}
                      </div>
                      
                      {livePreviewData.ctaButtons && livePreviewData.ctaButtons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
                          {livePreviewData.ctaButtons.map((btn, i) => (
                            <span key={i} className="text-xs px-4 py-2 rounded-xl text-white font-bold font-sans shadow-md select-none cursor-default" style={{ backgroundColor: livePreviewData.themeColor, boxShadow: `0 4px 15px ${livePreviewData.themeColor}40` }}>
                              {btn.label || 'دکمه اقدام'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}