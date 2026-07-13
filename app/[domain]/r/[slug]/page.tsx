'use client';

import { useState, use } from 'react';
import { toast } from 'sonner';

export default function PublicReportView({ params }: { params: Promise<{ domain: string, slug: string }> }) {
  const resolvedParams = use(params);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');

  const unlockReport = () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    if (password === 'password') {
      setIsLocked(false);
      toast.success('Report unlocked successfully!');
    } else {
      toast.error('Incorrect password');
    }
  };

  if (isLocked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '20px' }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '28px', background: 'var(--primary)', borderRadius: '4px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
            AGENCY LOGO
          </div>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Password Protected Report</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            This SEO report requires a password. Please enter the password provided by your agency.
          </div>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlockReport()}
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={unlockReport}>
            View Report →
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
            Report: Acme Corp · May 2024 · Digital Horizons Agency
          </div>
        </div>
        
        {/* Placeholder for Expired State to match wireframes conceptually */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--danger)', borderRadius: '10px', padding: '24px', maxWidth: '400px', width: '100%', textAlign: 'center', marginTop: '20px', opacity: 0.5 }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger)', marginBottom: '8px' }}>Link Expired</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>This report link expired on September 29, 2024. Please contact Digital Horizons Agency for a new link.</div>
          <button className="btn btn-secondary btn-sm">📧 Contact Agency</button>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>(Variant — shown when link expires)</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Unlocked Header */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '80px', height: '28px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
          AGENCY LOGO
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Monthly SEO Report — Acme Corp</div>
          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>May 2024 · Prepared by Digital Horizons Agency</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} onClick={() => toast.info('Downloading PDF...')}>📥 Download PDF</button>
          <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} onClick={() => toast.success('Link copied to clipboard!')}>📋 Copy Link</button>
          <button className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} onClick={() => window.print()}>🖨 Print</button>
        </div>
      </div>

      {/* Unlocked Content */}
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Sessions</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>8,420</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +16.3%</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Top 10 KW</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>47</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +4</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Backlinks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>1,847</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +47</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Health</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>76%</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>↑ +8pts</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Full Report Content Rendering Here</div>
          <div style={{ fontSize: '12px' }}>← Content identical to agency and client portal views (all sections) →</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          Prepared by Digital Horizons Agency · Confidential · Link expires Sep 29, 2024
        </div>
      </div>
    </div>
  );
}
