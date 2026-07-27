import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  
  let agency = await prisma.agency.findFirst({ where: { slug: 'localhost' } });
  if (!agency) {
    agency = await prisma.agency.create({
      data: { name: 'Digital Horizons', slug: 'localhost', subdomain: 'localhost', plan: 'pro' }
    });
  }

  await prisma.user.upsert({
    where: { email: 'sarah.jenkins@digitalhorizons.com' },
    update: { password: hash, role: 'admin' },
    create: {
      email: 'sarah.jenkins@digitalhorizons.com',
      name: 'Sarah Jenkins',
      role: 'admin',
      password: hash,
      agencyId: agency.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'john@acmestore.com' },
    update: { password: hash, role: 'client' },
    create: {
      email: 'john@acmestore.com',
      name: 'John Miller',
      role: 'client',
      password: hash,
      agencyId: agency.id
    }
  });

  console.log('✅ Demo accounts sarah.jenkins@digitalhorizons.com and john@acmestore.com verified!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
