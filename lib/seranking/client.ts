import type {
  SERankingSite,
  SERankingRankingResponse,
  SERankingCompetitor,
  SERankingAuditStatus,
  SERankingAuditIssue,
  SERankingBacklinkSummary,
  SERankingBacklink,
  SERankingAnalyticsOverview,
  SERankingGSCQuery,
  SERankingGSCPage,
} from './types';

const API_BASE_URL = 'https://api.seranking.com/v3';

export class SERankingClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('SERanking API Key is required');
    this.apiKey = apiKey;
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Token ${this.apiKey}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`SERanking API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // ── Projects ──────────────────────────────────────────────────────────────

  /** GET /sites — List all projects */
  async getSites(): Promise<SERankingSite[]> {
    return this.fetchApi<SERankingSite[]>('/sites');
  }

  // ── Rankings ─────────────────────────────────────────────────────────────

  /**
   * GET /sites/{id}/rankings
   * @param siteId  SERanking project ID
   * @param dateFrom Optional YYYY-MM-DD
   * @param dateTo   Optional YYYY-MM-DD
   */
  async getRankings(
    siteId: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<SERankingRankingResponse> {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.fetchApi<SERankingRankingResponse>(`/sites/${siteId}/rankings${qs}`);
  }

  // ── Backlinks ────────────────────────────────────────────────────────────

  /** GET /backlinks/summary?domain={domain} */
  async getBacklinksSummary(domain: string): Promise<SERankingBacklinkSummary> {
    return this.fetchApi<SERankingBacklinkSummary>(
      `/backlinks/summary?domain=${encodeURIComponent(domain)}`,
    );
  }

  /** GET /backlinks/new?domain={domain}&limit={n} */
  async getNewBacklinks(domain: string, limit = 50): Promise<SERankingBacklink[]> {
    return this.fetchApi<SERankingBacklink[]>(
      `/backlinks/new?domain=${encodeURIComponent(domain)}&limit=${limit}`,
    );
  }

  /** GET /backlinks/lost?domain={domain}&limit={n} */
  async getLostBacklinks(domain: string, limit = 50): Promise<SERankingBacklink[]> {
    return this.fetchApi<SERankingBacklink[]>(
      `/backlinks/lost?domain=${encodeURIComponent(domain)}&limit=${limit}`,
    );
  }

  // ── Audit ────────────────────────────────────────────────────────────────

  /** GET /sites/{id}/audit — Site audit health summary */
  async getAudit(siteId: number): Promise<SERankingAuditStatus> {
    return this.fetchApi<SERankingAuditStatus>(`/sites/${siteId}/audit`);
  }

  /** GET /sites/{id}/audit/issues — Full issues list */
  async getAuditIssues(siteId: number): Promise<SERankingAuditIssue[]> {
    return this.fetchApi<SERankingAuditIssue[]>(`/sites/${siteId}/audit/issues`);
  }

  // ── Competitors ──────────────────────────────────────────────────────────

  /** GET /sites/{id}/competitors */
  async getCompetitors(siteId: number): Promise<SERankingCompetitor[]> {
    return this.fetchApi<SERankingCompetitor[]>(`/sites/${siteId}/competitors`);
  }

  // ── Analytics ────────────────────────────────────────────────────────────

  /** Domain overview (traffic estimates) — Data API v3 */
  async getAnalyticsOverview(
    domain: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<SERankingAnalyticsOverview> {
    const params = new URLSearchParams({ domain });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return this.fetchApi<SERankingAnalyticsOverview>(
      `/data/v3/domain_overview?${params.toString()}`,
    );
  }

  /** GET /sites/{id}/analytics/queries — GSC top queries */
  async getGSCQueries(siteId: number, limit = 20): Promise<SERankingGSCQuery[]> {
    return this.fetchApi<SERankingGSCQuery[]>(
      `/sites/${siteId}/analytics/queries?limit=${limit}`,
    );
  }

  /** GET /sites/{id}/analytics/pages — GSC top pages */
  async getGSCPages(siteId: number, limit = 20): Promise<SERankingGSCPage[]> {
    return this.fetchApi<SERankingGSCPage[]>(
      `/sites/${siteId}/analytics/pages?limit=${limit}`,
    );
  }
}
