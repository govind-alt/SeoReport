'use client';

import { use } from 'react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams?.id || 'INV-2026-07';
  const monthMap: Record<string, string> = {
    '07': 'July 1, 2026',
    '06': 'June 1, 2026',
    '05': 'May 1, 2026',
    '04': 'April 1, 2026',
    '03': 'March 1, 2026',
    '02': 'February 1, 2026',
    '01': 'January 1, 2026'
  };

  const monthCode = invoiceId.slice(-2);
  const invoiceDate = monthMap[monthCode] || 'July 1, 2026';

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Utility Control Bar (hidden when printing) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .invoice-box { border: none !important; background: white !important; color: black !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .invoice-box * { color: black !important; }
          .badge-paid { border: 1px solid #10B981 !important; color: #10B981 !important; }
        }
      ` }} />

      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/localhost/billing" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          ← Back to Billing
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🖨 Download / Print PDF
          </button>
        </div>
      </div>

      {/* Invoice Document Box */}
      <div className="invoice-box" style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '32px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '16px' }}>RF</div>
              <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>RankFlow Technologies</div>
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.5' }}>
              100 SEO Automation Way, Suite 400<br />
              San Francisco, CA 94107, USA<br />
              support@rankflow.app
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#818CF8' }}>INVOICE</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>#{invoiceId}</div>
            <div className="badge-paid" style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginTop: '10px', textTransform: 'uppercase' }}>
              ✓ PAID
            </div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Billed To</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Digital Horizons Agency</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
              contact@digitalhorizons.com<br />
              VAT ID: US948201948
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Invoice Date</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginTop: '2px' }}>{invoiceDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Payment Method</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginTop: '2px' }}>Visa ending in 4242</div>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Description</th>
              <th style={{ padding: '12px 0', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Period</th>
              <th style={{ padding: '12px 0', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '16px 0' }}>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>RankFlow Professional Plan</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>Includes 25 client profiles, white-label PDF reports &amp; GSC integration</div>
              </td>
              <td style={{ padding: '16px 0', textAlign: 'center', fontSize: '14px', color: '#94A3B8' }}>
                1 Month
              </td>
              <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '15px', fontWeight: 700 }}>
                $99.00
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#94A3B8' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>$99.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#94A3B8' }}>
              <span>Tax (0%):</span>
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>$0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #334155', marginTop: '4px', fontSize: '18px', fontWeight: 800 }}>
              <span>Total Paid:</span>
              <span style={{ color: '#818CF8' }}>$99.00</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
          Thank you for your business! If you have any questions regarding this invoice, please contact support@rankflow.app.
        </div>

      </div>
    </div>
  );
}
