'use client';

import { toast } from 'sonner';

export function Topbar() {
  return (
    <header className="topbar">
      <div style={{ flex: '1' }}>
        <div className="topbar-title">Dashboard</div>
      </div>
      <div className="topbar-actions">
        <button className="date-range-btn" onClick={() => toast.info('Date picker opened')}>
          📅 Jun 2026 vs May 2026 ▾
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => toast.loading('Syncing all clients...', { duration: 2000 })}>
          🔄 Sync All
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => toast.success('Report generation started')}>
          ＋ Generate Report
        </button>
        <div className="relative">
          <button className="topbar-icon-btn">
            🔔
            <span className="notif-dot"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
