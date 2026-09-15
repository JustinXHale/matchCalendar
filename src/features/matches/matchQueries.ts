import type { Match } from '@/domain/match';
import { needsSettlementAttention } from '@/features/matches/matchClosure';

function compareKickoffAsc(a: Match, b: Match): number {
  return a.kickoffAt.getTime() - b.kickoffAt.getTime();
}

function compareKickoffDesc(a: Match, b: Match): number {
  return b.kickoffAt.getTime() - a.kickoffAt.getTime();
}

export function isUpcomingMatch(match: Match, now = new Date()): boolean {
  return match.status !== 'cancelled' && match.kickoffAt >= now;
}

export function isHistoryMatch(match: Match, now = new Date()): boolean {
  return (
    match.status === 'completed' ||
    match.status === 'cancelled' ||
    match.kickoffAt < now
  );
}

export function getUpcomingMatches(matches: Match[], now = new Date()): Match[] {
  return matches
    .filter((match) => isUpcomingMatch(match, now))
    .sort(compareKickoffAsc);
}

export function getHistoryMatches(matches: Match[], now = new Date()): Match[] {
  return matches
    .filter((match) => isHistoryMatch(match, now))
    .sort(compareKickoffDesc);
}

export function getNeedsClosureMatches(matches: Match[], now = new Date()): Match[] {
  return matches
    .filter((match) => needsSettlementAttention(match, now))
    .sort(compareKickoffDesc);
}

export function countNeedsClosureMatches(matches: Match[], now = new Date()): number {
  return getNeedsClosureMatches(matches, now).length;
}

export function getMatchById(matches: Match[], matchId: string): Match | undefined {
  return matches.find((match) => match.id === matchId);
}
