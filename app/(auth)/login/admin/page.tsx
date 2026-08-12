"use client";

import '../login.css';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [activePanel, setActivePanel] = useState<'signin' | 'forgot'>('signin');

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback' || errorParam === 'OAuthCreateAccount') {
          setLoginError('Google OAuth Error: Please verify GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env and ensure http://localhost:3000/api/auth/callback/google is registered in Google Cloud Console.');
        } else if (errorParam === 'CredentialsSignin') {
          setLoginError('Invalid superadmin credentials. Access denied.');
        } else if (errorParam === 'AccessDenied') {
          setLoginError('Access denied. Superadmin role required.');
        }
      }
    }
  }, []);


  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoginError('Invalid superadmin credentials. Access denied.');
        setLoading(false);
      } else {
        // Verify the user actually has superadmin role
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const role = (session?.user?.role as string)?.toLowerCase();

        if (role === 'superadmin') {
          window.location.href = '/superadmin';
        } else if (role === 'admin' || role === 'member') {
          // Agency admin accidentally used superadmin login — redirect to their dashboard
          window.location.href = '/login';
        } else {
          setLoginError('Access denied. This portal is for Superadmins only.');
          setLoading(false);
        }
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn('nodemailer', { email: forgotEmail.trim().toLowerCase(), redirect: false });
      setForgotSent(true);
    } catch {
      setLoginError('Failed to send reset link. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-layout">
        {/* ── Brand Panel ──────────────────────────────────────────────────── */}
        <div className="auth-brand-panel">
          <div className="brand-logo">
            <div className="brand-icon">RF</div>
            <div>
              <div className="brand-name">RankFlow</div>
              <div className="brand-tagline">Platform Administration</div>
            </div>
          </div>

          <div className="brand-hero">
            <h1 className="brand-hero-title">Platform<br/><span>Control Center.</span><br/>Complete oversight.</h1>
            <p className="brand-hero-desc">
              Full system access: manage all agencies, impersonate accounts, control billing plans, view audit logs, and oversee the entire RankFlow platform.
            </p>

            <div style={{
              marginTop: '32px',
              background: 'rgba(255, 30, 66, 0.08)',
              border: '1px solid rgba(255, 30, 66, 0.25)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FF1E42', marginBottom: '12px' }}>🛡️ Superadmin Capabilities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Manage all agencies & subscriptions', 'Impersonate any agency dashboard', 'View platform-wide analytics', 'Control billing & plan upgrades', 'Full audit log access'].map(cap => (
                  <div key={cap} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#FF1E42' }}>✓</span> {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Panel ───────────────────────────────────────────────────── */}
        <div className="auth-form-panel">
          {/* No tab bar — superadmin only has sign-in. No self-registration allowed. */}

          {/* ── Sign In Panel ─────────────────────────── */}
          {activePanel === 'signin' && (
            <div className="auth-panel active animate-in" id="panelSignin">
              <div className="form-header">
                <div className="form-header-title">Superadmin Access 🛡️</div>
                <div className="form-header-desc">Restricted to platform administrators only</div>
              </div>

              {loginError && (
                <div className="alert alert-danger" id="loginError">
                  ❌ {loginError}
                </div>
              )}

              <form id="loginForm" onSubmit={handleLogin} autoComplete="on">
                {/* Role selector — superadmin is highlighted */}
                <div className="role-selector" id="loginRoleSelector">
                  <Link href="/login" className="role-option" style={{ textDecoration: 'none' }}>🏢 Agency Admin</Link>
                  <Link href="/login/client" className="role-option" style={{ textDecoration: 'none' }}>👤 Agency Client</Link>
                  <Link href="/login/admin" className="role-option active" style={{ textDecoration: 'none' }}>🛡️ Superadmin</Link>
                </div>

                {/* Quick fill for demo */}
                <div style={{ background: 'rgba(255,30,66,0.08)', border: '1px solid rgba(255,30,66,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#FF1E42', fontWeight: 600 }}>⚡ Demo Superadmin Credentials</div>
                  <button
                    type="button"
                    style={{ background: '#FF1E42', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      setEmail('superadmin@rankflow.app');
                      setPassword('Password123!');
                    }}
                  >
                    Auto Fill ⚡
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminEmail">Email Address</label>
                  <input
                    className="form-input"
                    id="adminEmail"
                    name="email"
                    type="email"
                    placeholder="superadmin@rankflow.app"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminPassword">
                    Password
                    <button
                      type="button"
                      style={{ float: 'right', fontSize: '12px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)' }}
                      onClick={() => setActivePanel('forgot')}
                    >
                      Forgot password?
                    </button>
                  </label>
                  <div className="input-with-icon">
                    <input
                      className="form-input"
                      id="adminPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" className="input-icon-btn" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="checkbox-row mb-4">
                  <input type="checkbox" id="rememberMe" defaultChecked />
                  <label htmlFor="rememberMe">Keep me signed in</label>
                </div>

                <button type="submit" className="btn btn-primary" id="loginBtn" disabled={loading}>
                  <span>{loading ? 'Verifying...' : '🛡️ Enter Control Center'}</span>
                </button>
              </form>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255,30,66,0.05)',
                border: '1px solid rgba(255,30,66,0.15)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                🔒 This is a restricted area. All access attempts are logged and monitored.
              </div>

              <div className="form-footer">
                Are you an Agency? <Link href="/login" className="link" style={{ textDecoration: 'none' }}>Agency Admin Login →</Link>
              </div>
            </div>
          )}

          {/* ── Forgot Password Panel ──────────────────────────────────── */}
          {activePanel === 'forgot' && (
            <div className="auth-panel active animate-in" id="panelForgot">
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔑</div>
              <div className="form-header">
                <div className="form-header-title">Reset Superadmin Password</div>
                <div className="form-header-desc">Enter your admin email — a magic sign-in link will be sent</div>
              </div>

              {forgotSent ? (
                <div>
                  <div className="alert alert-success mb-4">✅ Reset link sent! Check your admin inbox.</div>
                  <div className="text-center">
                    <span className="link btn-ghost" style={{ cursor: 'pointer' }} onClick={() => { setForgotSent(false); setActivePanel('signin'); }}>
                      ← Back to login
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgotAdminEmail">Admin Email Address</label>
                    <input
                      className="form-input"
                      id="forgotAdminEmail"
                      type="email"
                      placeholder="superadmin@rankflow.app"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mb-3" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <span className="link btn-ghost" style={{ cursor: 'pointer' }} onClick={() => setActivePanel('signin')}>
                      ← Back to login
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}