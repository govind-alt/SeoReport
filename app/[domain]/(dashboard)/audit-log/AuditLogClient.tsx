'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { updateAuditLog, deleteAuditLog, resolveAuditLog } from '@/app/actions';

type Log = {
  id: string;
  action: string;
  userName: string;
  userInitials: string;
  ipAddress: string | null;
  createdAt: string;
};

const AVATAR_COLORS = ['#6366F1','#10B981','#3B82F6','#F59E0B','#EC4899','#8B5CF6','#14B8A6'];

function getColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActionCategory(action: string): { color: string; bg: string; label: string } {
  const a = action.toLowerCase();
  if (a.includes('[resolved]')) return { color: '#10B981', bg: 'rgba(16,185,129,0.18)', label: 'RESOLVED' };
  if (a.includes('delet') || a.includes('remov')) return { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'DELETE' };
  if (a.includes('invit') || a.includes('creat') || a.includes('generat')) return { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'CREATE' };
  if (a.includes('updat') || a.includes('edit') || a.includes('save') || a.includes('chang')) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'UPDATE' };
  if (a.includes('login') || a.includes('sign') || a.includes('auth')) return { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'AUTH' };
  return { color: '#6366F1', bg: 'rgba(99,102,241,0.12)', label: 'ACTION' };
}

export default function AuditLogClient({ logs: initialLogs, agencyName }: { logs: Log[]; agencyName: string }) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Edit Modal State
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [editActionText, setEditActionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const domain = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'localhost' : 'localhost';

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.userName.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === 'all') return true;
      const cat = getActionCategory(l.action).label.toLowerCase();
      return cat === filter;
    });
  }, [logs, search, filter]);

  // Handlers
  const handleResolve = async (logId: string) => {
    const t = toast.loading('Marking event as resolved...');
    try {
      await resolveAuditLog(domain, logId);
      setLogs(prev => prev.map(l => {
        if (l.id === logId) {
          const resolvedAction = l.action.includes('[RESOLVED]') ? l.action : `[RESOLVED] ${l.action}`;
          return { ...l, action: resolvedAction };
        }
        return l;
      }));
      toast.success('Event marked as resolved!', { id: t });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to resolve event', { id: t });
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    const t = toast.loading('Deleting log entry...');
    try {
      await deleteAuditLog(domain, logId);
      setLogs(prev => prev.filter(l => l.id !== logId));
      toast.success('Log entry deleted!', { id: t });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete log entry', { id: t });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !editActionText.trim()) return;
    setIsUpdating(true);
    const t = toast.loading('Updating log entry...');
    try {
      await updateAuditLog(domain, editingLog.id, editActionText.trim());
      setLogs(prev => prev.map(l => l.id === editingLog.id ? { ...l, action: editActionText.trim() } : l));
      toast.success('Log entry updated!', { id: t });
      setEditingLog(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update log entry', { id: t });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Audit Log</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete activity history for <strong>{agencyName}</strong>. Showing last 200 events.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Live — updates on each action
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search actions or users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px' }}>
          {['all', 'create', 'update', 'delete', 'resolved', 'auth'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--primary)' : 'none',
                border: 'none', color: filter === f ? 'white' : 'var(--text-muted)',
                padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit', transition: 'all 0.2s'
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Events', value: logs.length, color: '#6366F1' },
          { label: 'Creates', value: logs.filter(l => getActionCategory(l.action).label === 'CREATE').length, color: '#10B981' },
          { label: 'Updates', value: logs.filter(l => getActionCategory(l.action).label === 'UPDATE').length, color: '#F59E0B' },
          { label: 'Resolved', value: logs.filter(l => getActionCategory(l.action).label === 'RESOLVED').length, color: '#10B981' },
          { label: 'Deletes', value: logs.filter(l => getActionCategory(l.action).label === 'DELETE').length, color: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 6, height: 36, borderRadius: '3px', background: stat.color }} />
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Timeline */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          {['Action', 'Performed By', 'IP Address', 'When', 'Management'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: h === 'Management' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No matching events found</div>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filtered.map((log) => {
              const cat = getActionCategory(log.action);
              const isResolved = cat.label === 'RESOLVED';

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 1fr', gap: '16px',
                    padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s', alignItems: 'center'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: cat.bg, color: cat.color, fontSize: '10px', fontWeight: 800, padding: '3px 7px', borderRadius: '5px', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: '13px', color: isResolved ? '#10B981' : 'var(--text-primary)', fontWeight: 500 }}>
                      {log.action}
                    </span>
                  </div>

                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: getColor(log.userName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {log.userInitials}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{log.userName}</span>
                  </div>

                  {/* IP */}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {log.ipAddress || '—'}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }} suppressHydrationWarning>
                    {timeAgo(log.createdAt)}
                  </div>

                  {/* Management Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {!isResolved && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                        title="Mark as resolved"
                        onClick={() => handleResolve(log.id)}
                      >
                        ✓ Resolve
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }}
                      title="Edit event text"
                      onClick={() => {
                        setEditingLog(log);
                        setEditActionText(log.action);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '11px', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                      title="Delete log entry"
                      onClick={() => handleDelete(log.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Log Modal */}
      {editingLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>✏️ Edit Audit Log Entry</div>
              <button onClick={() => setEditingLog(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Action Description</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)' }}
                  value={editActionText}
                  onChange={e => setEditActionText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingLog(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
