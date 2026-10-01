import type { Match } from '@/domain/match';
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
  return (
    <li className="rs-money-match-row">
      <MatchCard match={match} embedded back={back} />
      <MatchMoneyClosure match={match} defaultExpanded={defaultExpanded} />
    </li>
  );
}
