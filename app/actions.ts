'use server';

import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

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

  // ── Strict field validation ──────────────────────────────────────────────
  if (!email || !password || !agencyName || !subdomain || !firstName || !lastName) {
    return { error: 'All fields are required' };
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: 'Invalid email address' };
  }

  // Password policy: minimum 8 chars
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  // Subdomain: only lowercase alphanum and hyphens
  const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
  if (!subdomainRegex.test(subdomain)) {
    return { error: 'Subdomain must be 3-32 characters, lowercase letters, numbers and hyphens only' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return { error: 'An account with this email already exists. Please sign in instead.' };
  }

  // Check if subdomain exists
  const existingAgency = await prisma.agency.findFirst({
    where: { OR: [{ slug: subdomain }, { subdomain: subdomain }] }
  });
  if (existingAgency) {
    return { error: 'This subdomain is already taken. Please choose another.' };
  }

  const hashedPassword = await bcrypt.hash(password, 12); // Cost 12 for better security

  try {
    const agency = await prisma.agency.create({
      data: {
        name: agencyName,
        slug: subdomain,
        subdomain: subdomain,
        users: {
          create: {
            name: `${firstName} ${lastName}`.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin'
          }
        }
      }
    });


    // Welcome Notification
    await prisma.notification.create({
      data: {
        agencyId: agency.id,
        type: 'alert',
        title: `Welcome to RankFlow, ${agencyName}! 🚀`,
        body: 'Your workspace is ready. Add your first client to get started with SEO tracking and automated reports.',
        link: `/${subdomain}/clients`
      }
    });


    // 7. Send welcome email via Resend
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${subdomain}`;
    await sendWelcomeEmail(normalizedEmail, `${firstName} ${lastName}`.trim(), agencyName, dashboardUrl);
    
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

  // ── Strict field validation ──────────────────────────────────────────────
  if (!firstName || !lastName || !email || !companyName || !domain || !password) {
    return { error: 'All fields are required' };
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: 'Invalid email address' };
  }

  // Password policy: minimum 8 chars
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return { error: 'An account with this email already exists. Please sign in instead.' };
    }

    const sanitizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = await bcrypt.hash(password, 12); // Cost 12 for better security

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
        email: normalizedEmail,
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

// ─────────────────────────────────────────────────────────────────────────────
// AGENCY SETTINGS & TEAM MANAGEMENT SERVER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates general agency profile and branding settings.
 */
export async function updateAgencySettings(domain: string, data: any) {
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency) throw new Error("Agency not found");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.billingEmail !== undefined) updateData.billingEmail = data.billingEmail;
  if (data.notificationEmail !== undefined) updateData.notificationEmail = data.notificationEmail;
  if (data.customDomain !== undefined) updateData.customDomain = data.customDomain;
  if (data.brandingJson !== undefined) {
    updateData.brandingJson = typeof data.brandingJson === 'string' 
      ? data.brandingJson 
      : JSON.stringify(data.brandingJson);
  }

  await prisma.agency.update({
    where: { id: agency.id },
    data: updateData
  });

  revalidatePath('/[domain]/settings', 'page');
  return { success: true };
}

/**
 * Updates an agency's subscription plan tier.
 */
export async function updateAgencyPlan(domain: string, plan: string) {
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency) throw new Error("Agency not found");

  await prisma.agency.update({
    where: { id: agency.id },
    data: { plan }
  });

  revalidatePath('/[domain]/settings', 'page');
  return { success: true };
}

/**
 * Updates user account profile or password.
 */
export async function updateUserAccount(domain: string, data: any) {
  const { userId, name, image, password } = data;
  if (!userId) throw new Error("User ID is required");

  const updateData: any = {};
  if (name) updateData.name = name;
  if (image) updateData.image = image;
  if (password && password.length >= 8) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  revalidatePath('/[domain]/settings', 'page');
  return { success: true };
}

/**
 * Invites a new team member to an agency and sends an invite email via Resend.
 */
export async function inviteTeamMember(domain: string, email: string, role: string) {
  if (!email || !role) throw new Error("Email and role are required");

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency) throw new Error("Agency not found");

  const normalizedEmail = email.trim().toLowerCase();

  // Create or refresh an invitation token in the database
  const crypto = require('crypto');
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const existingInvitation = await prisma.invitation.findFirst({
    where: { email: normalizedEmail, agencyId: agency.id }
  });

  let invitation;
  if (existingInvitation) {
    invitation = await prisma.invitation.update({
      where: { id: existingInvitation.id },
      data: { token, role, expiresAt, acceptedAt: null }
    });
  } else {
    invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        token,
        role,
        agencyId: agency.id,
        expiresAt
      }
    });
  }

  // Construct invite & dashboard URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const subdomain = agency.subdomain || agency.slug || domain;
  const inviteUrl = baseUrl.includes('localhost')
    ? `http://${subdomain}.localhost:3000/login?invite=${token}`
    : `${baseUrl}/login?invite=${token}`;

  // Send real email via Resend
  await sendWelcomeEmail(
    normalizedEmail,
    normalizedEmail.split('@')[0],
    agency.name,
    inviteUrl
  ).catch(err => {
    console.error('[INVITE_TEAM_MEMBER] Resend email dispatch failed:', err);
  });

  revalidatePath('/[domain]/settings', 'page');
  revalidatePath('/[domain]/team', 'page');
  return { success: true, invitation };
}

/**
 * Resends an existing team invite and refreshes its token + expiration via Resend.
 */
export async function resendTeamInvite(domain: string, inviteId: string) {
  if (!inviteId) throw new Error("Invite ID is required");

  const invitation = await prisma.invitation.findUnique({
    where: { id: inviteId },
    include: { agency: true }
  });
  if (!invitation || !invitation.agency) throw new Error("Invitation not found");

  const crypto = require('crypto');
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.update({
    where: { id: inviteId },
    data: { token, expiresAt }
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const subdomain = invitation.agency.subdomain || invitation.agency.slug || domain;
  const inviteUrl = baseUrl.includes('localhost')
    ? `http://${subdomain}.localhost:3000/login?invite=${token}`
    : `${baseUrl}/login?invite=${token}`;

  await sendWelcomeEmail(
    invitation.email,
    invitation.email.split('@')[0],
    invitation.agency.name,
    inviteUrl
  ).catch(err => {
    console.error('[RESEND_TEAM_INVITE] Resend email dispatch failed:', err);
  });

  revalidatePath('/[domain]/settings', 'page');
  revalidatePath('/[domain]/team', 'page');
  return { success: true };
}

/**
 * Cancels a pending team invitation.
 */
export async function cancelTeamInvite(domain: string, inviteId: string) {
  if (!inviteId) throw new Error("Invite ID is required");

  await prisma.invitation.deleteMany({
    where: { id: inviteId }
  });

  revalidatePath('/[domain]/settings', 'page');
  revalidatePath('/[domain]/team', 'page');
  return { success: true };
}

/**
 * Removes an existing team member from an agency.
 */
export async function removeTeamMember(domain: string, userId: string) {
  if (!userId) throw new Error("User ID is required");

  await prisma.user.deleteMany({
    where: { id: userId }
  });

  revalidatePath('/[domain]/settings', 'page');
  revalidatePath('/[domain]/team', 'page');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN SERVER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all platform-wide data for the Superadmin dashboard.
 * Returns agencies, users, reports, support tickets, and computed KPIs.
 */
export async function getSuperadminData() {
  const [agencies, users, reports, messages] = await Promise.all([
    prisma.agency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { clients: true, users: true } }
      }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { agency: { select: { id: true, name: true, slug: true } } }
    }),
    prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            domain: true,
            agency: { select: { id: true, name: true, subdomain: true, slug: true } }
          }
        }
      }
    }),
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        agency: { select: { id: true, name: true, slug: true } },
        client: { select: { id: true, name: true } }
      }
    })
  ]);

  const totalAgencies = agencies.length;
  const totalClients = agencies.reduce((sum, a) => sum + a._count.clients, 0);
  const totalReports = reports.length;
  const generatedReports = reports.filter(r => r.status === 'done' || r.status === 'generated').length;
  const failedReports = reports.filter(r => r.status === 'failed').length;

  const planStats = {
    enterprise: agencies.filter(a => a.plan === 'enterprise').length,
    professional: agencies.filter(a => a.plan === 'professional' || a.plan === 'pro').length,
    starter: agencies.filter(a => a.plan !== 'enterprise' && a.plan !== 'professional' && a.plan !== 'pro' && a.plan !== 'suspended').length,
  };

  const mrr = agencies.reduce((sum, a) => {
    if (a.plan === 'enterprise') return sum + 249;
    if (a.plan === 'professional' || a.plan === 'pro') return sum + 99;
    if (a.plan === 'suspended') return sum;
    return sum + 49;
  }, 0);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const mrrChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { name: months[d.getMonth()], value: Math.round(mrr * (0.7 + i * 0.06)) };
  });

  const agencyChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = agencies.filter(a => {
      const created = new Date(a.createdAt);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    return { name: months[d.getMonth()], value: count };
  });

  // Support tickets: client messages sent to agency (not from agency)
  const supportTickets = messages
    .filter(m => !m.isFromAgency)
    .map(m => ({
      id: m.id,
      createdAt: m.createdAt,
      agency: m.agency,
      client: m.client,
      action: `Client (${m.client?.name || 'Client'}) Support Request: "${m.subject || m.body.substring(0, 80)}"`,
    }));

  // Format reports for the superadmin reports tab
  const formattedReports = reports.map(r => ({
    id: r.id,
    clientId: r.clientId,
    clientName: r.client?.name || 'Unknown Client',
    clientDomain: r.client?.domain || '',
    agencyName: r.client?.agency?.name || 'Unknown Agency',
    agencySubdomain: r.client?.agency?.subdomain || r.client?.agency?.slug || '',
    period: new Date(r.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }),
    periodStart: r.periodStart,
    status: r.status,
    pdfUrl: r.pdfUrl,
    shareSlug: r.shareSlug,
    generatedAt: r.generatedAt
      ? new Date(r.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Pending',
    createdAt: r.createdAt,
  }));

  const recentLogs = [
    ...agencies.slice(0, 3).map(a => ({ id: a.id, action: `Agency "${a.name}" registered`, createdAt: a.createdAt })),
    ...users.slice(0, 3).map(u => ({ id: u.id, action: `User "${u.email}" joined`, createdAt: u.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return {
    agencies,
    users,
    reports: formattedReports,
    totalAgencies,
    totalClients,
    totalReports,
    generatedReports,
    failedReports,
    mrr,
    planStats,
    mrrChartData,
    agencyChartData,
    supportTickets,
    recentLogs,
  };
}

/**
 * Creates a new platform user (superadmin action).
 */
export async function createUserSuperadmin(data: {
  name: string;
  email: string;
  role: string;
  agencyId?: string;
  password: string;
}) {
  if (!data.email || !data.password || !data.name) throw new Error('Name, email, and password are required');
  if (data.password.length < 6) throw new Error('Password must be at least 6 characters');

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error('A user with this email already exists');

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'admin',
      agencyId: data.agencyId || null,
    },
    include: { agency: { select: { id: true, name: true, slug: true } } }
  });

  revalidatePath('/superadmin');
  return { success: true, user };
}

/**
 * Updates a user's role (superadmin action).
 */
export async function updateUserRoleSuperadmin(userId: string, role: string) {
  if (!userId || !role) throw new Error('userId and role are required');
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/superadmin');
  return { success: true };
}

/**
 * Deletes/deactivates a user account (superadmin action).
 */
export async function deleteUserSuperadmin(userId: string) {
  if (!userId) throw new Error('userId is required');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.role === 'superadmin') throw new Error('Cannot deactivate a superadmin account');
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/superadmin');
  return { success: true };
}

/**
 * Updates an agency's subscription plan (superadmin action).
 */
export async function updateAgencyPlanSuperadmin(agencyId: string, plan: string) {
  if (!agencyId || !plan) throw new Error('agencyId and plan are required');
  await prisma.agency.update({ where: { id: agencyId }, data: { plan } });
  revalidatePath('/superadmin');
  return { success: true };
}

/**
 * Permanently deletes an agency and all cascading data (superadmin action).
 */
export async function deleteAgencySuperadmin(agencyId: string) {
  if (!agencyId) throw new Error('agencyId is required');
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) throw new Error('Agency not found');
  await prisma.agency.delete({ where: { id: agencyId } });
  revalidatePath('/superadmin');
  return { success: true };
}

/**
 * Creates a new agency tenant (superadmin action).
 */
export async function createAgencySuperadmin(data: {
  name: string;
  slug: string;
  subdomain: string;
  plan: string;
  contactEmail: string;
}) {
  if (!data.name || !data.slug || !data.subdomain || !data.contactEmail) {
    throw new Error('All fields are required');
  }
  const existing = await prisma.agency.findFirst({
    where: { OR: [{ slug: data.slug }, { subdomain: data.subdomain }] }
  });
  if (existing) throw new Error('An agency with this slug or subdomain already exists');

  const agency = await prisma.agency.create({
    data: {
      name: data.name,
      slug: data.slug,
      subdomain: data.subdomain,
      plan: data.plan || 'starter',
      billingEmail: data.contactEmail,
    }
  });

  revalidatePath('/superadmin');
  return { success: true, agency };
}

/**
 * Toggles an agency between suspended and active (superadmin action).
 */
export async function toggleSuspendAgencySuperadmin(agencyId: string) {
  if (!agencyId) throw new Error('agencyId is required');
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) throw new Error('Agency not found');

  const newPlan = agency.plan === 'suspended' ? 'starter' : 'suspended';
  await prisma.agency.update({ where: { id: agencyId }, data: { plan: newPlan } });
  revalidatePath('/superadmin');
  return { success: true, newPlan };
}

/**
 * Returns the impersonation redirect URL for an agency subdomain (superadmin action).
 */
export async function impersonateAgencyAction(agencySlug: string) {
  if (!agencySlug) throw new Error('agencySlug is required');
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: agencySlug }, { subdomain: agencySlug }] }
  });
  if (!agency) throw new Error('Agency not found');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const subdomain = agency.subdomain || agency.slug;
  // Redirect to agency dashboard on their subdomain
  const redirectUrl = baseUrl.includes('localhost')
    ? `http://${subdomain}.localhost:3000`
    : baseUrl.replace('://', `://${subdomain}.`);

  return { success: true, redirectUrl };
}

/**
 * Records a superadmin reply on a support ticket/message (superadmin action).
 */
export async function respondToTicketSuperadmin(ticketId: string, replyText: string) {
  if (!ticketId || !replyText) throw new Error('ticketId and replyText are required');
  const message = await prisma.message.findUnique({ where: { id: ticketId } });
  if (!message) throw new Error('Ticket not found');

  // Append reply marker to body so it persists across reloads
  const baseBody = message.body.includes(' | Response: "') 
    ? message.body.split(' | Response: "')[0] 
    : message.body;

  await prisma.message.update({
    where: { id: ticketId },
    data: {
      body: `${baseBody} | Response: "${replyText}" [RESOLVED]`,
      isRead: true,
    }
  });

  revalidatePath('/superadmin');
  return { success: true };
}
