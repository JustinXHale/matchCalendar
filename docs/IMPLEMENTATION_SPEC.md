# Match Calendar — Implementation Specification

**Status:** Draft v0.1  
**Product source of truth:** `docs/PRD.md`  
**Schema source of truth:** `docs/DATA_MODEL.md`  
**Visual source of truth:** `docs/DESIGN_SYSTEM.md`  
**Build sequencing:** `docs/BUILD_PLAN.md`

If documents conflict, product behavior follows the PRD. Firestore field names and types follow the Data Model.

---

## 1. Stack

| Layer | Choice |
|---|---|
| App | Vite + React 19 + TypeScript |
| Routing | React Router v7 |
| UI | PatternFly React v6 (`@patternfly/react-core`) |
| Styling | Custom CSS + semantic `--rs-*` design tokens |
| Auth | Firebase Auth |
| Sign-in | Google + Apple only |
| Data | Cloud Firestore |
| Backend | Firebase Functions only when needed |
| PWA | `vite-plugin-pwa` |
| Hosting | Firebase Hosting |
| Offline | Cached app shell + Firestore persistent local cache |

Do **not** introduce Next.js, Tailwind, Redux, a SQL database, or another backend without an explicit product decision.

---

## 2. Product boundary

Match Calendar is the official's **personal schedule and record**.

It is not:

- an assigning platform
- a team confirmation workflow
- a crew-management system
- a payment processor
- a shared league calendar
- a replacement for MatchReadyTX

External sources may populate a user's Match Calendar, but Match Calendar owns the user's personal notes, travel data, expenses, pay status, and custom fields.

---

## 3. App shell

### Authenticated routes

```text
/
  -> /agenda

/agenda
/calendar
/history
/matches/new
/matches/new/quick
/matches/:matchId
/matches/:matchId/edit

/tournaments/new
/tournaments/:tournamentId
/tournaments/:tournamentId/edit

/profile
/settings
```

A tournament route may exist in the shell before the full Tournament feature ships, but unfinished controls must not appear functional.

### Bottom navigation

1. Schedule (Agenda + Calendar toggle on one screen; `/agenda` and `/calendar` redirect here)
2. Money (unpaid/settlement focus; `/history` may redirect here)
3. Insights
4. About

Profile is reached from the masthead avatar (`/profile`), not the bottom nav.

Use a persistent mobile bottom nav. A primary `+` Add action is available from the main authenticated experience.

---

## 4. Match creation

### Quick Match

Goal: save a useful match in seconds.

Fields:

- date
- time
- event title
- home
- away
- location
- position preset + Other/custom
- match type preset + Other/custom
- expected pay (optional)

Validation:

- date required
- time required
- location required
- position required
- match type required
- at least one of `title`, `home`, or `away` required

Do not include hotel, flight, expenses, long notes, contacts, or custom fields in the default Quick Match surface.

### Full Match

Full Match exposes all supported fields grouped into progressive sections:

1. Match
2. Details
3. Pay
4. Travel
5. Expenses
6. Additional information

Do not require users to fill optional sections.

---

## 5. Derived display title

`displayTitle` is presentation logic, not user-owned source data.

Rules:

1. If custom `title` is present:
   - if Home/Away are also present, UI may show title as primary and teams as secondary
   - otherwise show title
2. If no custom title:
   - Home + Away -> `Home vs Away`
   - Home only -> Home
   - Away only -> Away
3. If legacy/imported data violates validation, fall back to `Match`

Do not persist a generated display title unless an import requires a snapshot. Prefer deriving it in application code.

---

## 6. Match lifecycle

Supported status values:

```ts
type MatchStatus = 'upcoming' | 'completed' | 'cancelled';
```

Guidance:

- Newly created future matches default to `upcoming`.
- Do not automatically mutate a record to `completed` solely because time passed unless a defined migration/job is added later.
- UI may display a past `upcoming` match inside History.
- User can explicitly mark a match completed or cancelled.
- Cancelled matches remain in the user's record.

Avoid additional workflow states in MVP.

---

## 7. Agenda behavior

Agenda is the default post-login route.

### Next Match

Query the user's non-cancelled future matches, ordered by kickoff datetime ascending. The first record is the hero.

The hero should prioritize:

- date
- time
- title / teams
- location
- position
- expected pay, when present

Actions:

- open match
- open location/maps
- edit

### Upcoming list

Show remaining future matches in chronological order, grouped for scanning.

Preferred labels:

- Today
- Tomorrow
- This Week
- Later

If grouping logic becomes complicated around locale/timezone boundaries, use date headings instead of inventing backend logic.

---

## 8. Calendar behavior

Calendar is a schedule browsing surface, not a general-purpose personal calendar.

MVP:

- month view
- visually mark days that contain matches
- tap date -> list matches for date
- tap match -> Match Detail

Do not sync unrelated Google/Apple calendar events into this view.

Native calendar export is a later integration unless explicitly pulled into scope.

---

## 9. History and finance

History includes past matches, completed matches, and cancelled matches where useful.

Each match may have:

- expected pay
- pay status
- paid amount
- expenses

Supported pay statuses:

```ts
type PayStatus = 'not_tracked' | 'unpaid' | 'paid' | 'donated';
```

`donated` means intentionally uncompensated and must not be conflated with `unpaid`. When payment is received, persist `paidAt` so future personal insights can calculate payment delay.

Do not process money.

Derived totals may include:

- expected earnings
- paid earnings
- total expenses
- net = earnings - expenses

Financial summaries are informational only.

---

## 10. Expenses

Expenses belong to one match in MVP.

Supported default categories:

- gas
- lodging
- food
- rental_car
- rideshare
- parking
- tolls
- airfare
- other

Users may add a short note.

Do not build receipt OCR, bank sync, reimbursement approval, tax filing, or accounting exports in MVP.

---

## 11. Additional information and custom fields

Built-in optional fields may include:

- contact / assigner
- uniform
- parking
- competition
- notes

Custom fields are simple label/value pairs.

MVP custom-field constraints:

- text label
- text value
- match-scoped
- user-controlled order optional
- no formulas
- no nested objects
- no custom field types beyond text in MVP

---

## 11.1 After Match and reimbursements

Completion is a progressive workflow that can capture cancellation/payment expectation, donated status, payment receipt, `paidAt`, and relevant expense/reimbursement updates. Keep the common path short.

Expenses preserve the original amount spent. Reimbursement is separate state (`not_expected`, `pending`, `reimbursed`) with optional reimbursed amount and `reimbursedAt`. Never mutate a reimbursed expense down to zero.

Receipt image upload is intentionally deferred. The model may reserve attachment identity, but the current expense phase must not introduce Firebase Storage solely for receipts.

---

## 12. Travel and lodging

Travel information is attached directly to a standalone match in MVP.

Supported optional groups:

### Flight
- airline
- flight number
- departure datetime
- arrival datetime
- confirmation
- notes

### Lodging
- property name
- address
- check-in date
- check-out date
- confirmation
- notes

### Ground travel
- rental car provider
- confirmation
- notes

Do not create a separate Trip model in MVP.

Tournament may provide shared travel/lodging to its child matches later.

---

## 12.1 Generated agenda / timeline

Timeline presentation is derived from existing match/travel facts. It is not a parallel itinerary database. Only show/expand it when there is meaningful content beyond the match itself. Future custom items and per-match timing overrides may be persisted when required.

Flight lookup APIs are backlog only. Production behavior must remain fully functional with manual flight entry and no paid aviation service.

---

## 13. Tournament model

Tournament is optional and should not complicate normal match entry.

Concept:

- tournament is a container
- tournament can hold shared date range, venue, travel, hotel, and notes
- tournament contains child matches
- child matches remain valid Match records

A match may optionally store `tournamentId`.

Do not require every match to belong to a tournament.

---

## 14. MatchReadyTX integration

Direction: **MatchReadyTX -> Match Calendar only**.

### Ownership boundary

Imported source-owned fields may include:

- date/time
- home
- away
- location
- position
- fee when available
- source metadata

Match Calendar user-owned fields must never be overwritten by an import:

- personal notes
- expenses
- pay status
- travel/lodging entered by user
- custom fields

Every imported match should store source metadata sufficient for idempotent upsert.

Example:

```ts
source: {
  type: 'matchreadytx',
  externalId: '...',
  importedAt: Timestamp,
  lastSyncedAt: Timestamp
}
```

No write-back to MatchReadyTX.

### Callable contract (v1)

Implemented in the **MatchReadyTX** repo as `syncMatchReadyAssignments` (Firebase Callable).

**Request:** `{ force?: boolean }` — optional; server rate limit still applies.

**Response:**

```ts
{
  syncedAt: string; // ISO
  assignments: Array<{
    externalId: string; // "{orgId}:{matchId}"
    orgId: string;
    matchId: string;
    kickoffAt: string;
    timezone?: string;
    home?: string;
    away?: string;
    title?: string;
    location: string;
    position: string;
    positionPreset: PositionPreset;
    matchType: MatchTypePreset;
    competition?: string;
    expectedPay?: number;
    payCurrency?: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    matchReadyStatus: string;
    matchReadyUrl?: string;
  }>;
}
```

**Server behavior:** authenticated user only; discovers org memberships; returns **confirmed** crew/CMO assignments (including past/completed). Does not write Calendar Firestore docs.

**Client behavior (Match Calendar):** merge by `source.type === 'matchreadytx'` + `source.externalId`; upsert source-owned fields only; auto-sync on sign-in (15-minute client throttle) plus manual refresh on Profile.

**Deploy order:** deploy MatchReadyTX function first (`firebase deploy --only functions:syncMatchReadyAssignments`), then ship Calendar client.

### Callable contract — platform operator insights

Implemented in the **MatchReadyTX** repo as `getMatchCalendarPlatformInsights` (Firebase Callable).

**Request:** `{}` — no fields.

**Response:**

```ts
{
  generatedAt: string; // ISO
  memberCount: number;
  members: Array<{
    uid: string;
    displayName: string;
    email: string | null;
    authCreatedAt: string | null;
    calendarSeenAt: string | null;
    matchCount: number;
    tournamentCount: number;
  }>;
  insights: InsightsSummary; // same shape as client getInsightsSummary()
}
```

**Server behavior:** authenticated caller only; caller uid/email must appear in function env `MATCH_CALENDAR_PLATFORM_ADMIN_UIDS` or `MATCH_CALENDAR_PLATFORM_ADMIN_EMAILS` (comma-separated). Lists Firebase Auth users with Match Calendar activity (`matchCalendar/settings`, matches, or tournaments), aggregates insights across those users. Travel rollups include `drivenTrips`, `flightSegments`, manual mileage expenses, and derived flight miles from segment airport codes (`matchCalendarFlightDistance.ts` + bundled `airportRegistry.json` — keep in sync with Match Calendar via `npm run build:airports` in Calendar, then copy to MatchReadyTX `functions/src/`).

**Client behavior:** Profile shows **Profile | Members | Insights** tabs only when `VITE_PLATFORM_ADMIN_UIDS` or `VITE_PLATFORM_ADMIN_EMAILS` matches the signed-in user. Members tab lists signups; Insights tab shows platform rollup using the same cards as personal Insights.

**Deploy order:** from the **MatchReadyTX** repo (sibling to Match Calendar, not inside it):

```bash
cd ../MatchReadyTX
# Edit functions/.env.matchreadytx — set MATCH_CALENDAR_PLATFORM_ADMIN_UIDS and/or EMAILS
cd functions && npm run build && cd ..
firebase deploy --only functions:getMatchCalendarPlatformInsights --project matchreadytx
```

Then set Calendar `VITE_PLATFORM_ADMIN_*` (`.env.local` + GitHub Actions secrets) and redeploy hosting.

---

## 15. Auth

Use Firebase Auth against the **shared MatchReadyTX Firebase project** (Calendar is a second registered web app).

Allowed providers:

- Google
- Apple

No email/password flow in MVP unless explicitly added later.

Calendar does **not** create or patch MatchReadyTX `users/{uid}` profile fields. Identity (name, email, photo) comes from Firebase Auth. Calendar-only preferences are stored at `users/{uid}/matchCalendar/settings`.

Unauthenticated users see `/login` when Firebase is configured. Public legal routes `/privacy` and `/terms` are reachable without auth (login footer links; canonical copies on `rabbitholeapps.com/apps/match-calendar/`). **Try demo** on the login screen enters the app without auth (no Firestore writes). Signed-in or demo users can also use **View demo** / **Exit demo** in the masthead at any time. Demo mode shows a status banner and in-memory sample matches/tournaments; it does not write to Firestore. Demo controls are intentionally available in production (not hidden by environment). Profile does not host demo toggles or “load sample data” actions — masthead and login only. Without Firebase env vars, the app keeps local-only `localStorage` behavior for development.

---

## 16. Firestore access strategy

All user-owned records must include `ownerUid`.

Security intent:

- authenticated user reads/writes their own records
- no cross-user browsing in MVP
- MatchReadyTX import endpoints write only for the authenticated/authorized owner
- server-managed source metadata should not allow a client to impersonate another user

Prefer direct client Firestore CRUD for ordinary personal records. Use Functions only where server authority or secret credentials are required.

---

## 17. Offline behavior

Offline access is a first-class requirement.

MVP:

- PWA shell precached
- Firestore persistent local cache enabled
- previously loaded Agenda / Match Detail data remains readable offline
- create/edit operations may queue locally and sync when Firestore reconnects
- UI should not block basic editing solely because network is unavailable

Avoid building a custom sync engine unless Firebase behavior proves insufficient.

Do not promise that external imports work while offline.

### User-visible errors

Firestore subscription and background write failures should map to readable messages (`firestoreErrors`) and surface through a global toast stack (`AppToastProvider`) above the bottom nav. Inline form saves keep field data on screen and may show field-level or local error text; do not navigate away on failure.

---

## 18. Time and date handling

Store a canonical kickoff timestamp plus the user's intended timezone when needed.

MVP defaults:

- use the device/user timezone for manually created matches
- render dates/times in the user's local timezone
- imported records should preserve their source timezone if supplied

Do not hard-code America/Chicago from MatchReadyTX into Match Calendar.

---

## 19. Maps

Location should support a simple maps action.

MVP may open the device/browser's map provider using the stored location string.

Do not add paid geocoding or Directions APIs unless needed later.

---

## 20. PWA

Requirements:

- installable manifest (`id`, `scope`, maskable icons, light `theme_color`)
- app icons
- service worker via `vite-plugin-pwa`
- cached shell
- responsive mobile-first layout
- standalone display mode
- graceful browser use when not installed
- optional install prompt card on Login and About when `beforeinstallprompt` is available (iOS: manual Add to Home Screen copy)

PWA push notifications are out of MVP.

Native calendar notifications are a possible later path through calendar export/sync.

---

## 21. Performance / cost guidance

Free-first architecture:

- query only the current user's records
- paginate or limit History when it grows
- avoid listeners where a one-time query is enough
- avoid server jobs for derived values that can be computed client-side
- do not store duplicate generated display data without a reason
- use Functions only for integrations or trusted operations

---

## 22. Explicitly out of MVP

- assigning officials
- crew confirmation
- team workflows
- messaging
- social/profile sharing
- payment processing
- tax/accounting services
- bank connections
- receipt OCR
- AI screenshot parsing
- PWA push notifications
- two-way MatchReadyTX sync
- integrations with sites that do not expose APIs
- CSV as a required workflow
- complex custom-field types
- shared trips
