import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST-SIGNIN REDIRECT HANDLER
 *
 * This route is used as the callbackUrl for Google OAuth and other
 * providers. After a successful sign-in, it reads the user's agency
 * slug from the database and redirects them to the correct dashboard.
 *
 * Localhost dev:  → http://localhost:3000/{slug}
 * Production:     → https://{slug}.rankflow.app  (or / if already on subdomain)
 */
export async function GET(request: Request) {
  const session = await auth();
  const { origin, hostname } = new URL(request.url);

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // Superadmin → go to superadmin panel
  if (session.user.role === 'superadmin') {
    return NextResponse.redirect(new URL('/superadmin', origin));
  }

  // Client role → go to client portal
  if (session.user.role === 'client') {
    return NextResponse.redirect(new URL('/c/dashboard', origin));
  }

  // Agency admin: find their agency slug
  if (session.user.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId },
      select: { slug: true }
    });

    if (agency?.slug) {
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      if (isLocalhost) {
        // On localhost, the middleware doesn't do subdomain routing
        // so we navigate to /{slug}
        return NextResponse.redirect(new URL(`/${agency.slug}`, origin));
      } else {
        // On production the user is on their subdomain already; go to root
        return NextResponse.redirect(new URL('/', origin));
      }
    }
  }

  // Fallback for new users without agencyId: link to first available agency
  const defaultAgency = await prisma.agency.findFirst({ select: { id: true, slug: true } });
  if (defaultAgency) {
    if (session.user.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { agencyId: defaultAgency.id, role: 'admin' }
      }).catch(() => {});
    }
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    return NextResponse.redirect(new URL(isLocalhost ? `/${defaultAgency.slug}` : '/', origin));
  }

  return NextResponse.redirect(new URL('/login', origin));
}

