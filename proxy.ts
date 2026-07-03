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
  const hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`);

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // If localhost, or if it's the root domain, don't rewrite to subdomain
  if (
    hostname === 'localhost:3000' ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    hostname === 'rankflow.app'
  ) {
    return NextResponse.next();
  }

  // Rewrite to dynamic route for subdomain
  const subdomain = hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`, '');
  const domain = hostname.split('.')[0]; // Quick fallback for localhost testing

  return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
}
