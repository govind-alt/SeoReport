'use client';

export function Topbar() {
  return (
    <header className="topbar">
      <div style={{ flex: '1' }}>
        <div className="topbar-title">Dashboard</div>
      </div>
      <div className="topbar-actions">
        <button className="date-range-btn" onClick={() => alert('Date picker opened')}>
          📅 Jun 2026 vs May 2026 ▾
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => alert('Syncing all clients...')}>
          🔄 Sync All
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => alert('Generate report')}>
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
