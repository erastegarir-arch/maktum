// کامپوننت مودال مدیا (مدیا پیکر) به صورت مستقل
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMedia, updateMedia, deleteMedia, renameMediaFile } from '@/app/actions/media';
import Icon from '@/app/components/Icon';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ایمپورت‌های الزامی برای چک ترکیبی ۱
import { useAuth } from '@/app/hooks/useAuth';
import AdminLoading from '@/app/(admin-panel)/loading';
import ModalPortal from '@/app/components/admin/ModalPortal';

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
    <div className="relative group/tooltip inline-flex items-center justify-center select-none">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-30 pointer-events-none">
        <div className="bg-[#0f172a]/95 backdrop-blur-md border border-white/10 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap font-sans">
          {text}
        </div>
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    
    if (val > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    } else if (val === 0 && !isMuted) {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    }
    
    if (audioRef.current) audioRef.current.volume = val;
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioRef.current) audioRef.current.muted = newMutedState;
  };

  return (
    <div className="w-full max-w-lg p-6 rounded-3xl bg-black/40 shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.5)] flex flex-col gap-6 font-sans relative overflow-hidden border border-white/5 select-none">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent" />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)} loop={isLooping} className="hidden" />

      <div className="flex items-center justify-center gap-2 px-4">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-600')}></span>
        </span>
        <h4 className="text-white font-bold truncate text-sm dir-rtl select-text">{title || 'فایل صوتی'}</h4>
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
        <div className="flex items-center gap-3">
          <Tooltip text="۱۵ ثانیه به عقب">
            <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="m19.208.367c-1.122-.568-2.398-.464-3.412.28L5.645,9.363c-.246.181-.462.39-.645.621V1c0-.552-.447-1-1-1s-1,.448-1,1v22c0,.552.447,1,1,1s1-.448,1-1v-8.984c.182.231.398.441.645.621l10.152,8.725c.581.427,1.248.643,1.923.643.503,0,1.01-.12,1.489-.363,1.122-.569,1.792-1.659,1.792-2.917V3.284c0-1.258-.67-2.348-1.792-2.917Z"/>
              </svg>
            </button>
          </Tooltip>

          <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
            <button onClick={togglePlay} className="w-16 h-16 flex items-center justify-center bg-[#06b6d4] hover:bg-[#0891b2] rounded-full text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform cursor-pointer border border-transparent">
              <svg className={cn("w-7 h-7", !isPlaying ? 'ml-1' : '')} fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <>
                    <path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z"/>
                    <path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z"/>
                  </>
                ) : (
                  <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/>
                )}
              </svg>
            </button>
          </Tooltip>

          <Tooltip text="۱۵ ثانیه به جلو">
            <button onClick={() => skip(15)} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="m4.766.365c1.122-.568,2.398-.464,3.412.28l10.152,8.716c.246.181.462.39.645.621V.998c0-.552.447-1-1-1s1,.448,1,1v22c0,.552-.447,1-1,1s-1-.448-1-1v-8.984c-.182.231-.398.441-.645.621l-10.152,8.725c-.581.427-1.248.643-1.923.643-.503,0-1.01-.12-1.489-.363-1.122-.569-1.792-1.659-1.792-2.917V3.282c0-1.258.67-2.348,1.792-2.917Z"/>
              </svg>
            </button>
          </Tooltip>
        </div>

        <div className="absolute right-0 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2" dir="ltr">
            <Tooltip text={isMuted || volume === 0 ? 'صدادار' : 'بی‌صدا'}>
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  {isMuted || volume === 0 ? (
                    <path d="m23.707,22.293c.391.391.391,1.023,0,1.414-.195.195-.451.293-.707.293s-.512-.098-.707-.293L.293,1.707C-.098,1.316-.098.684.293.293S1.316-.098,1.707.293l4.628,4.628C8.142,2.461,10.839.757,13.828.207c.288-.056.593.025.82.215.229.19.36.472.36.769v12.404l1.688,1.688c1.806-1.817,1.803-4.763-.01-6.576-.391-.391-.391-1.023,0-1.414.391-.391,1.023-.391,1.414,0,2.592,2.592,2.596,6.808.01,9.404l1.44,1.44c3.316-3.481,3.266-9.011-.152-12.43-.391-.391-.391-1.023,0-1.414s1.023-.391,1.414,0c4.198,4.198,4.249,10.997.152,15.258l2.742,2.742ZM.009,10v4c0,2.757,2.243,5,5,5h1.269c1.807,2.502,4.53,4.237,7.551,4.793.06.011.12.017.181.017.232,0,.459-.081.64-.231.229-.19.36-.472.36-.769v-3.579L1.881,6.103C.74,7.02.009,8.426.009,10Z"/>
                  ) : volume < 0.5 ? (
                    <path d="m14.003,23.814c-.06,0-.121-.005-.181-.017-2.999-.551-5.752-2.299-7.554-4.794h-1.271C2.241,19.003-.002,16.76-.002,14.003v-4.005C-.002,7.241,2.241,4.998,4.998,4.998h1.271C8.068,2.506,10.821.758,13.822.204c.294-.053.593.024.821.215.229.19.36.472.36.769v21.627c0,.297-.132.579-.36.769-.181.151-.408.231-.64.231Zm4.02-7.042c2.632-2.632,2.632-6.914,0-9.546-.391-.391-1.023-.391-1.414,0s-.391,1.023,0,1.414c1.852,1.852,1.852,4.866,0,6.718-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293Z"/>
                  ) : (
                    <>
                      <path d="M20.8,4.293A1,1,0,0,0,19.39,5.707a8.911,8.911,0,0,1,0,12.586A1,1,0,1,0,20.8,19.707,10.911,10.911,0,0,0,20.8,4.293Z"/>
                      <path d="M18.093,7.293a1,1,0,1,0-1.414,1.414,4.664,4.664,0,0,1,0,6.586,1,1,0,1,0,1.414,1.414A6.665,6.665,0,0,0,18.093,7.293Z"/>
                      <path d="M13.819.207A12.055,12.055,0,0,0,6.268,5H5a5.006,5.006,0,0,0-5,5v4a5.006,5.006,0,0,0,5,5H6.269a12.051,12.051,0,0,0,7.55,4.793A1,1,0,0,0,15,22.81V1.19A1,1,0,0,0,13.819.207Z"/>
                    </>
                  )}
                </svg>
              </button>
            </Tooltip>
            <input 
              type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} 
              className="w-16 h-1 appearance-none rounded-full cursor-pointer outline-none transition-all" 
              style={{ background: `linear-gradient(to right, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)` }}
            />
          </div>

          <Tooltip text={isLooping ? 'تکرار: فعال' : 'تکرار: غیرفعال'}>
            <button onClick={() => setIsLooping(!isLooping)} className={cn("p-2 transition-colors cursor-pointer", isLooping ? 'text-[#06b6d4]' : 'text-gray-500 hover:text-gray-300')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0,11.5C0,6.813,3.813,3,8.5,3h10.5V1.337C19,.446,20.077,0,20.707,.63l3,3.163c.391,.391,.39,1.024,0,1.414l-3,3.163c-.63,.63-1.707,.184-1.707-.707v-1.663H8.5c-3.033,0-5.5,2.468-5.5,5.5,0,.828-.671,1.5-1.5,1.5s-1.5-.672-1.5-1.5Zm22.5-.5c-.829,0-1.5,.672-1.5,1.5,0,3.032-2.467,5.5-5.5,5.5H5v-1.663c0-.891-1.077-1.337-1.707-.707L.293,18.793c-.391,.391-.391,1.024,0,1.414l3,3.163c.63,.63,1.707,.184,1.707-.707v-1.663H15.5c4.687,0,8.5-3.813,8.5-8.5,0-.828-.671-1.5-1.5-1.5Z"/>
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    
    if (val > 0 && isMuted) {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.muted = false;
    } else if (val === 0 && !isMuted) {
      setIsMuted(true);
      if (videoRef.current) videoRef.current.muted = true;
    }
    
    if (videoRef.current) videoRef.current.volume = val;
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) videoRef.current.muted = newMutedState;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(err => console.log(err));
    else document.exitFullscreen();
  };

  return (
    <div ref={containerRef} className="relative group w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] max-h-[75vh] font-sans border border-white/5 select-none">
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-20 pointer-events-none">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-500')}></span>
        </span>
        <h4 className="text-white text-xs font-bold truncate dir-rtl select-text">{title || 'ویدیو'}</h4>
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
            className="w-full h-1 appearance-none rounded-full cursor-pointer outline-none transition-all"
            style={{ background: `linear-gradient(to right, #06b6d4 ${progress}%, #4b5563 ${progress}%)` }}
          />
        </div>

        <div className="flex items-center justify-between px-2" dir="ltr">
          <div className="flex items-center gap-4">
            <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
              <button onClick={togglePlay} className="text-white hover:text-[#06b6d4] transition-colors p-1 cursor-pointer">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? (
                    <>
                      <path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z"/>
                      <path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z"/>
                    </>
                  ) : (
                    <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/>
                  )}
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="۱۵ ثانیه به عقب">
              <button onClick={() => skip(-15)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m19.208.367c-1.122-.568-2.398-.464-3.412.28L5.645,9.363c-.246.181-.462.39-.645.621V1c0-.552-.447-1-1-1s1,.448-1,1v22c0,.552.447,1,1,1s1-.448,1-1v-8.984c.182.231.398.441.645.621l10.152,8.725c.581.427,1.248.643,1.923.643.503,0,1.01-.12,1.489-.363,1.122-.569,1.792-1.659,1.792-2.917V3.284c0-1.258-.67-2.348-1.792-2.917Z"/>
                </svg>
              </button>
            </Tooltip>

            <Tooltip text="۱۵ ثانیه به جلو">
              <button onClick={() => skip(15)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m4.766.365c1.122-.568,2.398-.464,3.412.28l10.152,8.716c.246.181.462.39.645.621V.998c0-.552.447-1-1-1s1,.448,1,1v22c0,.552-.447,1-1,1s-1-.448-1-1v-8.984c-.182.231-.398.441-.645.621l-10.152,8.725c-.581.427-1.248.643-1.923.643-.503,0-1.01-.12-1.489-.363-1.122-.569-1.792-1.659-1.792-2.917V3.282c0-1.258.67-2.348,1.792-2.917Z"/>
                </svg>
              </button>
            </Tooltip>

            <span className="text-xs text-white ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2" dir="ltr">
              <Tooltip text={isMuted || volume === 0 ? 'صدادار' : 'بی‌صدا'}>
                <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {isMuted || volume === 0 ? (
                      <path d="m23.707,22.293c.391.391.391,1.023,0,1.414-.195.195-.451.293-.707.293s-.512-.098-.707-.293L.293,1.707C-.098,1.316-.098.684.293.293S1.316-.098,1.707.293l4.628,4.628C8.142,2.461,10.839.757,13.828.207c.288-.056.593.025.82.215.229.19.36.472.36.769v12.404l1.688,1.688c1.806-1.817,1.803-4.763-.01-6.576-.391-.391-.391-1.023,0-1.414.391-.391,1.023-.391,1.414,0,2.592,2.592,2.596,6.808.01,9.404l1.44,1.44c3.316-3.481,3.266-9.011-.152-12.43-.391-.391-.391-1.023,0-1.414s1.023-.391,1.414,0c4.198,4.198,4.249,10.997.152,15.258l2.742,2.742ZM.009,10v4c0,2.757,2.243,5,5,5h1.269c1.807,2.502,4.53,4.237,7.551,4.793.06.011.12.017.181.017.232,0,.459-.081.64-.231.229-.19.36-.472.36-.769v-3.579L1.881,6.103C.74,7.02.009,8.426.009,10Z"/>
                    ) : volume < 0.5 ? (
                      <path d="m14.003,23.814c-.06,0-.121-.005-.181-.017-2.999-.551-5.752-2.299-7.554-4.794h-1.271C2.241,19.003-.002,16.76-.002,14.003v-4.005C-.002,7.241,2.241,4.998,4.998,4.998h1.271C8.068,2.506,10.821.758,13.822.204c.294-.053.593.024.821.215.229.19.36.472.36.769v21.627c0,.297-.132.579-.36.769-.181.151-.408.231-.64.231Zm4.02-7.042c2.632-2.632,2.632-6.914,0-9.546-.391-.391-1.023-.391-1.414,0s-.391,1.023,0,1.414c1.852,1.852,1.852,4.866,0,6.718-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293Z"/>
                    ) : (
                      <>
                        <path d="M20.8,4.293A1,1,0,0,0,19.39,5.707a8.911,8.911,0,0,1,0,12.586A1,1,0,1,0,20.8,19.707,10.911,10.911,0,0,0,20.8,4.293Z"/>
                        <path d="M18.093,7.293a1,1,0,1,0-1.414,1.414,4.664,4.664,0,0,1,0,6.586,1,1,0,1,0,1.414,1.414A6.665,6.665,0,0,0,18.093,7.293Z"/>
                        <path d="M13.819.207A12.055,12.055,0,0,0,6.268,5H5a5.006,5.006,0,0,0-5,5v4a5.006,5.006,0,0,0,5,5H6.269a12.051,12.051,0,0,0,7.55,4.793A1,1,0,0,0,15,22.81V1.19A1,1,0,0,0,13.819.207Z"/>
                      </>
                    )}
                  </svg>
                </button>
              </Tooltip>
              <input 
                type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} 
                className="w-16 h-1 appearance-none rounded-full cursor-pointer outline-none transition-all" 
                style={{ background: `linear-gradient(to right, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)` }}
              />
            </div>

            <Tooltip text="تمام‌صفحه">
              <button onClick={toggleFullScreen} className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.5,15.5A1.5,1.5,0,0,0,21,17v1.5A2.5,2.5,0,0,1,18.5,21H17a1.5,1.5,0,0,0,0,3h1.5A5.506,5.506,0,0,0,24,18.5V17A1.5,1.5,0,0,0,22.5,15.5Z"/>
                  <path d="M7,0H5.5A5.506,5.506,0,0,0,0,5.5V7A1.5,1.5,0,0,0,3,7V5.5A2.5,2.5,0,0,1,5.5,3H7A1.5,1.5,0,0,0,7,0Z"/>
                  <path d="M7,21H5.5A2.5,2.5,0,0,1,3,18.5V17a1.5,1.5,0,0,0-3,0v1.5A5.506,5.506,0,0,0,5.5,24H7a1.5,1.5,0,0,0,0-3Z"/>
                  <path d="M18.5,0H17a1.5,1.5,0,0,0,0,3h1.5A2.5,2.5,0,0,1,21,5.5V7a1.5,1.5,0,0,0,3,0V5.5A5.506,5.506,0,0,0,18.5,0Z"/>
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت اصلی مدیریت و انتخابگر رسانه
// ==========================================
export default function MediaLibraryComponent({ onSelectMedia, isPickerMode = false }) {
  // ==========================================
  // ۱. منطق احراز هویت بدون پرش (Wait & Verify)
  // ==========================================
  const { user, isLoading: authIsLoading, loading: authLoading, isFetching } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);

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

  // کنترل دسترسی هوشمند (پشتیبانی از حالت مستقل و حالت Picker)
  useEffect(() => {
    if (isPickerMode) {
      setHasAccess(true);
      return;
    }
    
    const isWorking = authIsLoading || authLoading || isFetching;
    if (isWorking) return;

    if (user) {
      setHasAccess(!!(user.isAdmin || user.isSuperAdmin));
    } else if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setHasAccess(false);
      } else {
        const timer = setTimeout(() => setHasAccess(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authIsLoading, authLoading, isFetching, isPickerMode]);

  useEffect(() => { setVisibleCount(24); }, [activeTab, searchTerm]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter(m => {
      let matchesTab = false;
      const isSvg = (m.url && m.url.toLowerCase().endsWith('.svg')) || (m.mimeType && m.mimeType.toLowerCase().includes('svg'));

      if (activeTab === 'ALL') {
        matchesTab = true;
      } else if (activeTab === 'ICON') {
        matchesTab = m.fileType === 'IMAGE' && isSvg;
      } else if (activeTab === 'IMAGE') {
        matchesTab = m.fileType === 'IMAGE' && !isSvg;
      } else {
        matchesTab = m.fileType === activeTab;
      }

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

  const getFileBadge = (media) => {
    const isSvg = (media.url && media.url.toLowerCase().endsWith('.svg')) || (media.mimeType && media.mimeType.toLowerCase().includes('svg'));

    if (media.fileType === 'IMAGE' && isSvg) {
      return { 
        label: 'آیکون', 
        icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> 
      };
    }

    const badges = {
      'IMAGE': { label: 'تصویر', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
      'VIDEO': { label: 'ویدیو', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
      'AUDIO': { label: 'صوت', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
      'DOCUMENT':{ label: 'سند', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    };
    return badges[media.fileType] || badges['DOCUMENT'];
  };

  const TAB_ITEMS = [
    { label: 'همه', val: 'ALL' },
    { label: 'تصویر', val: 'IMAGE' },
    { label: 'آیکون', val: 'ICON' },
    { label: 'ویدیو', val: 'VIDEO' },
    { label: 'صوت', val: 'AUDIO' },
    { label: 'سند', val: 'DOCUMENT' },
  ];

  // ==========================================
  // رندر لودینگ سراسری و انسداد دسترسی
  // ==========================================
  if (!isMounted || hasAccess === null) {
    return isPickerMode ? (
      <div className="p-10 text-center text-[#06b6d4] font-sans flex flex-col items-center justify-center gap-3">
        <Icon name="loading" className="w-8 h-8 animate-spin mx-auto" />
        <span>در حال بارگذاری کتابخانه رسانه...</span>
      </div>
    ) : <AdminLoading />;
  }

  if (hasAccess === false) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
          <Icon name="lock" className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">دسترسی مسدود است</h2>
        <p className="text-gray-400">شما مجوز ورود به کتابخانه رسانه را ندارید.</p>
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="max-w-7xl mx-auto space-y-6 pb-10 relative text-right font-sans select-none"
    >
      
      {/* اورلی رها کردن فایل (Drag & Drop Zone) */}
      {isDragging && (
        <div className="fixed inset-0 z-25 bg-[#06b6d4]/20 backdrop-blur-md border-4 border-dashed border-[#06b6d4] rounded-3xl flex flex-col items-center justify-center gap-4 m-4 pointer-events-none animate-pulse">
          <Icon name="upload" className="w-16 h-16 text-[#06b6d4]" />
          <p className="text-xl font-bold text-white">فایل‌ها را برای آپلود سریع رها کنید</p>
        </div>
      )}

      {/* هدر صفحه */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group border border-transparent bg-[#0f172a]/40 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-90 pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
            کتابخانه رسانه
          </h1>
          <p className="text-sm text-gray-400 font-light">مدیریت فایل‌ها، تصاویر و ویدیوهای سایت</p>
        </div>
        
        <div className="relative z-10">
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer border border-transparent"
          >
            {uploading ? 'در حال آپلود...' : 'افزودن'}
          </button>
        </div>
      </motion.div>

      {/* تب‌ها و باکس سرچ */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap gap-2 bg-[#050810]/50 p-2 rounded-2xl border border-white/5 shadow-inner">
          {TAB_ITEMS.map(tab => (
            <button
              key={tab.val}
              onClick={() => setActiveTab(tab.val)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border border-transparent",
                activeTab === tab.val 
                  ? "bg-[#06b6d4]/20 text-[#06b6d4] shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] border-[#06b6d4]/30" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white shadow-inner"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* اینپوت سرچ */}
        <div className="relative w-full sm:w-80">
          <Icon name="search" className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام یا آدرس..." 
            className="w-full bg-black/40 rounded-xl py-3.5 pr-12 pl-4 text-sm text-white outline-none focus:border focus:border-[#06b6d4] border border-white/5 transition-all shadow-inner font-medium select-text"
          />
        </div>
      </div>

      {/* گرید نمایش فایل‌ها */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">در حال دریافت فایل‌ها از سرور...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="relative rounded-3xl p-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden border border-transparent bg-[#0f172a]/40 backdrop-blur-xl">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
          <Icon name="image" className="w-16 h-16 mx-auto text-gray-500 mb-4 opacity-50" />
          <p className="text-gray-400 font-bold">هیچ رسانه‌ای یافت نشد.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedMedia.map((media, idx) => {
              const badge = getFileBadge(media);
              return (
                <motion.div 
                  key={media.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  onClick={() => openEditModal(media)}
                  className="group cursor-pointer relative rounded-2xl bg-[#050810]/50 overflow-hidden hover:border-[#06b6d4]/50 border border-white/5 transition-all duration-300 aspect-square flex flex-col shadow-lg"
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xl pointer-events-none -z-10" />
                  
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 -z-10"
                    style={{ boxShadow: 'inset 0 0 20px rgba(6, 182, 212, 0.15), 0 10px 25px -5px rgba(6, 182, 212, 0.25)' }}
                  />

                  <div 
                    className="absolute top-0 inset-x-4 h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-20"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%)' }}
                  />

                  <div className="flex-1 bg-black/30 flex items-center justify-center overflow-hidden relative">
                    {media.fileType === 'IMAGE' ? (
                      <img src={media.url} alt={media.altText || media.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : media.fileType === 'VIDEO' ? (
                      <video className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" preload="metadata">
                         <source src={`${media.url}#t=0.1`} type={media.mimeType} />
                      </video>
                    ) : media.fileType === 'AUDIO' ? (
                      <Icon name="music" className="w-12 h-12 text-[#a855f7]" />
                    ) : (
                      <Icon name="document" className="w-12 h-12 text-gray-400" />
                    )}
                    
                    {/* بدج نوع فایل روی کارت */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-lg text-gray-200 shadow-md flex items-center gap-1 z-10 font-bold border border-white/5">
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-black/60 relative z-10 border-t border-white/5">
                    <p className="text-xs text-white truncate font-medium dir-ltr text-right font-sans select-text">{toPersianDigits(media.title) || 'بدون نام'}</p>
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
                className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 shadow-inner text-sm font-bold text-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
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
          <ModalPortal>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none font-sans" 
              onClick={() => setSelectedMedia(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-5xl rounded-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 bg-[#0f172a]/95 backdrop-blur-3xl"
              >
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-90 z-20 pointer-events-none" />
                
                <div className="w-full md:w-3/5 bg-black/40 flex flex-col items-center justify-center p-6 md:border-l border-white/10 relative overflow-hidden shadow-inner">
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
                        <iframe src={selectedMedia.url} className="w-full h-[70vh] rounded-xl bg-white shadow-xl border-none" title="PDF Viewer" />
                      ) : (
                        <>
                          <Icon name="document" className="w-24 h-24 text-gray-500 drop-shadow-lg" />
                          <a href={selectedMedia.url} target="_blank" download className="bg-white/10 hover:bg-[#06b6d4] text-white px-6 py-2.5 rounded-xl text-sm transition-colors font-bold border border-transparent shadow-inner">
                            دانلود فایل سند
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-2/5 flex flex-col bg-transparent">
                  <div className="p-6 flex-1 overflow-y-auto space-y-6 font-sans custom-scrollbar">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white select-text">جزئیات رسانه</h3>
                        <p className="text-xs text-gray-400 mt-1 select-text">
                          آپلود: {toPersianDigits(selectedMedia.formattedDate)} ساعت 
                          {toPersianDigits(new Date(selectedMedia.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}
                        </p>
                      </div>
                      <button onClick={() => setSelectedMedia(null)} className="p-2 bg-white/5 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-colors text-gray-400 cursor-pointer border border-transparent shadow-inner">
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 bg-black/40 p-4 rounded-xl dir-ltr text-left border border-white/5 shadow-inner">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-300 truncate select-text"><strong className="text-gray-500 select-none">URL:</strong> {selectedMedia.url}</p>
                        <button 
                          onClick={handleCopyUrl}
                          className="px-3 py-1 bg-white/10 hover:bg-[#06b6d4] hover:text-gray-950 text-white rounded-lg transition-colors font-sans text-xs cursor-pointer shrink-0 font-bold border border-transparent"
                        >
                          {copied ? 'کپی شد!' : <Icon name="copy" className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 select-text"><strong className="text-gray-500 select-none">Type:</strong> {selectedMedia.mimeType}</p>
                      <p className="text-xs text-gray-300 select-text"><strong className="text-gray-500 select-none">Size:</strong> {formatBytes(selectedMedia.size)}</p>
                    </div>

                    <div className="space-y-2 p-4 bg-[#050810]/50 rounded-xl border border-[#06b6d4]/20 shadow-inner">
                      <label className="block text-sm font-bold text-[#06b6d4]">تغییر نام اصلی فایل</label>
                      <p className="text-[10px] text-gray-400 leading-tight">توجه: تغییر نام باعث تغییر لینک می‌شود.</p>
                      <div className="flex gap-2 mt-2">
                        <input type="text" value={editFileName} onChange={(e) => setEditFileName(e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg p-2.5 text-sm text-white focus:border-[#06b6d4] dir-ltr font-sans outline-none shadow-inner select-text transition-all" />
                        <button onClick={requestRename} className="px-3 bg-[#06b6d4]/20 hover:bg-[#06b6d4] hover:text-gray-900 text-[#06b6d4] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-transparent">اعمال نام</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 pl-1">عنوان فایل</label>
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black/40 rounded-xl p-3 text-sm text-white focus:border focus:border-[#06b6d4] border border-white/5 font-sans outline-none shadow-inner select-text transition-all" placeholder="عنوان دلخواه..." />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 pl-1">
                        متن جایگزین (Alt Text) <span className="text-xs text-rose-400">*سئو</span>
                      </label>
                      <textarea rows="3" value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="w-full bg-black/40 rounded-xl p-3 text-sm text-white focus:border focus:border-[#06b6d4] border border-white/5 font-sans outline-none shadow-inner resize-none select-text transition-all" placeholder="توضیح تصویر/فایل..."></textarea>
                    </div>
                  </div>

                  <div className="p-6 bg-[#050810]/80 border-t border-white/10 flex items-center justify-between font-sans shadow-inner">
                    <button onClick={() => requestDelete(selectedMedia.id)} className="text-sm font-medium text-rose-500 hover:text-rose-400 transition-colors cursor-pointer">
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#10b981]">{saveStatus}</span>
                      
                      {onSelectMedia && (
                        <button 
                          onClick={() => {
                            onSelectMedia(selectedMedia);
                            setSelectedMedia(null);
                          }} 
                          className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer border border-transparent"
                        >
                          انتخاب این رسانه
                        </button>
                      )}

                      <button onClick={handleUpdateMedia} className="px-8 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] hover:scale-105 text-white rounded-xl text-sm font-bold transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer border border-transparent">
                        ذخیره
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* مودال تأیید حذف یا تغییر نام */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <ModalPortal>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 font-sans bg-black/70 backdrop-blur-md select-none"
            >
              <div className="absolute inset-0 cursor-pointer" onClick={() => setConfirmDialog({ isOpen: false, type: null, payload: null })}></div>
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#0f172a]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-w-sm p-6 flex flex-col gap-4 text-right overflow-hidden border border-white/10"
              >
                <div className={`absolute top-0 inset-x-0 h-[2px] opacity-90 ${confirmDialog.type === 'DELETE' ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-500 to-transparent'}`} />
                
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-transparent shadow-inner", confirmDialog.type === 'DELETE' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg select-text">
                    {confirmDialog.type === 'DELETE' ? 'حذف رسانه' : 'تغییر نام فایل'}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-300 leading-relaxed font-light select-text">
                  {confirmDialog.type === 'DELETE' 
                    ? 'آیا از حذف این رسانه مطمئن هستید؟ این عملیات غیرقابل بازگشت است و از روی سرور پاک می‌شود.' 
                    : 'هشدار: تغییر نام باعث تغییر لینک فایل می‌شود. در صورتی که این فایل را قبلاً در مقاله‌ای استفاده کرده‌اید، نمایش آن دچار مشکل خواهد شد. مایل به ادامه هستید؟'}
                </p>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={confirmDialog.type === 'DELETE' ? executeDelete : executeRename} 
                    className={cn("flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer border border-transparent", confirmDialog.type === 'DELETE' ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-amber-500 hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]')}
                  >
                    بله
                  </button>
                  <button onClick={() => setConfirmDialog({ isOpen: false, type: null, payload: null })} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent shadow-inner">
                    لغو
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
}