'use client';
import { useState, useMemo, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon'; 
import BlurImage from '../components/BlurImage'; // وارد کردن کامپوننت لودینگ تنبل و بلور تصاویر

// === ۱. دیتای نمایشی و محتوای قابل ویرایش در پنل ادمین ===
const pageContent = {
  hero: {
    badge: "بایگانی مرجع مدار",
    title: "کاوش در بایگانی مدار",
    highlightColor: "text-blue-500",
    description: "جستجو و فیلتر در میان هزاران دسته‌بندی، کلیدواژه، و نمایه پدیدآورندگان. مسیر خود را در پایگاه داده پیدا کنید."
  }
};

const MOCK_HASHTAGS = Array.from({length: 40}, (_, i) => ({  
  id: i,  
  text: `کلیدواژه_${i+1}`,  
  count: ((i * 37) % 450) + 10 
})).sort((a,b) => b.count - a.count);

const PREFIXES = ['تاریخ', 'معماری', 'علوم غریبه', 'رسانه', 'سیاست', 'اقتصاد'];
const MOCK_CATEGORIES = Array.from({length: 20}, (_, i) => ({  
  id: i,  
  title: `${PREFIXES[i % PREFIXES.length]} ${i+1}`,  
  count: ((i * 19) % 150) + 1 
}));

const MOCK_CREATORS = Array.from({length: 24}, (_, i) => ({
  id: i,  
  name: `پژوهشگر ${i+1}`,  
  avatar: `/images/creator-${(i % 6) + 1}.jpg` 
}));

// === ۲. کامپوننت پایه اسکلتون با افکت Shimmer ===
const BaseSkeleton = ({ className = "", rounded = "rounded-xl" }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 border border-white/5 backdrop-blur-sm ${rounded} ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState('hashtags');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [catSort, setCatSort] = useState('count'); 
  const [creatorSort, setCreatorSort] = useState('newest'); 

  // === استیت لودینگ برای اسکلتون ===
  const [isLoading, setIsLoading] = useState(true);

  // شبیه‌سازی دریافت داده هنگام تغییر تب یا بارگذاری اولیه
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // نمایش اسکلتون برای ۱ ثانیه
    return () => clearTimeout(timer);
  }, [activeTab]);

  // تغییر تب و پاک کردن کادر جستجو
  const handleTabSwitch = (tab) => {
    if(activeTab === tab) return;
    setActiveTab(tab);
    setSearchQuery('');
  };

  // تعیین Placeholder داینامیک
  const getSearchPlaceholder = () => {
    if (activeTab === 'hashtags') return "جستجو در هشتگ‌ها...";
    if (activeTab === 'categories') return "جستجو در دسته‌بندی‌ها...";
    return "جستجوی نام پدیدآورنده...";
  };

  // === فیلتر و مرتب‌سازی داده‌ها ===
  const filteredHashtags = useMemo(() => {
    return MOCK_HASHTAGS.filter(h => h.text.includes(searchQuery));
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    let result = MOCK_CATEGORIES.filter(c => c.title.includes(searchQuery));
    if (catSort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
    } else {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [searchQuery, catSort]);

  const filteredCreators = useMemo(() => {
    let result = MOCK_CREATORS.filter(c => c.name.includes(searchQuery));
    if (creatorSort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
    } else {
      result.sort((a, b) => b.id - a.id);  
    }
    return result;
  }, [searchQuery, creatorSort]);

  const maxHashtagCount = Math.max(...filteredHashtags.map(h => h.count), 1);
  const minHashtagCount = Math.min(...filteredHashtags.map(h => h.count), 0);

  return (
    <div className="relative min-h-screen flex flex-col">
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 w-full relative z-10 pt-0">
        <Breadcrumbs 
          items={[
            { label: 'مدار', href: '/' },
            { label: 'دسته‌بندی‌ها' }
          ]} 
        />

        {/* هدر صفحه (متصل به آبجکت مدیریت پلتفرم) */}
        <section className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center items-center text-center border-t-2 border-t-blue-500 animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-bold text-blue-500 tracking-widest">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
              </span>
              {pageContent.hero.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg pb-2">
               <span className={pageContent.hero.highlightColor}>{pageContent.hero.title}</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed text-justify">
              {pageContent.hero.description}
            </p>
          </div>
        </section>

        {/* نوار تب‌ها و جستجو */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-6 justify-between items-center relative z-20">
          <div className="flex bg-black/40 p-1 rounded-full border border-white/5 overflow-x-auto w-full md:w-auto hide-scroll">
            <button 
              onClick={() => handleTabSwitch('hashtags')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'hashtags' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon name="hash" className="w-4 h-4 text-neon-purple" /> هشتگ‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('categories')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'categories' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon name="folder" className="w-4 h-4 text-neon-amber" /> دسته‌بندی‌ها
            </button>
            <button 
              onClick={() => handleTabSwitch('creators')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === 'creators' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon name="users" className="w-4 h-4 text-emerald-500" /> پدیدآورندگان
            </button>
          </div>

          <div className="relative w-full md:w-96 flex-shrink-0">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-12 text-sm outline-none focus:border-neon-cyan/50 focus:bg-white/5 transition-all text-white placeholder-gray-500 shadow-inner"
            />
            <Icon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* پنل ۱: هشتگ‌ها */}
        {activeTab === 'hashtags' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="glass-card p-8 border-t-2 border-t-transparent hover:border-t-neon-purple transition-colors duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/5 pb-4 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icon name="trendUp" className="w-6 h-6 text-neon-purple" /> ابر کلیدواژه‌ها
                </h2>
                {!isLoading && (
                  <span className="text-xs text-gray-400 font-sans bg-black/50 border border-white/5 px-4 py-2 rounded-full">
                    <span className="text-neon-purple font-bold">{filteredHashtags.length}</span> هشتگ یافت شد
                  </span>
                )}
              </div>
              
              {isLoading ? (
                /* اسکلتون هشتگ‌ها با افکت Shimmer */
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-5 p-6">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <BaseSkeleton key={i} className={`h-8 ${['w-20', 'w-24', 'w-32', 'w-16', 'w-28'][i % 5]}`} rounded="rounded-full" />
                  ))}
                </div>
              ) : filteredHashtags.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">موردی یافت نشد.</p>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-x-7 gap-y-5 p-6">
                  {filteredHashtags.map(hashtag => {
                    const ratio = (hashtag.count - minHashtagCount) / (maxHashtagCount - minHashtagCount || 1);
                    const fontSize = 14 + (ratio * 24); 
                    const fontWeight = ratio > 0.6 ? '800' : '400';
                    const color = ratio > 0.8 ? '#d8b4fe' : '#e5e5e5';
                    const opacity = 0.5 + (ratio * 0.5);

                    return (
                      <a 
                        key={hashtag.id} 
                        href={`/tag/${hashtag.text}`} 
                        style={{ fontSize: `${fontSize}px`, fontWeight, color, opacity }}
                        className="inline-flex items-center no-underline cursor-pointer leading-tight transition-all duration-300 hover:text-white hover:opacity-100 hover:scale-110 hover:-translate-y-1 hover:drop-shadow-[0_0_15px_#a855f7]"
                      >
                        <Icon name="hash" className="w-[0.8em] h-[0.8em] opacity-50 mr-1" />
                        {hashtag.text}
                        <span className="text-[0.4em] opacity-60 bg-white/10 px-1.5 py-0.5 rounded-md align-top ml-1 font-sans">{hashtag.count}</span>
                      </a>
                    );
                  })}
                </div>
              )}
              
              {!isLoading && (
                <div className="text-center mt-12">
                  <button className="bg-white/5 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/50 text-white hover:text-neon-purple px-8 py-3 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] cursor-pointer">
                    نمایش هشتگ‌های بیشتر
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* پنل ۲: دسته‌بندی‌ها */}
        {activeTab === 'categories' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="folder" className="w-6 h-6 text-neon-amber" /> فهرست دسته‌بندی‌ها
              </h2>
              
              <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setCatSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${catSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCatSort('count')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${catSort === 'count' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >بیشترین محتوا</button>
              </div>
            </div>
            
            {isLoading ? (
              /* اسکلتون دسته‌بندی‌ها با افکت Shimmer */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 flex flex-col justify-between h-32 relative overflow-hidden">
                    <BaseSkeleton className="h-5 w-1/2" rounded="rounded-md" />
                    <div className="flex justify-between items-end mt-4">
                      <BaseSkeleton className="w-6 h-6" rounded="rounded-md" />
                      <BaseSkeleton className="h-5 w-16" rounded="rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
               <p className="text-gray-500 text-sm text-center py-10">موردی یافت نشد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map(cat => (
                  <a key={cat.id} href={`/tag/${cat.title}`} className="glass-card p-5 flex flex-col justify-between h-32 group border-t-2 border-t-transparent hover:border-t-neon-amber hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] cursor-pointer relative overflow-hidden transition-all duration-400">
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-neon-amber/5 rounded-full blur-2xl group-hover:bg-neon-amber/10 transition-colors z-0"></div>
                    <div className="relative z-10">
                      <h3 className="text-base font-bold text-white group-hover:text-neon-amber transition-colors truncate">{cat.title}</h3>
                    </div>
                    <div className="relative z-10 flex justify-between items-end mt-4">
                      <Icon name="folder" className="w-6 h-6 text-gray-500 group-hover:text-neon-amber transition-colors" />
                      <span className="text-xs text-gray-400 font-sans bg-white/5 border border-white/10 px-2 py-1 rounded-md">{cat.count} محتوا</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {!isLoading && (
              <div className="text-center mt-12">
                <button className="bg-white/5 hover:bg-neon-amber/20 border border-white/10 hover:border-neon-amber/50 text-white hover:text-neon-amber px-8 py-3 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer">
                  نمایش دسته‌بندی‌های بیشتر
                </button>
              </div>
            )}
          </div>
        )}

        {/* پنل ۳: پدیدآورندگان */}
        {activeTab === 'creators' && (
          <div className="animate-[slideUpFade_0.4s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="users" className="w-6 h-6 text-emerald-500" /> نمایه پدیدآورندگان
              </h2>
              
              <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setCreatorSort('alpha')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${creatorSort === 'alpha' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >حروف الفبا</button>
                <button 
                  onClick={() => setCreatorSort('newest')} 
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer ${creatorSort === 'newest' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >تازه‌ترین‌ها</button>
              </div>
            </div>
            
            {isLoading ? (
              /* اسکلتون پدیدآورندگان با افکت Shimmer */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 flex flex-col items-center text-center gap-3 h-[132px] relative overflow-hidden justify-center">
                    <BaseSkeleton className="w-16 h-16 shadow-lg" rounded="rounded-full" />
                    <BaseSkeleton className="h-4 w-3/4 mt-2" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredCreators.length === 0 ? (
               <p className="text-gray-500 text-sm text-center py-10">موردی یافت نشد.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredCreators.map(creator => (
                  <a key={creator.id} href={`/creator/${creator.id}`} className="glass-card p-5 flex flex-col items-center text-center gap-3 group border-t-2 border-t-transparent hover:border-t-emerald-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] cursor-pointer relative overflow-hidden transition-all duration-400">
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors z-0"></div>
                    <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-emerald-500 transition-colors shadow-lg flex items-center justify-center bg-gray-900">
                      <BlurImage src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 mt-2 w-full">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors line-clamp-1 w-full">{creator.name}</h3>
                    </div>
                  </a>
                ))}
              </div>
            )}
            
            {!isLoading && (
              <div className="text-center mt-12">
                <button className="bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-white hover:text-emerald-500 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,185,129,0.1)] cursor-pointer">
                  نمایش پدیدآورندگان بیشتر
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}