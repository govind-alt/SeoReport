'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function BillingClient({ plan, clientCount, clientLimit, agencyName }: { plan: string, clientCount: number, clientLimit: number, agencyName: string }) {
  const [isManaging, setIsManaging] = useState(false);

  const handleManageSubscription = async () => {
    setIsManaging(true);
    const t = toast.loading('Connecting to billing portal...');
    
    try {
      // Extract the domain from the URL
      const domain = window.location.pathname.split('/')[1];
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, returnUrl: window.location.href })
      });
      const data = await res.json();
      
      if (data.setup_required) {
        toast.error('Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file.', { id: t });
      } else if (data.url) {
        toast.dismiss(t);
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal.', { id: t });
      }
    } catch {
      toast.error('Failed to connect to billing portal.', { id: t });
    } finally {
      setIsManaging(false);
    }
  };

  const usagePercentage = Math.min(100, Math.round((clientCount / clientLimit) * 100));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Billing & Subscription</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your plan, payment methods, and invoices for {agencyName}.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Current Plan & Usage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'capitalize' }}>{plan === 'professional' ? 'Pro' : plan} Plan</h2>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Active</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>You are currently on the {plan} tier.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  ${plan === 'enterprise' ? '249' : plan === 'professional' ? '99' : '49'}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Next billing date: Aug 1, 2026</p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                <span>Client Quota</span>
                <span>{clientCount} / {clientLimit === 9999 ? 'Unlimited' : clientLimit} Clients</span>
              </div>
              <div style={{ height: '8px', background: 'var(--surface-opaque)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${usagePercentage}%`, 
                  background: usagePercentage > 90 ? '#EF4444' : usagePercentage > 75 ? '#F59E0B' : 'var(--primary)',
                  borderRadius: '4px',
                  transition: 'width 1s ease-in-out'
                }} />
              </div>
              {usagePercentage > 90 && (
                <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>You are nearing your client limit. Upgrade your plan to add more clients.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleManageSubscription} disabled={isManaging}>
                {isManaging ? 'Connecting...' : 'Manage Subscription'}
              </button>
              <button className="btn btn-secondary">Change Plan</button>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Payment Method</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-opaque)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '32px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1F36', fontWeight: 800, fontSize: '12px' }}>
                  VISA
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Visa ending in 4242</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Expires 12/28</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Update</button>
            </div>
          </div>

        </div>

        {/* Right Column: Invoices */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Invoice History</h3>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>View All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {[
              { date: 'Jul 1, 2026', amount: plan === 'enterprise' ? '$249.00' : plan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-07' },
              { date: 'Jun 1, 2026', amount: plan === 'enterprise' ? '$249.00' : plan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-06' },
              { date: 'May 1, 2026', amount: plan === 'enterprise' ? '$249.00' : plan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-05' },
              { date: 'Apr 1, 2026', amount: plan === 'enterprise' ? '$249.00' : plan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-04' },
            ].map((inv) => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inv.date}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inv.id}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{inv.amount}</div>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--surface-opaque)' }}>PDF</button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong style={{ color: '#3B82F6' }}>Need a tax invoice?</strong> You can add your VAT/Tax ID in the billing portal to have it automatically applied to future invoices.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
