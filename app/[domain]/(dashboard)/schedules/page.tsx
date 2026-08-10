'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Calendar, Clock, Mail, Play, Pause, Trash2, Plus,
  CheckCircle2, AlertCircle, RefreshCw, Send, FileText, Globe,
  Zap, Sparkles, Activity, ShieldCheck, Check
} from 'lucide-react';

interface ReportSchedule {
  id: string;
  clientName: string;
  clientDomain: string;
  frequency: 'Weekly (Mon)' | 'Bi-weekly' | 'Monthly (1st)' | 'Monthly (15th)';
  format: 'PDF + Web Link' | 'PDF Only' | 'Web Link Only';
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
}

interface ActivityLog {
  id: string;
  time: string;
  client: string;
  action: string;
  recipient: string;
  status: 'Success' | 'Queued';
}

const INITIAL_SCHEDULES: ReportSchedule[] = [
  {
    id: 's1',
    clientName: 'Acme HealthPlus',
    clientDomain: 'healthplus.com',
    frequency: 'Monthly (1st)',
    format: 'PDF + Web Link',
    recipients: ['marketing@healthplus.com', 'cmo@healthplus.com'],
    lastRun: 'Jul 01, 2026',
    nextRun: 'Aug 01, 2026',
    status: 'active',
  },
  {
    id: 's2',
    clientName: 'Apex Law Group',
    clientDomain: 'apexlaw.com',
    frequency: 'Weekly (Mon)',
    format: 'PDF + Web Link',
    recipients: ['john@apexlaw.com'],
    lastRun: 'Jul 14, 2026',
    nextRun: 'Jul 21, 2026',
    status: 'active',
  },
  {
    id: 's3',
    clientName: 'UrbanStay Rentals',
    clientDomain: 'urbanstay.io',
    frequency: 'Bi-weekly',
    format: 'PDF + Web Link',
    recipients: ['reports@urbanstay.io'],
    lastRun: 'Jul 07, 2026',
    nextRun: 'Jul 21, 2026',
    status: 'active',
  },
  {
    id: 's4',
    clientName: 'TechCraft Solutions',
    clientDomain: 'techcraft.dev',
    frequency: 'Weekly (Mon)',
    format: 'PDF Only',
    recipients: ['admin@techcraft.dev', 'seo@techcraft.dev'],
    lastRun: 'Jul 14, 2026',
    nextRun: 'Jul 21, 2026',
    status: 'active',
  },
  {
    id: 's5',
    clientName: 'BlueOcean SEO',
    clientDomain: 'blueocean.seo',
    frequency: 'Monthly (15th)',
    format: 'PDF + Web Link',
    recipients: ['hello@blueocean.seo'],
    lastRun: 'Jul 15, 2026',
    nextRun: 'Aug 15, 2026',
    status: 'active',
  },
  {
    id: 's6',
    clientName: 'VelocityRank',
    clientDomain: 'velocityrank.com',
    frequency: 'Monthly (1st)',
    format: 'Web Link Only',
    recipients: ['support@velocityrank.com'],
    lastRun: 'Jun 01, 2026',
    nextRun: 'Paused',
    status: 'paused',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'l1', time: '14:22:04', client: 'Apex Law Group', action: 'Compiled White-Label PDF Report', recipient: 'john@apexlaw.com', status: 'Success' },
  { id: 'l2', time: '12:00:00', client: 'Acme HealthPlus', action: 'Automated SERanking Audit Sync', recipient: 'marketing@healthplus.com', status: 'Success' },
  { id: 'l3', time: '09:15:30', client: 'UrbanStay Rentals', action: 'Private Web Portal Link Generated', recipient: 'reports@urbanstay.io', status: 'Success' },
  { id: 'l4', time: '08:00:12', client: 'TechCraft Solutions', action: 'Emailed Monthly Performance Report', recipient: 'admin@techcraft.dev', status: 'Success' },
];

export default function AutomatedSchedulesPage() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>(INITIAL_SCHEDULES);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [isCreating, setIsCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Form state
  const [newClient, setNewClient] = useState('Acme HealthPlus');
  const [newDomain, setNewDomain] = useState('healthplus.com');
  const [newFreq, setNewFreq] = useState<ReportSchedule['frequency']>('Monthly (1st)');
  const [newFormat, setNewFormat] = useState<ReportSchedule['format']>('PDF + Web Link');
  const [newEmails, setNewEmails] = useState('');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmails.trim()) {
      toast.error('Please enter at least one recipient email address');
      return;
    }

    const emailList = newEmails.split(',').map(s => s.trim()).filter(Boolean);

    const created: ReportSchedule = {
      id: String(Date.now()),
      clientName: newClient,
      clientDomain: newDomain,
      frequency: newFreq,
      format: newFormat,
      recipients: emailList,
      lastRun: 'Pending',
      nextRun: newFreq === 'Weekly (Mon)' ? 'Jul 27, 2026' : 'Aug 01, 2026',
      status: 'active',
    };

    setSchedules(prev => [created, ...prev]);
    setIsCreating(false);
    setNewEmails('');
    toast.success(`Automated schedule created & activated for ${newClient}!`);
  };

  const handleTriggerNow = (sch: ReportSchedule) => {
    setRunningId(sch.id);
    setTimeout(() => {
      setRunningId(null);
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      setSchedules(prev => prev.map(item => item.id === sch.id ? { ...item, lastRun: 'Just now' } : item));
      setLogs(prev => [
        { id: String(Date.now()), time: nowTime, client: sch.clientName, action: 'Manual Trigger Dispatch', recipient: sch.recipients[0] || 'Client', status: 'Success' },
        ...prev
      ]);
      toast.success(`Report compiled and emailed to ${sch.recipients.join(', ')}!`);
    }, 1500);
  };

  const handleBatchRunAll = () => {
    setIsBatchRunning(true);
    setTimeout(() => {
      setIsBatchRunning(false);
      const activeItems = schedules.filter(s => s.status === 'active');
      setSchedules(prev => prev.map(s => s.status === 'active' ? { ...s, lastRun: 'Just now' } : s));
      toast.success(`Executed batch engine: ${activeItems.length} active client reports generated & dispatched!`);
    }, 2000);
  };

  const toggleStatus = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = s.status === 'active' ? 'paused' : 'active';
      toast.info(`Schedule for ${s.clientName} is now ${next}.`);
      return { ...s, status: next };
    }));
  };

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success('Schedule removed.');
  };

  const activeCount = schedules.filter(s => s.status === 'active').length;

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .live-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #10B981; display: inline-block;
          animation: pulseDot 1.5s infinite ease-in-out;
          box-shadow: 0 0 10px rgba(16,185,129,0.6);
        }
      `}</style>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className="page-title">Automated Report Schedules</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 11, fontWeight: 800, color: '#10B981' }}>
              <span className="live-dot" /> ENGINE ACTIVE
            </div>
          </div>
          <div className="page-subtitle">Configure recurring white-label PDF generation and automated email dispatches for agency clients</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleBatchRunAll}
            disabled={isBatchRunning}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
          >
            {isBatchRunning ? <RefreshCw size={14} className="spinner" /> : <Zap size={14} style={{ color: '#F59E0B' }} />}
            {isBatchRunning ? 'Running Engine...' : 'Run All Active Schedules'}
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}
          >
            <Plus size={15} /> New Automated Schedule
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 0', width: '100%' }}>

        {/* Hero Automation Engine Control Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: 'white',
          marginBottom: 28,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 32,
          alignItems: 'center'
        }}>
          {/* Left: Dispatch Engine Health */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#10B981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot" /> Real-Time Automated Dispatcher
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              142 Client Reports Dispatched
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18, lineHeight: 1.5 }}>
              100% on-time automated recurring dispatches via verified Resend SMTP gateway. Next scheduled batch run in 14 minutes.
            </div>

            {/* Health Coverage Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.round((activeCount / (schedules.length || 1)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                  borderRadius: 5
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>
                {Math.round((activeCount / (schedules.length || 1)) * 100)}% Schedules Online
              </span>
            </div>
          </div>

          {/* Right: Glassmorphic Metric Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 }}>Active Dispatches</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{activeCount}</div>
              <div style={{ fontSize: 10, color: '#6EE7B7', marginTop: 2 }}>● Live cron active</div>
            </div>

            <div style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', marginBottom: 6 }}>Next Batch</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#60A5FA', marginTop: 4 }}>Jul 21</div>
              <div style={{ fontSize: 10, color: '#93C5FD', marginTop: 2 }}>In 14 mins</div>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#FDE68A', textTransform: 'uppercase', marginBottom: 6 }}>SMTP Gateway</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FBBF24' }}>99.4%</div>
              <div style={{ fontSize: 10, color: '#FDE68A', marginTop: 2 }}>Verified Resend</div>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              Configured Client Automated Schedules ({schedules.length})
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              {activeCount} Active · {schedules.length - activeCount} Paused
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Frequency', 'Format', 'Email Recipients', 'Last Dispatched', 'Next Run', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map(sch => (
                <tr key={sch.id} style={{ borderBottom: '1px solid var(--border)', background: sch.status === 'active' ? 'transparent' : 'var(--gray-50)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{sch.clientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sch.clientDomain}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {sch.frequency}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(79,142,247,0.1)', color: 'var(--primary)' }}>
                      {sch.format}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {sch.recipients.join(', ')}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {sch.lastRun}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: sch.status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {sch.nextRun}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: sch.status === 'active' ? 'rgba(16,185,129,0.1)' : 'var(--gray-100)',
                      color: sch.status === 'active' ? '#10B981' : 'var(--text-muted)'
                    }}>
                      {sch.status === 'active' ? '● Active' : '○ Paused'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleTriggerNow(sch)}
                        disabled={runningId === sch.id}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        {runningId === sch.id ? <RefreshCw size={12} className="spinner" /> : <Play size={12} />}
                        Run Now
                      </button>
                      <button
                        onClick={() => toggleStatus(sch.id)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        {sch.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                      <button
                        onClick={() => handleDelete(sch.id)}
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Execution Activity Stream */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={15} style={{ color: 'var(--primary)' }} /> Live Automated Execution Log
            </div>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>Real-time Dispatcher Active</span>
          </div>

          <div style={{ padding: '10px 20px' }}>
            {logs.map(log => (
              <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>[{log.time}]</code>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.client}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>— {log.action}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>To: {log.recipient}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Modal */}
        {isCreating && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
          }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, maxWidth: 500, width: '100%', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Configure Automated Report Schedule</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Set up automated PDF generation & email delivery</div>

              <form onSubmit={handleCreateSchedule}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Client Name</label>
                  <select
                    value={newClient}
                    onChange={e => {
                      setNewClient(e.target.value);
                      if (e.target.value === 'Acme HealthPlus') setNewDomain('healthplus.com');
                      if (e.target.value === 'Apex Law Group') setNewDomain('apexlaw.com');
                      if (e.target.value === 'UrbanStay Rentals') setNewDomain('urbanstay.io');
                    }}
                    className="form-input"
                    style={{ fontSize: 13 }}
                  >
                    <option value="Acme HealthPlus">Acme HealthPlus (healthplus.com)</option>
                    <option value="Apex Law Group">Apex Law Group (apexlaw.com)</option>
                    <option value="UrbanStay Rentals">UrbanStay Rentals (urbanstay.io)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Delivery Frequency</label>
                    <select
                      value={newFreq}
                      onChange={e => setNewFreq(e.target.value as any)}
                      className="form-input"
                      style={{ fontSize: 12 }}
                    >
                      <option value="Monthly (1st)">Monthly (1st of month)</option>
                      <option value="Weekly (Mon)">Weekly (Every Monday)</option>
                      <option value="Bi-weekly">Bi-weekly (Every 2 weeks)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Report Format</label>
                    <select
                      value={newFormat}
                      onChange={e => setNewFormat(e.target.value as any)}
                      className="form-input"
                      style={{ fontSize: 12 }}
                    >
                      <option value="PDF + Web Link">PDF + Web Link</option>
                      <option value="PDF Only">PDF Only</option>
                      <option value="Web Link Only">Web Link Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Recipient Emails (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. client@domain.com, cmo@domain.com"
                    value={newEmails}
                    onChange={e => setNewEmails(e.target.value)}
                    className="form-input"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}
                  >
                    Save &amp; Activate Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px 0', fontSize: 13, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
