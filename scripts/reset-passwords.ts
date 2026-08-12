import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  await prisma.user.updateMany({
    data: { password: hash }
  });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(`✅ All user passwords updated to 'Password123!'. Total accounts: ${users.length}`);
  users.forEach(u => console.log(`  - [${u.role}] email: "${u.email}" (name: "${u.name}")`));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
