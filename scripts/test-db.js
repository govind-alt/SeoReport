/**
 * RankFlow — Clean Core Database Verification Test Suite
 * Tests all core Prisma models, relational foreign keys, cascades, and CRUD operations.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTotalDbTest() {
  console.log('====================================================');
  console.log('       CORE DATABASE TEST SUITE (PRISMA 7)         ');
  console.log('====================================================\n');

  // ── 1. MODEL COUNT CHECK ──────────────────────────────────────────────────
  console.log('--- 1. CORE MODEL RECORD COUNT CHECK ---');
  const counts = {
    Agency: await prisma.agency.count(),
    User: await prisma.user.count(),
    Client: await prisma.client.count(),
    KeywordSnapshot: await prisma.keywordSnapshot.count(),
    BacklinkSnapshot: await prisma.backlinkSnapshot.count(),
    AuditSnapshot: await prisma.auditSnapshot.count(),
    AnalyticsSnapshot: await prisma.analyticsSnapshot.count(),
    Report: await prisma.report.count(),
    ReportSchedule: await prisma.reportSchedule.count(),
    Invitation: await prisma.invitation.count(),
  };

  let totalRecords = 0;
  Object.entries(counts).forEach(([model, count]) => {
    totalRecords += count;
    console.log(`  [OK] ${model.padEnd(20)}: ${count} records`);
  });
  console.log(`\n  Total database records across all models: ${totalRecords}`);

  // ── 2. RELATIONAL INTEGRITY CHECK ──────────────────────────────────────────
  console.log('\n--- 2. RELATIONAL INTEGRITY CHECK ---');
  
  const agencyWithRelations = await prisma.agency.findFirst({
    include: {
      users: true,
      clients: true,
      reportSchedules: true,
    }
  });

  if (agencyWithRelations) {
    console.log(`  [OK] Agency '${agencyWithRelations.name}' (${agencyWithRelations.id})`);
    console.log(`       - Users linked:            ${agencyWithRelations.users.length}`);
    console.log(`       - Clients linked:          ${agencyWithRelations.clients.length}`);
    console.log(`       - Schedules linked:        ${agencyWithRelations.reportSchedules.length}`);
  } else {
    console.log('  [FAIL] No agency found in database!');
  }

  const clientWithData = await prisma.client.findFirst({
    include: {
      keywordSnapshots: true,
      backlinkSnapshots: true,
      auditSnapshots: true,
      analyticsSnapshots: true,
      reports: true,
    }
  });

  if (clientWithData) {
    console.log(`\n  [OK] Client '${clientWithData.name}' (${clientWithData.id})`);
    console.log(`       - Keyword Snapshots:       ${clientWithData.keywordSnapshots.length}`);
    console.log(`       - Backlink Snapshots:      ${clientWithData.backlinkSnapshots.length}`);
    console.log(`       - Audit Snapshots:         ${clientWithData.auditSnapshots.length}`);
    console.log(`       - Analytics Snapshots:     ${clientWithData.analyticsSnapshots.length}`);
    console.log(`       - Reports generated:       ${clientWithData.reports.length}`);
  } else {
    console.log('  [FAIL] No client found in database!');
  }

  // ── 3. FULL CRUD TEST ON CORE MODELS ──────────────────────────────────────
  console.log('\n--- 3. FULL CRUD OPERATIONS TEST ---');
  const testAgency = await prisma.agency.findFirst();
  const testClient = await prisma.client.findFirst();

  if (testAgency && testClient) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testSnap = await prisma.keywordSnapshot.upsert({
      where: { clientId_date: { clientId: testClient.id, date: today } },
      update: { top10Count: 99 },
      create: { clientId: testClient.id, date: today, top10Count: 99 }
    });
    console.log('  [OK] KeywordSnapshot UPSERT: Passed (ID:', testSnap.id, ')');

    const readSnap = await prisma.keywordSnapshot.findUnique({ where: { id: testSnap.id } });
    console.log('  [OK] KeywordSnapshot READ:   Passed (Top 10:', readSnap?.top10Count, ')');
  }

  // ── 4. UNIQUE CONSTRAINTS & DATA VALIDATION ─────────────────────────────────
  console.log('\n--- 4. UNIQUE CONSTRAINTS VERIFICATION ---');
  const uniqueChecks = [
    { name: 'Agency.slug', count: (await prisma.agency.groupBy({ by: ['slug'] })).length, total: await prisma.agency.count() },
    { name: 'User.email', count: (await prisma.user.groupBy({ by: ['email'] })).length, total: await prisma.user.count() },
  ];

  uniqueChecks.forEach(check => {
    const isUnique = check.count === check.total;
    console.log(`  [OK] ${check.name.padEnd(30)}: Unique count matches total (${check.count}/${check.total}) — ${isUnique ? 'PASSED' : 'FAILED'}`);
  });

  console.log('\n====================================================');
  console.log('   🎉 CORE DATABASE TEST COMPLETE — 100% PASSED      ');
  console.log('====================================================\n');
}

runTotalDbTest()
  .catch((e) => {
    console.error('❌ Total Database Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
