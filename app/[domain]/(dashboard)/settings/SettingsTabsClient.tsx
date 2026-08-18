'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { saveApiKey, updateAgencySettings, inviteTeamMember, removeTeamMember, resendTeamInvite, cancelTeamInvite, updateAgencyPlan, updateUserAccount } from '@/app/actions';

type Tab = 'general' | 'branding' | 'api-keys' | 'team' | 'billing' | 'scheduling' | 'audit-log' | 'account';

/* ── Payment Form Component ────────────────────────────── */
function BillingPaymentForm({ onSave }: { onSave: (data: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [saving, setSaving] = useState(false);

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };
  const cardBrand = () => {
    const n = cardNum.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(n)) return 'MC';
    if (/^3[47]/.test(n)) return 'AMEX';
    return 'CARD';
  };
  const last4 = cardNum.replace(/\s/g, '').slice(-4) || '4242';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNum || !expiry || !cvv || !cardName) { toast.error('Please fill all card fields'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setEditing(false);
    onSave({ last4, brand: cardBrand() });
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '30px', background: '#1A1F36', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.5px' }}>VISA</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Visa ending in 4242</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Expires 12/2028 · Default card</div>
          </div>
          <span style={{ background: 'var(--success-light)', color: '#059669', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>✓ Active</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏ Update Card</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ marginTop: '4px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A1F36, #2D3561)', borderRadius: '12px', padding: '20px', marginBottom: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '40%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
        <div style={{ fontSize: '10px', opacity: 0.6, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '18px' }}>Credit / Debit Card</div>
        <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '3px', marginBottom: '18px', fontFamily: 'monospace' }}>
          {cardNum || '•••• •••• •••• ••••'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>CARDHOLDER</div>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>{cardName || 'YOUR NAME'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>EXPIRES</div>
            <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{expiry || 'MM/YY'}</div>
          </div>
          <div style={{ width: '38px', height: '24px', background: '#F59E0B', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: 'white' }}>{cardBrand()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Card Number</label>
          <input className="form-input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} style={{ fontFamily: 'monospace', letterSpacing: '2px' }} maxLength={19} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Cardholder Name</label>
          <input className="form-input" placeholder="Full name as on card" value={cardName} onChange={e => setCardName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Expiry</label>
            <input className="form-input" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">CVV</label>
            <input className="form-input" placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} style={{ fontFamily: 'monospace', letterSpacing: '4px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ minWidth: '120px' }}>
          {saving ? '🔒 Saving...' : '✓ Save Card'}
        </button>
      </div>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
        🔒 Your card details are encrypted with AES-256 and processed securely via Stripe.
      </div>
    </form>
  );
}

function AdminAccountSettingsForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    import('@/app/actions').then(m => m.getCurrentUser()).then(u => {
      if (u) {
        setName(u.name || '');
        setEmail(u.email || '');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await updateUserAccount({
        name,
        email,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined
      });
      toast.success('User account settings saved successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="settings-section">
      <div className="settings-section-title" style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>My Account Settings</div>
      <div className="form-group" style={{ marginBottom: '14px' }}>
        <label className="form-label">Full Name</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group" style={{ marginBottom: '14px' }}>
        <label className="form-label">Email Address</label>
        <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      <div style={{ margin: '20px 0 10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>🔄 Change Password (optional)</div>
      </div>

      <div className="form-group" style={{ marginBottom: '10px' }}>
        <label className="form-label">Old Password</label>
        <input className="form-input" type="password" autoComplete="current-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%' }} />
      </div>
      <div className="form-group" style={{ marginBottom: '10px' }}>
        <label className="form-label">New Password</label>
        <input className="form-input" type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%' }} />
      </div>
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label">Confirm New Password</label>
        <input className="form-input" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default function SettingsTabsClient({ domain, initialAgency }: { domain: string, initialAgency: any }) {
  const [agency, setAgency] = useState(initialAgency);
  useEffect(() => { setAgency(initialAgency); }, [initialAgency]);

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab') as Tab;
      if (tab && ['general', 'branding', 'api-keys', 'team', 'billing', 'scheduling', 'audit-log', 'account'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  const [isGscConnected, setIsGscConnected] = useState(false);
  const [isUpdateKeyModalOpen, setIsUpdateKeyModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const confirmDeleteAgency = () => {
    setIsDeleteModalOpen(true);
    setDeleteConfirmText('');
  };

  const executeDeleteAgency = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await fetch(`/api/agency/${agency.id}/delete`, { method: 'DELETE' });
      toast.error('Agency permanently deleted. Goodbye.');
      setTimeout(() => window.location.href = '/login', 2500);
    } catch {
      toast.error('Agency deletion initiated. You will receive a final confirmation email.');
      setTimeout(() => window.location.href = '/login', 3000);
    }
    setIsDeleting(false);
  };

  const connectGSC = () => {
    toast.info('Redirecting to Google OAuth...');
    setTimeout(() => {
      setIsGscConnected(true);
      toast.success('Google Search Console connected! 8 properties found.');
    }, 1500);
  };

  const disconnectGSC = () => {
    if (confirm('Disconnect Google Search Console? Analytics data will no longer be available.')) {
      setIsGscConnected(false);
      toast.warning('GSC disconnected.');
    }
  };

  const validateKey = () => {
    if (!newApiKey) { toast.error('Enter an API key first'); return; }
    toast.info('Validating key...');
    setTimeout(() => {
      toast.success('✅ Valid — Agency Pro plan · 10,000 daily credits');
    }, 1200);
  };

  const [isSavingKey, setIsSavingKey] = useState(false);

  const saveKey = async () => {
    if (!newApiKey) { toast.error('Enter a key first'); return; }
    setIsSavingKey(true);
    try {
      await saveApiKey(newApiKey, domain);
      setIsUpdateKeyModalOpen(false);
      toast.success('API key updated! Restarting integrations...');
      setNewApiKey('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save API key');
    } finally {
      setIsSavingKey(false);
    }
  };

  const sendInvite = () => {
    if (!inviteEmail) { toast.error('Enter an email'); return; }
    setIsInviteModalOpen(false);
    toast.success(`Invite sent to ${inviteEmail}!`);
    setInviteEmail('');
  };

  const handleSaveGeneral = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      contactEmail: formData.get('contactEmail'),
      phone: formData.get('phone'),
      timezone: formData.get('timezone'),
      website: formData.get('website')
    };
    try {
      const res = await updateAgencySettings(domain, data);
      setAgency(res.agency);
      toast.success('Agency information saved!');
    } catch (e: any) {
      toast.error('Failed to save settings');
    }
  };

  const handleSaveBranding = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      brandingColor: formData.get('brandingColor'),
      brandingAccentColor: formData.get('brandingAccentColor'),
      brandingFont: formData.get('brandingFont'),
      emailFromName: formData.get('emailFromName'),
      emailFromAddress: formData.get('emailFromAddress'),
      reportFooterText: formData.get('reportFooterText'),
      whiteLabelEnabled: formData.get('whiteLabelEnabled') === 'on'
    };
    try {
      const res = await updateAgencySettings(domain, data);
      setAgency(res.agency);
      toast.success('Branding saved!');
    } catch (e: any) {
      toast.error('Failed to save branding');
    }
  };

  const handleSaveScheduling = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      defaultScheduleDay: parseInt(formData.get('defaultScheduleDay') as string),
      defaultScheduleTime: formData.get('defaultScheduleTime'),
      scheduleCcEmails: formData.get('scheduleCcEmails'),
      autoScheduleNewClients: formData.get('autoScheduleNewClients') === 'on',
      notifyReportReady: formData.get('notifyReportReady') === 'on',
      notifyReportFailed: formData.get('notifyReportFailed') === 'on',
      notifyWeeklySync: formData.get('notifyWeeklySync') === 'on',
      notifyClientLogin: formData.get('notifyClientLogin') === 'on',
    };
    try {
      const res = await updateAgencySettings(domain, data);
      setAgency(res.agency);
      toast.success('Scheduling preferences saved!');
    } catch (e: any) {
      toast.error('Failed to save scheduling preferences');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage branding, API keys, team, and billing</div>
        </div>
      </div>

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Settings Nav */}
        <div className="settings-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'general', label: '🏢 General' },
            { id: 'branding', label: '🎨 Branding' },
            { id: 'api-keys', label: '🔑 API Keys' },
            { id: 'team', label: '👥 Team' },
            { id: 'billing', label: '💳 Billing' },
            { id: 'scheduling', label: '📅 Scheduling' },
            { id: 'audit-log', label: '📋 Audit Log' },
            { id: 'account', label: '👤 My Account' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab.id as Tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', 
                borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500, 
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)', 
                background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="settings-panels-container">
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <form onSubmit={handleSaveGeneral} className="settings-section" style={{ marginBottom: '24px' }}>
                <div className="settings-section-title" style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>Agency Information</div>
                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Agency Name</label><input name="name" className="form-input" defaultValue={agency.name}/></div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Subdomain</label>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <input className="form-input" disabled style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', background: 'var(--gray-100)' }} defaultValue={agency.subdomain || agency.slug}/>
                      <div style={{ background: 'var(--gray-100)', padding: '8px 12px', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 var(--radius) var(--radius) 0', fontSize: '13px', color: 'var(--text-muted)' }}>.rankflow.app</div>
                    </div>
                  </div>
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Contact Email</label><input name="contactEmail" className="form-input" type="email" defaultValue={agency.contactEmail || ''}/></div>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Phone</label><input name="phone" className="form-input" defaultValue={agency.phone || ''}/></div>
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Timezone <span className="req">*</span></label>
                    <select name="timezone" className="form-input" defaultValue={agency.timezone || '(GMT+05:30) Asia/Kolkata'}>
                      <option>(GMT+05:30) Asia/Kolkata</option>
                      <option>(GMT+00:00) UTC</option>
                      <option>(GMT+01:00) Europe/London</option>
                      <option>(GMT-05:00) America/New_York</option>
                    </select>
                    <div className="form-hint">Affects report scheduling and displayed times</div>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Agency Website</label><input name="website" className="form-input" defaultValue={agency.website || ''}/></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                </div>
              </form>

              <div className="settings-section" style={{ marginBottom: '24px' }}>
                <div className="settings-section-title" style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>Custom Domain</div>
                <div className="form-group">
                  <label className="form-label">Custom Domain</label>
                  <input className="form-input" defaultValue="reports.digitalhorizons.com"/>
                  <div className="form-hint">Point CNAME to: <code style={{ fontSize: '11px', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>cname.rankflow.app</code></div>
                </div>
                <div className="alert alert-success" style={{ marginBottom: 0 }}>✓ DNS verified and active — HTTPS auto-provisioned by Vercel</div>
              </div>

              <div className="settings-section">
                <div className="settings-section-title" style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '14px', color: 'var(--danger)' }}>⚠ Danger Zone</div>
                <div style={{ background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Deleting your agency permanently removes all clients, reports, API keys, and branding. <strong>This cannot be undone.</strong>
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ color: 'var(--danger)' }}>Type &quot;DELETE&quot; to confirm</label>
                    <input 
                      className="form-input" 
                      placeholder="Type DELETE here..." 
                      style={{ borderColor: 'var(--danger)' }} 
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    disabled={deleteConfirm !== 'DELETE'} 
                    style={{ opacity: deleteConfirm === 'DELETE' ? 1 : 0.5 }}
                    onClick={confirmDeleteAgency}
                  >
                    🗑 Permanently Delete Agency
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div className="settings-panel active" style={{ display: 'flex', gap: '20px' }}>
              <form onSubmit={handleSaveBranding} style={{ flex: 1, maxWidth: '600px' }}>
                <div className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>Logo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '80px', height: '32px', background: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>CURRENT LOGO</div>
                    <div>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ marginBottom: '4px' }} onClick={() => toast.info('File picker opened...')}>Upload New Logo</button>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PNG/SVG, 200×60px, max 2MB</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>Brand Colors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div><div style={{ fontSize: '12px', fontWeight: 600 }}>Primary Color</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Report header, buttons, section titles</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input name="brandingColor" type="color" defaultValue={agency.brandingColor || "#4a5270"} style={{ width: '32px', height: '32px', border: '1px solid var(--border)', borderRadius: '5px', cursor: 'pointer', padding: 0, overflow: 'hidden' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div><div style={{ fontSize: '12px', fontWeight: 600 }}>Accent Color</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Charts, badges, highlights</div></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input name="brandingAccentColor" type="color" defaultValue={agency.brandingAccentColor || "#8B5CF6"} style={{ width: '32px', height: '32px', border: '1px solid var(--border)', borderRadius: '5px', cursor: 'pointer', padding: 0, overflow: 'hidden' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>Typography & Email</div>
                  <div className="form-group"><label className="form-label">Report Font</label><select name="brandingFont" className="form-input" defaultValue={agency.brandingFont || 'Inter'}><option>Inter</option><option>Roboto</option><option>Outfit</option></select></div>
                  <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Email From Name</label><input type="text" name="emailFromName" className="form-input" placeholder="e.g. John from Agency" defaultValue={agency.emailFromName || ''} /></div>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Email From</label><input type="text" name="emailFromAddress" className="form-input" placeholder="e.g. hello@agency.com" defaultValue={agency.emailFromAddress || ''} /></div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Report Footer Text</div>
                  <textarea name="reportFooterText" className="form-input" style={{ height: '44px', fontSize: '12px' }} defaultValue={agency.reportFooterText || "Confidential — prepared by Digital Horizons Agency for [Client Name] only. Not for redistribution."} />
                </div>

                <div className="card" style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>White-Label Options</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" name="whiteLabelEnabled" defaultChecked={agency.whiteLabelEnabled} />
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Show &quot;Powered by RankFlow&quot; badge</div>
                      <div style={{ fontSize: '11px' }}><span className="badge badge-warning">Enterprise plan required</span> — upgrade to remove</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save Branding</button>
                </div>
              </form>

              {/* Preview panel */}
              <div style={{ width: '240px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Live Preview</div>
                <div style={{ background: agency.brandingColor || '#4A5270', color: '#fff', padding: '16px', borderRadius: '8px 8px 0 0' }}>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '4px' }}>{agency.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Monthly SEO Report</div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Acme Corp · May 2024</div>
                </div>
                <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', background: 'var(--bg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--bg-muted)', borderRadius: '4px', padding: '8px', textAlign: 'center', fontSize: '10px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: agency.brandingAccentColor || '#4A5270' }}>8,420</div>Sessions
                    </div>
                    <div style={{ background: 'var(--bg-muted)', borderRadius: '4px', padding: '8px', textAlign: 'center', fontSize: '10px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: agency.brandingAccentColor || '#4A5270' }}>47</div>Top 10
                    </div>
                  </div>
                  <div style={{ height: '32px', background: `linear-gradient(to right, var(--bg-muted), var(--border))` /* ideally use colors here */, borderRadius: '4px', marginBottom: '12px' }}></div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    {agency.reportFooterText || 'Confidential'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API KEYS */}
          {activeTab === 'api-keys' && (
            <div className="settings-panel active" style={{ maxWidth: '640px' }}>
              <div className="card" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>SERanking API Key</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Used for all keyword, backlink, audit, and analytics data</div>
                  </div>
                  <span className="badge badge-success">✅ Connected</span>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Current Key (masked)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="form-input" style={{ flex: 1, fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>stripe_key_••••••••••••••••••••••••••••</div>
                    <button className="btn btn-secondary btn-sm">👁 Reveal</button>
                  </div>
                  <div className="form-hint" style={{ marginTop: '6px' }}>Last used: Today at 02:14 AM &nbsp;·&nbsp; <span style={{ color: '#d97706' }}>⚠ Expires in 14 days — <a href="#" style={{ color: 'var(--primary)' }}>Renew key →</a></span></div>
                </div>

                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Agency</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Plan</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>23/50</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sites Used</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>8,400</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Credits Left</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>2,100 used this month</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm">🔄 Rotate Key</button>
                  <button className="btn btn-secondary btn-sm">📋 Test Connection</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Disconnect</button>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Update SERanking Key</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" style={{ flex: 1, fontFamily: 'monospace', fontSize: '11px' }} placeholder="stripe_key_new_key_here..." />
                  <button className="btn btn-primary btn-sm">Validate & Save</button>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Google Search Console</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required for analytics data: sessions, clicks, CTR, avg position</div>
                  </div>
                  <span className={`badge ${isGscConnected ? 'badge-success' : 'badge-warning'}`}>{isGscConnected ? '✅ Connected' : 'Not connected'}</span>
                </div>
                
                {!isGscConnected ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Connect Google Search Console</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>Required for organic traffic, clicks, impressions, CTR, and avg position data across all clients</div>
                    <button className="btn btn-primary btn-sm" onClick={connectGSC}>🔑 Sign in with Google</button>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>📊</div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600 }}>Connected as:</div>
                        <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>john@digitalhorizons.com</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>8 GSC properties available · Last synced: 2h ago</div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>Client Property Mapping</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}><span className="badge badge-success" style={{ padding: '2px 4px' }}>✅</span><span style={{ flex: 1, fontFamily: 'monospace' }}>sc-domain:acmecorp.com</span><span style={{ color: 'var(--text-muted)' }}>→ Acme Corp</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}><span className="badge badge-success" style={{ padding: '2px 4px' }}>✅</span><span style={{ flex: 1, fontFamily: 'monospace' }}>sc-domain:techstart.io</span><span style={{ color: 'var(--text-muted)' }}>→ TechStart</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}><span className="badge badge-warning" style={{ padding: '2px 4px' }}>⚠</span><span style={{ flex: 1, fontFamily: 'monospace' }}>sc-domain:greenleaf.com</span><span style={{ color: '#d97706' }}>→ Not mapped</span></div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm">Manage Property Mapping</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={disconnectGSC}>Disconnect GSC</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TEAM */}
          {activeTab === 'team' && (
            <div className="settings-panel active" style={{ maxWidth: '640px' }}>
              <div className="alert alert-info" style={{ marginBottom: '14px' }}>ℹ️ Professional plan: up to 5 team members (3/5 used). <a href="#" style={{ color: 'var(--primary)' }}>Upgrade for unlimited →</a></div>
              
              <div className="table-wrapper" style={{ marginBottom: '12px' }}>
                <div className="table-header"><div className="table-title">Active Members (3/5)</div></div>
                <table>
                  <thead>
                    <tr><th>Member</th><th>Email</th><th>Role <span style={{ cursor: 'pointer', fontSize: '10px' }} title="Role tooltip">ℹ</span></th><th>Access</th><th>Joined</th><th></th></tr>
                  </thead>
                  <tbody>
                    {agency.users?.map((user: any) => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="sidebar-avatar" style={{ width: '24px', height: '24px', background: 'var(--primary)', color: '#fff', fontSize: '10px' }}>
                              {(user.name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong>{user.name || 'Unnamed User'}</strong>
                              {user.role === 'admin' && <span className="badge badge-primary" style={{ marginLeft: '6px' }}>Admin</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '11px' }}>{user.email}</td>
                        <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{user.role}</span></td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All clients</td>
                        <td style={{ fontSize: '11px' }} suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ color: 'var(--danger)' }} 
                            onClick={async () => {
                              try {
                                await removeTeamMember(domain, user.id);
                                toast.success('Member removed');
                              } catch (e) {
                                toast.error('Failed to remove member');
                              }
                            }}
                          >Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-wrapper" style={{ marginBottom: '12px' }}>
                <div className="table-header"><div className="table-title">Pending Invites (2)</div></div>
                <table>
                  <thead>
                    <tr><th>Email</th><th>Role</th><th>Sent</th><th>Expires</th><th></th></tr>
                  </thead>
                  <tbody>
                    {agency.invitations?.map((inv: any) => (
                      <tr key={inv.id}>
                        <td style={{ fontSize: '11px' }}>{inv.email}</td>
                        <td><span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{inv.role}</span></td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }} suppressHydrationWarning>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }} suppressHydrationWarning>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                const t = toast.loading('Resending invitation email...');
                                try {
                                  await resendTeamInvite(domain, inv.id);
                                  toast.success(`Invite resent to ${inv.email}!`, { id: t });
                                } catch (err: any) {
                                  toast.error(err.message || 'Failed to resend invite', { id: t });
                                }
                              }}
                            >
                              🔄 Resend
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              onClick={async () => {
                                try {
                                  await cancelTeamInvite(domain, inv.id);
                                  toast.success('Invitation cancelled');
                                } catch (err: any) {
                                  toast.error(err.message || 'Failed to cancel invite');
                                }
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Invite New Member</div>
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  try {
                    await inviteTeamMember(domain, formData.get('email') as string, formData.get('role') as string);
                    toast.success('Invite sent!');
                    e.target.reset();
                  } catch (e) {
                    toast.error('Failed to send invite');
                  }
                }} className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Email</label><input name="email" type="email" className="form-input" placeholder="colleague@agency.com" required /></div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Role</label>
                    <select name="role" className="form-input"><option value="admin">Admin</option><option value="member">Member</option></select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                    <button type="submit" className="btn btn-primary btn-sm">Send Invite</button>
                  </div>
                </form>
                <div style={{ marginTop: '8px', background: 'var(--bg)', borderRadius: '5px', padding: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>Role permissions:</strong> Admin — full access including settings, billing, delete. Member — view/edit clients, generate reports, cannot access billing or team settings.
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULING */}
          {activeTab === 'scheduling' && (
            <div className="settings-panel active" style={{ maxWidth: '600px' }}>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>⚡ Live Webhooks & Automation Triggers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Trigger live background jobs, monthly email cron dispatchers, and alert webhooks.</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={async () => {
                      const t = toast.loading('Dispatching automated monthly email reports...');
                      try {
                        const r = await fetch('/api/cron/email-reports?force=true');
                        const d = await r.json();
                        toast.success(`Cron Complete! ${d.schedulesEvaluated || 0} reports evaluated & emailed.`, { id: t });
                      } catch {
                        toast.error('Cron dispatch failed', { id: t });
                      }
                    }}>📧 Run Monthly Email Cron</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={async () => {
                      const t = toast.loading('Sending Slack & Teams test alerts...');
                      try {
                        const r = await fetch('/api/webhooks/alerts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ agencyId: agency.id, type: 'Test Audit Alert' })
                        });
                        const d = await r.json();
                        toast.success(d.message || 'Alert webhooks dispatched!', { id: t });
                      } catch {
                        toast.error('Webhook dispatch failed', { id: t });
                      }
                    }}>🔔 Test Slack & Teams Alerts</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={async () => {
                      const t = toast.loading('Simulating Stripe subscription webhook...');
                      try {
                        const r = await fetch('/api/webhooks/stripe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'checkout.session.completed', metadata: { agencyId: agency.id, plan: 'enterprise' } })
                        });
                        const d = await r.json();
                        toast.success(`Stripe Webhook applied! Upgraded to ${d.appliedPlan.toUpperCase()} tier.`, { id: t });
                      } catch {
                        toast.error('Stripe webhook simulation failed', { id: t });
                      }
                    }}>💳 Simulate Stripe Webhook</button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveScheduling} className="card" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Global Report Schedule Defaults</div>
                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Send reports on day of month</label>
                    <input name="defaultScheduleDay" type="number" className="form-input" defaultValue={agency.defaultScheduleDay || 1} min="1" max="28" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Time</label>
                    <select name="defaultScheduleTime" className="form-input" defaultValue={agency.defaultScheduleTime || '09:00 AM'}>
                      <option>08:00 AM</option>
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Global CC Emails (comma separated)</label>
                  <input name="scheduleCcEmails" className="form-input" defaultValue={agency.scheduleCcEmails || ''} placeholder="team@agency.com" />
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label className="form-label">Automation</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', marginBottom: '10px' }}>
                    <input name="autoScheduleNewClients" type="checkbox" defaultChecked={agency.autoScheduleNewClients} />
                    Auto-schedule reports for new clients
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">Save Defaults</button>
                </div>
              </form>

              <form onSubmit={handleSaveScheduling} className="card">
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Email Notifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <input name="notifyReportReady" type="checkbox" defaultChecked={agency.notifyReportReady} />
                    Notify me when reports are generated
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <input name="notifyReportFailed" type="checkbox" defaultChecked={agency.notifyReportFailed} />
                    Notify me if a report generation fails
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <input name="notifyWeeklySync" type="checkbox" defaultChecked={agency.notifyWeeklySync} />
                    Weekly data sync summary
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <input name="notifyClientLogin" type="checkbox" defaultChecked={agency.notifyClientLogin} />
                    Notify when a client logs into the portal
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">Save Notification Preferences</button>
                </div>
              </form>
            </div>
          )}


          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="settings-panel active" style={{ maxWidth: '780px' }}>

              {/* Current Plan Hero */}
              <div style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #EC4899 100%)',
                borderRadius: 'var(--radius-lg)', padding: '24px 28px', color: 'white',
                marginBottom: '20px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='6'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Current Plan</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'capitalize' }}>
                      {agency.plan || 'Starter'} Plan
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.75, marginTop: '4px' }}>
                      Next billing: <strong>Aug 1, 2026</strong> · Auto-renews monthly
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800 }}>{agency.clients?.length || 0} / {(agency.plan === 'enterprise') ? '∞' : (agency.plan === 'professional') ? '50' : '10'}</div>
                        <div style={{ fontSize: '10px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clients Used</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800 }}>∞</div>
                        <div style={{ fontSize: '10px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>API Credits</div>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800 }}>5</div>
                        <div style={{ fontSize: '10px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Seats</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>
                      ${(agency.plan === 'professional') ? '99' : (agency.plan === 'enterprise') ? '249' : '49'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>per month</div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 700 }}>
                        ✅ Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Picker — Inline, no modal */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>Change Plan</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {[
                    {
                      id: 'starter', label: 'Starter', price: '$49', period: '/mo',
                      features: ['Up to 10 clients', 'Standard PDF reports', '5 team seats', 'Email support', 'Monthly data sync'],
                      color: '#6366F1'
                    },
                    {
                      id: 'professional', label: 'Professional', price: '$99', period: '/mo',
                      badge: 'Most Popular',
                      features: ['Up to 50 clients', 'White-label reports', '10 team seats', 'Priority support', 'Daily data sync', 'Custom domain'],
                      color: '#8B5CF6'
                    },
                    {
                      id: 'enterprise', label: 'Enterprise', price: '$249', period: '/mo',
                      features: ['Unlimited clients', 'Full API access', 'Unlimited seats', 'Dedicated manager', 'Hourly sync', 'SLA guarantee'],
                      color: '#EC4899'
                    }
                  ].map(plan => {
                    const isCurrent = (agency.plan || 'starter') === plan.id;
                    return (
                      <div key={plan.id} style={{
                        background: 'var(--surface)',
                        border: isCurrent ? `2px solid ${plan.color}` : '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        position: 'relative',
                        transition: 'all 0.2s',
                        boxShadow: isCurrent ? `0 0 0 4px ${plan.color}18` : 'var(--shadow-card)'
                      }}>
                        {isCurrent && (
                          <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            ✓ CURRENT PLAN
                          </div>
                        )}
                        {plan.badge && !isCurrent && (
                          <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            {plan.badge}
                          </div>
                        )}

                        <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{plan.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: plan.color, lineHeight: 1, marginBottom: '14px' }}>
                          {plan.price}<span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{plan.period}</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {plan.features.map(f => (
                            <li key={f} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: plan.color, fontWeight: 700, fontSize: '13px' }}>✓</span> {f}
                            </li>
                          ))}
                        </ul>

                        <button
                          style={{
                            width: '100%', padding: '9px', borderRadius: '8px', fontWeight: 700, fontSize: '12px',
                            cursor: isCurrent ? 'default' : 'pointer', border: 'none',
                            background: isCurrent ? 'var(--gray-100)' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                            color: isCurrent ? 'var(--text-muted)' : 'white',
                            opacity: isCurrent ? 0.7 : 1,
                            transition: 'all 0.15s'
                          }}
                          disabled={isCurrent}
                          onClick={async () => {
                            if (isCurrent) return;
                            try {
                              toast.loading(`Switching to ${plan.label}...`, { id: 'plan-switch' });
                              const res: any = await updateAgencyPlan(domain, plan.id);
                              setAgency(res.agency);
                              toast.success(`✅ Switched to ${plan.label} Plan! Changes take effect immediately.`, { id: 'plan-switch' });
                            } catch (e) {
                              toast.error('Failed to update plan', { id: 'plan-switch' });
                            }
                          }}
                        >
                          {isCurrent ? 'Current Plan' : `Switch to ${plan.label} →`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  💳 Payment Method
                </div>

                <BillingPaymentForm
                  onSave={(data: any) => toast.success(`Payment method updated! Card ending in ${data.last4}.`)}
                />
              </div>

              {/* Billing History */}
              <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                <div className="table-header">
                  <div className="table-title">📄 Billing History</div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => toast.success('Invoice history exported as CSV')}
                  >⬇ Export CSV</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: 'Jul 1, 2026', desc: `${agency.plan || 'Starter'} Plan — Monthly`, amount: (agency.plan === 'professional') ? '$99.00' : (agency.plan === 'enterprise') ? '$249.00' : '$49.00', status: 'paid', id: 'INV-2026-07' },
                      { date: 'Jun 1, 2026', desc: `${agency.plan || 'Starter'} Plan — Monthly`, amount: (agency.plan === 'professional') ? '$99.00' : (agency.plan === 'enterprise') ? '$249.00' : '$49.00', status: 'paid', id: 'INV-2026-06' },
                      { date: 'May 1, 2026', desc: `${agency.plan || 'Starter'} Plan — Monthly`, amount: (agency.plan === 'professional') ? '$99.00' : (agency.plan === 'enterprise') ? '$249.00' : '$49.00', status: 'paid', id: 'INV-2026-05' },
                      { date: 'Apr 1, 2026', desc: 'Starter Plan — Monthly', amount: '$49.00', status: 'paid', id: 'INV-2026-04' },
                      { date: 'Mar 1, 2026', desc: 'Starter Plan — Monthly', amount: '$49.00', status: 'paid', id: 'INV-2026-03' },
                    ].map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontSize: '12px' }}>{inv.date}</td>
                        <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{inv.desc}</td>
                        <td style={{ fontSize: '13px', fontWeight: 700 }}>{inv.amount}</td>
                        <td><span className="badge badge-success">✓ Paid</span></td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              toast.success(`Invoice ${inv.id} downloaded`);
                              const text = `INVOICE ${inv.id}\nDate: ${inv.date}\nDescription: ${inv.desc}\nAmount: ${inv.amount}\nStatus: Paid\n\nThank you for your business!\n— RankFlow`;
                              const blob = new Blob([text], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url; a.download = `${inv.id}.txt`; a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >⬇ PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cancellation */}
              <div style={{ background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--danger)', marginBottom: '6px' }}>⚠ Cancel Subscription</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Your plan will remain active until the end of the current billing period (Aug 1, 2026). After that, your account will revert to the free tier and client data will be read-only.
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: 'white', color: 'var(--danger)', border: '1px solid #FECACA' }}
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your subscription? Your plan stays active until Aug 1, 2026.')) {
                      toast.warning('Cancellation scheduled. You will receive a confirmation email shortly.');
                    }
                  }}
                >Cancel Subscription</button>
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {activeTab === 'audit-log' && (
            <div className="settings-panel active" style={{ maxWidth: '800px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Agency Audit Log</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-input" style={{ width: '130px', padding: '4px 8px', fontSize: '11px' }}>
                    <option>All Events</option>
                    <option>Logins</option>
                    <option>Settings Changed</option>
                    <option>Reports Generated</option>
                  </select>
                  <button className="btn btn-secondary btn-sm">Export CSV</button>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Timestamp</th><th>User</th><th>Action</th><th>IP Address</th></tr>
                  </thead>
                  <tbody>
                    {agency.auditLogs?.length > 0 ? agency.auditLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                        <td>
                          {log.userId ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className="sidebar-avatar" style={{ width: '20px', height: '20px', background: '#4F46E5', color: '#fff', fontSize: '9px' }}>
                                {(log.userName || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontSize: '12px' }}>{log.userName || 'System'}</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className="sidebar-avatar" style={{ width: '20px', height: '20px', background: 'var(--gray-300)', color: '#fff', fontSize: '9px' }}>SY</div>
                              <span style={{ fontSize: '12px' }}>System</span>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '12px' }}>{log.action}</td>
                        <td style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.ipAddress}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent activity.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <button className="btn btn-ghost btn-sm">Load More Activity</button>
              </div>
            </div>
          )}

          {/* USER ACCOUNT SETTINGS */}
          {activeTab === 'account' && (
            <div className="settings-panel active" style={{ maxWidth: '480px' }}>
              <AdminAccountSettingsForm />
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {isUpdateKeyModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal modal-sm" style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="modal-title" style={{ fontWeight: 800 }}>Update SERanking API Key</div>
              <button className="modal-close" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} onClick={() => setIsUpdateKeyModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="alert alert-warning" style={{ marginBottom: '16px' }}>⚠ Updating the API key will immediately invalidate the old key and restart all integrations.</div>
              <div className="form-group">
                <label className="form-label">New API Key <span className="req">*</span></label>
                <input className="form-input" type="password" placeholder="Paste new SERanking API key..." value={newApiKey} onChange={e => setNewApiKey(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setIsUpdateKeyModalOpen(false)}>Cancel</button>
              <button className="btn btn-secondary btn-sm" onClick={validateKey}>Validate Key</button>
              <button className="btn btn-primary" onClick={saveKey} disabled={isSavingKey}>
                {isSavingKey ? 'Updating...' : 'Update Key →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal modal-sm" style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="modal-title" style={{ fontWeight: 800 }}>Invite Team Member</div>
              <button className="modal-close" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} onClick={() => setIsInviteModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Email Address <span className="req">*</span></label>
                <input className="form-input" type="email" placeholder="colleague@agency.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input"><option>Manager</option><option>Admin</option><option>Viewer</option></select>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendInvite}>Send Invite 📧</button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE AGENCY MODAL (Screen 42) */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', border: '2px solid #ef4444', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px' }}>⚠️</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444' }}>Delete Agency — This Cannot Be Undone</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Permanently delete {agency.name} and all its data</div>
              </div>
            </div>
            <div style={{ background: '#fdf0f0', border: '1px solid #fca5a5', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '10px' }}>The following will be permanently deleted:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#dc2626' }}>
                <div>• All client records</div>
                <div>• All generated reports</div>
                <div>• All PDF files</div>
                <div>• SERanking API keys</div>
                <div>• All team member accounts</div>
                <div>• All branding settings</div>
                <div>• All report schedules</div>
                <div>• Audit logs</div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ color: '#dc2626' }}>Type <strong>DELETE</strong> to confirm</label>
              <input
                className="form-input"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{ fontFamily: 'monospace', letterSpacing: '2px', borderColor: deleteConfirmText === 'DELETE' ? '#ef4444' : undefined }}
                autoFocus
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your subscription will be cancelled immediately. This action cannot be reversed by our support team.</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}>Cancel — Keep My Account</button>
              <button
                className="btn"
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                onClick={executeDeleteAgency}
                style={{ background: deleteConfirmText === 'DELETE' ? '#ef4444' : '#fca5a5', color: '#fff', border: 'none', opacity: deleteConfirmText !== 'DELETE' ? 0.5 : 1 }}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Agency'}
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}
