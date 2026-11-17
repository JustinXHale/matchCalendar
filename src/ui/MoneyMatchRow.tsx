import type { Match } from '@/domain/match';
import type { BackNav } from '@/nav/backNav';
import { MONEY_BACK } from '@/nav/backDefaults';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';
import { isSettlementFullyResolved } from '@/features/matches/matchClosure';

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
  const settled = isSettlementFullyResolved(match);

  return (
    <li
      className={[
        'rs-money-match-row',
        settled ? 'rs-money-match-row--settled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <MatchCard match={match} embedded back={back} />
      <MatchMoneyClosure match={match} defaultExpanded={defaultExpanded} />
    </li>
  );
}
