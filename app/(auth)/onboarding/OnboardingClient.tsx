'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveOnboardingStep, skipOnboarding } from '@/app/actions';

export default function OnboardingClient({ agencyName, slug, initialStep }: { agencyName: string, slug: string, initialStep: number }) {
  const [step, setStep] = useState(initialStep);
  const router = useRouter();
  
  // Step 1 State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Step 2 State
  const [seApiKey, setSeApiKey] = useState('');
  
  // Step 3 State
  const [clientName, setClientName] = useState('');
  const [clientDomain, setClientDomain] = useState('');

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSkip = async () => {
    try { await skipOnboarding(slug); } catch (_) {}
    router.push(`/${slug}`);
  };

  const handleStep1Next = async () => {
    const t = toast.loading('Saving branding...');
    try {
      await saveOnboardingStep(slug, 2, { logoUrl: logoPreview || undefined });
      toast.dismiss(t);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save', { id: t });
    }
  };

  const handleStep2Next = async () => {
    if (!seApiKey) { setStep(3); return; }
    const t = toast.loading('Verifying API key...');
    try {
      await saveOnboardingStep(slug, 3, { seRankingApiKey: seApiKey });
      toast.success('API key saved!', { id: t });
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save API key', { id: t });
    }
  };

  const handleFinish = async () => {
    if (!clientName || !clientDomain) return;
    const t = toast.loading('Finalizing setup...');
    try {
      await saveOnboardingStep(slug, 5, { clientName, clientDomain });
      toast.success('Onboarding complete!', { id: t });
      router.push(`/${slug}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete onboarding', { id: t });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary) 0%, #3B82F6 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>RF</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>RankFlow <span style={{ opacity: 0.5, fontWeight: 400 }}>Setup</span></div>
        </div>
        <button onClick={handleSkip} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>Skip for now</button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '4px', flex: 1, background: step >= i ? 'var(--primary)' : 'var(--surface-opaque)', borderRadius: '2px', transition: 'background 0.3s' }} />
            ))}
          </div>

          <div className="card fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', boxShadow: 'var(--shadow-xl)' }}>
            
            {/* STEP 1: Branding */}
            {step === 1 && (
              <div className="fade-in">
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Welcome to RankFlow, {agencyName}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>Let&apos;s get your workspace set up. First, upload your agency&apos;s logo so your clients know they&apos;re in the right place.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px', border: '2px dashed var(--border)', borderRadius: '12px', background: 'var(--surface-opaque)', marginBottom: '32px' }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid var(--border)' }}>🏢</div>
                  )}
                  
                  <div>
                    <input type="file" id="logo-upload" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    <label htmlFor="logo-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      {logoPreview ? 'Change Logo' : 'Upload Agency Logo'}
                    </label>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recommended: Transparent PNG, at least 400x100px</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={handleStep1Next}>Continue to Integrations →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Integrations */}
            {step === 2 && (
              <div className="fade-in">
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Connect SE Ranking 🔌</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>RankFlow needs your SE Ranking API key to fetch rankings, audits, and backlink data for your clients automatically.</p>
                
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="form-label">SE Ranking API Key</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter your API key" 
                    value={seApiKey} 
                    onChange={e => setSeApiKey(e.target.value)} 
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    You can find this in your SE Ranking account under Settings &gt; API.
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="btn btn-primary" onClick={handleStep2Next}>Verify & Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3: First Client */}
            {step === 3 && (
              <div className="fade-in">
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Add Your First Client 🚀</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>Let&apos;s add a client so you can see how the dashboards and reports look.</p>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Client Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Acme Corp" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="form-label">Website Domain</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. acmecorp.com" 
                    value={clientDomain} 
                    onChange={e => setClientDomain(e.target.value)} 
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="btn btn-primary" onClick={handleFinish} disabled={!clientName || !clientDomain}>Complete Setup ✨</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
