/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'], // تنظیم وزیر متن به عنوان فونت اصلی
      },
      colors: {
        deep: {
          base: '#030712',
          surface: '#111827',
          glass: 'rgba(17, 24, 39, 0.4)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        neon: {
          cyan: '#06b6d4',
          magenta: '#d946ef',
          amber: '#f59e0b',
          blue: '#3b82f6',
          green: '#10b981'
        }
      },
      boxShadow: {
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        'neon-glow': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite', // اضافه شده برای لودینگ اسکلتی
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: { // اضافه شده برای افکت موج‌دار متحرک
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}