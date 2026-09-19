import { isPayLineOpen } from '@/features/matches/matchClosure';
import { getMoneyGlanceSummary } from '@/features/matches/paySummary';
import { routes } from '@/app/routes';
import { MONEY_BACK } from '@/nav/backDefaults';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { tournamentEvent } from '@/features/tournaments/tournamentEvent';
import { isTournamentLumpPay } from '@/features/tournaments/tournamentFormUtils';
import { useMemo, useState } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { MoneyGlanceCard } from '@/ui/MoneyGlanceCard';
import { MoneyMatchRow } from '@/ui/MoneyMatchRow';
import { PageHeader } from '@/ui/PageHeader';

type MoneyFilter = 'all' | 'unpaid' | 'paid' | 'donated' | 'cancelled';
type MoneyDateSort = 'oldest' | 'newest';

const FILTERS: { key: MoneyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
  { key: 'donated', label: 'Donated' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DATE_SORT_OPTIONS: { key: MoneyDateSort; label: string }[] = [
  { key: 'oldest', label: 'Oldest' },
  { key: 'newest', label: 'Newest' },
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
  const [dateSort, setDateSort] = useState<MoneyDateSort>('oldest');
  const glance = useMemo(() => getMoneyGlanceSummary(events), [events]);
  const filtered = useMemo(() => {
    const matchesFilter = events.filter((match) =>
      filter === 'all' ||
      (filter === 'cancelled'
        ? match.status === 'cancelled'
        : filter === 'unpaid'
          ? isPayLineOpen(match)
          : match.payStatus === filter),
    );

    return matchesFilter.sort((a, b) => {
      const delta = a.kickoffAt.getTime() - b.kickoffAt.getTime();
      return dateSort === 'oldest' ? delta : -delta;
    });
  }, [dateSort, events, filter]);

  return (
    <div className="rs-stack rs-money-page">
      <PageHeader title="Money" />

      <p className="rs-page-lede">
        Record pay, reimbursements, and expenses for each match so your records are
        ready at tax time.
      </p>

      <MoneyGlanceCard summary={glance} />

      <div className="rs-money-toolbar">
        <div className="rs-filter-row" role="tablist" aria-label="Money filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              className={`rs-filter-chip ${filter === item.key ? 'rs-filter-chip--active' : ''}`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          className="rs-schedule-toggle"
          role="tablist"
          aria-label="Event date sort"
        >
          {DATE_SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={dateSort === option.key}
              tabIndex={dateSort === option.key ? 0 : -1}
              className={[
                'rs-schedule-toggle__option',
                dateSort === option.key ? 'rs-schedule-toggle__option--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setDateSort(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rs-placeholder-card"><p>{events.length === 0
          ? 'Events appear here as soon as you create them.' : 'No events match this filter.'}</p></div>
      ) : <ul className="rs-list">{filtered.map((match) => (
        tournaments.some((item) => item.id === match.id) ? (
          <li key={match.id} className="rs-money-match-row">
            <MatchCard
              match={match}
              embedded
              detailTo={routes.tournamentDetail(match.id)}
              back={MONEY_BACK}
            />
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
        ) : <MoneyMatchRow key={match.id} match={match} back={MONEY_BACK} />
      ))}</ul>}
    </div>
  );
}
