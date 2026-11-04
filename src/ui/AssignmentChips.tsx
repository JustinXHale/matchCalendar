import type { Match } from '@/domain/match';
import { formatCurrency } from '@/domain/matchDisplay';
import { useI18n } from '@/i18n/I18nProvider';

type Props = {
  match: Match;
  primaryLabel: string;
};

/** Shared schedule-card chips for matches and tournament containers. */
export function AssignmentChips({ match, primaryLabel }: Props) {
  const { locale, t } = useI18n();
  const pay = match.expectedPay != null
    ? formatCurrency(match.expectedPay, match.payCurrency, locale)
    : null;

  return (
    <div className="rs-assignment__chips" aria-label="Type, pay, and source">
      <span className="rs-pill rs-assignment__chip">{primaryLabel}</span>
      {pay ? (
        <span className="rs-pill rs-assignment__chip rs-assignment__chip--pay">
          {pay}
        </span>
      ) : null}
      {match.source.type === 'matchreadytx' ? (
        <span className="rs-pill rs-pill--source rs-assignment__chip">
          MR Import
        </span>
      ) : null}
      {match.payStatus === 'unpaid' && match.status !== 'cancelled' ? (
        <span className="rs-pill rs-pill--urgent rs-assignment__chip">
          {t('status.unpaid')}
        </span>
      ) : null}
      {match.payStatus === 'paid' ? (
        <span className="rs-pill rs-assignment__chip">{t('status.paid')}</span>
      ) : null}
      {match.payStatus === 'donated' ? (
        <span className="rs-pill rs-assignment__chip">{t('status.donated')}</span>
      ) : null}
      {match.status === 'cancelled' ? (
        <span className="rs-pill rs-pill--urgent rs-assignment__chip">
          {t('status.cancelled')}
        </span>
      ) : null}
    </div>
  );
}
