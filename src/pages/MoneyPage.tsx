import {
  isSettlementFullyResolved,
  needsSettlementAttention,
} from '@/features/matches/matchClosure';
import { getMoneyGlanceSummary } from '@/features/matches/paySummary';
import { routes } from '@/app/routes';
import { MONEY_BACK } from '@/nav/backDefaults';
import { MatchCard } from '@/ui/MatchCard';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { tournamentEvent } from '@/features/tournaments/tournamentEvent';
import { isTournamentLumpPay } from '@/features/tournaments/tournamentFormUtils';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMatches } from '@/features/matches/useMatches';
import { MoneyGlanceCard } from '@/ui/MoneyGlanceCard';
import { MoneyMatchRow } from '@/ui/MoneyMatchRow';
import { PageHeader } from '@/ui/PageHeader';
import { useI18n } from '@/i18n/I18nProvider';

type MoneyFilter = 'all' | 'unpaid' | 'paid';
type MoneyDateSort = 'oldest' | 'newest';

const ALL_PAYERS = '__all_payers__';
const UNSPECIFIED_PAYER = '__unspecified_payer__';

export function MoneyPage() {
  const { locale, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const statusParam = searchParams.get('status');
  const filter: MoneyFilter =
    statusParam === 'unpaid' || statusParam === 'paid' ? statusParam : 'all';
  const payerFilter = searchParams.get('payer') || ALL_PAYERS;
  const dateSort: MoneyDateSort =
    searchParams.get('sort') === 'newest' ? 'newest' : 'oldest';
  const updateSearchParam = (
    key: string,
    value: string,
    defaultValue: string,
  ) => {
    const next = new URLSearchParams(searchParams);
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const payerOptions = useMemo(() => {
    const labels = new Map<string, string>();
    let hasUnspecified = false;

    for (const event of events) {
      const payer = event.payOwedBy?.trim();
      if (!payer) {
        hasUnspecified = true;
        continue;
      }
      const key = payer.toLocaleLowerCase(locale);
      if (!labels.has(key)) labels.set(key, payer);
    }

    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    return {
      hasUnspecified,
      values: [...labels.entries()].sort((a, b) => collator.compare(a[1], b[1])),
    };
  }, [events, locale]);
  const glance = useMemo(() => getMoneyGlanceSummary(events), [events]);
  const filtered = useMemo(() => {
    const matchesFilter = events.filter((match) => {
      const payer = match.payOwedBy?.trim();
      const matchesPayer =
        payerFilter === ALL_PAYERS ||
        (payerFilter === UNSPECIFIED_PAYER
          ? !payer
          : payer?.toLocaleLowerCase(locale) === payerFilter);
      const matchesStatus =
        filter === 'all' ||
        (filter === 'unpaid'
          ? needsSettlementAttention(match)
          : isSettlementFullyResolved(match));

      return matchesPayer && matchesStatus;
    });

    return matchesFilter.sort((a, b) => {
      const delta = a.kickoffAt.getTime() - b.kickoffAt.getTime();
      return dateSort === 'oldest' ? delta : -delta;
    });
  }, [dateSort, events, filter, locale, payerFilter]);
  const moneyBack = {
    ...MONEY_BACK,
    to: `${routes.money}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
  };

  return (
    <div className="rs-stack rs-money-page">
      <PageHeader title={t('nav.money')} />

      <p className="rs-page-lede">
        {t('money.description')}
      </p>

      <MoneyGlanceCard summary={glance} />

      <div className="rs-money-toolbar">
        <label className="rs-money-payer-filter" htmlFor="money-payer-filter">
          <span>{t('money.owedByFilter')}</span>
          <select
            id="money-payer-filter"
            className="rs-select"
            value={payerFilter}
            onChange={(event) =>
              updateSearchParam('payer', event.target.value, ALL_PAYERS)
            }
          >
            <option value={ALL_PAYERS}>{t('money.allPayers')}</option>
            {payerOptions.values.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
            {payerOptions.hasUnspecified ? (
              <option value={UNSPECIFIED_PAYER}>{t('money.payerNotSpecified')}</option>
            ) : null}
          </select>
        </label>
        <div className="rs-money-toolbar__controls">
          <div className="rs-filter-row" role="tablist" aria-label={t('money.filters')}>
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                className={`rs-filter-chip ${filter === item.key ? 'rs-filter-chip--active' : ''}`}
                onClick={() => updateSearchParam('status', item.key, 'all')}
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
                onClick={() => updateSearchParam('sort', option.key, 'oldest')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rs-placeholder-card"><p>{events.length === 0
          ? t('money.empty') : t('money.noFilterResults')}</p></div>
      ) : <ul className="rs-list">{filtered.map((match) => (
        tournaments.some((item) => item.id === match.id) ? (
          <li
            key={match.id}
            className={[
              'rs-money-match-row',
              isSettlementFullyResolved(match)
                ? 'rs-money-match-row--settled'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <MatchCard
              match={match}
              embedded
              detailTo={routes.tournamentDetail(match.id)}
              back={moneyBack}
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
        ) : <MoneyMatchRow key={match.id} match={match} back={moneyBack} />
      ))}</ul>}
    </div>
  );
}
