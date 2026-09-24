import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes, but allow /admin/login to load freely
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSecret =
      process.env.ADMIN_SECRET_KEY || 'voltix-secret-admin-token-super-secure-key';
    const sessionCookie = req.cookies.get('voltix_admin_session')?.value;

    if (!sessionCookie || sessionCookie !== adminSecret) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
