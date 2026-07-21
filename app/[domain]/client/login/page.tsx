'use client';

import { useState, use, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function ClientLoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please check your credentials.');
        setLoading(false);
      } else {
        window.location.href = `http://${window.location.host}/client/dashboard`;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const host = window.location.host;
    await signIn('google', {
      callbackUrl: `http://${host}/client/dashboard`,
    });
  };

  const autofillDemo = () => {
    setEmail('client@acme.com');
    setPassword('client123');
    setError('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body { height: 100%; }

        .cl-page {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0a0f;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* ── LEFT PANEL ── */
        .cl-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          background: linear-gradient(145deg, #0a0c14 0%, #16213e 50%, #0a0c14 100%);
          position: relative;
          overflow: hidden;
        }

        .cl-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 700px 700px at -10% 50%, rgba(79,142,247,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 110% 80%, rgba(37,99,235,0.10) 0%, transparent 55%);
          pointer-events: none;
        }

        .cl-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,142,247,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,142,247,0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        /* Floating particles */
        .cl-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: cl-float linear infinite;
          opacity: 0;
        }
        @keyframes cl-float {
          0% { opacity: 0; transform: translateY(100%) scale(0); }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-120vh) scale(1.2); }
        }

        .cl-left-brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cl-logo-mark {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #4f8ef7, #2563eb);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
          color: #fff;
          letter-spacing: -1px;
          box-shadow: 0 4px 20px rgba(79,142,247,0.5);
          flex-shrink: 0;
        }

        .cl-logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.4px;
        }

        .cl-logo-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
          margin-top: 1px;
        }

        .cl-hero {
          position: relative;
          z-index: 1;
        }

        .cl-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(79,142,247,0.12);
          border: 1px solid rgba(79,142,247,0.3);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(79,142,247,0.9);
          margin-bottom: 20px;
          letter-spacing: 0.3px;
        }

        .cl-hero-title {
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin-bottom: 18px;
        }

        .cl-hero-title span {
          background: linear-gradient(135deg, #4f8ef7, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cl-hero-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          max-width: 420px;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .cl-stats {
          display: flex;
          gap: 32px;
        }

        .cl-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .cl-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
        }

        .cl-stat-value span {
          color: #4f8ef7;
        }

        .cl-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }

        .cl-stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.08);
          align-self: stretch;
        }

        /* Testimonial */
        .cl-testimonial {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(79,142,247,0.15);
          border-radius: 14px;
          padding: 20px 22px;
          max-width: 480px;
        }

        .cl-test-quote {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 14px;
        }

        .cl-test-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cl-test-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .cl-test-name {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
        }

        .cl-test-role {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 1px;
        }

        .cl-test-stars {
          color: #4f8ef7;
          font-size: 12px;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        /* ── RIGHT PANEL ── */
        .cl-right {
          width: 500px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #0e0e16;
          border-left: 1px solid rgba(255,255,255,0.05);
          position: relative;
          overflow-y: auto;
        }

        .cl-right::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .cl-form-box {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .cl-form-header {
          margin-bottom: 32px;
        }

        .cl-form-eyebrow {
          font-size: 11px;
          font-weight: 700;
          color: rgba(79,142,247,0.8);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 8px;
        }

        .cl-form-title {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.6px;
          margin-bottom: 6px;
        }

        .cl-form-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
          line-height: 1.5;
        }

        /* Google button */
        .cl-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          background: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          margin-bottom: 20px;
          letter-spacing: -0.1px;
          position: relative;
        }

        .cl-google-btn:hover:not(:disabled) {
          background: #f5f5f5;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }

        .cl-google-btn:active:not(:disabled) { transform: translateY(0); }
        .cl-google-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .cl-google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .cl-google-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #4285F4;
          border-radius: 50%;
          animation: cl-spin 0.7s linear infinite;
        }

        /* Divider */
        .cl-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: rgba(255,255,255,0.18);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .cl-divider::before, .cl-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        /* Form fields */
        .cl-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .cl-form-box {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 1;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .cl-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cl-field-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.3px;
        }

        .cl-field-wrap {
          position: relative;
        }

        .cl-field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          font-size: 16px;
          pointer-events: none;
        }

        .cl-field-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          font-size: 14px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .cl-field-input::placeholder {
          color: rgba(255,255,255,0.18);
          font-size: 13px;
        }

        .cl-field-input:focus {
          border-color: rgba(79,142,247,0.5);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.1);
        }

        .cl-field-input-pwd {
          padding-right: 48px;
        }

        .cl-eye-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          font-size: 16px;
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
        }
        .cl-eye-toggle:hover { color: rgba(255,255,255,0.55); }

        /* Forgot */
        .cl-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cl-forgot-link {
          font-size: 12px;
          color: rgba(79,142,247,0.75);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .cl-forgot-link:hover { color: #3b7bf6; }

        /* Error */
        .cl-error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #fca5a5;
          line-height: 1.4;
          animation: cl-shake 0.3s ease;
        }

        @keyframes cl-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Submit */
        .cl-submit-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #4f8ef7 0%, #2563eb 50%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.1px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(79,142,247,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .cl-submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.5s ease;
        }

        .cl-submit-btn:hover::before { left: 150%; }

        .cl-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(79,142,247,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .cl-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .cl-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* Spinner */
        .cl-btn-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cl-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes cl-spin { to { transform: rotate(360deg); } }

        /* Demo box */
        .cl-demo-box {
          background: rgba(79,142,247,0.06);
          border: 1px dashed rgba(79,142,247,0.25);
          border-radius: 12px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
          gap: 12px;
          margin-bottom: 24px;
        }
        .cl-demo-box:hover {
          background: rgba(79,142,247,0.1);
          border-color: rgba(79,142,247,0.4);
          transform: scale(1.005);
        }
        .cl-demo-box:active { transform: scale(0.998); }

        .cl-demo-icon {
          width: 32px;
          height: 32px;
          background: rgba(79,142,247,0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .cl-demo-info {
          flex: 1;
        }

        .cl-demo-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(79,142,247,0.9);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 2px;
        }

        .cl-demo-creds {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          font-family: 'Menlo', 'Consolas', monospace;
        }

        .cl-demo-arrow {
          font-size: 18px;
          color: rgba(79,142,247,0.5);
          flex-shrink: 0;
        }

        /* Security badges */
        .cl-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .cl-security-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
        }

        .cl-security-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .cl-left { display: none; }
          .cl-right { width: 100%; border-left: none; }
        }
      `}</style>

      <div className="cl-page">

        {/* ── LEFT PANEL ── */}
        <div className="cl-left">
          <div className="cl-grid" />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="cl-particle"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                background: `rgba(79,142,247,${0.3 + (i % 4) * 0.1})`,
                left: `${10 + (i * 12) % 80}%`,
                animationDelay: `${i * 1.3}s`,
                animationDuration: `${8 + (i % 4) * 3}s`,
              }}
            />
          ))}

          {/* Brand */}
          <div className="cl-left-brand">
            <div className="cl-logo-mark">RF</div>
            <div>
              <div className="cl-logo-text">RankFlow</div>
              <div className="cl-logo-sub">Client Portal</div>
            </div>
          </div>

          {/* Hero */}
          <div className="cl-hero">
            <div className="cl-hero-badge">
              <span>✦</span>
              <span>Your SEO performance, simplified</span>
            </div>
            <h1 className="cl-hero-title">
              Track your<br />
              rankings &<br />
              <span>SEO growth.</span>
            </h1>
            <p className="cl-hero-desc">
              Access your real-time SEO reports, keyword rankings, backlink data,
              and monthly performance summaries — all in one beautiful dashboard.
            </p>
            <div className="cl-stats">
              <div className="cl-stat">
                <div className="cl-stat-value">98<span>%</span></div>
                <div className="cl-stat-label">Uptime</div>
              </div>
              <div className="cl-stat-divider" />
              <div className="cl-stat">
                <div className="cl-stat-value">24<span>h</span></div>
                <div className="cl-stat-label">Data refresh</div>
              </div>
              <div className="cl-stat-divider" />
              <div className="cl-stat">
                <div className="cl-stat-value">500<span>+</span></div>
                <div className="cl-stat-label">Clients served</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="cl-testimonial">
            <div className="cl-test-stars">★★★★★</div>
            <p className="cl-test-quote">
              &ldquo;RankFlow gives us complete transparency into our SEO progress.
              The reports are clear, the data is always fresh, and it&rsquo;s made
              our monthly review meetings much more productive.&rdquo;
            </p>
            <div className="cl-test-author">
              <div className="cl-test-avatar">SC</div>
              <div>
                <div className="cl-test-name">Sarah Chen</div>
                <div className="cl-test-role">Marketing Director · Acme Corp</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="cl-right">
          <div
            className="cl-form-box"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            {/* Header */}
            <div className="cl-form-header">
              <div className="cl-form-eyebrow">Client Portal</div>
              <h2 className="cl-form-title">Welcome back</h2>
              <p className="cl-form-desc">Sign in to view your SEO reports and performance metrics.</p>
            </div>

            {/* Google Sign In */}
            <button
              className="cl-google-btn"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              type="button"
            >
              {googleLoading ? (
                <span className="cl-google-spinner" />
              ) : (
                <svg className="cl-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="cl-divider">or sign in with email</div>

            {/* Error */}
            {error && (
              <div className="cl-error-box">
                <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="cl-fields">
                <div className="cl-field-group">
                  <label className="cl-field-label" htmlFor="cl-email">Email address</label>
                  <div className="cl-field-wrap">
                    <span className="cl-field-icon">✉</span>
                    <input
                      id="cl-email"
                      type="email"
                      className="cl-field-input"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div className="cl-field-group">
                  <div className="cl-field-row">
                    <label className="cl-field-label" htmlFor="cl-password">Password</label>
                    <a href="#" className="cl-forgot-link">Forgot password?</a>
                  </div>
                  <div className="cl-field-wrap">
                    <span className="cl-field-icon">🔒</span>
                    <input
                      id="cl-password"
                      type={showPassword ? 'text' : 'password'}
                      className="cl-field-input cl-field-input-pwd"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      disabled={loading || googleLoading}
                    />
                    <button
                      type="button"
                      className="cl-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="cl-submit-btn"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <span className="cl-btn-spinner" />
                    Signing in…
                  </>
                ) : (
                  'View My Reports →'
                )}
              </button>
            </form>

            {/* Demo autofill */}
            <div
              className="cl-demo-box"
              onClick={autofillDemo}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && autofillDemo()}
              title="Click to autofill demo credentials"
            >
              <div className="cl-demo-icon">🔑</div>
              <div className="cl-demo-info">
                <div className="cl-demo-label">Demo credentials</div>
                <div className="cl-demo-creds">client@acme.com · client123</div>
              </div>
              <div className="cl-demo-arrow">↗</div>
            </div>

            {/* Security badges */}
            <div className="cl-security">
              <div className="cl-security-item">🔒 SSL Secured</div>
              <div className="cl-security-dot" />
              <div className="cl-security-item">🛡 SOC2 Compliant</div>
              <div className="cl-security-dot" />
              <div className="cl-security-item">🔐 256-bit Encrypted</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
