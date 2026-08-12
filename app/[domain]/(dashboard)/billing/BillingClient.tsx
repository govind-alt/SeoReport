'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateAgencyPlan } from '@/app/actions';

export default function BillingClient({ plan, clientCount, clientLimit, agencyName }: { plan: string, clientCount: number, clientLimit: number, agencyName: string }) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [isManaging, setIsManaging] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Card update state
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');

  const domain = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'localhost' : 'localhost';

  const handleManageSubscription = async () => {
    setIsManaging(true);
    const t = toast.loading('Connecting to Stripe billing portal...');
    
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, returnUrl: window.location.href })
      });
      const data = await res.json();
      
      if (data.setup_required || !data.url) {
        toast.info('Stripe test mode: Opening Change Plan modal below.', { id: t });
        setIsChangePlanModalOpen(true);
      } else if (data.url) {
        toast.dismiss(t);
        window.location.href = data.url;
      }
    } catch {
      toast.info('Opening plan management...', { id: t });
      setIsChangePlanModalOpen(true);
    } finally {
      setIsManaging(false);
    }
  };

  const handleChangePlanSubmit = async (targetPlan: string) => {
    setIsUpdatingPlan(true);
    const t = toast.loading(`Updating subscription to ${targetPlan.toUpperCase()} plan...`);

    try {
      await updateAgencyPlan(domain, targetPlan);
      setCurrentPlan(targetPlan);
      toast.success(`Successfully switched to ${targetPlan.toUpperCase()} plan!`, { id: t });
      setIsChangePlanModalOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update plan', { id: t });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleInvoiceDownload = (invoiceId: string) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const computedLimit = currentPlan === 'enterprise' ? 9999 : currentPlan === 'professional' ? 25 : 5;
  const usagePercentage = Math.min(100, Math.round((clientCount / computedLimit) * 100));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Billing &amp; Subscription</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your subscription tier, payment methods, and invoices for {agencyName}.</p>
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
                  <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'capitalize' }}>
                    {currentPlan === 'professional' ? 'Pro' : currentPlan} Plan
                  </h2>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Active</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>You are currently on the {currentPlan} tier.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  ${currentPlan === 'enterprise' ? '249' : currentPlan === 'professional' ? '99' : '49'}
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Next billing date: Aug 1, 2026</p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                <span>Client Quota</span>
                <span>{clientCount} / {computedLimit === 9999 ? 'Unlimited' : computedLimit} Clients</span>
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
              <button className="btn btn-secondary" onClick={() => setIsChangePlanModalOpen(true)}>
                Change Plan
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Payment Method</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-opaque)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '32px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1F36', fontWeight: 800, fontSize: '12px', border: '1px solid var(--border)' }}>
                  VISA
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Visa ending in {cardNumber.slice(-4)}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Expires {cardExp}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }} onClick={() => setIsPaymentModalOpen(true)}>
                Update
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Invoices */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Invoice History</h3>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }} onClick={() => setIsInvoiceModalOpen(true)}>
              View All
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {[
              { date: 'Jul 1, 2026', amount: currentPlan === 'enterprise' ? '$249.00' : currentPlan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-07' },
              { date: 'Jun 1, 2026', amount: currentPlan === 'enterprise' ? '$249.00' : currentPlan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-06' },
              { date: 'May 1, 2026', amount: currentPlan === 'enterprise' ? '$249.00' : currentPlan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-05' },
              { date: 'Apr 1, 2026', amount: currentPlan === 'enterprise' ? '$249.00' : currentPlan === 'professional' ? '$99.00' : '$49.00', status: 'Paid', id: 'INV-2026-04' },
            ].map((inv) => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inv.date}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inv.id}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{inv.amount}</div>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--surface-opaque)' }} onClick={() => handleInvoiceDownload(inv.id)}>
                    PDF
                  </button>
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

      {/* ── Change Plan Modal ──────────────────────────────────────────────── */}
      {isChangePlanModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '780px', padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Select Your Subscription Tier</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Upgrade or downgrade your agency plan anytime. Changes apply immediately.</p>
              </div>
              <button onClick={() => setIsChangePlanModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              
              {/* Starter Tier */}
              <div style={{
                background: currentPlan === 'starter' ? 'var(--primary-light)' : 'var(--bg)',
                border: currentPlan === 'starter' ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Starter</div>
                <div style={{ fontSize: '24px', fontWeight: 900, margin: '8px 0' }}>$49<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>5 Active Clients</div>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: '0 0 20px 0', flex: 1, lineHeight: '1.6' }}>
                  <li>Daily SERanking Sync</li>
                  <li>Automated Monthly PDFs</li>
                  <li>Email Support</li>
                </ul>
                <button
                  className={`btn ${currentPlan === 'starter' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  disabled={currentPlan === 'starter' || isUpdatingPlan}
                  onClick={() => handleChangePlanSubmit('starter')}
                >
                  {currentPlan === 'starter' ? 'Current Plan' : 'Select Starter'}
                </button>
              </div>

              {/* Professional Tier */}
              <div style={{
                background: currentPlan === 'professional' ? 'var(--primary-light)' : 'var(--bg)',
                border: currentPlan === 'professional' ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>MOST POPULAR</div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Professional</div>
                <div style={{ fontSize: '24px', fontWeight: 900, margin: '8px 0' }}>$99<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>25 Active Clients</div>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: '0 0 20px 0', flex: 1, lineHeight: '1.6' }}>
                  <li>All Starter Features</li>
                  <li>White-label Branding</li>
                  <li>Client Portal Access</li>
                  <li>Google Search Console</li>
                </ul>
                <button
                  className={`btn ${currentPlan === 'professional' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  disabled={currentPlan === 'professional' || isUpdatingPlan}
                  onClick={() => handleChangePlanSubmit('professional')}
                >
                  {currentPlan === 'professional' ? 'Current Plan' : 'Select Pro'}
                </button>
              </div>

              {/* Enterprise Tier */}
              <div style={{
                background: currentPlan === 'enterprise' ? 'var(--primary-light)' : 'var(--bg)',
                border: currentPlan === 'enterprise' ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Enterprise</div>
                <div style={{ fontSize: '24px', fontWeight: 900, margin: '8px 0' }}>$249<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Unlimited Clients</div>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: '0 0 20px 0', flex: 1, lineHeight: '1.6' }}>
                  <li>All Pro Features</li>
                  <li>Unlimited Clients</li>
                  <li>Custom Subdomains</li>
                  <li>Dedicated Account Manager</li>
                </ul>
                <button
                  className={`btn ${currentPlan === 'enterprise' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  disabled={currentPlan === 'enterprise' || isUpdatingPlan}
                  onClick={() => handleChangePlanSubmit('enterprise')}
                >
                  {currentPlan === 'enterprise' ? 'Current Plan' : 'Select Enterprise'}
                </button>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsChangePlanModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Method Modal ────────────────────────────────────────────── */}
      {isPaymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>💳 Update Payment Method</div>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              toast.success('Payment method updated successfully!');
              setIsPaymentModalOpen(false);
            }}>
              <div className="form-group mb-3">
                <label className="form-label">Card Number</label>
                <input className="form-input" placeholder="4242 •••• •••• 4242" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Expiration</label>
                  <input className="form-input" placeholder="MM/YY" value={cardExp} onChange={e => setCardExp(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CVC</label>
                  <input className="form-input" type="password" placeholder="123" required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">✓ Update Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invoice History Modal ───────────────────────────────────────────── */}
      {isInvoiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '640px', padding: '28px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>📜 All Billing Invoices</div>
              <button onClick={() => setIsInvoiceModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '20px' }}>
              {[
                { date: 'Jul 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-07' },
                { date: 'Jun 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-06' },
                { date: 'May 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-05' },
                { date: 'Apr 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-04' },
                { date: 'Mar 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-03' },
                { date: 'Feb 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-02' },
                { date: 'Jan 1, 2026', amount: '$99.00', status: 'Paid', id: 'INV-2026-01' },
              ].map((inv) => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{inv.date}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.id} · <span style={{ color: '#10B981', fontWeight: 700 }}>PAID</span></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 700 }}>{inv.amount}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleInvoiceDownload(inv.id)}>
                      📥 Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
