import { formatCurrency } from '@/domain/matchDisplay';
import type { MoneyGlanceSummary } from '@/features/matches/paySummary';
import { useI18n } from '@/i18n/I18nProvider';

type Props = {
  summary: MoneyGlanceSummary;
};

export function MoneyGlanceCard({ summary }: Props) {
  const { locale, t } = useI18n();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  return (
    <section className="rs-money-glance" aria-label={t('money.summary')}>
      <div>
        <strong>{formatCurrency(summary.income, 'USD', locale)}</strong>
        <span>{t('money.income')}</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.unpaidFees, 'USD', locale)}</strong>
        <span>
          {t('money.unpaidFees')}<br />({number.format(summary.openSettlements)}) {t('money.open')}
        </span>
      </div>
      <div>
        <strong>{formatCurrency(summary.awaitingReimbursement, 'USD', locale)}</strong>
        <span>{t('money.awaitingReimbursement')}</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.outOfPocket, 'USD', locale)}</strong>
        <span>{t('money.outOfPocket')}</span>
      </div>
    </section>
  );
}
