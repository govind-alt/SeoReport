import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncClientData } from '@/app/actions';

export async function POST() {
  try {
    // Find all clients in the system across all agencies
    const clients = await prisma.client.findMany({
      include: {
        agency: true
      }
    });

    if (clients.length === 0) {
      return NextResponse.json({ success: true, message: 'No clients found in the database. Sync skipped.' });
    }

    let synced = 0;
    let failed = 0;

    for (const client of clients) {
      try {
        const domain = client.agency.slug || client.agency.subdomain || 'localhost';
        await syncClientData(client.id, domain);
        synced++;
      } catch (err: any) {
        console.error(`[Daily Sync Cron] Failed to sync data for client ${client.name} (ID: ${client.id}):`, err);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily SEO and GSC sync job completed.`,
      syncedCount: synced,
      failedCount: failed,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    console.error('Webhook daily-sync cron error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
