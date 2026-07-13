'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/actions';
import { toast } from 'sonner';

export default function AddClientPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [clientDomain, setClientDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [projectId, setProjectId] = useState('');
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [gscConnected, setGscConnected] = useState(false);
  
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');

  const handleAddCompetitor = () => {
    if (newCompetitor && !competitors.includes(newCompetitor)) {
      setCompetitors([...competitors, newCompetitor]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (comp: string) => {
    setCompetitors(competitors.filter(c => c !== comp));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await createClient(domain, {
        name,
        clientDomain,
        serankingProjectId: projectId ? parseInt(projectId) : undefined,
        industry,
        contactEmail,
        contactName,
        internalNotes,
        clientPortalEnabled: portalEnabled,
        gscConnected
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(domain === 'localhost' ? `/localhost/clients/${res.client.id}` : `/clients/${res.client.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
      setLoading(false);
    }
  };

  // Base path calculation for links
  let basePath = '';
  if (domain !== 'localhost') {
    basePath = '';
  } else {
    // When using path-based routing locally
    basePath = `/${domain}`;
  }

  return (
    <>
      <div className="page-header" style={{marginBottom: '20px'}}>
        <div>
          <div className="page-title" style={{fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500}}>
            <Link href={`${basePath}/clients`} style={{color: 'inherit', textDecoration: 'none'}}>← Clients</Link> / <span style={{color: 'var(--primary)'}}>Add New Client</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '680px', margin: '0 auto'}}>
        {success && (
          <div className="alert alert-success" style={{marginBottom: '14px'}}>
            ✅ Client saved! Redirecting to overview...
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" style={{marginBottom: '14px'}}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{marginBottom: '12px'}}>
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Client Information</div>
            
            <div className="form-row mb-3">
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Client / Company Name *</label>
                <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corporation" />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Industry</label>
                <select className="form-input" value={industry} onChange={e => setIndustry(e.target.value)}>
                  <option value="">Select Industry...</option>
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Local Business">Local Business</option>
                </select>
              </div>
            </div>

            <div className="form-row mb-3">
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Website URL *</label>
                <input type="text" className="form-input" required value={clientDomain} onChange={e => setClientDomain(e.target.value)} placeholder="https://acmecorp.com" />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Contact Email</label>
                <input type="email" className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sarah@acmecorp.com" />
              </div>
            </div>

            <div className="form-row mb-3">
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Contact Name</label>
                <input type="text" className="form-input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Sarah Miller" />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label className="form-label">Logo</label>
                <div style={{border: '1px dashed var(--border)', borderRadius: '5px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', background: 'var(--bg-muted)'}}>
                  📎 Upload logo (PNG/SVG)
                </div>
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Internal Notes</label>
              <textarea className="form-input" style={{height: '60px', resize: 'vertical'}} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="E-commerce focus, target UK + US markets..."></textarea>
            </div>
          </div>

          <div className="card" style={{marginBottom: '12px'}}>
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '4px'}}>SERanking Project</div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px'}}>Link this client to an existing SERanking project</div>
            
            <div className="form-group mb-4">
              <label className="form-label">SERanking Project ID</label>
              <input type="number" className="form-input" value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="e.g. 123456" />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Track Competitors (optional)</label>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px'}}>
                {competitors.map(comp => (
                  <div key={comp} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <div className="form-input" style={{flex: 1, padding: '8px 12px', background: 'var(--bg-muted)'}}>{comp}</div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleRemoveCompetitor(comp)}>✕</button>
                  </div>
                ))}
                
                <div style={{display: 'flex', gap: '8px'}}>
                  <input type="text" className="form-input" placeholder="competitor.com" value={newCompetitor} onChange={e => setNewCompetitor(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCompetitor())} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCompetitor}>+ Add</button>
                </div>
              </div>
              <div className="form-hint">Competitors are tracked for comparison charts. Will be fetched from SERanking if linked.</div>
            </div>
          </div>

          <div className="card" style={{marginBottom: '12px'}}>
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Google Search Console</div>
            
            {!gscConnected ? (
              <div style={{border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', background: 'var(--bg-muted)'}}>
                <div style={{fontSize: '28px', marginBottom: '8px'}}>📊</div>
                <div style={{fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px'}}>Connect Google Search Console</div>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px'}}>Required for organic traffic, clicks, impressions, CTR, and avg position data</div>
                <button type="button" className="btn btn-primary" onClick={() => {
                  toast.success('Successfully connected to Google Search Console (Simulated)');
                  setGscConnected(true);
                }}>🔗 Connect with Google OAuth</button>
                <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px'}}>You&apos;ll be redirected to Google to authorize access to this client&apos;s GSC property</div>
              </div>
            ) : (
              <div style={{border: '1px solid #10b981', borderRadius: '8px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{fontSize: '24px'}}>✅</div>
                  <div>
                    <div style={{fontSize: '14px', fontWeight: 600, color: 'var(--text)'}}>Google Search Console Connected</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Data will be synced during the next scheduled run.</div>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGscConnected(false)}>Disconnect</button>
              </div>
            )}
          </div>

          <div className="card" style={{marginBottom: '24px'}}>
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Client Portal Access</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div className={`switch ${portalEnabled ? 'on' : ''}`} onClick={() => setPortalEnabled(!portalEnabled)} style={{width: '36px', height: '20px', background: portalEnabled ? 'var(--primary)' : 'var(--border)', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.2s'}}>
                <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: portalEnabled ? '18px' : '2px', transition: '0.2s'}}></div>
              </div>
              <div>
                <div style={{fontSize: '14px', fontWeight: 500}}>Enable client portal login</div>
                <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Client receives an email invite to view their reports</div>
              </div>
            </div>

            {portalEnabled && (
              <div className="form-row mb-0">
                <div className="form-group" style={{marginBottom: 0}}>
                  <label className="form-label">Portal Email</label>
                  <input type="email" className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="sarah@acmecorp.com" />
                </div>
                <div className="form-group" style={{marginBottom: 0}}>
                  <label className="form-label">Display Name</label>
                  <input type="text" className="form-input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Sarah Miller" />
                </div>
              </div>
            )}
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
            <Link href={`${basePath}/clients`} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Client →'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
