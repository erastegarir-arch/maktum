'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import RichTextEditor from '@/app/components/RichTextEditor';
import ModalPortal from '@/app/components/admin/ModalPortal';
import AdminLoading from '@/app/(admin-panel)/loading';
import MediaLibraryComponent from '@/app/components/admin/MediaLibraryComponent';
import { iranLocations } from '@/lib/iranLocations';
import { useAuth } from '@/app/hooks/useAuth';
import { GRANULAR_PERMISSIONS } from '@/lib/rbac';

import { 
  getAllUsersAction, 
  adminCreateUserAction, 
  adminToggleUserStatusAction, 
  adminUpdateUserAction,
  getAdminUserDetailsAction
} from '@/app/actions/admin-users';

import { updateCommentStatusAction, saveAdminReplyAction } from '@/app/actions/admin-comments';
import { saveAndDispatchNotificationAction } from '@/app/actions/notifications';

// ==========================================
// توابع کمکی
// ==========================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const toEnglishDigits = (str) => {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], i);
  }
  return result;
};

const safeDateStr = (dateVal) => {
  if (!dateVal) return 'نامشخص';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'نامشخص';
    return toPersianDigits(d.toLocaleDateString('fa-IR'));
  } catch { return 'نامشخص'; }
};

const safeDateTimeStr = (dateVal) => {
  if (!dateVal) return 'نامشخص';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'نامشخص';
    return toPersianDigits(`${d.toLocaleDateString('fa-IR')} - ساعت ${d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`);
  } catch { return 'نامشخص'; }
};

const safeParse = (val, fallback = []) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try { 
      let parsed = JSON.parse(val); 
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch { return fallback; }
  }
  return fallback;
};

const getContentTypeLabel = (type) => {
  switch(type) {
    case 'BLOG': return { label: 'مقاله بلاگ', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'PRODUCED': return { label: 'محتوای تولیدی', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    case 'RAW': return { label: 'محتوای خام', color: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' };
    case 'TOOL': return { label: 'ابزارها', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    default: return { label: 'محتوا', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
};

const EDUCATION_DEGREES = [
  "زیر دیپلم", "دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکترا", 
  "سطح ۱ حوزوی", "سطح ۲ حوزوی", "سطح ۳ حوزوی", "سطح ۴ حوزوی"
];

const USER_SECTION_PERMISSIONS = [
  'USERS_VIEW',
  'USERS_EXPORT',
  'USERS_CREATE',
  'USERS_EDIT',
  // خط USERS_GRANT_ADMIN از اینجا حذف شد
  'USERS_BAN'
];

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px rgba(15, 23, 42, 0.6) inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

const Tooltip = ({ children, text, position = 'bottom-full mb-2' }) => (
  <div className="relative group/tooltip flex items-center justify-center print-hide z-40 select-none">
    {children}
    <div className={`absolute ${position} hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none`}>
      <div className="bg-[#0f172a] text-white text-[10px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-bold font-sans border border-white/10">
        {text}
      </div>
    </div>
  </div>
);

// ==========================================
// کامپوننت اصلی
// ==========================================
export default function AdminUsersPage() {
  const { user, can, canAny, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false); 
  const [hasAccess, setHasAccess] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); 
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const [selectedUser, setSelectedUser] = useState(null); 
  const [profileTab, setProfileTab] = useState('info');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [userActivityDetails, setUserActivityDetails] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activitySubTab, setActivitySubTab] = useState('COMMENTS'); 
  const [visibleActivityCount, setVisibleActivityCount] = useState(10);

  const [commentReplyModal, setCommentReplyModal] = useState(null);
  const [directNotifModal, setDirectNotifModal] = useState(false);
  const [selectedUserNotif, setSelectedUserNotif] = useState(null);

  const [notifData, setNotifData] = useState({ 
    title: '', 
    bodyHtml: '', 
    themeColor: '#8b5cf6',
    iconUrl: '',
    coverUrl: '',
    ctaButtons: []
  });
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
  const [exportModal, setExportModal] = useState(false);

  const [exportFields, setExportFields] = useState({
    id: true, phone: true, name: true, gender: true, birth: true, 
    location: true, education: true, artField: true, cooperation: true,
    email: true, status: true, joined: true, role: true,
    downloadsCount: true, favoritesCount: true, commentsCount: true
  });

  const provincesList = iranLocations ? Object.keys(iranLocations) : [];
  const availableCities = useMemo(() => {
    if (editFormData.province && iranLocations && iranLocations[editFormData.province]) {
      return iranLocations[editFormData.province];
    }
    return [];
  }, [editFormData.province]);

  const permissionsByCategory = useMemo(() => {
    return GRANULAR_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {});
  }, []);

  // بررسی دقیق سطح دسترسی پس از اتمام لودینگ احراز هویت
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setHasAccess(false);
      return;
    }
    const allowed = user.isSuperAdmin || (canAny && canAny(USER_SECTION_PERMISSIONS));
    setHasAccess(!!allowed);
  }, [authLoading, user, canAny]);

  const loadData = async () => {
    setLoading(true);
    const usersRes = await getAllUsersAction();
    if (usersRes.success) setUsers(usersRes.data);
    else toast.error(usersRes.error || 'خطا در دریافت لیست کاربران');
    setLoading(false);
  };

  useEffect(() => { 
    setIsMounted(true);
    if (hasAccess === true) loadData(); 
  }, [hasAccess]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, typeFilter, statusFilter]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} با موفقیت کپی شد.`);
  };

  const filteredUsers = users.filter(u => {
    // مخفی کردن مدیر کل از دید مدیران پنل (فقط مدیر کل می‌تواند سوپر ادمین‌ها را ببیند)
    if (u.isSuperAdmin && !user?.isSuperAdmin) return false;

    const matchSearch = u.phone.includes(searchQuery) || 
                        (u.firstName && u.firstName.includes(searchQuery)) || 
                        (u.lastName && u.lastName.includes(searchQuery)) ||
                        u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchType = typeFilter === 'ALL' ? true : (typeFilter === 'ADMIN' ? (u.isAdmin || u.isSuperAdmin) : (!u.isAdmin && !u.isSuperAdmin));
    return matchSearch && matchStatus && matchType;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    banned: users.filter(u => u.status === 'BANNED').length,
    newThisWeek: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  const reloadUserActivity = async (userId) => {
    setActivityLoading(true);
    const res = await getAdminUserDetailsAction(userId);
    if (res.success) setUserActivityDetails(res.data);
    setActivityLoading(false);
  };

  const handleOpenProfile = (targetUser) => {
    setSelectedUser(targetUser);
    const parsedPerms = safeParse(targetUser.adminPermissions, []);

    setEditFormData({ 
      ...targetUser, 
      isAdmin: !!targetUser.isAdmin,
      adminPermissions: Array.isArray(parsedPerms) ? parsedPerms : [],
      newPassword: '' 
    });
    setIsEditMode(false);
    setProfileTab('info');
    setUserActivityDetails(null); 
    reloadUserActivity(targetUser.id);
  };

  const uniqueActivityDownloads = useMemo(() => {
    if (!userActivityDetails?.downloads) return [];
    const unique = [];
    const map = new Map();
    for (const item of userActivityDetails.downloads) {
      if (item.content && !map.has(item.content.id)) {
        map.set(item.content.id, true);
        unique.push(item);
      }
    }
    return unique;
  }, [userActivityDetails?.downloads]);

  // ==========================================
  // هندلرهای مدیریت نظرات
  // ==========================================
  const handleChangeCommentStatus = async (commentId, newStatus) => {
    if (!can('COMMENT_APPROVE_REJECT')) return toast.error('شما مجوز تایید یا رد نظرات را ندارید.');
    setIsProcessing(true);
    const res = await updateCommentStatusAction(commentId, newStatus);
    if (res.success) {
      toast.success(res.message);
      reloadUserActivity(selectedUser.id);
    } else toast.error(res.error);
    setIsProcessing(false);
  };

  const handleSaveCommentReply = async (e) => {
    e.preventDefault();
    if (!can('COMMENT_EDIT_REPLY')) return toast.error('شما مجوز ویرایش یا پاسخ به نظرات را ندارید.');
    setIsProcessing(true);
    const res = await saveAdminReplyAction(commentReplyModal.id, commentReplyModal.adminReply, commentReplyModal.text, true);
    if (res.success) {
      toast.success(res.message);
      setCommentReplyModal(null);
      reloadUserActivity(selectedUser.id);
    } else toast.error(res.error);
    setIsProcessing(false);
  };

  // ==========================================
  // هندلرهای فرم اعلان اختصاصی پیشرفته
  // ==========================================
  const handleOpenMediaForNotif = (editor) => {
    setEditorInstance(editor);
    setMediaPickerTarget('editor');
  };

  const addCtaButton = () => setNotifData(prev => ({...prev, ctaButtons: [...prev.ctaButtons, { id: Math.random().toString(36).substr(2, 9), label: '', url: '' }]}));
  const updateCtaButton = (id, field, value) => setNotifData(prev => ({...prev, ctaButtons: prev.ctaButtons.map(b => b.id === id ? { ...b, [field]: value } : b)}));
  const removeCtaButton = (id) => setNotifData(prev => ({...prev, ctaButtons: prev.ctaButtons.filter(b => b.id !== id)}));

  const handleSendDirectNotif = async (e) => {
    e.preventDefault();
    if (!can('NOTIF_CREATE')) return toast.error('شما مجوز ارسال اعلان را ندارید.');
    if (!notifData.title) return toast.error('عنوان پیام الزامی است.');
    setIsProcessing(true);

    const payload = {
      type: 'PRIVATE',
      isTemplate: false,
      audienceType: 'MANUAL',
      manualPhones: selectedUser.phone, 
      title: notifData.title,
      bodyHtml: notifData.bodyHtml,
      themeColor: notifData.themeColor,
      iconUrl: notifData.iconUrl,
      coverUrl: notifData.coverUrl,
      ctaButtons: notifData.ctaButtons,
      sendInApp: true,
      sendSms: false,
    };

    const res = await saveAndDispatchNotificationAction(payload);
    setIsProcessing(false);

    if (res.success) {
      toast.success('پیام اختصاصی با موفقیت ارسال شد.');
      setDirectNotifModal(false);
      setNotifData({ title: '', bodyHtml: '', themeColor: '#8b5cf6', iconUrl: '', coverUrl: '', ctaButtons: [] });
      reloadUserActivity(selectedUser.id);
    } else {
      toast.error(res.error);
    }
  };

  const renderActivityList = () => {
    let list = [];
    if (activitySubTab === 'COMMENTS') list = userActivityDetails?.comments || [];
    if (activitySubTab === 'DOWNLOADS') list = uniqueActivityDownloads || [];
    if (activitySubTab === 'FAVORITES') list = userActivityDetails?.favorites || [];

    const visibleList = list.slice(0, visibleActivityCount);

    if (list.length === 0) {
      return <div className="py-10 text-center text-gray-400 text-xs font-bold bg-white/[0.01] rounded-xl font-sans border border-transparent">هیچ موردی برای نمایش وجود ندارد.</div>;
    }

    return (
      <div className="space-y-4 select-none">
        {visibleList.map((item, idx) => {
          const content = item.content;
          if (!content) return null;
          const typeInfo = getContentTypeLabel(content.type);

          return (
            <div key={idx} className="bg-white/5 rounded-xl p-4 shadow-sm hover:shadow-md border border-white/5 transition-all">
               <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                  <a href={`/${content.type === 'BLOG' ? 'blog' : 'p'}/${content.slug}`} target="_blank" className="text-sm font-bold text-[#8b5cf6] hover:text-white transition-colors line-clamp-1 leading-relaxed font-sans select-text">{content.titleBase} {content.titleHighlight}</a>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 font-sans border shadow-inner select-none ${typeInfo.color}`}>{typeInfo.label}</span>
               </div>

               {activitySubTab === 'COMMENTS' && (
                 <div className="mb-3">
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-sans shadow-inner ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : item.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                       {item.status === 'APPROVED' ? 'تایید شده' : item.status === 'REJECTED' ? 'رد شده' : 'در انتظار بررسی'}
                     </span>
                     
                     {(can('COMMENT_APPROVE_REJECT') || can('COMMENT_EDIT_REPLY')) && (
                       <div className="flex items-center gap-1.5">
                          {can('COMMENT_APPROVE_REJECT') && item.status !== 'APPROVED' && (
                            <button onClick={() => handleChangeCommentStatus(item.id, 'APPROVED')} disabled={isProcessing} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-md transition-colors cursor-pointer" title="تایید نظر"><Icon name="checkCircle" className="w-3.5 h-3.5" /></button>
                          )}
                          {can('COMMENT_APPROVE_REJECT') && item.status !== 'REJECTED' && (
                            <button onClick={() => handleChangeCommentStatus(item.id, 'REJECTED')} disabled={isProcessing} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-md transition-colors cursor-pointer" title="رد نظر"><Icon name="close" className="w-3.5 h-3.5" /></button>
                          )}
                          {can('COMMENT_EDIT_REPLY') && (
                            <button onClick={() => setCommentReplyModal(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md transition-colors cursor-pointer" title="پاسخ یا ویرایش"><Icon name="pencil" className="w-3.5 h-3.5" /></button>
                          )}
                       </div>
                     )}
                   </div>
                   
                   <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3 rounded-lg font-sans border border-transparent shadow-inner text-justify select-text">{item.text}</p>
                   
                   {item.adminReply && (
                     <div className="mt-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg relative">
                       <span className="absolute -top-2.5 right-4 bg-[#0b0f19] px-2 text-[10px] text-blue-400 font-bold font-sans select-none">پاسخ مدیریت</span>
                       <p className="text-xs text-blue-200 leading-relaxed font-sans text-justify mt-1 select-text">{item.adminReply}</p>
                     </div>
                   )}
                 </div>
               )}

               <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-sans bg-white/5 px-2 py-1 rounded w-fit border border-transparent shadow-inner select-none">
                  <Icon name="calendarBlank" className="w-3 h-3" />
                  {safeDateTimeStr(item.createdAt || item.downloadedAt)}
               </div>
            </div>
          )
        })}

        {visibleActivityCount < list.length && (
          <div className="pt-2 text-center">
             <button onClick={() => setVisibleActivityCount(v => v + 10)} className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans shadow-inner border border-transparent">
               نمایش موارد بیشتر (مجموع: {toPersianDigits(list.length)})
             </button>
          </div>
        )}
      </div>
    )
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!can('USERS_CREATE')) return toast.error('شما مجوز افزودن کاربر جدید را ندارید.');
    const engPhone = toEnglishDigits(newPhone);
    if(engPhone.length < 10) return toast.error('شماره موبایل نامعتبر است.');
    const res = await adminCreateUserAction(engPhone);
    if (res.success) {
      toast.success(res.message);
      setNewPhone('');
      setIsAddModalOpen(false);
      loadData();
    } else toast.error(res.error);
  };

  const askToggleStatus = (id, currentStatus) => {
    if (!can('USERS_BAN')) return toast.error('شما مجوز مسدودسازی یا فعال‌سازی حساب را ندارید.');
    const isBanning = currentStatus === 'ACTIVE';
    setConfirmModal({
      isOpen: true,
      title: isBanning ? 'مسدودسازی کاربر' : 'فعال‌سازی کاربر',
      message: isBanning 
        ? 'آیا مطمئن هستید که می‌خواهید دسترسی این کاربر را به کل سیستم مسدود کنید؟ این کاربر دیگر قادر به ورود نخواهد بود.'
        : 'آیا می‌خواهید دسترسی این کاربر را مجدداً فعال کنید؟',
      isDanger: isBanning,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
        const res = await adminToggleUserStatusAction(id, currentStatus);
        if (res.success) {
          toast.success(res.message);
          loadData();
          if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, status: isBanning ? 'BANNED' : 'ACTIVE' }));
        } else toast.error(res.error);
      }
    });
  };

  const handleTogglePermission = (perm) => {
    // فقط و فقط مدیر کل (Super Admin) مجاز به لمس و تغییر دسترسی‌ها است
    if (selectedUser?.isSuperAdmin || !user?.isSuperAdmin) return; 

    setEditFormData(prev => {
      let perms = [...(prev.adminPermissions || [])];
      const isSelected = perms.includes(perm.id);

      if (isSelected) {
        perms = perms.filter(p => p !== perm.id);
        const dependents = GRANULAR_PERMISSIONS.filter(p => p.requires === perm.id).map(p => p.id);
        perms = perms.filter(p => !dependents.includes(p));
      } else {
        perms.push(perm.id);
        if (perm.requires && !perms.includes(perm.requires)) {
          perms.push(perm.requires);
        }
      }
      return { ...prev, adminPermissions: perms };
    });
  };

  const handleSaveEdit = async () => {
    const isSelf = user?.id === selectedUser?.id;
    
    // ۱. جلوگیری از دستکاری مدیران کل توسط سایرین
    if (selectedUser?.isSuperAdmin && !user?.isSuperAdmin) {
      return toast.error('شما اجازه دستکاری حساب مدیران کل را ندارید.');
    }

    // ۲. جلوگیری از دستکاری اطلاعات یک مدیر توسط مدیر دیگر (مدیر عادی فقط پروفایل خودش یا کاربران عادی را می‌تواند ویرایش کند)
    if (selectedUser?.isAdmin && !user?.isSuperAdmin && !isSelf) {
      return toast.error('شما اجازه ویرایش اطلاعات سایر مدیران را ندارید.');
    }

    if (!can('USERS_EDIT') && !user?.isSuperAdmin && !isSelf) {
      return toast.error('شما مجوز ویرایش اطلاعات را ندارید.');
    }

    const submitData = { ...editFormData, phone: toEnglishDigits(editFormData.phone || '') };
    
    // ۳. قفل امنیتی: اگر شخص ذخیره‌کننده مدیر کل نیست، به هیچ وجه فیلدهای ادمین شدن را به دیتابیس نمی‌فرستیم
    if (!user?.isSuperAdmin) {
      delete submitData.isAdmin;
      delete submitData.adminPermissions;
    }

    const res = await adminUpdateUserAction(selectedUser.id, submitData);
    if (res.success) {
      toast.success(res.message);
      setIsEditMode(false);
      setSelectedUser({ 
        ...selectedUser, 
        ...submitData, 
        adminPermissions: user?.isSuperAdmin ? JSON.stringify(submitData.adminPermissions || []) : selectedUser.adminPermissions,
        password: submitData.newPassword ? 'HAS_PASSWORD' : selectedUser.password 
      });
      loadData();
    } else toast.error(res.error);
  };

  const toggleAllExportFields = () => {
    const allSelected = Object.values(exportFields).every(v => v);
    const newState = {};
    Object.keys(exportFields).forEach(k => newState[k] = !allSelected);
    setExportFields(newState);
  };

  const handleExportCSV = () => {
    if (!can('USERS_EXPORT')) return toast.error('شما مجوز دریافت خروجی اکسل را ندارید.');
    const headers = [];
    if (exportFields.id) headers.push('شناسه سیستمی');
    if (exportFields.phone) headers.push('موبایل');
    if (exportFields.name) headers.push('نام و نام خانوادگی');
    if (exportFields.gender) headers.push('جنسیت');
    if (exportFields.birth) headers.push('سال/تاریخ تولد');
    if (exportFields.location) headers.push('استان و شهر');
    if (exportFields.education) headers.push('مدرک و رشته');
    if (exportFields.artField) headers.push('فعالیت هنری');
    if (exportFields.cooperation) headers.push('زمینه‌های همکاری');
    if (exportFields.email) headers.push('ایمیل');
    if (exportFields.role) headers.push('نقش و دسترسی');
    if (exportFields.status) headers.push('وضعیت حساب');
    if (exportFields.downloadsCount) headers.push('تعداد دانلود');
    if (exportFields.favoritesCount) headers.push('تعداد علاقه‌مندی');
    if (exportFields.commentsCount) headers.push('تعداد نظرات');
    if (exportFields.joined) headers.push('تاریخ عضویت');

    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => {
        const row = [];
        if (exportFields.id) row.push(u.id);
        if (exportFields.phone) row.push(u.phone);
        if (exportFields.name) row.push(`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'نامشخص');
        if (exportFields.gender) row.push(u.gender === 'MALE' ? 'مرد' : u.gender === 'FEMALE' ? 'زن' : 'نامشخص');
        if (exportFields.birth) row.push(u.birthYear || 'نامشخص');
        if (exportFields.location) row.push(`${u.province || ''} ${u.city ? '- ' + u.city : ''}`.trim() || 'نامشخص');
        if (exportFields.education) row.push(`${u.educationDegree || ''} ${u.major ? '- ' + u.major : ''}`.trim() || 'نامشخص');
        if (exportFields.artField) row.push(u.artResearchField ? `"${u.artResearchField.replace(/"/g, '""')}"` : 'نامشخص');
        if (exportFields.cooperation) row.push(u.cooperationInterests ? `"${u.cooperationInterests.replace(/"/g, '""')}"` : 'نامشخص');
        if (exportFields.email) row.push(u.email || 'نامشخص');
        if (exportFields.role) row.push(u.isSuperAdmin ? 'مدیر کل' : u.isAdmin ? 'مدیر سایت' : 'کاربر عادی');
        if (exportFields.status) row.push(u.status === 'ACTIVE' ? 'فعال' : 'مسدود');
        
        // محاسبه دانلود یکتا برای خروجی اکسل
        if (exportFields.downloadsCount) {
          let uniqueDlCount = 0;
          if (u.downloads && Array.isArray(u.downloads)) {
            const uniqueContentIds = new Set();
            for (const d of u.downloads) {
              const cid = d.content?.id || d.contentId || d.content_id;
              if (cid) uniqueContentIds.add(cid);
            }
            uniqueDlCount = uniqueContentIds.size;
          }
          row.push(uniqueDlCount);
        }
        
        if (exportFields.favoritesCount) row.push(u._count?.favorites || 0);
        if (exportFields.commentsCount) row.push(u._count?.comments || 0);
        if (exportFields.joined) row.push(safeDateStr(u.createdAt));
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `madar_users_export_${new Date().getTime()}.csv`);
    link.click();
    setExportModal(false);
    toast.success('خروجی اکسل با موفقیت ایجاد شد.');
  };

  if (!isMounted || authLoading || hasAccess === null) {
    return <AdminLoading />;
  }

  if (hasAccess === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400 gap-4 select-none">
        <Icon name="lock" className="w-16 h-16 text-rose-500 opacity-50" />
        <h2 className="text-xl font-bold text-white">عدم دسترسی</h2>
        <p>شما مجوز لازم برای مدیریت کاربران را ندارید.</p>
      </div>
    );
  }

  // نمایش لودینگ سراسری و یکپارچه در زمان فراخوانی اولیه داده‌ها
  if (loading && users.length === 0) {
    return <AdminLoading />;
  }

  // آیا کاربر در حال مشاهده پروفایل خودش است؟
  const isSelfProfile = user?.id === selectedUser?.id;
  // مدیر عادی فقط می‌تواند اطلاعات هویتی خودش یا یک "کاربر عادی" را ویرایش کند
  const canEditPersonalInfo = user?.isSuperAdmin || isSelfProfile || (can('USERS_EDIT') && !selectedUser?.isAdmin && !selectedUser?.isSuperAdmin);
  // اعطای مقام مدیریت فقط در انحصار مدیر کل است
  const canGrantAdmin = !!user?.isSuperAdmin;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 font-sans text-right select-none pb-20">

      {/* هدر صفحه و کارت‌های آماری */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden group border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3 font-sans">
              <Icon name="users" className="w-7 h-7 text-[#8b5cf6]" /> مدیریت کاربران
            </h1>
            <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl leading-relaxed font-sans">
              داشبورد مدیریت کاربران مدار. نظارت بر فعالیت‌ها، ویرایش مشخصات و تعیین دسترسی‌های مدیریتی.
            </p>
          </div>
        </div>

        {/* کارت‌های آماری با تفکیک رنگی */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center border border-white/5 shadow-inner">
            <span className="text-gray-400 text-[11px] md:text-xs font-bold mb-1 font-sans">کل کاربران سایت</span>
            <span className="text-xl md:text-2xl font-black text-white font-sans">{toPersianDigits(stats.total)} <span className="text-[10px] text-white">نفر</span></span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-center shadow-inner">
            <span className="text-emerald-400/80 text-[11px] md:text-xs font-bold mb-1 font-sans">کاربران فعال</span>
            <span className="text-xl md:text-2xl font-black text-emerald-400 font-sans">{toPersianDigits(stats.active)} <span className="text-[10px] text-emerald-400">نفر</span></span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-center shadow-inner">
            <span className="text-rose-400/80 text-[11px] md:text-xs font-bold mb-1 font-sans">مسدود شده</span>
            <span className="text-xl md:text-2xl font-black text-rose-400 font-sans">{toPersianDigits(stats.banned)} <span className="text-[10px]  text-rose-400">نفر</span></span>
          </div>
          <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-inner">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#8b5cf6]/20 rounded-full blur-xl" />
            <span className="text-[#8b5cf6]/80 text-[11px] md:text-xs font-bold mb-1 font-sans">عضویت هفته اخیر</span>
            <span className="text-xl md:text-2xl font-black text-[#8b5cf6] font-sans">{toPersianDigits(stats.newThisWeek)} <span className="text-[10px] text-[#8b5cf6]/60">نفر</span></span>
          </div>
        </div>
      </motion.div>

      {/* محتوای اصلی (لیست کاربران) */}
      <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] min-h-[500px] flex flex-col border border-white/5 bg-[#0f172a]/40 backdrop-blur-2xl">
          
          <div className="p-6 border-b border-white/10 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/[0.02] shrink-0 relative z-30 rounded-t-3xl">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Icon name="search" className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو با موبایل، آیدی، نام..." 
                  className="w-full bg-[#050810]/50 rounded-xl py-2.5 pr-11 pl-4 text-xs md:text-sm text-white outline-none focus:border focus:border-[#8b5cf6] border border-white/10 transition-all font-sans select-text"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#050810]/50 rounded-xl px-4 py-2.5 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-white/10 appearance-none cursor-pointer flex-1 sm:flex-none font-sans">
                  <option value="ALL">وضعیت: همه</option>
                  <option value="ACTIVE">فقط فعال‌ها</option>
                  <option value="BANNED">فقط مسدودها</option>
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-[#050810]/50 rounded-xl px-4 py-2.5 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-white/10 appearance-none cursor-pointer flex-1 sm:flex-none font-sans">
                  <option value="ALL">نقش حساب: همه</option>
                  <option value="USER">فقط کاربران عادی</option>
                  <option value="ADMIN">فقط مدیران و ارشدها</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end relative">
              {can('USERS_EXPORT') && (
                <Tooltip text="خروجی اکسل">
                  <button onClick={() => setExportModal(true)} className="flex items-center justify-center w-11 h-11 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all cursor-pointer border border-emerald-500/20 shadow-inner">
                    <Icon name="fileCsv" className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
              {can('USERS_CREATE') && ( 
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-5 h-11 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer font-sans border border-transparent">
                  <Icon name="plus" className="w-4 h-4" /> افزودن کاربر
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1 relative z-10 p-2">
            <table className="w-full text-sm text-right text-gray-400 border-separate border-spacing-y-2">
              <thead className="text-[11px] text-gray-400 uppercase bg-transparent">
                <tr>
                  <th className="px-6 py-4 font-bold font-sans">موبایل / مشخصات</th>
                  <th className="px-6 py-4 font-bold font-sans">نوع حساب</th>
                  <th className="px-6 py-4 font-bold font-sans">آمار فعالیت</th>
                  <th className="px-6 py-4 font-bold text-center font-sans">وضعیت حساب</th>
                  <th className="px-6 py-4 font-bold text-left font-sans">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-20 text-gray-500 font-bold font-sans">هیچ کاربری یافت نشد.</td></tr>
                ) : (
                  currentUsers.map(u => {
                    let uniqueDlCount = 0;
                    if (u.downloads) {
                       const map = new Map();
                       for (const d of u.downloads) {
                         if (d.contentId && !map.has(d.contentId)) { 
                           map.set(d.contentId, true); 
                           uniqueDlCount++; 
                         }
                       }
                    }
                    u.uniqueDownloads = uniqueDlCount;

                    return (
                    <tr key={u.id} className="bg-[#050810]/40 hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 rounded-r-xl border border-transparent group-hover:border-white/5 border-l-0">
                        <div className="flex flex-col">
                          <span 
                            className="font-sans font-bold text-white text-base cursor-pointer hover:text-[#8b5cf6] transition-colors flex items-center gap-2 w-fit select-text" 
                            dir="ltr" onClick={() => handleCopy(u.phone, 'شماره موبایل')}
                          >
                            {toPersianDigits(u.phone)} <Icon name="copy" className="w-3 h-3 opacity-50 select-none" />
                          </span>
                          <span className="text-xs text-gray-500 mt-1 font-sans select-text">{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'بدون نام'}</span>
                          <span 
                            className="text-[10px] text-gray-600 mt-1 font-sans cursor-pointer hover:text-gray-400 flex items-center gap-1 w-fit select-text" 
                            onClick={() => handleCopy(u.id, 'شناسه سیستمی')} dir="ltr"
                          >
                            #{u.id.slice(-8).toUpperCase()} <Icon name="copy" className="w-3 h-3 select-none" />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap font-sans border shadow-inner select-none ${u.isSuperAdmin ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30' : u.isAdmin ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                          {u.isSuperAdmin ? 'مدیر کل' : u.isAdmin ? 'مدیر پنل' : 'کاربر عادی'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-y border-transparent group-hover:border-white/5">
                        <div className="flex items-center gap-4 text-xs font-bold font-sans">
                          <Tooltip text="فایل‌های یکتا دانلود شده"><span className="flex items-center gap-1.5 text-cyan-400"><Icon name="download" className="w-4 h-4"/> {toPersianDigits(uniqueDlCount)}</span></Tooltip>
                          <Tooltip text="علاقه‌مندی‌ها"><span className="flex items-center gap-1.5 text-rose-400"><Icon name="heart" className="w-4 h-4"/> {toPersianDigits(u._count?.favorites || 0)}</span></Tooltip>
                          <Tooltip text="نظرات ثبت شده"><span className="flex items-center gap-1.5 text-emerald-400"><Icon name="comment" className="w-4 h-4"/> {toPersianDigits(u._count?.comments || 0)}</span></Tooltip>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-y border-transparent group-hover:border-white/5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 font-sans border shadow-inner select-none ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                          {u.status === 'ACTIVE' ? 'فعال' : 'مسدود'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left rounded-l-xl border border-transparent group-hover:border-white/5 border-r-0">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip text="مشاهده پروفایل">
                            <button onClick={() => handleOpenProfile(u)} className="p-1.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner">
                              <Icon name="user" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          {can('USERS_BAN') && !u.isSuperAdmin && (
                            <Tooltip text={u.status === 'ACTIVE' ? "مسدودسازی حساب" : "فعال‌سازی حساب"}>
                              <button onClick={() => askToggleStatus(u.id, u.status)} className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent shadow-inner ${u.status === 'ACTIVE' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                                <Icon name="lock" className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                 })
                )}
              </tbody>
            </table>
          </div>

          {/* کنترل‌های صفحه‌بندی */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0 relative z-10 rounded-b-3xl">
              <span className="text-[11px] md:text-xs text-gray-500 font-sans">
                نمایش {toPersianDigits(indexOfFirstUser + 1)} تا {toPersianDigits(Math.min(indexOfLastUser, filteredUsers.length))} از {toPersianDigits(filteredUsers.length)}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white cursor-pointer border border-transparent shadow-inner">
                  <Icon name="chevronRight" className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-white bg-[#8b5cf6] w-8 h-8 flex items-center justify-center rounded-lg font-sans shadow-[0_0_10px_rgba(139,92,246,0.3)] select-none">
                  {toPersianDigits(currentPage)}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white cursor-pointer border border-transparent shadow-inner">
                  <Icon name="chevronLeft" className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال ایجاد کاربر جدید */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsAddModalOpen(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white font-sans">افزودن کاربر جدید</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 p-1.5 rounded-xl"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddUser}>
                  <label className="block text-xs text-gray-400 mb-2 font-sans pl-1">شماره موبایل کاربر (۱۱ رقمی)</label>
                  <div className="relative mb-6">
                    <input type="tel" dir="ltr" placeholder="09..." value={newPhone} onChange={(e) => {
                        let val = e.target.value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
                        if (val.length <= 11) setNewPhone(val);
                    }} className="w-full bg-black/40 border border-white/10 rounded-xl pr-4 pl-11 py-3 text-sm text-white focus:border-[#8b5cf6] outline-none text-left tracking-widest font-sans shadow-inner transition-colors select-text" />
                    <Icon name="phone" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer font-sans border border-transparent disabled:opacity-50">
                    ایجاد حساب کاربری
                  </button>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال تایید (Confirm) - عمومی */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false })}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center border border-white/10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-transparent shadow-inner ${confirmModal.isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Icon name={confirmModal.isDanger ? 'userforbidden' : 'usertrust'} className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-sans">{confirmModal.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-8 font-sans select-text">{confirmModal.message}</p>
                <div className="flex gap-3">
                  <button onClick={confirmModal.onConfirm} className={`flex-1 py-3 text-white rounded-xl text-sm font-bold transition-all cursor-pointer font-sans border border-transparent ${confirmModal.isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>بله، تایید می‌کنم</button>
                  <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false })} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors cursor-pointer font-sans border border-transparent shadow-inner">انصراف</button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال خروجی اکسل پیشرفته */}
      <AnimatePresence>
        {exportModal && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setExportModal(false)}></div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative z-10 w-full max-w-lg bg-[#0f172a]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
                 <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans"><Icon name="fileCsv" className="w-5 h-5 text-emerald-400" /> تنظیمات خروجی اکسل</h3>
                   <button onClick={() => setExportModal(false)} className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-xl cursor-pointer border border-transparent shadow-inner transition-colors"><Icon name="close" className="w-5 h-5" /></button>
                 </div>

                 <div className="flex justify-between items-center mb-6">
                   <p className="text-xs text-gray-400 font-sans">فیلدهای مورد نظر را انتخاب کنید:</p>
                   <button onClick={toggleAllExportFields} className="text-[11px] bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg border border-transparent shadow-inner cursor-pointer font-sans transition-colors">
                     {Object.values(exportFields).every(v => v) ? 'لغو انتخاب همه' : 'انتخاب همه'}
                   </button>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                   {Object.keys(exportFields).map(key => {
                     const labels = { 
                       id: 'شناسه سیستمی', phone: 'موبایل', name: 'نام و خانوادگی', gender: 'جنسیت', 
                       birth: 'تاریخ تولد', location: 'استان و شهر', education: 'مدرک و رشته', 
                       artField: 'فعالیت هنری', cooperation: 'زمینه‌های همکاری', email: 'ایمیل', 
                       role: 'نقش و دسترسی', status: 'وضعیت حساب', joined: 'تاریخ عضویت',
                       downloadsCount: 'تعداد دانلودها', favoritesCount: 'تعداد علاقه‌مندی‌ها', commentsCount: 'تعداد نظرات'
                     };
                     if (!labels[key]) return null;
                     return (
                       <label key={key} className="flex items-center gap-2.5 cursor-pointer group bg-black/20 p-2 rounded-xl border border-white/5 shadow-inner hover:bg-white/5 transition-colors">
                         <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors border-2 ${exportFields[key] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 bg-transparent group-hover:border-gray-400'}`}>
                           {exportFields[key] && <Icon name="check" className="w-2.5 h-2.5 text-white" />}
                         </div>
                         <input type="checkbox" className="hidden" checked={exportFields[key]} onChange={() => setExportFields(prev => ({ ...prev, [key]: !prev[key] }))} />
                         <span className="text-[11px] text-gray-300 group-hover:text-white transition-colors font-sans truncate">{labels[key]}</span>
                       </label>
                     )
                   })}
                 </div>
                 <button onClick={handleExportCSV} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer font-sans border border-transparent">
                   دریافت فایل اکسل
                 </button>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال ارسال پیام اختصاصی به کاربر */}
      <AnimatePresence>
        {directNotifModal && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setDirectNotifModal(false)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-2xl bg-[#0f172a]/95 backdrop-blur-3xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2"><Icon name="bell" className="w-5 h-5 text-[#8b5cf6]" /> ارسال پیام اختصاصی</h3>
                  <button onClick={() => setDirectNotifModal(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 p-1.5 rounded-xl"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSendDirectNotif} className="space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-2 text-xs font-sans text-gray-300 shadow-inner select-text">
                    گیرنده: <span className="font-bold text-[#8b5cf6]" dir="ltr">{toPersianDigits(selectedUser?.phone)}</span> ({selectedUser?.firstName} {selectedUser?.lastName})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-2 font-sans pl-1">عنوان پیام</label>
                      <input type="text" value={notifData.title} onChange={e => setNotifData({...notifData, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none transition-colors select-text" placeholder="مثال: وضعیت درخواست شما" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-2 font-sans pl-1">تم رنگی اعلان</label>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1.5 rounded-xl shadow-inner w-full">
                        <input type="color" value={notifData.themeColor} onChange={e => setNotifData({...notifData, themeColor: e.target.value})} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                        <input type="text" value={notifData.themeColor} onChange={e => setNotifData({...notifData, themeColor: e.target.value})} className="w-full bg-transparent text-sm text-white dir-ltr text-center uppercase outline-none font-sans tracking-widest select-text" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-2 font-sans pl-1">آیکون شاخص (مربع کوچک)</label>
                      {notifData.iconUrl ? (
                        <div className="flex items-center gap-2 p-2 bg-black/30 border border-white/10 rounded-xl shadow-inner">
                          <img src={notifData.iconUrl} alt="icon" className="w-8 h-8 object-contain rounded" />
                          <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-[#8b5cf6] rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر</button>
                          <button type="button" onClick={() => setNotifData({...notifData, iconUrl: ''})} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget('iconUrl')} className="w-full py-3 bg-black/30 border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans">
                          <Icon name="image" className="w-4 h-4" /> انتخاب آیکون
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-2 font-sans pl-1">کاور بالای اعلان (اختیاری)</label>
                      {notifData.coverUrl ? (
                        <div className="flex items-center gap-2 p-2 bg-black/30 border border-white/10 rounded-xl shadow-inner">
                          <img src={notifData.coverUrl} alt="cover" className="w-12 h-8 object-cover rounded" />
                          <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="flex-1 py-1 text-xs bg-white/10 hover:bg-[#8b5cf6] rounded-lg transition-colors text-white font-sans cursor-pointer">تغییر کاور</button>
                          <button type="button" onClick={() => setNotifData({...notifData, coverUrl: ''})} className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setMediaPickerTarget('coverUrl')} className="w-full py-3 bg-black/30 border border-dashed border-white/20 hover:border-[#8b5cf6] text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans">
                          <Icon name="image" className="w-4 h-4" /> انتخاب بنر
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-2 font-sans pl-1">متن و محتوای غنی پیام</label>
                    <div className="bg-black/30 rounded-xl overflow-hidden border border-white/10 shadow-inner select-text">
                      <RichTextEditor 
                        value={notifData.bodyHtml} 
                        onChange={val => setNotifData({...notifData, bodyHtml: val})} 
                        activeTheme={{ color: `text-[${notifData.themeColor}]` }}
                        onOpenMedia={handleOpenMediaForNotif} 
                        placeholder="متن پیام را به صورت کامل و با قابلیت فرمت‌بندی بنویسید..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] text-gray-300 font-sans">دکمه‌های اقدام (Call to Action)</label>
                      <button type="button" onClick={addCtaButton} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer font-sans shadow-sm">+ افزودن دکمه</button>
                    </div>
                    {notifData.ctaButtons.map((btn) => (
                      <div key={btn.id} className="flex flex-col sm:flex-row gap-2 p-2 bg-black/20 border border-white/5 rounded-xl relative pr-10 shadow-inner select-text">
                        <button type="button" onClick={() => removeCtaButton(btn.id)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                        <input type="text" placeholder="عنوان دکمه" value={btn.label} onChange={e => updateCtaButton(btn.id, 'label', e.target.value)} className="w-full sm:w-1/3 bg-white/5 border border-transparent rounded-lg p-2 text-xs text-white outline-none font-sans focus:border-[#8b5cf6]" />
                        <input type="text" placeholder="لینک (http://...)" value={btn.url} onChange={e => updateCtaButton(btn.id, 'url', e.target.value)} className="w-full sm:flex-1 bg-white/5 border border-transparent rounded-lg p-2 text-xs text-white outline-none dir-ltr text-right font-sans focus:border-[#8b5cf6]" />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-white/10">
                    <button type="button" onClick={() => setDirectNotifModal(false)} className="px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-bold shadow-inner border border-transparent">انصراف</button>
                    <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center gap-2 transition-all cursor-pointer font-sans border border-transparent disabled:opacity-50">
                      {isProcessing ? <Icon name="loading" className="w-4 h-4 animate-spin" /> : <Icon name="send" className="w-4 h-4" />} ارسال به داشبورد
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* مدیا پیکر برای اعلان اختصاصی */}
      <AnimatePresence>
        {mediaPickerTarget && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans select-none" onClick={() => setMediaPickerTarget(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl h-[90vh] bg-[#0f172a]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-white font-bold flex items-center gap-2 font-sans"><Icon name="image" className="w-5 h-5 text-[#8b5cf6]" /> انتخاب فایل از رسانه</h3>
                  <button onClick={() => setMediaPickerTarget(null)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                  <MediaLibraryComponent
                isPickerMode={true}
                onSelectMedia={(media) => {
                  if (mediaPickerTarget === 'iconUrl') setNotifData(p => ({...p, iconUrl: media.url}));
                  else if (mediaPickerTarget === 'coverUrl') setNotifData(p => ({...p, coverUrl: media.url}));
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

      {/* ======================================================= */}
      {/* مودال پاسخ و ویرایش نظرات (در پروفایل کاربر) */}
      <AnimatePresence>
        {commentReplyModal && (
          <ModalPortal>
            <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setCommentReplyModal(null)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative z-10 w-full max-w-lg bg-[#0f172a]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2"><Icon name="message" className="w-5 h-5 text-blue-400" /> مدیریت نظر</h3>
                  <button onClick={() => setCommentReplyModal(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 p-1.5 rounded-xl"><Icon name="close" className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveCommentReply} className="space-y-5">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-2 font-sans pl-1">متن نظر کاربر (قابل ویرایش در صورت نیاز)</label>
                    <textarea rows="3" value={commentReplyModal.text} onChange={e => setCommentReplyModal({...commentReplyModal, text: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:border-blue-500 resize-none font-sans shadow-inner outline-none transition-colors select-text"></textarea>
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 right-8 w-1 h-full bg-blue-500/20 rounded"></div>
                    <label className="block text-[11px] text-blue-400 font-bold mb-2 font-sans pl-1">پاسخ رسمی شما (به عنوان مدیر)</label>
                    <textarea rows="4" value={commentReplyModal.adminReply || ''} onChange={e => setCommentReplyModal({...commentReplyModal, adminReply: e.target.value})} className="w-full bg-blue-500/5 border border-blue-500/30 rounded-xl px-4 py-3 text-sm text-blue-100 focus:border-blue-500 resize-none font-sans shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] outline-none transition-colors select-text" placeholder="پاسخ خود را اینجا بنویسید..."></textarea>
                  </div>
                  <p className="text-[10px] text-emerald-400/80 font-sans flex items-center gap-1"><Icon name="checkCircle" className="w-3 h-3"/> با ثبت پاسخ، نظر به صورت خودکار تایید و منتشر می‌شود.</p>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => setCommentReplyModal(null)} className="px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-bold shadow-inner">انصراف</button>
                    <button type="submit" disabled={isProcessing} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2 transition-all cursor-pointer font-sans border border-transparent disabled:opacity-50">
                      {isProcessing ? <Icon name="loading" className="w-4 h-4 animate-spin" /> : <Icon name="save" className="w-4 h-4" />} ثبت پاسخ و تایید
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال پروفایل کاربر و ویرایش */}
      <AnimatePresence>
        {selectedUser && (
          <ModalPortal>
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
              <div className="absolute inset-0 cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedUser(null)}></div>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-[#0f172a]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col border border-white/10">

                {/* Header of Modal */}
                <div className="bg-white/[0.02] border-b border-white/10 p-5 flex flex-wrap justify-between items-center z-20 shrink-0 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${selectedUser.isSuperAdmin ? 'bg-fuchsia-600/10 text-fuchsia-400 border-fuchsia-500/20' : selectedUser.isAdmin ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20'}`}>
                      <Icon name="user" className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight flex items-center gap-2 font-sans mb-1 select-text">
                        {selectedUser.firstName || selectedUser.lastName ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}` : 'پروفایل کاربری'}
                        {(selectedUser.isAdmin || selectedUser.isSuperAdmin) && (
                          <span className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-sans border shadow-inner ml-2 select-none ${selectedUser.isSuperAdmin ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {selectedUser.isSuperAdmin ? 'مدیر کل' : 'مدیر پنل'}
                          </span>
                        )}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-sans mt-2">
                        <Tooltip text="کلیک برای کپی">
                          <span onClick={() => handleCopy(selectedUser.phone, 'شماره موبایل')} className="flex items-center gap-1 bg-black/40 border border-white/5 px-2 py-1 rounded-md shadow-inner cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-text" dir="ltr">
                            <Icon name="phone" className="w-3.5 h-3.5 select-none" /> {toPersianDigits(selectedUser.phone)}
                          </span>
                        </Tooltip>
                        <Tooltip text="کلیک برای کپی">
                          <span onClick={() => handleCopy(selectedUser.id, 'شناسه سیستمی')} className="flex items-center gap-1 bg-black/40 border border-white/5 px-2 py-1 rounded-md shadow-inner font-bold cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-text" dir="ltr">
                            <Icon name="lock" className="w-3.5 h-3.5 select-none" /> {selectedUser.id.slice(-8).toUpperCase()}
                          </span>
                        </Tooltip>
                        <Tooltip text="تاریخ عضویت">
                          <span className="flex items-center gap-1 bg-black/40 border border-white/5 px-2 py-1 rounded-md shadow-inner cursor-default select-text">
                            <Icon name="calendarBlank" className="w-3.5 h-3.5 select-none" /> {safeDateStr(selectedUser.createdAt)}
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 print-hide w-full sm:w-auto justify-end">
                    {profileTab === 'info' && (canEditPersonalInfo || canGrantAdmin) && (
                      <button onClick={() => setIsEditMode(!isEditMode)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans border shadow-inner flex items-center gap-2 ${isEditMode ? 'bg-[#8b5cf6] text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-black/30 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                        {isEditMode ? 'انصراف' : 'ویرایش'}
                      </button>
                    )}
                    <button onClick={() => setSelectedUser(null)} className="p-2.5 bg-black/30 border border-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer shadow-inner"><Icon name="close" className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-10">
                  <div className="flex gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto hide-scroll print-hide">
                    {[
                      { id: 'info', label: 'اطلاعات فردی و دسترسی', icon: 'idCard' },
                      { id: 'activity', label: 'تاریخچه فعالیت و نظرات', icon: 'trend' },
                      { id: 'notifications', label: 'اعلانات اختصاصی', icon: 'bell' },
                    ].map(tab => (
                      <button 
                        key={tab.id} onClick={() => { setProfileTab(tab.id); setIsEditMode(false); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer font-sans border shadow-inner ${profileTab === tab.id ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' : 'bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        <Icon name={tab.icon} className="w-4 h-4" /> {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    {profileTab === 'info' && (
                      isEditMode ? (
                        <form className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* نمایش بخش دسترسی‌ها: مدیر کل همه را می‌بیند تا ویرایش کند. مدیر عادی فقط اگر پروفایل خودش باشد می‌بیند (آن هم فقط تیک‌های فعال را) */}
                            {(user?.isSuperAdmin || (editFormData.isAdmin && isSelfProfile)) && !selectedUser?.isSuperAdmin && (
                              <div className="lg:col-span-3 bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20 shadow-inner">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-amber-500/10 pb-4 mb-5">
                                  <div>
                                    <h3 className="text-sm font-bold text-amber-400 font-sans flex items-center gap-2">
                                      <Icon name="shieldCheck" className="w-4 h-4" /> سطح دسترسی مدیریت سایت
                                    </h3>
                                    <p className="text-[10px] text-amber-400/60 font-sans mt-1">
                                      {user?.isSuperAdmin ? 'با روشن کردن این گزینه، کاربر به مدیر پنل تبدیل می‌شود.' : 'فهرست دسترسی‌های مدیریتی شما (غیرقابل ویرایش)'}
                                    </p>
                                  </div>
                                  
                                  {/* دکمه تاگل (ارتقا به مدیر) فقط برای مدیر کل نمایش داده شود */}
                                  {user?.isSuperAdmin && (
                                    <label className="flex items-center cursor-pointer">
                                      <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={editFormData.isAdmin} onChange={(e) => setEditFormData({...editFormData, isAdmin: e.target.checked, adminPermissions: e.target.checked ? editFormData.adminPermissions : []})} />
                                        <div className={`block w-14 h-8 rounded-full transition-colors ${editFormData.isAdmin ? 'bg-amber-500' : 'bg-black/50 border border-white/10'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${editFormData.isAdmin ? 'transform translate-x-6' : ''}`}></div>
                                      </div>
                                      <span className="ml-3 text-xs font-bold text-white font-sans">ارتقا به مدیر سایت</span>
                                    </label>
                                  )}
                                </div>

                                <AnimatePresence>
                                  {editFormData.isAdmin && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-6">

                                      {Object.entries(permissionsByCategory).map(([category, perms]) => {
                                        // فیلتر کردن تیک‌ها: مدیر کل همه را می‌بیند. مدیران عادی فقط تیک‌های فعال خودشان را می‌بینند.
                                        const visiblePerms = user?.isSuperAdmin 
                                          ? perms 
                                          : perms.filter(perm => editFormData.adminPermissions.includes(perm.id));

                                        if (visiblePerms.length === 0) return null;

                                        return (
                                          <div key={category} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs font-bold text-amber-400/80 mb-4 font-sans uppercase tracking-widest">{category}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                              {visiblePerms.map(perm => {
                                                const isSelected = editFormData.adminPermissions.includes(perm.id);
                                                const isDisabled = perm.requires && !editFormData.adminPermissions.includes(perm.requires);

                                                return (
                                                  <label key={perm.id} className={`p-3 rounded-xl transition-all flex items-start gap-3 border shadow-inner select-none ${!user?.isSuperAdmin ? 'bg-amber-500/5 border-amber-500/10' : isDisabled ? 'bg-black/40 border-transparent opacity-50 cursor-not-allowed' : isSelected ? 'bg-amber-500/10 border-amber-500/20 cursor-pointer' : 'bg-white/5 border-transparent hover:bg-white/10 cursor-pointer'}`}>
                                                    
                                                    {user?.isSuperAdmin && (
                                                      <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={isSelected}
                                                        disabled={isDisabled}
                                                        onChange={() => handleTogglePermission(perm)} 
                                                      />
                                                    )}
                                                    
                                                    {/* نمایش مربعی تیک برای مدیر کل، و نمایش فشرده (بدون کادر انتخاب) برای مدیران عادی */}
                                                    {user?.isSuperAdmin ? (
                                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 transition-colors border-2 ${isSelected ? 'bg-amber-500 border-amber-500' : isDisabled ? 'border-gray-600 bg-transparent' : 'border-gray-500 bg-transparent group-hover:border-gray-400'}`}>
                                                        {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                                                      </div>
                                                    ) : (
                                                      <div className="mt-0.5 shrink-0"><Icon name="checkCircle" className="w-4 h-4 text-amber-500" /></div>
                                                    )}

                                                    <div>
                                                      <h5 className={`text-xs font-bold mb-1 transition-colors font-sans ${isSelected ? 'text-amber-400' : 'text-gray-300'}`}>{perm.label}</h5>
                                                      {perm.desc && <p className="text-[9px] text-gray-500 leading-relaxed font-sans">{perm.desc}</p>}
                                                      {(isDisabled && user?.isSuperAdmin) && <p className="text-[8px] text-rose-400 mt-1">نیاز به فعالسازی "{GRANULAR_PERMISSIONS.find(p => p.id === perm.requires)?.label}" دارد</p>}
                                                    </div>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      })}

                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {selectedUser.isSuperAdmin && (
                              <div className="lg:col-span-3 bg-fuchsia-600/10 p-5 rounded-2xl border border-fuchsia-500/20 shadow-inner">
                                <h3 className="text-sm font-bold text-fuchsia-400 font-sans flex items-center gap-2 mb-2">
                                  <Icon name="usershield" className="w-5 h-5" /> مدیر کل
                                </h3>
                                <p className="text-xs text-fuchsia-400/70 font-sans">این حساب بالاترین سطح دسترسی را دارد و مجوزهای آن قابل ویرایش یا سلب نیستند.</p>
                              </div>
                            )}

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">نام</label><input type="text" disabled={!canEditPersonalInfo} value={editFormData.firstName || ''} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none transition-colors select-text disabled:opacity-50" style={autofillFixStyle} /></div>
                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">نام خانوادگی</label><input type="text" disabled={!canEditPersonalInfo} value={editFormData.lastName || ''} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none transition-colors select-text disabled:opacity-50" style={autofillFixStyle} /></div>

                            <div>
                              <label className="block text-xs text-rose-400 mb-2 font-bold font-sans pl-1">شماره موبایل (دقت در ویرایش!)</label>
                              <input type="tel" dir="ltr" disabled={!canEditPersonalInfo} value={toPersianDigits(editFormData.phone || '')} onChange={(e) => {
                                  let val = e.target.value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
                                  setEditFormData({...editFormData, phone: val});
                              }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 font-sans text-left shadow-[inset_0_0_10px_rgba(244,63,94,0.1)] outline-none tracking-widest transition-colors select-text disabled:opacity-50" style={autofillFixStyle} />
                            </div>

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">جنسیت</label>
                              <div className="relative">
                                <select disabled={!canEditPersonalInfo} value={editFormData.gender || ''} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] appearance-none font-sans shadow-inner outline-none cursor-pointer transition-colors disabled:opacity-50" style={autofillFixStyle}>
                                  <option value="" className="bg-[#0f172a]">نامشخص</option><option value="MALE" className="bg-[#0f172a]">مرد</option><option value="FEMALE" className="bg-[#0f172a]">زن</option>
                                </select>
                                <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                            </div>

                            {/* استایل‌های اختصاصی برای دارک‌مود تقویم شمسی */}
                            <style dangerouslySetInnerHTML={{__html: `
                              .rmdp-wrapper, .rmdp-month-picker, .rmdp-year-picker { background: #0b0f19 !important; border: 1px solid rgba(255,255,255,0.05) !important; }
                              .rmdp-wrapper { box-shadow: 0 15px 40px rgba(0,0,0,0.8) !important; border-radius: 16px !important; }
                              .rmdp-month-picker, .rmdp-year-picker { border-radius: 12px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important; }
                              .rmdp-panel, .rmdp-header-values { color: #f3f4f6 !important; font-weight: bold !important; font-family: inherit !important; }
                              .rmdp-arrow { border: solid #9ca3af !important; border-width: 0 2px 2px 0 !important; margin-top: 2px !important; }
                              .rmdp-arrow-container:hover { background-color: rgba(255,255,255,0.1) !important; }
                              .rmdp-week-day { color: #8b5cf6 !important; font-weight: bold !important; }
                              .rmdp-day, .rmdp-day span { color: #d1d5db !important; font-family: inherit !important; font-weight: 500 !important; }
                              .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover { background-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
                              .rmdp-day.rmdp-today span { background-color: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
                              .rmdp-day.rmdp-selected span:not(.highlight) { background-color: #8b5cf6 !important; box-shadow: 0 0 15px rgba(139,92,246,0.5) !important; color: #fff !important; font-weight: bold !important; }
                              .ep-arrow::after { background-color: #0b0f19 !important; border: 1px solid rgba(255,255,255,0.05) !important; }
                            `}} />

                            <div>
                               <label className="block text-xs text-gray-400 mb-2 font-sans pl-1">تاریخ تولد (تقویم شمسی)</label>
                               <DatePicker
                                  disabled={!canEditPersonalInfo}
                                  value={editFormData.birthYear || ''}
                                  onChange={(date) => setEditFormData({...editFormData, birthYear: date?.format('YYYY/MM/DD') || ''})}
                                  calendar={persian}
                                  locale={persian_fa}
                                  calendarPosition="bottom-right"
                                  className="bg-dark"
                                  inputClass="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none cursor-pointer transition-colors select-text disabled:opacity-50"
                                  placeholder="انتخاب از تقویم..."
                               />
                            </div>

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">استان</label>
                              <div className="relative">
                                <select disabled={!canEditPersonalInfo} value={editFormData.province || ''} onChange={(e) => setEditFormData({...editFormData, province: e.target.value, city: ''})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] appearance-none font-sans shadow-inner outline-none cursor-pointer transition-colors disabled:opacity-50" style={autofillFixStyle}>
                                  <option value="" className="bg-[#0f172a]">انتخاب استان...</option>
                                  {provincesList.map(prov => <option key={prov} value={prov} className="bg-[#0f172a]">{prov}</option>)}
                                </select>
                                <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                            </div>

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">شهر</label>
                              <div className="relative">
                                <select disabled={!canEditPersonalInfo || !editFormData.province || availableCities.length === 0} value={editFormData.city || ''} onChange={(e) => setEditFormData({...editFormData, city: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] appearance-none font-sans shadow-inner outline-none cursor-pointer disabled:opacity-50 transition-colors" style={autofillFixStyle}>
                                  <option value="" className="bg-[#0f172a]">ابتدا استان را انتخاب کنید...</option>
                                  {availableCities.map(city => <option key={city} value={city} className="bg-[#0f172a]">{city}</option>)}
                                </select>
                                <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                            </div>

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">مدرک تحصیلی</label>
                               <div className="relative">
                                 <select disabled={!canEditPersonalInfo} value={editFormData.educationDegree || ''} onChange={(e) => setEditFormData({...editFormData, educationDegree: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] appearance-none font-sans shadow-inner outline-none cursor-pointer transition-colors disabled:opacity-50" style={autofillFixStyle}>
                                  <option value="" className="bg-[#0f172a]">انتخاب مدرک...</option>
                                  {EDUCATION_DEGREES.map(deg => <option key={deg} value={deg} className="bg-[#0f172a]">{deg}</option>)}
                                 </select>
                                 <Icon name="caretDown" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                               </div>
                            </div>

                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">رشته تحصیلی</label><input type="text" disabled={!canEditPersonalInfo} value={editFormData.major || ''} onChange={(e) => setEditFormData({...editFormData, major: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none transition-colors select-text disabled:opacity-50" style={autofillFixStyle} /></div>
                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">ایمیل</label><input type="email" dir="ltr" disabled={!canEditPersonalInfo} value={editFormData.email || ''} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] text-left font-sans shadow-inner outline-none transition-colors select-text disabled:opacity-50" style={autofillFixStyle} /></div>
                            <div><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">حوزه فعالیت هنری/پژوهشی</label><input type="text" disabled={!canEditPersonalInfo} value={editFormData.artResearchField || ''} onChange={(e) => setEditFormData({...editFormData, artResearchField: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] font-sans shadow-inner outline-none transition-colors select-text disabled:opacity-50" style={autofillFixStyle} /></div>

                            <div className="col-span-1 md:col-span-2 lg:col-span-3"><label className="block text-xs text-gray-400 mb-2 font-sans pl-1">زمینه‌های تمایل به همکاری</label><textarea rows="3" disabled={!canEditPersonalInfo} value={editFormData.cooperationInterests || ''} onChange={(e) => setEditFormData({...editFormData, cooperationInterests: e.target.value})} className="w-full bg-black/40 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8b5cf6] resize-none font-sans border border-white/10 shadow-inner outline-none leading-relaxed text-justify transition-colors select-text disabled:opacity-50" style={autofillFixStyle}></textarea></div>

                            <div className={`lg:col-span-3 p-5 rounded-2xl mt-2 border shadow-inner ${editFormData.isAdmin || selectedUser.isSuperAdmin ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/30 border-white/10'}`}>
                              <label className={`text-xs mb-4 font-bold flex items-center gap-2 font-sans ${editFormData.isAdmin || selectedUser.isSuperAdmin ? 'text-emerald-400' : 'text-gray-300'}`}>
                                <Icon name="password" className="w-4 h-4" /> 
                                {editFormData.isAdmin || selectedUser.isSuperAdmin ? 'تعیین رمز عبور ویژه پنل مدیریت' : 'بازنشانی رمز عبور کاربر'}
                              </label>
                              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="w-full md:w-1/2 relative">
                                  <input 
                                    type="text" 
                                    dir="ltr"
                                    disabled={!canEditPersonalInfo && !canGrantAdmin}
                                    placeholder="رمز جدید (در صورت عدم نیاز خالی بگذارید)"
                                    value={editFormData.newPassword || ''}
                                    onChange={(e) => setEditFormData({...editFormData, newPassword: e.target.value})}
                                    className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white outline-none text-left font-sans shadow-inner tracking-widest placeholder:tracking-normal placeholder:text-gray-500 transition-colors select-text disabled:opacity-50 ${editFormData.isAdmin || selectedUser.isSuperAdmin ? 'focus:border-emerald-500' : 'focus:border-[#8b5cf6]'}`}
                                  />
                                  <Icon name="lockKey" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5 px-2">
                                  <p className="text-[10px] md:text-[11px] font-sans font-bold flex items-center gap-1.5">
                                    وضعیت فعلی: 
                                    {selectedUser.password ? (
                                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shadow-inner">رمز عبور فعال است</span>
                                    ) : (
                                      <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded shadow-inner">بدون رمز عبور (فقط پیامک)</span>
                                    )}
                                  </p>
                                  <p className="text-[9px] md:text-[10px] text-gray-500 font-sans leading-relaxed text-justify select-text">
                                    رمز عبور کاربران به صورت یک‌طرفه هش و در دیتابیس مخفی می‌شود. شما فقط می‌توانید رمز جدید تعیین کنید.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-8 border-t border-white/10 mt-6">
                            <button type="button" onClick={handleSaveEdit} className="px-8 py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer flex items-center gap-2 font-sans border border-transparent w-full sm:w-auto justify-center">
                              ذخیره
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                          <div className="col-span-1 md:col-span-3 flex flex-col sm:flex-row gap-4 mb-4">
                            <div className={`flex-1 p-5 rounded-2xl border shadow-inner ${selectedUser.isSuperAdmin ? 'bg-fuchsia-600/10 border-fuchsia-500/20' : selectedUser.isAdmin ? 'bg-amber-500/10 border-amber-500/20' : 'bg-black/20 border-transparent'}`}>
                               <span className={`block mb-2 text-xs font-bold font-sans items-center gap-1.5 ${selectedUser.isSuperAdmin ? 'text-fuchsia-400' : selectedUser.isAdmin ? 'text-amber-400' : 'text-gray-400'}`}>
                                 نوع حساب
                               </span>
                               <span className="text-white font-bold text-sm font-sans flex items-center gap-2 select-text">
                                 {selectedUser.isSuperAdmin ? 'مدیر کل' : selectedUser.isAdmin ? 'مدیر پنل' : 'کاربر عادی'}
                               </span>
                            </div>

                            <div className="flex-1 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-inner">
                               <span className="text-emerald-400/80 block mb-2 text-xs font-bold font-sans items-center gap-1.5">وضعیت ورود با رمز</span>
                               <span className="text-white font-bold text-sm font-sans flex items-center gap-2 select-text">
                                 {selectedUser.password ? (
                                   <>رمز ثابت ثبت شده است</>
                                 ) : (
                                   <>فاقد رمز ثابت (فقط پیامک)</>
                                 )}
                               </span>
                            </div>
                          </div>

                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">جنسیت</span><span className="text-white font-bold font-sans text-sm select-text">{selectedUser.gender === 'MALE' ? 'مرد' : selectedUser.gender === 'FEMALE' ? 'زن' : 'نامشخص'}</span></div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">تاریخ تولد</span><span className="text-white font-bold font-sans dir-ltr text-right block text-sm select-text">{selectedUser.birthYear ? toPersianDigits(selectedUser.birthYear) : 'نامشخص'}</span></div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">استان و شهر</span><span className="text-white font-bold font-sans text-sm select-text">{selectedUser.province || selectedUser.city ? `${selectedUser.province || ''} / ${selectedUser.city || ''}` : 'نامشخص'}</span></div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">مدرک و رشته</span><span className="text-white font-bold font-sans text-sm select-text">{selectedUser.educationDegree || selectedUser.major ? `${selectedUser.educationDegree || ''} - ${selectedUser.major || ''}` : 'نامشخص'}</span></div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">ایمیل</span><span className="text-white font-bold font-sans text-sm block truncate select-text" dir="ltr">{selectedUser.email || 'نامشخص'}</span></div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-2 text-[11px] font-sans font-bold">حوزه فعالیت هنری</span><span className="text-white font-bold font-sans text-sm select-text">{selectedUser.artResearchField || 'نامشخص'}</span></div>
                          <div className="col-span-1 md:col-span-3 bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner"><span className="text-gray-500 block mb-3 text-[11px] font-sans font-bold">زمینه‌های تمایل به همکاری</span><p className="text-white font-light text-sm text-justify leading-relaxed font-sans select-text">{selectedUser.cooperationInterests || 'تکمیل نشده است.'}</p></div>
                        </div>
                      )
                    )}

                    {profileTab === 'activity' && (
                      <div className="space-y-6">
                        <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-3 font-sans">خلاصه تعاملات و نظرات کاربر با پلتفرم مدار</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-cyan-500/5 p-5 rounded-2xl flex items-center justify-between border border-cyan-500/10 shadow-inner">
                            <div><p className="text-cyan-400/80 text-[11px] font-bold mb-1.5 font-sans">فایل‌های دانلود شده</p><p className="text-2xl font-black text-cyan-400 font-sans">{toPersianDigits(uniqueActivityDownloads.length)} <span className="text-[10px] text-cyan-400/50">مورد یکتا</span></p></div>
                            <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20"><Icon name="download" className="w-7 h-7" /></div>
                          </div>
                          <div className="bg-rose-500/5 p-5 rounded-2xl flex items-center justify-between border border-rose-500/10 shadow-inner">
                            <div><p className="text-rose-400/80 text-[11px] font-bold mb-1.5 font-sans">علاقه‌مندی‌ها</p><p className="text-2xl font-black text-rose-400 font-sans">{toPersianDigits(userActivityDetails?.favorites?.length || 0)} <span className="text-[10px] text-rose-400/50">مورد</span></p></div>
                            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20"><Icon name="heart" className="w-7 h-7" /></div>
                          </div>
                          <div className="bg-emerald-500/5 p-5 rounded-2xl flex items-center justify-between border border-emerald-500/10 shadow-inner">
                            <div><p className="text-emerald-400/80 text-[11px] font-bold mb-1.5 font-sans">نظرات ثبت شده</p><p className="text-2xl font-black text-emerald-400 font-sans">{toPersianDigits(userActivityDetails?.comments?.length || 0)} <span className="text-[10px] text-emerald-400/50">نظر</span></p></div>
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><Icon name="comment" className="w-7 h-7" /></div>
                          </div>
                        </div>

                        <div className="bg-black/30 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                          {activityLoading ? (
                            <div className="py-16 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#8b5cf6]" /></div>
                          ) : userActivityDetails ? (
                            <>
                              <div className="flex gap-2 border-b border-white/10 p-4 overflow-x-auto hide-scroll bg-black/40 print-hide">
                                <button onClick={() => {setActivitySubTab('COMMENTS'); setVisibleActivityCount(10);}} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'COMMENTS' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-inner' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>نظرات ({toPersianDigits(userActivityDetails.comments.length)})</button>
                                <button onClick={() => {setActivitySubTab('DOWNLOADS'); setVisibleActivityCount(10);}} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'DOWNLOADS' ? 'bg-cyan-500/20 text-cyan-400 shadow-inner' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>دانلودها ({toPersianDigits(uniqueActivityDownloads.length)})</button>
                                <button onClick={() => {setActivitySubTab('FAVORITES'); setVisibleActivityCount(10);}} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'FAVORITES' ? 'bg-rose-500/20 text-rose-400 shadow-inner' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>علاقه‌مندی‌ها ({toPersianDigits(userActivityDetails.favorites.length)})</button>
                              </div>
                              <div className="p-5 bg-transparent max-h-[50vh] overflow-y-auto custom-scrollbar">
                                {renderActivityList()}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {profileTab === 'notifications' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <h3 className="font-bold text-white font-sans">صندوق اعلانات این کاربر</h3>
                          {can('NOTIF_CREATE') && (
                            <button onClick={() => setDirectNotifModal(true)} className="bg-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-sans border border-transparent shadow-inner hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                              <Icon name="bell" className="w-4 h-4" /> ارسال پیام اختصاصی
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner max-h-[55vh] overflow-y-auto custom-scrollbar">
                          {activityLoading ? (
                             <div className="py-10 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#8b5cf6]" /></div>
                          ) : !userActivityDetails?.notifications || userActivityDetails.notifications.length === 0 ? (
                             <div className="text-center py-10 text-gray-500 font-bold font-sans">این کاربر هیچ اعلانی در داشبورد خود ندارد.</div>
                          ) : (
                             userActivityDetails.notifications.map((un, i) => {
                               const nData = un.notification;
                               return (
                                 <div 
                                   key={i} 
                                   onClick={() => setSelectedUserNotif(nData)}
                                   className={`cursor-pointer bg-white/5 p-4 rounded-xl flex gap-4 border border-transparent shadow-inner transition-colors hover:bg-white/10 ${un.isRead ? 'opacity-70 hover:opacity-100' : 'border-white/10 bg-white/10'}`}
                                 >
                                   <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                                     <Icon name={un.isRead ? "checkCircle" : "clock"} className={`w-5 h-5 ${un.isRead ? 'text-gray-400' : 'text-emerald-400'}`} />
                                   </div>
                                   <div className="flex-1">
                                     <div className="flex justify-between items-center mb-1">
                                       <h4 className="font-bold text-sm text-white font-sans select-text">{nData.title || 'بدون عنوان'}</h4>
                                       <span className={`text-[10px] font-sans ${un.isRead ? 'text-emerald-400' : 'text-amber-400'}`}>
                                         {un.isRead ? `دیده شده در ${toPersianDigits(new Date(un.readAt).toLocaleDateString('fa-IR'))}` : 'هنوز ندیده است'}
                                       </span>
                                     </div>
                                     <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 select-text" dangerouslySetInnerHTML={{ __html: nData.bodyHtml || '' }}></p>
                                   </div>
                                 </div>
                               );
                             })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* مودال مشاهده جزئیات اعلان کاربر در پروفایل */}
      <AnimatePresence>
        {selectedUserNotif && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans select-none">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedUserNotif(null)}></div>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 15 }} 
                className="relative z-10 bg-[#0f172a]/95 backdrop-blur-3xl rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col max-h-[85vh]" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-1.5 h-full z-20" style={{ backgroundColor: selectedUserNotif.themeColor || '#10b981' }}></div>
                <button onClick={() => setSelectedUserNotif(null)} className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white hover:bg-rose-500 transition-colors cursor-pointer z-30 shadow-inner border border-white/10">
                  <Icon name="close" className="w-4 h-4" />
                </button>

                <div className="overflow-y-auto custom-scrollbar relative z-10">
                  {selectedUserNotif.coverUrl && (
                    <div className="w-full aspect-video sm:aspect-[21/9] bg-black/60 relative shrink-0 border-b border-white/10 shadow-inner">
                      <img src={selectedUserNotif.coverUrl} alt="cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="p-5 sm:p-8">
                    <div className="flex gap-3 md:gap-4 items-start mb-5 md:mb-6">
                      {selectedUserNotif.iconUrl ? (
                        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
                          <img src={selectedUserNotif.iconUrl} className="w-7 h-7 object-contain" alt="icon" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
                          <Icon name="bell" className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-base md:text-xl text-white mb-2 font-sans leading-snug pr-2 drop-shadow-md select-text">{selectedUserNotif.title}</h3>
                        <span className="text-[9px] md:text-[11px] text-gray-400 font-sans block pr-2 bg-black/30 w-max px-2 py-1 rounded-lg border border-transparent shadow-inner select-text">
                          {toPersianDigits(new Date(selectedUserNotif.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
                        </span>
                      </div>
                    </div>

                    <div className="rich-text text-xs md:text-sm text-gray-200 leading-loose font-light font-sans text-justify mb-6 bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner select-text">
                      <div dangerouslySetInnerHTML={{ __html: selectedUserNotif.bodyHtml }} />
                    </div>

                    {safeParse(selectedUserNotif.ctaButtons).length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {safeParse(selectedUserNotif.ctaButtons).map(btn => (
                          <a 
                            key={btn.id} 
                            href={btn.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center text-[10px] md:text-xs px-4 md:px-6 py-3 md:py-3.5 rounded-xl text-white hover:brightness-110 transition-all font-bold font-sans shadow-lg hover:shadow-xl select-text"
                            style={{ backgroundColor: selectedUserNotif.themeColor || '#10b981' }}
                          >
                            {btn.label}
                          </a>
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