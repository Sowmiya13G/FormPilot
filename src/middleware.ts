import { NextResponse, type NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Direct root access to /dashboard (auth deferred for now)
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
