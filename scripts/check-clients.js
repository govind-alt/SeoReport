const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: { agency: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  const clients = await prisma.client.findMany({
    include: { agency: true, reports: true, snapshots: true }
  });
  console.log('Clients:', JSON.stringify(clients, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
