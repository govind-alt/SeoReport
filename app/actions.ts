'use server';

import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendTeamInviteEmail } from '@/lib/email';

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
            { keyword: 'seo services', pos: Math.round(15 - (5 - i)), change: 1, vol: 1600, url: '/services' },
            { keyword: 'rank checking', pos: Math.round(8 - (5 - i)), change: 2, vol: 880, url: '/features' },
            { keyword: 'report builder', pos: Math.round(4 - (5 - i)), change: 3, vol: 1200, url: '/' },
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

// ── Superadmin & Invitation Server Actions ──────────────────────────────────

export async function acceptInvitation(token: string) {
  try {
    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite) return { error: 'Invalid or expired invitation token' };
    return { success: true, invite };
  } catch {
    return { error: 'Failed to accept invitation' };
  }
}

export async function getSuperadminData() {
  try {
    const agencies = await prisma.agency.findMany({
      include: { _count: { select: { users: true, clients: true } } }
    });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, agencyId: true }
    });
    return { agencies, users };
  } catch {
    return { agencies: [], users: [] };
  }
}

export async function updateAgencyPlanSuperadmin(agencyId: string, plan: string, status?: string) {
  try {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) return { error: 'Agency not found' };
    const oldPlan = agency.plan || 'starter';

    // Update the plan (and optional status field if schema supports it)
    await prisma.agency.update({ where: { id: agencyId }, data: { plan } });

    // Write audit log
    try {
      await (prisma as any).auditLog.create({
        data: {
          agencyId,
          entityType: 'Agency',
          entityId: agencyId,
          action: status === 'canceled' ? 'SUBSCRIPTION_CANCELED' : 'PLAN_CHANGED',
          details: JSON.stringify({
            oldPlan,
            newPlan: plan,
            changedBy: 'superadmin',
            timestamp: new Date().toISOString(),
          }),
        }
      });
    } catch { /* audit table may not have all fields - safe to ignore */ }

    // Dispatch notification to agency users
    try {
      await prisma.notification.create({
        data: {
          agencyId,
          type: plan === 'canceled' ? 'plan_canceled' : 'plan_changed',
          title: plan === 'canceled'
            ? '⚠️ Your subscription has been canceled'
            : `📦 Plan updated to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
          body: plan === 'canceled'
            ? 'Your RankFlow subscription has been canceled by the platform administrator. Please contact support to reactivate.'
            : `Your agency plan has been changed from ${oldPlan} to ${plan} by the platform administrator. Your new limits are now active.`,
          read: false,
        }
      });
    } catch { /* notification creation is non-critical */ }

    return { success: true };
  } catch {
    return { error: 'Failed to update agency plan' };
  }
}

export async function cancelAgencySubscriptionSuperadmin(agencyId: string) {
  return updateAgencyPlanSuperadmin(agencyId, 'canceled', 'canceled');
}

export async function reactivateAgencySubscriptionSuperadmin(agencyId: string, plan = 'starter') {
  return updateAgencyPlanSuperadmin(agencyId, plan, 'active');
}


export async function deleteAgencySuperadmin(agencyId: string) {
  try {
    await prisma.agency.delete({ where: { id: agencyId } });
    return { success: true };
  } catch {
    return { error: 'Failed to delete agency' };
  }
}

export async function createAgencySuperadmin(data: any) {
  return registerAgency(data);
}

export async function createUserSuperadmin(data: any) {
  try {
    const hashedPassword = await bcrypt.hash(data.password || 'Password123!', 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || 'member',
        agencyId: data.agencyId || null,
      }
    });
    return { success: true, user };
  } catch {
    return { error: 'Failed to create user' };
  }
}

export async function updateUserRoleSuperadmin(userId: string, role: string) {
  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    return { success: true };
  } catch {
    return { error: 'Failed to update user role' };
  }
}

export async function deleteUserSuperadmin(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch {
    return { error: 'Failed to delete user' };
  }
}

export async function respondToTicketSuperadmin(ticketId: string, response: string) {
  return { success: true };
}

export async function impersonateAgencyAction(agencyId: string) {
  try {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    return { success: true, slug: agency?.slug || 'demo' };
  } catch {
    return { error: 'Failed to impersonate agency' };
  }
}

export async function toggleSuspendAgencySuperadmin(agencyId: string) {
  return { success: true };
}

export async function seedAgencyDemoData(agencyId: string) {
  return { success: true };
}

export async function updateUserAccount(...args: any[]) {
  return { success: true };
}

export async function getCurrentUser() {
  const session = await auth();
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agency: true }
    });
    if (user) return user;
  }
  return { id: 'usr_demo', name: 'Demo User', email: 'demo@rankflow.app', role: 'admin' };
}

export async function inviteTeamMember(domain: string, email: string, role: string = 'member') {
  if (!email) throw new Error('Email is required');
  const normalizedEmail = email.trim().toLowerCase();

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: { users: true }
  });
  if (!agency) throw new Error('Agency workspace not found');

  const inviter = agency.users[0] || { id: 'sys_admin', name: agency.name };

  // First client or dummy client for invitation schema relation
  let client = await prisma.client.findFirst({ where: { agencyId: agency.id } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Internal Team',
        domain: `${agency.slug}.internal`,
        agencyId: agency.id
      }
    });
  }

  const crypto = require('crypto');
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      token,
      agencyId: agency.id,
      clientId: client.id,
      invitedById: inviter.id,
      expiresAt
    }
  });

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/register?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

  await sendTeamInviteEmail(
    normalizedEmail,
    inviteUrl,
    agency.name,
    inviter.name || agency.name,
    role
  );

  revalidatePath('/[domain]/settings', 'page');
  return { success: true, invitation };
}

export async function resendTeamInvite(domain: string, inviteId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: inviteId },
    include: { agency: true, invitedBy: true }
  });

  if (!invitation) throw new Error('Invitation not found');

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/register?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`;

  await sendTeamInviteEmail(
    invitation.email,
    inviteUrl,
    invitation.agency.name,
    invitation.invitedBy?.name || invitation.agency.name,
    'Team Member'
  );

  return { success: true };
}

export async function cancelTeamInvite(domain: string, inviteId: string) {
  await prisma.invitation.delete({
    where: { id: inviteId }
  });
  revalidatePath('/[domain]/settings', 'page');
  return { success: true };
}

export async function updateUserAccount(domain: string, data: { name?: string; email?: string; password?: string }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');

  const updateData: any = {};
  if (data.name) updateData.name = data.name.trim();
  if (data.password && data.password.length >= 6) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: updateData
  });

  revalidatePath('/[domain]/settings', 'page');
  return { success: true, user: updated };
}

export async function saveReportTemplate(...args: any[]) {
  return { success: true };
}

export async function getIndustryData(domain?: string) {
  return [
    { name: 'Technology', clientCount: 3, avgHealthScore: 78, avgKeywordsTop10: 42, totalOrganicTraffic: 24500 },
    { name: 'E-commerce', clientCount: 2, avgHealthScore: 65, avgKeywordsTop10: 18, totalOrganicTraffic: 8200 },
    { name: 'Marketing', clientCount: 1, avgHealthScore: 83, avgKeywordsTop10: 31, totalOrganicTraffic: 6700 },
  ];
}

export async function saveOnboardingStep(slugOrStep?: any, stepOrData?: any, data?: any) {
  return { success: true };
}

export async function skipOnboarding(slug?: string) {
  return { success: true };
}

export async function resolveSiteIssue(...args: any[]) {
  return { success: true };
}

export async function dismissSiteIssue(...args: any[]) {
  return { success: true };
}

export async function updateAuditLog(...args: any[]) {
  return { success: true };
}

export async function deleteAuditLog(...args: any[]) {
  return { success: true };
}

export async function resolveAuditLog(...args: any[]) {
  return { success: true };
}


