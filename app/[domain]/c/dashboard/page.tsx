'use client';

import { toast } from 'sonner';

export default function ClientDashboardPage() {
  return (
    <div style={{ minHeight: '560px', background: 'var(--bg)' }}>
      {/* Branded header */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '80px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
          AGENCY LOGO
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toast.info('Opening user profile...')}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
              SM
            </div>
            <span>Sarah Miller</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => toast.info('Opening account settings...')}>⚙ My Account</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => toast.success('Signed out!')}>Sign Out</div>
        </div>
      </div>
      
      <div style={{ padding: '32px 24px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Your SEO Performance Dashboard 📊</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Acme Corp · acmecorp.com</div>
            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>Showing: May 2024 data (last updated Jun 1, 2024)</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => window.open('mailto:agency@example.com')}>
            📧 Contact Digital Horizons Agency
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Top 10 Keywords</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>47</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +4 this month</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Organic Sessions</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>8,420</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +16.3%</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Site Health</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>76%</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +8 pts</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Backlinks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>1,847</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +47 new</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Traffic Trend — Last 6 Months</div>
          <div style={{ height: '140px', background: 'var(--bg-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none" style={{ display: 'block' }}>
               <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points="0,100 100,90 200,80 300,60 400,45 500,25 600,10" />
               <text x="10" y="115" fill="var(--text-muted)" fontSize="11">Jan</text>
               <text x="100" y="115" fill="var(--text-muted)" fontSize="11">Feb</text>
               <text x="200" y="115" fill="var(--text-muted)" fontSize="11">Mar</text>
               <text x="300" y="115" fill="var(--text-muted)" fontSize="11">Apr</text>
               <text x="400" y="115" fill="var(--text-muted)" fontSize="11">May</text>
               <text x="500" y="115" fill="var(--text-muted)" fontSize="11">Jun</text>
             </svg>
          </div>
        </div>

        <div className="table-wrapper">
          <div className="table-header"><div className="table-title">Your Reports</div></div>
          <table>
            <thead>
              <tr><th>Period</th><th>Type</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>May 2024</strong></td>
                <td>Monthly</td>
                <td><span className="badge badge-success">✅ Ready</span></td>
                <td>Jun 1, 2024</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Opening report view...')}>👁 View</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Downloading PDF...')}>📥 PDF</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>April 2024</strong></td>
                <td>Monthly</td>
                <td><span className="badge badge-success">✅ Ready</span></td>
                <td>May 1, 2024</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Opening report view...')}>👁 View</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Downloading PDF...')}>📥 PDF</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Powered by Digital Horizons Agency · <a href="#" style={{ color: 'var(--primary)' }}>📧 Contact us</a> · <a href="#" style={{ color: 'var(--primary)' }}>⚙ My Account</a>
        </div>
      </div>
    </div>
  );
}
