"use client";

import './login.css';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerClient, registerAgency } from '../../actions';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'forgot' | 'verify'>('signin');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const modeParam = searchParams.get('mode');
    const errorParam = searchParams.get('error');

    if (tabParam === 'register' || modeParam === 'signup' || errorParam === 'NoAccount') {
      setActiveTab('register');
    }
    
    if (errorParam === 'NoAccount') {
      setRegError("You don't have an account. Please create one below.");
    } else if (errorParam === 'Configuration') {
      setLoginError("Server configuration error. Please check your database connection or environment variables.");
    } else if (errorParam && errorParam !== 'NoAccount') {
      setLoginError("Authentication failed. Please try again.");
    }
  }, [searchParams]);
  const [selectedRole, setSelectedRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [loginError, setLoginError] = useState(''); // empty string = no error
  const [loading, setLoading] = useState(false);

  // Register State
  const [regAccountType, setRegAccountType] = useState<'agency' | 'client'>('agency');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAgencyName, setRegAgencyName] = useState('');
  const [regSubdomain, setRegSubdomain] = useState('');
  const [regClientName, setRegClientName] = useState('');
  const [regClientDomain, setRegClientDomain] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSent(true);
      } else {
        setForgotError(data.error || 'Something went wrong');
      }
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const payload: any = {
        email: cleanEmail,
        password,
        roleTab: selectedRole,
        redirect: false,
      };

      if (require2FA) {
        payload.totpCode = totpCode;
      }

      const res = await signIn('credentials', payload) as { error?: string; url?: string; ok?: boolean; status?: number } | undefined;

      if (res?.error) {
        let actualError = res.error;
        
        // NextAuth v5 sends our custom error string via the redirect URL when access is denied
        if (res.error === 'AccessDenied' && res.url && res.url.includes('?error=')) {
           try {
             // Extract error from relative URL (e.g., "/login?error=RoleMismatch...")
             const customError = new URL(res.url, window.location.origin).searchParams.get('error');
             if (customError) actualError = customError;
           } catch (e) {}
        }

        if (actualError === '2FA_REQUIRED') {
          setRequire2FA(true);
          setLoginError('');
        } else if (actualError.includes('Too many')) {
          setLoginError(actualError);
        } else if (actualError.includes('RoleMismatch')) {
          setLoginError(actualError.replace('RoleMismatch: ', ''));
        } else if (actualError === 'Configuration') {
          setLoginError('Server configuration error. Please check your database connection or environment variables.');
        } else if (actualError === 'CredentialsSignin' || actualError === 'AccessDenied') {
          setLoginError('Invalid email or password. Please try again.');
        } else {
          setLoginError(actualError || 'Invalid email or password. Please try again.');
        }
        setLoading(false);
      } else {
        window.location.href = '/auth-success';
      }
    } catch (error: any) {
      setLoginError(error?.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match');
      return;
    }

    setLoading(true);

    if (regAccountType === 'agency') {
      const res = await registerAgency({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        agencyName: regAgencyName,
        subdomain: regSubdomain || regAgencyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: regPassword
      });

      if (res.error) {
        setRegError(res.error);
        setLoading(false);
        return;
      }

      const loginRes = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false
      });

      if (!loginRes?.error) {
        const targetSubdomain = regSubdomain || regAgencyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        window.location.href = `/${targetSubdomain}/`;
      } else {
        setActiveTab('signin');
        setLoading(false);
      }
    } else {
      const res = await registerClient({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        companyName: regClientName,
        domain: regClientDomain,
        password: regPassword
      });

      if (res.error) {
        setRegError(res.error);
        setLoading(false);
        return;
      }

      const loginRes = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false
      });

      if (!loginRes?.error) {
        window.location.href = '/client/dashboard';
      } else {
        setActiveTab('signin');
        setLoading(false);
      }
    }
  };

  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    signIn('google', { callbackUrl: '/auth-success' });
  };


  return (
    <>
      <div className="auth-layout">
        <div className="auth-brand-panel">
          <div className="brand-logo">
            <div className="brand-logo-left">
              <div className="brand-icon">RF</div>
              <div>
                <div className="brand-name">RankFlow</div>
                <div className="brand-tagline">SEO Report Automation Platform</div>
              </div>
            </div>
            <div className="platform-status-pill">
              <span className="status-dot"></span> All Systems Operational
            </div>
          </div>

          <div className="brand-hero">
            <div className="brand-badge">⚡ Trusted by 500+ SEO & Digital Marketing Agencies</div>
            <h1 className="brand-hero-title">Automate your<br/><span>SEO reports.</span><br/>Impress every client.</h1>
            <p className="brand-hero-desc">
              Connect SERanking, Google Search Console & GA4 in seconds. RankFlow automatically generates 100% white-labeled PDF and interactive web reports for all your clients on the 1st of every month.
            </p>

            <div className="brand-stats-grid">
              <div className="brand-stat-item">
                <div className="brand-stat-number">500+</div>
                <div className="brand-stat-label">Active Agencies</div>
              </div>
              <div className="brand-stat-item">
                <div className="brand-stat-number">1.2M+</div>
                <div className="brand-stat-label">Reports Delivered</div>
              </div>
              <div className="brand-stat-item">
                <div className="brand-stat-number">99.9%</div>
                <div className="brand-stat-label">Uptime SLA</div>
              </div>
            </div>

            <div className="brand-testimonial">
              <blockquote>&quot;RankFlow cut our monthly reporting time from 8 hours per client to under 15 minutes. Our clients love the interactive web dashboards, and we save over 35 hours every month!&quot;</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SR</div>
                <div>
                  <div className="testimonial-name">Sarah Reynolds</div>
                  <div className="testimonial-role">Founder @ PixelRank Agency (42 Clients)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-integrations">
            <div className="integrations-label">Native Data Integrations</div>
            <div className="integrations-tags">
              <span className="integration-tag">SERanking</span>
              <span className="integration-tag">Google Search Console</span>
              <span className="integration-tag">Google Analytics 4</span>
              <span className="integration-tag">PageSpeed Insights</span>
            </div>
          </div>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">📊</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Automated Data Sync</span>
                Daily SERanking keyword position tracking, backlinks, site health audits & organic search metrics.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">🎨</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">100% White-Label Portals & PDFs</span>
                Custom agency subdomains, custom brand color themes, logo headers, and white-labeled email notifications.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">⚡</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Multi-Client Agency Hub</span>
                Centralized dashboard to monitor client health scores, schedule recurring dispatches, and track client portal views.
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-tabs" id="authTabs">
            <div className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`} onClick={() => setActiveTab('signin')}>Sign In</div>
            <div className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Create Account</div>
          </div>

          {activeTab === 'signin' && (
            <div className="auth-panel active animate-in" id="panelSignin">
              <div className="form-header">
                <div className="form-header-title">Welcome back 👋</div>
                <div className="form-header-desc">Sign in to your agency dashboard</div>
              </div>

              {loginError && (
                <div className="alert alert-danger" id="loginError">
                  ❌ {loginError}
                </div>
              )}

              <form id="loginForm" onSubmit={handleLogin}>
                {!require2FA ? (
                  <>
                    <div className="role-selector" id="loginRoleSelector">
                      <div className={`role-option ${selectedRole === 'agency' ? 'active' : ''}`} onClick={() => setSelectedRole('agency')}>🏢 Agency</div>
                      <div className={`role-option ${selectedRole === 'client' ? 'active' : ''}`} onClick={() => setSelectedRole('client')}>👤 Client</div>
                      <div className={`role-option ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => setSelectedRole('admin')}>🛡️ Admin</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="loginEmail">Email Address</label>
                      <input className="form-input" id="loginEmail" type="email" placeholder="john@agency.com" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="loginPassword">
                        Password
                        <a className="link" style={{float: 'right', fontSize: '12px', fontWeight: '500'}} onClick={() => setActiveTab('forgot')}>Forgot password?</a>
                      </label>
                      <div className="input-with-icon">
                        <input className="form-input" id="loginPassword" type={showPassword ? "text" : "password"} placeholder="••••••••••" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁"}</button>
                      </div>
                    </div>
                    <div className="checkbox-row mb-4">
                      <input type="checkbox" id="rememberMe" defaultChecked/>
                      <label htmlFor="rememberMe">Remember me for 30 days</label>
                    </div>
                  </>
                ) : (
                  <div className="form-group mb-4" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Enter the 6-digit code from your authenticator app.</div>
                    <input className="form-input" id="totpCode" type="text" placeholder="123456" maxLength={6} required value={totpCode} onChange={e => setTotpCode(e.target.value)} style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center', padding: '12px 16px', fontWeight: 800 }} />
                    <button type="button" className="link btn-ghost mt-4" style={{ fontSize: 12 }} onClick={() => setRequire2FA(false)}>← Back to login</button>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" id="loginBtn" disabled={loading || (require2FA && totpCode.length !== 6)}>
                  <span>{loading ? "Signing in..." : (require2FA ? "Verify 2FA" : "Sign In")}</span>
                </button>
              </form>

              {/* Demo credentials box */}
              <div style={{ marginTop: 18, background: 'linear-gradient(135deg, #EBF2FF, #F0F6FF)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4F8EF7', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>🔑 Demo Credentials</div>
                {[
                  { role: '🛡 Super Admin', email: 'superadmin@rankflow.app', pass: 'admin@123', color: '#DC2626', tab: 'admin' },
                  { role: '🏢 Agency Admin', email: 'demo@rankflow.app', pass: 'demo123', color: '#2563EB', tab: 'agency' },
                  { role: '👤 Client (Acme)', email: 'client@acme.com', pass: 'client123', color: '#059669', tab: 'client' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(79,142,247,0.12)' : 'none', gap: 10, cursor: 'pointer' }}
                    onClick={() => {
                      setEmail(c.email);
                      setPassword(c.pass);
                      setSelectedRole(c.tab);
                    }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A2E' }}>{c.role}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{c.email}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'white', border: `1px solid ${c.color}22`, color: c.color, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {c.pass} ↗
                    </span>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 8 }}>Click any row to auto-fill credentials</div>
              </div>

              <div className="divider">or continue with</div>
              <a href="#" onClick={handleGoogle} className="btn btn-google">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </a>

              <div className="form-footer">
                No account? <span className="link" onClick={() => setActiveTab('register')}>Sign up free</span>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="auth-panel active animate-in" id="panelRegister">
              <div className="form-header">
                <div className="form-header-title">Create your account 🚀</div>
                <div className="form-header-desc">Choose account type to get started</div>
              </div>

              {/* Account Type Selector */}
              <div className="role-selector" style={{ marginBottom: '20px' }}>
                <div className={`role-option ${regAccountType === 'agency' ? 'active' : ''}`} onClick={() => setRegAccountType('agency')}>
                  🏢 Agency Workspace
                </div>
                <div className={`role-option ${regAccountType === 'client' ? 'active' : ''}`} onClick={() => setRegAccountType('client')}>
                  👤 Client Portal
                </div>
              </div>

              {regError && (
                <div className="alert alert-danger" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 600 }}>❌ {regError}</div>
                  {regError.toLowerCase().includes('email') && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(regEmail);
                          setPassword(regPassword);
                          setActiveTab('signin');
                          setRegError('');
                        }}
                        style={{
                          background: '#2563EB',
                          color: 'white',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '4px'
                        }}
                      >
                        🔑 Sign in with {regEmail} →
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form id="registerForm" onSubmit={handleRegister}>
                <div className="form-row mb-4">
                  <div className="form-group" style={{marginBottom: '0'}}>
                    <label className="form-label" htmlFor="firstName">First Name <span className="req">*</span></label>
                    <input className="form-input" id="firstName" type="text" placeholder="John" required value={regFirstName} onChange={e => setRegFirstName(e.target.value)}/>
                  </div>
                  <div className="form-group" style={{marginBottom: '0'}}>
                    <label className="form-label" htmlFor="lastName">Last Name <span className="req">*</span></label>
                    <input className="form-input" id="lastName" type="text" placeholder="Doe" required value={regLastName} onChange={e => setRegLastName(e.target.value)}/>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="workEmail">Work Email <span className="req">*</span></label>
                  <input className="form-input" id="workEmail" type="email" placeholder="john@company.com" required value={regEmail} onChange={e => setRegEmail(e.target.value)}/>
                </div>

                {regAccountType === 'agency' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="agencyName">Agency Name <span className="req">*</span></label>
                      <input className="form-input" id="agencyName" type="text" placeholder="Apex Digital Marketing" required value={regAgencyName} onChange={e => {
                        setRegAgencyName(e.target.value);
                        if (!regSubdomain) {
                          setRegSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                        }
                      }}/>
                      <div className="form-hint">Your SEO / Digital Marketing agency brand</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="subdomain">Agency Subdomain <span className="req">*</span></label>
                      <div className="subdomain-group">
                        <input className="form-input" id="subdomain" type="text" placeholder="apex" value={regSubdomain} onChange={e => setRegSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required/>
                        <div className="subdomain-suffix">.rankflow.app</div>
                      </div>
                      <div className="form-hint">Your dedicated white-labeled portal URL</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="clientName">Company Name <span className="req">*</span></label>
                      <input className="form-input" id="clientName" type="text" placeholder="Acme Corp" required value={regClientName} onChange={e => {
                        setRegClientName(e.target.value);
                        if (!regClientDomain) {
                          setRegClientDomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
                        }
                      }}/>
                      <div className="form-hint">Your company or organization name</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="clientDomain">Website Domain <span className="req">*</span></label>
                      <input className="form-input" id="clientDomain" type="text" placeholder="acmecorp.com" value={regClientDomain} onChange={e => setRegClientDomain(e.target.value)} required/>
                      <div className="form-hint">Your domain name to access SEO reports</div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="regPassword">Password <span className="req">*</span></label>
                  <div className="input-with-icon">
                    <input className="form-input" id="regPassword" type={showRegPassword ? "text" : "password"} placeholder="Min. 8 characters" required value={regPassword} onChange={e => setRegPassword(e.target.value)}/>
                    <button type="button" className="input-icon-btn" onClick={() => setShowRegPassword(!showRegPassword)}>{showRegPassword ? "🙈" : "👁"}</button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPwd">Confirm Password <span className="req">*</span></label>
                  <input className="form-input" id="confirmPwd" type="password" placeholder="••••••••••" required value={regConfirm} onChange={e => setRegConfirm(e.target.value)}/>
                </div>

                <div className="form-group">
                  <div className="checkbox-row mb-3">
                    <input type="checkbox" id="agreeTerms" required/>
                    <label htmlFor="agreeTerms">I agree to the <a href="#" className="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a></label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : (regAccountType === 'agency' ? 'Create Agency Workspace →' : 'Create Client Account →')}
                </button>
              </form>

              <div className="divider" style={{ marginTop: '24px' }}>or sign up with</div>
              <a href="#" onClick={handleGoogle} className="btn btn-google mb-4">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </a>

              <div className="form-footer">
                Already have an account? <span className="link" onClick={() => setActiveTab('signin')}>Sign in</span>
              </div>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="auth-panel active animate-in" id="panelForgot">
              <div style={{fontSize: '36px', marginBottom: '12px'}}>🔑</div>
              <div className="form-header">
                <div className="form-header-title">Forgot password?</div>
                <div className="form-header-desc">Enter your email and we&apos;ll send a reset link</div>
              </div>

              {forgotSent ? (
                <div>
                  <div className="alert alert-success" style={{marginBottom: '16px'}}>
                    ✅ Reset link sent! Check your inbox (and spam folder).
                  </div>
                  <button className="btn btn-primary mb-3 w-full" onClick={() => window.open('https://mail.google.com', '_blank')}>Open Gmail →</button>
                  <div className="text-center"><span className="link btn-ghost" onClick={() => { setForgotSent(false); setActiveTab('signin'); }}>← Back to sign in</span></div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  {forgotError && (
                    <div className="alert alert-danger" style={{marginBottom: '16px'}}>❌ {forgotError}</div>
                  )}
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgotEmail">Email Address</label>
                    <input
                      className="form-input"
                      id="forgotEmail"
                      type="email"
                      placeholder="john@agency.com"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mb-3" disabled={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="text-center"><span className="link btn-ghost" onClick={() => setActiveTab('signin')}>← Back to login</span></div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="auth-panel active animate-in" id="panelVerify">
              <div className="success-panel">
                <div className="success-icon">📧</div>
                <div className="success-title">Check your inbox</div>
                <div className="success-desc">We&apos;ve sent a verification link. Click the link to activate your account.</div>
                <div className="alert alert-success mb-4">✅ Verification email sent! Check your spam folder if you don&apos;t see it.</div>
                <button className="btn btn-primary mb-3" onClick={() => window.open('https://mail.google.com', '_blank')}>Open Gmail →</button>
              </div>

              <div className="form-footer">
                Wrong email? <span className="link" onClick={() => setActiveTab('register')}>Change email address</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}