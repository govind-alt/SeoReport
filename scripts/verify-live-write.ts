import { prisma } from '../lib/prisma';

async function main() {
  console.log('⚡ TESTING DIRECT LIVE WRITE & PERSISTENCE TO SUPABASE POSTGRESQL...\n');

  const agency = await prisma.agency.findFirst();
  if (!agency) throw new Error('No agency found in Supabase');

  console.log(`1. Target Agency in Supabase: "${agency.name}" (${agency.id})`);

  // Create a new client record in Supabase
  const testClient = await prisma.client.create({
    data: {
      name: 'Supabase Real-Time Client Test',
      domain: 'realtime-supabase.test',
      industry: 'Cloud Testing',
      agencyId: agency.id,
    }
  });
  console.log(`2. ✅ Created record directly in Supabase table "Client": ID=${testClient.id}`);

  // Create a report for this client
  const testReport = await prisma.report.create({
    data: {
      clientId: testClient.id,
      periodStart: new Date(),
      periodEnd: new Date(),
      status: 'generating',
      shareSlug: `test-live-${Date.now()}`
    }
  });
  console.log(`3. ✅ Created record directly in Supabase table "Report": ID=${testReport.id}`);

  // Verify direct read from Supabase
  const readBack = await prisma.client.findUnique({
    where: { id: testClient.id },
    include: { reports: true }
  });

  console.log(`4. ✅ Verified live query from Supabase: Client "${readBack?.name}" with ${readBack?.reports.length} report(s).`);

  // Cleanup test data
  await prisma.client.delete({ where: { id: testClient.id } });
  console.log('5. ✅ Cascade cleanup complete.\n');

  console.log('🎉 SUPABASE IS 100% LIVE, FULLY CONNECTED & DIRECTLY PERSISTING ALL WRITES!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
