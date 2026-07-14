'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Settings, Palette, Key, Users, CreditCard, Clock, ClipboardList, Shield, Save } from 'lucide-react';

type Tab = 'general' | 'branding' | 'api-keys' | 'team' | 'billing' | 'scheduling' | 'audit-log';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isUpdateKeyModalOpen, setIsUpdateKeyModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  const saveKey = async () => {
    if (!newApiKey) { toast.error('Enter a key first'); return; }
    setIsSavingKey(true);
    const id = toast.loading('Saving API key...');
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serankingApiKey: newApiKey }),
      });
      const data = await res.json();
      toast.dismiss(id);
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to save key');
      } else {
        setHasKey(true);
        setIsUpdateKeyModalOpen(false);
        setNewApiKey('');
        toast.success('✅ API key updated and encrypted successfully.');
      }
    } catch {
      toast.dismiss(id);
      toast.error('Network error — please try again');
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Configure your SEO agency branding, API integrations, and portal settings</div>
        </div>
      </div>

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Settings Nav */}
        <div className="settings-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'branding', label: 'Branding & UI', icon: Palette },
            { id: 'api-keys', label: 'API Integrations', icon: Key },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'billing', label: 'Subscription', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', 
                  borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500, 
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)', 
                  background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panels */}
        <div className="settings-panels-container" style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> Agency Profile</h3>
              <div className="form-group">
                <label className="form-label">Agency Name</label>
                <input className="form-input" defaultValue="Digital Horizons Agency"/>
              </div>
              <div className="form-group">
                <label className="form-label">Subdomain</label>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <input className="form-input" style={{ borderRadius: 'var(--radius) 0 0 var(--radius)' }} defaultValue="digital-horizons"/>
                  <div style={{ background: 'var(--gray-100)', padding: '8px 12px', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 var(--radius) var(--radius) 0', fontSize: '13px', color: 'var(--text-muted)' }}>.rankflow.app</div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => toast.success('Profile settings saved!')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> Save Profile
              </button>
            </div>
          )}

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={18} /> White-label Branding</h3>
              <div className="form-group">
                <label className="form-label">Primary Color Theme</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" className="form-input" style={{ width: '60px', height: '40px', padding: '2px' }} defaultValue="#6366F1" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Used on client dashboards and shared report pages.</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => toast.success('Branding update saved!')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> Save Branding
              </button>
            </div>
          )}

          {/* API KEYS */}
          {activeTab === 'api-keys' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={18} /> Integration & API Credentials</h3>
              <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>SE Ranking API Connection</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Wired to AES-256 secure database vault. Required for automated client keyword position checks and crawl reports.
                </p>
                <div style={{ marginTop: '12px' }}>
                  {hasKey ? (
                    <span className="badge badge-success">✅ Connected</span>
                  ) : (
                    <span className="badge badge-warning">⚠️ Demo Mode Fallback Active</span>
                  )}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setIsUpdateKeyModalOpen(true)}>Update API Key</button>
            </div>
          )}

          {/* TEAM */}
          {activeTab === 'team' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Team Members</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Manage agency employees and guest workspace permissions.</p>
              <button className="btn btn-secondary" onClick={() => toast.info('Team invitations require GSC mail connection.')}>+ Invite Member</button>
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="settings-panel active" style={{ maxWidth: '660px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={18} /> Plan Subscription</h3>
              <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700 }}>Pro Agency Package</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Next charge: $149/mo on July 24, 2026</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Key Modal */}
      {isUpdateKeyModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsUpdateKeyModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">Update SE Ranking API Key</div>
              <button className="modal-close" onClick={() => setIsUpdateKeyModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">New API Token</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter your SE Ranking Token..."
                  value={newApiKey}
                  onChange={e => setNewApiKey(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-secondary" onClick={() => setIsUpdateKeyModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveKey} disabled={isSavingKey}>
                  {isSavingKey ? 'Saving...' : 'Update Vault Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
