'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function IntegrationsClient({ integrations, domain }: { integrations: any, domain: string }) {
  const [isConnectingGSC, setIsConnectingGSC] = useState(false);
  const [isConnectingSlack, setIsConnectingSlack] = useState(false);

  const handleConnectGSC = () => {
    setIsConnectingGSC(true);
    // Redirect to Google OAuth — will come back to /api/auth/google/callback
    window.location.href = `/api/integrations/gsc/connect?domain=${domain}`;
  };

  const handleConnectSlack = () => {
    setIsConnectingSlack(true);
    const t = toast.loading('Redirecting to Slack...');
    setTimeout(() => {
      toast.error('Slack integration requires a Slack App configuration. See docs.', { id: t });
      setIsConnectingSlack(false);
    }, 1200);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Integrations & API</h1>
        <p style={{ color: 'var(--text-muted)' }}>Connect third-party services to automate your workflow and fetch data.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* SE Ranking */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>
              SE
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>SE Ranking</h3>
              <div style={{ fontSize: '13px', color: integrations.seranking ? '#10B981' : 'var(--text-muted)' }}>
                {integrations.seranking ? 'Connected' : 'Not Connected'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '24px' }}>
            Automatically fetch keyword rankings, site audits, and backlink data for your clients.
          </p>
          <button className={`btn ${integrations.seranking ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%' }}>
            {integrations.seranking ? 'Manage API Key' : 'Connect SE Ranking'}
          </button>
        </div>

        {/* Google Search Console */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Google Search Console</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not Connected</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '24px' }}>
            Pull in actual impressions, clicks, and average position data directly from Google.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConnectGSC} disabled={isConnectingGSC}>
            {isConnectingGSC ? 'Redirecting...' : 'Sign in with Google'}
          </button>
        </div>

        {/* Slack Notifications */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#4A154B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>
              #
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Slack Notifications</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Not Connected</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '24px' }}>
            Get alerts when new reports are generated, payments succeed, or clients view their dashboard.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConnectSlack} disabled={isConnectingSlack}>
            {isConnectingSlack ? 'Redirecting...' : 'Add to Slack'}
          </button>
        </div>

      </div>
    </div>
  );
}
