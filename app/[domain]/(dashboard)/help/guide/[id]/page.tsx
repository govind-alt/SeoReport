'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

export default function GuidePage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = use(params);
  const basePath = domain === 'localhost' ? '/localhost' : '';

  const [rated, setRated] = useState<'yes' | 'no' | null>(null);

  const guides: Record<string, { title: string, content: React.ReactNode }> = {
    'getting-started': {
      title: 'Getting Started with RankFlow',
      content: (
        <>
          <p>Welcome to RankFlow! This guide will walk you through the essential steps to configure your agency dashboard and connect your first client.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>1. Connect SERanking API</h3>
          <p>Before any data can be pulled, you need to add your SERanking API key in the <strong>Settings &gt; Integrations</strong> panel. Ensure your API key has Read access to Projects and Rankings.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>2. Add a Client</h3>
          <p>Navigate to the Clients tab and click &quot;Add Client&quot;. You will need the exact Project ID from SERanking.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>3. Generate Your First Report</h3>
          <p>Once synced, head to the Reports tab to generate a beautiful, white-labeled PDF report for your client.</p>
        </>
      )
    },
    'customization': {
      title: 'Report Customization Guide',
      content: (
        <>
          <p>RankFlow allows you to fully white-label your reports to match your agency branding.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Brand Colors</h3>
          <p>You can set a Primary Color and Accent Color in the Settings panel. These colors will automatically be applied to all charts, graphs, and the cover page gradient.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Uploading your Logo</h3>
          <p>Upload a transparent PNG logo. It will replace the RankFlow branding on the web dashboard (if shared with a client) and the footer of the PDF reports.</p>
        </>
      )
    },
    'billing': {
      title: 'Billing & Subscription Guide',
      content: (
        <>
          <p>Manage your agency plan and payment methods.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Upgrading your Plan</h3>
          <p>If you need to add more than 25 clients, you can upgrade to the Agency Pro tier in the Billing settings.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Invoices</h3>
          <p>All past invoices are available to download as PDFs at the bottom of the Billing page.</p>
        </>
      )
    },
    'troubleshooting': {
      title: 'Troubleshooting Guide',
      content: (
        <>
          <p>Having issues? Check the common solutions below.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>Missing Keywords</h3>
          <p>If keywords aren&apos;t showing up, verify that the project in SERanking is actively tracking those keywords and that the date range has recorded data.</p>
          <h3 style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>API 429 Errors</h3>
          <p>If you see a 429 error, you have hit your SERanking API rate limit. Space out your manual syncs or contact SERanking to increase your API quota.</p>
        </>
      )
    }
  };

  const guide = guides[id] || {
    title: 'Guide Not Found',
    content: <p>We couldn&apos;t find the article you&apos;re looking for.</p>
  };

  const handleFeedback = (val: 'yes' | 'no') => {
    setRated(val);
    toast.success(val === 'yes' ? 'Thank you for your feedback!' : 'Thanks! We will improve this article.');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{guide.title}</div>
          <div style={{ marginTop: '8px' }}>
            <Link href={`${basePath}/help`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              &larr; Back to Help Center
            </Link>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            {guide.content}
          </div>
          
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Was this article helpful?</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`btn ${rated === 'yes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => handleFeedback('yes')}
              >
                👍 Yes
              </button>
              <button
                className={`btn ${rated === 'no' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                onClick={() => handleFeedback('no')}
              >
                👎 No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
