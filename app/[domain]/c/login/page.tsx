'use client';

import { useState, use } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function ClientLoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (usePassword) {
        // Log in using credentials (email + password)
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl: `/${domain}/c/dashboard`
        });

        if (res?.error) {
          toast.error('Invalid email or password');
        } else {
          toast.success('Logged in successfully! Redirecting...');
          window.location.href = `/${domain}/c/dashboard`;
        }
      } else {
        // Log in using nodemailer magic link
        const res = await signIn('nodemailer', {
          email,
          redirect: false,
          callbackUrl: `/${domain}/c/dashboard`
        });

        if (res?.error) {
          toast.error('Failed to send login link');
        } else {
          setSubmitted(true);
          toast.success('Login link sent to your email!');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)' }}>🔑</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Client Portal Login</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Access your white-labeled agency dashboard reports.</p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', padding: '2px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => { setUsePassword(true); setSubmitted(false); }}
            style={{
              flex: 1, padding: '8px', border: 'none', background: usePassword ? 'var(--primary)' : 'transparent',
              color: usePassword ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s'
            }}
          >
            🔒 Password Auth
          </button>
          <button 
            type="button"
            onClick={() => setUsePassword(false)}
            style={{
              flex: 1, padding: '8px', border: 'none', background: !usePassword ? 'var(--primary)' : 'transparent',
              color: !usePassword ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s'
            }}
          >
            ✉️ Magic Link Email
          </button>
        </div>

        {submitted && !usePassword ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Check your inbox</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              We&apos;ve sent a magic link to <strong>{email}</strong>. Check your email (or terminal console logs in dev mode) to sign in.
            </p>
            <button className="btn btn-secondary btn-full" style={{ marginTop: '24px' }} onClick={() => setSubmitted(false)}>
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Client Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="client@zomato.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {usePassword && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              style={{ padding: '12px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : usePassword ? 'Secure Sign In →' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
