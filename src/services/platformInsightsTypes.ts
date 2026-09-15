import type {
  CountRow,
  InsightsSummary,
  OrganizationRow,
} from '@/features/insights/insightsSummary';

export type PlatformMember = {
  uid: string;
  displayName: string;
  email: string | null;
  authCreatedAt: string | null;
  calendarSeenAt: string | null;
  matchCount: number;
  tournamentCount: number;
};

export type PlatformInsightsResult = {
  generatedAt: string;
  memberCount: number;
  members: PlatformMember[];
  insights: InsightsSummary;
};

export type { CountRow, OrganizationRow };
