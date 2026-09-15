import type { MatchFormValues } from '@/features/matches/matchValidation';
import type { Match, CustomItineraryItem, Expense, FlightInfo, GroundTravelInfo, LodgingInfo } from '@/domain/match';

export type TournamentPayScope = 'tournament' | 'per_match';

export type Tournament = {
  id: string;
  ownerUid: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  notes?: string;
  /** Default `tournament`: one fee for the event. `per_match`: each game tracks pay. */
  payScope?: TournamentPayScope;
  settlement?: Partial<Match>;
  matchDefaults?: Partial<MatchFormValues>;
  expenses?: Expense[];
  customItinerary?: CustomItineraryItem[];
  flight?: FlightInfo;
  lodging?: LodgingInfo;
  groundTravel?: GroundTravelInfo;
  createdAt: Date;
  updatedAt: Date;
};
