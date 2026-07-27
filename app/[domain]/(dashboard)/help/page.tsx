'use client';

import { useState, useMemo, use } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { logAuditAction } from '@/app/actions';
import './help.css';

export default function HelpPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : '';

  const [search, setSearch] = useState('');
  const [issueType, setIssueType] = useState('Technical Support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const kbGuides = [
    {
      slug: 'getting-started',
      icon: '🚀',
      iconBg: 'rgba(99,102,241,0.15)',
      iconColor: '#818CF8',
      title: 'Getting Started',
      desc: 'Learn how to connect your first client and configure the SERanking API.'
    },
    {
      slug: 'customization',
      icon: '🎨',
      iconBg: 'rgba(168,85,247,0.15)',
      iconColor: '#C084FC',
      title: 'Report Customization',
      desc: 'Customize colors, logos, and metric layouts for your agency’s brand.'
    },
    {
      slug: 'billing',
      icon: '💳',
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#34D399',
      title: 'Billing & Subscription',
      desc: 'Manage your subscription tier, invoices, and payment methods.'
    },
    {
      slug: 'troubleshooting',
      icon: '🔧',
      iconBg: 'rgba(239,68,68,0.15)',
      iconColor: '#F87171',
      title: 'Troubleshooting',
      desc: 'Fix common issues like API timeouts, missing keywords, and PDF generation.'
    }
  ];

  const faqs = [
    {
      q: 'Why are my SERanking API limits showing as 429?',
      a: 'A 429 status code means you have hit your SERanking API rate limit. If you have "Auto-Sync" enabled for many clients, they may all try to pull data simultaneously. Try spacing out your sync schedules in the Settings panel, or contact SERanking to increase your API quota.'
    },
    {
      q: 'How do I add a custom agency domain for report links?',
      a: 'You can set up a custom domain (e.g., reports.youragency.com) by going to Settings → Agency Branding. You will need to add a CNAME record to your DNS provider pointing to cname.rankflow.app. SSL certificates are provisioned automatically within 24 hours.'
    },
    {
      q: 'Can clients view the dashboard?',
      a: 'Currently, RankFlow is designed as an internal agency tool. Clients cannot log in directly to view the dashboard. However, you can share a live "Preview Link" with them via the Reports page, which gives them a read-only, white-labeled view of their current report.'
    },
    {
      q: 'Are PDF reports fully white-labeled?',
      a: 'Yes! As long as you have uploaded your agency logo and configured your brand colors in Settings, all generated PDF reports will be 100% white-labeled with no mention of RankFlow.'
    }
  ];

  const filteredGuides = useMemo(() => {
    if (!search.trim()) return kbGuides;
    const q = search.toLowerCase();
    return kbGuides.filter(g => g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q));
  }, [search]);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [search]);

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    const t = toast.loading('Submitting support request...');
    
    try {
      await logAuditAction(domain, `Support Request [${issueType}]: "${subject}" — ${message}`);
      toast.success('Support ticket created! Logged to Audit Log.', { id: t });
      setSubject('');
      setMessage('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send support ticket', { id: t });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Help &amp; Support</div>
        </div>
      </div>

      <div className="page-content">
        
        {/* Hero */}
        <div className="help-hero">
          <div className="help-hero-title">How can we help you today?</div>
          <div className="help-hero-sub">Search our knowledge base or get in touch with our support team.</div>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search for guides, API issues, billing..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="help-grid">
          {/* Left Col */}
          <div>
            {/* KB Categories */}
            <div className="kb-grid">
              {filteredGuides.map(g => (
                <Link key={g.slug} href={`${basePath}/help/guide/${g.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="kb-card" style={{ height: '100%' }}>
                    <div className="kb-icon" style={{ background: g.iconBg, color: g.iconColor }}>{g.icon}</div>
                    <div className="kb-title">{g.title}</div>
                    <div className="kb-desc">{g.desc}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* FAQs */}
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Frequently Asked Questions</h2>
            {filteredFaqs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-summary">
                  {faq.q} <span className="faq-icon">▼</span>
                </summary>
                <div className="faq-content">
                  {faq.a}
                </div>
              </details>
            ))}
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
                    <select
                      className="form-input"
                      value={issueType}
                      onChange={e => setIssueType(e.target.value)}
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing & Plan">Billing &amp; Plan</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="API Issues">API Issues</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Can't connect GSC"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="Describe the issue in detail..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSending}>
                    {isSending ? 'Submitting...' : 'Send Message'}
                  </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Direct Contact</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--surface-opaque)', padding: '4px 8px', borderRadius: '4px' }}>📧</span> support@rankflow.app
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'var(--surface-opaque)', padding: '4px 8px', borderRadius: '4px' }}>📞</span> 1-800-555-RANK
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
