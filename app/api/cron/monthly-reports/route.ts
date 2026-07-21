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

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Check if a report for this month already exists to avoid duplicates
      const existingReport = await prisma.report.findFirst({
        where: {
          clientId: client.id,
          periodStart: { gte: firstOfMonth },
        }
      });

      if (!existingReport) {
        // Generate new report record
        const report = await prisma.report.create({
          data: {
            clientId: client.id,
            periodStart: firstOfMonth,
            periodEnd: lastOfMonth,
            status: 'done',
            sectionsJson: JSON.stringify({ keywords: true, backlinks: true, audit: true, analytics: true }),
          }
        });

        // Simulate sending the email
        if (client.contactEmail) {
          const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
          await sendReportReadyEmail(client.contactEmail, client.name, `${currentMonth} SEO Report`, report.id, client.agency.name);
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
