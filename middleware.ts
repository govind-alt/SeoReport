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

  // Always pass API routes, auth callbacks, render pages and public share links through without rewriting
  if (
    path.startsWith('/api/') || 
    path.startsWith('/api/auth/') ||
    path.includes('/api/auth') ||
    path.startsWith('/reports/render/') || 
    path.startsWith('/r/')
  ) {
    return NextResponse.next();
  }

  // Auth cookie check
  const sessionCookie =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token') ||
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token');

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
    // Unauthenticated users trying to access protected pages → login
    if (!isAuthenticated && !isPublicPath) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // For authenticated users on root domain, allow path-based agency routing:
    // e.g. localhost:3000/demo/clients → app/[domain]/(dashboard)/clients/page.tsx
    // Next.js will route /demo/... to [domain]/(dashboard)/... naturally.
    // Only the bare '/' shows the marketing page.
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
