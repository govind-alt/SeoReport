'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getClients, generateReportForClient } from '@/app/actions';

export default function ReportWizardPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  // Pre-compute "last month" label outside the render to avoid Date.now() in JSX.
  const lastMonthLabel = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const [step, setStep] = useState(1);
  // Client data is typed generically since the action returns Prisma-inferred shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Background generating modal states
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'pending' | 'generating' | 'success' | 'failed'>('pending');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [newReportId, setNewReportId] = useState<string | null>(null);

  // Base path for navigation
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  useEffect(() => {
    async function load() {
      try {
        const list = await getClients(domain);
        setClients(list);
        if (list.length > 0) {
          setSelectedClientId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load clients:', err);
      } finally {
        setLoadingClients(false);
      }
    }
    load();
  }, [domain]);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = async () => {
    if (!selectedClientId) return;

    setGeneratingReport(true);
    setGenerationStatus('pending');
    setGenerationError(null);

    try {
      const res = await generateReportForClient(domain, selectedClientId);
      if (!res.success || !res.reportId) {
        throw new Error('Failed to create report record');
      }

      setNewReportId(res.reportId);
      setGenerationStatus('generating');

      // Begin polling the background PDF generation endpoint
      pollStatus(res.reportId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate report generation';
      console.error(err);
      setGenerationStatus('failed');
      setGenerationError(message);
    }
  };

  const pollStatus = (reportId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/reports/${reportId}/pdf`);
        if (!res.ok) throw new Error('Status endpoint error');
        const data = await res.json();

        if (data.status === 'generated') {
          clearInterval(interval);
          setGenerationStatus('success');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setGenerationStatus('failed');
          setGenerationError(data.error || 'Puppeteer rendering failed');
        }
      } catch (err: unknown) {
        console.error('Polling error:', err);
        if (attempts > 30) { // Limit to 60 seconds
          clearInterval(interval);
          setGenerationStatus('failed');
          setGenerationError('Polling timed out. The PDF will continue generating in the background. Check your email shortly.');
        }
      }
    }, 2000);
  };

  return (
    <div style={{maxWidth: '720px', margin: '0 auto', paddingBottom: '40px'}}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Header */}
      <div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <div className="page-title">Generate New Report</div>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <Link href={`${basePath}/reports`} className="btn btn-secondary">✕ Cancel</Link>
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: step >= 1 ? 'var(--primary)' : 'inherit'}}>
          <div style={{width: '20px', height: '20px', borderRadius: '50%', background: step > 1 ? 'var(--primary)' : step === 1 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>
            {step > 1 ? '✓' : '1'}
          </div>
          Select Client
        </div>
        <div style={{flex: 1, height: '2px', background: step > 1 ? 'var(--primary)' : 'var(--border)', margin: '0 12px'}}></div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: step >= 2 ? 'var(--primary)' : 'inherit'}}>
          <div style={{width: '20px', height: '20px', borderRadius: '50%', background: step > 2 ? 'var(--primary)' : step === 2 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>
            {step > 2 ? '✓' : '2'}
          </div>
          Set Period
        </div>
        <div style={{flex: 1, height: '2px', background: step > 2 ? 'var(--primary)' : 'var(--border)', margin: '0 12px'}}></div>

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: step >= 3 ? 'var(--primary)' : 'inherit'}}>
          <div style={{width: '20px', height: '20px', borderRadius: '50%', background: step > 3 ? 'var(--primary)' : step === 3 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>
            {step > 3 ? '✓' : '3'}
          </div>
          Configure
        </div>
        <div style={{flex: 1, height: '2px', background: step > 3 ? 'var(--primary)' : 'var(--border)', margin: '0 12px'}}></div>

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: step === 4 ? 'var(--primary)' : 'inherit'}}>
          <div style={{width: '20px', height: '20px', borderRadius: '50%', background: step === 4 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>
            4
          </div>
          Delivery
        </div>
      </div>

      {/* STEP 1: Select Client */}
      {step === 1 && (
        <>
          <div className="card">
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Step 1: Select Client</div>
            
            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
              <input type="text" className="form-input" style={{flex: 1}} placeholder="🔍 Search clients..." />
            </div>

            {loadingClients ? (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>Loading clients...</div>
            ) : clients.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                No active clients. <Link href={`${basePath}/clients/new`} style={{color: 'var(--primary)', textDecoration: 'underline'}}>Create a client first →</Link>
              </div>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                {clients.map((c) => {
                  const isSelected = selectedClientId === c.id;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      style={{
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '16px',
                        background: isSelected ? '#f0f2ff' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                        <div style={{width: '36px', height: '36px', borderRadius: '6px', background: c.color || 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                          {c.initials}
                        </div>
                        <div>
                          <div style={{fontSize: '14px', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'inherit'}}>{c.name} {isSelected && '✓'}</div>
                          <div style={{fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px'}}>{c.website}</div>
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        <span className="badge badge-success">GSC Ready</span>
                        <span className="badge badge-primary">{c.industry}</span>
                        {c.health && <span className="badge badge-secondary">Health {c.health}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="card" style={{marginTop: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 700, marginBottom: '12px'}}>Data Availability — {selectedClient.name}</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Keywords</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>SERanking Active</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Backlinks</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>SERanking Active</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Site Audit</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>Weekly Syncs</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: '#fdf8e8', border: '1px solid #e8d888', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>⚠️</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Traffic (GSC)</div>
                  <div style={{fontSize: '10px', color: '#8a7040', marginTop: '4px'}}>Connected</div>
                </div>
              </div>
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
            <button className="btn btn-primary" onClick={nextStep} disabled={!selectedClientId}>Continue → Step 2: Set Period</button>
          </div>
        </>
      )}

      {/* STEP 2: Set Period */}
      {step === 2 && (
        <>
          <div className="card">
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Step 2: Set Report Period</div>
            
            <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Quick Presets</div>
            <div style={{display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap'}}>
              <div className="badge badge-primary" style={{padding: '6px 12px', cursor: 'pointer'}}>📅 Last Month ({lastMonthLabel})</div>
              <div className="badge badge-secondary" style={{padding: '6px 12px', cursor: 'pointer'}}>Current Month</div>
              <div className="badge badge-secondary" style={{padding: '6px 12px', cursor: 'pointer'}}>Last 3 Months</div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div>
                <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Report Period</div>
                <div style={{border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{background: 'var(--primary)', color: '#fff', padding: '10px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>◀</span><strong>June 2026</strong><span>▶</span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)'}}>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <div key={m} style={{background: m === 'Jun' ? 'var(--primary)' : 'var(--bg)', color: m === 'Jun' ? '#fff' : 'inherit', padding: '12px', textAlign: 'center', fontSize: '12px', cursor: 'pointer'}}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Compare Against</div>
                <div style={{border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{background: 'var(--bg-muted)', color: 'var(--text)', padding: '10px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>◀</span><strong>May 2026</strong><span>▶</span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)'}}>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <div key={m} style={{background: m === 'May' ? 'var(--border)' : 'var(--bg)', fontWeight: m === 'May' ? 700 : 400, padding: '12px', textAlign: 'center', fontSize: '12px', cursor: 'pointer'}}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success" style={{marginTop: '16px', padding: '12px'}}>
              ✅ Data sync reports ready. All selected sections will be fully compiled.
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
            <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary" onClick={nextStep}>Continue → Step 3: Configure</button>
          </div>
        </>
      )}

      {/* STEP 3: Configure */}
      {step === 3 && (
        <>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px'}}>
            <div>
              <div className="card">
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Report Sections</div>
                
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  {[
                    {name: 'Executive Summary', desc: 'KPI scorecard + highlights + notes', status: '✅ Data ready', color: 'var(--success)'},
                    {name: 'Keyword Rankings', desc: 'Positions + distribution + movers', status: '✅ 124 keywords', color: 'var(--success)'},
                    {name: 'Organic Traffic', desc: 'Sessions + GSC data', status: '✅ Connected', color: 'var(--success)'},
                    {name: 'Backlink Profile', desc: 'Domain trust + new/lost links', status: '✅ Link sync ready', color: 'var(--success)'},
                    {name: 'Technical Audit', desc: 'Health score + issues', status: '✅ Audit sync ready', color: 'var(--success)'},
                    {name: 'Competitor Analysis', desc: '3 competitor comparison', status: '✅ Active', color: 'var(--success)'},
                    {name: 'AI Search Visibility', desc: 'ChatGPT/Gemini mentions (opt.)', status: 'Optional', color: 'var(--text-muted)', off: true},
                    {name: 'Recommendations', desc: 'Next month action items', status: '✅ Auto-generated', color: 'var(--success)'},
                  ].map((s, i) => (
                    <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div className={`switch ${!s.off ? 'on' : ''}`} style={{width: '36px', height: '20px', background: !s.off ? 'var(--primary)' : 'var(--border)', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.2s'}}>
                          <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: !s.off ? '18px' : '2px', transition: '0.2s'}}></div>
                        </div>
                        <div>
                          <div style={{fontSize: '14px', fontWeight: 600}}>{s.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{s.desc}</div>
                        </div>
                      </div>
                      <div style={{fontSize: '11px', fontWeight: 600, color: s.color, background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: '4px'}}>
                        {s.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', fontWeight: 700, marginBottom: '8px'}}>Executive Notes (optional)</div>
                <textarea className="form-input" style={{height: '100px', fontSize: '12px'}} placeholder="Add strategic highlights..."></textarea>
                <div className="form-hint" style={{marginTop: '8px'}}>These notes appear in the Executive Summary section.</div>
              </div>

              <div className="card" style={{background: '#f0f2ff', borderColor: 'var(--primary)'}}>
                <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px'}}>⏱ Estimated Generation Time</div>
                <div style={{fontSize: '24px', fontWeight: 800, color: 'var(--text)'}}>~20 seconds</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5}}>
                  7 sections · Data fetching + PDF rendering<br/>
                  Processes asynchronously.
                </div>
              </div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
            <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary" onClick={nextStep}>Continue → Step 4: Delivery</button>
          </div>
        </>
      )}

      {/* STEP 4: Delivery */}
      {step === 4 && (
        <>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px'}}>
            <div>
              <div className="card" style={{marginBottom: '16px'}}>
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>📧 Email Delivery</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <div className="switch on" style={{width: '36px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative', cursor: 'pointer'}}>
                    <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '18px'}}></div>
                  </div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>Send report by email</div>
                </div>

                <div className="form-group">
                  <label className="form-label">To (client)</label>
                  <input type="email" className="form-input" defaultValue={selectedClient?.contactEmail || 'sarah@acmecorp.com'} />
                  <div className="form-hint">Auto-populated from client profile settings</div>
                </div>
                
                <div className="form-group mb-0">
                  <label className="form-label">CC (agency)</label>
                  <input type="email" className="form-input" defaultValue="team@agency.com" />
                </div>
              </div>

              <div className="card">
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>🔗 Share Link</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <div className="switch on" style={{width: '36px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative', cursor: 'pointer'}}>
                    <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '18px'}}></div>
                  </div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>Generate shareable web report link</div>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{marginBottom: '16px'}}>
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>🎨 Format</div>
                <div style={{flex: 1, border: '2px solid var(--primary)', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#f0f2ff'}}>
                  <div style={{fontSize: '24px'}}>🌐</div>
                  <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', margin: '4px 0'}}>Web & PDF Report</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)'}}>Interactive HTML + PDF compilation</div>
                </div>
              </div>

              <div className="card" style={{background: 'var(--bg)', borderColor: 'var(--primary)'}}>
                <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px'}}>📋 Summary</div>
                <div style={{fontSize: '12px', lineHeight: 2, color: 'var(--text)'}}>
                  <div>Client: <strong>{selectedClient?.name}</strong></div>
                  <div>Period: <strong>June 2026</strong></div>
                  <div>CC: <strong>team@agency.com</strong></div>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleGenerate} style={{width: '100%', justifyContent: 'center', padding: '12px', marginTop: '16px', fontSize: '14px'}}>
                🚀 Generate Report Now
              </button>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-start', marginTop: '16px'}}>
            <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
          </div>
        </>
      )}

      {/* Screen 27: PDF Generation Progress spinner and listener Overlay */}
      {generatingReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {generationStatus === 'pending' || generationStatus === 'generating' ? (
              <>
                <div style={{ margin: '0 auto 20px', width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Compiling Report Metrics...</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Triggering Puppeteer worker to export A4 pages and update snapshot databases.</p>
                <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Please wait, this will take about 10–20 seconds...</p>
              </>
            ) : generationStatus === 'success' ? (
              <>
                <div style={{ margin: '0 auto 20px', width: '56px', height: '56px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#065f46' }}>PDF Compilation Completed!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your SEO report has been successfully generated and saved to the portal database.</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Link href={`${basePath}/reports`} className="btn btn-primary" onClick={() => setGeneratingReport(false)}>
                    View Reports List
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div style={{ margin: '0 auto 20px', width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                  ✕
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#991b1b' }}>Failed to Compile PDF</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{generationError || 'An unexpected worker timeout occurred.'}</p>
                <button className="btn btn-secondary" onClick={() => setGeneratingReport(false)}>
                  Close and Retry
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
