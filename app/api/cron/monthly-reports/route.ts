import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compileReportPdf } from '@/lib/report-compiler';
import { after } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
        // Generate new report record in pending status
        const report = await prisma.report.create({
          data: {
            clientId: client.id,
            title: reportTitle,
            status: 'pending',
            sections: JSON.stringify(['traffic', 'keywords', 'backlinks', 'audit'])
          }
        });

        // Spawn non-blocking background compiler task
        after(() => compileReportPdf(report.id));

        results.push({ clientId: client.id, status: 'created (pending PDF)', reportId: report.id });
      } else {
        results.push({ clientId: client.id, status: 'skipped (already exists)' });
      }
    }

    console.log('[CRON] Monthly report generation queued.');

    return NextResponse.json({ success: true, processed: results.length, results });

  } catch (error) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}
