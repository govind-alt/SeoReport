'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { getClientDetails, syncClientData } from '@/app/actions';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Eye, Download, CheckCircle, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';

const trendData = [
  { name: 'Jan', count: 32 }, { name: 'Feb', count: 35 },
  { name: 'Mar', count: 41 }, { name: 'Apr', count: 42 },
  { name: 'May', count: 43 }, { name: 'Jun', count: 47 },
];

const trafficData = [
  { name: 'Jan', count: 6200 }, { name: 'Feb', count: 6800 },
  { name: 'Mar', count: 7100 }, { name: 'Apr', count: 7400 },
  { name: 'May', count: 7900 }, { name: 'Jun', count: 8420 },
];

const backlinkTrend = [
  { name: 'Jan', new: 38, lost: 12 }, { name: 'Feb', new: 42, lost: 8 },
  { name: 'Mar', new: 51, lost: 15 }, { name: 'Apr', new: 37, lost: 9 },
  { name: 'May', new: 63, lost: 11 }, { name: 'Jun', new: 47, lost: 7 },
];

const mockKeywords = [
  { id: 1, keyword: 'seo agency london', position: 4, change: 3, volume: 1600, difficulty: 68, url: '/seo-services', features: ['Featured'] },
  { id: 2, keyword: 'local seo london', position: 2, change: 8, volume: 880, difficulty: 54, url: '/local-seo', features: ['Local Pack'] },
  { id: 3, keyword: 'digital marketing uk', position: 7, change: -1, volume: 2400, difficulty: 72, url: '/digital-mktg', features: [] },
  { id: 4, keyword: 'seo company london', position: 9, change: 5, volume: 1200, difficulty: 71, url: '/seo-services', features: [] },
  { id: 5, keyword: 'seo audit tool uk', position: 28, change: 0, volume: 390, difficulty: 58, url: '/audit', features: [] },
];

const mockAuditIssues = [
  { issue: 'Broken internal links', severity: 'critical', count: 3, pages: '/blog/post-14, /resources/guide-3' },
  { issue: 'Missing meta descriptions', severity: 'warning', count: 14, pages: '14 pages' },
  { issue: 'Slow page load (>3s)', severity: 'warning', count: 4, pages: '/shop, /pricing' },
  { issue: 'Duplicate title tags', severity: 'notice', count: 7, pages: '7 pages' },
];

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string, domain: string }> }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const resolvedParams = use(params);
  const clientId = resolvedParams.clientId;
  const domain = resolvedParams.domain || 'localhost';

  let basePath = '';
  if (domain !== 'localhost') {
    basePath = '';
  } else {
    basePath = `/${domain}`;
  }

  useEffect(() => {
    setLoading(true);
    getClientDetails(clientId).then(data => {
      setClient(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      // Rich demo fallback
      const demoClient = {
        id: clientId,
        name: clientId.includes('techstart') ? 'TechStart.io' : clientId.includes('greenleaf') ? 'GreenLeaf Organics' : clientId.includes('bluesky') ? 'BlueSky Marketing' : 'Acme Corp',
        domain: clientId.includes('techstart') ? 'techstart.io' : clientId.includes('greenleaf') ? 'greenleaf.com' : clientId.includes('bluesky') ? 'bluesky.co.uk' : 'acmecorp.com',
        gscConnected: true,
        snapshots: {
          analytics: [{ sessions: 8420 }],
          keywords: [{ top10: 47 }],
          backlinks: { domainTrust: 42 },
          audit: { healthScore: 76 }
        },
        reports: [
          { id: '1', periodStart: new Date().toISOString(), status: 'done', viewCount: 2, shareSlug: 'share-1' }
        ]
      };
      setClient(demoClient);
      setLoading(false);
    });
  }, [clientId]);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading('Syncing data...', { id: 'sync' });
    try {
      await syncClientData(clientId, client?.domain ?? '');
      toast.success('Sync complete', { id: 'sync' });
      const updatedData = await getClientDetails(clientId);
      if (updatedData) setClient(updatedData);
    } catch (e: any) {
      toast.error(e.message || 'Sync failed', { id: 'sync' });
    }
    setIsSyncing(false);
  };

  if (loading) return <div style={{padding: '40px'}}>Loading client analysis...</div>;
  if (!client) return (
    <div style={{padding: '40px', textAlign: 'center'}}>
      <h2>Client not found</h2>
      <Link href={`${basePath}/clients`} className="btn btn-primary">Back to Clients</Link>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{client.name}</div>
          <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            {client.domain} <ExternalLink size={12} />
          </a>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw size={12} className={isSyncing ? 'spinner' : ''} /> Sync
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = `/reports`}>+ Report</button>
        </div>
      </div>

      {/* TABS */}
      <div className="custom-tabs">
        {['overview', 'keywords', 'backlinks', 'audit', 'analytics', 'reports'].map(tab => (
          <div 
            key={tab} 
            className={`ctab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-panel active">
          <div className="kpi-grid kpi-grid-4" style={{ gap: '14px', marginBottom: '20px' }}>
            <div className="kpi-card success">
              <div className="kpi-label">Sessions</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>8.4K</div>
              <div className="kpi-trend trend-up"><ArrowUpRight size={12} /> +16.3%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Top 10 Keywords</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>47</div>
              <div className="kpi-trend trend-up"><ArrowUpRight size={12} /> +4</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Domain Trust</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>42</div>
              <div className="kpi-trend trend-up"><ArrowUpRight size={12} /> +2</div>
            </div>
            <div className="kpi-card success">
              <div className="kpi-label">Site Health</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>76%</div>
              <div className="kpi-trend trend-up"><ArrowUpRight size={12} /> +8%</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Keyword Position Trend</div>
                  <div className="chart-subtitle">Top 10 count — 6 months</div>
                </div>
              </div>
              <div style={{ height: '180px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Organic Traffic Trend</div>
                  <div className="chart-subtitle">Sessions — 6 months</div>
                </div>
              </div>
              <div style={{ height: '180px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KEYWORDS */}
      {activeTab === 'keywords' && (
        <div className="tab-panel active">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Position</th>
                  <th>Change</th>
                  <th>Volume</th>
                  <th>Difficulty</th>
                  <th>Landing Page</th>
                </tr>
              </thead>
              <tbody>
                {mockKeywords.map(kw => (
                  <tr key={kw.id}>
                    <td style={{ fontWeight: 600 }}>{kw.keyword}</td>
                    <td>{kw.position}</td>
                    <td>
                      <span className={`badge ${kw.change > 0 ? 'badge-success' : kw.change < 0 ? 'badge-danger' : 'badge-neutral'}`}>
                        {kw.change > 0 ? `+${kw.change}` : kw.change}
                      </span>
                    </td>
                    <td>{kw.volume}</td>
                    <td>{kw.difficulty}%</td>
                    <td><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kw.url}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BACKLINKS */}
      {activeTab === 'backlinks' && (
        <div className="tab-panel active">
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">New vs Lost Backlinks</div></div>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={backlinkTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="new" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lost" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, marginBottom: '14px' }}>Backlink Profile Strength</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '13px' }}>
                  <span>Domain Trust score:</span> <span style={{ fontWeight: 'bold' }}>42/100</span>
                </div>
                <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '13px' }}>
                  <span>Total backlinks:</span> <span style={{ fontWeight: 'bold' }}>1,284</span>
                </div>
                <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '13px' }}>
                  <span>Dofollow links:</span> <span style={{ fontWeight: 'bold', color: '#10B981' }}>86%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT */}
      {activeTab === 'audit' && (
        <div className="tab-panel active">
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>Health Score: 76%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Crawl date: Today at 02:14 AM</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockAuditIssues.map((issue, idx) => (
                <div key={idx} style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{issue.issue}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{issue.pages}</div>
                  </div>
                  <span className={`badge ${issue.severity === 'critical' ? 'badge-danger' : issue.severity === 'warning' ? 'badge-warning' : 'badge-neutral'}`}>
                    {issue.severity.toUpperCase()} ({issue.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="tab-panel active">
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Info size={32} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Google Search Console Integration</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
              Connect your client's Google Search Console account in settings to see direct search impressions, CTR trends, and click data.
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && (
        <div className="tab-panel active">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Share Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(client.reports ?? []).map((rep: any) => (
                  <tr key={rep.id}>
                    <td style={{ fontWeight: 600 }}>June 2026</td>
                    <td><span className="badge badge-success">Done</span></td>
                    <td>{rep.viewCount} views</td>
                    <td>
                      <a href={`/r/${rep.shareSlug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        View public link <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Link href={`/r/${rep.shareSlug}`} className="btn btn-secondary btn-sm"><Eye size={12} /> View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
