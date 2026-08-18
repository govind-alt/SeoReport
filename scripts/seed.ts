/**
 * RankFlow — Demo Seed Script
 * Creates realistic demo data for client presentations.
 *
 * Run with: npx tsx scripts/seed.ts
 *
 * Demo credentials:
 *   Email:    demo@rankflow.app
 *   Password: demo123
 */

import "dotenv/config";
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


// ── Helpers ──────────────────────────────────────────────────────────────────

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - n);
  return d;
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

// ── Client fixture data ──────────────────────────────────────────────────────

const CLIENTS = [
  {
    name: 'Acme Corp',
    domain: 'acmecorp.com',
    industry: 'Technology',
    contactEmail: 'sarah@acmecorp.com',
    contactName: 'Sarah Miller',
    health: [68, 70, 72, 74, 74, 76],
    top10: [38, 40, 42, 43, 43, 47],
    traffic: [6200, 6800, 7100, 7400, 7900, 8420],
    backlinks: [1050, 1080, 1120, 1160, 1230, 1284],
  },
  {
    name: 'TechStart.io',
    domain: 'techstart.io',
    industry: 'SaaS',
    contactEmail: 'james@techstart.io',
    contactName: 'James Wilson',
    health: [80, 82, 84, 86, 87, 89],
    top10: [54, 58, 62, 71, 80, 87],
    traffic: [9800, 10200, 10800, 11200, 11800, 12340],
    backlinks: [2100, 2200, 2310, 2420, 2550, 2680],
  },
  {
    name: 'GreenLeaf Organics',
    domain: 'greenleaf.com',
    industry: 'E-commerce',
    contactEmail: 'emma@greenleaf.com',
    contactName: 'Emma Thompson',
    health: [50, 54, 56, 58, 60, 62],
    top10: [14, 16, 18, 20, 21, 23],
    traffic: [2400, 2600, 2800, 2900, 3000, 3200],
    backlinks: [480, 510, 540, 560, 580, 612],
  },
  {
    name: 'BlueSky Marketing',
    domain: 'bluesky.co.uk',
    industry: 'Marketing Agency',
    contactEmail: 'alex@bluesky.co.uk',
    contactName: 'Alex Chen',
    health: [74, 76, 78, 80, 81, 83],
    top10: [22, 24, 26, 28, 29, 31],
    traffic: [5200, 5600, 5900, 6200, 6500, 6700],
    backlinks: [890, 940, 980, 1020, 1060, 1120],
  },
  {
    name: 'RetailPro Ltd',
    domain: 'retailpro.co.uk',
    industry: 'Retail',
    contactEmail: null,
    contactName: null,
    health: [0, 0, 0, 0, 0, 45],
    top10: [0, 0, 0, 0, 0, 8],
    traffic: [0, 0, 0, 0, 0, 1200],
    backlinks: [0, 0, 0, 0, 0, 180],
  },
];

// ── AI Recommendations per client ────────────────────────────────────────────

const AI_RECS: Record<string, { color: string; text: string }[]> = {
  'acmecorp.com': [
    { color: '#EF4444', text: 'Fix 3 broken internal links on /blog/post-14 and /resources/guide-3 — these are hurting crawl budget.' },
    { color: '#F59E0B', text: 'Add meta descriptions to 8 blog pages. CTR improvement potential: +15%.' },
    { color: '#6366F1', text: 'Target "seo audit london" — competitor ranks #3 with 480 monthly searches. Your position: unranked.' },
  ],
  'techstart.io': [
    { color: '#10B981', text: 'Exceptional performance this month! Consider targeting "SaaS SEO tools" — 1,200 searches/mo, difficulty 62.' },
    { color: '#F59E0B', text: 'Page speed on /pricing is 3.8s. Optimize images to reach Core Web Vitals threshold.' },
    { color: '#6366F1', text: 'Build links to /blog/keyword-research — strong content with zero referring domains.' },
  ],
  'greenleaf.com': [
    { color: '#EF4444', text: 'Site health at 62% — 3 critical issues need urgent attention to prevent ranking drops.' },
    { color: '#F59E0B', text: 'Product pages missing schema markup. Add Product schema to unlock rich snippets.' },
    { color: '#6366F1', text: 'Target "organic skincare uk" — 2,400 searches/mo, your current position: #34.' },
  ],
  'bluesky.co.uk': [
    { color: '#10B981', text: 'Strong month! New link from searchengineland.com (Trust: 88) will improve domain authority.' },
    { color: '#F59E0B', text: '7 pages have duplicate title tags — fix these to improve click-through rates.' },
    { color: '#6366F1', text: 'Create content targeting "digital marketing agency pricing uk" — 890 searches, low competition.' },
  ],
  'retailpro.co.uk': [
    { color: '#EF4444', text: 'New client — critical technical issues found. Priority: fix mobile usability errors (14 pages).' },
    { color: '#F59E0B', text: 'No backlinks detected. Begin outreach strategy — target industry blogs and supplier sites.' },
    { color: '#6366F1', text: 'Target location-based keywords: "retail software uk" and "retail management system london".' },
  ],
};

// ── Main seed function ────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting RankFlow demo seed...\n');

  // ── 1. Agency ──────────────────────────────────────────────────────────────
  console.log('Creating agency...');
  const agency = await prisma.agency.upsert({
    where: { slug: 'digital-horizons' },
    update: {},
    create: {
      name: 'Digital Horizons Agency',
      slug: 'digital-horizons',
      subdomain: 'digital-horizons',
      plan: 'agency',
      billingEmail: 'billing@digitalhorizons.agency',
    },
  });
  console.log(`  ✓ Agency: ${agency.name} (${agency.id})`);

  // ── 2. Agency Admin (demo@rankflow.app / demo123) ─────────────────────────
  console.log('Creating agency admin user...');
  const passwordHash = await bcrypt.hash('demo123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@rankflow.app' },
    update: { password: passwordHash, agencyId: agency.id },
    create: {
      name: 'Alex Johnson',
      email: 'demo@rankflow.app',
      password: passwordHash,
      role: 'admin',
      agencyId: agency.id,
    },
  });
  console.log(`  ✓ User: ${user.email} / password: demo123`);

  // ── 2b. Super Admin (superadmin@rankflow.app / admin@123) ──────────────────
  console.log('Creating super admin user...');
  const adminHash = await bcrypt.hash('admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'superadmin@rankflow.app' },
    update: { password: adminHash },
    create: {
      name: 'Super Admin',
      email: 'superadmin@rankflow.app',
      password: adminHash,
      role: 'superadmin',
    },
  });
  console.log(`  ✓ Super Admin: superadmin@rankflow.app / password: admin@123`);

  // ── 2c. Client Portal User (client@acme.com / client123) ───────────────────
  console.log('Creating client portal user...');
  const clientHash = await bcrypt.hash('client123', 12);
  await prisma.user.upsert({
    where: { email: 'client@acme.com' },
    update: { password: clientHash, agencyId: agency.id },
    create: {
      name: 'Sarah Miller',
      email: 'client@acme.com',
      password: clientHash,
      role: 'client',
      agencyId: agency.id,
    },
  });
  console.log(`  ✓ Client: client@acme.com / password: client123`);

  // ── 3. Clients + snapshots + reports ─────────────────────────────────────

  console.log('\nCreating clients with 6 months of data...');

  for (const fixture of CLIENTS) {
    const client = await prisma.client.upsert({
      where: { id: `demo-${fixture.domain.replace(/\./g, '-')}` },
      update: {},
      create: {
        id: `demo-${fixture.domain.replace(/\./g, '-')}`,
        name: fixture.name,
        domain: fixture.domain,
        industry: fixture.industry,
        contactEmail: fixture.contactEmail,
        contactName: fixture.contactName,
        agencyId: agency.id,
        serankingProjectId: 1001 + CLIENTS.indexOf(fixture),
      },
    });

    // Snapshots — 6 months attached directly to client
    for (let m = 5; m >= 0; m--) {
      const date = monthsAgo(m);
      const idx = 5 - m;

      // Keyword snapshot
      await prisma.keywordSnapshot.upsert({
        where: { clientId_date: { clientId: client.id, date } },
        update: {},
        create: {
          clientId: client.id,
          date,
          top3Count: Math.floor(fixture.top10[idx] * 0.25),
          top10Count: fixture.top10[idx],
          top30Count: Math.floor(fixture.top10[idx] * 1.9),
          top100Count: Math.floor(fixture.top10[idx] * 4.2),
          totalKeywords: Math.floor(fixture.top10[idx] * 5.5),
          avgPosition: parseFloat((22 - idx * 1.2).toFixed(1)),
        },
      });

      // Backlink snapshot
      await prisma.backlinkSnapshot.upsert({
        where: { clientId_date: { clientId: client.id, date } },
        update: {},
        create: {
          clientId: client.id,
          date,
          domainTrust: 30 + idx * 2,
          totalBacklinks: fixture.backlinks[idx],
          newBacklinks: Math.floor(Math.random() * 60) + 30,
          lostBacklinks: Math.floor(Math.random() * 15) + 5,
          referringDomains: Math.floor(fixture.backlinks[idx] / 4.5),
          dofollowLinks: Math.floor(fixture.backlinks[idx] * 0.86),
          nofollowLinks: Math.floor(fixture.backlinks[idx] * 0.14),
        },
      });

      // Audit snapshot
      await prisma.auditSnapshot.upsert({
        where: { clientId_date: { clientId: client.id, date } },
        update: {},
        create: {
          clientId: client.id,
          date,
          healthScore: fixture.health[idx],
          pagesCrawled: 600 + idx * 40,
          criticalIssues: Math.max(0, 6 - idx),
          warningIssues: Math.max(8, 20 - idx * 2),
          noticeIssues: Math.max(15, 35 - idx * 3),
        },
      });

      // Analytics snapshot
      await prisma.analyticsSnapshot.upsert({
        where: { clientId_date: { clientId: client.id, date } },
        update: {},
        create: {
          clientId: client.id,
          date,
          organicSessions: fixture.traffic[idx],
          clicks: Math.floor(fixture.traffic[idx] * 1.18),
          impressions: Math.floor(fixture.traffic[idx] * 18),
          ctr: parseFloat((6.2 + idx * 0.1).toFixed(2)),
          avgPosition: parseFloat((8.4 - idx * 0.3).toFixed(1)),
        },
      });
    }

    // Reports — 3 months of "done" reports
    for (let m = 2; m >= 0; m--) {
      const periodStart = monthsAgo(m + 1);
      const periodEnd = endOfMonth(periodStart);

      const shareSlug = crypto.randomBytes(12).toString('base64url');
      const aiRecs = AI_RECS[fixture.domain] ?? [];

      await prisma.report.create({
        data: {
          clientId: client.id,
          periodStart,
          periodEnd,
          status: 'done',
          shareSlug,
          viewCount: Math.floor(Math.random() * 5),
          generatedAt: new Date(periodStart.getTime() + 2 * 24 * 60 * 60 * 1000),
          sectionsJson: JSON.stringify({ keywords: true, backlinks: true, audit: true, analytics: true, competitors: false, aiRecs: true }),
          aiRecsJson: JSON.stringify(aiRecs),
        },
      });
    }

    // Report Schedule
    await prisma.reportSchedule.upsert({
      where: { clientId: client.id },
      update: {},
      create: {
        agencyId: agency.id,
        clientId: client.id,
        dayOfMonth: 1,
        autoSend: true,
        isActive: true,
        lastRunAt: monthsAgo(0),
        nextRunAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });

    console.log(`  ✓ ${fixture.name} — 6 snapshots, 3 reports, schedule set`);
  }

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌐 App:      http://localhost:3000');
  console.log('  📧 Email:    demo@rankflow.app');
  console.log('  🔑 Password: demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
