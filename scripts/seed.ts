import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding realistic dummy data...');

  // Ensure Demo Agency exists
  let agency = await prisma.agency.findFirst({
    where: { slug: 'localhost' }
  });

  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Demo Agency',
        slug: 'localhost',
        subdomain: 'localhost',
        plan: 'pro'
      }
    });
  }

  // Define our new realistic clients
  const seedClients = [
    {
      name: 'Amazon India',
      domain: 'https://www.amazon.in',
      industry: 'E-commerce',
      contactName: 'Amazon SEO Team',
      gscConnected: true,
      trafficBase: 50000000,
      keywordsBase: 1200000,
      healthBase: 92
    },
    {
      name: 'Flipkart',
      domain: 'https://www.flipkart.com',
      industry: 'E-commerce',
      contactName: 'Flipkart Search Team',
      gscConnected: true,
      trafficBase: 42000000,
      keywordsBase: 980000,
      healthBase: 89
    },
    {
      name: 'Myntra',
      domain: 'https://www.myntra.com',
      industry: 'Fashion Retail',
      contactName: 'Myntra Organic',
      gscConnected: true,
      trafficBase: 15000000,
      keywordsBase: 450000,
      healthBase: 95
    }
  ];

  // Clear existing clients for Demo Agency to avoid duplicates during multiple seed runs
  await prisma.client.deleteMany({
    where: { agencyId: agency.id }
  });

  // Create clients and 6 months of historical snapshot data
  for (const c of seedClients) {
    const client = await prisma.client.create({
      data: {
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        contactName: c.contactName,
        gscConnected: c.gscConnected,
        agencyId: agency.id,
        serankingProjectId: Math.floor(Math.random() * 100000)
      }
    });

    console.log(`Created client: ${client.name}`);

    // Generate 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // Set to 1st of month for consistency
      
      // Add some random variation (up to 10% swing)
      const variance = 1 + ((Math.random() * 0.2) - 0.1); 
      
      // Simulate growth over time (older months had less traffic)
      const growthFactor = 1 - (i * 0.05); 

      const currentTraffic = Math.floor(c.trafficBase * variance * growthFactor);
      const currentKeywords = Math.floor(c.keywordsBase * variance * growthFactor);

      await prisma.analyticsSnapshot.create({
        data: {
          clientId: client.id,
          date,
          sessions: currentTraffic,
          users: Math.floor(currentTraffic * 0.7),
          pageviews: Math.floor(currentTraffic * 3.2)
        }
      });

      await prisma.keywordSnapshot.create({
        data: {
          clientId: client.id,
          date,
          totalKeywords: currentKeywords,
          top3: Math.floor(currentKeywords * 0.05),
          top10: Math.floor(currentKeywords * 0.15),
          top100: Math.floor(currentKeywords * 0.8)
        }
      });
    }

    // Add 1 recent Audit Snapshot
    await prisma.auditSnapshot.create({
      data: {
        clientId: client.id,
        healthScore: c.healthBase + Math.floor(Math.random() * 5 - 2),
        criticalIssues: Math.floor(Math.random() * 15),
        warnings: Math.floor(Math.random() * 150),
        notices: Math.floor(Math.random() * 500)
      }
    });

    // Add 1 recent Backlink Snapshot
    await prisma.backlinkSnapshot.create({
      data: {
        clientId: client.id,
        totalBacklinks: Math.floor(c.trafficBase * 0.1),
        referringDomains: Math.floor(c.trafficBase * 0.001),
        domainTrust: Math.floor(c.healthBase * 0.9)
      }
    });
  }

  console.log('Seeding complete! Dashboard should now have Amazon, Flipkart, and Myntra with populated charts.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
