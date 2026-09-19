import { formatCurrency } from '@/domain/matchDisplay';
import type { MoneyGlanceSummary } from '@/features/matches/paySummary';

type Props = {
  summary: MoneyGlanceSummary;
};

export function MoneyGlanceCard({ summary }: Props) {
  const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

  return (
    <section className="rs-money-glance" aria-label="Money summary">
      <div>
        <strong>{formatCurrency(summary.unpaidFees)}</strong>
        <span>Unpaid fees</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.awaitingReimbursement)}</strong>
        <span>Awaiting reimbursement</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.outOfPocket)}</strong>
        <span>Out of pocket</span>
      </div>
      <div>
        <strong>{number.format(summary.openSettlements)}</strong>
        <span>Open settlements</span>
      </div>
    </section>
  );
}
