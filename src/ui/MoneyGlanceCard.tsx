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
        <strong>{formatCurrency(summary.income)}</strong>
        <span>Income</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.unpaidFees)}</strong>
        <span>
          Unpaid fees<br />({number.format(summary.openSettlements)}) Open
        </span>
      </div>
      <div>
        <strong>{formatCurrency(summary.awaitingReimbursement)}</strong>
        <span>Awaiting reimbursement</span>
      </div>
      <div>
        <strong>{formatCurrency(summary.outOfPocket)}</strong>
        <span>Out of pocket</span>
      </div>
    </section>
  );
}
