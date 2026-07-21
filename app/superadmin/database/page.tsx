'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TABLES = [
  'user', 'agency', 'client', 'report', 'reportTemplate', 
  'reportSection', 'billingSubscription', 'invoice', 'invite', 'googleCredential'
];

export default function DatabaseExplorer() {
  const router = useRouter();
  const [activeTable, setActiveTable] = useState('agency');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Superadmin Topbar */}
      <header style={{ background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '14px' }}>SA</div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>RankFlow Superadmin</span>
          </div>
          <nav style={{ display: 'flex', gap: '8px' }}>
            <Link href="/superadmin" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link href="/superadmin/database" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              Database Explorer
            </Link>
          </nav>
        </div>
        <Link href="/" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Back to App ↗</Link>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ width: '240px', background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '24px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Prisma Models
          </div>
          {TABLES.map(table => (
            <button
              key={table}
              onClick={() => {
                setActiveTable(table);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 20px',
                textAlign: 'left',
                background: activeTable === table ? 'var(--primary-light)' : 'transparent',
                color: activeTable === table ? 'var(--primary)' : 'var(--text)',
                border: 'none',
                borderRight: activeTable === table ? '3px solid var(--primary)' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: activeTable === table ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{activeTable === table ? '📂' : '📁'}</span> {table}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{activeTable}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Showing {data.length} records • Page {page} of {totalPages || 1} • Total: {totalCount}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
              </button>
              <button className="btn btn-primary btn-sm" onClick={fetchTableData}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading data...
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              No records found in table <strong>{activeTable}</strong>.
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      {Object.entries(row).map(([k, v], i) => (
                        <td key={i} style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v === null ? (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>
                          ) : typeof v === 'boolean' ? (
                            <span style={{ color: v ? '#10B981' : '#EF4444' }}>{v ? 'true' : 'false'}</span>
                          ) : typeof v === 'object' ? (
                            <span style={{ color: '#8B5CF6' }}>{JSON.stringify(v)}</span>
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
    </div>
  );
}
