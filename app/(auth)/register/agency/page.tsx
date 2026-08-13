"use client";

import '../../login/login.css';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { registerAgency } from '../../../actions';

export default function AgencyRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
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
      const targetSubdomain = subdomain || agencyName.toLowerCase().replace(/[^a-z0-9]/g, '');

      const res = await registerAgency({
        firstName,
        lastName,
        email,
        agencyName,
        subdomain: targetSubdomain,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const loginRes = await signIn('credentials', {
        email,
        password,
        roleTab: 'agency',
        redirect: false,
      });

      if (!loginRes?.error) {
        window.location.href = `/${targetSubdomain}/`;
      } else {
        window.location.href = '/login';
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
              <div className="brand-tagline">Agency Workspace Onboarding</div>
            </div>
          </div>
          <div className="platform-status-pill">
            <span className="status-dot"></span> All Systems Operational
          </div>
        </div>

        <div className="brand-hero">
          <div className="brand-badge">⚡ Dedicated Agency Admin Registration</div>
          <h1 className="brand-hero-title">Launch your<br/><span>Agency Workspace.</span><br/>Automate client SEO.</h1>
          <p className="brand-hero-desc">
            Get immediate access to white-labeled client portals, automated SERanking data sync, PDF report generator, and multi-tenant management tools.
          </p>

          <div className="brand-stats-grid">
            <div className="brand-stat-item">
              <div className="brand-stat-number">100%</div>
              <div className="brand-stat-label">White-Labeled</div>
            </div>
            <div className="brand-stat-item">
              <div className="brand-stat-number">14 Days</div>
              <div className="brand-stat-label">Free Trial</div>
            </div>
            <div className="brand-stat-item">
              <div className="brand-stat-number">Instant</div>
              <div className="brand-stat-label">Subdomain Setup</div>
            </div>
          </div>

          <div className="brand-testimonial">
            <blockquote>&quot;RankFlow makes agency management effortless. Creating client portals and scheduling monthly reports takes seconds.&quot;</blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar">RF</div>
              <div>
                <div className="testimonial-name">Agency Growth Specialist</div>
                <div className="testimonial-role">RankFlow Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-integrations">
          <div className="integrations-label">Included Agency Features</div>
          <div className="integrations-tags">
            <span className="integration-tag">Custom Subdomains</span>
            <span className="integration-tag">SERanking API</span>
            <span className="integration-tag">Client PDF Export</span>
            <span className="integration-tag">Stripe Invoicing</span>
          </div>
        </div>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="form-header">
          <div className="form-header-title">Create Agency Workspace 🏢</div>
          <div className="form-header-desc">Set up your dedicated SEO agency portal</div>
        </div>

        {/* Dedicated Account Type Switcher */}
        <div className="role-selector" style={{ marginBottom: '24px' }}>
          <Link href="/register/agency" className="role-option active" style={{ textDecoration: 'none' }}>
            🏢 Agency Workspace
          </Link>
          <Link href="/register/client" className="role-option" style={{ textDecoration: 'none' }}>
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
                placeholder="Doe"
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
              placeholder="john@agency.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="agencyName">Agency Name <span className="req">*</span></label>
            <input
              className="form-input"
              id="agencyName"
              type="text"
              placeholder="Apex Digital Marketing"
              required
              value={agencyName}
              onChange={e => {
                setAgencyName(e.target.value);
                if (!subdomain) {
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                }
              }}
            />
            <div className="form-hint">Your SEO or digital marketing agency brand name</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subdomain">Agency Subdomain <span className="req">*</span></label>
            <div className="subdomain-group">
              <input
                className="form-input"
                id="subdomain"
                type="text"
                placeholder="apex"
                required
                value={subdomain}
                onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
              <div className="subdomain-suffix">.rankflow.app</div>
            </div>
            <div className="form-hint">Your white-labeled dashboard URL</div>
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
            {loading ? 'Creating Workspace...' : 'Create Agency Workspace →'}
          </button>
        </form>

        <div className="form-footer" style={{ marginTop: '24px' }}>
          Already have an agency account? <Link href="/login" className="link">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}
