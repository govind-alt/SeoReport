'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, BookOpen, Zap, Palette, CreditCard, Wrench, Clock, Shield, ExternalLink, Eye, EyeOff } from 'lucide-react';

const GUIDES: Record<string, {
  title: string;
  iconEmoji: string;
  color: string;
  readTime: string;
  sections: { heading: string; content: string; tip?: string; code?: string }[];
}> = {
  'getting-started': {
    title: 'Getting Started with RankFlow',
    iconEmoji: '🚀',
    color: '#4F46E5',
    readTime: '5 min read',
    sections: [
      {
        heading: '1. Create your Agency Account',
        content: 'Sign up at rankflow.app/register. Enter your agency name and pick a subdomain — this becomes your dashboard URL (e.g., yourname.rankflow.app). You\'ll have immediate access on the Starter plan.',
      },
      {
        heading: '2. Connect Your SERanking API Key',
        content: 'Navigate to Settings → API Integrations. Click "Update API Key" and paste your SERanking token. The key is encrypted with AES-256 before storage — it is never exposed in plain text.',
        tip: 'Find your SERanking API token under SERanking account → Profile → API Token.',
      },
      {
        heading: '3. Add Your First Client',
        content: 'Go to Clients → Add Client. Fill in the client\'s business name, website domain, and optionally their SERanking Project ID. You can add the project ID later once data syncs.',
      },
      {
        heading: '4. Run Your First Data Sync',
        content: 'Click the Sync button in the Topbar or on a client\'s detail page. RankFlow will pull keyword rankings, backlink data, audit scores, and analytics snapshots from SERanking.',
      },
      {
        heading: '5. Generate Your First Report',
        content: 'Navigate to Reports → Generate Report. Select the client, reporting period, and which sections to include. The report can be downloaded as PDF or shared via a private link.',
        tip: 'Reports use your agency branding (Settings → Branding). Clients only see your logo and colors — RankFlow is never mentioned.',
      },
    ],
  },
  'customization': {
    title: 'Report & Brand Customization',
    iconEmoji: '🎨',
    color: '#8B5CF6',
    readTime: '4 min read',
    sections: [
      {
        heading: 'Setting Your Agency Brand Colors',
        content: 'Go to Settings → Branding & UI. Use the color picker to select your primary brand color. This color is applied to chart accents, section headers, and the report cover gradient.',
      },
      {
        heading: 'Custom Report Sections',
        content: 'When generating a report, you can toggle which sections to include: Keywords, Backlinks, Site Audit, Analytics, Competitors, and AI Recommendations. Each toggle is remembered per client.',
      },
      {
        heading: 'White-Label PDF Reports',
        content: 'Generated PDFs include your agency name and primary color. RankFlow branding is removed on Pro plan and above. The footer shows your agency name and the client\'s domain.',
        tip: 'To fully white-label, make sure you have set your Agency Name in Settings → General Profile.',
      },
      {
        heading: 'Custom Domain (Advanced)',
        content: 'On the Agency plan, you can set a custom domain (e.g., reports.youragency.com). Add a CNAME record pointing to cname.rankflow.app and enter the domain in Settings. SSL is provisioned automatically.',
        code: 'CNAME: reports.youragency.com → cname.rankflow.app',
      },
      {
        heading: 'Shareable Report Links',
        content: 'Every report has a private share link (e.g., rankflow.app/r/abc123). Share this with clients for a live web view. The link works without login and tracks view counts.',
      },
    ],
  },
  'billing': {
    title: 'Billing & Subscription',
    iconEmoji: '💳',
    color: '#10B981',
    readTime: '3 min read',
    sections: [
      {
        heading: 'Plan Overview',
        content: 'RankFlow offers three plans: Starter ($49/mo, up to 5 clients), Pro ($149/mo, up to 25 clients, white-label), and Agency ($299/mo, unlimited clients, custom domain, priority support).',
      },
      {
        heading: 'Upgrading Your Plan',
        content: 'Go to Settings → Subscription → Upgrade Plan. Changes take effect immediately. You\'ll be billed pro-rata for the remaining days in your billing cycle.',
      },
      {
        heading: 'Billing Cycle & Invoices',
        content: 'RankFlow bills monthly on the same date you signed up. Invoices are emailed to your billing email and available in the Billing portal. Download PDFs for accounting.',
        tip: 'Update your billing email in Settings → Subscription to ensure invoices reach the right person.',
      },
      {
        heading: 'Cancellation Policy',
        content: 'You can cancel anytime from Settings → Subscription → Cancel Plan. Your account stays active until the end of the current billing period. Data is retained for 30 days after cancellation.',
      },
    ],
  },
  'troubleshooting': {
    title: 'Troubleshooting & Common Issues',
    iconEmoji: '🔧',
    color: '#EF4444',
    readTime: '6 min read',
    sections: [
      {
        heading: 'API Rate Limit (429 Error)',
        content: 'A 429 error means you\'ve exceeded SERanking\'s API rate limit. This typically happens when "Auto-Sync" is enabled for many clients simultaneously. Solution: space out sync schedules by enabling "Staggered Sync" in Settings → API Integrations.',
      },
      {
        heading: 'Missing Keyword Data',
        content: 'If keyword rankings show empty or zero, verify that: (1) The SERanking Project ID is correctly set on the client, (2) The project has keywords tracked in SERanking, (3) A sync has been completed since adding the project ID.',
        tip: 'Check the SERanking dashboard directly to confirm the project has active keyword tracking.',
      },
      {
        heading: 'PDF Download Not Working',
        content: 'The PDF download uses your browser\'s print dialog (Save as PDF). If the button doesn\'t open the dialog, check that popup blockers are disabled for rankflow.app. In Chrome, go to Settings → Privacy → Site Settings → Pop-ups.',
      },
      {
        heading: 'Login / Session Issues',
        content: 'If you\'re logged out unexpectedly, clear your browser cookies for rankflow.app and log in again. Sessions expire after 30 days by default. If you see "Unauthorized" errors, your session may have expired.',
        code: 'Error: JWT_SESSION_ERROR → Clear cookies and log in again',
      },
      {
        heading: 'Report Stuck on "Generating"',
        content: 'Reports that stay in "Generating" status for more than 5 minutes may have failed silently. Refresh the page — if it still shows generating, delete the report and create a new one. Check Settings → API Keys to ensure the SERanking key is valid.',
      },
    ],
  },
};

export default function GuidePage({ params }: { params: Promise<{ domain: string; id: string }> }) {
  const { domain, id } = use(params);
  const guide = GUIDES[id];

  if (!guide) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block' }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Guide not found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The guide you&apos;re looking for doesn&apos;t exist yet.</p>
        <Link href={`/${domain}/help`} className="btn btn-primary">← Back to Help Center</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/${domain}/help`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Help Center
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{guide.title}</span>
        </div>
      </div>

      <div style={{ width: '100%', padding: '8px 0' }}>
        {/* Header card */}
        <div style={{
          background: `linear-gradient(135deg, ${guide.color}12 0%, ${guide.color}05 100%)`,
          border: `1px solid ${guide.color}30`,
          borderRadius: 16, padding: '28px 32px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `${guide.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            {guide.iconEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.3px' }}>
              {guide.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {guide.readTime}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Shield size={11} /> RankFlow Docs
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        {guide.sections.map((section, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '22px 26px', marginBottom: 14,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 7,
                background: `${guide.color}18`, color: guide.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, flexShrink: 0,
              }}>{i + 1}</span>
              {section.heading}
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: section.tip || section.code ? 14 : 0 }}>
              {section.content}
            </p>

            {section.code && (
              <div style={{
                background: 'var(--gray-50)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 14px', marginBottom: section.tip ? 12 : 0,
                fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)',
              }}>
                {section.code}
              </div>
            )}

            {section.tip && (
              <div style={{
                background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: 12, color: 'var(--primary)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                  <strong>Tip:</strong> {section.tip}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Footer CTA */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '20px 26px', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Was this helpful?</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Support team replies within 2 hours.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href={`/${domain}/help`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)',
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none',
            }}>
              <ArrowLeft size={13} /> All Guides
            </Link>
            <a href="mailto:support@rankflow.app" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 8, background: 'var(--primary)', border: 'none',
              fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none',
            }}>
              <ExternalLink size={13} /> Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
