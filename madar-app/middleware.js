import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// کلید مخفی که در auth.js هم استفاده کردیم (باید دقیقاً همان باشد)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MADAR_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

export async function middleware(request) {
  const url = request.nextUrl;

  // ۱. محافظت لایه اول از مسیرهای مدیریت (پنل ادمین)
  if (url.pathname.startsWith('/portal-entry-99')) {
    const token = request.cookies.get('madar_session')?.value;

    // اگر کوکی وجود نداشت، پرتاب به صفحه اصلی
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // رمزگشایی و اعتبارسنجی توکن در لبه سرور (Edge)
      const verified = await jwtVerify(token, SECRET_KEY);
      const payload = verified.payload;

      // بررسی اینکه آیا کاربر مدیر است یا خیر
      if (!payload.isAdmin && !payload.isSuperAdmin) {
        // کاربر عادی است و حق ورود به پنل را ندارد. پرتاب به صفحه اصلی.
        return NextResponse.redirect(new URL('/', request.url));
      }

      // اگر کاربر ادمین بود، اجازه عبور می‌دهیم. 
      // لایه دوم (درون خود صفحات و اکشن‌ها) دسترسی‌های دانه‌ریز را کنترل خواهد کرد.

    } catch (err) {
      // توکن نامعتبر، دستکاری شده یا منقضی شده است
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('madar_session'); // پاک کردن توکن مخرب
      return response;
    }
  }

  // ۲. محافظت از داشبورد کاربری عادی (اختیاری - اگر مسیر داشبورد کاربران profile است)
  if (url.pathname.startsWith('/profile') || url.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('madar_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      await jwtVerify(token, SECRET_KEY);
    } catch (err) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('madar_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // این میدلور روی تمامی مسیرها اجرا می‌شود به جز فایل‌های استاتیک و APIها
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};