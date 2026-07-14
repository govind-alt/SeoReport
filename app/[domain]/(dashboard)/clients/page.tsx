'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Users, Search, Plus, TrendingUp, TrendingDown,
  Minus, ExternalLink, MoreHorizontal, Trash2, Eye,
  Globe, BarChart2, RefreshCw, X, ChevronDown
} from 'lucide-react';

/* ─── Types ─── */
interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  healthScore?: number;
  top10Count?: number;
  trafficEst?: number;
  lastReportDate?: string;
  status: string;
  reports?: any[];
}

/* ─── Helpers ─── */
const NAV_COLORS = ['#4F8EF7', '#2563EB', '#1A1A2E', '#0F3460', '#3B7BF6'];
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const getColor = (name: string) => NAV_COLORS[name.charCodeAt(0) % NAV_COLORS.length];
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/* ─── Demo Clients ─── */
const DEMO_CLIENTS: Client[] = [
  { id: 'd1', name: 'Acme Corporation', domain: 'acme.com', industry: 'Technology', healthScore: 92, top10Count: 237, trafficEst: 84200, lastReportDate: '2024-06-20', status: 'active' },
  { id: 'd2', name: 'TechVision Inc', domain: 'techvision.io', industry: 'Technology', healthScore: 84, top10Count: 189, trafficEst: 61000, lastReportDate: '2024-06-18', status: 'active' },
  { id: 'd3', name: 'GrowthLabs', domain: 'growthlabs.co', industry: 'Marketing Agency', healthScore: 63, top10Count: 74, trafficEst: 28400, lastReportDate: '2024-06-15', status: 'active' },
  { id: 'd4', name: 'NexaRetail', domain: 'nexaretail.com', industry: 'E-commerce', healthScore: 78, top10Count: 156, trafficEst: 53200, lastReportDate: '2024-06-22', status: 'active' },
  { id: 'd5', name: 'BloomAgency', domain: 'bloomagency.co', industry: 'Marketing Agency', healthScore: 88, top10Count: 211, trafficEst: 71400, lastReportDate: '2024-06-19', status: 'active' },
  { id: 'd6', name: 'HealthPlus', domain: 'healthplus.io', industry: 'Healthcare', healthScore: 55, top10Count: 42, trafficEst: 18900, lastReportDate: '2024-06-10', status: 'paused' },
];

/* ─── Add Client Modal ─── */
function AddClientModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (c: Client) => void }) {
  const [form, setForm] = useState({ name: '', domain: '', industry: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const industries = ['Technology', 'E-commerce', 'Healthcare', 'Finance', 'Real Estate', 'Education', 'Marketing Agency', 'Legal', 'Hospitality', 'Other'];

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onSuccess(data);
      onClose();
      toast.success('Client added successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 32px 64px rgba(26,26,46,0.25)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Add New Client</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Name *</label>
              <input type="text" className="form-input" required value={form.name} onChange={set('name')} placeholder="Acme Corp" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Website Domain *</label>
              <input type="text" className="form-input" required value={form.domain} onChange={set('domain')} placeholder="acme.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Industry</label>
              <select className="form-input" value={form.industry} onChange={set('industry')}>
                <option value="">Select Industry...</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Internal Notes</label>
              <textarea className="form-input" style={{ height: 60, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Notes..." />
            </div>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#F8FAFC', borderRadius: '0 0 16px 16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading ? <>Adding...</> : <>Add Client</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* helper icon */
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

/* ─── Health Score Ring ─── */
function HealthRing({ score }: { score: number }) {
  const r = 18; const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="#E4E9F2" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x="22" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={color} style={{ transform: 'rotate(90deg)', transformOrigin: '22px 22px' }}>
        {score}
      </text>
    </svg>
  );
}

/* ─── Main Page ─── */
export default function ClientsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  
  let basePath = '';
  if (domain !== 'localhost') {
    basePath = '';
  } else {
    basePath = `/${domain}`;
  }

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'traffic'>('health');

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setClients(data);
        else setClients(DEMO_CLIENTS);
      })
      .catch(() => setClients(DEMO_CLIENTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || (c.industry ?? '').toLowerCase().includes(q);
      const matchFilter = filter === 'all' || c.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'health') return (b.healthScore ?? 0) - (a.healthScore ?? 0);
      if (sortBy === 'traffic') return (b.trafficEst ?? 0) - (a.trafficEst ?? 0);
      return a.name.localeCompare(b.name);
    });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      setClients(c => c.filter(cl => cl.id !== id));
      toast.success(`${name} removed`);
    } catch {
      toast.error('Failed to remove client');
    }
  };

  const activeCount = clients.filter(c => c.status === 'active').length;
  const avgHealth = clients.length ? Math.round(clients.reduce((s, c) => s + (c.healthScore ?? 0), 0) / clients.length) : 0;
  const totalTop10 = clients.reduce((s, c) => s + (c.top10Count ?? 0), 0);

  return (
    <>
      <AddClientModal open={showModal} onClose={() => setShowModal(false)} onSuccess={c => setClients(prev => [c, ...prev])} />

      <div className="page-content">
        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Clients</h1>
            <p className="page-subtitle">Track and manage SEO performance for all your clients</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => toast.success('Export started!')}>
              Export CSV
            </button>
            <button id="add-client-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Client
            </button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Clients', value: clients.length, icon: <Users size={18} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Active Clients', value: activeCount, icon: <BarChart2 size={18} />, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Avg Health Score', value: `${avgHealth}%`, icon: <TrendingUp size={18} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
          ].map((k, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 12,
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 12,
          padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 34, fontSize: 13 }}
              placeholder="Search clients or domains…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'active', 'paused'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === f ? 'var(--primary)' : 'white',
                borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              className="form-input"
              style={{ width: 'auto', fontSize: 12, padding: '6px 28px 6px 10px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="health">Health Score</option>
              <option value="traffic">Traffic</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* ── Client Cards Grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 20 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 10 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} style={{ color: 'var(--gray-300)' }} /></div>
            <div className="empty-state-title">No clients found</div>
            <div className="empty-state-desc">
              {search ? `No clients match "${search}"` : 'Start by adding your first client to track their SEO performance.'}
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Your First Client
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {filtered.map(client => {
              const health = client.healthScore ?? 0;
              const healthColor = health >= 80 ? '#10B981' : health >= 60 ? '#F59E0B' : '#EF4444';
              const healthLabel = health >= 80 ? 'Excellent' : health >= 60 ? 'Fair' : 'Needs Work';

              return (
                <div key={client.id} style={{
                  background: 'white', border: '1px solid var(--border)', borderRadius: 14,
                  boxShadow: 'var(--shadow-card)', overflow: 'hidden', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                    (e.currentTarget as HTMLDivElement).style.transform = '';
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 11,
                          background: getColor(client.name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0,
                        }}>{getInitials(client.name)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {client.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                            <Globe size={11} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.domain}</span>
                          </div>
                        </div>
                      </div>
                      <HealthRing score={health} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                      {client.industry && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                          {client.industry}
                        </span>
                      )}
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                        background: client.status === 'active' ? '#ECFDF5' : '#F9FAFB',
                        color: client.status === 'active' ? '#059669' : '#94A3B8',
                      }}>
                        {client.status === 'active' ? '● Active' : '○ Paused'}
                      </span>
                      <span style={{ fontSize: 11, color: healthColor, fontWeight: 600, marginLeft: 'auto' }}>{healthLabel}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '12px 18px', gap: 8 }}>
                    {[
                      { label: 'Top-10 KW', value: client.top10Count ?? '—' },
                      { label: 'Traffic Est.', value: client.trafficEst ? `${(client.trafficEst / 1000).toFixed(0)}k` : '—' },
                      { label: 'Last Report', value: client.lastReportDate ? new Date(client.lastReportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--surface-2)', borderRadius: '0 0 14px 14px' }}>
                    <Link href={`${basePath}/clients/${client.id}`} className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                      <Eye size={13} /> View Details
                    </Link>
                    <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: 12 }}>
                      <ExternalLink size={12} />
                    </a>
                    <button className="btn btn-sm btn-secondary" style={{ fontSize: 12, color: 'var(--danger)' }} onClick={() => handleDelete(client.id, client.name)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Results Count ── */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Showing {filtered.length} of {clients.length} clients
          </div>
        )}
      </div>
    </>
  );
}
