import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing report id' }, { status: 400 });
  }

  try {
    // Try to locate Chrome/Edge on the system
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

    // Launch a headless browser instance
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: execPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set a viewport size (though for PDF it will be driven by the page size)
    await page.setViewport({ width: 1200, height: 1600 });

    // Assuming we're running locally on port 3000 during dev
    // In production, you would use your actual domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reportUrl = `${baseUrl}/reports/render/${id}?print=1`;

    console.log(`Generating PDF for: ${reportUrl}`);

    // Go to the render page and wait for network to be idle
    await page.goto(reportUrl, { waitUntil: 'networkidle0' });

    // Generate PDF using exact render.css print rules
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    const rawFilename = searchParams.get('filename') || `SEO-Report-${id}`;
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');

    // Return the PDF buffer directly for browser download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
