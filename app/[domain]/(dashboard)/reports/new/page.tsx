'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReportWizardPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Base path for navigation
  const basePath = domain === 'localhost' ? '/localhost' : '';

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = () => {
    // In a real app, this would call an API route to generate the report
    alert('Generating report...');
    router.push(`${basePath}/reports`);
  };

  return (
    <div style={{maxWidth: '720px', margin: '0 auto', paddingBottom: '40px'}}>
      
      {/* Header */}
      <div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <div className="page-title">Generate New Report</div>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <Link href={`${basePath}/reports`} className="btn btn-secondary">✕ Cancel</Link>
          <div style={{fontSize: '18px', padding: '4px', cursor: 'pointer'}}>🔔</div>
        </div>
      </div>

      {/* Wizard Progress */}
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

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: step >= 4 ? 'var(--primary)' : 'inherit'}}>
          <div style={{width: '20px', height: '20px', borderRadius: '50%', background: step === 4 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>
            4
          </div>
          Delivery
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div className="card">
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Step 1: Select Client</div>
            
            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
              <input type="text" className="form-input" style={{flex: 1}} placeholder="🔍 Search clients..." />
              <select className="form-input" style={{width: '160px'}}>
                <option>Status: Active</option>
              </select>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              {['Acme Corp', 'TechStart', 'GreenLeaf', 'BlueSky'].map((client, idx) => {
                const isSelected = selectedClient === client;
                return (
                  <div 
                    key={client}
                    onClick={() => setSelectedClient(client)}
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      background: isSelected ? '#f0f2ff' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '36px', height: '36px', borderRadius: '6px', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)'}}>
                        LOGO
                      </div>
                      <div>
                        <div style={{fontSize: '14px', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'inherit'}}>{client} {isSelected && '✓'}</div>
                        <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>{client.toLowerCase().replace(' ', '')}.com</div>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      <span className="badge badge-success">GSC ✅</span>
                      <span className="badge badge-primary">{124 - idx * 20} kws</span>
                      {idx === 0 && <span className="badge badge-secondary">Health 76%</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedClient && (
            <div className="card" style={{marginTop: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 700, marginBottom: '12px'}}>Data Availability — {selectedClient}</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Keyword Rankings</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>124 keywords</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Backlinks</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>1,847 links</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>✅</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Technical Audit</div>
                  <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px'}}>Jun 1 audit</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', background: '#fdf8e8', border: '1px solid #e8d888', borderRadius: '6px'}}>
                  <div style={{fontSize: '20px', marginBottom: '4px'}}>⚠️</div>
                  <div style={{fontSize: '11px', fontWeight: 600}}>Analytics (GSC)</div>
                  <div style={{fontSize: '10px', color: '#8a7040', marginTop: '4px'}}>Limited data</div>
                </div>
              </div>
              <div style={{fontSize: '11px', color: '#8a7040', marginTop: '12px', background: '#fdf8e8', padding: '8px', borderRadius: '4px'}}>
                ⚠ Google Search Console has limited data for this period. Analytics section will show partial data. <a href="#" style={{color: 'var(--primary)'}}>Connect full GSC →</a>
              </div>
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
            <button className="btn btn-primary" onClick={nextStep} disabled={!selectedClient}>Continue → Step 2: Set Period</button>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="card">
            <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>Step 2: Set Report Period</div>
            
            <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Quick Presets</div>
            <div style={{display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap'}}>
              <div className="badge badge-primary" style={{padding: '6px 12px', cursor: 'pointer'}}>📅 Last Month (May 2024)</div>
              <div className="badge badge-secondary" style={{padding: '6px 12px', cursor: 'pointer'}}>Current Month</div>
              <div className="badge badge-secondary" style={{padding: '6px 12px', cursor: 'pointer'}}>Q1 2024</div>
              <div className="badge badge-secondary" style={{padding: '6px 12px', cursor: 'pointer'}}>Last 3 Months</div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div>
                <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Report Period</div>
                <div style={{border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{background: 'var(--primary)', color: '#fff', padding: '10px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{cursor:'pointer'}}>◀</span><strong>May 2024</strong><span style={{cursor:'pointer'}}>▶</span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)'}}>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <div key={m} style={{background: m === 'May' ? 'var(--primary)' : 'var(--bg)', color: m === 'May' ? '#fff' : 'inherit', padding: '12px', textAlign: 'center', fontSize: '12px', cursor: 'pointer'}}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px'}}>Selected: May 1–31, 2024</div>
              </div>

              <div>
                <div style={{fontSize: '12px', fontWeight: 600, marginBottom: '8px'}}>Compare Against</div>
                <div style={{border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{background: 'var(--bg-muted)', color: 'var(--text)', padding: '10px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{cursor:'pointer'}}>◀</span><strong>April 2024</strong><span style={{cursor:'pointer'}}>▶</span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)'}}>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <div key={m} style={{background: m === 'Apr' ? 'var(--border)' : 'var(--bg)', fontWeight: m === 'Apr' ? 700 : 400, padding: '12px', textAlign: 'center', fontSize: '12px', cursor: 'pointer'}}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px'}}>Compare: April 1–30, 2024</div>
              </div>
            </div>

            <div className="alert alert-success" style={{marginTop: '16px', padding: '12px'}}>
              ✅ Data available for May 2024 and April 2024. Report will include all sections.
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
            <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary" onClick={nextStep}>Continue → Step 3: Configure</button>
          </div>
        </>
      )}

      {/* STEP 3 */}
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
                    {name: 'Organic Traffic', desc: 'Sessions + GSC data', status: '⚠ Limited GSC', color: '#eab308'},
                    {name: 'Backlink Profile', desc: 'Domain trust + new/lost links', status: '✅ 1,847 links', color: 'var(--success)'},
                    {name: 'Technical Audit', desc: 'Health score + issues', status: '✅ Jun 1 audit', color: 'var(--success)'},
                    {name: 'Competitor Analysis', desc: '3 competitor comparison', status: '✅ 3 rivals', color: 'var(--success)'},
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
                <textarea className="form-input" style={{height: '100px', fontSize: '12px'}} placeholder="This month Acme Corp saw significant improvements..."></textarea>
                <div className="form-hint" style={{marginTop: '8px'}}>These notes appear in the Executive Summary section of the report.</div>
              </div>

              <div className="card" style={{background: '#f0f2ff', borderColor: 'var(--primary)'}}>
                <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px'}}>⏱ Estimated Generation Time</div>
                <div style={{fontSize: '24px', fontWeight: 800, color: 'var(--text)'}}>~45 seconds</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5}}>
                  7 sections · Data fetching + PDF rendering<br/>
                  You'll be notified by email when ready.
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

      {/* STEP 4 */}
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
                  <input type="email" className="form-input" defaultValue="sarah@acmecorp.com" />
                  <div className="form-hint">Auto-populated from client contact email</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">CC (agency)</label>
                  <input type="email" className="form-input" defaultValue="team@digitalhorizons.com" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Subject</label>
                  <input type="text" className="form-input" defaultValue="Acme Corp — May 2024 SEO Report" />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Personal Message (optional)</label>
                  <textarea className="form-input" style={{height: '80px'}}>Hi Sarah, please find your May 2024 SEO report attached.</textarea>
                </div>
              </div>

              <div className="card">
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>🔗 Share Link</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <div className="switch on" style={{width: '36px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative', cursor: 'pointer'}}>
                    <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '18px'}}></div>
                  </div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>Generate shareable link</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password Protection</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                    <div className="switch on" style={{width: '36px', height: '20px', background: 'var(--primary)', borderRadius: '10px', position: 'relative', cursor: 'pointer'}}>
                      <div style={{width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '18px'}}></div>
                    </div>
                    <div style={{fontSize: '12px'}}>Require password to view</div>
                  </div>
                  <input type="text" className="form-input" defaultValue="Acme2024Report!" style={{fontFamily: 'monospace'}} />
                  <div className="form-hint">Share this password separately with the client</div>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{marginBottom: '16px'}}>
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '16px'}}>🎨 Report Format</div>
                
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <div style={{flex: 1, border: '2px solid var(--primary)', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#f0f2ff', cursor: 'pointer'}}>
                      <div style={{fontSize: '24px'}}>🌐</div>
                      <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', margin: '4px 0'}}>Web Report</div>
                      <div style={{fontSize: '10px', color: 'var(--text-muted)'}}>Interactive + PDF</div>
                    </div>
                    <div style={{flex: 1, border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer'}}>
                      <div style={{fontSize: '24px'}}>📄</div>
                      <div style={{fontSize: '12px', fontWeight: 700, margin: '4px 0'}}>PDF Only</div>
                      <div style={{fontSize: '10px', color: 'var(--text-muted)'}}>Static document</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{background: 'var(--bg)', borderColor: 'var(--primary)'}}>
                <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px'}}>📋 Report Summary</div>
                <div style={{fontSize: '12px', lineHeight: 2, color: 'var(--text)'}}>
                  <div>Client: <strong>Acme Corp</strong></div>
                  <div>Period: <strong>May 2024</strong> vs Apr 2024</div>
                  <div>Sections: <strong>7 sections</strong></div>
                  <div>Email to: <strong>sarah@acmecorp.com</strong></div>
                  <div>Share link: <strong>Yes (password)</strong></div>
                  <div>Est. time: <strong>~45 seconds</strong></div>
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

    </div>
  );
}
