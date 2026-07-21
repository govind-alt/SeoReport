import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || 'INV-2026-06';
  const date = searchParams.get('date') || 'Jun 1, 2026';
  const amount = searchParams.get('amount') || '$149.00';
  const agency = searchParams.get('agency') || 'Digital Horizons Agency';
  const email = searchParams.get('email') || 'billing@digital-horizons.com';
  const last4 = searchParams.get('last4') || '4242';
  const cardType = searchParams.get('cardType') || 'Visa';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RankFlow Invoice ${id}</title>
      <style>
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { padding: 48px; background: #FFFFFF; color: #1E293B; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 32px; }
        .logo-wrap { display: flex; alignItems: center; gap: 12px; }
        .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #4F8EF7, #2563EB); border-radius: 10px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .logo-title { font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
        .logo-sub { font-size: 12px; color: #64748B; margin-top: 2px; }
        .invoice-title { font-size: 26px; font-weight: 900; color: #0F172A; text-align: right; letter-spacing: -0.5px; }
        .paid-badge { display: inline-block; padding: 4px 14px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669; font-weight: 800; border-radius: 20px; font-size: 11px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .card { background: #F8FAFC; border: 1px solid #E2E8F0; borderRadius: 12px; padding: 20px; border-radius: 12px; }
        .card-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
        .card-val { font-size: 15px; font-weight: 800; color: #0F172A; }
        .card-sub { font-size: 12px; color: #64748B; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { background: #F1F5F9; border-bottom: 1px solid #CBD5E1; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
        td { padding: 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #334155; }
        .total-row { background: #F8FAFC; font-weight: 800; }
        .total-row td { font-size: 16px; color: #0F172A; border-bottom: 2px solid #0F172A; }
        .footer { text-align: center; margin-top: 48px; border-top: 1px solid #E2E8F0; padding-top: 24px; color: #94A3B8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-wrap">
          <div class="logo-icon">RF</div>
          <div>
            <div class="logo-title">RankFlow</div>
            <div class="logo-sub">SEO Reports White-Label Platform</div>
          </div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div style="text-align: right;"><span class="paid-badge">✓ Paid in Full</span></div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-label">Billed To</div>
          <div class="card-val">${agency}</div>
          <div class="card-sub">Billing Email: <strong>${email}</strong></div>
          <div class="card-sub">Payment Method: <strong>${cardType} ending in ${last4}</strong></div>
        </div>
        <div class="card">
          <div class="card-label">Invoice Reference</div>
          <div class="card-val">${id}</div>
          <div class="card-sub">Billing Date: <strong>${date}</strong></div>
          <div class="card-sub">Payment Status: <strong style="color:#059669">Paid & Verified</strong></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Billing Interval</th>
            <th>Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong style="color: #0F172A; font-size: 14px;">RankFlow SaaS Subscription</strong><br/>
              <span style="font-size: 12px; color: #64748B;">White-label PDF generator, custom CNAME routing & rank tracking engine</span>
            </td>
            <td>Monthly</td>
            <td>1</td>
            <td style="text-align: right; font-weight: 700; color: #0F172A;">${amount}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">Total Paid:</td>
            <td style="text-align: right; color: #2563EB;">${amount}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        Official Receipt · RankFlow Technologies Inc. · https://rankflow.app
      </div>
    </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
    });
    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RankFlow_Invoice_${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Puppeteer PDF error:', error);
    // Fallback: return formatted printable HTML page
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
