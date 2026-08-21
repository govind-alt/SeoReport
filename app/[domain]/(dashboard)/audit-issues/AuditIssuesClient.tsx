'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { resolveSiteIssue, dismissSiteIssue } from '@/app/actions';

type AuditIssue = {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'notice';
  clientName: string;
  domain: string;
  affectedCount: number;
  urls: string[];
  rootCause: string;
  aiFixGuide: {
    summary: string;
    steps: string[];
    codeSnippet?: string;
  };
  status: 'open' | 'resolved' | 'dismissed';
};

const INITIAL_ISSUES: AuditIssue[] = [
  {
    id: 'issue-1',
    title: '404 Broken Internal Links Found',
    severity: 'critical',
    clientName: 'Amazon India',
    domain: 'amazon.in',
    affectedCount: 14,
    urls: ['https://amazon.in/category/electronics-old', 'https://amazon.in/deals/summer-2025', 'https://amazon.in/careers/openings'],
    rootCause: 'Internal navigation links reference deleted or renamed legacy URL paths without active 301 redirects configured.',
    aiFixGuide: {
      summary: 'Set up 301 Permanent Redirects or update internal navigation templates to point to live URLs.',
      steps: [
        'Identify all broken links using the list of affected URLs below.',
        'Add 301 Permanent Redirect rules in your .htaccess or NGINX config file.',
        'Update broken internal anchor tags in your CMS header/footer templates.'
      ],
      codeSnippet: `# NGINX Redirect Rule
rewrite ^/category/electronics-old$ /category/electronics permanent;
rewrite ^/deals/summer-2025$ /deals/current permanent;`
    },
    status: 'open'
  },
  {
    id: 'issue-2',
    title: 'Missing <title> Meta Tags',
    severity: 'critical',
    clientName: 'Zomato',
    domain: 'zomato.com',
    affectedCount: 8,
    urls: ['https://zomato.com/ncr/restaurants/delivery-opt', 'https://zomato.com/ncr/blog/top-10-cafes'],
    rootCause: 'Dynamic page template rendered an empty <title></title> tag due to null metadata parameters in SSR component.',
    aiFixGuide: {
      summary: 'Inject dynamic page title tags inside the HTML <head> section.',
      steps: [
        'Ensure every dynamic page template exports a valid page title string.',
        'Keep title lengths between 50 and 60 characters with primary keywords first.'
      ],
      codeSnippet: `<!-- HTML Meta Title -->
<title>Top 10 Cafes in NCR | Best Dining & Coffee - Zomato</title>`
    },
    status: 'open'
  },
  {
    id: 'issue-3',
    title: 'Slow Largest Contentful Paint (LCP > 4.2s)',
    severity: 'critical',
    clientName: 'TechCorp Solutions',
    domain: 'techcorp.io',
    affectedCount: 6,
    urls: ['https://techcorp.io/home', 'https://techcorp.io/enterprise-solutions'],
    rootCause: 'Hero banner images are served uncompressed (3.4 MB PNG) without WebP conversion or explicit fetchpriority="high".',
    aiFixGuide: {
      summary: 'Compress hero images into WebP format and add preloading attributes.',
      steps: [
        'Convert PNG/JPEG hero images to WebP format.',
        'Add fetchpriority="high" to top-of-page hero image tags.',
        'Implement width and height attributes to prevent layout shift (CLS).'
      ],
      codeSnippet: `<!-- Optimized Next.js / WebP Image -->
<img src="/hero-banner.webp" fetchpriority="high" width="1200" height="600" alt="Enterprise Solutions" />`
    },
    status: 'open'
  },
  {
    id: 'issue-4',
    title: 'Missing Meta Descriptions',
    severity: 'warning',
    clientName: 'FreshMart Supermarket',
    domain: 'freshmart.com',
    affectedCount: 12,
    urls: ['https://freshmart.com/organic-produce', 'https://freshmart.com/weekly-flyer'],
    rootCause: 'Product category landing pages lack meta description attributes, forcing Google to generate automated snippets.',
    aiFixGuide: {
      summary: 'Add compelling meta description tags (120 - 155 characters) for all category pages.',
      steps: [
        'Include target keywords and call-to-action in meta description string.',
        'Verify no duplicate meta descriptions exist across category pages.'
      ],
      codeSnippet: `<meta name="description" content="Shop fresh organic produce online at FreshMart. Free same-day delivery on orders over $50." />`
    },
    status: 'open'
  },
  {
    id: 'issue-5',
    title: 'Duplicate Canonical Tags Detected',
    severity: 'warning',
    clientName: 'Amazon India',
    domain: 'amazon.in',
    affectedCount: 4,
    urls: ['https://amazon.in/dp/B08N5WRWNW?ref=hp_active'],
    rootCause: 'URL parameter strings (?ref=) create duplicate indexed page variants without self-referential canonical tags.',
    aiFixGuide: {
      summary: 'Add self-referential rel="canonical" link tags to eliminate duplicate content indexing.',
      steps: [
        'Strip tracking query parameters from canonical URL destinations.',
        'Place canonical link tag in the head section of all product pages.'
      ],
      codeSnippet: `<link rel="canonical" href="https://amazon.in/dp/B08N5WRWNW" />`
    },
    status: 'open'
  },
  {
    id: 'issue-6',
    title: 'Uncompressed Image Assets (> 500 KB)',
    severity: 'notice',
    clientName: 'Zomato',
    domain: 'zomato.com',
    affectedCount: 10,
    urls: ['https://zomato.com/assets/banner-mobile.jpg'],
    rootCause: 'Static JPEG assets served without GZIP compression or modern AVIF/WebP encoding.',
    aiFixGuide: {
      summary: 'Serve optimized AVIF/WebP image formats using automated image compression CDN.',
      steps: [
        'Enable automatic WebP conversion on CDN edge server.',
        'Add loading="lazy" to below-the-fold images.'
      ]
    },
    status: 'open'
  }
];

export default function AuditIssuesClient({ domain }: { domain: string }) {
  const [issues, setIssues] = useState<AuditIssue[]>(INITIAL_ISSUES);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'notice'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeGuideModal, setActiveGuideModal] = useState<AuditIssue | null>(null);

  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (issue.status !== 'open') return false;
      if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
      if (clientFilter !== 'all' && issue.clientName !== clientFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchCause = issue.rootCause.toLowerCase().includes(q);
        const matchDomain = issue.domain.toLowerCase().includes(q);
        if (!matchTitle && !matchCause && !matchDomain) return false;
      }
      return true;
    });
  }, [issues, severityFilter, clientFilter, search]);

  const openCounts = useMemo(() => {
    const openList = issues.filter(i => i.status === 'open');
    return {
      all: openList.length,
      critical: openList.filter(i => i.severity === 'critical').reduce((acc, i) => acc + i.affectedCount, 0),
      criticalItems: openList.filter(i => i.severity === 'critical').length,
      warning: openList.filter(i => i.severity === 'warning').length,
      notice: openList.filter(i => i.severity === 'notice').length,
    };
  }, [issues]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(issues.map(i => i.clientName)));
  }, [issues]);

  const handleResolve = async (issue: AuditIssue) => {
    const t = toast.loading(`Resolving ${issue.title}...`);
    try {
      await resolveSiteIssue(domain, issue.title, issue.clientName);
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: 'resolved' } : i));
      toast.success(`Resolved ${issue.title}! Client health score increased.`, { id: t });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to resolve issue', { id: t });
    }
  };

  const handleDismiss = async (issue: AuditIssue) => {
    const t = toast.loading(`Dismissing ${issue.title}...`);
    try {
      await dismissSiteIssue(domain, issue.title);
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: 'dismissed' } : i));
      toast.info(`Dismissed issue.`, { id: t });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to dismiss issue', { id: t });
    }
  };

  const copyCodeSnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code snippet copied to clipboard!');
  };

  return (
    <div className="fade-in">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Link href={`${basePath}/`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              ← Dashboard
            </Link>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            🩺 Site Audit Diagnostic &amp; Error Resolver Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Classify critical technical SEO errors, analyze root causes, and apply remediation guides to improve site health scores.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🚨
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#EF4444' }}>{openCounts.critical}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Critical Issues</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            ⚠️
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#F59E0B' }}>{openCounts.warning}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warnings</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            ℹ️
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#3B82F6' }}>{openCounts.notice}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notices</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#10B981' }}>
              {issues.filter(i => i.status === 'resolved').length}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved Today</div>
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Severity Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
          {[
            { id: 'all', label: `All (${openCounts.all})` },
            { id: 'critical', label: `🚨 Critical (${openCounts.criticalItems})` },
            { id: 'warning', label: `⚠️ Warning (${openCounts.warning})` },
            { id: 'notice', label: `ℹ️ Notice (${openCounts.notice})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id as any)}
              style={{
                background: severityFilter === tab.id ? 'var(--primary)' : 'none',
                border: 'none',
                color: severityFilter === tab.id ? 'white' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Client & Search Filter */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-input"
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            style={{ width: '180px', padding: '8px 12px', fontSize: '13px' }}
          >
            <option value="all">All Clients</option>
            {uniqueClients.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            className="form-input"
            placeholder="Search affected URLs or errors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '260px', padding: '8px 14px', fontSize: '13px' }}
          />
        </div>

      </div>

      {/* Issues Diagnostic List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredIssues.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>All Clear! No Open Issues Found</div>
            <div style={{ fontSize: '13px' }}>Every classified error in this view has been resolved or filtered out.</div>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isCritical = issue.severity === 'critical';
            const isWarning = issue.severity === 'warning';
            
            const badgeBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
            const badgeColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';
            const badgeText = isCritical ? 'CRITICAL ERROR' : isWarning ? 'WARNING' : 'NOTICE';

            return (
              <div
                key={issue.id}
                className="card fade-in"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isCritical ? '0 8px 30px rgba(239,68,68,0.06)' : 'var(--shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                      {badgeText}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {issue.title}
                    </h3>
                    <span style={{ background: 'var(--surface-opaque)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      🏢 {issue.clientName} ({issue.domain})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveGuideModal(issue)}
                    >
                      💡 Fix Guide
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResolve(issue)}
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)' }}
                      onClick={() => handleDismiss(issue)}
                    >
                      🚫 Ignore
                    </button>
                  </div>
                </div>

                {/* Root Cause Section */}
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                    🔍 Root Cause Analysis
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {issue.rootCause}
                  </div>
                </div>

                {/* Affected URLs List */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📍 Affected URLs ({issue.affectedCount} pages):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {issue.urls.map(url => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--primary)',
                          background: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontFamily: 'monospace'
                        }}
                      >
                        {url} ↗
                      </a>
                    ))}
                    {issue.affectedCount > issue.urls.length && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 6px' }}>
                        +{issue.affectedCount - issue.urls.length} more pages
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* AI Fix Guide Modal */}
      {activeGuideModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '640px', padding: '32px', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💡</span>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Resolution &amp; Remediation Guide</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step-by-step fix instructions for {activeGuideModal.title}</p>
                </div>
              </div>
              <button onClick={() => setActiveGuideModal(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                📋 Executive Summary:
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {activeGuideModal.aiFixGuide.summary}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                🛠️ Action Steps to Resolve:
              </div>
              <ol style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
                {activeGuideModal.aiFixGuide.steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                ))}
              </ol>
            </div>

            {activeGuideModal.aiFixGuide.codeSnippet && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>💻 Implementation Code Snippet:</div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', color: 'var(--primary)' }}
                    onClick={() => copyCodeSnippet(activeGuideModal.aiFixGuide.codeSnippet!)}
                  >
                    📋 Copy Code
                  </button>
                </div>
                <pre style={{
                  background: '#0F172A',
                  color: '#38BDF8',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  border: '1px solid #1E293B',
                  margin: 0
                }}>
                  <code>{activeGuideModal.aiFixGuide.codeSnippet}</code>
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setActiveGuideModal(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleResolve(activeGuideModal);
                  setActiveGuideModal(null);
                }}
              >
                ✓ Apply &amp; Mark Resolved
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
