'use client';

import { useState, use } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function ClientLoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('nodemailer', {
        email,
        redirect: false,
        callbackUrl: `/${resolvedParams.domain}/c/dashboard`
      });

      if (res?.error) {
        toast.error('Failed to send login link');
      } else {
        setSubmitted(true);
        toast.success('Login link sent to your email!');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔑</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Client Portal Login</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Enter your email to receive a secure login link.</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Check your email</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              We&apos;ve sent a magic link to <strong>{email}</strong>. Click the link in the email to log in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                className="input"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
