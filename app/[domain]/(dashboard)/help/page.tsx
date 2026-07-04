'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import './help.css';

export default function HelpPage() {
  const [isSending, setIsSending] = useState(false);

  const submitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    setTimeout(() => {
      setIsSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success('Support ticket created! We will email you shortly.');
    }, 1200);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Help & Support</div>
        </div>
      </div>

      <div className="page-content">
        
        {/* Hero */}
        <div className="help-hero">
          <div className="help-hero-title">How can we help you today?</div>
          <div className="help-hero-sub">Search our knowledge base or get in touch with our support team.</div>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search for guides, API issues, billing..."/>
          </div>
        </div>

        <div className="help-grid">
          {/* Left Col */}
          <div>
            {/* KB Categories */}
            <div className="kb-grid">
              <div className="kb-card" onClick={() => toast.info('Opening Getting Started guide...')}>
                <div className="kb-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>🚀</div>
                <div className="kb-title">Getting Started</div>
                <div className="kb-desc">Learn how to connect your first client and configure the SERanking API.</div>
              </div>
              <div className="kb-card" onClick={() => toast.info('Opening Report Customization guide...')}>
                <div className="kb-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>🎨</div>
                <div className="kb-title">Report Customization</div>
                <div className="kb-desc">Customize colors, logos, and metric layouts for your agency&apos;s brand.</div>
              </div>
              <div className="kb-card" onClick={() => toast.info('Opening Billing guide...')}>
                <div className="kb-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>💳</div>
                <div className="kb-title">Billing & Subscription</div>
                <div className="kb-desc">Manage your subscription, invoices, and payment methods.</div>
              </div>
              <div className="kb-card" onClick={() => toast.info('Opening Troubleshooting guide...')}>
                <div className="kb-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>🔧</div>
                <div className="kb-title">Troubleshooting</div>
                <div className="kb-desc">Fix common issues like API timeouts, missing keywords, and PDF generation.</div>
              </div>
            </div>

            {/* FAQs */}
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Frequently Asked Questions</h2>
            <details className="faq-item">
              <summary className="faq-summary">Why are my SERanking API limits showing as 429? <span className="faq-icon">▼</span></summary>
              <div className="faq-content">
                A 429 status code means you have hit your SERanking API rate limit. If you have &quot;Auto-Sync&quot; enabled for many clients, they may all try to pull data simultaneously. Try spacing out your sync schedules in the Settings panel, or contact SERanking to increase your API quota.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">How do I add a custom agency domain for report links? <span className="faq-icon">▼</span></summary>
              <div className="faq-content">
                You can set up a custom domain (e.g., <code>reports.youragency.com</code>) by going to <strong>Settings &rarr; Agency Branding</strong>. You will need to add a CNAME record to your DNS provider pointing to <code>cname.rankflow.app</code>. SSL certificates are provisioned automatically within 24 hours.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Can clients view the dashboard? <span className="faq-icon">▼</span></summary>
              <div className="faq-content">
                Currently, RankFlow is designed as an internal agency tool. Clients cannot log in directly to view the dashboard. However, you can share a live &quot;Preview Link&quot; with them via the Reports page, which gives them a read-only, white-labeled view of their current report.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Are PDF reports fully white-labeled? <span className="faq-icon">▼</span></summary>
              <div className="faq-content">
                Yes! As long as you have uploaded your agency logo and configured your brand colors in Settings, all generated PDF reports will be 100% white-labeled with no mention of RankFlow.
              </div>
            </details>
          </div>

          {/* Right Col (Contact) */}
          <div>
            <div className="support-card">
              <div className="support-header">
                <div className="support-title">Contact Support</div>
                <div className="support-subtitle">We usually reply within 2 hours.</div>
              </div>
              <div className="support-body">
                <form onSubmit={submitSupport}>
                  <div className="form-group">
                    <label className="form-label">Issue Type</label>
                    <select className="form-input">
                      <option>Technical Support</option>
                      <option>Billing & Plan</option>
                      <option>Feature Request</option>
                      <option>API Issues</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input type="text" className="form-input" placeholder="e.g. Can't connect GSC" required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-input" rows={5} placeholder="Describe the issue in detail..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Direct Contact</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--gray-50)', padding: '4px', borderRadius: '4px' }}>📧</span> support@rankflow.app
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'var(--gray-50)', padding: '4px', borderRadius: '4px' }}>📞</span> 1-800-555-RANK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
