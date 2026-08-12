import puppeteer from 'puppeteer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { prisma } from './prisma';
import { sendReportReadyEmail } from './email';

/**
 * Compiles a report to a static PDF in the background using Puppeteer.
 * Persists the resulting file locally in the public folder and dispatches email.
 */
export async function compileReportPdf(reportId: string) {
  try {
    console.log(`[PDF Compiler] Starting PDF compilation for report: ${reportId}`);
    
    // Set Report status to generating
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'generating' }
    });

    // Locate Google Chrome or Microsoft Edge executable on Windows/host machine
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      path.join(os.homedir(), '.cache', 'puppeteer', 'chrome', 'win64-150.0.7871.24', 'chrome-win64', 'chrome.exe')
    ];
    
    let execPath: string | undefined = undefined;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        execPath = p;
        break;
      }
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: execPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reportUrl = `${baseUrl}/reports/render/${reportId}?print=1`;

    console.log(`[PDF Compiler] Fetching report preview page: ${reportUrl}`);
    await page.goto(reportUrl, { waitUntil: 'networkidle0' });

    // Inject print styles for styling alignment
    await page.addStyleTag({
      content: `
        @media print {
          /* Hide UI controllers */
          .screen-controls, #screenControls, .btn, button, nav, .sidebar { display: none !important; }
          
          /* Prevent breaks inside widgets */
          .kpi-card, .tw, table, tr, .recharts-wrapper { page-break-inside: avoid; }
          
          body { padding: 0 !important; margin: 0 !important; }
          
          /* Ensure color printing */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `
    });

    // Render A4 formatted PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    // Ensure storage path folder exists
    const pdfDir = path.join(process.cwd(), 'public', 'pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `report-${reportId}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `/pdf/${fileName}`;

    // Update DB status to generated and link pdfUrl
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'generated',
        pdfUrl
      },
      include: {
        client: {
          include: {
            agency: true
          }
        }
      }
    });

    console.log(`[PDF Compiler] Finished. PDF file saved to: ${pdfUrl}`);

    // Dispatch notification email
    if (updatedReport.client.contactEmail) {
      try {
        await sendReportReadyEmail(
          updatedReport.client.contactEmail,
          updatedReport.client.name,
          updatedReport.title,
          reportId,
          updatedReport.client.agency.name
        );
      } catch (emailErr) {
        console.error('[PDF Compiler] Failed to send report ready email:', emailErr);
      }
    }

  } catch (error: any) {
    console.error(`[PDF Compiler Error] Failed to generate PDF for report ${reportId}:`, error);
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'failed',
        pdfUrl: null
      }
    });
  }
}
