'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { 
  getAllUsersAction, 
  adminCreateUserAction, 
  adminToggleUserStatusAction, 
  adminUpdateUserAction,
  getAdminUserDetailsAction
} from '@/app/actions/admin-users';

import { getAllRolesAction, saveRoleAction, deleteRoleAction } from '@/app/actions/admin-roles';

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

// تابع کمکی برای فرمت کردن دقیق تاریخ و ساعت
const formatDateTime = (dateString) => {
  if (!dateString) return 'نامشخص';
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} - ساعت ${timeStr}`;
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

const PERMISSIONS_LIST = [
  { id: 'MANAGE_USERS', label: 'مدیریت اعضا و کاربران', desc: 'مشاهده، ویرایش و مسدودسازی کاربران سایت' },
  { id: 'MANAGE_ROLES', label: 'مدیریت نقش‌ها', desc: 'ساخت و تغییر سطوح دسترسی (دسترسی حساس)' },
  { id: 'MANAGE_DOSSIERS', label: 'مدیریت پرونده‌ها', desc: 'ساخت، ویرایش و حذف منظومه‌ها و پرونده‌ها' },
  { id: 'MANAGE_CONTENT', label: 'مدیریت محتوا و مقالات', desc: 'تایید، ویرایش و انتشار محتواهای متنی و ویدئویی' },
  { id: 'MANAGE_TAXONOMIES', label: 'مدیریت دسته‌بندی‌ها', desc: 'تعریف و ویرایش هشتگ‌ها، اشخاص و تگ‌ها' },
  { id: 'MANAGE_SETTINGS', label: 'تنظیمات کلان پلتفرم', desc: 'ویرایش هدر، فوتر، تنظیمات هاب و سئو' },
];

const IRAN_PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام", "بوشهر", "تهران", "چهارمحال و بختیاری",
  "خراسان جنوبی", "خراسان رضوی", "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", "گلستان", "گیلان", "لرستان",
  "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

const EDUCATION_DEGREES = [
  "زیر دیپلم", "دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکترا", 
  "سطح ۱ حوزوی", "سطح ۲ حوزوی", "سطح ۳ حوزوی", "سطح ۴ حوزوی"
];

const autofillFixStyle = {
  WebkitBoxShadow: '0 0 0px 1000px #080c16 inset',
  WebkitTextFillColor: 'white',
  transition: 'background-color 5000s ease-in-out 0s'
};

const Tooltip = ({ children, text }) => (
  <div className="relative group/tooltip flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
      <div className="bg-[#0b0f19] text-white text-[10px] py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap font-bold font-sans">
        {text}
      </div>
      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0b0f19] -mt-[1px]"></div>
    </div>
  </div>
);

export default function AdminUsersPage() {
  const [isMounted, setIsMounted] = useState(false); 
  
  const [mainTab, setMainTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
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
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({ id: null, name: '', slug: '', permissions: [] });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
  const [exportModal, setExportModal] = useState(false);
  const [exportFields, setExportFields] = useState({
    id: true, phone: true, name: true, gender: true, birth: true, location: true, role: true, status: true, joined: true
  });

  const pdfRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    const [usersRes, rolesRes] = await Promise.all([getAllUsersAction(), getAllRolesAction()]);
    if (usersRes.success) setUsers(usersRes.data);
    else toast.error(usersRes.error || 'خطا در دریافت لیست کاربران');
    if (rolesRes.success) setRoles(rolesRes.data);
    setLoading(false);
  };

  useEffect(() => { 
    setIsMounted(true);
    loadData(); 
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter]);

  const filteredUsers = users.filter(u => {
    const matchSearch = u.phone.includes(searchQuery) || (u.firstName && u.firstName.includes(searchQuery)) || (u.lastName && u.lastName.includes(searchQuery));
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchRole = roleFilter === 'ALL' ? true : (roleFilter === 'USER' ? !u.roleId : u.roleId === roleFilter);
    return matchSearch && matchStatus && matchRole;
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

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setEditFormData({ ...user, roleId: user.roleId || '' });
    setIsEditMode(false);
    setProfileTab('info');
    setUserActivityDetails(null); 
  };

  useEffect(() => {
    if (profileTab === 'activity' && selectedUser && !userActivityDetails) {
      const fetchDetails = async () => {
        setActivityLoading(true);
        const res = await getAdminUserDetailsAction(selectedUser.id);
        if (res.success) {
          setUserActivityDetails(res.data);
        } else {
          toast.error(res.error);
        }
        setActivityLoading(false);
      };
      fetchDetails();
    }
  }, [profileTab, selectedUser]);

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

  const renderActivityList = () => {
    let list = [];
    if (activitySubTab === 'COMMENTS') list = userActivityDetails?.comments || [];
    if (activitySubTab === 'DOWNLOADS') list = uniqueActivityDownloads || [];
    if (activitySubTab === 'FAVORITES') list = userActivityDetails?.favorites || [];

    const visibleList = list.slice(0, visibleActivityCount);

    if (list.length === 0) {
      return <div className="py-10 text-center text-gray-500 text-xs font-bold bg-[#0b0f19] rounded-xl font-sans">هیچ موردی برای نمایش وجود ندارد.</div>;
    }

    return (
      <div className="space-y-4">
        {visibleList.map((item, idx) => {
          const content = item.content;
          if (!content) return null;
          const typeInfo = getContentTypeLabel(content.type);

          return (
            <div key={idx} className="bg-white/5 rounded-xl p-4 shadow-inner">
               <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                  <a href={`/${content.type === 'BLOG' ? 'blog' : 'p'}/${content.slug}`} target="_blank" className="text-sm font-bold text-[#8b5cf6] hover:text-white transition-colors line-clamp-1 leading-relaxed font-sans">{content.titleBase} {content.titleHighlight}</a>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 font-sans ${typeInfo.color}`}>{typeInfo.label}</span>
               </div>
               
               {activitySubTab === 'COMMENTS' && (
                 <div className="mb-3">
                   <div className="mb-2">
                     <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-sans ${item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : item.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                       {item.status === 'APPROVED' ? 'تایید شده' : item.status === 'REJECTED' ? 'رد شده' : 'در انتظار بررسی'}
                     </span>
                   </div>
                   <p className="text-xs text-gray-300 leading-relaxed bg-[#080c16] p-3 rounded-lg font-sans border border-transparent shadow-inner">{item.text}</p>
                 </div>
               )}

               <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-sans bg-black/20 px-2 py-1 rounded w-fit">
                  <Icon name="calendarBlank" className="w-3 h-3" />
                  {toPersianDigits(formatDateTime(item.createdAt))}
               </div>
            </div>
          )
        })}

        {visibleActivityCount < list.length && (
          <div className="pt-2 text-center">
             <button onClick={() => setVisibleActivityCount(v => v + 10)} className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans shadow-inner">
               نمایش موارد بیشتر (مجموع: {toPersianDigits(list.length)})
             </button>
          </div>
        )}
      </div>
    )
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
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

  const handleSaveEdit = async () => {
    const submitData = { ...editFormData, phone: toEnglishDigits(editFormData.phone || '') };
    const res = await adminUpdateUserAction(selectedUser.id, submitData);
    if (res.success) {
      toast.success(res.message);
      setIsEditMode(false);
      const assignedRole = roles.find(r => r.id === submitData.roleId);
      setSelectedUser({ ...selectedUser, ...submitData, role: assignedRole || null });
      loadData();
    } else toast.error(res.error);
  };

  const openRoleModal = (role = null) => {
    if (role) {
      setRoleFormData({ id: role.id, name: role.name, slug: role.slug, permissions: role.permissions || [] });
    } else {
      setRoleFormData({ id: null, name: '', slug: '', permissions: [] });
    }
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setRoleFormData(prev => {
      const hasPerm = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: hasPerm ? prev.permissions.filter(p => p !== permId) : [...prev.permissions, permId]
      };
    });
  };

  const handleSaveRole = async () => {
    if (!roleFormData.name || !roleFormData.slug) return toast.error('نام و شناسه لاتین الزامی است.');
    const res = await saveRoleAction(roleFormData);
    if (res.success) {
      toast.success(res.message);
      setIsRoleModalOpen(false);
      loadData();
    } else toast.error(res.error);
  };

  const askDeleteRole = (role) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف سطح دسترسی',
      message: `آیا از حذف نقش «${role.name}» اطمینان دارید؟ (اگر کاربری دارای این نقش باشد، سیستم از حذف جلوگیری می‌کند)`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        const res = await deleteRoleAction(role.id);
        if (res.success) {
          toast.success(res.message);
          loadData();
        } else toast.error(res.error);
      }
    });
  };

  const handleExportCSV = () => {
    const headers = [];
    if (exportFields.id) headers.push('شناسه');
    if (exportFields.phone) headers.push('موبایل');
    if (exportFields.name) headers.push('نام و نام خانوادگی');
    if (exportFields.gender) headers.push('جنسیت');
    if (exportFields.birth) headers.push('سال تولد');
    if (exportFields.location) headers.push('استان و شهر');
    if (exportFields.role) headers.push('سطح دسترسی');
    if (exportFields.status) headers.push('وضعیت');
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
        if (exportFields.role) row.push(u.role?.name || 'کاربر عادی');
        if (exportFields.status) row.push(u.status === 'ACTIVE' ? 'فعال' : 'مسدود');
        if (exportFields.joined) row.push(new Date(u.createdAt).toLocaleDateString('fa-IR'));
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `madar_filtered_users_${new Date().getTime()}.csv`);
    link.click();
    setExportModal(false);
    toast.success('خروجی اکسل با موفقیت ایجاد شد.');
  };

  // ================= سیستم خروجی هوشمند PDF (اصلاح شده) =================
  const handleExportPDF = async () => {
    const toastId = toast.loading('در حال دریافت اطلاعات و آماده‌سازی فایل PDF...');
    try {
      let fullDetails = userActivityDetails;
      if (!fullDetails) {
        const res = await getAdminUserDetailsAction(selectedUser.id);
        if (res.success) {
          fullDetails = res.data;
          setUserActivityDetails(res.data);
        } else {
          toast.error('خطا در دریافت جزئیات کاربر برای PDF', { id: toastId });
          return;
        }
      }

      // وقفه کمی بیشتر برای اطمینان از رندر کامل اطلاعات در قالب مخفی
      setTimeout(async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = pdfRef.current;
        
        const opt = {
          margin:       10,
          filename:     `Madar_User_${selectedUser.phone}.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        toast.success('فایل PDF با موفقیت دانلود شد.', { id: toastId });
      }, 800);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('خطا در ساخت فایل PDF.', { id: toastId });
    }
  };

  if (!isMounted) return null; 

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans text-right select-none pb-20">
      
      {/* هدر صفحه و کارت‌های آماری */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden group">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-90 pointer-events-none z-20" />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 font-sans">
              <Icon name="users" className="w-8 h-8 text-[#8b5cf6]" /> مدیریت اعضا و کاربران
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-xl leading-relaxed font-sans">
              داشبورد جامع مدیریت مخاطبان مدار. نظارت بر نشست‌ها، مسدودسازی، ویرایش مشخصات، و تخصیص سطوح دسترسی (نقش‌ها).
            </p>
          </div>
          
          <div className="flex bg-[#080c16] p-1.5 rounded-2xl shadow-inner border border-transparent w-full lg:w-auto">
            <button onClick={() => setMainTab('users')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${mainTab === 'users' ? 'bg-[#8b5cf6]/20 text-white border border-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'text-gray-400 hover:text-white'}`}>لیست کاربران</button>
            <button onClick={() => setMainTab('roles')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-sans cursor-pointer ${mainTab === 'roles' ? 'bg-[#f59e0b]/20 text-white border border-transparent shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-gray-400 hover:text-white'}`}>سطوح دسترسی (نقش‌ها)</button>
          </div>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center border border-transparent shadow-inner">
            <span className="text-gray-400 text-xs font-bold mb-1 font-sans">کل کاربران سایت</span>
            <span className="text-2xl font-black text-white font-sans">{toPersianDigits(stats.total)}</span>
          </div>
          <div className="bg-emerald-500/5 border border-transparent rounded-2xl p-4 flex flex-col justify-center shadow-inner">
            <span className="text-emerald-400/80 text-xs font-bold mb-1 font-sans">کاربران فعال</span>
            <span className="text-2xl font-black text-emerald-400 font-sans">{toPersianDigits(stats.active)}</span>
          </div>
          <div className="bg-rose-500/5 border border-transparent rounded-2xl p-4 flex flex-col justify-center shadow-inner">
            <span className="text-rose-400/80 text-xs font-bold mb-1 font-sans">مسدود شده</span>
            <span className="text-2xl font-black text-rose-400 font-sans">{toPersianDigits(stats.banned)}</span>
          </div>
          <div className="bg-[#8b5cf6]/5 border border-transparent rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-inner">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#8b5cf6]/20 rounded-full blur-xl" />
            <span className="text-[#8b5cf6]/80 text-xs font-bold mb-1 font-sans">عضویت هفته اخیر</span>
            <span className="text-2xl font-black text-[#8b5cf6] font-sans">{toPersianDigits(stats.newThisWeek)} <span className="text-[10px] text-[#8b5cf6]/60">نفر</span></span>
          </div>
        </div>
      </motion.div>

      {/* محتوای اصلی */}
      <AnimatePresence mode="wait">
        
        {/* ======================= تب لیست کاربران ======================= */}
        {mainTab === 'users' ? (
          <motion.div key="usersTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden min-h-[500px] flex flex-col border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            
            <div className="p-6 border-b border-white/10 flex flex-col lg:flex-row gap-4 justify-between items-center bg-black/20 shrink-0">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Icon name="search" className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو موبایل، نام..." 
                    className="w-full bg-[#080c16] rounded-xl py-3 pr-12 pl-4 text-sm text-white outline-none focus:border focus:border-[#8b5cf6] border border-transparent transition-all shadow-inner font-sans"
                  />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#080c16] rounded-xl px-4 py-3 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-transparent appearance-none cursor-pointer flex-1 sm:flex-none font-sans">
                    <option value="ALL">وضعیت: همه</option>
                    <option value="ACTIVE">فقط فعال‌ها</option>
                    <option value="BANNED">فقط مسدودها</option>
                  </select>
                  
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-[#080c16] rounded-xl px-4 py-3 text-xs text-gray-300 outline-none focus:border focus:border-[#8b5cf6] border border-transparent appearance-none cursor-pointer flex-1 sm:flex-none font-sans">
                    <option value="ALL">سطح دسترسی: همه نقش‌ها</option>
                    <option value="USER">کاربر عادی (بدون نقش)</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <Tooltip text="خروجی پیشرفته و فیلتردار اکسل">
                  <button onClick={() => setExportModal(true)} className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all cursor-pointer border border-transparent shadow-inner">
                    <Icon name="download" className="w-5 h-5" />
                  </button>
                </Tooltip>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-6 h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer font-sans border border-transparent">
                  <Icon name="plus" className="w-4 h-4" /> افزودن کاربر
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1 relative z-10">
              <table className="w-full text-sm text-right text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5 font-bold font-sans">موبایل / مشخصات</th>
                    <th className="px-6 py-5 font-bold font-sans">سطح دسترسی</th>
                    <th className="px-6 py-5 font-bold font-sans">آمار فعالیت</th>
                    <th className="px-6 py-5 font-bold text-center font-sans">وضعیت حساب</th>
                    <th className="px-6 py-5 font-bold text-center font-sans">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-20"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#8b5cf6]" /></td></tr>
                  ) : currentUsers.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-20 text-gray-500 font-bold font-sans">هیچ کاربری با این مشخصات یافت نشد.</td></tr>
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group/row">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-sans font-bold text-white text-base" dir="ltr">{toPersianDigits(u.phone)}</span>
                            <span className="text-xs text-gray-500 mt-1 font-sans">{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'بدون نام'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap font-sans border border-transparent shadow-inner ${u.role ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'bg-white/5 text-gray-400'}`}>
                            {u.role?.name || 'کاربر عادی'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-xs font-bold font-sans">
                            <Tooltip text="تعداد فایل‌های دانلود شده"><span className="flex items-center gap-1.5 text-cyan-400"><Icon name="download" className="w-4 h-4"/> {toPersianDigits(u._count?.downloads || 0)}</span></Tooltip>
                            <Tooltip text="تعداد علاقه‌مندی‌ها"><span className="flex items-center gap-1.5 text-rose-400"><Icon name="heart" className="w-4 h-4"/> {toPersianDigits(u._count?.favorites || 0)}</span></Tooltip>
                            <Tooltip text="تعداد نظرات ثبت شده"><span className="flex items-center gap-1.5 text-emerald-400"><Icon name="message" className="w-4 h-4"/> {toPersianDigits(u._count?.comments || 0)}</span></Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 font-sans border border-transparent shadow-inner ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                            {u.status === 'ACTIVE' ? 'فعال' : 'مسدود'}
                          </span>
                        </td>
                        {/* دکمه‌های عملیات مدیریت همیشه نمایان */}
                        <td className="px-6 py-4 flex justify-center gap-2 opacity-100 transition-opacity">
                          <Tooltip text="مشاهده پروفایل و تاریخچه کامل فعالیت">
                            <button onClick={() => handleOpenProfile(u)} className="p-2.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner">
                              <Icon name="user" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip text={u.status === 'ACTIVE' ? "مسدود کردن حساب" : "فعال‌سازی حساب"}>
                            <button onClick={() => askToggleStatus(u.id, u.status)} className={`p-2.5 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner ${u.status === 'ACTIVE' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>
                              <Icon name="lock" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* کنترل‌های صفحه‌بندی */}
            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between shrink-0 relative z-10">
                <span className="text-xs text-gray-500 font-sans">
                  نمایش {toPersianDigits(indexOfFirstUser + 1)} تا {toPersianDigits(Math.min(indexOfLastUser, filteredUsers.length))} از {toPersianDigits(filteredUsers.length)}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white cursor-pointer border border-transparent">
                    <Icon name="chevronRight" className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-white bg-[#8b5cf6] w-8 h-8 flex items-center justify-center rounded-lg font-sans shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    {toPersianDigits(currentPage)}
                  </span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white cursor-pointer border border-transparent">
                    <Icon name="chevronLeft" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        ) : (
          
          /* ======================= تب مدیریت دسترسی‌ها (Roles) ======================= */
          <motion.div key="rolesTab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden min-h-[500px] border border-transparent">
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
            
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20 relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 font-sans">
                <Icon name="shield" className="w-6 h-6 text-[#f59e0b]" /> تنظیمات RBAC (نقش‌ها و دسترسی‌ها)
              </h2>
              <button onClick={() => openRoleModal()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer whitespace-nowrap font-sans border border-transparent">
                <Icon name="plus" className="w-4 h-4" /> افزودن نقش جدید
              </button>
            </div>

            <div className="p-6 relative z-10">
              {loading ? (
                <div className="py-20 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#f59e0b]" /></div>
              ) : roles.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4 text-gray-500 font-bold font-sans bg-white/5 rounded-2xl shadow-inner border border-transparent">
                  <Icon name="info" className="w-12 h-12 opacity-30" />
                  هیچ نقشی در سیستم ثبت نشده است. همه اعضا در سطح کاربر عادی قرار دارند.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map(role => (
                    <div key={role.id} className="bg-white/5 rounded-3xl p-5 hover:border-[#f59e0b]/50 transition-colors flex flex-col border border-transparent shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                      <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
                            {role.name} {role.isSystem && <span className="bg-rose-500/20 text-rose-400 text-[9px] px-2 py-0.5 rounded uppercase font-sans">System</span>}
                          </h3>
                          <span className="text-[10px] text-gray-500 font-sans mt-1 block" dir="ltr">@{role.slug}</span>
                        </div>
                        <span className="bg-black/30 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 font-sans border border-white/5 shadow-inner">
                          <Icon name="users" className="w-3 h-3 text-gray-500" />
                          {toPersianDigits(role._count?.users || 0)} نفر
                        </span>
                      </div>
                      
                      <div className="flex-1 mb-6">
                        <p className="text-[10px] text-gray-500 mb-3 font-bold font-sans">مجوزهای فعال:</p>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(p => {
                            const perm = PERMISSIONS_LIST.find(x => x.id === p);
                            return (
                              <span key={p} className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] whitespace-nowrap font-sans border border-transparent shadow-inner">
                                {perm ? perm.label : p}
                              </span>
                            );
                          })}
                          {role.permissions.length === 0 && (
                            <span className="text-xs text-gray-600 bg-black/20 px-3 py-1 rounded font-sans border border-transparent shadow-inner">بدون دسترسی مدیریتی</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-white/10 mt-auto">
                        <button onClick={() => openRoleModal(role)} className="flex-1 py-2.5 bg-white/5 hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] text-gray-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans border border-transparent shadow-inner">
                          ویرایش مجوزها
                        </button>
                        {!role.isSystem && (
                          <Tooltip text="حذف نقش">
                            <button onClick={() => askDeleteRole(role)} className="px-4 py-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال ساخت و ویرایش نقش کاربری */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsRoleModalOpen(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-2xl bg-[#0b0f19]/90 backdrop-blur-2xl rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-transparent">
              
              <div className="bg-transparent border-b border-white/10 p-5 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
                  <Icon name="shield" className="w-5 h-5 text-[#f59e0b]" /> {roleFormData.id ? 'ویرایش مجوزهای دسترسی' : 'ایجاد نقش جدید'}
                </h2>
                <button onClick={() => setIsRoleModalOpen(false)} className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-xl cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-4 h-4" /></button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-sans">نام نقش (فارسی)</label>
                    <input type="text" value={roleFormData.name} onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})} placeholder="مثال: سردبیر ارشد" className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#f59e0b] outline-none font-sans border border-transparent shadow-inner" style={autofillFixStyle} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-sans">شناسه لاتین (یکتا)</label>
                    <input type="text" dir="ltr" value={roleFormData.slug} onChange={(e) => setRoleFormData({...roleFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="مثال: chief-editor" className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#f59e0b] outline-none text-left font-sans border border-transparent shadow-inner" style={autofillFixStyle} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2 font-sans">تعیین ماژول‌های مجاز برای این نقش</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS_LIST.map(perm => {
                      const isSelected = roleFormData.permissions.includes(perm.id);
                      return (
                        <div key={perm.id} onClick={() => handleTogglePermission(perm.id)} className={`p-4 rounded-xl cursor-pointer transition-all flex gap-3 border border-transparent shadow-inner ${isSelected ? 'bg-emerald-500/10' : 'bg-white/5 hover:bg-white/10'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 transition-colors border border-transparent ${isSelected ? 'bg-emerald-500' : 'bg-black/30'}`}>
                            {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h5 className={`text-sm font-bold mb-1 transition-colors font-sans ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>{perm.label}</h5>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-sans">{perm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-white/10 bg-black/20 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors cursor-pointer font-sans border border-transparent shadow-inner">انصراف</button>
                <button onClick={handleSaveRole} className="px-8 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer font-sans border border-transparent">
                  ذخیره نقش
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال تایید (Confirm) - عمومی */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#0b0f19]/90 backdrop-blur-2xl p-6 rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] text-center border border-transparent">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-transparent shadow-inner ${confirmModal.isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Icon name={confirmModal.isDanger ? 'shield' : 'checkCircle'} className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-sans">{confirmModal.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-8 font-sans">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button onClick={confirmModal.onConfirm} className={`flex-1 py-3 text-white rounded-xl text-sm font-bold transition-all cursor-pointer font-sans border border-transparent ${confirmModal.isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>بله، تایید می‌کنم</button>
                <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false })} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors cursor-pointer font-sans border border-transparent shadow-inner">انصراف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال خروجی اکسل */}
      <AnimatePresence>
        {exportModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-md bg-[#0b0f19]/90 backdrop-blur-2xl p-6 rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] border border-transparent">
               <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2"><Icon name="download" className="w-5 h-5 text-emerald-400" /> تنظیمات خروجی اکسل</h3>
                 <button onClick={() => setExportModal(false)} className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 rounded-lg cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-4 h-4" /></button>
               </div>
               <p className="text-xs text-gray-400 mb-6">ستون‌هایی که می‌خواهید در فایل اکسل خروجی گرفته شوند را انتخاب کنید:</p>
               <div className="grid grid-cols-2 gap-4 mb-8">
                 {Object.keys(exportFields).map(key => {
                   const labels = { id: 'شناسه یکتا', phone: 'موبایل', name: 'نام و نام خانوادگی', gender: 'جنسیت', birth: 'سال/تاریخ تولد', location: 'استان و شهر', role: 'نقش کاربری', status: 'وضعیت حساب', joined: 'تاریخ عضویت' };
                   return (
                     <label key={key} className="flex items-center gap-3 cursor-pointer group bg-white/5 p-2 rounded-xl border border-transparent shadow-inner">
                       <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border border-transparent ${exportFields[key] ? 'bg-emerald-500' : 'bg-black/30'}`}>
                         {exportFields[key] && <Icon name="checkCircle" className="w-3 h-3 text-white" />}
                       </div>
                       <input type="checkbox" className="hidden" checked={exportFields[key]} onChange={() => setExportFields(prev => ({ ...prev, [key]: !prev[key] }))} />
                       <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-sans">{labels[key]}</span>
                     </label>
                   )
                 })}
               </div>
               <button onClick={handleExportCSV} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer font-sans border border-transparent">تولید و دانلود فایل اکسل</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* مودال پروفایل کاربر و ویرایش (اعمال نقش) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-[#050810]/40 backdrop-blur-xl">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedUser(null)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 w-full max-w-5xl max-h-[95vh] bg-[#0b0f19]/90 backdrop-blur-2xl rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-transparent">
              
              <div className="bg-transparent border-b border-white/10 p-5 flex flex-wrap justify-between items-center z-20 shrink-0 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-transparent shadow-inner ${selectedUser.roleId ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-[#8b5cf6]/20 text-[#8b5cf6]'}`}>
                    <Icon name={selectedUser.roleId ? 'shield' : 'user'} className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight flex items-center gap-2 font-sans">
                      {selectedUser.firstName || selectedUser.lastName ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}` : 'پروفایل کاربری'}
                      {selectedUser.role?.name && <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-sans border border-transparent shadow-inner">{selectedUser.role.name}</span>}
                    </h2>
                    <span className="text-[10px] text-gray-500 font-sans block mt-1" dir="ltr">{toPersianDigits(selectedUser.phone)} | #{selectedUser.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 print-hide">
                  <Tooltip text="خروجی PDF مناسب چاپ">
                    <button onClick={handleExportPDF} className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-transparent shadow-inner flex items-center gap-2 font-sans">
                      <Icon name="download" className="w-4 h-4" /> <span className="hidden sm:inline">خروجی PDF</span>
                    </button>
                  </Tooltip>
                  <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans border border-transparent shadow-inner ${isEditMode ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                    {isEditMode ? 'لغو ویرایش' : 'ویرایش مشخصات'}
                  </button>
                  <button onClick={() => setSelectedUser(null)} className="p-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer border border-transparent shadow-inner"><Icon name="close" className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                <div className="flex gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto hide-scroll print-hide">
                  {[
                    { id: 'info', label: 'اطلاعات فردی و نقش', icon: 'idCard' },
                    { id: 'activity', label: 'تاریخچه فعالیت', icon: 'trend' },
                    { id: 'sessions', label: 'نشست‌ها و امنیت', icon: 'shield' },
                    { id: 'notifications', label: 'صندوق اعلانات', icon: 'bell' },
                  ].map(tab => (
                    <button 
                      key={tab.id} onClick={() => { setProfileTab(tab.id); setIsEditMode(false); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer font-sans border border-transparent ${profileTab === tab.id ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 shadow-inner'}`}
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
                          
                          <div className="lg:col-span-3 bg-fuchsia-500/5 p-5 rounded-2xl mb-2 border border-transparent shadow-inner">
                            <label className="text-xs text-fuchsia-400 mb-3 font-bold flex items-center gap-2 font-sans">
                              <Icon name="shield" className="w-4 h-4" /> تخصیص سطح دسترسی (RBAC)
                            </label>
                            <select 
                              value={editFormData.roleId || ''} 
                              onChange={(e) => setEditFormData({...editFormData, roleId: e.target.value === '' ? null : e.target.value})} 
                              className="w-full md:w-1/2 bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-fuchsia-500 outline-none appearance-none cursor-pointer font-sans border border-transparent shadow-inner"
                            >
                              <option value="">کاربر عادی (بدون دسترسی مدیریت)</option>
                              {roles.map(r => (
                                <option key={r.id} value={r.id} className="bg-[#0b0f19]">{r.name} - {r.permissions.length} مجوز</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-3 font-sans">تغییر نقش باعث اعطا یا سلب فوری مجوزهای مدیریتی برای این شخص می‌شود.</p>
                          </div>

                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">نام</label><input type="text" value={editFormData.firstName || ''} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">نام خانوادگی</label><input type="text" value={editFormData.lastName || ''} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          
                          <div>
                            <label className="block text-xs text-amber-400 mb-2 font-bold font-sans">شماره موبایل (دقت در ویرایش!)</label>
                            <input type="tel" dir="ltr" value={toPersianDigits(editFormData.phone || '')} onChange={(e) => {
                                let val = e.target.value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
                                setEditFormData({...editFormData, phone: val});
                            }} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-amber-500 font-sans text-left border border-transparent shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] outline-none" style={autofillFixStyle} />
                          </div>
                          
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">جنسیت</label>
                            <select value={editFormData.gender || ''} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] appearance-none font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle}>
                              <option value="" className="bg-[#0b0f19]">نامشخص</option><option value="MALE" className="bg-[#0b0f19]">مرد</option><option value="FEMALE" className="bg-[#0b0f19]">زن</option>
                            </select>
                          </div>
                          
                          <div>
                             <label className="block text-xs text-gray-400 mb-2 font-sans">تاریخ تولد (تقویم شمسی)</label>
                             <DatePicker
                                value={editFormData.birthYear || ''}
                                onChange={(date) => setEditFormData({...editFormData, birthYear: date?.format('YYYY/MM/DD') || ''})}
                                calendar={persian}
                                locale={persian_fa}
                                calendarPosition="bottom-right"
                                inputClass="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none"
                                placeholder="انتخاب از تقویم..."
                             />
                          </div>
                          
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">استان</label>
                            <select value={editFormData.province || ''} onChange={(e) => setEditFormData({...editFormData, province: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] appearance-none font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle}>
                              <option value="" className="bg-[#0b0f19]">انتخاب استان...</option>
                              {IRAN_PROVINCES.map(prov => <option key={prov} value={prov} className="bg-[#0b0f19]">{prov}</option>)}
                            </select>
                          </div>
                          
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">شهر</label><input type="text" value={editFormData.city || ''} onChange={(e) => setEditFormData({...editFormData, city: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">مدرک تحصیلی</label>
                             <select value={editFormData.educationDegree || ''} onChange={(e) => setEditFormData({...editFormData, educationDegree: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] appearance-none font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle}>
                              <option value="" className="bg-[#0b0f19]">انتخاب مدرک...</option>
                              {EDUCATION_DEGREES.map(deg => <option key={deg} value={deg} className="bg-[#0b0f19]">{deg}</option>)}
                            </select>
                          </div>
                          
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">رشته تحصیلی</label><input type="text" value={editFormData.major || ''} onChange={(e) => setEditFormData({...editFormData, major: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">ایمیل</label><input type="email" dir="ltr" value={editFormData.email || ''} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] text-left font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          <div><label className="block text-xs text-gray-400 mb-2 font-sans">حوزه فعالیت هنری/پژوهشی</label><input type="text" value={editFormData.artResearchField || ''} onChange={(e) => setEditFormData({...editFormData, artResearchField: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle} /></div>
                          
                          <div className="col-span-1 md:col-span-2 lg:col-span-3"><label className="block text-xs text-gray-400 mb-2 font-sans">زمینه‌های تمایل به همکاری</label><textarea rows="3" value={editFormData.cooperationInterests || ''} onChange={(e) => setEditFormData({...editFormData, cooperationInterests: e.target.value})} className="w-full bg-[#080c16] rounded-xl px-4 py-3 text-sm text-white focus:border focus:border-[#8b5cf6] resize-none font-sans border border-transparent shadow-inner outline-none" style={autofillFixStyle}></textarea></div>
                        </div>
                        <div className="flex justify-end pt-6 border-t border-white/10">
                          <button type="button" onClick={handleSaveEdit} className="px-8 py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer flex items-center gap-2 font-sans border border-transparent">
                            <Icon name="save" className="w-5 h-5" /> ذخیره مشخصات
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-10 text-sm">
                        <div className="col-span-1 md:col-span-3 bg-fuchsia-500/5 p-4 rounded-2xl border border-transparent shadow-[inset_0_0_15px_rgba(217,70,239,0.05)] mb-4">
                           <span className="text-fuchsia-400/80 block mb-2 text-xs font-bold font-sans">سطح دسترسی سیستم (Role)</span>
                           <span className="text-white font-bold text-base font-sans">{selectedUser.role?.name || 'کاربر عادی (بدون مجوز مدیریت)'}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">جنسیت</span><span className="text-white font-bold font-sans">{selectedUser.gender === 'MALE' ? 'مرد' : selectedUser.gender === 'FEMALE' ? 'زن' : 'نامشخص'}</span></div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">تاریخ تولد</span><span className="text-white font-bold font-sans dir-ltr text-right block">{selectedUser.birthYear ? toPersianDigits(selectedUser.birthYear) : 'نامشخص'}</span></div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">استان و شهر</span><span className="text-white font-bold font-sans">{selectedUser.province || selectedUser.city ? `${selectedUser.province || ''} / ${selectedUser.city || ''}` : 'نامشخص'}</span></div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">مدرک و رشته</span><span className="text-white font-bold font-sans">{selectedUser.educationDegree || selectedUser.major ? `${selectedUser.educationDegree || ''} - ${selectedUser.major || ''}` : 'نامشخص'}</span></div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">ایمیل</span><span className="text-white font-bold font-sans" dir="ltr">{selectedUser.email || 'نامشخص'}</span></div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-2 text-xs font-sans">حوزه فعالیت</span><span className="text-white font-bold font-sans">{selectedUser.artResearchField || 'نامشخص'}</span></div>
                        <div className="col-span-1 md:col-span-3 bg-white/5 p-5 rounded-2xl border border-transparent shadow-inner"><span className="text-gray-500 block mb-3 text-xs font-sans">زمینه‌های تمایل به همکاری</span><p className="text-white font-light text-justify leading-relaxed font-sans">{selectedUser.cooperationInterests || 'تکمیل نشده است.'}</p></div>
                      </div>
                    )
                  )}

                  {profileTab === 'activity' && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2 font-sans">خلاصه تعاملات با پلتفرم مدار</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#080c16] p-5 rounded-2xl flex items-center justify-between border border-transparent shadow-[inset_0_0_15px_rgba(6,182,212,0.05)]">
                          <div><p className="text-gray-400 text-xs mb-1 font-sans">فایل‌های دانلود شده</p><p className="text-xl font-bold text-cyan-400 font-sans">{toPersianDigits(uniqueActivityDownloads.length)} <span className="text-[10px] text-cyan-400/50">مورد یکتا</span></p></div>
                          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Icon name="download" className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-[#080c16] p-5 rounded-2xl flex items-center justify-between border border-transparent shadow-[inset_0_0_15px_rgba(244,63,94,0.05)]">
                          <div><p className="text-gray-400 text-xs mb-1 font-sans">علاقه‌مندی‌ها</p><p className="text-xl font-bold text-rose-400 font-sans">{toPersianDigits(userActivityDetails?.favorites?.length || 0)} <span className="text-[10px] text-rose-400/50">مورد</span></p></div>
                          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400"><Icon name="heart" className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-[#080c16] p-5 rounded-2xl flex items-center justify-between border border-transparent shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]">
                          <div><p className="text-gray-400 text-xs mb-1 font-sans">نظرات ثبت شده</p><p className="text-xl font-bold text-emerald-400 font-sans">{toPersianDigits(userActivityDetails?.comments?.length || 0)} <span className="text-[10px] text-emerald-400/50">نظر</span></p></div>
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Icon name="message" className="w-6 h-6" /></div>
                        </div>
                      </div>

                      <div className="bg-[#080c16] rounded-2xl overflow-hidden border border-transparent shadow-inner">
                        {activityLoading ? (
                          <div className="py-12 text-center"><Icon name="loading" className="w-8 h-8 animate-spin mx-auto text-[#8b5cf6]" /></div>
                        ) : userActivityDetails ? (
                          <>
                            <div className="flex gap-2 border-b border-white/10 p-4 overflow-x-auto hide-scroll bg-black/20">
                              <button onClick={() => {setActivitySubTab('COMMENTS'); setVisibleActivityCount(5);}} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'COMMENTS' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 shadow-inner'}`}>نظرات ({toPersianDigits(userActivityDetails.comments.length)})</button>
                              <button onClick={() => {setActivitySubTab('DOWNLOADS'); setVisibleActivityCount(5);}} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'DOWNLOADS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 shadow-inner'}`}>دانلودها ({toPersianDigits(uniqueActivityDownloads.length)})</button>
                              <button onClick={() => {setActivitySubTab('FAVORITES'); setVisibleActivityCount(5);}} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all font-sans border border-transparent ${activitySubTab === 'FAVORITES' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 shadow-inner'}`}>علاقه‌مندی‌ها ({toPersianDigits(userActivityDetails.favorites.length)})</button>
                            </div>
                            
                            <div className="p-5 bg-transparent">
                              {renderActivityList()}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {profileTab === 'sessions' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="font-bold text-white font-sans">تاریخچه نشست‌ها و لاگین</h3>
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-sans">تعداد کل لاگین: {toPersianDigits(14)}</span>
                      </div>
                      <div className="bg-[#080c16] rounded-2xl overflow-hidden border border-transparent shadow-inner">
                        <table className="w-full text-sm text-right text-gray-400">
                          <thead className="bg-black/30 text-xs text-gray-300 font-sans">
                            <tr><th className="px-4 py-3">تاریخ و زمان</th><th className="px-4 py-3">دستگاه و مرورگر</th><th className="px-4 py-3" dir="ltr">آدرس IP</th><th className="px-4 py-3">وضعیت</th></tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans text-xs">
                            <tr><td className="px-4 py-3">۱۴۰۲/۰۹/۱۲ - ۱۴:۳۰</td><td className="px-4 py-3 font-sans">Windows - Chrome</td><td className="px-4 py-3 font-sans" dir="ltr">5.120.15.88</td><td className="px-4 py-3 text-emerald-400">موفق (نشست فعلی)</td></tr>
                            <tr><td className="px-4 py-3">۱۴۰۲/۰۹/۱۰ - ۰۹:۱۵</td><td className="px-4 py-3 font-sans">Android - Safari</td><td className="px-4 py-3 font-sans" dir="ltr">37.152.12.9</td><td className="px-4 py-3 text-emerald-400">موفق</td></tr>
                            <tr><td className="px-4 py-3">۱۴۰۲/۰۸/۲۵ - ۲۲:۰۰</td><td className="px-4 py-3 font-sans">iPhone - Chrome</td><td className="px-4 py-3 font-sans" dir="ltr">91.240.65.11</td><td className="px-4 py-3 text-rose-400">ناموفق (کد اشتباه)</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {profileTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="font-bold text-white font-sans">صندوق اعلانات کاربر</h3>
                        <button className="bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer font-sans border border-transparent shadow-inner hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          <Icon name="bell" className="w-4 h-4" /> ارسال پیام اختصاصی به کاربر
                        </button>
                      </div>
                      <div className="space-y-3">
                         <div className="bg-white/5 p-4 rounded-xl flex gap-4 opacity-70 border border-transparent shadow-inner">
                           <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center shrink-0 border border-white/5"><Icon name="checkCircle" className="w-5 h-5 text-gray-400" /></div>
                           <div>
                             <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-sm text-gray-300 font-sans">خوش‌آمدگویی به مدار</h4><span className="text-[10px] text-gray-500 font-sans">۱۴۰۲/۰۸/۱۵ - مشاهده شده</span></div>
                             <p className="text-xs text-gray-400 font-sans">عضویت شما در شبکه مدار با موفقیت انجام شد.</p>
                           </div>
                         </div>
                         <div className="bg-white/5 border-r-4 border-r-[#8b5cf6] p-4 rounded-xl flex gap-4 border border-transparent shadow-inner">
                           <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center shrink-0 relative border border-transparent">
                             <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-[#080c16]"></span></span>
                             <Icon name="info" className="w-5 h-5 text-[#8b5cf6]" />
                           </div>
                           <div>
                             <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-sm text-white font-sans">انتشار پرونده جدید</h4><span className="text-[10px] text-[#8b5cf6] font-sans">امروز - خوانده نشده</span></div>
                             <p className="text-xs text-gray-300 font-sans">پرونده بررسی اسناد لانه جاسوسی روی پلتفرم قرار گرفت.</p>
                           </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* 
        بخش مخفی جهت تولید فایل PDF کامل 
        این بخش در صفحه دیده نمی‌شود اما به درستی توسط html2canvas پردازش می‌شود
      */}
      {selectedUser && (
        <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
          <div ref={pdfRef} className="w-[800px] p-12 text-gray-900 font-sans" dir="rtl" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
            
            {/* هدر PDF */}
            <div className="border-b-[4px] border-[#8b5cf6] pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 font-sans">شبکه رسانه‌ای مدار</h1>
                <p className="text-lg font-bold text-gray-500 font-sans">گزارش جامع پروفایل و فعالیت‌های کاربر</p>
              </div>
              <div className="text-left text-sm text-gray-500 font-bold font-sans">
                <p>تاریخ گزارش: {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}</p>
                <p>شناسه سیستمی: #{selectedUser.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* اطلاعات فردی */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-[#8b5cf6] mb-4 border-b border-gray-200 pb-2 font-sans">۱. مشخصات فردی و هویتی</h2>
              <div className="grid grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">نام و نام خانوادگی</span><span className="font-bold text-base font-sans">{selectedUser.firstName || selectedUser.lastName ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}` : 'بدون نام'}</span></div>
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">شماره موبایل</span><span className="font-bold text-base font-sans" dir="ltr">{toPersianDigits(selectedUser.phone)}</span></div>
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">سطح دسترسی (نقش)</span><span className="font-bold text-base font-sans">{selectedUser.role?.name || 'کاربر عادی'}</span></div>
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">ایمیل</span><span className="font-bold text-base font-sans" dir="ltr">{selectedUser.email || 'ثبت نشده'}</span></div>
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">استان و شهر</span><span className="font-bold text-base font-sans">{selectedUser.province || selectedUser.city ? `${selectedUser.province || ''} - ${selectedUser.city || ''}` : 'ثبت نشده'}</span></div>
                <div><span className="block text-xs text-gray-500 mb-1 font-sans">تاریخ تولد</span><span className="font-bold text-base font-sans">{selectedUser.birthYear ? toPersianDigits(selectedUser.birthYear) : 'ثبت نشده'}</span></div>
                <div className="col-span-3"><span className="block text-xs text-gray-500 mb-1 font-sans">زمینه‌های همکاری</span><p className="font-bold text-sm leading-relaxed font-sans">{selectedUser.cooperationInterests || 'موردی ثبت نشده است.'}</p></div>
              </div>
            </div>

            {/* آمار فعالیت */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-[#8b5cf6] mb-4 border-b border-gray-200 pb-2 font-sans">۲. آمار کلی فعالیت‌ها در پلتفرم</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#ecfeff] border border-[#a5f3fc] p-5 rounded-2xl text-center">
                  <span className="block text-sm text-[#155e75] font-bold mb-2 font-sans">محتوای دانلود شده</span>
                  <span className="text-3xl font-black text-[#0891b2] font-sans">{toPersianDigits(uniqueActivityDownloads?.length || 0)}</span>
                </div>
                <div className="bg-[#fff1f2] border border-[#fecdd3] p-5 rounded-2xl text-center">
                  <span className="block text-sm text-[#9f1239] font-bold mb-2 font-sans">علاقه‌مندی‌ها</span>
                  <span className="text-3xl font-black text-[#e11d48] font-sans">{toPersianDigits(userActivityDetails?.favorites?.length || 0)}</span>
                </div>
                <div className="bg-[#ecfdf5] border border-[#a7f3d0] p-5 rounded-2xl text-center">
                  <span className="block text-sm text-[#065f46] font-bold mb-2 font-sans">نظرات ثبت شده</span>
                  <span className="text-3xl font-black text-[#059669] font-sans">{toPersianDigits(userActivityDetails?.comments?.length || 0)}</span>
                </div>
              </div>
            </div>

            {/* آخرین نظرات (فقط در صورت وجود) */}
            {userActivityDetails?.comments?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-[#8b5cf6] mb-4 border-b border-gray-200 pb-2 font-sans">۳. آخرین نظرات ثبت شده</h2>
                <div className="space-y-4">
                  {userActivityDetails.comments.slice(0, 5).map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800 font-sans">{comment.content?.titleBase}</span>
                        <span className="text-xs text-gray-500 font-sans">{toPersianDigits(formatDateTime(comment.createdAt))}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed text-justify font-sans">{comment.text}</p>
                      <div className="mt-2 text-xs font-bold text-[#8b5cf6] font-sans">وضعیت: {comment.status === 'APPROVED' ? 'تایید شده' : comment.status === 'REJECTED' ? 'رد شده' : 'در انتظار بررسی'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* فوتر گزارش */}
            <div className="mt-12 text-center text-gray-400 text-xs border-t border-gray-200 pt-6 font-bold font-sans">
              این سند توسط سیستم اتوماسیون داخلی مدار تهیه شده و دارای اعتبار سازمانی است.
            </div>
          </div>
        </div>
      )}
      {/* پایان قالب مخفی PDF */}

    </div>
  );
}