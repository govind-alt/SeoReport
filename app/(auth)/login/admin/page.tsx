"use client";

import '../login.css';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { registerAgency } from '@/app/actions';
import Link from 'next/link';


export default function Login() {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'forgot' | 'verify'>('signin');
  const [selectedRole, setSelectedRole] = useState('agency');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAgency, setRegAgency] = useState('');
  const [regSubdomain, setRegSubdomain] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');

  const getSubdomainUrl = (subdomain: string) => {
    const isLocal = window.location.hostname.includes('localhost');
    const port = window.location.port ? `:${window.location.port}` : '';
    if (isLocal) {
      return `http://${subdomain}.localhost${port}`;
    }
    return `https://${subdomain}.rankflow.app`; // Production domain
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(false);
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      if (res?.error) {
        setLoginError(true);
        setLoading(false);
      } else {
        // If login successful, we would ideally know their subdomain. 
        // For prototype, we'll just go to root and let middleware handle it if they are already on a subdomain,
        // or go to 'demo.localhost:3000' if they login from root.
        const isLocal = window.location.hostname === 'localhost';
        if (isLocal) {
          window.location.href = '/superadmin'; // Admin dashboard
        } else {
          window.location.href = '/superadmin'; 
        }
      }
    } catch (error) {
      setLoginError(true);
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

    const res = await registerAgency({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      agencyName: regAgency,
      subdomain: regSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      password: regPassword
    });

    if (res.error) {
      setRegError(res.error);
      setLoading(false);
      return;
    }

    // Success! Log them in automatically
    const loginRes = await signIn('credentials', {
      email: regEmail,
      password: regPassword,
      redirect: false
    });

    if (!loginRes?.error) {
      // Redirect to their new subdomain
      window.location.href = getSubdomainUrl(regSubdomain);
    } else {
      setActiveTab('signin');
      setLoading(false);
    }
  };

  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    signIn('google', { callbackUrl: '/localhost' });
  };

  return (
    <>
      <div className="auth-layout">
        <div className="auth-brand-panel">
          <div className="brand-logo">
            <div className="brand-icon">RF</div>
            <div>
              <div className="brand-name">RankFlow</div>
              <div className="brand-tagline">SEO Report Automation</div>
            </div>
          </div>

          <div className="brand-hero">
            <h1 className="brand-hero-title">Automate your<br/><span>SEO reports.</span><br/>Impress every client.</h1>
            <p className="brand-hero-desc">RankFlow pulls data from SERanking and generates beautiful, branded monthly SEO reports — automatically. Save hours every month.</p>

            <div className="brand-testimonial" style={{marginTop: '32px'}}>
              <blockquote>&quot;RankFlow cut our reporting time from 8 hours to 20 minutes per client. Our clients love the reports, and we love the extra time.&quot;</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SR</div>
                <div>
                  <div className="testimonial-name">Sarah Reynolds</div>
                  <div className="testimonial-role">Founder, PixelRank Agency</div>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">📊</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Automated Data Sync</span>
                Daily SERanking sync — rankings, backlinks, audits, and GSC data all in one place.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">🎨</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">White-Label Reports</span>
                Fully branded PDF reports with your logo and colors — clients never see RankFlow.
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">⚡</div>
              <div className="brand-feature-text">
                <span className="brand-feature-title">Multi-Client Dashboard</span>
                Manage all clients, track health scores, and generate reports from one dashboard.
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
                <div className="form-header-desc">Sign in to your superadmin dashboard</div>
              </div>

              {loginError && (
                <div className="alert alert-danger" id="loginError">
                  ❌ Invalid email or password. Please try again.
                </div>
              )}

              <form id="loginForm" onSubmit={handleLogin}>
                <div className="role-selector" id="loginRoleSelector">
                  <Link href="/login" className="role-option" style={{ textDecoration: 'none' }}>🏢 Agency Admin</Link>
                  <Link href="/login/client" className="role-option" style={{ textDecoration: 'none' }}>👤 Agency Client</Link>
                  <Link href="/login/admin" className="role-option active" style={{ textDecoration: 'none' }}>🛡️ Superadmin</Link>
                </div>

                {/* 1-Click Quick Fill Credentials for Testing */}
                <div style={{ background: 'rgba(0, 173, 181, 0.1)', border: '1px solid rgba(0, 173, 181, 0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#00ADB5', fontWeight: 600 }}>⚡ Demo Superadmin Credentials</div>
                  <button
                    type="button"
                    style={{ background: '#00ADB5', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      setEmail('superadmin@rankflow.app');
                      setPassword('Password123!');
                    }}
                  >
                    Auto Fill ⚡
                  </button>
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
                <button type="submit" className="btn btn-primary" id="loginBtn" disabled={loading}>
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                </button>
              </form>

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
                <div className="form-header-title">Start for free 🚀</div>
                <div className="form-header-desc">14-day trial, no credit card required</div>
              </div>

              {regError && (
                <div className="alert alert-danger" style={{marginBottom: '16px'}}>
                  ❌ {regError}
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
                  <input className="form-input" id="workEmail" type="email" placeholder="john@youragency.com" required value={regEmail} onChange={e => setRegEmail(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="agencyName">Agency Name <span className="req">*</span></label>
                  <input className="form-input" id="agencyName" type="text" placeholder="Digital Horizons Agency" required value={regAgency} onChange={e => {
                    setRegAgency(e.target.value);
                    if (!regSubdomain) {
                      setRegSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}/>
                  <div className="form-hint">Shown on all client reports</div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="subdomain">Agency Subdomain <span className="req">*</span></label>
                  <div className="subdomain-group">
                    <input className="form-input success" id="subdomain" type="text" placeholder="digital-horizons" value={regSubdomain} onChange={e => setRegSubdomain(e.target.value)} required/>
                    <div className="subdomain-suffix">.rankflow.app</div>
                  </div>
                  {regSubdomain && <div className="form-hint" style={{color: 'var(--success)'}}>✓ Dashboard will be: {regSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '')}.rankflow.app</div>}
                </div>
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
                  {loading ? 'Creating Account...' : 'Create Agency Account →'}
                </button>
              </form>

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

              <div className="forgot-state active" id="forgotRequest">
                <div className="form-group">
                  <label className="form-label" htmlFor="forgotEmail">Email Address</label>
                  <input className="form-input" id="forgotEmail" type="email" placeholder="john@agency.com"/>
                </div>
                <button className="btn btn-primary mb-3">Send Reset Link</button>
                <div className="text-center"><span className="link btn-ghost" onClick={() => setActiveTab('signin')}>← Back to login</span></div>
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="auth-panel active animate-in" id="panelVerify">
              <div className="success-panel">
                <div className="success-icon">📧</div>
                <div className="success-title">Check your inbox</div>
                <div className="success-desc">We&apos;ve sent a verification link. Click the link to activate your account.</div>
                <div className="alert alert-success mb-4">✅ Verification email sent! Check your spam folder if you don&apos;t see it.</div>
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary mb-3" style={{ textDecoration: 'none', display: 'inline-block' }}>Open Gmail →</a>
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