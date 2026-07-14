'use client';

import Link from 'next/link';
import { use } from 'react';

export default function GuidePage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = use(params);
  
  const guides: Record<string, { title: string, content: React.ReactNode }> = {
    'getting-started': {
      title: 'Getting Started with RankFlow',
      content: (
        <>
          <p>Welcome to RankFlow! This guide will walk you through the essential steps to configure your agency dashboard and connect your first client.</p>
          <h3>1. Connect SERanking API</h3>
          <p>Before any data can be pulled, you need to add your SERanking API key in the <strong>Settings &gt; Integrations</strong> panel. Ensure your API key has Read access to Projects and Rankings.</p>
          <h3>2. Add a Client</h3>
          <p>Navigate to the Clients tab and click "Add Client". You will need the exact Project ID from SERanking.</p>
          <h3>3. Generate Your First Report</h3>
          <p>Once synced, head to the Reports tab to generate a beautiful, white-labeled PDF report for your client.</p>
        </>
      )
    },
    'customization': {
      title: 'Report Customization',
      content: (
        <>
          <p>RankFlow allows you to fully white-label your reports to match your agency branding.</p>
          <h3>Brand Colors</h3>
          <p>You can set a Primary Color and Accent Color in the Settings panel. These colors will automatically be applied to all charts, graphs, and the cover page gradient.</p>
          <h3>Uploading your Logo</h3>
          <p>Upload a transparent PNG logo. It will replace the RankFlow branding on the web dashboard (if shared with a client) and the footer of the PDF reports.</p>
        </>
      )
    },
    'billing': {
      title: 'Billing & Subscription',
      content: (
        <>
          <p>Manage your agency plan and payment methods.</p>
          <h3>Upgrading your Plan</h3>
          <p>If you need to add more than 25 clients, you can upgrade to the Agency Pro tier in the Billing settings.</p>
          <h3>Invoices</h3>
          <p>All past invoices are available to download as PDFs at the bottom of the Billing page.</p>
        </>
      )
    },
    'troubleshooting': {
      title: 'Troubleshooting Guide',
      content: (
        <>
          <p>Having issues? Check the common solutions below.</p>
          <h3>Missing Keywords</h3>
          <p>If keywords aren't showing up, verify that the project in SERanking is actively tracking those keywords and that the date range has recorded data.</p>
          <h3>API 429 Errors</h3>
          <p>If you see a 429 error, you have hit your SERanking API rate limit. Space out your manual syncs or contact SERanking to increase your API quota.</p>
        </>
      )
    }
  };

  const guide = guides[id] || {
    title: 'Guide Not Found',
    content: <p>We couldn't find the article you're looking for.</p>
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{guide.title}</div>
          <div style={{ marginTop: '8px' }}>
            <Link href={`/help`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              &larr; Back to Help Center
            </Link>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#334155' }}>
            {guide.content}
          </div>
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#64748B' }}>Was this article helpful?</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost btn-sm">👍 Yes</button>
              <button className="btn btn-ghost btn-sm">👎 No</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
