'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { getClients } from '@/app/actions';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';

// Mock data used as fallback while loading or if no data
const mockClientsData = [
  { id: '1', name: 'Acme Corp', website: 'acmecorp.com', health: 76, initials: 'AC', color: '#4F46E5', lastReport: 'Jun 1', nextReport: 'Jul 1', status: 'active' },
];

export default function ClientsPage({ params }: { params: Promise<{ domain: string }> }) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<any[]>(mockClientsData);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  const fetchClients = () => {
    getClients(domain).then(data => {
      if (data && data.length > 0) setClients(data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchClients();
  }, [domain]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClients(clients.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">Manage your agency&apos;s clients and their SEO projects</div>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>📥 Import CSV</button>
          <Link href={domain === 'localhost' ? `/localhost/clients/new` : `/clients/new`} className="btn btn-primary">＋ Add Client</Link>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedClients.length > 0 && (
        <div className="bulk-action-bar" style={{ display: 'flex' }}>
          <div style={{fontWeight: 600}}>{selectedClients.length} clients selected</div>
          <div style={{display: 'flex', gap: '8px'}}>
            <button className="btn btn-sm btn-white" onClick={() => alert('Generate reports for selected')}>📄 Generate Reports</button>
            <button className="btn btn-sm btn-white" onClick={() => alert('Pause sync for selected')}>⏸ Pause Sync</button>
            <button className="btn btn-sm btn-white" style={{color: 'var(--danger)'}} onClick={() => alert('Delete selected')}>🗑 Delete</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div style={{position: 'relative', width: '280px'}}>
          <span style={{position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)'}}>🔍</span>
          <input type="text" className="form-input" placeholder="Search clients..." style={{paddingLeft: '34px'}} />
        </div>
        <select className="form-input" style={{width: '140px'}}>
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="needs-report">Needs Report</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="form-input" style={{width: '150px'}}>
          <option>Sort: Name A–Z</option>
          <option>Health: High–Low</option>
          <option>Traffic: High–Low</option>
          <option>Last Report</option>
        </select>
        <div style={{display: 'flex'}}>
          <button className={`view-toggle-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>≡ Table</button>
          <button className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>⊞ Cards</button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="table-wrapper">
          <table id="clientsTable">
            <thead>
              <tr>
                <th style={{width: '36px'}}>
                  <input type="checkbox" style={{accentColor: 'var(--primary)'}} checked={selectedClients.length > 0 && selectedClients.length === clients.length} onChange={handleSelectAll} />
                </th>
                <th>Client</th>
                <th>Website</th>
                <th>Health Score</th>
                <th>Last Report</th>
                <th>Next Report</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} data-status={client.status}>
                  <td>
                    <input type="checkbox" className="row-checkbox" style={{accentColor: 'var(--primary)'}} checked={selectedClients.includes(client.id)} onChange={() => handleSelect(client.id)} />
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div className="client-avatar" style={{background: client.color}}>{client.initials}</div>
                      <div>
                        <div style={{fontWeight: 700}}>{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize: '12px', color: 'var(--text-muted)'}}>{client.website}</td>
                  <td>
                    {client.health !== null ? (
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <div className="progress-bar" style={{width: '60px', margin: 0}}>
                          <div className={`progress-fill ${client.health > 70 ? 'success' : 'warning'}`} style={{width: `${client.health}%`}}></div>
                        </div>
                        <span style={{fontSize: '12px', fontWeight: 600, color: client.health > 70 ? 'var(--success)' : 'var(--warning)'}}>{client.health}%</span>
                      </div>
                    ) : (
                      <span className="badge badge-neutral">No data</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${client.lastReport === 'Never' ? 'badge-neutral' : (client.status === 'needs-report' ? 'badge-warning' : 'badge-success')}`}>{client.lastReport}</span>
                  </td>
                  <td style={{fontSize: '12px', color: client.status === 'needs-report' ? 'var(--danger)' : 'inherit', fontWeight: client.status === 'needs-report' ? 600 : 400}}>
                    {client.nextReport}
                  </td>
                  <td>
                    <span className={`badge ${client.status === 'active' ? 'badge-success' : (client.status === 'inactive' ? 'badge-neutral' : 'badge-warning')}`}>
                      {client.status === 'needs-report' ? '⚠ Needs Report' : (client.status === 'active' ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                      <Link href={domain === 'localhost' ? `/localhost/clients/${client.id}` : `/clients/${client.id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="row-menu-btn" title="More actions">⋯</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="grid-3">
          {clients.map(client => (
            <div className="client-card" key={client.id}>
              <div className="client-card-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className="client-avatar" style={{background: client.color}}>{client.initials}</div>
                  <div>
                    <div style={{fontWeight: 700, fontSize: '15px'}}>{client.name}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{client.website}</div>
                  </div>
                </div>
                <button className="row-menu-btn">⋯</button>
              </div>
              
              <div className="client-card-stats">
                <div className="client-card-stat">
                  <div className="client-card-stat-val">{client.health !== null ? `${client.health}%` : '--'}</div>
                  <div className="client-card-stat-lbl">Health</div>
                </div>
                <div style={{width: '1px', background: 'var(--border)'}}></div>
                <div className="client-card-stat">
                  <div className="client-card-stat-val">12</div>
                  <div className="client-card-stat-lbl">Top 10</div>
                </div>
                <div style={{width: '1px', background: 'var(--border)'}}></div>
                <div className="client-card-stat">
                  <div className="client-card-stat-val">4.2k</div>
                  <div className="client-card-stat-lbl">Traffic</div>
                </div>
              </div>
              
              <div className="client-card-footer">
                <div>
                  <div style={{fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px'}}>Next Report</div>
                  <div style={{fontSize: '12px', fontWeight: 600, color: client.status === 'needs-report' ? 'var(--danger)' : 'inherit'}}>{client.nextReport}</div>
                </div>
                <Link href={domain === 'localhost' ? `/localhost/clients/${client.id}` : `/clients/${client.id}`} className="btn btn-secondary btn-sm">View Details</Link>
              </div>
            </div>
          ))}
        </div>
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
