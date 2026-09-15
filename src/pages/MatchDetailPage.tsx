import { formatExpenseCategory } from '@/domain/expenseCategories';
import { Button } from '@patternfly/react-core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resolveMatchTypeLabel } from '@/domain/matchConstants';
import { formatPaymentMethodLabel } from '@/domain/paymentMethod';
import { routes } from '@/app/routes';
import {
  formatCurrency,
  formatMatchDate,
  formatMatchTime,
  getMatchDisplayTitle,
} from '@/domain/matchDisplay';
import { needsSettlementAttention } from '@/features/matches/matchClosure';
import {
  getMatchById,
  isHistoryMatch,
} from '@/features/matches/matchQueries';
import { useProfile } from '@/features/profile/ProfileProvider';
import {
  buildMatchTimeline,
  hasMeaningfulTimeline,
} from '@/features/timeline/matchTimeline';
import { getMatchFinanceTotals } from '@/features/matches/paySummary';
import { getTravelCostEntries } from '@/features/matches/travelFinance';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useMatches } from '@/features/matches/useMatches';
import { applyTimelineTimeEdit } from '@/features/timeline/timelineEdits';
import { MatchMoneyClosure } from '@/ui/MatchMoneyClosure';
import { PageHeader } from '@/ui/PageHeader';
import { MatchTimeline } from '@/ui/MatchTimeline';
import { getFlightSegments, hasFlightSegmentData } from '@/features/matches/flightUtils';
import { openDirections } from '@/utils/maps';

export function MatchDetailPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { matches } = useMatches();
  const { updateMatch } = useMatchesContext();
  const match = matchId ? getMatchById(matches, matchId) : undefined;
  if (!match) {
    return (
      <div className="rs-stack">
        <PageHeader title="Match Detail" />
        <div className="rs-placeholder-card">
          <p>Match not found.</p>
        </div>
      </div>
    );
  }

  const title = getMatchDisplayTitle(match);
  const finance = getMatchFinanceTotals(match);
  const travelCosts = getTravelCostEntries(match);
  const timelineItems =
    !match.tournamentId && hasMeaningfulTimeline(match)
      ? buildMatchTimeline(match, profile)
      : [];

  return (
    <div className="rs-stack">
      <PageHeader title={title} />
      <div className="rs-detail-actions">
        <Button variant="secondary" onClick={() => openDirections(match.location)}>
          Directions
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(routes.matchEdit(match.id))}
        >
          Edit
        </Button>
      </div>

      <article className="rs-detail-card">
        <p className="rs-detail-card__primary">
          {formatMatchDate(match)} · {formatMatchTime(match)}
        </p>
        {match.home && match.away && (
          <p className="rs-detail-card__teams">
            {match.home} vs {match.away}
          </p>
        )}
        <p>{match.location}</p>
        <p>{match.position}</p>
        <p>{resolveMatchTypeLabel(match.matchType, match.customMatchType)}</p>
        {match.competition && <p>{match.competition}</p>}
        {match.status === 'cancelled' && (
          <p className="rs-detail-card__status rs-detail-card__status--cancelled">
            Cancelled
          </p>
        )}
        {match.status === 'completed' && (
          <p className="rs-detail-card__status">Completed</p>
        )}
      </article>

      {timelineItems.length > 0 && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Match-day timeline</h2>
          <div className="rs-detail-card">
            <MatchTimeline
              items={timelineItems}
              editable
              onEditItem={(itemId, newAt) => {
                const patch = applyTimelineTimeEdit(match, itemId, newAt);
                if (Object.keys(patch).length > 0) {
                  updateMatch(match.id, patch);
                }
              }}
            />
          </div>
        </section>
      )}

      {(match.expectedPay != null || match.payStatus !== 'not_tracked') && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Pay</h2>
          <div className="rs-detail-card">
            {match.expectedPay != null && (
              <p>Expected: {formatCurrency(match.expectedPay, match.payCurrency)}</p>
            )}
            <p>Status: {formatPayStatus(match.payStatus)}</p>
            {match.payStatus === 'unpaid' && match.payOwedBy && (
              <p>Owed by: {match.payOwedBy}</p>
            )}
            {match.paidAmount != null && (
              <p>Paid: {formatCurrency(match.paidAmount, match.payCurrency)}</p>
            )}
            {match.paidAt && (
              <p>Paid on: {match.paidAt.toLocaleString()}</p>
            )}
            {match.paymentMethod && (
              <p>
                Method:{' '}
                {formatPaymentMethodLabel(
                  match.paymentMethod,
                  match.paymentMethodDetail,
                )}
              </p>
            )}
          </div>
        </section>
      )}

      {match.flight && hasAny(match.flight) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Flight</h2>
          <div className="rs-detail-card">
            {getFlightSegments(match.flight)
              .filter(hasFlightSegmentData)
              .map((segment, index) => (
                <div key={segment.id} className="rs-detail-flight-segment">
                  <p className="rs-detail-flight-segment__title">
                    Segment {index + 1}
                  </p>
                  {(segment.airline || segment.flightNumber) && (
                    <p>
                      {[segment.airline, segment.flightNumber]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  )}
                  {(segment.departureAirport || segment.departureAt) && (
                    <p>Departs: {[segment.departureAirport, segment.departureAt?.toLocaleString()].filter(Boolean).join(' · ')}</p>
                  )}
                  {(segment.arrivalAirport || segment.arrivalAt) && (
                    <p>Arrives: {[segment.arrivalAirport, segment.arrivalAt?.toLocaleString()].filter(Boolean).join(' · ')}</p>
                  )}
                  {segment.confirmation && (
                    <p>Confirmation: {segment.confirmation}</p>
                  )}
                </div>
              ))}
            {match.flight.selfPaid && match.flight.amountPaid != null && (
              <p>
                Paid: ${match.flight.amountPaid}
                {match.flight.reimbursementStatus === 'reimbursed'
                  ? ' · reimbursed'
                  : ''}
              </p>
            )}
            {match.flight.notes && <p>{match.flight.notes}</p>}
          </div>
        </section>
      )}

      {match.lodging && hasAny(match.lodging) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Lodging</h2>
          <div className="rs-detail-card">
            {match.lodging.propertyName && <p>{match.lodging.propertyName}</p>}
            {match.lodging.address && <p>{match.lodging.address}</p>}
            {match.lodging.checkInDate && (
              <p>Check-in: {match.lodging.checkInDate}</p>
            )}
            {match.lodging.checkOutDate && (
              <p>Check-out: {match.lodging.checkOutDate}</p>
            )}
            {match.lodging.confirmation && (
              <p>Confirmation: {match.lodging.confirmation}</p>
            )}
            {match.lodging.notes && <p>{match.lodging.notes}</p>}
          </div>
        </section>
      )}

      {match.groundTravel && hasAny(match.groundTravel) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Ground travel</h2>
          <div className="rs-detail-card">
            {match.groundTravel.provider && <p>{match.groundTravel.provider}</p>}
            {match.groundTravel.pickupAt && (
              <p>Pickup: {match.groundTravel.pickupAt.toLocaleString()}</p>
            )}
            {match.groundTravel.returnAt && (
              <p>Return: {match.groundTravel.returnAt.toLocaleString()}</p>
            )}
            {match.groundTravel.confirmation && (
              <p>Confirmation: {match.groundTravel.confirmation}</p>
            )}
            {match.groundTravel.notes && <p>{match.groundTravel.notes}</p>}
          </div>
        </section>
      )}

      {(travelCosts.length > 0 ||
        (match.expenses && match.expenses.length > 0)) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Expenses</h2>
          <div className="rs-detail-card">
            {travelCosts.length > 0 && (
              <ul className="rs-detail-list rs-detail-list--expenses">
                {travelCosts.map((entry) => (
                  <li key={entry.source}>
                    {entry.label}: {formatCurrency(entry.amount)}
                    {entry.reimbursementStatus === 'reimbursed'
                      ? ' · reimbursed'
                      : ''}
                    {' · from travel'}
                  </li>
                ))}
              </ul>
            )}
            {match.expenses && match.expenses.length > 0 && (
              <ul className="rs-detail-list rs-detail-list--expenses">
                {match.expenses.map((expense) => (
                  <li key={expense.id}>
                    <strong>{formatExpenseCategory(expense.category)}</strong>: {expense.miles != null ? `${expense.miles} miles` : formatCurrency(expense.amount)}
                    {expense.reimbursementStatus === 'reimbursed'
                      ? ' · reimbursed'
                      : ''}
                    {expense.note && <div>{expense.note}</div>}
                  </li>
                ))}
              </ul>
            )}
            <p className="rs-detail-card__total">
              Total costs: {formatCurrency(finance.combinedExpenseTotal)} · Out
              of pocket: {formatCurrency(finance.outOfPocketTotal)}
            </p>
          </div>
        </section>
      )}

      {(match.contacts?.length ||
        match.uniform ||
        match.parking ||
        match.notes ||
        (match.customFields && match.customFields.length > 0)) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Additional info</h2>
          <div className="rs-detail-card">
            {match.contacts?.map((contact) => (
              <div key={contact.id} className="rs-contact-detail">
                {contact.name && <p><strong>{contact.name}</strong></p>}
                {contact.phone && <p>Phone: {contact.phone}</p>}
                {contact.email && <p>Email: {contact.email}</p>}
                {contact.team && <p>Team: {contact.team}</p>}
              </div>
            ))}
            {match.uniform && <p>Uniform: {match.uniform}</p>}
            {match.parking && <p>Parking: {match.parking}</p>}
            {match.notes && <p>{match.notes}</p>}
            {match.customFields?.map((field) => (
              <p key={field.id}>
                {field.label}: {field.value}
              </p>
            ))}
          </div>
        </section>
      )}

      {match.source.type === 'matchreadytx' && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Source</h2>
          <div className="rs-detail-card">
            <p>Imported from MatchReadyTX</p>
          </div>
        </section>
      )}

      {match.tournamentId && (
        <p className="rs-detail-meta">
          Part of a{' '}
          <Link to={routes.tournamentDetail(match.tournamentId)}>tournament</Link>
        </p>
      )}

      {isHistoryMatch(match) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Settlement</h2>
          <div className="rs-detail-card">
            <MatchMoneyClosure
              match={match}
              defaultExpanded={needsSettlementAttention(match)}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function formatPayStatus(status: string): string {
  if (status === 'not_tracked') return 'Not tracked';
  if (status === 'unpaid') return 'Unpaid';
  if (status === 'donated') return 'Donated / free';
  return 'Paid';
}

function hasAny(value: object): boolean {
  return Object.values(value).some((entry) => {
    if (entry instanceof Date) return true;
    return Boolean(entry);
  });
}
