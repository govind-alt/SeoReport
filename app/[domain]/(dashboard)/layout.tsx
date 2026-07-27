import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAgencyBranding, buildBrandingCssVars } from '@/lib/branding';
import { exitImpersonationAction } from '@/app/actions';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  const basePath = domain === 'localhost' ? '/localhost' : '';

  const session = await auth();

  // 1. Session check: user must be logged in
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Role boundary check: client portal users cannot view the agency dashboard
  if (session.user.role === 'client') {
    redirect(`${basePath}/c/dashboard`);
  }

  // 3. Resolve target tenant agency matching the domain slug
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });

  if (!agency) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const impersonatingSlug = cookieStore.get('impersonating_agency_slug')?.value;
  const isSuperadmin = session.user.role?.toLowerCase() === 'superadmin';
  const isImpersonating = isSuperadmin || Boolean(impersonatingSlug);

  // 4. Check if agency is suspended
  if (agency.plan === 'suspended' && !isSuperadmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#1E293B', border: '1px solid #EF4444', borderRadius: '16px', padding: '40px', maxWidth: '480px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', marginBottom: '12px' }}>Agency Account Suspended</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            The account for <strong>{agency.name}</strong> has been suspended by system administration. Please contact support to reactivate your subscription.
          </p>
          <a href="mailto:support@rankflow.app" style={{ display: 'inline-block', background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            Contact Platform Support
          </a>
        </div>
      </div>
    );
  }

  // 5. Multi-tenant isolation: block cross-agency access for non-superadmins
  if (!isSuperadmin && session.user.agencyId !== agency.id) {
    const userAgency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId ?? '' }
    });
    if (userAgency) {
      redirect(`/${userAgency.slug}`);
    } else {
      redirect('/login');
    }
  }

  // 6. Load agency branding and build CSS vars for white-labeling
  const branding = await getAgencyBranding(domain);
  const brandingCss = buildBrandingCssVars(branding);

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Superadmin Impersonation Banner */}
      {isImpersonating && (
        <div style={{
          background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
          color: 'white',
          padding: '8px 24px',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎭</span>
            <span><strong>SUPERADMIN IMPERSONATION MODE:</strong> Viewing {agency.name} ({agency.slug})</span>
          </div>
          <form action={exitImpersonationAction}>
            <button
              type="submit"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Exit Impersonation Mode &rarr;
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
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
    </div>
  );
}
