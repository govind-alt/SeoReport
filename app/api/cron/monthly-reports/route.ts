import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReportReadyEmail } from '@/lib/email';

// Typically, this would be secured by a header token (e.g. from Vercel Cron)
// like checking request.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`
export async function GET(request: Request) {
  try {
    console.log('[CRON] Starting monthly report generation...');

    // Fetch all active clients
    const clients = await prisma.client.findMany({
      include: {
        agency: true,
      }
    });

    const results = [];

    for (const client of clients) {
      console.log(`[CRON] Processing client: ${client.name} (${client.domain})`);

      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const reportTitle = `${currentMonth} SEO Report`;

      // Check if a report for this month already exists to avoid duplicates
      const existingReport = await prisma.report.findFirst({
        where: {
          clientId: client.id,
          title: reportTitle,
        }
      });

      if (!existingReport) {
        // Generate new report record
        const report = await prisma.report.create({
          data: {
            clientId: client.id,
            title: reportTitle,
            status: 'generated',
            // In a real app, you might trigger a background worker here 
            // to actually render the PDF and upload it to S3, saving the URL here.
            pdfUrl: `/api/reports/generate?id=${client.id}`, 
            sections: JSON.stringify(['traffic', 'keywords', 'backlinks', 'audit'])
          }
        });

        // Simulate sending the email
        if (client.contactEmail) {
          await sendReportReadyEmail(client.contactEmail, client.name, reportTitle, report.id, client.agency.name);
        }

        results.push({ clientId: client.id, status: 'created', reportId: report.id });
      } else {
        results.push({ clientId: client.id, status: 'skipped (already exists)' });
      }
    }

    console.log('[CRON] Monthly report generation completed.');

    return NextResponse.json({ success: true, processed: results.length, results });

  } catch (error) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}
