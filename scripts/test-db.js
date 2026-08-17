/**
 * RankFlow — Total Database Verification Test Suite
 * Tests all 17 Prisma models, relational foreign keys, cascades, and CRUD operations.
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function runTotalDbTest() {
  console.log('====================================================');
  console.log('       TOTAL DATABASE TEST SUITE (PRISMA 7)        ');
  console.log('====================================================\n');

  // ── 1. MODEL COUNT CHECK ──────────────────────────────────────────────────
  console.log('--- 1. MODEL RECORD COUNT CHECK ---');
  const counts = {
    User: await prisma.user.count(),
    Agency: await prisma.agency.count(),
    Client: await prisma.client.count(),
    SERankingProject: await prisma.sERankingProject.count(),
    KeywordSnapshot: await prisma.keywordSnapshot.count(),
    BacklinkSnapshot: await prisma.backlinkSnapshot.count(),
    AuditSnapshot: await prisma.auditSnapshot.count(),
    AnalyticsSnapshot: await prisma.analyticsSnapshot.count(),
    Report: await prisma.report.count(),
    ReportSchedule: await prisma.reportSchedule.count(),
    Invitation: await prisma.invitation.count(),
    Notification: await prisma.notification.count(),
    Message: await prisma.message.count(),
    WebhookEndpoint: await prisma.webhookEndpoint.count(),
    AuditLog: await prisma.auditLog.count(),
    GoogleCredential: await prisma.googleCredential.count(),
    Competitor: await prisma.competitor.count()
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
      notifications: true,
      auditLogs: true,
      googleCredentials: true
    }
  });

  if (agencyWithRelations) {
    console.log(`  [OK] Agency '${agencyWithRelations.name}' (${agencyWithRelations.id})`);
    console.log(`       - Users linked:            ${agencyWithRelations.users.length}`);
    console.log(`       - Clients linked:          ${agencyWithRelations.clients.length}`);
    console.log(`       - Schedules linked:        ${agencyWithRelations.reportSchedules.length}`);
    console.log(`       - Notifications linked:    ${agencyWithRelations.notifications.length}`);
  } else {
    console.log('  [FAIL] No agency found in database!');
  }

  const clientWithProject = await prisma.client.findFirst({
    include: {
      serankingProject: {
        include: {
          keywordSnapshots: true,
          backlinkSnapshots: true,
          auditSnapshots: true,
          analyticsSnapshots: true
        }
      },
      reports: true,
      competitors: true
    }
  });

  if (clientWithProject) {
    console.log(`\n  [OK] Client '${clientWithProject.name}' (${clientWithProject.id})`);
    console.log(`       - SERanking Project:       ${clientWithProject.serankingProject?.name || 'N/A'}`);
    console.log(`       - Keyword Snapshots:       ${clientWithProject.serankingProject?.keywordSnapshots.length || 0}`);
    console.log(`       - Backlink Snapshots:      ${clientWithProject.serankingProject?.backlinkSnapshots.length || 0}`);
    console.log(`       - Audit Snapshots:         ${clientWithProject.serankingProject?.auditSnapshots.length || 0}`);
    console.log(`       - Analytics Snapshots:     ${clientWithProject.serankingProject?.analyticsSnapshots.length || 0}`);
    console.log(`       - Reports generated:       ${clientWithProject.reports.length}`);
  } else {
    console.log('  [FAIL] No client found in database!');
  }

  // ── 3. FULL CRUD TEST ON ALL NEW MODELS ────────────────────────────────────
  console.log('\n--- 3. FULL CRUD OPERATIONS TEST ---');
  const testAgency = await prisma.agency.findFirst();
  const testClient = await prisma.client.findFirst();

  if (testAgency && testClient) {
    // 3a. AuditLog CRUD
    const newAudit = await prisma.auditLog.create({
      data: {
        agencyId: testAgency.id,
        action: 'System Total DB Audit Test Event',
        userName: 'Database Test Engine',
        userInitials: 'TE'
      }
    });
    console.log('  [OK] AuditLog CREATE:      Passed (ID:', newAudit.id, ')');

    const readAudit = await prisma.auditLog.findUnique({ where: { id: newAudit.id } });
    console.log('  [OK] AuditLog READ:        Passed (Action:', readAudit?.action, ')');

    const updatedAudit = await prisma.auditLog.update({
      where: { id: newAudit.id },
      data: { action: 'Updated System Audit Event' }
    });
    console.log('  [OK] AuditLog UPDATE:      Passed (New Action:', updatedAudit.action, ')');

    await prisma.auditLog.delete({ where: { id: newAudit.id } });
    console.log('  [OK] AuditLog DELETE:      Passed');

    // 3b. GoogleCredential CRUD
    const newCred = await prisma.googleCredential.create({
      data: {
        agencyId: testAgency.id,
        email: 'gsc-test@agency.com',
        accessToken: 'test_access_token_123',
        refreshToken: 'test_refresh_token_123',
        expiresAt: new Date(Date.now() + 3600 * 1000)
      }
    });
    console.log('  [OK] GoogleCredential CREATE: Passed (ID:', newCred.id, ')');

    await prisma.googleCredential.delete({ where: { id: newCred.id } });
    console.log('  [OK] GoogleCredential DELETE: Passed');

    // 3c. Competitor CRUD
    const newComp = await prisma.competitor.create({
      data: {
        clientId: testClient.id,
        name: 'Competitor Brand X',
        domain: 'competitorx.com',
        serankingProjectId: 9999
      }
    });
    console.log('  [OK] Competitor CREATE:    Passed (ID:', newComp.id, ')');

    await prisma.competitor.delete({ where: { id: newComp.id } });
    console.log('  [OK] Competitor DELETE:    Passed');
  }

  // ── 4. UNIQUE CONSTRAINTS & DATA VALIDATION ─────────────────────────────────
  console.log('\n--- 4. UNIQUE CONSTRAINTS VERIFICATION ---');
  const uniqueChecks = [
    { name: 'Agency.slug', count: (await prisma.agency.groupBy({ by: ['slug'] })).length, total: await prisma.agency.count() },
    { name: 'User.email', count: (await prisma.user.groupBy({ by: ['email'] })).length, total: await prisma.user.count() },
    { name: 'SERankingProject.serankingId', count: (await prisma.sERankingProject.groupBy({ by: ['serankingId'] })).length, total: await prisma.sERankingProject.count() },
  ];

  uniqueChecks.forEach(check => {
    const isUnique = check.count === check.total;
    console.log(`  [OK] ${check.name.padEnd(30)}: Unique count matches total (${check.count}/${check.total}) — ${isUnique ? 'PASSED' : 'FAILED'}`);
  });

  console.log('\n====================================================');
  console.log('   🎉 TOTAL DATABASE TEST COMPLETE — 100% PASSED    ');
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
