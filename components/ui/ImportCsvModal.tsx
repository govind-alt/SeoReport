'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/app/actions';

export function ImportCsvModal({ isOpen, onClose, domain, onClientsAdded }: { isOpen: boolean, onClose: () => void, domain: string, onClientsAdded?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      
      // Assume CSV format: Name, Domain, ProjectID
      // Skip header if it exists
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
      
      let added = 0;
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const [name, clientDomain, projectIdStr] = parts;
          const projectId = projectIdStr ? parseInt(projectIdStr) : undefined;
          
          try {
            await createClient(domain, { name, clientDomain, serankingProjectId: isNaN(projectId as number) ? undefined : projectId });
            added++;
          } catch (err) {
            console.error(`Failed to add ${name}:`, err);
          }
        }
      }
      
      setSuccess(`Successfully imported ${added} clients.`);
      if (added > 0 && onClientsAdded) {
        onClientsAdded();
      }
      
      // Auto close after 2 seconds on success
      if (added > 0) {
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{maxWidth: '500px', width: '100%', padding: '24px', borderRadius: '12px', background: 'var(--card-bg)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
          <h2 style={{margin: 0, fontSize: '20px'}}>Import Clients from CSV</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)'}}>&times;</button>
        </div>
        
        {error && <div className="alert alert-danger" style={{marginBottom: '16px'}}>{error}</div>}
        {success && <div className="alert alert-success" style={{marginBottom: '16px'}}>{success}</div>}
        
        <div style={{background: 'var(--bg-muted)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px'}}>
          <p style={{margin: '0 0 8px 0', fontWeight: 600}}>CSV Format Requirements:</p>
          <p style={{margin: '0 0 8px 0', color: 'var(--text-muted)'}}>Columns should be in this exact order:</p>
          <code style={{background: 'var(--card-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)'}}>Name, Domain, SERanking Project ID (optional)</code>
          <p style={{margin: '8px 0 0 0', color: 'var(--text-muted)'}}>Example:</p>
          <code style={{display: 'block', background: 'var(--card-bg)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', marginTop: '4px'}}>
            Acme Corp, acmecorp.com, 123456<br/>
            Beta LLC, betallc.com, 
          </code>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          
          <label className={`btn btn-primary ${loading ? 'opacity-50 pointer-events-none' : ''}`} style={{cursor: 'pointer'}}>
            {loading ? 'Importing...' : 'Select CSV File'}
            <input 
              type="file" 
              accept=".csv" 
              style={{display: 'none'}} 
              onChange={handleImport}
              disabled={loading}
              ref={fileInputRef}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
