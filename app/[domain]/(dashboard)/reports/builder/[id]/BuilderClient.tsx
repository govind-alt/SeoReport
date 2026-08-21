'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Module-level counter for generating stable, unique module IDs.
// Using a counter avoids calling Date.now() or Math.random() inside React render.
let moduleIdCounter = 0;
const nextModuleId = () => { moduleIdCounter += 1; return moduleIdCounter; };
import { saveReportTemplate, updateExecutiveSummary } from '@/app/actions';

const AVAILABLE_MODULES = [
  { id: 'executive_summary', title: 'Executive Summary', icon: '📝', description: 'Executive summary of overall performance.' },
  { id: 'seo_rankings', title: 'Keyword Rankings', icon: '📈', description: 'Position tracking for target keywords.' },
  { id: 'site_audit', title: 'Site Audit (Health)', icon: '🏥', description: 'Technical SEO health score and issues.' },
  { id: 'backlinks', title: 'Backlink Profile', icon: '🔗', description: 'New, lost, and total active backlinks.' },
  { id: 'traffic_overview', title: 'Traffic Overview', icon: '📊', description: 'Google Analytics traffic snapshot.' },
  { id: 'custom_text', title: 'Custom Text Block', icon: '✍️', description: 'Add your own notes or analysis.' },
  { id: 'page_break', title: 'Page Break', icon: '✂️', description: 'Force a new page in the PDF export.' }
];

export default function BuilderClient({ reportId, clientName, initialModules, domain }: { reportId: string, clientName: string, initialModules: string[], domain: string }) {
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;
  const [activeModules, setActiveModules] = useState<{ id: string; type: string }[]>(() =>
    initialModules.map(m => ({ id: `${m}-${nextModuleId()}`, type: m }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editingExecSummary, setEditingExecSummary] = useState(false);
  const [execSummaryText, setExecSummaryText] = useState('Over the past 30 days, overall organic search performance demonstrated strong positive momentum across primary KPI metrics.');
  const router = useRouter();

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('moduleType', type);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('moduleType');
    if (!type) return;

    // Use stable counter-based ID — never call Date.now() during render/event handlers in state initializers.
    const newModule = { id: `${type}-${nextModuleId()}`, type };
    const newModules = [...activeModules];
    
    // If dropping at the end
    if (index === -1) {
      newModules.push(newModule);
    } else {
      newModules.splice(index, 0, newModule);
    }
    
    setActiveModules(newModules);
  };

  const removeModule = (id: string) => {
    setActiveModules(activeModules.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const t = toast.loading('Saving report layout...');
    
    try {
      const moduleTypes = activeModules.map(m => m.type);
      await saveReportTemplate(reportId, moduleTypes);
      toast.success('Report layout saved!', { id: t });
      router.push(`${basePath}/reports`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save report';
      toast.error(message, { id: t });
    } finally {
      setIsSaving(false);
    }
  };

  const getModuleTitle = (type: string) => AVAILABLE_MODULES.find(m => m.id === type)?.title || type;
  const getModuleIcon = (type: string) => AVAILABLE_MODULES.find(m => m.id === type)?.icon || '🧩';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', margin: '-24px', background: 'var(--bg)' }}>
      
      {/* Sidebar: Available Modules */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Report Modules</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Drag and drop to add to report</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {AVAILABLE_MODULES.map(mod => (
            <div 
              key={mod.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, mod.id)}
              style={{ 
                padding: '16px', background: 'var(--surface-opaque)', border: '1px solid var(--border)', 
                borderRadius: '8px', cursor: 'grab', display: 'flex', gap: '12px', alignItems: 'flex-start',
                transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
              }}
              onDragOver={e => e.preventDefault()}
            >
              <div style={{ fontSize: '20px' }}>{mod.icon}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{mod.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{mod.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Builder Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Editing: {clientName} Monthly Report</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: {reportId}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`${basePath}/reports`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>Cancel</Link>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div 
          style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, -1)}
        >
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              --- Top of PDF Report ---
            </div>

            {activeModules.map((mod, index) => (
              <div key={mod.id} style={{ position: 'relative', marginBottom: '16px' }}>
                {/* Drop Zone Above */}
                <div 
                  style={{ height: '10px', margin: '-5px 0', zIndex: 10 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, index)}
                />
                
                {/* Module Block */}
                <div className="card fade-in" style={{ 
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', 
                  padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{ fontSize: '24px', cursor: 'grab', opacity: 0.5 }}>⋮⋮</div>
                  <div style={{ fontSize: '24px', background: 'var(--surface-opaque)', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getModuleIcon(mod.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{getModuleTitle(mod.type)}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {mod.type === 'page_break' ? 'Forces a new page in the final PDF export.' : 'Dynamic content block.'}
                    </div>
                  </div>
                  
                  {/* Config Options based on type */}
                  {mod.type === 'executive_summary' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingExecSummary(true)}
                    >
                      ✏ Edit Summary
                    </button>
                  )}
                  {mod.type === 'custom_text' && (
                    <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Edit Text</button>
                  )}
                  {mod.type === 'seo_rankings' && (
                    <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Configure</button>
                  )}
                  
                  <button 
                    onClick={() => removeModule(mod.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '20px', cursor: 'pointer', padding: '8px', marginLeft: '8px' }}
                    title="Remove Module"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {activeModules.length === 0 && (
              <div style={{ padding: '60px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📥</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Drag modules here</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Build your custom report layout</div>
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              --- End of PDF Report ---
            </div>

          </div>
        </div>
      </div>

      {/* Edit Executive Summary Modal */}
      {editingExecSummary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '560px', padding: '28px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>✏ Edit Executive Summary</div>
              <button onClick={() => setEditingExecSummary(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Summary Content (Will appear in Web & PDF Reports)
              </label>
              <textarea
                className="form-input"
                rows={6}
                value={execSummaryText}
                onChange={e => setExecSummaryText(e.target.value)}
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingExecSummary(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const t = toast.loading('Updating Executive Summary...');
                  try {
                    await updateExecutiveSummary(reportId, execSummaryText);
                    toast.success('Executive Summary updated!', { id: t });
                    setEditingExecSummary(false);
                  } catch (e: any) {
                    toast.error(e?.message || 'Failed to update summary', { id: t });
                  }
                }}
              >
                ✓ Save Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
