'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { acceptInvitation } from '@/app/actions';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.ok).length;
  const strength = passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed <= 3 ? 'Good' : 'Strong';
  const color = passed <= 1 ? '#EF4444' : passed <= 2 ? '#F59E0B' : passed <= 3 ? '#10B981' : '#059669';

  if (!password) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i < passed ? color : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {checks.map(c => (
            <span key={c.label} style={{ color: c.ok ? '#10B981' : 'var(--text-muted)' }}>
              {c.ok ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        <span style={{ color, fontWeight: 700 }}>{strength}</span>
      </div>
    </div>
  );
}

// Invite info fetcher (simulated — in prod would decode token)
function InviteDetails({ token }: { token: string }) {
  // Show placeholder invite card
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,30,66,0.08), rgba(99,102,241,0.08))',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px', height: '48px', background: 'var(--primary)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', flexShrink: 0
      }}>✉️</div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          You&apos;ve been invited to join a team
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Set up your account below to accept. Invitation token: <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>{token.slice(0, 12)}…</code>
        </div>
      </div>
    </div>
  );
}

function AcceptInviteForm({ token }: { token: string }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [agencySlug, setAgencySlug] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const t = toast.loading('Setting up your account...');
    try {
      const result = await acceptInvitation(token, name, password);
      toast.success('Account created! Signing you in...', { id: t });
      setAgencySlug(result.agencySlug);

      // Auto sign-in after accepting invite
      // We need the email — it's embedded in the token via DB lookup in acceptInvitation
      setStep('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept invitation';
      toast.error(message, { id: t });
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          You&apos;re all set, {name.split(' ')[0]}!
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Your account has been created and you&apos;ve joined the team. Head to your dashboard to get started.
        </p>
        <a
          href={agencySlug ? `/${agencySlug}` : '/login'}
          className="btn btn-primary"
          style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}
        >
          Go to Dashboard →
        </a>
        <div style={{ marginTop: '16px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Or sign in with your new credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <InviteDetails token={token} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Full Name <span style={{ color: 'var(--primary)' }}>*</span></label>
          <input
            className="form-input"
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <div className="form-hint">This will be displayed to your team members</div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Create Password <span style={{ color: 'var(--primary)' }}>*</span></label>
          <div className="input-with-icon">
            <input
              className="form-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <button type="button" className="input-icon-btn" tabIndex={-1} onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Confirm Password <span style={{ color: 'var(--primary)' }}>*</span></label>
          <div className="input-with-icon">
            <input
              className="form-input"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              style={{ borderColor: confirm && password !== confirm ? '#EF4444' : undefined }}
            />
            <button type="button" className="input-icon-btn" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>
          {confirm && password !== confirm && (
            <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>
              ❌ Passwords do not match
            </div>
          )}
          {confirm && password === confirm && confirm.length >= 8 && (
            <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
              ✓ Passwords match
            </div>
          )}
        </div>

        <div style={{ paddingTop: '4px' }}>
          <div className="checkbox-row" style={{ marginBottom: '16px' }}>
            <input type="checkbox" id="agreeTerms" required />
            <label htmlFor="agreeTerms" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              I agree to the <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (!!confirm && password !== confirm)}
            style={{ width: '100%', padding: '13px' }}
          >
            {loading ? '⏳ Creating Account...' : '🎉 Accept Invitation & Join Team →'}
          </button>
        </div>
      </form>
    </>
  );
}

function InvalidToken() {
  return (
    <div style={{ textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
        Invalid or Expired Invitation
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        This invitation link is invalid or has already been used. Please ask your team admin to send a new invitation to your email address.
      </p>
      <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
        ← Go to Login
      </Link>
    </div>
  );
}

function AcceptInvitePageContent() {
  const params = useSearchParams();
  const token = params.get('token');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: '20px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(255,30,66,0.3)'
          }}>RF</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Join your team on RankFlow
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            You&apos;ve been invited to collaborate on SEO reporting
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {!token ? <InvalidToken /> : <AcceptInviteForm token={token} />}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Loading your invitation...</div>
        </div>
      </div>
    }>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
