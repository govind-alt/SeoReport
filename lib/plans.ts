/**
 * RankFlow Subscription Plans Configuration
 * Single source of truth for all plan definitions, pricing, limits, and features.
 */

export type PlanId = 'starter' | 'pro' | 'agency' | 'enterprise' | 'canceled';

export interface Plan {
  id: PlanId;
  name: string;
  displayName: string;
  price: number;           // USD per month
  priceAnnual: number;     // USD per month (billed annually)
  color: string;           // brand color
  badge: string;           // emoji badge
  tagline: string;
  maxClients: number;      // -1 = unlimited
  maxKeywordsPerClient: number;
  maxTeamMembers: number;
  maxStorageGB: number;
  features: string[];
  limits: {
    clients: number;
    keywordsPerClient: number;
    teamMembers: number;
    storageGB: number;
    reportsPerMonth: number;
    emailReportsPerMonth: number;
    apiCallsPerDay: number;
  };
  capabilities: {
    whiteLabelPDF: boolean;
    whiteLabelPortal: boolean;
    customDomain: boolean;
    gscIntegration: boolean;
    ga4Integration: boolean;
    supabaseStorage: boolean;
    aiRecommendations: boolean;
    competitorTracking: boolean;
    apiAccess: boolean;
    slaGuarantee: boolean;
    dedicatedSupport: boolean;
    twoFactor: boolean;
    auditLog: boolean;
    customEmailTemplates: boolean;
    advancedScheduling: boolean;
    multiUserTeam: boolean;
    prioritySupport: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: 49,
    priceAnnual: 39,
    color: '#94A3B8',
    badge: '🚀',
    tagline: 'Perfect for freelancers & small agencies',
    maxClients: 5,
    maxKeywordsPerClient: 50,
    maxTeamMembers: 2,
    maxStorageGB: 2,
    features: [
      '5 Active Clients',
      '50 Keywords / Client',
      '2 Team Members',
      'Core PDF Reports (White-Label)',
      'SERanking Integration',
      'Basic Email Notifications',
      'Keyword Rank Tracking',
      'Site Health Audits',
      'Client Portal (Read-Only)',
      'Email Support (48h SLA)',
    ],
    limits: {
      clients: 5,
      keywordsPerClient: 50,
      teamMembers: 2,
      storageGB: 2,
      reportsPerMonth: 20,
      emailReportsPerMonth: 5,
      apiCallsPerDay: 1000,
    },
    capabilities: {
      whiteLabelPDF: true,
      whiteLabelPortal: false,
      customDomain: false,
      gscIntegration: false,
      ga4Integration: false,
      supabaseStorage: false,
      aiRecommendations: false,
      competitorTracking: false,
      apiAccess: false,
      slaGuarantee: false,
      dedicatedSupport: false,
      twoFactor: true,
      auditLog: false,
      customEmailTemplates: false,
      advancedScheduling: false,
      multiUserTeam: false,
      prioritySupport: false,
    },
  },

  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Professional',
    price: 149,
    priceAnnual: 119,
    color: '#8B5CF6',
    badge: '⚡',
    tagline: 'For growing agencies scaling their client base',
    maxClients: 25,
    maxKeywordsPerClient: 250,
    maxTeamMembers: 10,
    maxStorageGB: 20,
    features: [
      '25 Active Clients',
      '250 Keywords / Client',
      '10 Team Members',
      'Full White-Label PDFs & Portal',
      'Custom Agency Subdomain',
      'Google Search Console OAuth',
      'Google Analytics 4 Integration',
      'AI-Powered Recommendations',
      'Competitor Tracking (10 domains)',
      'Automated Report Scheduling',
      'Custom Email Templates',
      'Team Collaboration Tools',
      '20 GB Supabase Storage',
      'Priority Support (24h SLA)',
    ],
    limits: {
      clients: 25,
      keywordsPerClient: 250,
      teamMembers: 10,
      storageGB: 20,
      reportsPerMonth: 200,
      emailReportsPerMonth: 50,
      apiCallsPerDay: 10000,
    },
    capabilities: {
      whiteLabelPDF: true,
      whiteLabelPortal: true,
      customDomain: true,
      gscIntegration: true,
      ga4Integration: true,
      supabaseStorage: true,
      aiRecommendations: true,
      competitorTracking: true,
      apiAccess: false,
      slaGuarantee: false,
      dedicatedSupport: false,
      twoFactor: true,
      auditLog: true,
      customEmailTemplates: true,
      advancedScheduling: true,
      multiUserTeam: true,
      prioritySupport: true,
    },
  },

  agency: {
    id: 'agency',
    name: 'agency',
    displayName: 'Agency',
    price: 399,
    priceAnnual: 319,
    color: '#3B82F6',
    badge: '🏢',
    tagline: 'For established agencies managing large portfolios',
    maxClients: 500,
    maxKeywordsPerClient: 1000,
    maxTeamMembers: 50,
    maxStorageGB: 200,
    features: [
      '500 Active Clients',
      '1,000 Keywords / Client',
      '50 Team Members',
      'Full White-Label (PDF, Portal, Emails)',
      'Custom Domain (CNAME SSL)',
      'Unlimited Integrations (GSC, GA4, Stripe)',
      'Advanced AI Recommendations Engine',
      'Unlimited Competitor Tracking',
      'API Access (Full REST API)',
      'Supabase CDN Storage (200 GB)',
      'Advanced Scheduling (Daily/Weekly/Monthly)',
      'Full Audit Trail & Log History',
      'Webhook Event Subscriptions',
      'Custom Branding & Email Domain',
      '6-Hour Priority SLA',
      'Dedicated Account Manager',
    ],
    limits: {
      clients: 500,
      keywordsPerClient: 1000,
      teamMembers: 50,
      storageGB: 200,
      reportsPerMonth: 5000,
      emailReportsPerMonth: 1000,
      apiCallsPerDay: 100000,
    },
    capabilities: {
      whiteLabelPDF: true,
      whiteLabelPortal: true,
      customDomain: true,
      gscIntegration: true,
      ga4Integration: true,
      supabaseStorage: true,
      aiRecommendations: true,
      competitorTracking: true,
      apiAccess: true,
      slaGuarantee: true,
      dedicatedSupport: true,
      twoFactor: true,
      auditLog: true,
      customEmailTemplates: true,
      advancedScheduling: true,
      multiUserTeam: true,
      prioritySupport: true,
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 799,
    priceAnnual: 639,
    color: '#F59E0B',
    badge: '👑',
    tagline: 'Bespoke infrastructure for platform-scale agencies',
    maxClients: -1, // unlimited
    maxKeywordsPerClient: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    maxStorageGB: -1, // unlimited
    features: [
      'Unlimited Clients',
      'Unlimited Keywords',
      'Unlimited Team Members',
      'Complete White-Label Platform (Rebrand as Your Own)',
      'Custom Domain + SSL Auto-Provisioning',
      'Private Supabase Bucket (Dedicated CDN)',
      'AI Engine with Custom Training Data',
      'Dedicated Infrastructure (Isolated DB)',
      'SLA 99.9% Uptime Guarantee',
      '2-Hour Premium SLA (24/7 Support)',
      'Dedicated Customer Success Manager',
      'Custom Feature Development',
      'Multi-Region Data Residency',
      'Enterprise SSO (SAML / OKTA)',
      'Quarterly Business Reviews',
      'White-Glove Onboarding & Training',
    ],
    limits: {
      clients: -1,
      keywordsPerClient: -1,
      teamMembers: -1,
      storageGB: -1,
      reportsPerMonth: -1,
      emailReportsPerMonth: -1,
      apiCallsPerDay: -1,
    },
    capabilities: {
      whiteLabelPDF: true,
      whiteLabelPortal: true,
      customDomain: true,
      gscIntegration: true,
      ga4Integration: true,
      supabaseStorage: true,
      aiRecommendations: true,
      competitorTracking: true,
      apiAccess: true,
      slaGuarantee: true,
      dedicatedSupport: true,
      twoFactor: true,
      auditLog: true,
      customEmailTemplates: true,
      advancedScheduling: true,
      multiUserTeam: true,
      prioritySupport: true,
    },
  },

  canceled: {
    id: 'canceled',
    name: 'canceled',
    displayName: 'Canceled',
    price: 0,
    priceAnnual: 0,
    color: '#EF4444',
    badge: '🚫',
    tagline: 'Subscription has been canceled',
    maxClients: 0,
    maxKeywordsPerClient: 0,
    maxTeamMembers: 0,
    maxStorageGB: 0,
    features: [],
    limits: {
      clients: 0,
      keywordsPerClient: 0,
      teamMembers: 0,
      storageGB: 0,
      reportsPerMonth: 0,
      emailReportsPerMonth: 0,
      apiCallsPerDay: 0,
    },
    capabilities: {
      whiteLabelPDF: false,
      whiteLabelPortal: false,
      customDomain: false,
      gscIntegration: false,
      ga4Integration: false,
      supabaseStorage: false,
      aiRecommendations: false,
      competitorTracking: false,
      apiAccess: false,
      slaGuarantee: false,
      dedicatedSupport: false,
      twoFactor: false,
      auditLog: false,
      customEmailTemplates: false,
      advancedScheduling: false,
      multiUserTeam: false,
      prioritySupport: false,
    },
  },
};

/** List of active (non-canceled) plan IDs */
export const ACTIVE_PLAN_IDS: PlanId[] = ['starter', 'pro', 'agency', 'enterprise'];

/** Get plan config by ID string */
export function getPlan(planId: string): Plan {
  return PLANS[(planId as PlanId)] || PLANS.starter;
}

/** Get monthly MRR contribution for a plan */
export function getPlanMRR(planId: string): number {
  return getPlan(planId).price;
}

/** Get plan color by ID */
export function getPlanColor(planId: string): string {
  return getPlan(planId).color;
}

/** Get plan display name by ID */
export function getPlanDisplayName(planId: string): string {
  return getPlan(planId).displayName;
}

/** Get plan badge emoji */
export function getPlanBadge(planId: string): string {
  return getPlan(planId).badge;
}

/** Check if an agency is on a canceled plan */
export function isCanceled(planId: string): boolean {
  return planId === 'canceled';
}

/** Check if an agency is active */
export function isActive(planId: string): boolean {
  return planId !== 'canceled' && planId !== 'suspended';
}
