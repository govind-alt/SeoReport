// SERanking API — TypeScript type definitions
// Reference: https://api.seranking.com/v3

// ── Projects / Sites ─────────────────────────────────────────────────────────

export interface SERankingSite {
  id: number;
  name: string;
  url: string;
  group_id?: number;
  created_at?: string;
}

// ── Keywords & Keyword Research ───────────────────────────────────────────────

export interface SERankingKeyword {
  id: number;
  name: string;
  group_id?: number;
  volume?: number;
  difficulty?: number;
}

export interface SERankingKeywordResearch {
  keyword: string;
  search_volume: number;
  cpc: number;
  difficulty: number;
  intent?: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
}

export interface SERankingPosition {
  keyword_id: number;
  keyword_name?: string;
  position: number;
  prev_position?: number;
  change: number;
  url: string;
  volume?: number;
  difficulty?: number;
  serp_features?: string[]; // e.g. ['featured_snippet', 'local_pack']
}

export interface SERankingRankingResponse {
  date: string;
  positions: SERankingPosition[];
}

// ── Backlinks ────────────────────────────────────────────────────────────────

export interface SERankingBacklinkSummary {
  domain_trust: number;
  total_backlinks: number;
  referring_domains: number;
  dofollow_links: number;
  nofollow_links: number;
  new_backlinks?: number;
  lost_backlinks?: number;
  gov_links?: number;
  edu_links?: number;
}

export interface SERankingBacklink {
  id: number;
  url_from: string;
  domain_from: string;
  url_to: string;
  anchor_text?: string;
  is_dofollow: boolean;
  domain_trust?: number;
  first_seen?: string;
  last_active?: string;
}

// ── Site Audit ───────────────────────────────────────────────────────────────

export interface SERankingAuditStatus {
  health_score: number;
  pages_crawled: number;
  indexable_pages?: number;
  issues: {
    critical: number;
    warnings: number;
    notices: number;
  };
  last_audit_date?: string;
}

export interface SERankingAuditIssue {
  type: string;
  severity: 'critical' | 'warning' | 'notice';
  count: number;
  affected_pages?: string[];
  description?: string;
}

// ── Competitors ──────────────────────────────────────────────────────────────

export interface SERankingCompetitor {
  id: number;
  domain: string;
  visibility?: number;
  common_keywords?: number;
}

// ── Analytics / Data API ────────────────────────────────────────────────────

export interface SERankingAnalyticsOverview {
  organic_sessions: number;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
  date_from: string;
  date_to: string;
}

export interface SERankingGSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SERankingGSCPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
