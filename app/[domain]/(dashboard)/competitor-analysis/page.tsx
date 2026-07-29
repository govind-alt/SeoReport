'use client';

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Globe, Target, Zap, RefreshCw, Search, ExternalLink } from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' :
  n >= 1000    ? (n / 1000).toFixed(1) + 'K'    : String(n);

function ScoreBar({ value, max = 100, color = 'var(--primary)' }: { value: number; max?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '32px', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function CompetitorAnalysisPage() {
  const params  = useParams();
  const domain  = params?.domain as string || 'demo';
  const basePath = `/${domain}`;

  const [competitors, setCompetitors]   = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [source, setSource]             = useState<'live' | 'mock'>('mock');
  const [filterDomain, setFilterDomain] = useState('');
  const [sortBy, setSortBy]             = useState<'traffic' | 'keywords' | 'trust_score' | 'visibility'>('traffic');
  const [sortDir, setSortDir]           = useState<'desc' | 'asc'>('desc');
  const [selected, setSelected]         = useState<any | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/seranking/competitors?domain=${domain}`)
      .then(r => r.json())
      .then(data => {
        setCompetitors(data.competitors || []);
        setSource(data.source || 'mock');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [domain]);

  /* Derived data */
  const filtered = competitors
    .filter(c => !filterDomain || c.domain.toLowerCase().includes(filterDomain.toLowerCase()))
    .sort((a, b) => {
      const diff = (a[sortBy] ?? 0) - (b[sortBy] ?? 0);
      return sortDir === 'desc' ? -diff : diff;
    });

  const radarData = selected
    ? [
        { metric: 'Visibility', competitor: selected.visibility ?? 0, max: 100 },
        { metric: 'Trust',      competitor: selected.trust_score ?? 0, max: 100 },
        { metric: 'Keywords',   competitor: Math.min(((selected.keywords ?? 0) / 200), 100), max: 100 },
        { metric: 'Traffic',    competitor: Math.min(((selected.traffic ?? 0) / 100000), 100), max: 100 },
        { metric: 'Avg Pos',    competitor: Math.max(100 - (selected.avg_position ?? 50), 0), max: 100 },
      ]
    : [];

  const barData = filtered.slice(0, 8).map(c => ({
    name: c.domain.replace('www.', '').split('.')[0],
    traffic: Math.round((c.traffic ?? 0) / 1000),
    keywords: c.keywords ?? 0,
  }));

  const handleSort = (col: typeof sortBy) => {
    if (col === sortBy) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Competitor Analysis
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={13} />
            Benchmark your clients against top competitors in their niche
            {source === 'mock' && (
              <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: '20px', fontWeight: 700 }}>
                Demo Data
              </span>
            )}
            {source === 'live' && (
              <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '20px', fontWeight: 700 }}>
                ● Live
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search filter */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Filter domain…"
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              style={{
                paddingLeft: '30px', paddingRight: '12px', height: '36px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '180px',
              }}
            />
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={13} className={loading ? 'spinner' : ''} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spinner" style={{ marginBottom: '12px' }} />
          <div>Loading competitor data…</div>
        </div>
      ) : (
        <>
          {/* ── Summary KPIs ────────────────────────────────────────────── */}
          <div className="kpi-grid kpi-grid-4" style={{ gap: '14px', marginBottom: '24px' }}>
            <div className="kpi-card">
              <div className="kpi-label">Competitors Tracked</div>
              <div className="kpi-value" style={{ fontSize: '28px' }}>{competitors.length}</div>
              <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>in this niche</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Highest Traffic</div>
              <div className="kpi-value" style={{ fontSize: '28px' }}>
                {fmt(Math.max(...competitors.map(c => c.traffic ?? 0)))}
              </div>
              <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
                {competitors.sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))[0]?.domain}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Keywords</div>
              <div className="kpi-value" style={{ fontSize: '28px' }}>
                {fmt(Math.round(competitors.reduce((s, c) => s + (c.keywords ?? 0), 0) / (competitors.length || 1)))}
              </div>
              <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>across all competitors</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Trust Score</div>
              <div className="kpi-value" style={{ fontSize: '28px' }}>
                {Math.round(competitors.reduce((s, c) => s + (c.trust_score ?? 0), 0) / (competitors.length || 1))}
              </div>
              <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>out of 100</div>
            </div>
          </div>

          {/* ── Charts Row ──────────────────────────────────────────────── */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Traffic Bar Chart */}
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Traffic Comparison</div>
                  <div className="chart-subtitle">Monthly organic traffic (K visits)</div>
                </div>
              </div>
              <div style={{ height: '220px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v + 'K'} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
                    <Tooltip
                      formatter={(v: any) => [(v * 1000).toLocaleString(), 'Traffic']}
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }}
                    />
                    <Bar dataKey="traffic" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar for selected */}
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Competitor Profile</div>
                  <div className="chart-subtitle">
                    {selected ? `Radar view — ${selected.domain}` : 'Click any row to view radar'}
                  </div>
                </div>
              </div>
              {selected && radarData.length > 0 ? (
                <div style={{ height: '220px', marginTop: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name={selected.domain} dataKey="competitor" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '8px' }}>
                  <Target size={28} style={{ opacity: 0.4 }} />
                  <div style={{ fontSize: '13px' }}>Select a competitor row</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Competitor Table ─────────────────────────────────────────── */}
          <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>All Competitors</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Click column headers to sort · Click a row for radar view
              </div>
            </div>

            <div className="table-wrapper" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Domain</th>
                    <th onClick={() => handleSort('visibility')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Visibility {sortBy === 'visibility' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th onClick={() => handleSort('traffic')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Traffic {sortBy === 'traffic' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th onClick={() => handleSort('keywords')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Keywords {sortBy === 'keywords' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th>Avg Position</th>
                    <th onClick={() => handleSort('trust_score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Trust Score {sortBy === 'trust_score' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th>Keyword Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No competitors found</td></tr>
                  ) : (
                    filtered.map((c, i) => (
                      <tr
                        key={c.id ?? c.domain}
                        onClick={() => setSelected(selected?.domain === c.domain ? null : c)}
                        style={{
                          cursor: 'pointer',
                          background: selected?.domain === c.domain ? 'rgba(220,38,38,0.06)' : undefined,
                          borderLeft: selected?.domain === c.domain ? '3px solid var(--primary)' : '3px solid transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
                            }}>
                              {c.domain[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px' }}>{c.domain}</div>
                              <a
                                href={`https://${c.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                              >
                                Visit <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ScoreBar value={c.visibility ?? 0} color="var(--primary)" />
                        </td>
                        <td style={{ fontWeight: 700 }}>{fmt(c.traffic ?? 0)}</td>
                        <td>{(c.keywords ?? 0).toLocaleString()}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                            background: (c.avg_position ?? 50) <= 10 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: (c.avg_position ?? 50) <= 10 ? '#10B981' : '#F59E0B',
                          }}>
                            #{(c.avg_position ?? 0).toFixed(1)}
                          </span>
                        </td>
                        <td>
                          <ScoreBar value={c.trust_score ?? 0} color={c.trust_score > 75 ? '#10B981' : c.trust_score > 50 ? '#F59E0B' : '#EF4444'} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                              +{c.new_keywords ?? 0} new
                            </span>
                            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
                              -{c.lost_keywords ?? 0} lost
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Selected competitor detail card ──────────────────────────── */}
          {selected && (
            <div className="card" style={{ padding: '20px', border: '1px solid var(--primary)', background: 'rgba(220,38,38,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                  {selected.domain[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px' }}>{selected.domain}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Detailed profile</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Organic Traffic',  value: fmt(selected.traffic ?? 0),           icon: <TrendingUp size={14}/>,  color: 'var(--primary)' },
                  { label: 'Total Keywords',    value: (selected.keywords ?? 0).toLocaleString(), icon: <Target size={14}/>,    color: '#10B981' },
                  { label: 'Trust Score',       value: `${selected.trust_score ?? 0}/100`,   icon: <Zap size={14}/>,        color: '#F59E0B' },
                  { label: 'Avg Position',      value: `#${(selected.avg_position ?? 0).toFixed(1)}`, icon: <Globe size={14}/>,    color: '#8B5CF6' },
                  { label: 'New Keywords',      value: `+${selected.new_keywords ?? 0}`,    icon: <TrendingUp size={14}/>,  color: '#10B981' },
                  { label: 'Lost Keywords',     value: `-${selected.lost_keywords ?? 0}`,   icon: <TrendingDown size={14}/>, color: '#EF4444' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: m.color, marginBottom: '4px' }}>
                      {m.icon}
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
