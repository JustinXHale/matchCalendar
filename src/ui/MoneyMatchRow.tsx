import type { Match } from '@/domain/match';
import { needsSettlementAttention } from '@/features/matches/matchClosure';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';

type Props = {
  match: Match;
  defaultExpanded?: boolean;
};

export function MoneyMatchRow({ match, defaultExpanded }: Props) {
  const autoExpand = defaultExpanded ?? needsSettlementAttention(match);

  return (
    <li className="rs-money-match-row">
      <MatchCard match={match} embedded />
      <MatchMoneyClosure match={match} defaultExpanded={autoExpand} />
    </li>
  );
}
