import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import type { BackNav } from '@/nav/backNav';
import { SCHEDULE_BACK } from '@/nav/backDefaults';
import {
  buildScheduleListItems,
  type ScheduleListItem,
} from '@/features/schedule/scheduleListItems';
import { MatchCard } from '@/ui/MatchCard';
import { TournamentAgendaGroup } from '@/ui/TournamentAgendaGroup';

type Props = {
  matches: Match[];
  getTournamentById: (tournamentId: string) => Tournament | undefined;
  allowTimelineExpand?: boolean;
  tournamentDefaultExpanded?: boolean;
  back?: BackNav;
};

function renderItem(
  item: ScheduleListItem,
  getTournamentById: (tournamentId: string) => Tournament | undefined,
  allowTimelineExpand: boolean,
  tournamentDefaultExpanded: boolean,
  back: BackNav,
) {
  if (item.type === 'match') {
    return (
      <MatchCard
        key={item.match.id}
        match={item.match}
        allowTimelineExpand={allowTimelineExpand}
        back={back}
      />
    );
  }

  const tournament = getTournamentById(item.tournamentId);

  if (!tournament) {
    return item.matches.map((match) => (
      <MatchCard
        key={match.id}
        match={match}
        allowTimelineExpand={allowTimelineExpand}
        back={back}
      />
    ));
  }

  return (
    <TournamentAgendaGroup
      key={item.tournamentId}
      tournament={tournament}
      matches={item.matches}
      defaultExpanded={tournamentDefaultExpanded}
      allowTimelineExpand={allowTimelineExpand}
      back={back}
    />
  );
}

export function ScheduleItemList({
  matches,
  getTournamentById,
  allowTimelineExpand = false,
  tournamentDefaultExpanded = false,
  back = SCHEDULE_BACK,
}: Props) {
  const items = buildScheduleListItems(matches);

  return (
    <ul className="rs-list">
      {items.flatMap((item) =>
        renderItem(
          item,
          getTournamentById,
          allowTimelineExpand,
          tournamentDefaultExpanded,
          back,
        ),
      )}
    </ul>
  );
}
