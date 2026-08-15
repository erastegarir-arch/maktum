'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getMedia, updateMedia, deleteMedia, renameMediaFile } from '@/app/actions/media';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// ==========================================
// توابع کمکی مشترک
// ==========================================
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num?.toString().replace(/\d/g, (x) => persianDigits[x]) || '۰';
};

const formatTime = (seconds) => {
  if (isNaN(seconds)) return toPersianDigits("0:00");
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return toPersianDigits(`${m}:${s < 10 ? '0' : ''}${s}`);
};

function Tooltip({ text, children }) {
  if (!text) return children;
  return (
    <div className="relative group/tooltip inline-flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-30 pointer-events-none">
        <div className="bg-[#0b0f19] text-white text-[11px] py-1 px-2.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap font-sans">
          {text}
        </div>
        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0b0f19] -mt-[1px]"></div>
      </div>
    </div>
  );
}

// ==========================================
// ۱. پلیر صوتی اختصاصی
// ==========================================
function CustomAudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const waveformBars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => 25 + Math.abs(Math.sin(i * 0.5) * 50 + Math.cos(i * 1.2) * 25));
  }, []);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (time) => { audioRef.current.currentTime += time; };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    if (dur) {
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleSeek = (e) => {
    const seekTo = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTo;
    setProgress(e.target.value);
  };

  return (
    <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0b0f19] border border-white/10 shadow-2xl flex flex-col gap-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent" />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)} loop={isLooping} className="hidden" />

      <div className="flex items-center justify-center gap-2 px-4">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-600')}></span>
        </span>
        <h4 className="text-white font-bold truncate text-sm dir-rtl">{title || 'فایل صوتی'}</h4>
      </div>

      <div className="relative w-full h-16 flex items-center justify-between gap-[2px]" dir="ltr">
        {waveformBars.map((height, i) => {
          const fillPercentage = (i / waveformBars.length) * 100;
          const isFilled = progress >= fillPercentage;
          return (
            <div 
              key={i} 
              className={cn("flex-1 rounded-full transition-colors duration-150", isFilled ? 'bg-[#06b6d4]' : 'bg-gray-700')} 
              style={{ height: `${height}%` }}
            ></div>
          );
        })}
        <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400" dir="ltr">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative flex items-center justify-center w-full mt-2" dir="ltr">
        <div className="flex items-center gap-6">
          <Tooltip text="۱۵ ثانیه به عقب">
            <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 15l-3-3m0 0l3-3m-3 3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>

          <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
            <button onClick={togglePlay} className="w-16 h-16 flex items-center justify-center bg-[#06b6d4] hover:bg-[#0891b2] rounded-full text-white shadow-lg shadow-[#06b6d4]/20 hover:scale-105 transition-transform cursor-pointer">
              <svg className={cn("w-7 h-7", !isPlaying ? 'ml-1' : '')} fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
          </Tooltip>

          <Tooltip text="۱۵ ثانیه به جلو">
            <button onClick={() => skip(15)} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Tooltip>
        </div>

        <div className="absolute right-0">
          <Tooltip text={isLooping ? 'تکرار: فعال' : 'تکرار: غیرفعال'}>
            <button onClick={() => setIsLooping(!isLooping)} className={cn("p-2 transition-colors cursor-pointer", isLooping ? 'text-[#06b6d4]' : 'text-gray-500 hover:text-gray-300')}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ۲. پلیر ویدیویی اختصاصی
// ==========================================
function CustomVideoPlayer({ src, mimeType, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (time) => { videoRef.current.currentTime += time; };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    if (dur) {
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleSeek = (e) => {
    const seekTo = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = seekTo;
    setProgress(e.target.value);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(err => console.log(err));
    else document.exitFullscreen();
  };

  return (
    <div ref={containerRef} className="relative group w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] max-h-[75vh] font-sans">
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-20">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-500')}></span>
        </span>
        <h4 className="text-white text-xs font-bold truncate dir-rtl">{title || 'ویدیو'}</h4>
      </div>

      <video 
        ref={videoRef} onClick={togglePlay} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)}
        className="w-full h-full max-h-[75vh] object-contain cursor-pointer outline-none" preload="metadata"
      >
        <source src={`${src}#t=0.1`} type={mimeType} />
      </video>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-20">
        <div className="w-full flex items-center gap-3 px-2" dir="ltr">
          <input 
            type="range" min="0" max="100" value={progress} onChange={handleSeek}
            className="w-full h-1 appearance-none rounded-full cursor-pointer outline-none"
            style={{ background: `linear-gradient(to right, #06b6d4 ${progress}%, #4b5563 ${progress}%)` }}
          />
        </div>

        <div className="flex items-center justify-between px-2" dir="ltr">
          <div className="flex items-center gap-4">
            <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
              <button onClick={togglePlay} className="text-white hover:text-[#06b6d4] transition-colors p-1 cursor-pointer">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">{isPlaying ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M8 5v14l11-7z" strokeWidth={0} />}</svg>
              </button>
            </Tooltip>

            <Tooltip text="۱۵ ثانیه به عقب">
              <button onClick={() => skip(-15)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 15l-3-3m0 0l3-3m-3 3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="۱۵ ثانیه به جلو">
              <button onClick={() => skip(15)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </Tooltip>

            <span className="text-xs text-white ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Tooltip text="تمام‌صفحه">
            <button onClick={toggleFullScreen} className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت اصلی مدیریت و انتخابگر رسانه
// ==========================================
export default function MediaLibraryPage({ onSelectMedia, isPickerMode = false }) {
  const [isMounted, setIsMounted] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, payload: null });

  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    loadMedia();
  }, []);

  useEffect(() => { setVisibleCount(24); }, [activeTab, searchTerm]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter(m => {
      const matchesTab = activeTab === 'ALL' || m.fileType === activeTab;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || 
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.url && m.url.toLowerCase().includes(term)) ||
        (m.altText && m.altText.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
  }, [mediaList, activeTab, searchTerm]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      setMediaList(data || []);
    } catch (error) {
      toast.error('خطا در دریافت رسانه‌ها از سرور');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return <div className="max-w-7xl mx-auto p-6 font-sans text-right text-gray-400">در حال بارگذاری رسانه‌ها...</div>;
  }

  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let hasError = false;
    const toastId = toast.loading('در حال آپلود فایل‌ها...');

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success) hasError = true;
      } catch (error) {
        hasError = true;
      }
    }

    if (hasError) {
      toast.error('برخی فایل‌ها آپلود نشدند یا با خطا مواجه شدند.', { id: toastId });
    } else {
      toast.success('فایل‌ها با موفقیت آپلود شدند.', { id: toastId });
    }
    
    await loadMedia();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = () => {
    if (!selectedMedia?.url) return;
    navigator.clipboard.writeText(selectedMedia.url);
    setCopied(true);
    toast.success('لینک فایل کپی شد!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateMedia = async () => {
    setSaveStatus('در حال ذخیره...');
    toast.promise(
      updateMedia(selectedMedia.id, { title: editTitle, altText: editAlt }),
      {
        loading: 'در حال ذخیره تغییرات...',
        success: (res) => {
          if (res.success) {
            setSaveStatus('ذخیره شد!');
            setMediaList(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, title: editTitle, altText: editAlt } : m));
            setSelectedMedia(prev => ({ ...prev, title: editTitle, altText: editAlt }));
            setTimeout(() => setSaveStatus(''), 2000);
            return 'تغییرات با موفقیت ذخیره شد.';
          }
          throw new Error('خطا');
        },
        error: () => {
          setSaveStatus('خطا در ذخیره!');
          return 'خطا در ذخیره تغییرات!';
        }
      }
    );
  };
  
  const requestRename = () => {
    if (!editFileName || editFileName.trim() === '') return;
    setConfirmDialog({ isOpen: true, type: 'RENAME', payload: null });
  };

  const executeRename = async () => {
    setConfirmDialog({ isOpen: false, type: null, payload: null });
    setSaveStatus('در حال تغییر نام...');
    
    toast.promise(
      renameMediaFile(selectedMedia.id, editFileName),
      {
        loading: 'در حال تغییر نام...',
        success: (res) => {
          if (res.success) {
            setSaveStatus('نام تغییر کرد!');
            const updatedMedia = { ...selectedMedia, url: res.newUrl, title: res.newTitle };
            setSelectedMedia(updatedMedia);
            setEditFileName(res.newTitle);
            setEditTitle(res.newTitle);
            setMediaList(prev => prev.map(m => m.id === selectedMedia.id ? updatedMedia : m));
            setTimeout(() => setSaveStatus(''), 3000);
            return 'نام فایل تغییر یافت.';
          }
          throw new Error('خطا');
        },
        error: () => {
          setSaveStatus('خطا در تغییر نام!');
          return 'خطا در تغییر نام فایل!';
        }
      }
    );
  };

  const requestDelete = (id) => {
    setConfirmDialog({ isOpen: true, type: 'DELETE', payload: id });
  };

  const executeDelete = async () => {
    const id = confirmDialog.payload;
    setConfirmDialog({ isOpen: false, type: null, payload: null });
    
    toast.promise(
      deleteMedia(id),
      {
        loading: 'در حال حذف رسانه...',
        success: (res) => {
          if (res.success) {
            setSelectedMedia(null);
            setMediaList(prev => prev.filter(m => m.id !== id));
            return 'رسانه با موفقیت حذف شد.';
          }
          throw new Error('خطا');
        },
        error: 'خطا در حذف رسانه!'
      }
    );
  };

  const openEditModal = (media) => {
    setSelectedMedia(media);
    setEditTitle(media.title || '');
    setEditAlt(media.altText || '');
    setEditFileName(media.title || media.url.split('/').pop());
    setSaveStatus('');
    setCopied(false);
  };

  const paginatedMedia = filteredMedia.slice(0, visibleCount);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '۰ Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return toPersianDigits(parseFloat((bytes / Math.pow(k, i)).toFixed(2))) + ' ' + sizes[i];
  };

  const getFileBadge = (type) => {
    const badges = {
      'IMAGE': { label: 'تصویر', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
      'VIDEO': { label: 'ویدیو', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
      'AUDIO': { label: 'صوت', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
      'DOCUMENT':{ label: 'سند', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    };
    return badges[type] || badges['DOCUMENT'];
  };

  const TAB_ITEMS = [
    { label: 'همه', val: 'ALL' },
    { label: 'تصاویر', val: 'IMAGE' },
    { label: 'ویدیوها', val: 'VIDEO' },
    { label: 'صوت‌ها', val: 'AUDIO' },
    { label: 'اسناد', val: 'DOCUMENT' },
  ];

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="max-w-7xl mx-auto space-y-6 pb-10 relative text-right font-sans select-none"
    >
      
      {/* اورلی رها کردن فایل (Drag & Drop Zone) */}
      {isDragging && (
        <div className="fixed inset-0 z-[300] bg-[#06b6d4]/20 backdrop-blur-md border-4 border-dashed border-[#06b6d4] rounded-3xl flex flex-col items-center justify-center gap-4 m-4 pointer-events-none animate-pulse">
          <Icon name="upload" className="w-16 h-16 text-[#06b6d4]" />
          <p className="text-xl font-bold text-white">فایل‌ها را برای آپلود سریع رها کنید</p>
        </div>
      )}

      {/* هدر صفحه (منطبق بر گرافیک کلی1) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
      >
        <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

        <div>
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            کتابخانه رسانه
          </h1>
          <p className="text-sm text-gray-400 font-light">مدیریت فایل‌ها، تصاویر و ویدیوهای سایت با استانداردهای سئو</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFilesUpload(e.target.files)} 
            multiple 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
          >
            <Icon name="upload" className="w-5 h-5" />
            {uploading ? 'در حال آپلود فایل‌ها...' : 'افزودن رسانه جدید'}
          </button>
        </div>
      </motion.div>

      {/* تب‌ها و باکس سرچ (اصلاح عناوین تب‌ها به فارسی) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {TAB_ITEMS.map(tab => (
            <button
              key={tab.val}
              onClick={() => setActiveTab(tab.val)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer border",
                activeTab === tab.val 
                  ? "bg-[#06b6d4] text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* اینپوت سرچ */}
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام یا آدرس..." 
            className="w-full bg-[#080c16] border border-white/10 rounded-full py-2.5 pr-10 pl-4 text-sm text-white outline-none focus:border-[#06b6d4] transition-all font-medium"
          />
        </div>
      </div>

      {/* گرید نمایش فایل‌ها (منطبق بر گرافیک کلی1) */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">در حال دریافت فایل‌ها از سرور...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="relative rounded-2xl border border-white/10 p-20 text-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl rounded-2xl pointer-events-none -z-10" />
          <Icon name="image" className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">هیچ رسانه‌ای یافت نشد.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedMedia.map((media, idx) => {
              const badge = getFileBadge(media.fileType);
              return (
                <motion.div 
                  key={media.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  onClick={() => openEditModal(media)}
                  className="group cursor-pointer relative rounded-2xl border border-white/10 bg-[#080c16] overflow-hidden hover:border-[#06b6d4] transition-all duration-300 aspect-square flex flex-col shadow-lg"
                >
                  <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-xl pointer-events-none -z-10" />
                  
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{ boxShadow: 'inset 0 0 20px rgba(6, 182, 212, 0.15), 0 10px 25px -5px rgba(6, 182, 212, 0.25)' }}
                  />

                  <div 
                    className="absolute top-0 inset-x-4 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)' }}
                  />

                  <div className="flex-1 bg-black/50 flex items-center justify-center overflow-hidden relative">
                    {media.fileType === 'IMAGE' ? (
                      <img src={media.url} alt={media.altText || media.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : media.fileType === 'VIDEO' ? (
                      <video className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" preload="metadata">
                         <source src={`${media.url}#t=0.1`} type={media.mimeType} />
                      </video>
                    ) : media.fileType === 'AUDIO' ? (
                      <Icon name="music" className="w-12 h-12 text-[#a855f7]" />
                    ) : (
                      <Icon name="file" className="w-12 h-12 text-gray-400" />
                    )}
                    
                    {/* بدج نوع فایل روی کارت */}
                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-[10px] px-2 py-1 rounded-md text-gray-200 shadow-md flex items-center gap-1 z-10 border border-white/10 font-bold">
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>
                  
                  <div className="p-2.5 bg-[#0b0f19] border-t border-white/5 relative z-10">
                    <p className="text-xs text-white truncate font-medium dir-ltr text-right font-sans">{toPersianDigits(media.title) || 'بدون نام'}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-sans">{formatBytes(media.size)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {visibleCount < filteredMedia.length && (
            <div className="flex justify-center mt-8 pb-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                نمایش بیشتر ({toPersianDigits(filteredMedia.length - visibleCount)} فایل دیگر)
              </button>
            </div>
          )}
        </>
      )}

      {/* مودال جزئیات رسانه */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" 
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative w-full max-w-5xl rounded-3xl border border-white/10 flex flex-col md:flex-row overflow-hidden max-h-[90vh] shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#0b0f19]/90 backdrop-blur-xl rounded-3xl pointer-events-none -z-10" />
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90" />
              
              <div className="w-full md:w-3/5 bg-black/50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-l border-white/10 relative overflow-hidden">
                {selectedMedia.fileType === 'IMAGE' && (
                  <img src={selectedMedia.url} alt={selectedMedia.altText} className="max-w-full max-h-[75vh] object-contain rounded-xl drop-shadow-2xl" />
                )}
                
                {selectedMedia.fileType === 'VIDEO' && (
                  <CustomVideoPlayer src={selectedMedia.url} mimeType={selectedMedia.mimeType} title={editTitle || selectedMedia.title} />
                )}

                {selectedMedia.fileType === 'AUDIO' && (
                  <CustomAudioPlayer src={selectedMedia.url} title={editTitle || selectedMedia.title || 'فایل صوتی'} />
                )}

                {selectedMedia.fileType === 'DOCUMENT' && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 max-h-[75vh]">
                    {selectedMedia.mimeType === 'application/pdf' ? (
                      <iframe src={selectedMedia.url} className="w-full h-[70vh] rounded-xl bg-white shadow-xl" title="PDF Viewer" />
                    ) : (
                      <>
                        <Icon name="file" className="w-24 h-24 text-gray-500 drop-shadow-lg" />
                        <a href={selectedMedia.url} target="_blank" download className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm transition-colors border border-white/10 font-bold">
                          دانلود فایل سند
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/5 flex flex-col bg-transparent">
                <div className="p-6 flex-1 overflow-y-auto space-y-6 font-sans">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">جزئیات رسانه</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        آپلود: {toPersianDigits(selectedMedia.formattedDate)} - ساعت {toPersianDigits(new Date(selectedMedia.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}
                      </p>
                    </div>
                    <button onClick={() => setSelectedMedia(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors text-gray-400 cursor-pointer">
                      <Icon name="close" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5 dir-ltr text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-300 truncate"><strong className="text-gray-500">URL:</strong> {selectedMedia.url}</p>
                      <button 
                        onClick={handleCopyUrl}
                        className="px-3 py-1 bg-white/10 hover:bg-[#06b6d4] text-white rounded-lg transition-colors font-sans text-xs cursor-pointer shrink-0 font-bold"
                      >
                        {copied ? 'کپی شد!' : 'کپی لینک'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-300"><strong className="text-gray-500">Type:</strong> {selectedMedia.mimeType}</p>
                    <p className="text-xs text-gray-300"><strong className="text-gray-500">Size:</strong> {formatBytes(selectedMedia.size)}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-[#06b6d4]/5 rounded-xl border border-[#06b6d4]/20">
                    <label className="block text-sm font-bold text-[#06b6d4]">تغییر نام اصلی فایل</label>
                    <p className="text-[10px] text-gray-400 leading-tight">توجه: تغییر نام باعث تغییر لینک می‌شود.</p>
                    <div className="flex gap-2 mt-2">
                      <input type="text" value={editFileName} onChange={(e) => setEditFileName(e.target.value)} className="flex-1 bg-white/5 border border-[#06b6d4]/30 rounded-lg p-2.5 text-sm text-white focus:border-[#06b6d4] dir-ltr font-sans outline-none" />
                      <button onClick={requestRename} className="px-3 bg-[#06b6d4]/20 hover:bg-[#06b6d4]/40 text-[#06b6d4] rounded-lg text-xs font-bold transition-colors cursor-pointer">اعمال نام</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">عنوان فایل</label>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4] font-sans outline-none" placeholder="عنوان دلخواه..." />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      متن جایگزین (Alt Text) <span className="text-xs text-rose-400">*سئو</span>
                    </label>
                    <textarea rows="3" value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#06b6d4] font-sans outline-none" placeholder="توضیح تصویر/فایل..."></textarea>
                  </div>
                </div>

                <div className="p-6 bg-black/20 border-t border-white/10 flex items-center justify-between font-sans">
                  <button onClick={() => requestDelete(selectedMedia.id)} className="text-sm font-medium text-rose-500 hover:text-rose-400 transition-colors cursor-pointer">
                    حذف دائم
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#10b981]">{saveStatus}</span>
                    
                    {onSelectMedia && (
                      <button 
                        onClick={() => {
                          onSelectMedia(selectedMedia);
                          setSelectedMedia(null);
                        }} 
                        className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                      >
                        انتخاب این رسانه
                      </button>
                    )}

                    <button onClick={handleUpdateMedia} className="px-8 py-2.5 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:scale-105 text-white rounded-xl text-sm font-bold transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer">
                      ذخیره
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال تأیید حذف یا تغییر نام */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans bg-black/75 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setConfirmDialog({ isOpen: false, type: null, payload: null })}></div>
          
          <div className="relative bg-[#0b0f19] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 text-right overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />
            
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", confirmDialog.type === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg">
                {confirmDialog.type === 'DELETE' ? 'حذف دائم رسانه' : 'تغییر نام فایل'}
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {confirmDialog.type === 'DELETE' 
                ? 'آیا از حذف دائم این رسانه مطمئن هستید؟ این عملیات غیرقابل بازگشت است و از روی سرور پاک می‌شود.' 
                : 'هشدار: تغییر نام باعث تغییر لینک فایل می‌شود. در صورتی که این فایل را قبلاً در مقاله‌ای استفاده کرده‌اید، نمایش آن دچار مشکل خواهد شد. مایل به ادامه هستید؟'}
            </p>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={confirmDialog.type === 'DELETE' ? executeDelete : executeRename} 
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer", confirmDialog.type === 'DELETE' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20')}
              >
                بله، مطمئنم
              </button>
              <button onClick={() => setConfirmDialog({ isOpen: false, type: null, payload: null })} className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer">
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}