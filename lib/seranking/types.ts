export interface SERankingSite {
  id: number;
  name: string;
  url: string;
  group_id?: number;
}

export interface SERankingKeyword {
  id: number;
  name: string;
  group_id?: number;
}

export interface SERankingPosition {
  keyword_id: number;
  position: number;
  change: number;
  url: string;
}

export interface SERankingRankingResponse {
  date: string;
  positions: SERankingPosition[];
}

export interface SERankingCompetitor {
  id: number;
  domain: string;
}

export interface SERankingAuditStatus {
  health_score: number;
  issues: {
    critical: number;
    warnings: number;
    notices: number;
  };
}
