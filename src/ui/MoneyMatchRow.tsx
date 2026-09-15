import type { Match } from '@/domain/match';
import { needsSettlementAttention } from '@/features/matches/matchClosure';
import type { BackNav } from '@/nav/backNav';
import { MONEY_BACK } from '@/nav/backDefaults';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';

type Props = {
  match: Match;
  defaultExpanded?: boolean;
  back?: BackNav;
};

export function MoneyMatchRow({
  match,
  defaultExpanded,
  back = MONEY_BACK,
}: Props) {
  const autoExpand = defaultExpanded ?? needsSettlementAttention(match);

  return (
    <li className="rs-money-match-row">
      <MatchCard match={match} embedded back={back} />
      <MatchMoneyClosure match={match} defaultExpanded={autoExpand} />
    </li>
  );
}
