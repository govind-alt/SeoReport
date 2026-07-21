import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'localhost:3000';

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // If localhost, or if it's the root domain, don't rewrite to subdomain
  if (
    hostname === 'localhost:3000' ||
    hostname === rootDomain ||
    hostname === 'rankflow.app' ||
    hostname === 'www.rankflow.app'
  ) {
    return NextResponse.next();
  }

  // Resolve subdomain vs custom domain
  let domain = hostname;
  if (hostname.endsWith(`.${rootDomain}`)) {
    domain = hostname.replace(`.${rootDomain}`, '');
  } else if (hostname.endsWith('.rankflow.app')) {
    domain = hostname.replace('.rankflow.app', '');
  }

  return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
}
