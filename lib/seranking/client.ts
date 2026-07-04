import type { SERankingSite, SERankingRankingResponse, SERankingCompetitor, SERankingAuditStatus } from './types';

const API_BASE_URL = 'https://api.seranking.com/v3';

export class SERankingClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('SERanking API Key is required');
    }
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

  /**
   * GET /sites
   * List all projects/sites.
   */
  async getSites(): Promise<SERankingSite[]> {
    return this.fetchApi<SERankingSite[]>('/sites');
  }

  /**
   * GET /sites/{id}/rankings
   * Get keyword positions.
   */
  async getRankings(siteId: number): Promise<SERankingRankingResponse> {
    return this.fetchApi<SERankingRankingResponse>(`/sites/${siteId}/rankings`);
  }

  /**
   * GET /sites/{id}/competitors
   * Get competitor data.
   */
  async getCompetitors(siteId: number): Promise<SERankingCompetitor[]> {
    return this.fetchApi<SERankingCompetitor[]>(`/sites/${siteId}/competitors`);
  }

  /**
   * GET /sites/{id}/audit
   * Get site audit results.
   */
  async getAudit(siteId: number): Promise<SERankingAuditStatus> {
    return this.fetchApi<SERankingAuditStatus>(`/sites/${siteId}/audit`);
  }
}
