export interface InvoicePDFData {
  id: string;
  date: string;
  amount: string;
  agencyName: string;
  billingEmail: string;
  paymentMethod: string;
  planName?: string;
  status?: string;
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export function getInvoiceHTML(inv: InvoicePDFData): string {
  return `
    <div id="invoice-render-node" style="width: 100%; max-width: 740px; padding: 36px 40px; background: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; box-sizing: border-box; margin: 0 auto; border-radius: 12px;">
      
      <!-- Top Brand Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 28px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%); border-radius: 12px; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); flex-shrink: 0;">
            RF
          </div>
          <div>
            <div style="font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">RankFlow</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px; font-weight: 500;">SEO Reports White-Label SaaS Platform</div>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">INVOICE</div>
          <div style="margin-top: 6px;">
            <span style="display: inline-block; padding: 4px 12px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669; font-weight: 800; border-radius: 20px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px;">
              ✓ ${inv.status || 'PAID IN FULL'}
            </span>
          </div>
        </div>
      </div>

      <!-- Address / Info Grid -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; margin-bottom: 32px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-sizing: border-box; overflow: hidden;">
          <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Billed To</div>
          <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inv.agencyName || 'Digital Horizons Agency'}</div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 2px; word-break: break-all;">Billing Contact: <strong>${inv.billingEmail || 'billing@digital-horizons.com'}</strong></div>
          <div style="font-size: 12px; color: #475569;">Payment Method: <strong>${inv.paymentMethod || 'Visa ending in 4242'}</strong></div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; box-sizing: border-box; overflow: hidden;">
          <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Invoice Summary</div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="color: #64748B;">Invoice Ref:</span>
            <strong style="color: #0F172A;">${inv.id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="color: #64748B;">Billing Date:</span>
            <strong style="color: #0F172A;">${inv.date}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: #64748B;">Payment Status:</span>
            <strong style="color: #059669;">Paid & Cleared</strong>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; table-layout: fixed;">
        <thead>
          <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
            <th style="width: 50%; padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.6px; border-top-left-radius: 6px;">Service Description</th>
            <th style="width: 18%; padding: 10px 14px; text-align: center; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.6px;">Interval</th>
            <th style="width: 12%; padding: 10px 14px; text-align: center; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.6px;">Qty</th>
            <th style="width: 20%; padding: 10px 14px; text-align: right; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.6px; border-top-right-radius: 6px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 16px 14px; border-bottom: 1px solid #E2E8F0;">
              <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 3px;">RankFlow ${inv.planName ? inv.planName.toUpperCase() : 'PRO'} Plan Subscription</div>
              <div style="font-size: 11px; color: #64748B; line-height: 1.4;">25 Client Workspaces, White-Label PDF Engine, Custom Domain CNAME & Automation Engine</div>
            </td>
            <td style="padding: 16px 14px; border-bottom: 1px solid #E2E8F0; text-align: center; font-size: 12px; font-weight: 600; color: #334155;">Monthly</td>
            <td style="padding: 16px 14px; border-bottom: 1px solid #E2E8F0; text-align: center; font-size: 12px; font-weight: 600; color: #334155;">1</td>
            <td style="padding: 16px 14px; border-bottom: 1px solid #E2E8F0; text-align: right; font-size: 13px; font-weight: 800; color: #0F172A;">${inv.amount}</td>
          </tr>
        </tbody>
      </table>

      <!-- Subtotal & Total Box -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 36px;">
        <div style="width: 100%; max-width: 260px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span style="font-weight: 700; color: #0F172A;">${inv.amount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748B; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
            <span>Tax (0%):</span>
            <span style="font-weight: 700; color: #0F172A;">$0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; color: #2563EB;">
            <span>Total Paid:</span>
            <span>${inv.amount}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.5;">
        Official Electronic Invoice Receipt · RankFlow SaaS Technologies Inc. · San Francisco, CA<br/>
        For billing support inquiries, please contact <a href="mailto:billing@rankflow.app" style="color: #2563EB; text-decoration: none;">billing@rankflow.app</a>
      </div>
    </div>
  `;
}

export async function downloadInvoicePDF(inv: InvoicePDFData): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Ensure dependencies are loaded
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
  ]);

  const html2canvas = (window as any).html2canvas;
  const { jsPDF } = (window as any).jspdf;

  // 2. Create offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.zIndex = '-9999';
  container.innerHTML = getInvoiceHTML(inv);
  document.body.appendChild(container);

  const targetNode = container.querySelector('#invoice-render-node') as HTMLElement;
  if (targetNode) {
    targetNode.style.maxWidth = '794px';
    targetNode.style.width = '794px';
    targetNode.style.padding = '44px 48px';
  }

  try {
    // 3. Render node to high-res canvas (2.5x scale)
    const canvas = await html2canvas(targetNode, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // 4. Calculate A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 5. Trigger forced browser download with explicit .pdf extension
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `RankFlow_Invoice_${inv.id}.pdf`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } finally {
    // Clean up
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
