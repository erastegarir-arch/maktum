import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  
  // ۱. حفاظت از مسیر داشبورد
  if (url.pathname.startsWith('/dashboard')) {
    // اینجا توکن کاربر را از کوکی می‌خوانیم (مثلا با NextAuth)
    const token = request.cookies.get('admin_session');
    
    if (!token) {
      // اگر ادمین نبود، پرتش کن به صفحه ورود
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // ۲. سیستم حالت تعمیر و نگهداری (Maintenance Mode)
  // اگر در پنل دکمه تعمیر روشن شد، این متغیر محیطی یا دیتابیس خوانده می‌شود
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  if (isMaintenance && !url.pathname.startsWith('/dashboard') && !url.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};