import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// کلید مخفی که در auth.js هم استفاده کردیم (باید دقیقاً همان باشد)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MAKTUM_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

export async function proxy(request) {
  const url = request.nextUrl;

  // ۱. محافظت لایه اول از مسیرهای مسئولیت اختصاصی (درگاه مسئول)
  if (url.pathname.startsWith('/portal-entry-99')) {
    const token = request.cookies.get('maktum_session')?.value;

    // اگر کوکی وجود نداشت، پرتاب به صفحه اصلی
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // گذرواژه‌گشایی و اعتبارسنجی توکن در لبه سرور (Edge)
      const verified = await jwtVerify(token, SECRET_KEY);
      const payload = verified.payload;

      // بررسی اینکه آیا کاربر مسئول است یا خیر
      if (!payload.isAdmin && !payload.isSuperAdmin) {
        // کاربر عادی است و حق ورود به درگاه را ندارد. پرتاب به صفحه خطای ۴۰۳ (عدم دسترسی)
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      // اگر کاربر مسئول بود، اجازه عبور می‌دهیم. 

    } catch (err) {
      // توکن نامعتبر، دستکاری شده یا منقضی شده است
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('maktum_session'); // پاک کردن توکن مخرب
      return response;
    }
  }

  // ۲. محافظت از میزکار کاربری عادی
  if (url.pathname.startsWith('/profile') || url.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('maktum_session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    try {
      await jwtVerify(token, SECRET_KEY);
    } catch (err) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('maktum_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // این میدلور روی تمامی مسیرها اجرا می‌شود به جز پرونده‌های ایستا و APIها
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};