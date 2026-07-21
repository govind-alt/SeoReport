/**
 * Demo Data Seed Script
 * Run with: npx tsx scripts/seed-demo.ts
 * 
 * Creates 5 realistic demo clients with 6 months of SEO data snapshots.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter } as any);

const DEMO_CLIENTS = [
  {
    name: 'Acme Corp',
    domain: 'acmecorp.com',
    industry: 'E-Commerce',
    contactEmail: 'john@acmecorp.com',
    contactName: 'John Smith',
    internalNotes: 'Key account. Monthly reports required.',
    // Monthly data: [Jan, Feb, Mar, Apr, May, Jun]
    keywords:   [{ top3: 8,  top10: 32, top100: 180, total: 250 },
                 { top3: 9,  top10: 35, top100: 195, total: 265 },
                 { top3: 10, top10: 38, top100: 205, total: 278 },
                 { top3: 11, top10: 41, top100: 215, total: 290 },
                 { top3: 11, top10: 43, top100: 220, total: 295 },
                 { top3: 12, top10: 47, top100: 228, total: 305 }],
    analytics:  [{ sessions: 5200, users: 3800, pageviews: 14000 },
                 { sessions: 5800, users: 4100, pageviews: 15500 },
                 { sessions: 6200, users: 4400, pageviews: 16800 },
                 { sessions: 7100, users: 5100, pageviews: 18900 },
                 { sessions: 7240, users: 5300, pageviews: 19500 },
                 { sessions: 8420, users: 6100, pageviews: 22000 }],
    backlinks:  { total: 1240, domains: 380, newLinks: 42, lostLinks: 8, domainTrust: 45 },
    audit:      [{ health: 68, critical: 12, warnings: 34, notices: 55 },
                 { health: 70, critical: 10, warnings: 30, notices: 50 },
                 { health: 72, critical: 9, warnings: 28, notices: 47 },
                 { health: 73, critical: 8, warnings: 26, notices: 44 },
                 { health: 74, critical: 7, warnings: 23, notices: 40 },
                 { health: 76, critical: 6, warnings: 20, notices: 38 }],
  },
  {
    name: 'TechStart.io',
    domain: 'techstart.io',
    industry: 'SaaS / Technology',
    contactEmail: 'sarah@techstart.io',
    contactName: 'Sarah Johnson',
    internalNotes: 'High growth SaaS client. Focuses on developer keywords.',
    keywords:   [{ top3: 15, top10: 55, top100: 320, total: 450 },
                 { top3: 17, top10: 60, top100: 345, total: 480 },
                 { top3: 19, top10: 68, top100: 370, total: 510 },
                 { top3: 21, top10: 74, top100: 390, total: 535 },
                 { top3: 23, top10: 80, top100: 410, total: 560 },
                 { top3: 25, top10: 87, top100: 435, total: 590 }],
    analytics:  [{ sessions: 9800, users: 7200, pageviews: 28000 },
                 { sessions: 10200, users: 7500, pageviews: 29500 },
                 { sessions: 10800, users: 7900, pageviews: 31000 },
                 { sessions: 11400, users: 8300, pageviews: 33000 },
                 { sessions: 11900, users: 8700, pageviews: 34500 },
                 { sessions: 12340, users: 9100, pageviews: 36200 }],
    backlinks:  { total: 2850, domains: 720, newLinks: 94, lostLinks: 12, domainTrust: 62 },
    audit:      [{ health: 82, critical: 5, warnings: 18, notices: 40 },
                 { health: 84, critical: 4, warnings: 16, notices: 38 },
                 { health: 85, critical: 4, warnings: 15, notices: 35 },
                 { health: 87, critical: 3, warnings: 13, notices: 32 },
                 { health: 88, critical: 3, warnings: 12, notices: 30 },
                 { health: 89, critical: 2, warnings: 10, notices: 28 }],
  },
  {
    name: 'GreenLeaf Organics',
    domain: 'greenleaforganics.com',
    industry: 'Health & Wellness',
    contactEmail: 'mike@greenleaf.com',
    contactName: 'Mike Davis',
    internalNotes: 'Local SEO focus. Volatile rankings around seasonal keywords.',
    keywords:   [{ top3: 4, top10: 18, top100: 95, total: 130 },
                 { top3: 5, top10: 20, top100: 100, total: 138 },
                 { top3: 4, top10: 19, top100: 98, total: 135 },
                 { top3: 6, top10: 23, top100: 108, total: 148 },
                 { top3: 6, top10: 24, top100: 112, total: 152 },
                 { top3: 7, top10: 27, top100: 120, total: 162 }],
    analytics:  [{ sessions: 2400, users: 1800, pageviews: 6200 },
                 { sessions: 2600, users: 1950, pageviews: 6700 },
                 { sessions: 2500, users: 1880, pageviews: 6400 },
                 { sessions: 2800, users: 2100, pageviews: 7200 },
                 { sessions: 3100, users: 2300, pageviews: 8000 },
                 { sessions: 3450, users: 2580, pageviews: 8900 }],
    backlinks:  { total: 480, domains: 145, newLinks: 18, lostLinks: 5, domainTrust: 28 },
    audit:      [{ health: 61, critical: 18, warnings: 45, notices: 72 },
                 { health: 63, critical: 16, warnings: 42, notices: 68 },
                 { health: 64, critical: 15, warnings: 40, notices: 65 },
                 { health: 66, critical: 14, warnings: 37, notices: 60 },
                 { health: 68, critical: 12, warnings: 34, notices: 56 },
                 { health: 70, critical: 10, warnings: 30, notices: 52 }],
  },
  {
    name: 'BlueSky Marketing',
    domain: 'bluesky-marketing.co.uk',
    industry: 'Marketing Agency',
    contactEmail: 'lisa@bluesky.co.uk',
    contactName: 'Lisa Chen',
    internalNotes: 'B2B SaaS client. Steady growth, consistent delivery expected.',
    keywords:   [{ top3: 6, top10: 28, top100: 155, total: 210 },
                 { top3: 7, top10: 30, top100: 160, total: 218 },
                 { top3: 7, top10: 31, top100: 163, total: 222 },
                 { top3: 8, top10: 33, top100: 168, total: 230 },
                 { top3: 8, top10: 34, top100: 172, total: 235 },
                 { top3: 9, top10: 36, top100: 178, total: 243 }],
    analytics:  [{ sessions: 3800, users: 2900, pageviews: 9800 },
                 { sessions: 4000, users: 3050, pageviews: 10300 },
                 { sessions: 4100, users: 3120, pageviews: 10600 },
                 { sessions: 4300, users: 3280, pageviews: 11100 },
                 { sessions: 4450, users: 3400, pageviews: 11500 },
                 { sessions: 4720, users: 3600, pageviews: 12200 }],
    backlinks:  { total: 890, domains: 260, newLinks: 28, lostLinks: 7, domainTrust: 38 },
    audit:      [{ health: 73, critical: 8, warnings: 25, notices: 48 },
                 { health: 74, critical: 7, warnings: 24, notices: 46 },
                 { health: 75, critical: 7, warnings: 23, notices: 44 },
                 { health: 76, critical: 6, warnings: 21, notices: 42 },
                 { health: 77, critical: 6, warnings: 20, notices: 40 },
                 { health: 78, critical: 5, warnings: 18, notices: 38 }],
  },
  {
    name: 'Metro Law Group',
    domain: 'metrolawgroup.com',
    industry: 'Legal Services',
    contactEmail: 'james@metrolaw.com',
    contactName: 'James Wilson',
    internalNotes: 'High-value legal client. Competitive local market. Backlinks are key.',
    keywords:   [{ top3: 3, top10: 14, top100: 78, total: 105 },
                 { top3: 3, top10: 15, top100: 80, total: 108 },
                 { top3: 4, top10: 17, top100: 85, total: 115 },
                 { top3: 4, top10: 18, top100: 88, total: 120 },
                 { top3: 5, top10: 20, top100: 94, total: 128 },
                 { top3: 5, top10: 22, top100: 100, total: 135 }],
    analytics:  [{ sessions: 1600, users: 1200, pageviews: 4000 },
                 { sessions: 1700, users: 1280, pageviews: 4250 },
                 { sessions: 1780, users: 1340, pageviews: 4450 },
                 { sessions: 1900, users: 1430, pageviews: 4750 },
                 { sessions: 2050, users: 1540, pageviews: 5100 },
                 { sessions: 2240, users: 1680, pageviews: 5600 }],
    backlinks:  { total: 620, domains: 195, newLinks: 34, lostLinks: 4, domainTrust: 52 },
    audit:      [{ health: 78, critical: 5, warnings: 20, notices: 38 },
                 { health: 79, critical: 5, warnings: 19, notices: 36 },
                 { health: 80, critical: 4, warnings: 17, notices: 34 },
                 { health: 81, critical: 4, warnings: 16, notices: 32 },
                 { health: 82, critical: 3, warnings: 14, notices: 30 },
                 { health: 83, critical: 3, warnings: 13, notices: 28 }],
  },
];

async function main() {
  console.log('🌱 Starting demo data seed...');

  // Find or create the demo agency
  let agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: 'localhost' }, { subdomain: 'localhost' }] }
  });

  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Digital Horizons Agency',
        slug: 'localhost',
        subdomain: 'localhost',
        plan: 'professional',
        contactEmail: 'hello@digitalhorizons.com',
        phone: '+1 (555) 234-5678',
        website: 'https://digitalhorizons.com',
        brandingColor: '#2563EB',
        brandingAccentColor: '#10B981',
      }
    });
    console.log('✅ Created demo agency: Digital Horizons Agency');
  } else {
    console.log(`ℹ️  Using existing agency: ${agency.name} (${agency.id})`);
  }

  // Delete all existing clients for this agency (clean seed)
  const existingClients = await prisma.client.findMany({ where: { agencyId: agency.id } });
  for (const c of existingClients) {
    await prisma.client.delete({ where: { id: c.id } });
  }
  console.log(`🗑  Cleared ${existingClients.length} existing clients`);

  // Create clients with full data
  const months = [5, 4, 3, 2, 1, 0]; // months ago (5 = 5 months ago, 0 = current)

  for (const clientData of DEMO_CLIENTS) {
    console.log(`\n📋 Creating client: ${clientData.name}`);

    const client = await prisma.client.create({
      data: {
        name: clientData.name,
        domain: clientData.domain,
        industry: clientData.industry,
        contactEmail: clientData.contactEmail,
        contactName: clientData.contactName,
        internalNotes: clientData.internalNotes,
        clientPortalEnabled: true,
        agencyId: agency.id,
      }
    });

    // Create 6 months of snapshots
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - months[i]);
      date.setHours(0, 0, 0, 0);

      const kw = clientData.keywords[i];
      const an = clientData.analytics[i];
      const au = clientData.audit[i];

      await prisma.keywordSnapshot.create({
        data: { clientId: client.id, date, top3: kw.top3, top10: kw.top10, top100: kw.top100, totalKeywords: kw.total }
      });
      await prisma.analyticsSnapshot.create({
        data: { clientId: client.id, date, ...an }
      });
      await prisma.auditSnapshot.create({
        data: { clientId: client.id, date, healthScore: au.health, criticalIssues: au.critical, warnings: au.warnings, notices: au.notices }
      });
    }

    // Backlink snapshot (single latest)
    await prisma.backlinkSnapshot.create({
      data: {
        clientId: client.id,
        date: new Date(),
        totalBacklinks: clientData.backlinks.total,
        referringDomains: clientData.backlinks.domains,
        newBacklinks: clientData.backlinks.newLinks,
        lostBacklinks: clientData.backlinks.lostLinks,
        domainTrust: clientData.backlinks.domainTrust,
      }
    });

    // Create 2 demo reports (May + June 2026)
    const mayDate = new Date(2026, 4, 1); // May 1
    const junDate = new Date(2026, 5, 1); // June 1

    await prisma.report.create({
      data: {
        clientId: client.id,
        title: `${clientData.name} — May 2026 SEO Report`,
        date: mayDate,
        status: 'generated',
      }
    });
    await prisma.report.create({
      data: {
        clientId: client.id,
        title: `${clientData.name} — June 2026 SEO Report`,
        date: junDate,
        status: 'generated',
      }
    });

    console.log(`  ✅ ${clientData.name}: 6 months of data + 2 reports created`);
  }

  // Create report schedule for each client
  const allClients = await prisma.client.findMany({ where: { agencyId: agency.id } });
  for (const c of allClients) {
    await prisma.reportSchedule.upsert({
      where: { clientId: c.id },
      create: { clientId: c.id, frequency: 'monthly', dayOfMonth: 1, isActive: true },
      update: {}
    });
  }

  console.log('\n✅ Demo seed complete!');
  console.log(`   Agency: ${agency.name}`);
  console.log(`   Clients: ${DEMO_CLIENTS.length}`);
  console.log(`   Reports: ${DEMO_CLIENTS.length * 2}`);
  console.log('\n🚀 Open http://localhost:3000/localhost/reports to see the data');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
