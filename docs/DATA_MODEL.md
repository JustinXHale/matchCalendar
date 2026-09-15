# Match Calendar — Data Model

**Status:** Draft v0.1  
**Schema source of truth for MVP**

Use these names unless the product requirements change. Avoid creating parallel fields with slightly different names.

---

## 1. Firestore shape

```text
users/{uid}/matchCalendar/settings

users/{uid}/matches/{matchId}

users/{uid}/tournaments/{tournamentId}
```

MVP keeps user-owned data under the user document to make ownership and rules simple.

Match Calendar shares the **MatchReadyTX Firebase project**. Root `users/{uid}` is owned by MatchReadyTX (profile, roles, onboarding). Calendar does not write that document.

Expenses and custom fields are embedded in a match initially; split them into subcollections only if document size or query needs justify it.

---

## 2. User identity and Calendar settings

**Identity** (display name, email, photo) comes from **Firebase Auth** and may already exist on MatchReadyTX `users/{uid}`. Calendar does not run MatchReady onboarding.

**Calendar-only prefs** live at `users/{uid}/matchCalendar/settings`:

```ts
type CalendarSettings = {
  defaultPositionPreset: PositionPreset;
  pitchArrivalMinutesBeforeKickoff: number;
  airportArrivalMinutesBeforeFlight: number;
  migratedFromLocalAt?: string; // ISO — one-time localStorage import marker
};
```

Auth providers are Google and Apple.

Do not copy MatchReadyTX's role/membership model into this app.

---

## 3. Match

`users/{uid}/matches/{matchId}`

```ts
type MatchStatus = 'upcoming' | 'completed' | 'cancelled';

type PayStatus = 'not_tracked' | 'unpaid' | 'paid' | 'donated';

type MatchTypePreset = 'xvs' | '10s' | '7s' | 'tournament' | 'other';

type MatchSourceType = 'manual' | 'matchreadytx';

type Match = {
  id: string;
  ownerUid: string;

  // Core scheduling
  kickoffAt: Timestamp;
  timezone?: string;

  title?: string;
  home?: string;
  away?: string;

  location: string;

  // Rugby-first classification. Preset + custom preserves useful analytics
  // without blocking other roles/formats.
  position: string;
  positionPreset?: string;       // e.g. referee, assistant_referee, tmo_cmo, fourth_official, other
  customPosition?: string;       // used when preset is other
  matchType: MatchTypePreset;
  customMatchType?: string;      // used when matchType is other
  competition?: string;

  status: MatchStatus;

  // Money
  expectedPay?: number;
  payCurrency?: string;      // default UI may use USD
  payStatus: PayStatus;
  paidAmount?: number;
  paidAt?: Timestamp;
  paymentMethod?: 'cash' | 'electronic' | 'other';

  // Optional information
  contacts?: MatchContact[];
  uniform?: string;
  parking?: string;
  notes?: string;

  customFields?: CustomField[];

  flight?: FlightInfo;
  lodging?: LodgingInfo;
  groundTravel?: GroundTravelInfo;

  expenses?: Expense[];

  // Optional tournament relation
  tournamentId?: string;

  // Import/source
  source: SourceInfo;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Validation

Required:

- `ownerUid`
- `kickoffAt`
- `location`
- `position`
- `matchType`
- at least one of `title`, `home`, `away`
- `status`
- `source`

Money values are stored as numbers in major currency units for MVP because this is display/tracking rather than payment processing. If exact financial arithmetic becomes important later, migrate to integer minor units deliberately rather than mixing representations.

---

## 4. Source info

```ts
type SourceInfo =
  | {
      type: 'manual';
    }
  | {
      type: 'matchreadytx';
      externalId: string;
      importedAt: Timestamp;
      lastSyncedAt?: Timestamp;
    };
```

`externalId` + source type is the identity used for import upsert/deduplication.

Do not overwrite user-owned optional fields during import refresh.

---

## 5. Custom fields

```ts
type MatchContact = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  team?: string;
  order?: number;
};

type CustomField = {
  id: string;
  label: string;
  value: string;
  order?: number;
};
```

MVP custom fields are text only.

Avoid dynamic Firestore keys for user-created labels. Use an array of objects so labels can contain spaces and be safely renamed.

---

## 6. Expense

```ts
type ExpenseCategory =
  | 'gas'
  | 'lodging'
  | 'food'
  | 'rental_car'
  | 'rideshare'
  | 'parking'
  | 'tolls'
  | 'airfare'
  | 'other';

type ReimbursementStatus = 'not_expected' | 'pending' | 'reimbursed';

type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  occurredAt?: Timestamp;

  reimbursementStatus: ReimbursementStatus;
  reimbursedAmount?: number;
  reimbursedAt?: Timestamp;

  // Reserved for a future receipt attachment feature. Do not require
  // Firebase Storage in the current build solely for this field.
  receiptAttachmentId?: string;

  createdAt: Timestamp;
};
```

Expenses are match-scoped in MVP.

---

## 7. Flight

```ts
type FlightInfo = {
  airline?: string;
  flightNumber?: string;
  departureAt?: Timestamp;
  arrivalAt?: Timestamp;
  confirmation?: string;
  notes?: string;
};
```

No live flight tracking or paid flight API dependency. Flight entry is manual for now. Future lookup/enrichment may populate these same domain fields without changing the user's manual workflow.

---

## 8. Lodging

```ts
type LodgingInfo = {
  propertyName?: string;
  address?: string;
  checkInDate?: string;   // YYYY-MM-DD
  checkOutDate?: string;  // YYYY-MM-DD
  confirmation?: string;
  notes?: string;
};
```

Date-only strings are intentional for hotel check-in/out to avoid timezone shifts.

---

## 9. Ground travel

```ts
type GroundTravelInfo = {
  provider?: string;
  confirmation?: string;
  notes?: string;
};
```

This can cover rental car or similar travel without introducing a complex transportation model.

---

## 10. Tournament

`users/{uid}/tournaments/{tournamentId}`

```ts
type TournamentPayScope = 'tournament' | 'per_match';

type Tournament = {
  id: string;
  ownerUid: string;

  title: string;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD

  location?: string;
  notes?: string;

  // Default `tournament`: one expected fee on the parent (Money tab).
  // `per_match`: each child match tracks pay; parent default pre-fills new games.
  payScope?: TournamentPayScope;

  // Defaults applied when creating child matches (position, game format, pay, etc.).
  // Does not cascade to existing children when the parent is edited.
  matchDefaults?: Partial<MatchFormValues>;

  // Lump-pay settlement state when payScope is `tournament` (expected pay, pay status, etc.).
  settlement?: Partial<Match>;

  expenses?: Expense[];
  customItinerary?: CustomItineraryItem[];

  flight?: FlightInfo;
  lodging?: LodgingInfo;
  groundTravel?: GroundTravelInfo;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

Child matches reference `tournamentId`.

Do not store an authoritative array of child match IDs on Tournament in MVP; query matches by `tournamentId` to avoid dual-write drift.

**Pay scope rules**

- `tournament` (default): parent appears on Money; child matches do not carry expected pay.
- `per_match`: parent does not appear on Money; each child match tracks pay. `matchDefaults.expectedPay` pre-fills new child forms only.

**Timeline**

- Travel and shared itinerary live on the tournament parent.
- Child matches do not show a match-day timeline; the parent tournament card/group does.

---

## 11. Generated agenda / timeline

The match-day timeline is primarily a **derived view**, not a second copy of travel data.

Generated timeline items can be calculated from `kickoffAt`, `flight`, `lodging`, ground travel, and future profile timing preferences. A generated flight departure item, for example, should reference the flight data rather than persisting a duplicate departure time.

Persist only information that cannot be reconstructed, such as user-created custom itinerary items or explicit per-match overrides. Those types may be introduced when the timeline phase is implemented. Do not invent a large timeline schema before the interaction model requires it.

A match has a meaningful timeline only when there is at least one surrounding itinerary item beyond the kickoff itself. A plain local match therefore remains a normal match card.

---

## 12. Derived values

Do not persist these unless a future query requirement demands it.

### Display title

```ts
function getMatchDisplayTitle(match: Match): string {
  if (match.title?.trim()) return match.title.trim();

  const home = match.home?.trim();
  const away = match.away?.trim();

  if (home && away) return `${home} vs ${away}`;
  if (home) return home;
  if (away) return away;

  return 'Match';
}
```

If UI wants to show both a custom title and teams, render teams as secondary metadata.

### Total expenses

```ts
sum(match.expenses?.map(x => x.amount) ?? [])
```

### Net

Choose the earnings figure based on the context:

- expected net = expected pay - expenses
- realized net = paid amount - expenses

Do not silently label one as the other.

---

## 13. Suggested indexes

Start with only indexes required by actual queries.

Likely queries:

```text
matches:
  kickoffAt ASC
  kickoffAt DESC
  tournamentId + kickoffAt ASC
```

Because matches live under each user, owner filtering is implicit.

Do not pre-create many compound indexes without query evidence.

---

## 14. Security-rule intent

Conceptual rules:

```text
users/{uid}/matchCalendar/{docId}
  read/write only when request.auth.uid == uid

users/{uid}/matches/{matchId}
  read/write only when request.auth.uid == uid

users/{uid}/tournaments/{tournamentId}
  read/write only when request.auth.uid == uid
```

Deploy rules from the MatchReadyTX project (shared backend).

Server-side import code may use Admin SDK after authenticating/authorizing the caller.

Never trust a client-supplied `ownerUid` to grant access.

---

## 15. Migration discipline

When schema changes:

1. update this file first
2. update TypeScript domain types
3. add migration/backfill only if existing data requires it
4. do not maintain two names indefinitely
5. update fixtures/tests

Cursor should not invent compatibility aliases unless explicitly requested.
