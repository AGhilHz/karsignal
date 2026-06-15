import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/notifications',
  '/reviews/new',
  '/salaries/new',
  '/layoffs/new',
];

// Routes only for guests (redirect if logged in)
const GUEST_ONLY_ROUTES = [
  '/auth/login',
  '/auth/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for access token in cookies (set by client after login)
  const rawToken = request.cookies.get('access_token')?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isGuestOnly = GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
