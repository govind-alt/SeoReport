import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getAgencyBranding, buildBrandingCssVars } from '@/lib/branding';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const session = await auth();

  // 1. Session check: user must be logged in
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Role boundary check: client portal users cannot view the agency dashboard
  if (session.user.role === 'client') {
    redirect(`/${domain}/c/dashboard`);
  }

  // 3. Resolve target tenant agency matching the domain slug
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });

  if (!agency) {
    redirect('/login');
  }

  // 4. Multi-tenant isolation: block cross-agency access for administrators
  if (session.user.role !== 'superadmin' && session.user.agencyId !== agency.id) {
    const userAgency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId ?? '' }
    });
    if (userAgency) {
      redirect(`/${userAgency.slug}`);
    } else {
      redirect('/login');
    }
  }

  // 5. Load agency branding and build CSS vars for white-labeling
  const branding = await getAgencyBranding(domain);
  const brandingCss = buildBrandingCssVars(branding);

  return (
    <div className="app-layout">
      {/* Inject per-agency brand CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: brandingCss }} />
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

