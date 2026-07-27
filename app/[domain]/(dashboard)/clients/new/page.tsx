'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/actions';
import { toast } from 'sonner';

const INDUSTRIES = [
  'E-commerce', 'Healthcare', 'Legal', 'Finance', 'Real Estate',
  'SaaS / Technology', 'Education', 'Hospitality & Travel', 'Retail',
  'Construction & Trades', 'Marketing & Media', 'Non-Profit', 'Other',
];

export default function NewClientPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    clientDomain: '',
    industry: '',
    contactEmail: '',
    contactName: '',
    serankingProjectId: '',
    internalNotes: '',
    clientPortalEnabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.clientDomain) {
      toast.error('Client name and website are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await createClient(domain, {
        name: form.name,
        clientDomain: form.clientDomain,
        industry: form.industry || undefined,
        contactEmail: form.contactEmail || undefined,
        contactName: form.contactName || undefined,
        internalNotes: form.internalNotes || undefined,
        serankingProjectId: form.serankingProjectId ? parseInt(form.serankingProjectId, 10) : undefined,
        clientPortalEnabled: form.clientPortalEnabled,
      });
      if (res.success) {
        toast.success(`Client "${form.name}" created successfully!`);
        router.push(`${basePath}/clients`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create client.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '8px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link href={`${basePath}/clients`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Clients
        </Link>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Add New Client</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Add New Client
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Create a client profile to start tracking their SEO performance and generating reports.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Client Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Client / Business Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Website URL <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="clientDomain"
                placeholder="e.g. acmecorp.com"
                value={form.clientDomain}
                onChange={handleChange}
                required
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Enter the domain without https://</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Industry
              </label>
              <select
                className="form-input"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                SERanking Project ID
              </label>
              <input
                className="form-input"
                type="number"
                name="serankingProjectId"
                placeholder="e.g. 123456"
                value={form.serankingProjectId}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Find this in your SERanking dashboard</div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📧</span> Contact Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact Name
              </label>
              <input
                className="form-input"
                type="text"
                name="contactName"
                placeholder="e.g. Jane Smith"
                value={form.contactName}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact Email
              </label>
              <input
                className="form-input"
                type="email"
                name="contactEmail"
                placeholder="e.g. jane@acmecorp.com"
                value={form.contactEmail}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Used for client portal access</div>
            </div>
          </div>
        </div>

        {/* Options & Notes */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Options
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Internal Notes
            </label>
            <textarea
              className="form-input"
              name="internalNotes"
              placeholder="Any internal notes about this client..."
              value={form.internalNotes}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="clientPortalEnabled"
              checked={form.clientPortalEnabled}
              onChange={handleChange}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Enable Client Portal</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allow this client to log in and view their reports</div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link
            href={`${basePath}/clients`}
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: '160px' }}
          >
            {loading ? '⏳ Creating...' : '✓ Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
