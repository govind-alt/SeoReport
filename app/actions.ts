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
