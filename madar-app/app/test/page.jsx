import Breadcrumbs from '../components/Breadcrumbs';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import { getSetting } from '@/app/actions/settings';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function RulesPage() {
  const storedData = await getSetting('rules_page_data');

  if (!storedData) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 font-sans">اطلاعاتی یافت نشد. لطفاً در پنل تنظیمات قوانین، اطلاعات را ذخیره کنید.</p>
      </main>
    );
  }

  let pageData = {};
  try {
    pageData = JSON.parse(storedData);
  } catch (e) {
    return <div className="text-white text-center py-20">خطا در پردازش اطلاعات دیتابیس</div>;
  }

  const hero = pageData.hero || {};
  const rules = pageData.rules || [];

  return (
    <div className="relative min-h-screen flex flex-col scroll-smooth">
      <ProgressBar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16 w-full relative z-10 pt-18 md:pt-25">
        <Breadcrumbs items={[{ label: 'مدار', href: '/' }, { label: 'قوانین و مقررات' }]} />

        {/* ۱. هدر صفحه قوانین */}
        {hero.enabled !== false && (
          <section className="glass-card transform-gpu relative overflow-hidden p-8 md:p-12 text-center border-t-2 border-t-[#06b6d4] rounded-3xl shadow-2xl">
            <div className="absolute left-1/2 top-0 w-1/2 h-full bg-[#06b6d4]/5 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Icon name="shieldCheck" className="w-8 h-8" />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-4 py-2 leading-relaxed drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-l from-[#06b6d4] to-[#a855f7]">
                {hero.title}
              </h1>
              
              <div className="text-gray-300 text-sm md:text-base leading-loose font-light text-center space-y-4">
                {hero.paragraphs?.map((p, idx) => <p key={idx}>{p}</p>)}
              </div>
            </div>

            {hero.showUpdateDate !== false && hero.updateDate && (
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm z-20">
                <Icon name="calendar" className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-[11px] md:text-xs text-gray-400 font-light">آخرین به‌روزرسانی:</span>
                <span className="text-xs md:text-sm text-white font-bold tracking-widest dir-ltr">{hero.updateDate}</span>
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* سایدبار: فهرست مندرجات */}
          <aside className="lg:col-span-3 sticky top-32 glass-card p-6 hidden lg:block shadow-xl rounded-2xl">
            <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-sm">
              <Icon name="listBullets" className="text-[#06b6d4] w-5 h-5" /> فهرست مندرجات
            </h2>
            <ul className="space-y-3 text-sm">
              {rules.filter(r => r.enabled !== false).map((rule) => (
                <li key={`toc-${rule.id}`}>
                  <a href={`#${rule.id}`} className="text-gray-400 hover:text-[#06b6d4] transition-colors flex items-center gap-2 py-1">
                    <Icon name="arrowLeft" className="w-3 h-3 text-[#06b6d4]" /> 
                    <span>{rule.number} {rule.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* محتوای اصلی: بندهای قانونی (رندر امن محتوای ادیتور) */}
          <div className="lg:col-span-9 space-y-6">
            {rules.filter(r => r.enabled !== false).map((rule) => (
              <section 
                key={rule.id} 
                id={rule.id} 
                className="glass-card p-6 md:p-8 scroll-mt-32 border-t-2 border-t-transparent hover:border-t-[#06b6d4]/40 transition-all duration-300 rounded-3xl"
              >
                <h3 className="text-white text-xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-2 mt-2">
                  <span className="text-[#06b6d4] font-sans">{rule.number}</span> {rule.title}
                </h3>
                
                <div 
                  className={cn(
                    "rich-text-content text-gray-300 leading-[2] font-light text-justify",
                    "[&>p]:mb-4 [&>ul]:list-disc [&>ul]:pr-6 [&>ul>li]:mb-2 [&>ol]:list-decimal [&>ol]:pr-6 [&>strong]:text-white"
                  )}
                  dangerouslySetInnerHTML={{ __html: rule.content || '' }} 
                />
              </section>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}