import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAdminRoute =
    nextUrl.pathname === '/' ||
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/registration-templates') ||
    nextUrl.pathname.startsWith('/components') ||
    nextUrl.pathname.startsWith('/send-email') ||
    nextUrl.pathname.startsWith('/users') ||
    nextUrl.pathname.startsWith('/settings') ||
    nextUrl.pathname.startsWith('/registrations');

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    if (nextUrl.pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

