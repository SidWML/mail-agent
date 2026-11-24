/** Response of GET /api/dashboard (tiles and charts DB-01 to DB-12 plus a one-line narrative). */

export interface DashboardQuery {
  days?: number;
  category?: string;
  assignee?: string;
}

export interface NamedCount {
  name: string;
  value: number;
}

export interface VolumeDay {
  /** "MM-DD" */
  day: string;
  received: number;
  acted: number;
}

export interface CategoryTrend {
  name: string;
  /** Mails per week, oldest first (8 weeks). */
  weeks: number[];
}

export interface CategoryResponseTime {
  name: string;
  /** Hours */
  median: number;
  p90: number;
}

export interface SlaBreach {
  id: string;
  subject: string;
  overByH: number;
}

export interface AgentWorkload {
  name: string;
  claimed: number;
  replied: number;
  acted: number;
}

export interface TopicCount extends NamedCount {
  /** Percent change against the period before. null means the topic was not seen then. */
  change: number | null;
  /** Up to two mails that show what the topic is about. */
  examples: Array<{ id: string; subject: string }>;
}

export interface SentimentDay {
  /** "MM-DD" */
  day: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface DashboardResponse {
  range: { days: number };
  tiles: {
    received: { today: number; week: number; month: number; range: number; prev: number };
    open: { total: number; new: number; inProgress: number; waiting: number };
    acted: number;
    unassigned: number;
  };
  volume: VolumeDay[];
  byCategory: NamedCount[];
  categoryTrend: CategoryTrend[];
  backlog: NamedCount[];
  response: {
    firstMedian: number;
    firstP90: number;
    ttaMedian: number;
    ttaP90: number;
    byCategory: CategoryResponseTime[];
  };
  sla: { compliancePct: number; breaches: SlaBreach[]; breachCount: number };
  workload: AgentWorkload[];
  urgency: NamedCount[];
  sentiment: NamedCount[];
  topSenders: NamedCount[];
  topBusinessUnits: NamedCount[];
  topCountries: NamedCount[];
  topics: TopicCount[];
  sentimentTrend: SentimentDay[];
  ai: {
    autoSortedPct: number;
    overriddenPct: number;
    needsReviewPct: number;
    accuracyByCategory: NamedCount[];
  };
  narrative: string;
}
