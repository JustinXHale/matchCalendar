import { isPayLineOpen } from '@/features/matches/matchClosure';
import { routes } from '@/app/routes';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { tournamentEvent } from '@/features/tournaments/tournamentEvent';
import { isTournamentLumpPay } from '@/features/tournaments/tournamentFormUtils';
import { useMemo, useState } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { MoneyMatchRow } from '@/ui/MoneyMatchRow';
import { PageHeader } from '@/ui/PageHeader';

type MoneyFilter = 'all' | 'unpaid' | 'paid' | 'donated' | 'cancelled';

const FILTERS: { key: MoneyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
  { key: 'donated', label: 'Donated' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function MoneyPage() {
  const { matches } = useMatches();
  const { tournaments, updateTournament } = useTournamentsContext();
  const events = useMemo(
    () => [
      ...matches,
      ...tournaments
        .filter(isTournamentLumpPay)
        .map(tournamentEvent),
    ],
    [matches, tournaments],
  );
  const [filter, setFilter] = useState<MoneyFilter>('all');
  const filtered = useMemo(() => events
    .filter((match) => filter === 'all' || (filter === 'cancelled'
      ? match.status === 'cancelled'
      : filter === 'unpaid' ? isPayLineOpen(match) : match.payStatus === filter))
    .sort((a, b) => b.kickoffAt.getTime() - a.kickoffAt.getTime()), [events, filter]);

  return (
    <div className="rs-stack rs-money-page">
      <PageHeader title="Money" />

      <p className="rs-page-lede">
        Record pay, reimbursements, and expenses for each match so your records are
        ready at tax time.
      </p>

      <div className="rs-filter-row" role="tablist" aria-label="Money filters">
        {FILTERS.map((item) => (
          <button key={item.key} type="button" role="tab"
            aria-selected={filter === item.key}
            className={`rs-filter-chip ${filter === item.key ? 'rs-filter-chip--active' : ''}`}
            onClick={() => setFilter(item.key)}>{item.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rs-placeholder-card"><p>{events.length === 0
          ? 'Events appear here as soon as you create them.' : 'No events match this filter.'}</p></div>
      ) : <ul className="rs-list">{filtered.map((match) => (
        tournaments.some((item) => item.id === match.id) ? (
          <li key={match.id} className="rs-money-match-row">
            <MatchCard match={match} embedded detailTo={routes.tournamentDetail(match.id)} />
            <MatchMoneyClosure match={match} onSavePatch={(patch) => {
              const tournament = tournaments.find((item) => item.id === match.id)!;
              const { expenses, flight, lodging, groundTravel, ...settlement } = patch;
              updateTournament(match.id, {
                ...('expenses' in patch ? { expenses } : {}),
                ...('flight' in patch ? { flight } : {}),
                ...('lodging' in patch ? { lodging } : {}),
                ...('groundTravel' in patch ? { groundTravel } : {}),
                settlement: { ...tournament.settlement, ...settlement },
              });
            }} />
          </li>
        ) : <MoneyMatchRow key={match.id} match={match} />
      ))}</ul>}
    </div>
  );
}
