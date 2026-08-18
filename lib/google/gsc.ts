import { decrypt, encrypt } from '../encryption';
import { prisma } from '../prisma';

export class GscClient {
  private credentialId: string;
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: Date;

  constructor(credential: { id: string; accessToken: string; refreshToken: string; expiresAt: Date }) {
    this.credentialId = credential.id;
    this.accessToken = decrypt(credential.accessToken);
    this.refreshToken = decrypt(credential.refreshToken);
    this.expiresAt = credential.expiresAt;
  }

  /**
   * Refreshes the Google OAuth access token if it is expired or close to expiry.
   */
  private async checkAndRefreshToken() {
    if (this.expiresAt.getTime() > Date.now() + 60000) {
      // Token is still valid (with a 1-minute buffer)
      return;
    }

    if (!this.refreshToken) {
      throw new Error('Refresh token is missing. Please reconnect Google Search Console.');
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to refresh Google OAuth token: ${await res.text()}`);
    }

    const tokens = await res.json();
    const newAccessToken = tokens.access_token;
    const expiresIn = tokens.expires_in;

    this.accessToken = newAccessToken;
    this.expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Persist new access token back to database
    await prisma.agency.update({
      where: { id: this.credentialId },
      data: {
        googleRefreshToken: encrypt(newAccessToken),
      },
    }).catch(() => {});
  }

  /**
   * Executes a query on Google Search Console searchAnalytics endpoint.
   */
  async querySearchAnalytics(siteUrl: string, startDate: string, endDate: string, dimensions: string[] = ['date'], limit: number = 1000) {
    await this.checkAndRefreshToken();

    // Standardize URL formatting for GSC API (e.g. sc-domain:example.com or https://example.com/)
    const encodedSite = encodeURIComponent(siteUrl);
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: limit,
      }),
    });

    if (!res.ok) {
      throw new Error(`GSC Query Error: ${res.status} ${await res.text()}`);
    }

    return res.json();
  }

  /**
   * Retrieves summary traffic metrics (aggregated sessions/clicks/impressions).
   */
  async getTrafficSummary(siteUrl: string, startDate: string, endDate: string) {
    const data = await this.querySearchAnalytics(siteUrl, startDate, endDate, []);
    const row = data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    return {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
      position: Number((row.position || 0).toFixed(1)),
    };
  }

  /**
   * Retrieves the top search search query metrics.
   */
  async getTopQueries(siteUrl: string, startDate: string, endDate: string, limit: number = 10) {
    const data = await this.querySearchAnalytics(siteUrl, startDate, endDate, ['query'], limit);
    return (data.rows || []).map((row: any) => ({
      query: row.keys?.[0] || 'unknown',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
      position: Number((row.position || 0).toFixed(1)),
    }));
  }

  /**
   * Retrieves the top organic landing page metrics.
   */
  async getTopPages(siteUrl: string, startDate: string, endDate: string, limit: number = 10) {
    const data = await this.querySearchAnalytics(siteUrl, startDate, endDate, ['page'], limit);
    return (data.rows || []).map((row: any) => ({
      page: row.keys?.[0] || 'unknown',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
      position: Number((row.position || 0).toFixed(1)),
    }));
  }
}
