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
 * Currently uses dummy data since real project ID mapping would require 
 * actual API keys and setup.
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

  // Decrypt the API key
  const apiKey = decrypt(agency.serankingApiKey);
  
  // Initialize the SERanking client
  const seClient = new SERankingClient(apiKey);
  
  const today = new Date();
  
  try {
    if (!client.serankingProjectId) {
      throw new Error("No SERanking project ID linked to this client. Please edit client to link a project.");
    }
    
    const projectId = client.serankingProjectId;
    
    // Fetch Rankings
    try {
      const rankings = await seClient.getRankings(projectId);
      let top3 = 0, top10 = 0, top100 = 0;
      
      rankings.positions.forEach(p => {
        if (p.position > 0 && p.position <= 3) top3++;
        if (p.position > 0 && p.position <= 10) top10++;
        if (p.position > 0 && p.position <= 100) top100++;
      });
      
      await prisma.keywordSnapshot.create({
        data: {
          clientId,
          date: today,
          totalKeywords: rankings.positions.length,
          top3,
          top10,
          top100
        }
      });
    } catch (e) {
      console.error("Failed to fetch rankings:", e);
    }
    
    // Fetch Audit
    try {
      const audit = await seClient.getAudit(projectId);
      await prisma.auditSnapshot.create({
        data: {
          clientId,
          date: today,
          healthScore: audit.health_score || 0,
          criticalIssues: audit.issues?.critical || 0,
          warnings: audit.issues?.warnings || 0,
          notices: audit.issues?.notices || 0,
        }
      });
    } catch (e) {
      console.error("Failed to fetch audit:", e);
    }
    
    // Create empty analytics and backlink snapshots since we don't have GSC/Backlink APIs yet
    await prisma.analyticsSnapshot.create({
      data: { clientId, date: today, sessions: 0, users: 0, pageviews: 0 }
    });
    
    await prisma.backlinkSnapshot.create({
      data: { clientId, date: today, totalBacklinks: 0, referringDomains: 0, newBacklinks: 0, lostBacklinks: 0, domainTrust: 0 }
    });

  } catch (error: any) {
    console.error("SERanking API call failed:", error);
    throw new Error(error.message || "Failed to sync with SERanking API. Ensure the API key and Project ID are valid.");
  }
  
  revalidatePath('/[domain]', 'page');
  revalidatePath('/[domain]/clients', 'page');
  return { success: true };
}

export async function getDashboardMetrics(domain: string, clientId?: string) {
  let agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: { clients: true }
  });
  
  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Demo Agency',
        slug: domain,
        subdomain: domain,
        plan: 'pro'
      },
      include: { clients: true }
    });
  }

  let clientIds = agency.clients.map(c => c.id);
  if (clientId && clientId !== 'All Clients') {
    clientIds = [clientId];
  }

  // Fetch snapshots for the target clients in the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const keywords = await prisma.keywordSnapshot.findMany({
    where: { clientId: { in: clientIds }, date: { gte: sixMonthsAgo } },
    orderBy: { date: 'asc' }
  });

  const analytics = await prisma.analyticsSnapshot.findMany({
    where: { clientId: { in: clientIds }, date: { gte: sixMonthsAgo } },
    orderBy: { date: 'asc' }
  });

  const audits = await prisma.auditSnapshot.findMany({
    where: { clientId: { in: clientIds } },
    orderBy: { date: 'desc' },
  });

  // Group by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trafficChart = [];
  const keywordChart = [];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthName = months[d.getMonth()];
    
    const monthSessions = analytics.filter(a => a.date.getMonth() === d.getMonth()).reduce((sum, a) => sum + a.sessions, 0);
    const monthKeywords = keywords.filter(k => k.date.getMonth() === d.getMonth()).reduce((sum, k) => sum + k.top10, 0);

    trafficChart.push({ name: monthName, sessions: monthSessions });
    keywordChart.push({ name: monthName, keywords: monthKeywords });
  }
  
  const currentMonth = new Date().getMonth();
  const totalSessions = analytics.filter(a => a.date.getMonth() === currentMonth).reduce((sum, a) => sum + a.sessions, 0);
  const totalKeywords = keywords.filter(k => k.date.getMonth() === currentMonth).reduce((sum, k) => sum + k.top10, 0);
  
  const latestAudits = clientIds.map(id => audits.find(a => a.clientId === id)).filter(Boolean);
  const avgHealthScore = latestAudits.length ? Math.round(latestAudits.reduce((sum, a) => sum + a!.healthScore, 0) / latestAudits.length) : 0;
  const criticalIssues = latestAudits.reduce((sum, a) => sum + a!.criticalIssues, 0);

  return {
    activeClients: agency.clients.length,
    reportsSent: 12,
    avgHealthScore,
    totalSessions,
    totalKeywords,
    criticalIssues,
    creditsLeft: 8400,
    clients: agency.clients.map(c => ({ id: c.id, name: c.name })),
    chartData: {
      traffic: trafficChart,
      keywords: keywordChart
    }
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
    
    return { success: true, agency };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { error: err.message || 'Failed to create account' };
  }
}

export async function getClients(domain: string) {
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: { clients: { include: { auditSnapshots: { orderBy: { date: 'desc' }, take: 1 } } } }
  });
  if (!agency) return [];

  return agency.clients.map(c => ({
    id: c.id,
    name: c.name,
    website: c.domain,
    health: c.auditSnapshots[0]?.healthScore ?? null,
    initials: c.name.substring(0, 2).toUpperCase(),
    color: '#4F46E5',
    lastReport: 'N/A',
    nextReport: 'N/A',
    status: 'active'
  }));
}

export async function getClientDetails(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      keywordSnapshots: { orderBy: { date: 'desc' }, take: 6 },
      analyticsSnapshots: { orderBy: { date: 'desc' }, take: 6 },
      backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
      auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
    }
  });

  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    website: client.domain,
    status: 'active',
    initials: client.name.substring(0, 2).toUpperCase(),
    snapshots: {
      keywords: client.keywordSnapshots,
      analytics: client.analyticsSnapshots,
      backlinks: client.backlinkSnapshots[0] || null,
      audit: client.auditSnapshots[0] || null
    }
  };
}

export async function createClient(domain: string, data: { 
  name: string, 
  clientDomain: string, 
  serankingProjectId?: number,
  industry?: string,
  contactEmail?: string,
  contactName?: string,
  internalNotes?: string,
  clientPortalEnabled?: boolean,
  gscConnected?: boolean
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
      internalNotes: data.internalNotes || null,
      clientPortalEnabled: data.clientPortalEnabled || false,
      gscConnected: data.gscConnected || false,
      agencyId: agency.id
    }
  });

  revalidatePath('/[domain]/clients', 'page');
  return { success: true, client };
}
