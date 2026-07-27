'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

const TABLES = [
  'agency', 'user', 'client', 'report', 'reportTemplate', 
  'reportSection', 'billingSubscription', 'invoice', 'invite',
  'googleCredential', 'auditSnapshot', 'keywordSnapshot',
  'analyticsSnapshot', 'backlinkSnapshot', 'auditLog'
];

export default function DatabaseExplorer() {
  const [activeTable, setActiveTable] = useState('agency');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  // Edit / Insert Modal State
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [insertFormData, setInsertFormData] = useState<Record<string, any>>({});

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`/api/superadmin/database?table=${activeTable}&limit=${limit}&offset=${offset}`);
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to fetch table data');
      }
      
      const result = await res.json();
      setData(result.rows);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, limit]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Filtered rows by search query
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      )
    );
  }, [data, search]);

  const handleExportCsv = () => {
    if (data.length === 0) return toast.error('No data to export');
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => 
      Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankflow-db-${activeTable}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success(`Exported ${data.length} records to CSV!`);
  };

  const handleExportJson = () => {
    if (data.length === 0) return toast.error('No data to export');
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankflow-db-${activeTable}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success(`Exported ${data.length} records to JSON!`);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm(`Are you sure you want to delete record ${id} from table "${activeTable}"? THIS CANNOT BE UNDONE.`)) return;

    const t = toast.loading(`Deleting record ${id}...`);
    try {
      const res = await fetch('/api/superadmin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: activeTable, id })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete record');
      }

      toast.success('Record deleted successfully!', { id: t });
      setData(prev => prev.filter(r => r.id !== id));
      setTotalCount(c => Math.max(0, c - 1));
    } catch (err: any) {
      toast.error(err.message || 'Delete failed', { id: t });
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    setSaving(true);
    const t = toast.loading('Saving record updates...');

    try {
      const res = await fetch('/api/superadmin/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: activeTable, id: editingRow.id, data: editFormData })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to save update');
      }

      const result = await res.json();
      toast.success('Record updated successfully!', { id: t });
      setData(prev => prev.map(r => r.id === editingRow.id ? { ...r, ...result.row } : r));
      setEditingRow(null);
    } catch (err: any) {
      toast.error(err.message || 'Update failed', { id: t });
    } finally {
      setSaving(false);
    }
  };

  const handleInsertSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const t = toast.loading(`Inserting record into ${activeTable}...`);

    try {
      const res = await fetch('/api/superadmin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: activeTable, data: insertFormData })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to insert record');
      }

      const result = await res.json();
      toast.success('New record inserted successfully!', { id: t });
      setData(prev => [result.row, ...prev]);
      setTotalCount(c => c + 1);
      setIsInsertModalOpen(false);
      setInsertFormData({});
    } catch (err: any) {
      toast.error(err.message || 'Insertion failed', { id: t });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#222831', color: '#EEEEEE', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Topbar Header */}
      <header style={{ background: '#1A1E24', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #00ADB5, #007A80)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', boxShadow: '0 4px 14px rgba(0,173,181,0.35)' }}>SA</div>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>RankFlow <span style={{ opacity: 0.6, fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>DATABASE EXPLORER</span></span>
          </div>
          <nav style={{ display: 'flex', gap: '8px' }}>
            <Link href="/superadmin" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Superadmin Dashboard
            </Link>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={handleExportCsv}>📥 Export CSV</button>
          <button className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={handleExportJson}>📄 Export JSON</button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar Model Selector */}
        <div style={{ width: '260px', background: '#1A1E24', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            PRISMA DATA MODELS ({TABLES.length})
          </div>
          {TABLES.map(table => (
            <button
              key={table}
              onClick={() => {
                setActiveTable(table);
                setPage(1);
                setSearch('');
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                textAlign: 'left',
                background: activeTable === table ? 'rgba(0, 173, 181, 0.18)' : 'transparent',
                color: activeTable === table ? '#00ADB5' : 'rgba(255,255,255,0.7)',
                border: 'none',
                borderRight: activeTable === table ? '3px solid #00ADB5' : '3px solid transparent',
                fontSize: '13px',
                fontWeight: activeTable === table ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{activeTable === table ? '📂' : '📁'}</span>
                <span>{table}</span>
              </div>
              {activeTable === table && (
                <span style={{ background: '#00ADB5', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>{totalCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px', textTransform: 'capitalize' }}>{activeTable}</h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                Showing {filteredData.length} of {totalCount} records • Page {page} of {totalPages || 1}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '240px', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', fontSize: '13px' }}
              />

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (data.length > 0) {
                    const sample = { ...data[0] };
                    delete sample.id;
                    delete sample.createdAt;
                    delete sample.updatedAt;
                    setInsertFormData(sample);
                  } else {
                    setInsertFormData({ name: '', slug: '' });
                  }
                  setIsInsertModalOpen(true);
                }}
              >
                ＋ Insert Record
              </button>

              <button className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                Previous
              </button>
              <button className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages || loading}>
                Next
              </button>
              <button className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={fetchTableData}>
                🔄 Refresh
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
              Loading data from <strong>{activeTable}</strong>...
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              No matching records found in table <strong>{activeTable}</strong>.
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: '120px' }}>ACTIONS</th>
                    {Object.keys(filteredData[0]).map(key => (
                      <th key={key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)', color: '#818CF8' }}
                            onClick={() => {
                              setEditingRow(row);
                              setEditFormData({ ...row });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {row.id && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '2px 8px', fontSize: '11px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                              onClick={() => handleDeleteRecord(row.id)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                      {Object.entries(row).map(([k, v], i) => (
                        <td key={i} style={{ padding: '12px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.85)' }}>
                          {v === null ? (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>null</span>
                          ) : typeof v === 'boolean' ? (
                            <span style={{ color: v ? '#10B981' : '#EF4444', fontWeight: 700 }}>{v ? 'true' : 'false'}</span>
                          ) : typeof v === 'object' ? (
                            <span style={{ color: '#8B5CF6', fontSize: '11px', fontFamily: 'monospace' }}>{JSON.stringify(v)}</span>
                          ) : (
                            String(v)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRow && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>✏️ Edit Record ({activeTable})</h3>
              <button onClick={() => setEditingRow(null)} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.45)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleEditSave}>
              {Object.keys(editFormData).map(key => {
                if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return null;
                const val = editFormData[key];
                if (typeof val === 'object' && val !== null) return null;

                return (
                  <div key={key} className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{key}</label>
                    {typeof val === 'boolean' ? (
                      <select
                        className="form-input"
                        value={val ? 'true' : 'false'}
                        onChange={e => setEditFormData(prev => ({ ...prev, [key]: e.target.value === 'true' }))}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px' }}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input
                        className="form-input"
                        value={val ?? ''}
                        onChange={e => setEditFormData(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px' }}
                      />
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRow(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save Record Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insert Record Modal */}
      {isInsertModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.95)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>＋ Insert Record into {activeTable}</h3>
              <button onClick={() => setIsInsertModalOpen(false)} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.45)', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleInsertSave}>
              {Object.keys(insertFormData).map(key => {
                if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return null;

                return (
                  <div key={key} className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{key}</label>
                    <input
                      className="form-input"
                      value={insertFormData[key] ?? ''}
                      onChange={e => setInsertFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px' }}
                    />
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsInsertModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Inserting...' : '＋ Insert Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
