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
import { useI18n } from '@/i18n/I18nProvider';

type MoneyFilter = 'all' | 'unpaid' | 'paid';
type MoneyDateSort = 'oldest' | 'newest';

export function MoneyPage() {
  const { t } = useI18n();
  const filters = [
    { key: 'all' as const, label: t('money.all') },
    { key: 'unpaid' as const, label: t('status.unpaid') },
    { key: 'paid' as const, label: t('status.paid') },
  ];
  const dateSortOptions = [
    { key: 'oldest' as const, label: t('money.oldest') },
    { key: 'newest' as const, label: t('money.newest') },
  ];
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
      (filter === 'unpaid'
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
      <PageHeader title={t('nav.money')} />

      <p className="rs-page-lede">
        {t('money.description')}
      </p>

      <MoneyGlanceCard summary={glance} />

      <div className="rs-money-toolbar">
        <div className="rs-filter-row" role="tablist" aria-label={t('money.filters')}>
          {filters.map((item) => (
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
          aria-label={t('money.dateSort')}
        >
          {dateSortOptions.map((option) => (
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
          ? t('money.empty') : t('money.noFilterResults')}</p></div>
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
