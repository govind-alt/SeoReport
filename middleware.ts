import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/|_static/|_vercel|favicon\\.ico|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  const normalizedHostname = hostname.replace(
    `.localhost:3000`,
    `.${rootDomain}`,
  );

  const path = `${url.pathname}${
    url.searchParams.toString().length > 0 ? `?${url.searchParams.toString()}` : ''
  }`;

  // Always pass API routes, render pages and public share links through without rewriting
  if (path.startsWith('/api/') || path.startsWith('/reports/render/') || path.startsWith('/r/')) {
    return NextResponse.next();
  }

  // Auth cookie check
  const sessionCookie =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token');

  const isAuthenticated = Boolean(sessionCookie);

  // Public paths (no auth needed)
  const isPublicPath =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/c/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/r/'); // public share report links

  // Root domain — serve as-is
  const isRootDomain =
    normalizedHostname === 'localhost:3000' ||
    normalizedHostname === rootDomain ||
    normalizedHostname === 'rankflow.app';

  if (isRootDomain) {
    if (!isAuthenticated && !isPublicPath) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Subdomain routing
  const subdomain = normalizedHostname
    .replace(`.${rootDomain}`, '')
    .split('.')[0];

  if (!isAuthenticated && !isPublicPath) {
    url.pathname = '/c/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
}
