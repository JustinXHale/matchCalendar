import { useState } from 'react';
import { Button } from '@patternfly/react-core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isManualMatch } from '@/domain/recordDelete';
import { routes } from '@/app/routes';
import { backState } from '@/nav/backNav';
import { SCHEDULE_BACK, tournamentBack } from '@/nav/backDefaults';
import { DetailBackButton } from '@/ui/DetailBackButton';
import { formatCurrency } from '@/domain/matchDisplay';
import { useMatches } from '@/features/matches/useMatches';
import { useProfile } from '@/features/profile/ProfileProvider';
import { tournamentTimelineMatch } from '@/features/tournaments/tournamentEvent';
import { isTournamentLumpPay } from '@/features/tournaments/tournamentFormUtils';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import {
  buildMatchTimeline,
  hasMeaningfulTimeline,
} from '@/features/timeline/matchTimeline';
import { MatchCard } from '@/ui/MatchCard';
import { MatchTimeline } from '@/ui/MatchTimeline';
import { PageHeader } from '@/ui/PageHeader';
import { DangerConfirmModal } from '@/ui/DangerConfirmModal';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useAppToast } from '@/ui/AppToastProvider';
import { openDirections } from '@/utils/maps';

export function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { pushInfo } = useAppToast();
  const { getTournamentById, deleteTournament } = useTournamentsContext();
  const { deleteMatch } = useMatchesContext();
  const { matches } = useMatches();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const tournament = tournamentId ? getTournamentById(tournamentId) : undefined;

  if (!tournament) {
    return (
      <div className="rs-stack">
        <DetailBackButton fallback={SCHEDULE_BACK} />
        <PageHeader title="Tournament" />
        <div className="rs-placeholder-card">
          <p>Tournament not found.</p>
        </div>
      </div>
    );
  }

  const selfBack = tournamentBack(tournament.id);

  const childMatches = matches
    .filter((match) => match.tournamentId === tournament.id)
    .sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime());

  const defaultPay = tournament.matchDefaults?.expectedPay;
  const timelineMatch = tournamentTimelineMatch(tournament);
  const timelineItems = hasMeaningfulTimeline(timelineMatch)
    ? buildMatchTimeline(timelineMatch, profile)
    : [];
  const deletableChildCount = childMatches.filter(isManualMatch).length;
  const skippedMrChildren = childMatches.length - deletableChildCount;

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      for (const match of childMatches) {
        if (!isManualMatch(match)) continue;
        const ok = await deleteMatch(match.id);
        if (!ok) return;
      }
      const ok = await deleteTournament(tournament.id);
      if (!ok) return;
      pushInfo('Tournament deleted.');
      navigate(routes.schedule, { replace: true });
    } finally {
      setDeleteBusy(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="rs-stack">
      <DetailBackButton fallback={SCHEDULE_BACK} />
      <PageHeader title={tournament.title} />
      <p className="rs-tournament-detail-label">
        <span className="rs-pill">Tournament</span>
      </p>
      <div className="rs-detail-actions">
        {tournament.location && (
          <Button
            variant="secondary"
            onClick={() => openDirections(tournament.location!)}
          >
            Directions
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() =>
            navigate(routes.tournamentEdit(tournament.id), {
              state: backState(selfBack),
            })
          }
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>

      <DangerConfirmModal
        title="Delete tournament?"
        description={
          deletableChildCount > 0
            ? `This permanently removes the tournament and ${deletableChildCount} manual match${
                deletableChildCount === 1 ? '' : 'es'
              } in it.${
                skippedMrChildren > 0
                  ? ` ${skippedMrChildren} MatchReady import${
                      skippedMrChildren === 1 ? '' : 's'
                    } will stay on your schedule.`
                  : ''
              }`
            : 'This permanently removes the tournament from your calendar.'
        }
        confirmLabel="Delete tournament"
        isOpen={deleteOpen}
        isBusy={deleteBusy}
        onClose={() => {
          if (!deleteBusy) setDeleteOpen(false);
        }}
        onConfirm={() => void confirmDelete()}
      />

      <article className="rs-detail-card">
        <p className="rs-detail-card__primary">
          {tournament.startDate} — {tournament.endDate}
        </p>
        {tournament.location && <p>{tournament.location}</p>}
        {tournament.matchDefaults?.competition && (
          <p>{tournament.matchDefaults.competition}</p>
        )}
        {defaultPay && (
          <p>
            {isTournamentLumpPay(tournament)
              ? `Tournament pay: ${formatCurrency(Number(defaultPay))}`
              : `Default pay: ${formatCurrency(Number(defaultPay))} per game`}
          </p>
        )}
        <p>
          Pay structure:{' '}
          {isTournamentLumpPay(tournament)
            ? 'One fee for the tournament'
            : 'Paid per match'}
        </p>
        {tournament.notes && <p>{tournament.notes}</p>}
      </article>

      {timelineItems.length > 0 && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Event timeline</h2>
          <div className="rs-detail-card">
            <MatchTimeline items={timelineItems} />
          </div>
        </section>
      )}

      {(tournament.flight || tournament.lodging || tournament.groundTravel) && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Travel</h2>
          <div className="rs-detail-card">
            {tournament.flight?.segments?.map((segment, index) => (
              <p key={segment.id}>
                Flight {index + 1}:{' '}
                {[segment.airline, segment.flightNumber].filter(Boolean).join(' ')}
              </p>
            ))}
            {tournament.lodging?.propertyName && (
              <p>Lodging: {tournament.lodging.propertyName}</p>
            )}
            {tournament.groundTravel?.provider && (
              <p>Ground: {tournament.groundTravel.provider}</p>
            )}
          </div>
        </section>
      )}

      {(tournament.customItinerary?.length ?? 0) > 0 && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Itinerary</h2>
          <div className="rs-detail-card">
            {tournament.customItinerary?.map((item) => (
              <p key={item.id}>
                {item.label}
                {item.notes ? ` — ${item.notes}` : ''}
              </p>
            ))}
          </div>
        </section>
      )}

      {(tournament.expenses?.length ?? 0) > 0 && (
        <section className="rs-detail-section">
          <h2 className="rs-section-label">Expenses</h2>
          <div className="rs-detail-card">
            {tournament.expenses?.map((expense) => (
              <p key={expense.id}>
                {formatCurrency(expense.amount)}
                {expense.note ? ` — ${expense.note}` : ''}
              </p>
            ))}
          </div>
        </section>
      )}

      <section aria-label="Tournament matches">
        <h2 className="rs-section-label">Matches</h2>
        {childMatches.length === 0 ? (
          <div className="rs-placeholder-card">
            <p>No matches in this tournament yet.</p>
          </div>
        ) : (
          <ul className="rs-list">
            {childMatches.map((match) => (
              <MatchCard key={match.id} match={match} back={selfBack} />
            ))}
          </ul>
        )}
        <div className="rs-form-actions">
          <Button
            variant="primary"
            isBlock
            onClick={() =>
              navigate(routes.fullMatch, {
                state: {
                  tournamentId: tournament.id,
                  ...backState(selfBack),
                },
              })
            }
          >
            Add individual match
          </Button>
        </div>
        <p className="rs-detail-meta">
          <Link to={routes.tournaments} state={backState(selfBack)}>
            All tournaments
          </Link>
        </p>
      </section>
    </div>
  );
}
