import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faPlane } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@/domain/matchDisplay';
import type { CountRow, InsightsSummary } from '@/features/insights/insightsSummary';
import {
  drivingMinutesFromMiles,
  formatTravelDuration,
} from '@/features/matches/travelDuration';

const COLORS = ['#2563eb', '#0d9488', '#d97706', '#9333ea', '#db2777', '#64748b'];
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function CountChart({
  rows,
  label,
  compactLegend = false,
}: {
  rows: CountRow[];
  label: string;
  compactLegend?: boolean;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  let offset = -Math.PI / 2;

  return (
    <div className="rs-insight-chart-row">
      <svg
        className="rs-insight-pie"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`${label}: ${total} total. ${rows.map((row) => `${row.label}: ${row.count}`).join(', ')}`}
      >
        {total === 0 ? (
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        ) : (
          rows.map((row, index) => {
            const start = offset;
            const angle = (row.count / total) * Math.PI * 2;
            offset += angle;
            const color = COLORS[index % COLORS.length];
            if (row.count === total) {
              return <circle key={row.label} cx="60" cy="60" r="54" fill={color} />;
            }
            const path = `M60 60 L${60 + 54 * Math.cos(start)} ${60 + 54 * Math.sin(start)} A54 54 0 ${angle > Math.PI ? 1 : 0} 1 ${60 + 54 * Math.cos(offset)} ${60 + 54 * Math.sin(offset)} Z`;
            return (
              <path
                key={row.label}
                d={path}
                fill={color}
                stroke="var(--rs-color-surface)"
                strokeWidth="2"
              >
                <title>{row.label}: {row.count}</title>
              </path>
            );
          })
        )}
      </svg>
      {rows.length ? (
        <ul
          className={`rs-insight-legend${compactLegend ? ' rs-insight-legend--compact' : ''}`}
        >
          {rows.map((row, index) => (
            <li key={row.label}>
              <span className="rs-insight-legend__label">
                <span
                  className="rs-insight-swatch"
                  style={{ background: COLORS[index % COLORS.length] }}
                  aria-hidden
                />
                {row.label}
              </span>
              <strong>{number.format(row.count)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rs-summary-label">No events recorded yet.</p>
      )}
    </div>
  );
}

type Props = {
  summary: InsightsSummary;
  idPrefix?: string;
};

export function InsightsSummaryView({ summary, idPrefix = 'insights' }: Props) {
  const drivenMinutes = drivingMinutesFromMiles(summary.milesDriven);

  return (
    <>
      <section className="rs-insight-card" aria-labelledby={`${idPrefix}-events`}>
        <div className="rs-insight-heading">
          <h2 id={`${idPrefix}-events`}>Total events</h2>
          <strong className="rs-insight-total">{number.format(summary.eventCount)}</strong>
        </div>
        <CountChart rows={summary.eventTypes} label="Events by type" compactLegend />
        <p className="rs-summary-label">
          Each tournament counts as one event. Cancelled events are excluded.
        </p>
      </section>

      <section className="rs-insight-card" aria-labelledby={`${idPrefix}-travel`}>
        <h2 id={`${idPrefix}-travel`}>Travel</h2>
        <div className="rs-insight-travel">
          <div>
            <FontAwesomeIcon icon={faCar} aria-hidden />
            <strong>{number.format(summary.milesDriven)} <small>mi</small></strong>
            {summary.drivenTrips > 0 || drivenMinutes > 0 ? (
              <span className="rs-insight-travel__meta">
                {[
                  summary.drivenTrips > 0
                    ? `${number.format(summary.drivenTrips)} trip${summary.drivenTrips === 1 ? '' : 's'}`
                    : null,
                  drivenMinutes > 0 ? formatTravelDuration(drivenMinutes) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            ) : null}
            <span>Miles driven</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faPlane} aria-hidden />
            <strong>{number.format(summary.milesFlown)} <small>mi</small></strong>
            {summary.flightSegments > 0 || summary.flightMinutes > 0 ? (
              <span className="rs-insight-travel__meta">
                {[
                  summary.flightSegments > 0
                    ? `${number.format(summary.flightSegments)} segment${summary.flightSegments === 1 ? '' : 's'}`
                    : null,
                  summary.flightMinutes > 0
                    ? formatTravelDuration(summary.flightMinutes)
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            ) : null}
            <span>Miles flown</span>
          </div>
        </div>
        <p className="rs-summary-label">
          Driven time uses a 65 mph average. Flight time uses departure and arrival
          times on your segments; miles flown use airport codes when available.
        </p>
      </section>

      <section className="rs-insight-card" aria-labelledby={`${idPrefix}-finances`}>
        <div className="rs-insight-finances">
          <div>
            <h2 id={`${idPrefix}-finances`}>Finances</h2>
            <dl className="rs-insight-metrics">
              <div>
                <dt>Paid</dt>
                <dd>{formatCurrency(summary.paid)}</dd>
              </div>
              <div>
                <dt>Expenses</dt>
                <dd>{formatCurrency(summary.expenses)}</dd>
              </div>
              <div className="rs-insight-net">
                <dt>Net</dt>
                <dd>{formatCurrency(summary.net)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3>Top expenses</h3>
            <p className="rs-summary-label">Unreimbursed costs</p>
            {summary.topExpenses.length ? (
              <ol className="rs-insight-expenses">
                {summary.topExpenses.map((row) => (
                  <li key={row.category}>
                    <div>
                      <span>{row.label}</span>
                      <strong>{formatCurrency(row.outOfPocket)}</strong>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rs-summary-label">No unreimbursed expenses.</p>
            )}
          </div>
        </div>
        <p className="rs-summary-label">
          Paid includes received fees and reimbursements. Net is paid minus total
          expenses.
        </p>
      </section>

      <section className="rs-insight-card" aria-labelledby={`${idPrefix}-positions`}>
        <h2 id={`${idPrefix}-positions`}>Positions</h2>
        <CountChart rows={summary.positions} label="Assignments by position" />
        <p className="rs-summary-label">Includes individual tournament matches.</p>
      </section>

      <section className="rs-insight-card" aria-labelledby={`${idPrefix}-organizations`}>
        <h2 id={`${idPrefix}-organizations`}>Net income by organization</h2>
        {summary.organizations.length ? (
          <div
            className="rs-insight-table-scroll"
            role="region"
            aria-label="Organization income table"
            tabIndex={0}
          >
            <table className="rs-insight-table">
              <thead>
                <tr>
                  <th scope="col">Organization</th>
                  <th scope="col">Income</th>
                  <th scope="col">Expenses</th>
                  <th scope="col">Net</th>
                </tr>
              </thead>
              <tbody>
                {summary.organizations.map((row) => (
                  <tr key={row.organization}>
                    <th scope="row">{row.organization}</th>
                    <td>{formatCurrency(row.income)}</td>
                    <td>{formatCurrency(row.expenses)}</td>
                    <td>{formatCurrency(row.net)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td>{formatCurrency(summary.paid)}</td>
                  <td>{formatCurrency(summary.expenses)}</td>
                  <td>{formatCurrency(summary.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="rs-summary-label">
            Add an event to start tracking income by organization.
          </p>
        )}
        <p className="rs-summary-label">
          Grouped by competition, or pay assigner when no competition is set.
        </p>
      </section>
    </>
  );
}
