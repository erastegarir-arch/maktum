'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import Icon from '../Icon'; 
import ProgressBar from '../ProgressBar';
import BlurImage from '../BlurImage'; 
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast'; 

import AuthModal from '@/app/components/frontend/AuthModal';
import { toggleFavoriteAction, generateSecureDownloadAction, submitCommentAction } from '@/app/actions/interactions';

const cn = (...inputs) => twMerge(clsx(inputs));

const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
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
    <div className="relative z-30 group/tooltip inline-flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none">
        <div className="bg-[#050810]/95 border border-white/10 backdrop-blur-md text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap font-sans font-bold">
          {text}
        </div>
      </div>
    </div>
  );
}

// === ۱. پلیر صوتی ===
function CustomAudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const waveformBars = useMemo(() => Array.from({ length: 60 }, (_, i) => 25 + Math.abs(Math.sin(i * 0.5) * 50 + Math.cos(i * 1.2) * 25)), []);

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
    if (val > 0 && isMuted) { setIsMuted(false); if (audioRef.current) audioRef.current.muted = false; } 
    else if (val === 0 && !isMuted) { setIsMuted(true); if (audioRef.current) audioRef.current.muted = true; }
    if (audioRef.current) audioRef.current.volume = val;
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioRef.current) audioRef.current.muted = newMutedState;
  };

  return (
    // اعمال گلس‌مورفیسم شفاف به پلیر صوتی
    <div className="w-full max-w-lg p-4 md:p-6 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 md:gap-6 font-sans relative overflow-hidden mx-auto my-4">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent" />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)} loop={isLooping} className="hidden" />

      <div className="flex items-center justify-center gap-2 px-4 relative z-10">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-500')}></span>
        </span>
        <h4 className="text-white font-bold truncate text-xs md:text-sm dir-rtl">{title || 'فایل صوتی'}</h4>
      </div>

      <div className="relative w-full h-12 md:h-16 flex items-center justify-between gap-[2px] z-10" dir="ltr">
        {waveformBars.map((height, i) => {
          const fillPercentage = (i / waveformBars.length) * 100;
          const isFilled = progress >= fillPercentage;
          return (
            <div key={i} className={cn("flex-1 rounded-full transition-colors duration-150", isFilled ? 'bg-[#06b6d4]' : 'bg-gray-600/50')} style={{ height: `${height}%` }}></div>
          );
        })}
        <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      </div>

      <div className="flex justify-between items-center text-[10px] md:text-xs text-gray-400 z-10" dir="ltr">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative flex items-center justify-center w-full mt-2 z-10" dir="ltr">
        <div className="flex items-center gap-2 md:gap-3">
          <Tooltip text="۱۵ ثانیه به عقب">
            <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="m19.208.367c-1.122-.568-2.398-.464-3.412.28L5.645,9.363c-.246.181-.462.39-.645.621V1c0-.552-.447-1-1-1s-1,.448-1,1v22c0-.552.447,1,1,1s1-.448,1-1v-8.984c.182.231.398.441.645.621l10.152,8.725c.581.427,1.248.643,1.923.643.503,0,1.01-.12,1.489-.363,1.122-.569,1.792-1.659,1.792-2.917V3.284c0-1.258-.67-2.348-1.792-2.917Z"/>
              </svg>
            </button>
          </Tooltip>

          <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
            <button onClick={togglePlay} className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#06b6d4] hover:bg-[#0891b2] border border-transparent rounded-full text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform cursor-pointer">
              <svg className={cn("w-6 h-6 md:w-7 md:h-7", !isPlaying ? 'ml-1' : '')} fill="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="m4.766.365c1.122-.568,2.398-.464,3.412.28l10.152,8.716c.246.181.462.39.645.621V.998c0-.552.447-1,1-1s1,.448,1,1v22c0-.552-.447,1-1,1s-1-.448-1-1v-8.984c-.182.231-.398.441-.645.621l-10.152,8.725c-.581.427-1.248.643-1.923.643-.503,0-1.01-.12-1.489-.363-1.122-.569-1.792-1.659-1.792-2.917V3.282c0-1.258.67-2.348,1.792-2.917Z"/>
              </svg>
            </button>
          </Tooltip>
        </div>

        <div className="absolute right-0 hidden sm:flex items-center gap-2" dir="ltr">
          <Tooltip text={isMuted || volume === 0 ? 'صدادار' : 'بی‌صدا'}>
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
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
          <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-12 md:w-16 h-1 appearance-none rounded-full cursor-pointer outline-none transition-all" style={{ background: `linear-gradient(to right, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)` }} />
        </div>
      </div>
    </div>
  );
}

// === ۲. پلیر ویدیویی ===
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
    if (val > 0 && isMuted) { setIsMuted(false); if (videoRef.current) videoRef.current.muted = false; } 
    else if (val === 0 && !isMuted) { setIsMuted(true); if (videoRef.current) videoRef.current.muted = true; }
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
    <div ref={containerRef} className="relative group w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-transparent max-h-[75vh] font-sans my-4">
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-20">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>}
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isPlaying ? 'bg-[#06b6d4]' : 'bg-gray-500')}></span>
        </span>
        <h4 className="text-white text-xs font-bold truncate dir-rtl">{title || 'ویدیو'}</h4>
      </div>

      <video ref={videoRef} onClick={togglePlay} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)} className="w-full h-full max-h-[75vh] object-contain cursor-pointer outline-none" preload="metadata">
        <source src={`${src}#t=0.1`} type={mimeType || 'video/mp4'} />
      </video>

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 md:gap-3 z-20">
        <div className="w-full flex items-center gap-3 px-2" dir="ltr">
          <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1 appearance-none rounded-full cursor-pointer outline-none transition-all" style={{ background: `linear-gradient(to right, #06b6d4 ${progress}%, #4b5563 ${progress}%)` }} />
        </div>
        <div className="flex items-center justify-between px-2" dir="ltr">
          <div className="flex items-center gap-2 md:gap-4">
            <Tooltip text={isPlaying ? 'توقف' : 'پخش'}>
              <button onClick={togglePlay} className="text-white hover:text-[#06b6d4] transition-colors p-1 cursor-pointer">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m19.208.367c-1.122-.568-2.398-.464-3.412.28L5.645,9.363c-.246.181-.462.39-.645.621V1c0-.552-.447-1-1-1s-1,.448-1,1v22c0-.552.447,1,1,1s1-.448,1-1v-8.984c.182.231.398.441.645.621l10.152,8.725c.581.427,1.248.643,1.923.643.503,0,1.01-.12,1.489-.363,1.122-.569,1.792-1.659,1.792-2.917V3.284c0-1.258-.67-2.348-1.792-2.917Z"/>
                </svg>
              </button>
            </Tooltip>
            <Tooltip text="۱۵ ثانیه به جلو">
              <button onClick={() => skip(15)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m4.766.365c1.122-.568,2.398-.464,3.412.28l10.152,8.716c.246.181.462.39.645.621V.998c0-.552.447-1,1-1s1,.448,1,1v22c0-.552-.447,1-1,1s-1-.448-1-1v-8.984c-.182.231-.398.441-.645.621l-10.152,8.725c-.581.427-1.248.643-1.923.643-.503,0-1.01-.12-1.489-.363-1.122-.569-1.792-1.659-1.792-2.917V3.282c0-1.258.67-2.348,1.792-2.917Z"/>
                </svg>
              </button>
            </Tooltip>
            <span className="text-[10px] md:text-xs text-white ml-1 md:ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2" dir="ltr">
              <Tooltip text={isMuted || volume === 0 ? 'صدادار' : 'بی‌صدا'}>
                <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
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
              <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-12 md:w-16 h-1 appearance-none rounded-full cursor-pointer outline-none transition-all" style={{ background: `linear-gradient(to right, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)` }} />
            </div>
            <Tooltip text="تمام‌صفحه">
              <button onClick={toggleFullScreen} className="text-gray-300 hover:text-white transition-colors p-1 cursor-pointer">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
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

// === ۳. سیستم تم و نگاشت فرمت‌ها ===
const THEMES = {
  RAW: { primaryText: "text-[#fbbf24]", primaryBg: "bg-[#fbbf24]", borderClass: "border-[#fbbf24]/30", badgeBg: "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30", glowBg: "rgba(251,191,36,0.15)", hoverText: "hover:text-[#fbbf24]", hoverBg: "hover:bg-[#fbbf24]", hoverBorder: "hover:border-[#fbbf24]", focusBorder: "focus:border-[#fbbf24]", fillCurrent: "fill-current text-[#fbbf24]", gradientVia: "via-[#fbbf24]" },
  PRODUCED: { primaryText: "text-[#f43f5e]", primaryBg: "bg-[#f43f5e]", borderClass: "border-[#f43f5e]/30", badgeBg: "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30", glowBg: "rgba(244,63,94,0.15)", hoverText: "hover:text-[#f43f5e]", hoverBg: "hover:bg-[#f43f5e]", hoverBorder: "hover:border-[#f43f5e]", focusBorder: "focus:border-[#f43f5e]", fillCurrent: "fill-current text-[#f43f5e]", gradientVia: "via-[#f43f5e]" },
  TOOL: { primaryText: "text-[#10b981]", primaryBg: "bg-[#10b981]", borderClass: "border-[#10b981]/30", badgeBg: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30", glowBg: "rgba(16,185,129,0.15)", hoverText: "hover:text-[#10b981]", hoverBg: "hover:bg-[#10b981]", hoverBorder: "hover:border-[#10b981]", focusBorder: "focus:border-[#10b981]", fillCurrent: "fill-current text-[#10b981]", gradientVia: "via-[#10b981]" },
  BLOG: { primaryText: "text-[#f59e0b]", primaryBg: "bg-[#f59e0b]", borderClass: "border-[#f59e0b]/30", badgeBg: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30", glowBg: "rgba(245,158,11,0.15)", hoverText: "hover:text-[#f59e0b]", hoverBg: "hover:bg-[#f59e0b]", hoverBorder: "hover:border-[#f59e0b]", focusBorder: "focus:border-[#f59e0b]", fillCurrent: "fill-current text-[#f59e0b]", gradientVia: "via-[#f59e0b]" }
};

const FORMATS_MAP = {
  "فیلم": { icon: "film", color: "text-[#06b6d4]" }, "ویدیویی": { icon: "film", color: "text-[#06b6d4]" },
  "تصویر": { icon: "photo", color: "text-[#10b981]" }, "تصویری": { icon: "photo", color: "text-[#10b981]" },
  "صوت": { icon: "music", color: "text-[#3b82f6]" }, "صوتی": { icon: "music", color: "text-[#3b82f6]" },
  "متن": { icon: "text", color: "text-[#f59e0b]" }, "متنی": { icon: "text", color: "text-[#f59e0b]" },
  "پروژه": { icon: "project", color: "text-[#a855f7]" }, "سایر": { icon: "cube", color: "text-[#ec4899]" },
  "سایر محتوا": { icon: "cube", color: "text-[#ec4899]" }
};

const sharePlatforms = [
  { name: 'ایتا', icon: 'eitaa', hoverColorClass: 'hover:text-[#f97316]', getUrl: (url, title) => `https://eitaa.com/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { name: 'بله', icon: 'bale', hoverColorClass: 'hover:text-[#10b981]', getUrl: (url, title) => `https://ble.ir/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { name: 'تلگرام', icon: 'telegram', hoverColorClass: 'hover:text-[#0088cc]', getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` }
];

const safeParse = (str, fallback = []) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try { return JSON.parse(str); } catch { return fallback; }
};

// ==========================================
// کامپوننت اصلی قالب تک‌محتوا 
// ==========================================
export default function SingleProductTemplate({ data, type = 'PRODUCED', currentUser = null }) {
  const [isFavorite, setIsFavorite] = useState(data?.isFavoritedByMe || false); 
  const [favCount, setFavCount] = useState(data?._count?.favoritedBy || 0);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0); 
  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  // === ناوبری چسبان (Sticky TOC) ===
  const [activeSection, setActiveSection] = useState('');

  const currentTheme = THEMES[type] || THEMES.PRODUCED;

  const parentBreadcrumb = useMemo(() => {
    switch(type) {
      case 'PRODUCED': return { label: 'محتوای تولیدی', href: '/p' };
      case 'RAW': return { label: 'محتوای خام', href: '/f' };
      case 'TOOL': return { label: 'ابزارها', href: '/tool' };
      default: return { label: 'محتوا', href: '/' };
    }
  }, [type]);

  const title = `${data?.titleBase || ''} ${data?.titleHighlight || ''}`.trim();
  
  const mainImage = data?.coverDesktop || data?.image || '/images/placeholder-cover.jpg'; 
  const mobileImage = data?.coverMobile || data?.image || mainImage; 
  
  const authors = data?.creators?.length > 0 ? data.creators : [{ name: 'مرکز مدار', imageUrl: null, avatarUrl: null }];

  const displaySettings = safeParse(data?.displaySettings, {});
  const formatsList = safeParse(data?.formats, []);
  const fileSpecs = safeParse(data?.fileSpecs, []);
  const timeline = safeParse(data?.changelog, []);
  const downloads = safeParse(data?.downloadLinks, []);
  const previewGallery = safeParse(data?.previewGallery, []);
  const relatedContent = safeParse(data?.relatedContent, []);
  const commentsList = safeParse(data?.comments, []);

  const combinedTaxonomies = useMemo(() => {
    const cats = (data?.categories || []).map(c => ({ name: c.name, link: `/t/${c.slug || c.name}`, isTag: false }));
    const tgs = (data?.tags || []).map(t => ({ name: t.name, link: `/t/${t.name}`, isTag: true }));
    return [...cats, ...tgs].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  }, [data]);

  const activeMedia = previewGallery[activeMediaIndex];

  const nextMedia = () => setActiveMediaIndex((prev) => (prev + 1) % previewGallery.length);
  const prevMedia = () => setActiveMediaIndex((prev) => (prev - 1 + previewGallery.length) % previewGallery.length);

  const handleCopyLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://madar.ir';
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const showLoginToast = () => {
    toast((t) => (
      <div className="flex flex-col gap-2 font-sans text-right" dir="rtl">
        <span className="text-sm font-bold text-white">دسترسی محدود</span>
        <span className="text-xs text-gray-300">برای استفاده از این امکان باید وارد حساب کاربری خود شوید.</span>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.dismiss(t.id);
            setShowAuthModal(true); 
          }}
          className={`mt-2 ${currentTheme.primaryBg} text-white px-4 py-2 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-transparent hover:brightness-110 transition-all cursor-pointer`}
        >
          ورود / عضویت
        </button>
      </div>
    ), {
      duration: 5000,
      style: { background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const handleFavoriteClick = async () => {
    if (!currentUser) {
      showLoginToast();
      return;
    }
    
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    setFavCount(prev => newStatus ? prev + 1 : prev - 1);
    
    const res = await toggleFavoriteAction(data.id);
    if (!res.success) {
      setIsFavorite(!newStatus); 
      setFavCount(prev => !newStatus ? prev + 1 : prev - 1);
      toast.error(res.error);
    }
  };

  const handleDownloadClick = async (e, fileUrl) => {
    e.preventDefault();
    if (!currentUser) return; 

    const toastId = toast.loading('در حال تولید لینک امن دانلود...');
    const res = await generateSecureDownloadAction(data.id, fileUrl);
    
    if (res.success) {
      toast.success(res.message || 'لینک دانلود آماده شد!', { 
        id: toastId, 
        duration: 8000 // پیام را ۸ ثانیه نگه می‌داریم تا کاربر فرصت خواندن داشته باشد
      });
      window.open(res.url, '_blank');
    } else {
      toast.error(res.error || 'خطا در ساخت لینک دانلود', { id: toastId });
    }
  };

  const handleCommentFocus = (e) => {
    if (!currentUser) {
      e.target.blur(); 
      showLoginToast();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return; 
    if (!commentText.trim()) return;

    const toastId = toast.loading('در حال ارسال دیدگاه...');
    const res = await submitCommentAction(data.id, commentText);
    
    if (res.success) {
      toast.success('دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر می‌شود.', { id: toastId });
      setCommentText('');
    } else {
      toast.error(res.error || 'خطا در ثبت دیدگاه', { id: toastId });
    }
  };

  useEffect(() => {
    const seoTitle = data?.seoTitle || title;
    if (seoTitle) document.title = `مدار | ${seoTitle}`;
  }, [data, title]);

  const showDateFlag = displaySettings.showDate !== false && !!data?.publishedAt;
  const showReadTimeFlag = displaySettings.showReadTime !== false && !!data?.readTime;
  const showAgeRatingFlag = displaySettings.showAgeRating !== false && !!data?.ageRating;
  const hasAnyMetaInfo = showDateFlag || showReadTimeFlag || showAgeRatingFlag;

  const isCommentsEnabled = displaySettings.allowComments !== false && data?.allowComments !== false && displaySettings.showComments !== false;

// === منطق ناوبری چسبان (Scrollspy) ===
  const [isTocSticky, setIsTocSticky] = useState(false); 

  const tocSections = useMemo(() => {
    const list = [];
    if (data?.body) list.push({ id: 'sec-body', title: 'معرفی' });
    if (fileSpecs.length > 0) list.push({ id: 'sec-files', title: 'اطلاعات فایل‌ها' });
    if (timeline.length > 0) list.push({ id: 'sec-timeline', title: 'به‌روزرسانی' });
    if (previewGallery.length > 0) list.push({ id: 'sec-preview', title: 'پیش‌نمایش' });
    if (displaySettings.isDownloadActive !== false && downloads.length > 0) list.push({ id: 'sec-download', title: 'دانلود' });
    if (isCommentsEnabled) list.push({ id: 'sec-comments', title: 'نظرات' });
    return list;
  }, [data, fileSpecs, timeline, previewGallery, downloads, isCommentsEnabled, displaySettings]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-100px 0px -50% 0px' });
    
    tocSections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const tocAnchor = document.getElementById('toc-anchor');
      if (tocAnchor) {
        setIsTocSticky(tocAnchor.getBoundingClientRect().top <= 16); 
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tocSections]);

  return (
    // حذف bg-[#05080f] برای دیده شدن نورهای متحرک زیرین - اضافه شدن select-none
    <div className={`relative min-h-screen flex flex-col scroll-smooth select-none theme-${type.toLowerCase()}`}>
      
      <ProgressBar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pb-0 md:pb-20 pt-0 sm:pt-6">
        
        <div className="relative z-20 px-4 sm:px-0 pt-4 sm:pt-0 pb-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent md:bg-none [&_a]:!text-white/90 [&_a:hover]:!text-white [&_svg]:!text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <Breadcrumbs items={[{ label: 'مدار', href: '/' }, parentBreadcrumb, { label: title || 'بدون عنوان' }]} />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-8 mt-4 relative">
          
          {/* ۱. افزایش ارتفاع تصویر موبایل از 45vh به 62vh برای پوشش کامل فضای خالی */}
          <div className="lg:col-span-7 fixed top-0 inset-x-0 z-0 h-[62vh] md:h-auto md:relative md:z-auto w-full md:aspect-video md:rounded-[2.5rem] md:shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:p-1 md:border border-transparent group pointer-events-none md:pointer-events-auto">
            <div className="hidden md:block absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10 rounded-[2.5rem]" />
            <div className={`hidden md:block absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
            
            <div className="absolute inset-0 w-full h-full md:rounded-[2.2rem] overflow-hidden bg-black/40 shadow-inner">
              {(data?.coverDesktop || data?.image) && (
                <img src={data.coverDesktop || data.image} alt={title} className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              )}
              {(data?.coverMobile || data?.coverDesktop || data?.image) && (
                <img src={data?.coverMobile || data?.coverDesktop || data?.image} alt={title} className="md:hidden block absolute inset-0 w-full h-full object-cover opacity-85" />
              )}
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#05080f] via-[#05080f]/60 to-transparent md:hidden pointer-events-none z-10" />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#05080f] to-transparent md:hidden pointer-events-none z-10" />
          </div>

          {/* ۲. کانتینر باکس اول - حذف سایه برش‌دهنده زیرین و محو تدریجی انتهای لایه */}
          <div className="lg:col-span-5 relative md:bg-transparent rounded-t-[2.5rem] md:rounded-none mt-[35vh] md:mt-0 px-5 pt-7 pb-4 md:p-0 flex flex-col justify-center">
            
            {/* لایه شیشه‌ای و تاریک زیر باکس اول با محو تدریجی در انتها */}
            <div className="md:hidden absolute inset-x-0 top-0 -bottom-32 bg-[#050810]/70 backdrop-blur-3xl rounded-t-[2.5rem] pointer-events-none z-[1] [mask-image:linear-gradient(to_bottom,black_calc(100%-128px),rgba(0,0,0,0.7)_calc(100%-64px),transparent_100%)]" />

            {/* لایه هاله‌های نوری کمکی برای موبایل با محو تدریجی بدون برش افقی */}
            <div className="md:hidden absolute inset-x-0 top-0 h-[420px] rounded-t-[2.5rem] overflow-hidden pointer-events-none z-[2] [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-[70px] opacity-40" style={{ background: `radial-gradient(circle, ${currentTheme.glowBg.replace('0.15', '1')} 0%, transparent 70%)` }} />
              <div className="absolute top-24 -left-16 w-60 h-60 rounded-full blur-[70px] opacity-30" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-5 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] md:p-0 md:rounded-none md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none space-y-5 md:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`border text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-inner ${currentTheme.badgeBg}`}>
                  {parentBreadcrumb.label}
                </span>
                
                {formatsList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5 ml-0 md:ml-2 bg-white/5 border border-transparent shadow-inner px-3 py-1.5 rounded-2xl text-[10px] md:text-xs text-gray-300">
                    {formatsList.map((fmt, idx) => {
                      const isOther = fmt.startsWith("سایر:") || fmt.startsWith("سایر");
                      const displayLabel = isOther ? fmt.replace(/^سایر\s*:\s*/, '').trim() : fmt;
                      const formatData = isOther ? FORMATS_MAP["سایر"] : (FORMATS_MAP[fmt] || { icon: "cube", color: "text-[#ec4899]" });

                      return (
                        <div key={idx} className="flex items-center gap-1.5 shrink-0">
                          {idx > 0 && <span className="w-1 h-1 rounded-full bg-gray-500"></span>}
                          <Icon name={formatData.icon} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${formatData.color} fill-current`} />
                          <span className="font-sans">{displayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight md:leading-tight mb-3 font-sans">
                  {data?.titleBase} <span className={currentTheme.primaryText}>{data?.titleHighlight}</span>
                </h1>
                {data?.subtitle && (
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light text-justify font-sans">
                    {data.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative md:bg-transparent px-5 md:px-0 pb-20 md:pb-10 mt-0 pt-1 md:pt-0">
          
          {/* لایه شیشه‌ای بخش پایین با شروع و پایان محوشونده تدریجی برای اتصال نامرئی به لایه بالایی */}
          <div className="md:hidden absolute inset-x-0 -top-32 bottom-0 bg-[#050810]/70 backdrop-blur-3xl pointer-events-none z-[1] [mask-image:linear-gradient(to_bottom,transparent_0px,rgba(0,0,0,0.7)_64px,black_128px,black_calc(100%-120px),transparent_100%)]" />

          <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none z-[2]">
            <div className="absolute top-[10%] -right-16 w-72 h-72 rounded-full blur-[80px] opacity-30" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
            <div className="absolute top-[35%] -left-16 w-72 h-72 rounded-full blur-[80px] opacity-30" style={{ background: `radial-gradient(circle, ${currentTheme.glowBg.replace('0.15', '1')} 0%, transparent 70%)` }} />
            <div className="absolute top-[60%] -right-12 w-72 h-72 rounded-full blur-[80px] opacity-30" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
            <div className="absolute bottom-[8%] -left-12 w-72 h-72 rounded-full blur-[80px] opacity-30" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
          </div>

          <div className="lg:hidden relative z-10 mt-5 mb-5 w-full">
            {hasAnyMetaInfo && (
              <div className="relative flex flex-wrap items-center justify-between gap-y-3 gap-x-4 text-xs text-gray-400 bg-white/[0.03] backdrop-blur-md px-4 py-3 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] font-sans w-full">
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
                  {showDateFlag && (
                    <Tooltip text="تاریخ انتشار"><span className="flex items-center gap-1 cursor-default"><Icon name="calendarBlank" className="w-3.5 h-3.5" /> {toPersianDigits(new Date(data.publishedAt).toLocaleDateString('fa-IR'))}</span></Tooltip>
                  )}
                  {showReadTimeFlag && (
                    <><span className="w-1 h-1 bg-white/10 rounded-full hidden sm:block"></span><Tooltip text="زمان مطالعه"><span className="flex items-center gap-1 cursor-default"><Icon name="clock" className="w-3.5 h-3.5" /> {toPersianDigits(data.readTime)} دقیقه</span></Tooltip></>
                  )}
                  {showAgeRatingFlag && (
                    <>
                      <span className="w-1 h-1 bg-white/10 rounded-full hidden sm:block"></span>
                      <Tooltip text="رده‌بندی سنی">
                        <span className="flex items-center gap-1 cursor-default">
                          <Icon name="shieldCheck" className={`w-3.5 h-3.5 ${currentTheme.primaryText}`} />
                          <span className="dir-ltr text-white font-bold pl-1">{toPersianDigits(data.ageRating)}</span>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mr-auto">
                  <Tooltip text="اشتراک‌‌گذاری">
                    <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full shadow-inner">
                      <Icon name="shareNetwork" className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text={isFavorite ? "حذف از علاقه‌‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}>
                    <button onClick={handleFavoriteClick} className={`transition-all cursor-pointer flex items-center gap-1.5 p-2 px-3 rounded-full shadow-inner ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}>
                      <Icon name="heart" className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      <span className="text-[11px] font-sans font-bold pt-0.5">{toPersianDigits(favCount)}</span>
                    </button>
                  </Tooltip>
                </div>

              </div>
            )}
          </div>

          {tocSections.length > 1 && (
            <>
              <div id="toc-anchor" className="lg:hidden w-full h-px -mt-px opacity-0 pointer-events-none"></div>
              
              <div className={`lg:hidden w-full transition-all ${isTocSticky ? 'h-[44px] mb-6' : 'h-0 mb-0'}`}></div>
         
              <div className={cn(
                "lg:hidden z-[50] transition-all duration-75 w-full flex items-center justify-center",
                isTocSticky ? "fixed top-4 left-0 right-0 pl-[4.2rem] pr-4" : "relative mb-6 pl-[4rem] pr-1"
              )}>
                <div className="flex items-center justify-between w-full p-1 bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_12px_20px_-8px_rgba(0,0,0,0.9),inset_0_0_15px_rgba(255,255,255,0.02)]">
                  {tocSections.map(sec => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button 
                        key={sec.id}
                        onClick={() => {
                          const el = document.getElementById(sec.id);
                          if (el) {
                             const y = el.getBoundingClientRect().top + window.scrollY - 80;
                             window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        className={cn(
                          "flex-1 min-w-0 flex items-center justify-center whitespace-nowrap px-0.5 py-1.5 rounded-full text-[9px] font-bold transition-all font-sans cursor-pointer border text-center", 
                          isActive 
                            ? `bg-[#161f33] ${currentTheme.primaryText} ${currentTheme.borderClass} shadow-inner` 
                            : "text-gray-300 border-transparent hover:text-white"
                        )}
                      >
                        <span className="truncate w-full">{sec.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 mt-0 relative z-10">
            
            <div className="contents lg:block lg:col-span-8 lg:space-y-8">
              
              <div className="hidden lg:block mb-0">
                {hasAnyMetaInfo && (
                  <div className="relative flex flex-wrap items-center justify-between gap-y-3 gap-x-4 text-sm text-gray-400 bg-white/[0.03] backdrop-blur-md px-6 py-3.5 rounded-[1.2rem] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] border border-white/[0.05] font-sans w-full">
                    
                    <div className="flex flex-wrap items-center gap-x-4">
                      {showDateFlag && (
                        <Tooltip text="تاریخ انتشار"><span className="flex items-center gap-1.5 cursor-default"><Icon name="calendarBlank" className="w-4 h-4" /> {toPersianDigits(new Date(data.publishedAt).toLocaleDateString('fa-IR'))}</span></Tooltip>
                      )}
                      {showReadTimeFlag && (
                        <><span className="w-1 h-1 bg-white/10 rounded-full"></span><Tooltip text="زمان مطالعه"><span className="flex items-center gap-1.5 cursor-default"><Icon name="clock" className="w-4 h-4" /> {toPersianDigits(data.readTime)} دقیقه</span></Tooltip></>
                      )}
                      {showAgeRatingFlag && (
                        <>
                          <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                          <Tooltip text="رده‌بندی سنی">
                            <span className="flex items-center gap-1.5 cursor-default">
                              <Icon name="shieldCheck" className={`w-4 h-4 ${currentTheme.primaryText}`} />
                              رده‌بندی: <span className="dir-ltr text-white font-bold">{toPersianDigits(data.ageRating)}</span>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 justify-end">
                      <Tooltip text="اشتراک‌گذاری">
                        <button onClick={() => setIsShareModalOpen(true)} className="transition-colors cursor-pointer text-gray-400 hover:text-white p-2.5 bg-white/5 hover:bg-white/10 rounded-full shadow-inner">
                          <Icon name="shareNetwork" className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip text={isFavorite ? "حذف از علاقه‌‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}>
                        <button onClick={handleFavoriteClick} className={`transition-all cursor-pointer flex items-center gap-1.5 p-2.5 px-4 rounded-full shadow-inner ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}>
                          <Icon name="heart" className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                          <span className="text-[11px] font-sans font-bold pt-0.5">{toPersianDigits(favCount)}</span>
                        </button>
                      </Tooltip>
                    </div>

                  </div>
                )}
              </div>

              {data?.body && (
                <div id="sec-body" className="order-2 lg:order-none mb-6 lg:mb-0 relative p-5 md:p-8 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group select-none">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <h2 className="text-lg md:text-xl font-bold text-white mb-5 md:mb-6 flex items-center gap-2 relative z-10 font-sans border-b border-white/10 pb-4">
                    <Icon name="info" className={`w-5 h-5 md:w-6 md:h-6 ${currentTheme.fillCurrent}`} /> معرفی کامل
                  </h2>
                  
                  {/* اضافه شدن select-none و کلاس اجباری [&_*]:!select-none */}
                  <div className={`rich-text theme-${type.toLowerCase()} relative z-10 text-sm md:text-base leading-relaxed select-none [&_*]:!select-none [&_*]:!backdrop-blur-none [&_*]:!blur-none`}>
                    <div dangerouslySetInnerHTML={{ __html: data.body }} />
                  </div>
                </div>
              )}

              {previewGallery.length > 0 && (
                <div id="sec-preview" className="order-5 lg:order-none mb-6 lg:mb-0 relative p-5 md:p-8 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <h2 className="text-lg md:text-xl font-bold text-white mb-5 md:mb-6 flex items-center gap-2 relative z-10 font-sans border-b border-white/10 pb-4">
                    <Icon name="playCircle" className={`w-5 h-5 md:w-6 md:h-6 ${currentTheme.fillCurrent}`} /> پیش‌نمایش محتوا
                  </h2>
                  
                  {activeMedia && activeMedia.url ? (
                    <div className="preview-media-container relative z-10 w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center bg-black/80 shadow-inner border border-transparent group/vid mb-4 [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:rounded-none [&:fullscreen]:bg-black">
                      
                      <button
                        type="button"
                        title="نمایش تمام‌صفحه"
                        onClick={(e) => {
                          const container = e.currentTarget.closest('.preview-media-container');
                          if (!container) return;
                          if (!document.fullscreenElement) {
                            if (container.requestFullscreen) container.requestFullscreen().catch(() => {});
                            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                          } else {
                            if (document.exitFullscreen) document.exitFullscreen();
                            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                          }
                        }}
                        className="absolute top-3 left-3 z-30 p-2 md:p-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-white/10 text-white/80 hover:text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.5,15.5A1.5,1.5,0,0,0,21,17v1.5A2.5,2.5,0,0,1,18.5,21H17a1.5,1.5,0,0,0,0,3h1.5A5.506,5.506,0,0,0,24,18.5V17A1.5,1.5,0,0,0,22.5,15.5Z"/>
                          <path d="M7,0H5.5A5.506,5.506,0,0,0,0,5.5V7A1.5,1.5,0,0,0,3,7V5.5A2.5,2.5,0,0,1,5.5,3H7A1.5,1.5,0,0,0,7,0Z"/>
                          <path d="M7,21H5.5A2.5,2.5,0,0,1,3,18.5V17a1.5,1.5,0,0,0-3,0v1.5A5.506,5.506,0,0,0,5.5,24H7a1.5,1.5,0,0,0,0-3Z"/>
                          <path d="M18.5,0H17a1.5,1.5,0,0,0,0,3h1.5A2.5,2.5,0,0,1,21,5.5V7a1.5,1.5,0,0,0,3,0V5.5A5.506,5.506,0,0,0,18.5,0Z"/>
                        </svg>
                      </button>

                      {previewGallery.length > 1 && (
                        <>
                          <button onClick={prevMedia} className="absolute right-2 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-transparent shadow-inner text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"><Icon name="chevronRight" className="w-4 h-4 md:w-5 md:h-5" /></button>
                          <button onClick={nextMedia} className="absolute left-2 md:left-4 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-transparent shadow-inner text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"><Icon name="chevronLeft" className="w-4 h-4 md:w-5 md:h-5" /></button>
                        </>
                      )}

                      {activeMedia.type === 'video' ? (
                        <CustomVideoPlayer src={activeMedia.url} mimeType="video/mp4" title={activeMedia.desc || title} />
                      ) : activeMedia.type === 'audio' ? (
                        <div className="w-full flex items-center justify-center z-10 p-4">
                           <CustomAudioPlayer src={activeMedia.url} title={activeMedia.desc || title} />
                        </div>
                      ) : (
                        <BlurImage src={activeMedia.url} className="w-full h-full object-contain" alt="Preview Image" />
                      )}
                    </div>
                  ) : (
                    <div className="relative z-10 w-full aspect-video rounded-2xl flex flex-col items-center justify-center bg-black/40 border border-transparent shadow-inner text-gray-500 mb-4">
                      <Icon name="image" className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                      <span className="text-[10px] md:text-xs font-sans">لینک رسانه معتبر نیست یا خالی است</span>
                    </div>
                  )}
                  
                  <p className="text-xs md:text-sm text-gray-400 text-center mb-5 md:mb-6 px-4 font-light relative z-10 font-sans">{activeMedia?.desc || ''}</p>

                  {previewGallery.length > 1 && (
                    <div className="flex gap-2.5 md:gap-3.5 overflow-x-auto custom-scrollbar pb-3 pt-2 px-1 relative z-10">
                      {previewGallery.map((media, idx) => {
                        const isSelected = activeMediaIndex === idx;
                        return (
                          <button 
                            key={idx} 
                            onClick={() => setActiveMediaIndex(idx)} 
                            className={cn(
                              "w-24 h-16 md:w-28 md:h-20 shrink-0 rounded-xl overflow-hidden cursor-pointer relative transition-all duration-300 shadow-md",
                              isSelected 
                                ? `ring-2 ring-inset ${currentTheme.borderClass.replace('/30', '')} border border-white/30 scale-105 opacity-100 z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)]` 
                                : "opacity-35 hover:opacity-75 brightness-75 hover:brightness-100 scale-95 hover:scale-100 border border-transparent"
                            )}
                          >
                            <BlurImage src={media.thumbnail || media.url} className="w-full h-full object-cover" alt="thumbnail" />
                            
                            <div className={cn(
                              "absolute inset-0 flex items-center justify-center transition-colors duration-300",
                              isSelected 
                                ? "bg-black/10" 
                                : "bg-black/60 hover:bg-black/30"
                            )}>
                              <Icon 
                                name={media.type === 'video' ? 'film' : media.type === 'audio' ? 'music' : 'photo'} 
                                className={cn(
                                  "w-5 h-5 md:w-6 md:h-6 drop-shadow-lg transition-transform",
                                  isSelected 
                                    ? `${currentTheme.fillCurrent} scale-110` 
                                    : "text-white/60"
                                )} 
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {combinedTaxonomies.length > 0 && (
                <div id="sec-tax" className="order-7 lg:order-none mb-0 pt-2 mt-4 md:mt-2">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <Icon name="hash" className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <span className="text-xs md:text-sm font-bold text-gray-300 font-sans">دسته‌بندی‌ها و برچسب‌ها:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {combinedTaxonomies.map((tax, idx) => (
                      <a key={idx} href={tax.link} className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/5 border border-transparent shadow-inner text-[11px] md:text-xs font-bold text-gray-300 ${currentTheme.hoverText} hover:bg-white/10 transition-all font-sans`}>
                        {tax.isTag && (
                          <Icon name="hash" className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-60 shrink-0" />
                        )}
                        <span>{tax.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {displaySettings.showAuthor !== false && (
                <div className="mb-0 pt-3 mt-3 md:pt-6 md:mt-8 border-t border-white/10">
                  <div className="flex items-center gap-2 md:gap-3 mb-4">
                    <Icon name="user" className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <span className="text-xs md:text-sm font-bold text-gray-300 font-sans">نویسندگان و پژوهشگران:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {authors.map((author, index) => {
                      // اصلاح و یکپارچه‌سازی متغیر استخراج تصویر
                      const rawImage = author?.avatar || author?.image || author?.imageUrl || author?.avatarUrl || author?.creator?.avatar || author?.creator?.imageUrl || null;
                      const authorImage = typeof rawImage === 'string' && rawImage.trim() !== ''
                        ? (rawImage.startsWith('http') || rawImage.startsWith('/') || rawImage.startsWith('data:') ? rawImage.trim() : `/${rawImage.trim()}`)
                        : null;
                      
                      return (
                        <a key={index} href={`/t/${author.slug || author.name}`} className="inline-flex items-center gap-2 group cursor-pointer bg-white/5 hover:bg-white/10 border border-transparent shadow-inner transition-colors pr-1.5 pl-3 md:pl-4 py-1.5 rounded-full w-max">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-transparent shadow-inner shrink-0 relative bg-black/40 flex items-center justify-center">
                            {authorImage ? (
                              <BlurImage src={authorImage} alt={author.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <Icon name="user" className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <span className={`text-[11px] md:text-xs font-bold text-white ${currentTheme.hoverText} transition-colors font-sans`}>
                            {author.name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {relatedContent && relatedContent.length > 0 && (
                <section id="sec-related" className="order-9 lg:order-none mb-6 lg:mb-0 mt-8 md:mt-10 pt-6 border-t border-white/10 relative z-10">
                  <div className="flex items-end justify-between mb-5 md:mb-6">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-white mb-1.5 font-sans">محتوای مرتبط</h2>
                      <p className="text-[10px] md:text-xs text-gray-400 font-light font-sans">محتوای مشابه که ممکن است برایتان جالب باشد</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
                    {relatedContent.map(rel => (
                      <a key={rel.id} href={rel.link || '#'} className="relative group flex flex-col p-2.5 md:p-3 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-[0_5px_15px_rgba(0,0,0,0.3)] border border-transparent">
                        <div className="absolute inset-0 bg-white/5 border border-transparent shadow-inner group-hover:bg-white/10 backdrop-blur-xl pointer-events-none -z-10 transition-colors" />
                        <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none z-20`} />
                        
                        <div className="relative w-full aspect-square md:aspect-video rounded-xl bg-black/40 shadow-inner overflow-hidden mb-3 flex items-center justify-center z-10 border border-transparent">
                          <BlurImage src={rel.image || '/images/placeholder-cover.jpg'} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={rel.title || "Related"} />
                        </div>
                        <div className="flex-grow z-10">
                          <h3 className={`text-[11px] md:text-xs font-bold text-white mb-2 leading-relaxed ${currentTheme.hoverText} transition-colors line-clamp-2 font-sans`}>{rel.title}</h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {isCommentsEnabled && (
                <section id="sec-comments" className="order-10 lg:order-none mb-6 lg:mb-0 mt-3 pt-3 md:mt-10 md:pt-6 border-t border-white/10 relative z-10">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-5 md:mb-6 flex items-center gap-2 md:gap-3 font-sans">
                    <Icon name="chat" className={`w-5 h-5 md:w-6 md:h-6 ${currentTheme.fillCurrent}`} /> نظرات کاربران 
                    <span className="text-[10px] md:text-xs font-sans font-bold text-gray-300 bg-white/10 border border-transparent shadow-inner px-2 md:px-3 py-1 rounded-full">
                      {toPersianDigits(commentsList.length)} نظر
                    </span>
                  </h3>

                  <div className="relative p-5 sm:p-6 rounded-3xl mb-6 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                    <form className="relative z-10" onSubmit={handleCommentSubmit}>
                      <div className="mb-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-1 gap-2">
                          {currentUser ? (
                            <span className="text-[10px] md:text-[11px] font-bold text-[#10b981] font-sans pl-1">شما با حساب کاربری وارد شده‌اید</span>
                          ) : (
                            <span className="text-[10px] md:text-[11px] font-bold text-rose-400 font-sans pl-1">ابتدا وارد سایت شوید</span>
                          )}
                          <span className="text-[9px] text-gray-400 font-sans font-bold px-2 py-0.5 bg-black/40 rounded-lg shadow-inner w-fit">پس از تأیید نمایش داده می‌شود</span>
                        </div>
                        <textarea 
                          rows="4" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onFocus={(e) => {
                            handleCommentFocus(e);
                            e.target.style.borderColor = currentTheme.primaryBg.replace('bg-', '');
                          }}
                          onBlur={(e) => e.target.style.borderColor = 'transparent'}
                          placeholder={currentUser ? "نظر خود را درباره این محتوا بنویسید..." : "برای ثبت دیدگاه کلیک کنید..."} 
                          className={`w-full bg-white/10 border border-transparent rounded-2xl p-3.5 md:p-4 text-white placeholder:text-white/40 text-xs md:text-sm leading-relaxed ${currentTheme.focusBorder} focus:bg-white/20 outline-none transition-all resize-none shadow-inner font-sans`}
                          style={{ '--tw-ring-color': currentTheme.primaryText }} 
                        />
                      </div>
                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          disabled={!commentText.trim() || !currentUser} 
                          className={`w-full sm:w-auto bg-white/10 border border-transparent text-white hover:bg-white/20 px-8 py-3.5 md:py-3 rounded-xl text-sm font-bold ${currentTheme.hoverBg} hover:text-white transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans`}
                        >
                          ارسال دیدگاه
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {commentsList.map((comment, idx) => (
                      <div key={idx} className="bg-white/5 border border-transparent hover:bg-white/10 transition-colors rounded-2xl p-4 md:p-5 shadow-inner">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 border border-transparent shadow-inner flex items-center justify-center shrink-0">
                              <Icon name="user" className={`w-4 h-4 md:w-5 md:h-5 ${currentTheme.primaryText}`} />
                            </div>                  
                            <div>
                              <h4 className="text-xs md:text-sm font-bold text-white font-sans">{comment.user}</h4>
                              <span className="text-[9px] md:text-[10px] text-gray-500 font-sans font-bold block mt-0.5">{toPersianDigits(comment.date)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light text-justify font-sans">
                          {comment.text}
                        </p>
                        {comment.adminReply && (
                        <div className={`mt-3 md:mt-4 bg-black/30 border-r-2 ${currentTheme.borderClass.replace('/30', '')} border-transparent shadow-inner p-3 md:p-4 rounded-xl`}>
                          <span className={`text-[9px] md:text-[10px] ${currentTheme.primaryText} font-bold mb-1.5 md:mb-2 flex items-center gap-1.5 font-sans`}>
                            <Icon name="shieldCheck" className="w-3 h-3 md:w-3.5 md:h-3.5" /> پاسخ مدار:
                          </span>
                          <p className="text-[11px] md:text-xs text-gray-300 leading-relaxed font-light font-sans text-justify">{comment.adminReply}</p>
                        </div>
                      )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* ستون چپ در دسکتاپ */}
            <div className="contents lg:block lg:col-span-4 lg:space-y-8">
              
              {fileSpecs.length > 0 && (
                <div id="sec-files" className="order-3 lg:order-none mb-6 lg:mb-0 relative p-5 md:p-6 lg:p-8 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <h3 className="text-xs md:text-sm font-bold text-white mb-5 md:mb-6 uppercase tracking-widest text-center border-b border-white/10 pb-3 md:pb-4 relative z-10 font-sans">اطلاعات فایل‌ها</h3>
                  <ul className="space-y-3 md:space-y-4 relative z-10">
                    {fileSpecs.map((spec, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-[11px] md:text-xs font-bold font-sans">
                          {spec.iconUrl ? <img src={spec.iconUrl} alt="icon" className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Icon name="fileText" className="w-4 h-4 md:w-5 md:h-5" />} {spec.label}
                        </div>
                        <span className="text-white text-xs md:text-sm font-sans font-bold" dir="ltr">{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {timeline.length > 0 && (
                <div id="sec-timeline" className="order-4 lg:order-none mb-6 lg:mb-0 relative p-5 md:p-6 lg:p-8 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

                  <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2 relative z-10 font-sans border-b border-white/10 pb-3 md:pb-4">
                    <Icon name="update" className={`w-4 h-4 md:w-5 md:h-5 ${currentTheme.fillCurrent}`} /> تاریخچه به‌روزرسانی‌ها
                  </h3>

                  <div className="relative z-10 max-h-[300px] md:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-white/10 z-0"></div>
                    <div className="space-y-5 md:space-y-6 relative z-10">
                      {timeline.map((item, idx) => {
                        const descText = item.desc || item.description || '';
                        return (
                          <div key={idx} className="relative pl-2 md:pl-4 pr-6 md:pr-8">
                            <div className={`absolute right-0 top-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#050810] border-2 ${idx === 0 ? `${currentTheme.borderClass.replace('/30', '')} shadow-[0_0_10px_${currentTheme.glowBg.replace('0.15', '0.5')}]` : 'border-white/20'} flex items-center justify-center z-10`}>
                              {idx === 0 && <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${currentTheme.primaryBg} rounded-full`}></div>}
                            </div>

                            <div className="flex flex-col gap-1.5 md:gap-2">
                              <span className={`${idx === 0 ? `${currentTheme.primaryText}${currentTheme.borderClass} border shadow-inner bg-white/5` : 'bg-black/40 border border-transparent shadow-inner text-gray-400'} text-[9px] md:text-[10px] font-sans font-bold px-2.5 py-1 rounded-lg w-fit`}>
                                نسخه {toPersianDigits(item.version)}
                              </span>
                              
                              <div className="flex justify-between items-start gap-3 mt-1">
                                <h4 className={`text-xs md:text-sm font-bold leading-relaxed font-sans ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>{item.title}</h4>
                                <span className="text-[9px] md:text-[10px] text-gray-500 font-sans font-bold shrink-0 pt-0.5">{toPersianDigits(item.date)}</span>
                              </div>

                              {descText && (
                                <ul className="list-disc pr-3 md:pr-4 space-y-1 md:space-y-1.5 text-[10px] md:text-[11px] text-gray-400 leading-relaxed font-light marker:text-gray-500 text-justify font-sans mt-1.5 md:mt-2">
                                  {descText.split('\n').map((descLine, i) => (
                                    descLine.trim() ? <li key={i}>{toPersianDigits(descLine.trim())}</li> : null
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {displaySettings.isDownloadActive !== false && downloads.length > 0 && (
                <div id="sec-download" className="order-6 lg:order-none mb-6 lg:mb-0 relative p-5 md:p-6 lg:p-8 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-transparent group">
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] pointer-events-none -z-10" />
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />
                  <div className={`absolute -right-10 -top-10 w-24 h-24 md:w-32 md:h-32 ${currentTheme.primaryBg} opacity-10 rounded-full blur-3xl pointer-events-none`}></div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-white mb-5 md:mb-6 flex items-center gap-2 relative z-10 font-sans border-b border-white/10 pb-3 md:pb-4">
                    <Icon name="download" className={`w-5 h-5 md:w-6 md:h-6 ${currentTheme.fillCurrent}`} /> دانلود فایل‌ها
                  </h3>

                  <div className="relative">
                    {!currentUser && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050810]/80 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                        <Icon name="lock" className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-2 md:mb-3 opacity-80" />
                        <h4 className="text-base md:text-lg font-bold text-white mb-1.5 md:mb-2 font-sans">دسترسی محدود</h4>
                        <p className="text-[10px] md:text-[11px] font-sans font-light text-gray-400 mb-4 md:mb-6 text-center px-2 md:px-6 leading-relaxed">برای دانلود و مشاهده لینک‌های این محتوا باید وارد حساب کاربری خود شوید.</p>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAuthModal(true); 
                          }} 
                          className="px-6 md:px-8 py-2.5 md:py-3 bg-white/10 border border-transparent shadow-inner hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans w-full sm:w-auto"
                        >
                          ورود / عضویت
                        </button>
                      </div>
                    )}

                    <div className={cn("space-y-2.5 md:space-y-3 relative z-10 max-h-[300px] md:max-h-[350px] overflow-y-auto px-1 custom-scrollbar", !currentUser && "opacity-30 pointer-events-none select-none blur-[2px] pb-4")}>
                      {downloads.map((dl, idx) => (
                        <button 
                          key={idx} 
                          onClick={(e) => handleDownloadClick(e, dl.url)}
                          className={`w-full flex items-center justify-between gap-3 md:gap-4 p-3.5 md:p-4 rounded-xl bg-white/5 border border-transparent shadow-inner hover:bg-white/10 ${currentTheme.hoverBorder}/50 transition-colors group/item cursor-pointer text-right`}
                        >
                          <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-1.5">
                            <h4 className="text-xs md:text-sm font-bold text-white leading-snug font-sans">{dl.title}</h4>
                            {dl.format && (
                              <span className="text-[10px] md:text-xs text-gray-400 font-sans font-bold">{dl.format}</span>
                            )}
                            {dl.desc && (
                              <p className="text-[10px] md:text-[11px] text-gray-500 font-sans font-light text-justify leading-relaxed mt-0.5 md:mt-1">
                                {dl.desc}
                              </p>
                            )}
                          </div>

                          <div 
                            className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 shadow-inner flex items-center justify-center text-gray-400 ${currentTheme.hoverBg} border border-transparent hover:text-white transition-colors`}
                          >
                            <Icon name="download" className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050810]/40 backdrop-blur-xl font-sans">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsShareModalOpen(false)}></div>
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }} className="relative z-10 w-full max-w-sm p-6 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05]">
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${currentTheme.gradientVia} to-transparent opacity-90 pointer-events-none z-20`} />

              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className={`text-base font-bold text-white flex items-center gap-2`}><Icon name="shareNetwork" className={`w-5 h-5 ${currentTheme.primaryText}`} /> اشتراک‌گذاری</h3>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] rounded-full p-2 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-center text-sm font-light text-gray-300 mb-5 relative z-10">این محتوا را در شبکه‌های اجتماعی به اشتراک بگذارید:</p>

              <div className="flex gap-6 justify-center items-center mb-8 relative z-10">
                {sharePlatforms.map((platform) => (
                  <div key={platform.name} className="relative flex items-center justify-center">
                    <Tooltip text={platform.name}>
                      <a href={platform.getUrl(typeof window !== 'undefined' ? window.location.href : 'https://madar.ir', title)} target="_blank" rel="noopener noreferrer" className={`p-3 text-gray-400 flex items-center justify-center transition-all duration-300 transform hover:scale-125 ${platform.hoverColorClass} cursor-pointer`}>
                        {/* فراخوانی آیکون اختصاصی هر پلتفرم */}
                        <Icon name={platform.icon} className="w-7 h-7 transition-colors" /> 
                      </a>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[11px] font-bold text-gray-400 pl-1">لینک مستقیم صفحه:</label>
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl p-1.5 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
                  <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : 'https://madar.ir'} className="bg-transparent text-gray-300 text-[10px] md:text-[11px] w-full outline-none px-2 py-1 sm:py-0 dir-ltr text-center sm:text-left font-sans" />
                  <button onClick={handleCopyLink} className={`w-full sm:w-auto px-4 py-2 md:py-2.5 rounded-lg text-[11px] md:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-lg border border-transparent ${isCopied ? `${currentTheme.primaryBg} text-white` : 'bg-white/[0.05] border-white/[0.05] text-white hover:bg-white/[0.1] shadow-inner'}`}>
                    {isCopied ? 'کپی شد' : 'کپی لینک'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <div className="md:hidden relative z-20 w-full h-[550px] -mt-[550px] pointer-events-none" />

    </div>
  );
}