"use client";

import '../login.css';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ClientLogin() {
  const [activeTab, setActiveTab] = useState<'signin' | 'request' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Request access state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqCompany, setReqCompany] = useState('');
  const [reqSent, setReqSent] = useState(false);

  useEffect(() => {
    // Override browser password manager autofill pass
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
      setReqEmail('');
      setReqName('');
      setReqCompany('');
    }, 150);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback' || errorParam === 'OAuthCreateAccount') {
          setLoginError('Google OAuth Error: Please check GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env and ensure Authorized Redirect URIs match http://localhost:3000/api/auth/callback/google');
        } else if (errorParam === 'CredentialsSignin') {
          setLoginError('Invalid client credentials. Please try again.');
        } else if (errorParam === 'AccessDenied') {
          setLoginError('Access denied. Your account does not have permission to view this portal.');
        }
      }
    }
    return () => clearTimeout(timer);
  }, []);


  // ── Resolve the correct redirect URL for client dashboard ──────────────────
  const buildClientDashboardUrl = (): string => {
    if (typeof window === 'undefined') return '/c/dashboard';
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    // On localhost, path-based routing: /[domain]/c/dashboard
    // On production subdomain: /c/dashboard (subdomain handles tenant)
    if (isLocal) {
      // Try to extract domain slug from current path, e.g. /digital-horizons/c/...
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const domainSlug = pathParts[0] && !['login', 'register', 'c', 'r'].includes(pathParts[0])
        ? pathParts[0]
        : 'localhost';
      return `http://localhost${port}/${domainSlug}/c/dashboard`;
    }
    return '/c/dashboard';
  };

  // ── Sign In ──────────────────────────────────────────────────────────────────
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
        setLoginError('Invalid email or password. Please check your credentials and try again.');
        setLoading(false);
      } else {
        // Verify this user is actually a client role
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const role = session?.user?.role;

        if (role === 'admin' || role === 'superadmin') {
          // Agency admin accidentally used client portal — redirect them to their dashboard
          const slug = session?.user?.agencyId;
          window.location.href = '/login';
          return;
        }

        window.location.href = buildClientDashboardUrl();
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    const callbackUrl = buildClientDashboardUrl();
    signIn('google', { callbackUrl });
  };

  // ── Forgot Password ──────────────────────────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await signIn('nodemailer', { email: forgotEmail.trim().toLowerCase(), redirect: false });
      setForgotSent(true);
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    }
    setLoading(false);
  };

  // ── Request Access ───────────────────────────────────────────────────────────
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail.trim() || !reqName.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName, email: reqEmail, company: reqCompany }),
      });
      setReqSent(true);
      toast.success('Access request sent! Your agency will be notified.');
    } catch {
      toast.error('Failed to send request. Please try again.');
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
              <div className="brand-tagline">Client SEO Portal</div>
            </div>
          </div>

          <div className="brand-hero">
            <h1 className="brand-hero-title">Your SEO<br/><span>performance,</span><br/>crystal clear.</h1>
            <p className="brand-hero-desc">Access your personalised monthly SEO reports, keyword rankings, site health scores, and analytics — all in one secure client portal.</p>

            <div className="brand-testimonial" style={{marginTop: '32px'}}>
              <blockquote>&quot;I love being able to log in and see exactly where my keywords are ranking each month. The reports are beautiful and easy to understand.&quot;</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MR</div>
                <div>
                  <div className="testimonial-name">Marcus Rodriguez</div>
                  <div className="testimonial-role">CEO, Acme E-Commerce</div>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">📊</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Monthly PDF Reports</span>
                Beautiful white-label SEO reports delivered automatically every month.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">📈</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Live Keyword Rankings</span>
                Track your position in Google for every target keyword in real time.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">🔒</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Secure Private Portal</span>
                Your data is encrypted and completely private to you.
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Panel ───────────────────────────────────────────────────── */}
        <div className="auth-form-panel">
          <div className="auth-tabs" id="authTabs">
            <div
              className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >Sign In</div>
            <div
              className={`auth-tab ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
            >Request Access</div>
          </div>

          {/* ── Sign In Panel ─────────────────────────── */}
          {activeTab === 'signin' && (
            <div className="auth-panel active animate-in" id="panelSignin">
              <div className="form-header">
                <div className="form-header-title">Client Portal Login 🔑</div>
                <div className="form-header-desc">Access your agency&apos;s SEO reports and analytics</div>
              </div>

              {loginError && (
                <div className="alert alert-danger" id="loginError">
                  ❌ {loginError}
                </div>
              )}

              <form id="loginForm" onSubmit={handleLogin} autoComplete="on">
                {/* Role selector — client is highlighted */}
                <div className="role-selector" id="loginRoleSelector">
                  <Link href="/login" className="role-option" style={{ textDecoration: 'none' }}>🏢 Agency Admin</Link>
                  <Link href="/login/client" className="role-option active" style={{ textDecoration: 'none' }}>👤 Agency Client</Link>
                  <Link href="/login/admin" className="role-option" style={{ textDecoration: 'none' }}>🛡️ Superadmin</Link>
                </div>

                {/* Quick fill for demo */}
                <div style={{ background: 'rgba(255,30,66,0.08)', border: '1px solid rgba(255,30,66,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#FF1E42', fontWeight: 600 }}>⚡ Demo Client Credentials</div>
                  <button
                    type="button"
                    style={{ background: '#FF1E42', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      setEmail('john@acmestore.com');
                      setPassword('Password123!');
                    }}
                  >
                    Auto Fill ⚡
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="clientEmail">Email Address</label>
                  <input
                    className="form-input"
                    id="clientEmail"
                    name="email"
                    type="email"
                    placeholder="you@yourcompany.com"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="clientPassword">
                    Password
                    <button
                      type="button"
                      style={{ float: 'right', fontSize: '12px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)' }}
                      onClick={() => setActiveTab('forgot')}
                    >
                      Forgot password?
                    </button>
                  </label>
                  <div className="input-with-icon">
                    <input
                      className="form-input"
                      id="clientPassword"
                      name="client_secret_field"
                      type="text"
                      style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as any}
                      placeholder="Enter your password"
                      autoComplete="off"
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
                  <label htmlFor="rememberMe">Remember me for 30 days</label>
                </div>

                <button type="submit" className="btn btn-primary" id="loginBtn" disabled={loading}>
                  <span>{loading ? 'Signing in...' : 'Access My Portal →'}</span>
                </button>
              </form>

              <div className="divider">or continue with</div>
              <a href="#" onClick={handleGoogle} className="btn btn-google">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </a>

              <div className="form-footer">
                Not a client yet? <span className="link" onClick={() => setActiveTab('request')} style={{ cursor: 'pointer' }}>Request portal access →</span>
              </div>
            </div>
          )}

          {/* ── Request Access Panel ────────────────────────────────────── */}
          {activeTab === 'request' && (
            <div className="auth-panel active animate-in" id="panelRequest">
              {reqSent ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                  <div className="form-header-title" style={{ marginBottom: '12px' }}>Request Sent!</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                    Your agency has been notified. They&apos;ll send you login credentials or a magic link shortly.
                  </div>
                  <button className="btn btn-secondary" onClick={() => { setReqSent(false); setActiveTab('signin'); }}>
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-header">
                    <div className="form-header-title">Request Portal Access 🚀</div>
                    <div className="form-header-desc">Your agency will receive a notification and send you login credentials</div>
                  </div>

                  <form onSubmit={handleRequestAccess} autoComplete="off">
                    <div className="form-group">
                      <label className="form-label" htmlFor="reqName">Your Full Name <span className="req">*</span></label>
                      <input
                        className="form-input"
                        id="reqName"
                        type="text"
                        placeholder="John Smith"
                        required
                        value={reqName}
                        onChange={e => setReqName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reqEmail">Your Email <span className="req">*</span></label>
                      <input
                        className="form-input"
                        id="reqEmail"
                        type="email"
                        placeholder="john@yourcompany.com"
                        required
                        value={reqEmail}
                        onChange={e => setReqEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reqCompany">Company Name</label>
                      <input
                        className="form-input"
                        id="reqCompany"
                        type="text"
                        placeholder="Acme Corp"
                        value={reqCompany}
                        onChange={e => setReqCompany(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Sending...' : 'Request Portal Access →'}
                    </button>
                  </form>

                  <div className="form-footer">
                    Already have credentials? <span className="link" onClick={() => setActiveTab('signin')} style={{ cursor: 'pointer' }}>Sign in →</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Forgot Password Panel ──────────────────────────────────── */}
          {activeTab === 'forgot' && (
            <div className="auth-panel active animate-in" id="panelForgot">
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔑</div>
              <div className="form-header">
                <div className="form-header-title">Forgot password?</div>
                <div className="form-header-desc">Enter your email and we&apos;ll send a magic link to sign in</div>
              </div>

              {forgotSent ? (
                <div>
                  <div className="alert alert-success mb-4">✅ Magic link sent! Check your inbox (and spam folder).</div>
                  <div className="text-center">
                    <span className="link btn-ghost" style={{ cursor: 'pointer' }} onClick={() => { setForgotSent(false); setActiveTab('signin'); }}>
                      ← Back to login
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgotEmail">Email Address</label>
                    <input
                      className="form-input"
                      id="forgotEmail"
                      type="email"
                      placeholder="you@yourcompany.com"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mb-3" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </button>
                  <div className="text-center">
                    <span className="link btn-ghost" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('signin')}>
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