import { getAgencyBranding, buildBrandingCssVars } from '@/lib/branding';

export default async function ClientPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain || 'localhost';

  const branding = await getAgencyBranding(domain);
  const brandingCss = buildBrandingCssVars(branding);
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style dangerouslySetInnerHTML={{ __html: brandingCss }} />
      {children}
    </div>
  );
}
