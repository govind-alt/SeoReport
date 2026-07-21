'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { acceptInvitation } from '@/app/actions';
import { toast } from 'sonner';

function AcceptInviteForm({ token }: { token: string }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const t = toast.loading('Creating your account...');
    try {
      const result = await acceptInvitation(token, name, password);
      toast.success('Account created! Redirecting...', { id: t });
      router.push(`/${result.agencySlug}/login`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation.', { id: t });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-group">
        <label className="form-label">Your Full Name</label>
        <input
          className="form-input"
          type="text"
          placeholder="John Smith"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Create a Password</label>
        <input
          className="form-input"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <input
          className="form-input"
          type="password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
        {loading ? 'Creating Account...' : 'Accept Invitation & Continue →'}
      </button>
    </form>
  );
}

function AcceptInvitePageContent() {
  const params = useSearchParams();
  const token = params.get('token');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary) 0%, #3B82F6 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '18px', margin: '0 auto 16px' }}>RF</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>You&apos;ve Been Invited 🎉</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create your account to join your team on RankFlow.</p>
        </div>

        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-xl)' }}>
          {!token ? (
            <div style={{ textAlign: 'center', color: '#EF4444', padding: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ fontWeight: 600 }}>Invalid or missing invitation link.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Please check your email for the original invitation and try again.</p>
            </div>
          ) : (
            <AcceptInviteForm token={token} />
          )}
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '24px' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontWeight: 600 }}>Loading invitation link...</div>
        </div>
      </div>
    }>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
