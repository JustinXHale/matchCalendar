export type MatchStatus = 'upcoming' | 'completed' | 'cancelled';

export type PayStatus = 'not_tracked' | 'unpaid' | 'paid' | 'donated';

export type PaymentMethod = 'cash' | 'electronic' | 'other';

export type MatchTypePreset = 'xvs' | '10s' | '7s' | 'tournament' | 'other';

export type PositionPreset =
  | 'referee'
  | 'assistant_referee'
  | 'tmo_cmo'
  | 'fourth_official'
  | 'other';

export type ExpenseCategory =
  | 'miles_driven'
  | 'miles_flown'
  | 'gas'
  | 'lodging'
  | 'food'
  | 'rental_car'
  | 'rideshare'
  | 'parking'
  | 'tolls'
  | 'airfare'
  | 'other';

export type ReimbursementStatus = 'not_expected' | 'pending' | 'reimbursed';

export type MatchContact = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  team?: string;
  order?: number;
};

export type CustomField = {
  id: string;
  label: string;
  value: string;
  order?: number;
};

export type CustomItineraryItem = {
  id: string;
  label: string;
  at: Date;
  notes?: string;
  order?: number;
};

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  miles?: number;
  note?: string;
  occurredAt?: Date;
  reimbursementStatus: ReimbursementStatus;
  reimbursedAmount?: number;
  reimbursedAt?: Date;
  receiptAttachmentId?: string;
  createdAt: Date;
};

export type TravelSelfPaidInfo = {
  selfPaid?: boolean;
  amountPaid?: number;
  reimbursementStatus?: ReimbursementStatus;
  reimbursedAmount?: number;
  reimbursedAt?: Date;
};

export type FlightSegment = {
  id: string;
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureAt?: Date;
  arrivalAt?: Date;
  confirmation?: string;
};

export type FlightInfo = TravelSelfPaidInfo & {
  segments?: FlightSegment[];
  notes?: string;
};

export type LodgingInfo = TravelSelfPaidInfo & {
  propertyName?: string;
  address?: string;
  checkInDate?: string;
  checkOutDate?: string;
  confirmation?: string;
  notes?: string;
};

export type GroundTravelInfo = TravelSelfPaidInfo & {
  provider?: string;
  pickupAt?: Date;
  returnAt?: Date;
  confirmation?: string;
  notes?: string;
};

export type SourceInfo =
  | {
      type: 'manual';
    }
  | {
      type: 'matchreadytx';
      externalId: string;
      importedAt: Date;
      lastSyncedAt?: Date;
    };

export type Match = {
  id: string;
  ownerUid: string;
  kickoffAt: Date;
  timezone?: string;
  title?: string;
  home?: string;
  away?: string;
  location: string;
  position: string;
  positionPreset?: PositionPreset;
  customPosition?: string;
  matchType: MatchTypePreset;
  customMatchType?: string;
  competition?: string;
  status: MatchStatus;
  expectedPay?: number;
  payCurrency?: string;
  payStatus: PayStatus;
  paidAmount?: number;
  paidAt?: Date;
  paymentMethod?: PaymentMethod;
  /** PayPal, venmo, custom text, etc. when method is electronic or other. */
  paymentMethodDetail?: string;
  payOwedBy?: string;
  /** User closed settlement; hides from needs-attention until reopened. */
  settlementClosed?: boolean;
  contacts?: MatchContact[];
  uniform?: string;
  parking?: string;
  notes?: string;
  customFields?: CustomField[];
  customItinerary?: CustomItineraryItem[];
  pitchArrivalOverrideMinutes?: number;
  airportArrivalOverrideMinutes?: number;
  flight?: FlightInfo;
  lodging?: LodgingInfo;
  groundTravel?: GroundTravelInfo;
  expenses?: Expense[];
  tournamentId?: string;
  source: SourceInfo;
  createdAt: Date;
  updatedAt: Date;
};
