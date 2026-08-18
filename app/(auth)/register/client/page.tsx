"use client";

import '../../login/login.css';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { registerClient } from '../../../actions';

export default function ClientRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await registerClient({
        firstName,
        lastName,
        email,
        companyName,
        domain: domain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Auto sign-in after client registration
      const loginRes = await signIn('credentials', {
        email,
        password,
        roleTab: 'client',
        redirect: false,
      });

      if (!loginRes?.error) {
        window.location.href = '/client/dashboard';
      } else {
        window.location.href = '/login/client';
      }
    } catch {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Brand Panel ─────────────────────────────────────────────────── */}
      <div className="auth-brand-panel">
        <div className="brand-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">RF</div>
            <div>
              <div className="brand-name">RankFlow</div>
              <div className="brand-tagline">Client Portal Registration</div>
            </div>
          </div>
          <div className="platform-status-pill">
            <span className="status-dot"></span> All Systems Operational
          </div>
        </div>

        <div className="brand-hero">
          <div className="brand-badge">👤 Dedicated Client Portal Registration</div>
          <h1 className="brand-hero-title">Track your<br/><span>SEO performance.</span><br/>Zero complexity.</h1>
          <p className="brand-hero-desc">
            Access your personalized client dashboard, download monthly executive PDF reports, view real-time keyword rankings, and message your SEO agency.
          </p>

          <div className="brand-stats-grid">
            <div className="brand-stat-item">
              <div className="brand-stat-number">Live</div>
              <div className="brand-stat-label">Rankings</div>
            </div>
            <div className="brand-stat-item">
              <div className="brand-stat-number">Monthly</div>
              <div className="brand-stat-label">PDF Reports</div>
            </div>
            <div className="brand-stat-item">
              <div className="brand-stat-number">Private</div>
              <div className="brand-stat-label">Client Portal</div>
            </div>
          </div>

          <div className="brand-testimonial">
            <blockquote>&quot;The client portal gives us complete visibility into our organic search growth every month.&quot;</blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar">CP</div>
              <div>
                <div className="testimonial-name">Client Portal Member</div>
                <div className="testimonial-role">RankFlow Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-integrations">
          <div className="integrations-label">Included Client Features</div>
          <div className="integrations-tags">
            <span className="integration-tag">Keyword Position Charts</span>
            <span className="integration-tag">Monthly PDF Downloads</span>
            <span className="integration-tag">Site Health Audits</span>
            <span className="integration-tag">Direct Agency Messaging</span>
          </div>
        </div>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="form-header">
          <div className="form-header-title">Create Client Account 👤</div>
          <div className="form-header-desc">Set up your client portal login</div>
        </div>

        {/* Dedicated Account Type Switcher */}
        <div className="role-selector" style={{ marginBottom: '24px' }}>
          <Link href="/register/agency" className="role-option" style={{ textDecoration: 'none' }}>
            🏢 Agency Workspace
          </Link>
          <Link href="/register/client" className="role-option active" style={{ textDecoration: 'none' }}>
            👤 Client Portal
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-row mb-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="firstName">First Name <span className="req">*</span></label>
              <input
                className="form-input"
                id="firstName"
                type="text"
                placeholder="John"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="lastName">Last Name <span className="req">*</span></label>
              <input
                className="form-input"
                id="lastName"
                type="text"
                placeholder="Smith"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="workEmail">Work Email <span className="req">*</span></label>
            <input
              className="form-input"
              id="workEmail"
              type="email"
              placeholder="john@company.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="companyName">Company Name <span className="req">*</span></label>
            <input
              className="form-input"
              id="companyName"
              type="text"
              placeholder="Acme Corp"
              required
              value={companyName}
              onChange={e => {
                setCompanyName(e.target.value);
                if (!domain) {
                  setDomain(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
                }
              }}
            />
            <div className="form-hint">Your company or organization name</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="domain">Website Domain <span className="req">*</span></label>
            <input
              className="form-input"
              id="domain"
              type="text"
              placeholder="acmecorp.com"
              required
              value={domain}
              onChange={e => setDomain(e.target.value)}
            />
            <div className="form-hint">Your website domain to view SEO reports</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password <span className="req">*</span></label>
            <div className="input-with-icon">
              <input
                className="form-input"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password <span className="req">*</span></label>
            <input
              className="form-input"
              id="confirmPassword"
              type="password"
              placeholder="••••••••••"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-row mb-4">
            <input type="checkbox" id="terms" required defaultChecked />
            <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Client Account...' : 'Create Client Account →'}
          </button>
        </form>

        <div className="form-footer" style={{ marginTop: '24px' }}>
          Already have a client account? <Link href="/login/client" className="link">Sign in to Client Portal →</Link>
        </div>
      </div>
    </div>
  );
}
