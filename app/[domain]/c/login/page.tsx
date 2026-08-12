'use client';

import { useState, useEffect, use } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function ClientLoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Override browser password manager autofill pass
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 150);

    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const err = p.get('error');
      if (err) {
        if (err === 'OAuthSignin' || err === 'OAuthCallback') {
          setError('Google OAuth Error: Please check GOOGLE_CLIENT_ID in .env and redirect URIs in Google Cloud Console.');
        } else if (err === 'CredentialsSignin') {
          setError('Invalid email or password.');
        }
      }
    }
    return () => clearTimeout(timer);
  }, []);


  /**
   * Build the correct client dashboard URL after successful login.
   * On localhost: /{domain}/c/dashboard  (path-based routing)
   * On production subdomain: /c/dashboard  (host handles tenant)
   */
  const buildDashboardUrl = () => {
    if (typeof window === 'undefined') return '/c/dashboard';
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
      return `http://localhost${port}/${domain}/c/dashboard`;
    }
    return '/c/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (usePassword) {
        const res = await signIn('credentials', {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (res?.error) {
          setError('Invalid email or password. Please try again.');
          setLoading(false);
        } else {
          toast.success('Logged in! Redirecting to your portal...');
          // Small delay to let session cookie set
          await new Promise(r => setTimeout(r, 300));
          window.location.href = buildDashboardUrl();
        }
      } else {
        const res = await signIn('nodemailer', {
          email: email.trim().toLowerCase(),
          redirect: false,
          callbackUrl: buildDashboardUrl(),
        });

        if (res?.error) {
          setError('Failed to send login link. Please check your email and try again.');
        } else {
          setSubmitted(true);
          toast.success('Magic link sent! Check your email (or terminal in dev mode).');
        }
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', background: 'var(--primary)',
            borderRadius: '16px', fontSize: '28px', marginBottom: '16px'
          }}>🔑</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Client Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Access your personalised SEO reports and analytics from <strong>{domain}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: '28px', border: '1px solid var(--border)' }}>
          {/* Auth method selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', padding: '2px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setUsePassword(true); setSubmitted(false); setError(''); }}
              style={{
                flex: 1, padding: '8px', border: 'none',
                background: usePassword ? 'var(--primary)' : 'transparent',
                color: usePassword ? 'white' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s'
              }}
            >
              🔒 Password
            </button>
            <button
              type="button"
              onClick={() => { setUsePassword(false); setSubmitted(false); setError(''); }}
              style={{
                flex: 1, padding: '8px', border: 'none',
                background: !usePassword ? 'var(--primary)' : 'transparent',
                color: !usePassword ? 'white' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s'
              }}
            >
              ✉️ Magic Link
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              ❌ {error}
            </div>
          )}

          {/* Success state (magic link sent) */}
          {submitted && !usePassword ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Check your inbox</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                We&apos;ve sent a magic link to <strong>{email}</strong>. Check your email or terminal console logs (dev mode).
              </p>
              <button className="btn btn-secondary" style={{ marginTop: '24px', width: '100%' }} onClick={() => { setSubmitted(false); setError(''); }}>
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              {usePassword && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px', marginTop: '4px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : usePassword ? 'Access My Portal →' : 'Send Magic Link →'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Not a client? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Agency Admin Login →</a>
        </div>
      </div>
    </div>
  );
}
