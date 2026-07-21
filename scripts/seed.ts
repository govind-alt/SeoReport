import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Clearing existing database records...');
  await prisma.invitation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.keywordSnapshot.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.backlinkSnapshot.deleteMany();
  await prisma.auditSnapshot.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  console.log('Seeding demo agency...');
  const agency = await prisma.agency.create({
    data: {
      name: 'Digital Horizons Agency',
      slug: 'localhost',
      subdomain: 'localhost',
      plan: 'professional',
      contactEmail: 'contact@digitalhorizons.com',
      website: 'https://digitalhorizons.com'
    }
  });

  console.log('Seeding agency administrator...');
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      name: 'Agency Admin',
      email: 'admin@agency.com',
      password: adminPassword,
      role: 'admin',
      agencyId: agency.id
    }
  });

  console.log('Seeding super administrator...');
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  await prisma.user.create({
    data: {
      name: 'Global Superadmin',
      email: 'superadmin@rankflow.app',
      password: superadminPassword,
      role: 'superadmin'
    }
  });

  const seedClients = [
    { name: 'Amazon India', domain: 'amazon.in', industry: 'E-commerce', contactName: 'Rajesh Kumar', contactEmail: 'rajesh@amazon.in', trafficBase: 85000000, keywordsBase: 1800000, healthBase: 92 },
    { name: 'Flipkart', domain: 'flipkart.com', industry: 'E-commerce', contactName: 'Amit Sharma', contactEmail: 'amit@flipkart.com', trafficBase: 62000000, keywordsBase: 1300000, healthBase: 89 },
    { name: 'Myntra', domain: 'myntra.com', industry: 'Fashion Retail', contactName: 'Priya Sen', contactEmail: 'priya@myntra.com', trafficBase: 24000000, keywordsBase: 580000, healthBase: 94 },
    { name: 'Zomato', domain: 'zomato.com', industry: 'Food Delivery', contactName: 'Deepinder Goyal', contactEmail: 'client@zomato.com', trafficBase: 38000000, keywordsBase: 840000, healthBase: 86 },
    { name: 'Swiggy', domain: 'swiggy.com', industry: 'Food Delivery', contactName: 'Sriharsha Majety', contactEmail: 'client@swiggy.com', trafficBase: 34000000, keywordsBase: 790000, healthBase: 88 },
    { name: 'Paytm', domain: 'paytm.com', industry: 'Fintech', contactName: 'Vijay Shekhar', contactEmail: 'client@paytm.com', trafficBase: 42000000, keywordsBase: 920000, healthBase: 84 }
  ];

  const clientPassword = await bcrypt.hash('password123', 10);

  for (const c of seedClients) {
    // Create client portal user
    await prisma.user.create({
      data: {
        name: c.contactName,
        email: c.contactEmail,
        password: clientPassword,
        role: 'client',
        agencyId: agency.id
      }
    });

    // Create client record
    const client = await prisma.client.create({
      data: {
        name: c.name,
        domain: `https://www.${c.domain}`,
        industry: c.industry,
        contactName: c.contactName,
        contactEmail: c.contactEmail,
        gscConnected: true,
        agencyId: agency.id,
        serankingProjectId: Math.floor(Math.random() * 100000),
        clientPortalEnabled: true
      }
    });

    console.log(`Created client: ${client.name} (portal user: ${c.contactEmail})`);

    // Generate 6 months of performance snapshot data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const variance = 1 + ((Math.random() * 0.16) - 0.08); // +/- 8% variance
      const growthFactor = 1 - (i * 0.04); // Simulated historical traffic growth
      
      const sessions = Math.floor(c.trafficBase * variance * growthFactor * 0.0001); // Scale sessions logically
      const pageviews = Math.floor(sessions * 3.4);
      const users = Math.floor(sessions * 0.72);

      await prisma.analyticsSnapshot.create({
        data: { clientId: client.id, date, sessions, users, pageviews }
      });

      const keywords = Math.floor(c.keywordsBase * variance * growthFactor * 0.0002);
      await prisma.keywordSnapshot.create({
        data: {
          clientId: client.id,
          date,
          totalKeywords: keywords,
          top3: Math.floor(keywords * 0.06),
          top10: Math.floor(keywords * 0.18),
          top100: Math.floor(keywords * 0.76)
        }
      });
    }

    // Add recent site audit health score snapshot
    await prisma.auditSnapshot.create({
      data: {
        clientId: client.id,
        healthScore: c.healthBase + Math.floor(Math.random() * 4 - 2),
        criticalIssues: Math.floor(Math.random() * 8) + 2,
        warnings: Math.floor(Math.random() * 120) + 30,
        notices: Math.floor(Math.random() * 400) + 100
      }
    });

    // Add recent backlinks snapshot
    await prisma.backlinkSnapshot.create({
      data: {
        clientId: client.id,
        totalBacklinks: Math.floor(c.trafficBase * 0.005),
        referringDomains: Math.floor(c.trafficBase * 0.0006),
        domainTrust: Math.floor(c.healthBase * 0.85)
      }
    });

    // Seed 3 months of historical generated reports for each client
    for (let i = 3; i >= 1; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      await prisma.report.create({
        data: {
          clientId: client.id,
          title: `${monthLabel} SEO Report`,
          date,
          status: 'generated',
          pdfUrl: `/api/reports/generate?id=${client.id}`,
          sections: JSON.stringify(['traffic', 'keywords', 'backlinks', 'audit'])
        }
      });
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
