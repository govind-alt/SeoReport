'use client';

import { useState, use, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getClients, deleteClient } from '@/app/actions';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';

export default function ClientsPage({ params }: { params: Promise<{ domain: string }> }) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  const fetchClients = async () => {
    try {
      const data = await getClients(domain);
      setClients(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [domain]);

  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.website?.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'health') result.sort((a, b) => (b.health || 0) - (a.health || 0));
    return result;
  }, [clients, search, statusFilter, sortBy]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClients(e.target.checked ? filteredClients.map(c => c.id) : []);
  };
  const handleSelect = (id: string) => {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Delete "${clientName}"? This cannot be undone.`)) return;
    try {
      await deleteClient(domain, clientId);
      toast.success(`${clientName} deleted`);
      fetchClients();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete client');
    }
  };

  const healthColor = (h: number) => h >= 80 ? 'var(--success)' : h >= 60 ? '#F59E0B' : 'var(--danger)';
  const healthClass = (h: number) => h >= 80 ? 'success' : h >= 60 ? 'warning' : 'danger';

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} clients · {clients.filter(c => c.status === 'active').length} active</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>📥 Import CSV</button>
          <Link href={`/${domain}/clients/new`} className="btn btn-primary">＋ Add Client</Link>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedClients.length > 0 && (
        <div className="bulk-action-bar" style={{ display: 'flex' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedClients.length} selected</div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <button className="btn btn-sm btn-secondary">📄 Generate Reports</button>
            <button className="btn btn-sm btn-secondary" style={{ color: 'var(--danger)' }}>🗑 Delete</button>
          </div>
          <button className="bulk-clear" onClick={() => setSelectedClients([])}>×</button>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search clients..."
            style={{ paddingLeft: '34px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="needs-report">Needs Report</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="form-input" style={{ width: '170px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="health">Health: High–Low</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0' }}>
          <button
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: '1.5px solid var(--border)', borderRight: 'none', background: view === 'table' ? 'var(--primary)' : 'var(--surface)', color: view === 'table' ? 'white' : 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px 0 0 8px', transition: 'all 0.15s' }}
            onClick={() => setView('table')}
          >≡ Table</button>
          <button
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: '1.5px solid var(--border)', background: view === 'grid' ? 'var(--primary)' : 'var(--surface)', color: view === 'grid' ? 'white' : 'var(--text-muted)', cursor: 'pointer', borderRadius: '0 8px 8px 0', transition: 'all 0.15s' }}
            onClick={() => setView('grid')}
          >⊞ Cards</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
          <div>Loading clients...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">{search ? 'No clients found' : 'No clients yet'}</div>
          <div className="empty-state-desc">{search ? `No clients match "${search}". Try a different search.` : 'Add your first client to get started tracking SEO performance.'}</div>
          {!search && <Link href={`/${domain}/clients/new`} className="btn btn-primary">＋ Add First Client</Link>}
        </div>
      ) : (
        <>
          {/* TABLE VIEW */}
          {view === 'table' && (
            <div className="table-wrapper">
              <div className="table-header">
                <div className="table-title">All Clients <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>({filteredClients.length})</span></div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--primary)' }} checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} onChange={handleSelectAll} />
                    </th>
                    <th>Client</th>
                    <th>Industry</th>
                    <th>Health Score</th>
                    <th>Last Report</th>
                    <th>Next Report</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id}>
                      <td><input type="checkbox" style={{ accentColor: 'var(--primary)' }} checked={selectedClients.includes(client.id)} onChange={() => handleSelect(client.id)} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="client-avatar" style={{ background: client.color }}>{client.initials}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{client.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.website}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <span style={{ background: 'var(--gray-100)', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>{client.industry || '—'}</span>
                      </td>
                      <td>
                        {client.health !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar" style={{ width: '56px', margin: 0 }}>
                              <div className={`progress-fill ${healthClass(client.health)}`} style={{ width: `${client.health}%` }}></div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: healthColor(client.health) }}>{client.health}%</span>
                          </div>
                        ) : <span className="badge badge-neutral">No data</span>}
                      </td>
                      <td>
                        <span className={`badge ${client.lastReport === 'Never' ? 'badge-neutral' : 'badge-success'}`}>{client.lastReport}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client.nextReport}</td>
                      <td>
                        <span className="badge badge-success"><span className="badge-dot"></span>Active</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Link href={`/${domain}/clients/${client.id}`} className="btn btn-secondary btn-sm">View</Link>
                          <button className="btn btn-sm" style={{ color: 'var(--danger)', border: '1px solid var(--border)' }} onClick={() => handleDelete(client.id, client.name)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">
                <span>Showing {filteredClients.length} of {clients.length} clients</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{clients.filter(c => (c.health || 0) >= 80).length} excellent · {clients.filter(c => (c.health || 0) < 70).length} need attention</span>
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {view === 'grid' && (
            <div className="clients-grid">
              {filteredClients.map(client => (
                <div className="client-card" key={client.id}>
                  <div className="client-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="client-avatar" style={{ background: client.color, width: '40px', height: '40px', borderRadius: '12px', fontSize: '13px' }}>{client.initials}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{client.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.website}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: client.health !== null ? healthColor(client.health) : 'var(--text-muted)' }}>{client.health !== null ? `${client.health}%` : '--'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Health</div>
                    </div>
                  </div>
                  {client.health !== null && (
                    <div style={{ padding: '0 18px 12px' }}>
                      <div className="progress-bar" style={{ margin: 0 }}>
                        <div className={`progress-fill ${healthClass(client.health)}`} style={{ width: `${client.health}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="client-card-stats">
                    <div className="client-card-stat">
                      <div className="client-card-stat-val">{client.industry ? client.industry.split(' ')[0] : '—'}</div>
                      <div className="client-card-stat-lbl">Industry</div>
                    </div>
                    <div className="client-card-stat">
                      <div className="client-card-stat-val" style={{ color: 'var(--success)', fontSize: '14px' }}>{client.lastReport}</div>
                      <div className="client-card-stat-lbl">Last Report</div>
                    </div>
                    <div className="client-card-stat">
                      <div className="client-card-stat-val" style={{ fontSize: '14px' }}>{client.nextReport}</div>
                      <div className="client-card-stat-lbl">Next Due</div>
                    </div>
                  </div>
                  <div className="client-card-footer">
                    <span className="badge badge-success"><span className="badge-dot"></span>Active</span>
                    <Link href={`/${domain}/clients/${client.id}`} className="btn btn-primary btn-sm">View Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        domain={domain}
        onClientsAdded={fetchClients}
      />
    </>
  );
}
