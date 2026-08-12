'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface IntegrationProps {
  integrations: {
    seranking: boolean;
    gsc: boolean;
    slack: boolean;
    teams: boolean;
    slackWebhookUrl: string;
    teamsWebhookUrl: string;
    agencyId: string;
  };
  domain: string;
}

export default function IntegrationsClient({ integrations, domain }: IntegrationProps) {
  const [isConnectingGSC, setIsConnectingGSC] = useState(false);
  const [selectedGscClient, setSelectedGscClient] = useState('');

  // Slack/Teams webhook state — initialized from DB values
  const [slackUrl, setSlackUrl] = useState(integrations.slackWebhookUrl);
  const [teamsUrl, setTeamsUrl] = useState(integrations.teamsWebhookUrl);
  const [savingSlack, setSavingSlack] = useState(false);
  const [savingTeams, setSavingTeams] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [testingTeams, setTestingTeams] = useState(false);

  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  const handleConnectGSC = () => {
    setIsConnectingGSC(true);
    window.location.href = `/api/integrations/gsc/connect?domain=${domain}`;
  };

  // ── Save Slack Webhook URL ───────────────────────────────────────────────────
  const handleSaveSlack = async () => {
    if (!slackUrl.trim()) { toast.error('Please enter a Slack webhook URL'); return; }
    if (!slackUrl.startsWith('https://hooks.slack.com/')) {
      toast.error('Slack webhook URL must start with https://hooks.slack.com/');
      return;
    }
    setSavingSlack(true);
    const t = toast.loading('Saving Slack webhook...');
    try {
      const res = await fetch('/api/webhooks/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: integrations.agencyId, slackWebhookUrl: slackUrl }),
      });
      if (res.ok) {
        toast.success('✅ Slack webhook saved successfully!', { id: t });
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save', { id: t });
      }
    } catch {
      toast.error('Failed to save Slack webhook', { id: t });
    }
    setSavingSlack(false);
  };

  // ── Test Slack Webhook ───────────────────────────────────────────────────────
  const handleTestSlack = async () => {
    if (!slackUrl) { toast.error('Save a Slack webhook URL first'); return; }
    setTestingSlack(true);
    const t = toast.loading('Sending test Slack alert...');
    try {
      const res = await fetch('/api/webhooks/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: integrations.agencyId, type: 'Test Alert from RankFlow' }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success('✅ Test alert sent! Check your Slack channel.', { id: t });
      } else {
        toast.error(d.message || 'Test failed', { id: t });
      }
    } catch {
      toast.error('Failed to send test alert', { id: t });
    }
    setTestingSlack(false);
  };

  // ── Save Teams Webhook URL ───────────────────────────────────────────────────
  const handleSaveTeams = async () => {
    if (!teamsUrl.trim()) { toast.error('Please enter a Teams webhook URL'); return; }
    if (!teamsUrl.startsWith('https://') || !teamsUrl.includes('webhook')) {
      toast.error('Enter a valid Microsoft Teams incoming webhook URL');
      return;
    }
    setSavingTeams(true);
    const t = toast.loading('Saving Teams webhook...');
    try {
      const res = await fetch('/api/webhooks/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: integrations.agencyId, teamsWebhookUrl: teamsUrl }),
      });
      if (res.ok) {
        toast.success('✅ Teams webhook saved successfully!', { id: t });
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save', { id: t });
      }
    } catch {
      toast.error('Failed to save Teams webhook', { id: t });
    }
    setSavingTeams(false);
  };

  // ── Test Teams Webhook ───────────────────────────────────────────────────────
  const handleTestTeams = async () => {
    if (!teamsUrl) { toast.error('Save a Teams webhook URL first'); return; }
    setTestingTeams(true);
    const t = toast.loading('Sending test Teams alert...');
    try {
      const res = await fetch('/api/webhooks/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: integrations.agencyId, type: 'Test Alert from RankFlow (Teams)' }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success('✅ Test alert sent! Check your Teams channel.', { id: t });
      } else {
        toast.error(d.message || 'Test failed', { id: t });
      }
    } catch {
      toast.error('Failed to send test alert', { id: t });
    }
    setTestingTeams(false);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Integrations &amp; API</h1>
        <p style={{ color: 'var(--text-muted)' }}>Connect third-party services to automate data syncs and white-labeled reports.</p>
      </div>

      {/* SERanking Credit Balance Card */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.08))', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>⚡</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>SERanking API Credit Quota</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-refreshed monthly with your subscription plan</div>
            </div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
            8,400 / 10,000 Credits Left
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #10B981, #6366F1)', borderRadius: '4px' }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>

        {/* ── SE Ranking ──────────────────────────────────────────────────── */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: 800 }}>
              SE
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>SE Ranking</h3>
              <div style={{ fontSize: '13px', color: integrations.seranking ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                {integrations.seranking ? '✓ Connected' : 'Not Connected'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '24px' }}>
            Automatically fetch keyword rankings, technical site audits, and backlink snapshots for your client projects.
          </p>
          <Link
            href={`${basePath}/settings?tab=api-keys`}
            className={`btn ${integrations.seranking ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
          >
            {integrations.seranking ? '⚙️ Manage API Keys & Quota' : 'Connect SE Ranking'}
          </Link>
        </div>

        {/* ── Google Search Console ───────────────────────────────────────── */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Google Search Console</h3>
              <div style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 600 }}>⚙️ OAuth Ready</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
            Pull organic impressions, click-through rates (CTR), and search query performance directly from GSC.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Map GSC Property to Client
            </label>
            <select
              className="form-input"
              value={selectedGscClient}
              onChange={e => setSelectedGscClient(e.target.value)}
              style={{ width: '100%', fontSize: '13px' }}
            >
              <option value="">Select target client...</option>
              <option value="acme">Acme Corp (acmecorp.com)</option>
              <option value="techstart">TechStart.io (techstart.io)</option>
              <option value="bluesky">BlueSky Marketing (bluesky.agency)</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleConnectGSC}
            disabled={isConnectingGSC}
          >
            {isConnectingGSC ? '⏳ Connecting...' : '🔑 Connect GSC Property'}
          </button>
        </div>

        {/* ── Slack Notifications ─────────────────────────────────────────── */}
        <div className="card" style={{ background: 'var(--surface)', border: `1px solid ${slackUrl ? '#10B981' : 'var(--border)'}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#4A154B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 800 }}>
              #
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Slack Notifications</h3>
              <div style={{ fontSize: '13px', color: slackUrl ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                {slackUrl ? '✓ Webhook Configured' : 'Not Connected'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            Receive real-time Slack alerts when monthly PDF reports finish generating, site audits drop below 80%, or clients view their portal.
          </p>

          {/* Webhook URL Input */}
          <div className="form-group" style={{ margin: '0 0 12px 0' }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Incoming Webhook URL</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={slackUrl}
              onChange={e => setSlackUrl(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '11px' }}
            />
            <div className="form-hint">
              Get your webhook URL from Slack Apps → Incoming Webhooks
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSaveSlack}
              disabled={savingSlack}
            >
              {savingSlack ? '⏳ Saving...' : '💾 Save Webhook'}
            </button>
            {slackUrl && (
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={handleTestSlack}
                disabled={testingSlack}
              >
                {testingSlack ? '⏳ Testing...' : '🧪 Send Test'}
              </button>
            )}
          </div>
        </div>

        {/* ── Microsoft Teams Notifications ──────────────────────────────── */}
        <div className="card" style={{ background: 'var(--surface)', border: `1px solid ${teamsUrl ? '#10B981' : 'var(--border)'}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#5059C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'white', fontWeight: 800 }}>
              T
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Microsoft Teams</h3>
              <div style={{ fontSize: '13px', color: teamsUrl ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                {teamsUrl ? '✓ Webhook Configured' : 'Not Connected'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            Send RankFlow alert cards directly to your Microsoft Teams channels when audit scores drop or reports are generated.
          </p>

          {/* Teams Webhook URL Input */}
          <div className="form-group" style={{ margin: '0 0 12px 0' }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Incoming Webhook URL</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://outlook.office.com/webhook/..."
              value={teamsUrl}
              onChange={e => setTeamsUrl(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '11px' }}
            />
            <div className="form-hint">
              Create via Teams → Channel Settings → Connectors → Incoming Webhook
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSaveTeams}
              disabled={savingTeams}
            >
              {savingTeams ? '⏳ Saving...' : '💾 Save Webhook'}
            </button>
            {teamsUrl && (
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={handleTestTeams}
                disabled={testingTeams}
              >
                {testingTeams ? '⏳ Testing...' : '🧪 Send Test'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
