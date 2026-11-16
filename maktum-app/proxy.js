import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MAKTUM_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

export async function proxy(request) {
  const url = request.nextUrl;

  // ۱. محافظت لایه اول از مسیرهای مسئولیت اختصاصی (درگاه مسئول)
  if (url.pathname.startsWith('/portal-entry-99')) {
    const token = request.cookies.get('maktum_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      const payload = verified.payload;

      if (!payload.isAdmin && !payload.isSuperAdmin) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }

      // اضافه کردن هدر مخفی‌ساز از موتورهای جستجو بدون لو دادن آدرس در robots.txt
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return response;

    } catch (err) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('maktum_session');
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
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    } catch (err) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('maktum_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};