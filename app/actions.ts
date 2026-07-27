'use server';

import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Saves the SERanking API key for an agency.
 */
export async function saveApiKey(key: string, domain: string) {
  if (!key) throw new Error("API key is required");
  
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency) throw new Error("Agency not found");

  const encryptedKey = encrypt(key);
  
  await prisma.agency.update({
    where: { id: agency.id },
    data: { serankingApiKey: encryptedKey }
  });
  
  revalidatePath('/[domain]/settings', 'page');
  return { success: true };
}

/**
 * Syncs data from SERanking API to the snapshot tables for a client.
 */
export async function syncClientData(clientId: string, domain: string) {
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency?.serankingApiKey) {
    throw new Error("No SERanking API key configured for this agency.");
  }
  
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found.");

  const apiKey = decrypt(agency.serankingApiKey);
  const seClient = new SERankingClient(apiKey);
  const today = new Date();
  
  try {
    if (!client.serankingProjectId) {
      throw new Error("No SERanking project ID linked to this client.");
    }
    
    const projectId = client.serankingProjectId;
    
    // Fetch Rankings
    try {
      const rankings = await seClient.getRankings(projectId);
      let top3 = 0, top10 = 0, top30 = 0, top100 = 0;
      
      rankings.positions.forEach(p => {
        if (p.position > 0 && p.position <= 3) top3++;
        if (p.position > 0 && p.position <= 10) top10++;
        if (p.position > 0 && p.position <= 30) top30++;
        if (p.position > 0 && p.position <= 100) top100++;
      });
      
      const project = await prisma.sERankingProject.findUnique({ where: { clientId } });
      if (project) {
        await prisma.keywordSnapshot.upsert({
          where: { serankingProjectId_date: { serankingProjectId: project.id, date: today } },
          update: { top3Count: top3, top10Count: top10, top30Count: top30, top100Count: top100, totalKeywords: rankings.positions.length },
          create: { serankingProjectId: project.id, date: today, top3Count: top3, top10Count: top10, top30Count: top30, top100Count: top100, totalKeywords: rankings.positions.length }
        });
      }
    } catch (e) {
      console.error("Failed to fetch rankings:", e);
    }
    
    // Fetch Audit
    try {
      const audit = await seClient.getAudit(projectId);
      const project = await prisma.sERankingProject.findUnique({ where: { clientId } });
      if (project) {
        await prisma.auditSnapshot.upsert({
          where: { serankingProjectId_date: { serankingProjectId: project.id, date: today } },
          update: { healthScore: audit.health_score || 0, pagesCrawled: audit.pages_crawled || 0, criticalIssues: audit.issues?.critical || 0, warningIssues: audit.issues?.warnings || 0, noticeIssues: audit.issues?.notices || 0 },
          create: { serankingProjectId: project.id, date: today, healthScore: audit.health_score || 0, pagesCrawled: audit.pages_crawled || 0, criticalIssues: audit.issues?.critical || 0, warningIssues: audit.issues?.warnings || 0, noticeIssues: audit.issues?.notices || 0 }
        });
      }
    } catch (e) {
      console.error("Failed to fetch audit:", e);
    }
  } catch (error: any) {
    console.error("SERanking API call failed:", error);
    throw new Error(error.message || "Failed to sync with SERanking API.");
  }
  
  revalidatePath('/[domain]', 'page');
  revalidatePath('/[domain]/clients', 'page');
  return { success: true };
}

export async function getClientDetails(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      reports: { orderBy: { periodStart: 'desc' } }
    }
  });

  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    domain: client.domain,
    status: 'active',
    serankingProjectId: client.serankingProjectId,
    reports: client.reports
  };
}

export async function registerAgency(data: any) {
  const { firstName, lastName, email, agencyName, subdomain, password } = data;

  if (!email || !password || !agencyName || !subdomain) {
    return { error: 'Missing required fields' };
  }

  // Check if email exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Email already exists' };
  }

  // Check if subdomain exists
  const existingAgency = await prisma.agency.findFirst({
    where: { OR: [{ slug: subdomain }, { subdomain: subdomain }] }
  });
  if (existingAgency) {
    return { error: 'Subdomain already taken' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const agency = await prisma.agency.create({
      data: {
        name: agencyName,
        slug: subdomain,
        subdomain: subdomain,
        users: {
          create: {
            name: `${firstName} ${lastName}`.trim(),
            email,
            password: hashedPassword,
            role: 'admin'
          }
        }
      }
    });

    const crypto = require('crypto');

    // 1. Seed initial starter client for agency
    const client = await prisma.client.create({
      data: {
        name: 'Acme Corp (Sample Client)',
        domain: 'acme-sample.com',
        industry: 'SaaS / Tech',
        contactEmail: 'client@acme-sample.com',
        contactName: 'Sarah Jenkins',
        notes: 'Sample client automatically created to help you explore your new RankFlow agency portal.',
        agencyId: agency.id
      }
    });

    // 2. Create SERanking Project
    const serankingId = Math.floor(1000000 + Math.random() * 9000000);
    const project = await prisma.sERankingProject.create({
      data: {
        serankingId,
        name: client.name,
        url: client.domain,
        clientId: client.id
      }
    });

    // 3. Seed 6 months of historical keyword & analytics snapshots
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const factor = 1 + (5 - i) * 0.08;
      const top3Count = Math.round(12 * factor);
      const top10Count = Math.round(42 * factor);
      const top30Count = Math.round(110 * factor);
      const totalKeywords = Math.round(250 * factor);

      await prisma.keywordSnapshot.create({
        data: {
          date,
          serankingProjectId: project.id,
          top3Count,
          top10Count,
          top30Count,
          top100Count: totalKeywords,
          totalKeywords,
          avgPosition: parseFloat((21.5 - (5 - i) * 0.7).toFixed(1)),
          positionsJson: JSON.stringify([
            { keyword: 'seo services london', pos: Math.round(12 - (5 - i)), change: 2, vol: 1600, url: '/services' },
            { keyword: 'rank tracker software', pos: Math.round(6 - (5 - i)), change: 1, vol: 2400, url: '/features' },
            { keyword: 'white label seo reports', pos: Math.round(3 - (5 - i)), change: 3, vol: 1900, url: '/' }
          ])
        }
      });

      await prisma.analyticsSnapshot.create({
        data: {
          date,
          serankingProjectId: project.id,
          organicSessions: Math.round(6500 * factor),
          clicks: Math.round(7200 * factor),
          impressions: Math.round(140000 * factor),
          ctr: 0.051,
          avgPosition: 14.2,
          topQueriesJson: JSON.stringify([
            { query: 'seo software demo', impressions: Math.round(5000 * factor), clicks: Math.round(350 * factor), ctr: 0.07 },
            { query: 'automated client reports', impressions: Math.round(3200 * factor), clicks: Math.round(220 * factor), ctr: 0.068 }
          ]),
          topPagesJson: JSON.stringify([
            { page: '/', clicks: Math.round(4500 * factor), impressions: Math.round(80000 * factor) },
            { page: '/pricing', clicks: Math.round(2100 * factor), impressions: Math.round(35000 * factor) }
          ])
        }
      });
    }

    // 4. Seed Audit and Backlink Snapshots
    await prisma.auditSnapshot.create({
      data: {
        date: now,
        serankingProjectId: project.id,
        healthScore: 84,
        pagesCrawled: 186,
        criticalIssues: 1,
        warningIssues: 8,
        noticeIssues: 14,
        issuesJson: JSON.stringify([
          { issue: 'Missing H1 Tag', severity: 'warning', count: 3, pages: '/blog/post-1' },
          { issue: 'Broken Internal Link', severity: 'critical', count: 1, pages: '/services' }
        ])
      }
    });

    await prisma.backlinkSnapshot.create({
      data: {
        date: now,
        serankingProjectId: project.id,
        domainTrust: 48,
        totalBacklinks: 3120,
        newBacklinks: 24,
        lostBacklinks: 2,
        referringDomains: 168,
        dofollowLinks: 2400,
        nofollowLinks: 720
      }
    });

    // 5. Seed an initial SEO Report card
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    await prisma.report.create({
      data: {
        clientId: client.id,
        periodStart: firstOfMonth,
        periodEnd: lastOfMonth,
        status: 'done',
        generatedAt: now,
        aiRecsJson: JSON.stringify([
          { priority: 'critical', title: 'Fix broken internal link on /services', detail: '1 broken link found. Fix to protect crawl budget.', impact: 'High' },
          { priority: 'high', title: 'Target "rank tracker software" Pos. 5', detail: 'Internal link push can move this keyword into top 3.', impact: 'High' }
        ]),
        sectionsJson: JSON.stringify({ keywords: true, backlinks: true, audit: true, analytics: true }),
        shareSlug: crypto.randomBytes(7).toString('base64url').slice(0, 10),
      }
    });

    // 6. Create Welcome Notification
    await prisma.notification.create({
      data: {
        agencyId: agency.id,
        type: 'alert',
        title: `Welcome to RankFlow, ${agencyName}! 🚀`,
        body: 'Your workspace is ready. We have created a sample client record so you can test all reporting and portal features right away.',
        link: `/${subdomain}/clients`
      }
    });
    
    return { success: true, agency };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { error: err.message || 'Failed to create account' };
  }
}

export async function getClients(domain: string) {
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: {
      clients: {
        include: {
          serankingProject: {
            include: {
              auditSnapshots: { orderBy: { date: 'desc' }, take: 1 }
            }
          }
        }
      }
    }
  });
  if (!agency) return [];

  return agency.clients.map(c => ({
    id: c.id,
    name: c.name,
    website: c.domain,
    health: c.serankingProject?.auditSnapshots[0]?.healthScore ?? null,
    initials: c.name.substring(0, 2).toUpperCase(),
    color: '#4F46E5',
    lastReport: 'N/A',
    nextReport: 'N/A',
    status: 'active'
  }));
}

export async function createClient(domain: string, data: { 
  name: string, 
  clientDomain: string, 
  serankingProjectId?: number,
  industry?: string,
  contactEmail?: string,
  contactName?: string,
  notes?: string,
}) {
  let agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  
  if (!agency) {
    if (domain === 'localhost') {
      agency = await prisma.agency.create({
        data: {
          name: 'Demo Agency',
          slug: 'localhost',
          subdomain: 'localhost',
          plan: 'pro'
        }
      });
    } else {
      throw new Error("Agency not found");
    }
  }

  const client = await prisma.client.create({
    data: {
      name: data.name,
      domain: data.clientDomain,
      serankingProjectId: data.serankingProjectId || null,
      industry: data.industry || null,
      contactEmail: data.contactEmail || null,
      contactName: data.contactName || null,
      notes: data.notes || null,
      agencyId: agency.id
    }
  });

  revalidatePath('/[domain]/clients', 'page');
  return { success: true, client };
}

export async function registerClient(data: any) {
  const { firstName, lastName, email, companyName, domain, password } = data;

  if (!firstName || !lastName || !email || !companyName || !domain || !password) {
    return { error: 'Missing required fields' };
  }

  try {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'Email already registered' };
    }

    const sanitizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create the Agency
    const agency = await prisma.agency.create({
      data: {
        name: `${companyName} Agency`,
        slug,
        subdomain: slug,
        plan: 'pro'
      }
    });

    // 2. Create the User (role: client)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: hashedPassword,
        role: 'client',
        agencyId: agency.id
      }
    });

    // 3. Create the Client
    const client = await prisma.client.create({
      data: {
        name: companyName,
        domain: sanitizedDomain,
        contactEmail: email,
        contactName: `${firstName} ${lastName}`.trim(),
        agencyId: agency.id
      }
    });

    // 4. Create Accepted Invitation so Client Dashboard resolves immediately
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
    await prisma.invitation.create({
      data: {
        email,
        token,
        agencyId: agency.id,
        clientId: client.id,
        invitedById: user.id,
        acceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // 5. Create SERankingProject
    const serankingId = Math.floor(1000000 + Math.random() * 9000000);
    const project = await prisma.sERankingProject.create({
      data: {
        serankingId,
        name: companyName,
        url: sanitizedDomain,
        clientId: client.id
      }
    });

    // 6. Seed 6 months of historical keyword and analytics snapshots
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const monthName = months[date.getMonth()];
      
      const factor = 1 + (5 - i) * 0.08; // gradual positive growth trend
      const top3Count = Math.round(10 * factor);
      const top10Count = Math.round(35 * factor);
      const top30Count = Math.round(90 * factor);
      const totalKeywords = Math.round(200 * factor);
      const avgPosition = parseFloat((22.4 - (5 - i) * 0.8).toFixed(1));

      const sessions = Math.round(5000 * factor);
      const clicks = Math.round(6000 * factor);
      const impressions = Math.round(100000 * factor);
      const ctr = parseFloat((clicks / impressions).toFixed(4));

      await prisma.keywordSnapshot.create({
        data: {
          date,
          serankingProjectId: project.id,
          top3Count,
          top10Count,
          top30Count,
          top100Count: totalKeywords,
          totalKeywords,
          avgPosition,
          positionsJson: JSON.stringify([
            { keyword: 'seo services', pos: Math.round(15 - (5-i)), change: 1, vol: 1600, url: '/services' },
            { keyword: 'rank checking', pos: Math.round(8 - (5-i)), change: 2, vol: 880, url: '/features' },
            { keyword: 'report builder', pos: Math.round(4 - (5-i)), change: 3, vol: 1200, url: '/' },
          ])
        }
      });

      await prisma.analyticsSnapshot.create({
        data: {
          date,
          serankingProjectId: project.id,
          organicSessions: sessions,
          clicks,
          impressions,
          ctr,
          avgPosition: 12.5,
          topQueriesJson: JSON.stringify([
            { query: 'seo services', impressions: Math.round(4000 * factor), clicks: Math.round(300 * factor), ctr: 0.075 },
            { query: 'rank checking', impressions: Math.round(2500 * factor), clicks: Math.round(180 * factor), ctr: 0.072 },
          ]),
          topPagesJson: JSON.stringify([
            { page: '/', clicks: Math.round(4000 * factor), impressions: Math.round(60000 * factor) },
            { page: '/features', clicks: Math.round(2000 * factor), impressions: Math.round(40000 * factor) },
          ])
        }
      });
    }

    // Also seed a default audit and backlink snapshot for current date
    await prisma.auditSnapshot.create({
      data: {
        date: now,
        serankingProjectId: project.id,
        healthScore: 78,
        pagesCrawled: 154,
        criticalIssues: 2,
        warningIssues: 12,
        noticeIssues: 25,
        issuesJson: JSON.stringify([
          { issue: 'Broken Link', severity: 'critical', count: 2, pages: '/about, /blog' },
          { issue: 'Missing Alt Text', severity: 'warning', count: 12, pages: '12 pages' },
        ])
      }
    });

    await prisma.backlinkSnapshot.create({
      data: {
        date: now,
        serankingProjectId: project.id,
        domainTrust: 42,
        totalBacklinks: 2450,
        newBacklinks: 15,
        lostBacklinks: 3,
        referringDomains: 124,
        dofollowLinks: 1800,
        nofollowLinks: 650
      }
    });

    // Seed 1 default report card for the client
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    await prisma.report.create({
      data: {
        clientId: client.id,
        periodStart: firstOfMonth,
        periodEnd: lastOfMonth,
        status: 'done',
        generatedAt: now,
        aiRecsJson: JSON.stringify([
          { priority: 'critical', title: 'Fix broken links', detail: '2 broken links found on /about and /blog.', impact: 'High' },
          { priority: 'high', title: 'Optimize image alt text', detail: '12 images lack alt text tags.', impact: 'Medium' }
        ]),
        sectionsJson: JSON.stringify({ keywords: true, backlinks: true, audit: true, analytics: true }),
        shareSlug: crypto.randomBytes(7).toString('base64url').slice(0, 10),
      }
    });

    return { success: true, client };
  } catch (err: any) {
    console.error('Client registration error:', err);
    return { error: err.message || 'Failed to create client account' };
  }
}

