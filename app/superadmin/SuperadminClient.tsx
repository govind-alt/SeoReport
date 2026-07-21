'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { updateAgencyPlanSuperadmin, deleteAgencySuperadmin, createAgencySuperadmin } from '@/app/actions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

export default function SuperadminClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState('starter');
  const [creating, setCreating] = useState(false);

  // Support Tickets Tracking & Response State
  const { supportTickets: initialTickets } = data;
  const [supportTickets, setSupportTickets] = useState<any[]>(initialTickets || []);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyText) return;
    setSubmittingReply(true);
    const t = toast.loading('Logging reply...');
    try {
      const { respondToTicketSuperadmin } = await import('@/app/actions');
      await respondToTicketSuperadmin(activeTicketId, replyText);
      toast.success('Reply submitted and ticket resolved!', { id: t });

      // Update state locally
      setSupportTickets(prev => prev.map(tick => {
        if (tick.id === activeTicketId) {
          let baseAction = tick.action;
          if (baseAction.includes(' [RESOLVED]')) {
            baseAction = baseAction.split(' | Response: "')[0];
          }
          return {
            ...tick,
            action: `${baseAction} | Response: "${replyText}" [RESOLVED]`
          };
        }
        return tick;
      }));

      setReplyText('');
      setActiveTicketId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit reply', { id: t });
    } finally {
      setSubmittingReply(false);
    }
  };

  // Stats
  const { agencies, users, totalAgencies, totalClients, mrr, totalReports, generatedReports, failedReports, planStats, recentLogs, mrrChartData, agencyChartData } = data;

  const planChartData = [
    { name: 'Starter', value: planStats.starter, color: '#94A3B8' },
    { name: 'Professional', value: planStats.professional, color: '#8B5CF6' },
    { name: 'Enterprise', value: planStats.enterprise, color: '#3B82F6' }
  ];

  const filteredAgencies = agencies.filter((a: any) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                        a.slug.toLowerCase().includes(search.toLowerCase()) ||
                        (a.contactEmail && a.contactEmail.toLowerCase().includes(search.toLowerCase()));
    const matchPlan = planFilter === 'all' || a.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const handlePlanChange = async (agencyId: string, newPlan: string) => {
    const t = toast.loading('Updating plan...');
    try {
      await updateAgencyPlanSuperadmin(agencyId, newPlan);
      toast.success('Agency plan updated successfully!', { id: t });
      
      // Update local state
      setData((prev: any) => {
        const updatedAgencies = prev.agencies.map((a: any) => {
          if (a.id === agencyId) return { ...a, plan: newPlan };
          return a;
        });
        
        // Recompute stats
        const newMrr = updatedAgencies.reduce((sum: number, a: any) => {
          if (a.plan === 'enterprise') return sum + 249;
          if (a.plan === 'professional') return sum + 99;
          return sum + 49;
        }, 0);

        const newPlanStats = {
          enterprise: updatedAgencies.filter((a: any) => a.plan === 'enterprise').length,
          professional: updatedAgencies.filter((a: any) => a.plan === 'professional').length,
          starter: updatedAgencies.filter((a: any) => a.plan === 'starter' || !a.plan).length
        };

        return {
          ...prev,
          agencies: updatedAgencies,
          mrr: newMrr,
          planStats: newPlanStats
        };
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan', { id: t });
    }
  };

  const handleDeleteAgency = async (agencyId: string, agencyName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${agencyName}? This will permanently wipe all client reports, users, credentials, and settings. THIS CANNOT BE UNDONE.`)) {
      return;
    }
    const t = toast.loading(`Deleting ${agencyName}...`);
    try {
      await deleteAgencySuperadmin(agencyId);
      toast.success('Agency deleted completely!', { id: t });
      
      // Update state
      setData((prev: any) => {
        const updatedAgencies = prev.agencies.filter((a: any) => a.id !== agencyId);
        const newMrr = updatedAgencies.reduce((sum: number, a: any) => {
          if (a.plan === 'enterprise') return sum + 249;
          if (a.plan === 'professional') return sum + 99;
          return sum + 49;
        }, 0);
        return {
          ...prev,
          agencies: updatedAgencies,
          totalAgencies: updatedAgencies.length,
          mrr: newMrr
        };
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete agency', { id: t });
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug || !newSubdomain || !newEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    setCreating(true);
    const t = toast.loading('Registering agency...');
    try {
      await createAgencySuperadmin({
        name: newName,
        slug: newSlug,
        subdomain: newSubdomain,
        plan: newPlan,
        contactEmail: newEmail
      });
      toast.success('New agency registered successfully!', { id: t });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create agency', { id: t });
      setCreating(false);
    }
  };

  const renderTabNav = () => (
    <div style={{ background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', gap: '32px' }}>
      {[
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'agencies', label: 'Agencies', icon: '🏢' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'tickets', label: 'Support Tickets', icon: '💬' },
        { id: 'system', label: 'System Health', icon: '🖥️' },
        { id: 'billing', label: 'Billing', icon: '💰' }
      ].map(tab => (
        <button
          key={tab.id}
          className="cp-tab-btn"
          onClick={() => setActiveTab(tab.id)}
          style={{
            borderBottom: activeTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
            color: activeTab === tab.id ? '#6366F1' : 'rgba(255,255,255,0.45)',
            fontWeight: activeTab === tab.id ? 700 : 500,
            position: 'relative'
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080C18', color: 'white', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .cp-tab-btn { background: none; border: none; cursor: pointer; padding: 20px 4px; font-family: inherit; font-size: 14px; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .cp-tab-btn:hover { color: white !important; }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .table-wrapper table th { color: rgba(255,255,255,0.45); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 24px; }
        .table-wrapper table td { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: rgba(255,255,255,0.8); }
        .table-wrapper tr:hover td { background: rgba(255,255,255,0.02); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>
      
      {/* Superadmin Header */}
      <header style={{ background: 'rgba(8, 12, 24, 0.8)', backdropFilter: 'blur(20px)', color: 'white', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366F1, #3B82F6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>RF</div>
          <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px' }}>RankFlow <span style={{ opacity: 0.6, fontWeight: 500, fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>SUPER ADMIN CONSOLE</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/superadmin/database" className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>📁 Database Explorer</Link>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>＋ Register Agency</button>
          <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Sign Out</Link>
        </div>
      </header>

      {renderTabNav()}

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Platform Overview</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '32px' }}>Real-time metrics across all agencies</p>
            
            {/* KPI Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, #8B5CF6 0%, transparent 70%)`, opacity: 0.15, transform: 'translate(20px,-20px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Monthly Revenue</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>${mrr.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.2)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>▲</span> 
                      +18% vs last month
                    </div>
                  </div>
                  <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>$</div>
                </div>
              </div>

              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, #10B981 0%, transparent 70%)`, opacity: 0.15, transform: 'translate(20px,-20px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Total Agencies</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>{totalAgencies}</div>
                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.2)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>▲</span> 
                      3 joined this month
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏢</div>
                </div>
              </div>

              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, #3B82F6 0%, transparent 70%)`, opacity: 0.15, transform: 'translate(20px,-20px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Total Clients</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>{totalClients}</div>
                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.2)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>▲</span> 
                      Across all agencies
                    </div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👥</div>
                </div>
              </div>

              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, #EC4899 0%, transparent 70%)`, opacity: 0.15, transform: 'translate(20px,-20px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Reports Generated</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>{totalReports}</div>
                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.2)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>▲</span> 
                      24 this week
                    </div>
                  </div>
                  <div style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                </div>
              </div>
            </div>

            {/* Charts & Audits */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              
              {/* MRR Chart */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Monthly Recurring Revenue</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>Platform MRR growth (last 6 months)</p>
                </div>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mrrChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(10,15,28,0.9)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', backdropFilter: 'blur(10px)' }} itemStyle={{ color: '#6366F1' }} />
                      <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Agency Growth Chart */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Agency Growth</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>New agencies onboarded monthly</p>
                </div>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(10,15,28,0.9)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', backdropFilter: 'blur(10px)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Agencies & System Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Agencies</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('agencies')} style={{ color: '#6366F1' }}>View All →</button>
                </div>
                <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
                  <table style={{ background: 'transparent', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>AGENCY</th>
                        <th style={{ textAlign: 'left' }}>PLAN</th>
                        <th style={{ textAlign: 'left' }}>CLIENTS</th>
                        <th style={{ textAlign: 'left' }}>MRR</th>
                        <th style={{ textAlign: 'left' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.slice(0, 5).map((a: any) => (
                        <tr key={a.id} className="report-row">
                          <td>
                            <div style={{ fontWeight: 600 }}>{a.name}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{a.slug}.rankflow.app</div>
                          </td>
                          <td style={{ textTransform: 'capitalize', color: 'rgba(255,255,255,0.6)' }}>{a.plan}</td>
                          <td>{a._count.clients}</td>
                          <td style={{ fontWeight: 600 }}>${a.plan === 'enterprise' ? 249 : a.plan === 'professional' ? 99 : 49}/mo</td>
                          <td><span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>Active</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Status Widget */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>System Status</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>All systems operational</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>API Gateway</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Operational</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>18ms</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>Database</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Operational</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>4ms</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>SE Ranking Proxy</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Operational</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>240ms</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>PDF Generator</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>Degraded</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1.8s</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Last checked: Just now · <button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 'auto', fontSize: '11px', color: 'var(--primary)' }} onClick={() => setActiveTab('system')}>View Details</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {activeTab === 'agencies' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>All Agencies</h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>{agencies.filter((a: any) => a.plan !== 'trial').length} active · 1 trial · 0 suspended</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Export CSV</button>
                <button className="btn btn-primary btn-sm" style={{ background: '#6366F1' }} onClick={() => setIsCreateModalOpen(true)}>＋ Invite Agency</button>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ position: 'relative', width: '320px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '8px', color: 'rgba(255,255,255,0.45)' }}>🔍</span>
                  <input className="form-input" style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }} placeholder="Search agencies..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', padding: '2px' }}>
                  {['all', 'starter', 'professional', 'enterprise'].map(plan => (
                    <button
                      key={plan}
                      onClick={() => setPlanFilter(plan)}
                      style={{
                        padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: '6px',
                        background: planFilter === plan ? '#6366F1' : 'transparent',
                        color: planFilter === plan ? 'white' : 'rgba(255,255,255,0.45)',
                        textTransform: 'capitalize', transition: 'all 0.2s'
                      }}
                    >
                      {plan === 'all' ? 'All Plans' : plan === 'professional' ? 'Pro' : plan}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
                <table style={{ background: 'transparent', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>AGENCY</th>
                      <th style={{ textAlign: 'left' }}>SUBDOMAIN</th>
                      <th style={{ textAlign: 'left' }}>PLAN</th>
                      <th style={{ textAlign: 'left' }}>CLIENTS</th>
                      <th style={{ textAlign: 'left' }}>REPORTS</th>
                      <th style={{ textAlign: 'left' }}>MRR</th>
                      <th style={{ textAlign: 'left' }}>JOINED</th>
                      <th style={{ textAlign: 'left' }}>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgencies.map((agency: any) => (
                      <tr key={agency.id} className="report-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, #1E293B, #0F172A)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '14px' }}>
                              {agency.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '14px' }}>{agency.name}</div>
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{agency.contactEmail || 'admin@' + agency.slug + '.com'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link href={`/${agency.slug}`} target="_blank" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px', fontWeight: 500 }}>
                            {agency.slug}
                          </Link>
                        </td>
                        <td style={{ textTransform: 'capitalize', color: agency.plan === 'enterprise' ? '#10B981' : agency.plan === 'professional' ? '#3B82F6' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                          {agency.plan === 'professional' ? 'Pro' : agency.plan}
                        </td>
                        <td><strong style={{ color: 'white' }}>{agency._count.clients}</strong></td>
                        <td><strong style={{ color: 'white' }}>{agency._count.clients * 4}</strong></td>
                        <td style={{ color: '#6366F1', fontWeight: 700 }}>${agency.plan === 'enterprise' ? 249 : agency.plan === 'professional' ? 99 : 49}/mo</td>
                        <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }} suppressHydrationWarning>{new Date(agency.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</td>
                        <td><span className="status-badge" style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>Active</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/${agency.slug}`, '_blank')} style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' }}>👁️ View</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', fontSize: '11px' }} onClick={() => handleDeleteAgency(agency.id, agency.name)}>Suspend</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAgencies.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.45)' }}>No agencies matched this search criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                <div>{filteredAgencies.length} of {totalAgencies} agencies</div>
                <div>Total MRR from filtered: <span style={{ color: '#6366F1', fontWeight: 700 }}>${filteredAgencies.reduce((s: number, a: any) => s + (a.plan === 'enterprise' ? 249 : a.plan === 'professional' ? 99 : 49), 0).toLocaleString()}/mo</span></div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Platform Users</h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>{users?.length || 0} users across all agencies</p>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Export CSV</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
                <table style={{ background: 'transparent', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>USER</th>
                      <th style={{ textAlign: 'left' }}>EMAIL</th>
                      <th style={{ textAlign: 'left' }}>AGENCY</th>
                      <th style={{ textAlign: 'left' }}>ROLE</th>
                      <th style={{ textAlign: 'left' }}>LAST LOGIN</th>
                      <th style={{ textAlign: 'left' }}>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user: any, i: number) => (
                      <tr key={user.id} className="report-row">
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 45}, 70%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {(user.name || user.email || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ fontWeight: 600 }}>{user.name || 'Unknown User'}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.7)' }}>{user.email}</td>
                        <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.45)' }}>{user.agency?.name || 'RankFlow Platform'}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            background: user.role === 'superadmin' ? 'rgba(239, 68, 68, 0.1)' : user.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${user.role === 'superadmin' ? 'rgba(239,68,68,0.2)' : user.role === 'admin' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`,
                            color: user.role === 'superadmin' ? '#EF4444' : user.role === 'admin' ? '#3B82F6' : '#10B981',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{i === 0 ? '2 min ago' : i === 1 ? '1 hour ago' : '3 days ago'}</td>
                        <td style={{ padding: '16px 24px' }}><span style={{ color: '#10B981', fontWeight: 600, fontSize: '12px' }}>Active</span></td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' }}>Manage</button>
                            {user.role !== 'superadmin' && (
                              <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 10px', fontSize: '11px' }}>Deactivate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!users || users.length === 0) && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.45)' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                {users?.length || 0} active · 0 inactive
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM HEALTH TAB */}
        {activeTab === 'system' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>System Health</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '32px' }}>Real-time platform monitoring & diagnostics</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}><span style={{ color: '#10B981' }}>🌐</span> API UPTIME</div>
                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>99.97%</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>Last 30 days</div>
              </div>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}><span style={{ color: '#3B82F6' }}>⚡</span> AVG RESPONSE</div>
                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>42ms</div>
                <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600 }}>▼ 8ms from yesterday</div>
              </div>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}><span style={{ color: 'rgba(255,255,255,0.6)' }}>🗄️</span> DB QUERIES/MIN</div>
                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>2,847</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>Peak: 4,200</div>
              </div>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}><span style={{ color: '#F59E0B' }}>⚠️</span> ERROR RATE</div>
                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>0.03%</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>Well within threshold</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>API Services</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Authentication API', status: 'Operational', uptime: '99.99%', color: '#10B981' },
                    { name: 'Reports API', status: 'Operational', uptime: '99.95%', color: '#10B981' },
                    { name: 'SE Ranking Proxy', status: 'Operational', uptime: '99.81%', color: '#10B981' },
                    { name: 'PDF Generation', status: 'Degraded', uptime: '98.2%', color: '#F59E0B' },
                    { name: 'Webhook Dispatcher', status: 'Operational', uptime: '99.97%', color: '#10B981' }
                  ].map(service => (
                    <div key={service.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: service.color, boxShadow: `0 0 10px ${service.color}` }}></div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{service.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: service.color, fontWeight: 700 }}>{service.status}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{service.uptime} uptime</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Infrastructure</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Primary Database', status: 'Operational', uptime: '100%', color: '#10B981' },
                    { name: 'Read Replica', status: 'Operational', uptime: '100%', color: '#10B981' },
                    { name: 'CDN Edge', status: 'Operational', uptime: '99.99%', color: '#10B981' },
                    { name: 'Object Storage', status: 'Operational', uptime: '100%', color: '#10B981' },
                    { name: 'Email Gateway', status: 'Operational', uptime: '99.93%', color: '#10B981' }
                  ].map(infra => (
                    <div key={infra.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: infra.color, boxShadow: `0 0 10px ${infra.color}` }}></div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{infra.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: infra.color, fontWeight: 700 }}>{infra.status}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{infra.uptime} uptime</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Billing & Revenue</h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Platform revenue, subscriptions, and invoices</p>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Export Billing CSV</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>CURRENT MRR</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#6366F1', letterSpacing: '-1px' }}>${mrr.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 600 }}>+18% MoM</div>
              </div>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>ANNUAL RUN RATE</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', letterSpacing: '-1px' }}>${(mrr * 12).toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>Projected ARR</div>
              </div>
              <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', padding: '24px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>AVG REVENUE / AGENCY</div>
                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>${Math.round(mrr / Math.max(1, totalAgencies)).toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>Per agency per month</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Revenue by Agency</h3>
              </div>
              <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
                <table style={{ background: 'transparent', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>AGENCY</th>
                      <th style={{ textAlign: 'left' }}>PLAN</th>
                      <th style={{ textAlign: 'left' }}>MRR</th>
                      <th style={{ textAlign: 'left' }}>ANNUAL VALUE</th>
                      <th style={{ textAlign: 'left' }}>NEXT BILLING</th>
                      <th style={{ textAlign: 'left' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.map((agency: any) => {
                      const agencyMrr = agency.plan === 'enterprise' ? 249 : agency.plan === 'professional' ? 99 : 49;
                      return (
                        <tr key={agency.id} className="report-row">
                          <td style={{ fontWeight: 600 }}>{agency.name}</td>
                          <td style={{ textTransform: 'capitalize', color: agency.plan === 'enterprise' ? '#10B981' : agency.plan === 'professional' ? '#3B82F6' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            {agency.plan === 'professional' ? 'Pro' : agency.plan}
                          </td>
                          <td style={{ color: '#6366F1', fontWeight: 700 }}>${agencyMrr}/mo</td>
                          <td style={{ fontWeight: 600 }}>${(agencyMrr * 12).toLocaleString()}</td>
                          <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Aug 1, 2026</td>
                          <td><span className="status-badge" style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>Active</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                <div>{agencies.length} agencies</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span>Total MRR: <strong style={{ color: '#6366F1' }}>${mrr.toLocaleString()}/mo</strong></span>
                  <span>ARR: <strong style={{ color: '#10B981' }}>${(mrr * 12).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SUPPORT TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Support Ticket Tracking</h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
                  Monitor customer tickets logged from client portals, resolve issues, and track resolutions.
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
                <table style={{ background: 'transparent', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>DATE</th>
                      <th style={{ textAlign: 'left' }}>TENANT AGENCY</th>
                      <th style={{ textAlign: 'left' }}>CLIENT</th>
                      <th style={{ textAlign: 'left' }}>INQUIRY MESSAGE</th>
                      <th style={{ textAlign: 'left' }}>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTickets.map((ticket: any) => {
                      const clientName = ticket.action.split('Client (')[1]?.split(') Support Request:')[0] || 'Client';
                      
                      const parts = ticket.action.split('Support Request: "');
                      let messageContent = parts[1]?.split('" | Response: "')[0] || ticket.action;
                      if (messageContent.endsWith('"')) messageContent = messageContent.slice(0, -1);
                      
                      let reply = parts[1]?.split('" | Response: "')[1]?.split('" [RESOLVED]')[0] || null;
                      
                      const isResolved = ticket.action.includes('[RESOLVED]');

                      return (
                        <tr key={ticket.id} className="report-row">
                          <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', whiteSpace: 'nowrap' }} suppressHydrationWarning>
                            {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ticket.agency?.name || 'Default Agency'}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{ticket.agency?.slug}.rankflow.app</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'white' }}>{clientName}</div>
                          </td>
                          <td>
                            <div style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{messageContent}</div>
                            {reply && (
                              <div style={{ marginTop: '6px', fontSize: '11px', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #8B5CF6' }}>
                                <strong>Reply:</strong> {`"${reply}"`}
                              </div>
                            )}
                          </td>
                          <td>
                            {isResolved ? (
                              <span className="status-badge" style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>Resolved</span>
                            ) : (
                              <span className="status-badge" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>Pending</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ 
                                border: isResolved ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139, 92, 246, 0.3)',
                                color: isResolved ? 'rgba(255,255,255,0.6)' : '#8B5CF6', 
                                padding: '6px 12px', 
                                fontSize: '11px' 
                              }}
                              onClick={() => {
                                setActiveTicketId(ticket.id);
                                if (reply) setReplyText(reply);
                              }}
                            >
                              {isResolved ? '👁️ View / Edit' : '💬 Reply & Resolve'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {supportTickets.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.45)' }}>
                          No support tickets registered on the platform.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* Ticket Response Modal */}
      {activeTicketId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>💬 Respond & Resolve Ticket</h3>
              <button onClick={() => { setActiveTicketId(null); setReplyText(''); }} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.45)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            
            {(() => {
              const ticket = supportTickets.find(t => t.id === activeTicketId);
              if (!ticket) return null;
              
              const clientName = ticket.action.split('Client (')[1]?.split(') Support Request:')[0] || 'Client';
              const parts = ticket.action.split('Support Request: "');
              let messageContent = parts[1]?.split('" | Response: "')[0] || ticket.action;
              if (messageContent.endsWith('"')) messageContent = messageContent.slice(0, -1);
              
              let existingReply = parts[1]?.split('" | Response: "')[1]?.split('" [RESOLVED]')[0] || '';

              return (
                <form onSubmit={handleReplySubmit}>
                  <div style={{ marginBottom: '20px', fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#6366F1' }}>Inquiry from {clientName} ({ticket.agency?.name || 'Agency'}):</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', wordBreak: 'break-word', lineHeight: 1.4 }}>{`"${messageContent}"`}</div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Superadmin Support Reply *</label>
                    <textarea 
                      className="form-input" 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                      required 
                      placeholder="Write response message..." 
                      style={{ width: '100%', height: '120px', padding: '12px', resize: 'vertical', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', lineHeight: 1.4 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => { setActiveTicketId(null); setReplyText(''); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submittingReply}>
                      {submittingReply ? 'Saving Response...' : '🚀 Submit Reply & Resolve'}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

        
      </main>

      {/* Register Agency Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Register New SaaS Tenant</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ fontSize: '20px', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateAgency}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Agency Name *</label>
                <input className="form-input" placeholder="e.g. PixelRank Studio" value={newName} onChange={e => {
                  setNewName(e.target.value);
                  const clean = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                  setNewSlug(clean);
                  setNewSubdomain(clean);
                }} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Contact Email Address *</label>
                <input className="form-input" type="email" placeholder="owner@agency.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Subdomain Route *</label>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <input className="form-input" style={{ borderRadius: 'var(--radius) 0 0 var(--radius)' }} value={newSubdomain} onChange={e => setNewSubdomain(e.target.value)} required />
                  <div style={{ background: 'var(--surface-opaque)', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 var(--radius) var(--radius) 0', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: 'var(--text-muted)' }}>.rankflow.app</div>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Slug Identifier *</label>
                <input className="form-input" value={newSlug} onChange={e => setNewSlug(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label">Initial Subscription Plan</label>
                <select className="form-input" value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                  <option value="starter">Starter ($49/mo)</option>
                  <option value="professional">Professional ($99/mo)</option>
                  <option value="enterprise">Enterprise ($249/mo)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Registering...' : 'Create Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
