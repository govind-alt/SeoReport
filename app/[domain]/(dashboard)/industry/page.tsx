import { getIndustryData } from '@/app/actions';
import Link from 'next/link';
import ExportButton from './ExportButton';

export default async function IndustryPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;
  
  const industries = await getIndustryData(domain);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-title">Industry Benchmarks</div>
          <div className="page-subtitle">Aggregate SEO performance metrics grouped by client industry.</div>
        </div>
        <ExportButton data={industries} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {industries.map((ind: any, i: number) => (
          <div key={i} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: `hsl(${i * 45}, 70%, 50%)` }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{ind.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ind.clientCount} active {ind.clientCount === 1 ? 'client' : 'clients'}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `hsla(${i * 45}, 70%, 50%, 0.1)`, color: `hsl(${i * 45}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                🏭
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Avg Health</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: ind.averageHealth >= 80 ? 'var(--success)' : ind.averageHealth >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                  {ind.averageHealth}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Traffic</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                  {ind.totalTraffic > 1000 ? `${(ind.totalTraffic / 1000).toFixed(1)}k` : ind.totalTraffic}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <Link href={`${basePath}/clients?industry=${encodeURIComponent(ind.name)}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                View all clients in {ind.name} →
              </Link>
            </div>
          </div>
        ))}

        {industries.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏭</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>No Industries Found</div>
            <p style={{ marginTop: '8px' }}>Set the &quot;Industry&quot; field on your clients to see aggregate benchmarks here.</p>
          </div>
        )}
      </div>
    </>
  );
}
