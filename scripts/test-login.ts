import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function testLogin(email: string, pass: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    console.log(`❌ User "${email}" not found or no password!`);
    return;
  }
  const valid = await bcrypt.compare(pass, user.password);
  console.log(`🔑 Login test for "${email}" with password "${pass}": ${valid ? '✅ VALID / SUCCESS' : '❌ INVALID'}`);
}

async function main() {
  await testLogin('superadmin@rankflow.app', 'admin@123');
  await testLogin('demo@rankflow.app', 'demo123');
  await testLogin('client@acme.com', 'client123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
