import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/|_static/|_vercel|favicon\\.ico|[\\w-]+\\.\\w+).*)',
  ],
};

export default function proxy(req: NextRequest) {
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
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/admin') ||
    path.startsWith('/superadmin') ||
    path.startsWith('/auth-success') ||
    path.startsWith('/reports/render/') || 
    path.startsWith('/report/')
  ) {
    return NextResponse.next();
  }

  // Redirect old /c/ paths to /client/
  if (path.startsWith('/c/')) {
    url.pathname = path.replace(/^\/c\//, '/client/');
    return NextResponse.redirect(url);
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
    path.startsWith('/client/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/report/'); // public share report links

  // Root domain — serve as-is
  const isRootDomain =
    normalizedHostname === 'localhost:3000' ||
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1:3000' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === rootDomain ||
    normalizedHostname === 'rankflow.app';

  if (isRootDomain) {
    // Unauthenticated users trying to access protected pages → login
    if (!isAuthenticated && !isPublicPath) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Redirect root URL to /login
    if (path === '/') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Client portal paths: /client/... → rewrite to /localhost/client/...
    if (path.startsWith('/client/')) {
      return NextResponse.rewrite(new URL(`/localhost${path}`, req.url));
    }

    // For authenticated users on root domain, path-based agency routing:
    // e.g. localhost:3000/demo/clients → app/[domain]/(dashboard)/clients/page.tsx
    // Only rewrite if the first segment looks like a tenant slug (not reserved paths)
    const firstSegment = path.split('/')[1];
    const reservedPaths = ['login', 'register', 'forgot-password', 'admin', 'settings'];
    if (firstSegment && !reservedPaths.includes(firstSegment)) {
      // Already includes domain segment (e.g. /localhost/...) — pass through
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // Subdomain routing
  const subdomain = normalizedHostname
    .replace(`.${rootDomain}`, '')
    .split('.')[0];

  if (!isAuthenticated && !isPublicPath) {
    url.pathname = '/client/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
}
