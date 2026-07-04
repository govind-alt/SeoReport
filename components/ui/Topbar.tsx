'use client';

import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';

export function Topbar() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Jun 2026 vs May 2026');

  // Close dropdowns when clicking outside
  const topbarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topbarRef.current && !topbarRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar" ref={topbarRef}>
      <div style={{ flex: '1' }}>
        <div className="topbar-title">Dashboard</div>
      </div>
      <div className="topbar-actions">
        <div className="relative">
          <button className="date-range-btn" onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsNotifOpen(false); }}>
            📅 {selectedRange} ▾
          </button>
          
          {isDatePickerOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, width: '240px', padding: '8px', animation: 'popUp 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Range</div>
              {[
                'Jun 2026 vs May 2026',
                'Last 30 Days',
                'Last 3 Months',
                'Year to Date'
              ].map(range => (
                <button 
                  key={range}
                  onClick={() => { setSelectedRange(range); setIsDatePickerOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: selectedRange === range ? 'var(--gray-50)' : 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: selectedRange === range ? 600 : 500, cursor: 'pointer' }}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => toast.loading('Syncing all clients...', { duration: 2000 })}>
          🔄 Sync All
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => toast.success('Report generation started')}>
          ＋ Generate Report
        </button>
        <div className="relative">
          <button className="topbar-icon-btn" onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDatePickerOpen(false); }}>
            🔔
            <span className="notif-dot"></span>
          </button>
          
          {isNotifOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, width: '320px', animation: 'popUp 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px' }}>Notifications</strong>
                <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setIsNotifOpen(false)}>Mark all read</span>
              </div>
              <div style={{ padding: '8px' }}>
                <div style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderRadius: '8px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: '18px' }}>✅</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Acme Corp Report Generated</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>The PDF report is ready to download.</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>10 mins ago</div>
                  </div>
                </div>
                <div style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderRadius: '8px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: '18px' }}>🔄</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Daily Sync Completed</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>SERanking data for 24 clients synced.</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>2 hours ago</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                View all notifications
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
