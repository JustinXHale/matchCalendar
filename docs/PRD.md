# Match Calendar — Product Requirements Document (MVP)

**Status:** Draft v0.1  
**Product name:** Match Calendar  
**Platform:** Progressive Web App (PWA)  
**Primary audience:** Rugby referees first; designed so the model can expand to other officials later  
**Owner / builder:** Rabbit Hole Apps  

---

## 1. Product summary

**Match Calendar** is a personal schedule and information hub for referees and other sports officials.

The product solves a simple but persistent problem: match assignments, travel details, hotel information, pay, contacts, and notes often live across multiple systems. A referee may receive assignments through Google Sheets, MatchFacts, MatchReadyTX, Rugby Xplorer, Arbiter, email, or other platforms, then manually re-create the useful parts inside Google Calendar.

Match Calendar gives the official one place to store the information they need to work an event.

This is **not** an assigning platform, league management tool, or crew workflow system. It is the official's personal calendar and record.

### One-line intent

> **Know what's next, keep everything together, and know what you earned.**

---

## 2. Product principles

1. **Personal first.** The app is built first for the individual referee, not for assigners, teams, leagues, or administrators.
2. **Fast entry matters more than automation.** Most external scheduling systems do not provide public APIs, so manual entry must be quick and painless.
3. **Every assignment stands alone.** A normal match does not require a trip, event, or tournament parent.
4. **Agenda before calendar.** The default view should answer “What is next?” instead of reproducing a traditional month grid.
5. **Optional detail, minimal required fields.** A referee should be able to add a match in seconds and add travel, expenses, contacts, or notes only when needed.
6. **Offline-friendly by default.** Core assignment data should still be available at a venue, airport, hotel, or field with poor connectivity.
7. **Free-first architecture.** The product should remain inexpensive enough to operate without requiring a subscription from users.
8. **Rugby-first, extensible later.** Home/Away and referee position are useful now; the data model should not prevent future expansion to other sports.
9. **No duplicate platform workflow.** Match Calendar does not replace MatchReadyTX or other assigning systems; it consolidates the user's information from them.

---

## 3. Target user

### Primary persona

A rugby referee who receives matches from several systems and currently copies those assignments into Google Calendar to keep track of upcoming work.

Typical sources may include:

- Google Sheets
- MatchFacts
- MatchReadyTX
- Rugby Xplorer
- Arbiter Sports
- Email
- Other league / assigner systems

The referee may also need to keep track of:

- Date and kickoff time
- Venue / address
- Home and away teams
- Referee position
- Match fee
- Flight information
- Hotel information
- Rental car / ground travel
- Contacts
- Parking or arrival notes
- Expenses
- Whether expected pay has been received

---

## 4. Core object model

### 4.1 Match / Event

The primary object is a **Match** (internally it may be modeled as an `event` or `assignment`, but the product should use “Match” where rugby-first language is appropriate).

A match is always standalone.

#### Required fields for the minimum create flow

- Date
- Time
- Location
- Position
- Match type
- At least one identifying field:
  - Event title, or
  - Home team, or
  - Away team

#### Optional structured fields

- Event title
- Home team
- Away team
- Match type (`XVs`, `10s`, `7s`, `Tournament`, `Other` + custom value)
- Position (rugby presets + `Other` + custom value)
- Match fee / expected pay
- Source
- Notes
- Contact / assigner
- Uniform
- Parking
- Competition
- Custom fields
- Flight details
- Hotel / lodging details
- Rental car / ground transportation
- Expenses
- Pay status
- Match status

### 4.2 Display title rules

The user may provide a custom event title.

If no custom title exists, the app should generate a display title from the Home and Away values.

Examples:

- `Dallas RFC vs Austin Blacks`
- `National Championship — Dallas RFC vs Austin Blacks`
- `District Swim Meet`

Home and Away should **not** be required because some future use cases may not have two teams.

---

## 5. Match lifecycle

Keep lifecycle deliberately simple.

### Status values

- `upcoming`
- `completed`
- `cancelled`

A match becomes historical when completed or when its kickoff time is in the past.

The app should avoid introducing a complicated assignment workflow or confirmation state machine.

---

## 6. Navigation and information architecture

### Primary bottom navigation

Recommended MVP tabs:

1. **Agenda**
2. **Calendar**
3. **History**
4. **Profile / Settings**

A floating or persistent **+ Add** action should be available from the main authenticated experience.

### Add menu

When the user taps **+ Add**:

- **Quick Match**
- **Full Match**
- **Tournament** *(may be included in the initial shell but can ship after the basic match flow if needed)*

---

## 7. Agenda — home screen

The default signed-in screen is an **agenda**, not a month calendar.

### Primary question

> What do I have next?

### 7.1 Next Match hero

The top of the page should prominently show the user's next upcoming match.

Recommended content hierarchy:

- Date
- Time
- Event title or Home vs Away
- Location
- Position
- Pay, if entered
- Source indicator, if useful

Primary actions:

- Open details
- Open location in Maps
- Edit

### 7.2 Upcoming list

Below Next Match, show upcoming matches grouped by time period:

- Today
- Tomorrow
- This Week
- Later

Alternative grouping by actual date may be used when it improves scanability.

### 7.3 Empty state

When no matches exist:

> No matches yet. Add your first assignment and keep everything in one place.

Primary CTA: **Add Match**

### 7.4 Generated match-day agenda / timeline

The agenda can become richer when an assignment contains meaningful surrounding events. The user should enter facts once; Match Calendar derives the useful chronological view.

Timeline sources may include:

- Match kickoff
- Flight departure / arrival
- Lodging check-in / checkout
- Rental car or ground-travel pickup / return
- User-created custom itinerary items
- Derived personal timing preferences, such as arriving at the pitch a configured amount of time before kickoff

Generated items should not be duplicated as manually maintained copies of the underlying flight, lodging, or match data. If a source time changes, the generated timeline should reflect it.

A standard local match with no meaningful surrounding itinerary should remain a simple match card. Do not create an empty or ceremonial timeline just for consistency. A card should expose/expand a timeline only when there is meaningful timeline content to show.

---

## 8. Calendar view

The calendar is secondary to Agenda.

### MVP behavior

- Month view
- Dates with matches are visually marked
- Selecting a date shows matches on that date
- Selecting a match opens Match Detail

The calendar should not attempt to replace a full personal calendar with meetings, birthdays, and unrelated events.

---

## 9. Quick Match flow

Quick Match should feel approximately as easy as creating an event in a native calendar.

### Fields

- Date
- Time
- Event title
- Home
- Away
- Location
- Position
- Pay *(optional)*

At least one of Event title / Home / Away must identify the match.

### Behavior

- Single mobile sheet or compact page
- Smart defaults for date/time when practical
- Save in as few interactions as possible
- After save, return to Agenda and surface the new match if it is next

### Out of scope for Quick Match

Do not put these directly in the default compact flow:

- Hotel
- Flight
- Expenses
- Contacts
- Uniform
- Parking
- Custom fields

These belong in Full Match / Match Detail.

---

## 10. Full Match form

Full Match exposes the complete information model.

Recommended sections:

### Match

- Date
- Time
- Event title
- Home
- Away
- Position
- Competition
- Status
- Source

### Location

- Venue name
- Address
- Maps action

### Pay

- Expected match fee
- Pay status
  - Expected
  - Paid
  - Unpaid / Outstanding
- Actual amount received *(optional; later if unnecessary for MVP)*

### Travel

- Flight enabled / disabled
- Airline
- Flight number
- Departure date/time
- Arrival date/time
- Confirmation number
- Notes

### Lodging

- Lodging enabled / disabled
- Hotel name
- Address
- Check-in
- Check-out
- Confirmation number
- Notes

### Ground travel

- Rental car company
- Confirmation number
- Parking
- Mileage / fuel note

### Contacts

Default structured options:

- Assigner / Contact
- Name
- Phone
- Email

### Additional information

Suggested defaults:

- Uniform
- Parking
- Gate / entrance
- Competition
- Notes

### Custom fields

Users may add simple label/value fields.

Examples:

- `Locker room` → `West tunnel`
- `Kit color` → `Blue`
- `Per diem` → `$50`

MVP custom field type can be plain text only.

---

## 11. Tournament model

A **Tournament** is optional and should not complicate normal matches.

Use a tournament when multiple matches share common travel or event information.

### Tournament fields

- Tournament title
- Start date
- End date
- Primary location
- Hotel
- Flight
- Ground travel
- Contacts
- Notes
- Expenses

### Tournament matches

A tournament contains multiple child matches.

Each child match may include:

- Date
- Time
- Home
- Away
- Event title
- Position
- Field / venue override
- Pay

### Rules

- Normal matches never require a tournament.
- Tournament-level travel information is shared by child matches.
- Child match information may override relevant tournament defaults.
- Tournament can be deferred to a post-core phase if it slows the first usable release.

---

## 12. Match detail

Match Detail should become the referee's single source of truth for that assignment.

Recommended content order:

1. Date and time
2. Title / teams
3. Location with Maps action
4. Position
5. Pay status
6. Travel / lodging when present
7. Contacts
8. Additional information / custom fields
9. Expenses
10. Source

Primary actions:

- Edit
- Mark completed
- Mark cancelled
- Open Maps
- Add expense
- Mark paid

---

## 13. Earnings and expenses

The finance feature is for **simple personal accounting**, not bookkeeping or payment processing.

### 13.1 Earnings

Each match can have:

- Expected pay
- Pay status: not tracked, unpaid, paid, or donated/free
- Paid date/time (`paidAt`) when payment is received
- Actual amount received
- Optional payment method (cash, electronic, other)

`donated` is not the same as `unpaid`: donated means the official intentionally expects no compensation; unpaid means compensation is expected but has not been received.

### 13.2 Expenses and reimbursements

A match can contain zero or more expense items. An expense records what the official spent; reimbursement is tracked separately so the original cost is never erased.

Each expense item may include:

- Category
- Amount
- Note *(optional)*
- Date *(optional; defaults to match date)*
- Whether reimbursement is expected
- Reimbursement status
- Amount reimbursed, when relevant
- Reimbursed date/time (`reimbursedAt`)

Default categories:

- Hotel
- Flight
- Rental car
- Uber / rideshare
- Gas
- Food
- Parking
- Tolls
- Other

Example: a $120 rental car that is later fully reimbursed remains a $120 expense plus a $120 reimbursement. This allows the app to show both total officiating spend and true out-of-pocket cost.

Receipt images are a future attachment feature, not an MVP Storage requirement.

### 13.3 Summary calculations

For completed matches, the app may show:

- Total earned
- Total expenses
- Net

Example:

- Earned: `$425`
- Expenses: `$238`
- Net: `$187`

Later, the finance/history area may summarize these by month, year, source, competition, match type, or position. Personal insights should be possible from the schema, including average fee, average fee by position/type, average days to payment, unpaid balances, reimbursement delay, donated assignments, expenses, reimbursements, and true out-of-pocket cost. Cross-user/company analytics are not part of the current product scope.

---

## 14. History

History contains completed and cancelled matches.

### MVP capabilities

- Reverse chronological list
- Search
- Filter by date range
- Filter by paid / unpaid
- View match detail

### Useful summary

At minimum, surface:

- Matches worked
- Expected earnings
- Paid amount / unpaid amount where available
- Expenses
- Net

Detailed charts and tax reporting are later features, not MVP requirements.

### 14.1 After Match flow

Completing a match should be a deliberate lightweight workflow rather than only flipping a status bit. It should be able to capture:

- Was the match cancelled?
- If cancelled, is payment still expected?
- Is this assignment donated/free?
- Has expected payment been received?
- Actual amount received and `paidAt` when marked paid
- Optional payment method
- Any expenses that still need to be entered
- Whether reimbursable expenses have been reimbursed, including `reimbursedAt`

The flow should progressively disclose only relevant questions. A simple local paid match should remain quick to complete.

---

## 15. Source tracking

Every match may optionally store a source.

Initial source values:

- Manual
- MatchReadyTX
- Google Sheet
- MatchFacts
- Rugby Xplorer
- Arbiter
- Other

The source exists for organization and future integration; it does not need to drive behavior for manually created matches.

---

## 16. MatchReadyTX integration

MatchReadyTX is the one source where Match Calendar may have a real API integration because both products are controlled by the same builder.

### Direction

**One-way only:** MatchReadyTX → Match Calendar

### Imported fields may include

- MatchReadyTX match ID
- Date
- Time
- Home
- Away
- Location
- Position / crew role
- Fee
- Competition
- Relevant notes

### Sync rules

- Store a stable external source ID.
- Re-importing the same MatchReadyTX assignment should update source-owned match facts rather than create a duplicate.
- Personal Match Calendar data must never be overwritten by an import.

User-owned fields include:

- Expenses
- Hotel
- Flight
- Pay status
- Personal notes
- Custom fields

No data needs to flow back into MatchReadyTX.

---

## 17. Calendar export / native calendar integration

Native calendar integration is desirable but not required for the first usable release.

Potential later capability:

- Add a Match Calendar event to Google Calendar / Apple Calendar
- Include match title, time, venue, and selected details

This may also provide native device reminders without depending on PWA push notifications.

Do not make native calendar integration a dependency of the core product.

---

## 18. Notifications

PWA notifications are not required for MVP.

Reasons:

- Browser / OS support differs
- Background permissions create friction
- iOS behavior depends heavily on installation state

The core product should remain valuable without push notifications.

Potential later options:

- Native calendar reminders via exported calendar events
- PWA notifications for installed users
- Local reminders where platform support is dependable

---

## 19. Authentication

Use Firebase Authentication.

Supported sign-in methods:

- Google
- Apple

No password-based account flow is required for MVP.

---

## 20. Offline behavior

Offline availability is an MVP requirement.

### Must work offline

- Open app shell after prior load
- View previously synced assignments
- View Match Detail
- View stored travel / hotel / contacts / notes

### Strongly preferred

- Create or edit a match offline and sync later
- Add expenses offline and sync later

Use Firestore persistence and PWA asset caching where practical rather than creating a custom synchronization engine unless needed.

---

## 21. Technical foundation

Use the same general frontend foundation as MatchReadyTX so code and design knowledge can be reused.

### Stack

- Vite
- React 19
- TypeScript
- React Router v7
- PatternFly React v6
- Firebase Auth
- Cloud Firestore
- Firebase Functions only where needed
- `vite-plugin-pwa`

### Styling

Reuse the MatchReadyTX visual system as the starting point:

- Custom `--rs-*` design tokens
- PatternFly theme overrides
- Monochrome palette
- Border-driven surfaces instead of heavy shadows
- Red reserved primarily for urgency / destructive states
- Mobile-first spacing
- Minimum comfortable touch targets

Match Calendar should feel visually related to MatchReadyTX while being less dense and more personal-calendar oriented.

---

## 22. Proposed Firestore shape

Keep the first schema intentionally small.

```text
users/{uid}
  displayName
  email
  photoUrl?
  createdAt
  updatedAt
  preferences {
    currency?
    timezone?
    defaultPosition?
  }

users/{uid}/matches/{matchId}
  type: 'match' | 'tournamentMatch'
  tournamentId?

  eventTitle?
  homeTeam?
  awayTeam?
  displayTitle

  startAt
  timezone

  venueName?
  venueAddress

  position
  competition?

  status: 'upcoming' | 'completed' | 'cancelled'

  expectedPay?
  payStatus: 'expected' | 'paid' | 'unpaid'
  paidAt?

  source {
    type
    externalId?
    externalUrl?
  }

  travel?
  lodging?
  groundTravel?

  contact?
  notes?
  customFields[]

  createdAt
  updatedAt

users/{uid}/matches/{matchId}/expenses/{expenseId}
  category
  amount
  note?
  date?
  createdAt
  updatedAt

users/{uid}/tournaments/{tournamentId}
  title
  startDate
  endDate
  venueName?
  venueAddress?
  travel?
  lodging?
  groundTravel?
  contact?
  notes?
  createdAt
  updatedAt
```

### Notes

- A user owns their own match data.
- Tournament matches can reference `tournamentId` but remain queryable as normal matches.
- Avoid excessive nesting where it would create expensive multi-read home screens.
- Summary fields may be denormalized later if Firestore read cost becomes meaningful.

---

## 23. Security model

MVP rules are straightforward because data is personal.

- Authentication required for user data.
- A user can only read and write their own matches, tournaments, expenses, and profile data.
- MatchReadyTX import endpoints must verify the authenticated user and source relationship.
- No public match sharing in MVP.

---

## 24. MVP screens

### Required

1. Sign in
2. Agenda
3. Quick Match
4. Full Match / Edit Match
5. Match Detail
6. Calendar
7. History
8. Profile / Settings

### Strong candidate

9. Tournament create/edit
10. Tournament detail

### Later

- Earnings dashboard
- Calendar export/sync
- MatchReadyTX import UI
- Screenshot / AI parsing
- Shareable profile
- Shareable itinerary
- PWA push notifications

---

## 25. MVP scope

### Include

- Google / Apple sign-in
- Personal match CRUD
- Quick Match
- Full Match
- Agenda home
- Calendar view
- Match detail
- Match status
- Pay amount + paid/unpaid tracking
- Expense line items
- History
- Custom text fields
- Offline-readable PWA
- Installable PWA
- Mobile-first MatchReadyTX-inspired visual system

### Optional if schedule allows

- Tournament container
- MatchReadyTX one-way import
- Native calendar export

### Explicitly not required for first release

- AI screenshot parsing
- Public APIs for third-party platforms
- Scraping third-party sites
- Push notifications
- Sharing
- Social features
- Assigner workflows
- Team workflows
- Crew confirmations
- Payments
- Bank integrations
- Tax filing
- Complex accounting

---

## 26. Recommended build order

### Phase 0 — Shell

- Vite / React / TypeScript
- PatternFly
- design tokens
- Firebase config
- Google / Apple auth
- PWA manifest + service worker
- bottom navigation

### Phase 1 — Core match loop

- Firestore schema
- Quick Match
- Full Match
- Agenda
- Match Detail
- Edit / delete / cancel / complete

At the end of Phase 1, the app should already replace the user's current “yellow events in Google Calendar” workflow for basic scheduling.

### Phase 2 — Calendar + History

- Month calendar
- History
- Pay status
- Basic financial summaries

### Phase 3 — Travel + expenses

- Flight
- Hotel
- Ground travel
- Expense line items
- Net calculation
- Custom fields

### Phase 4 — Tournament

- Tournament container
- Shared travel details
- Child matches

### Phase 5 — MatchReadyTX import

- Read-only API endpoint from MatchReadyTX
- Source IDs
- Dedupe / update logic
- Preserve user-owned fields

### Phase 6 — Convenience integrations

- Calendar export
- Reminders / notifications where appropriate
- Additional source integrations only when practical

---

## 27. Success criteria

The MVP succeeds if the primary user can stop using color-coded Google Calendar events as the main place where officiating details are manually consolidated.

Specific signals:

- A new match can be entered quickly enough that it does not feel heavier than creating a calendar event.
- The next assignment and its location are obvious immediately after opening the app.
- Important travel and lodging information can be found without searching email or another app.
- Pay and expenses can be reviewed after a match.
- The app remains useful without third-party APIs.
- Previously loaded assignment information is available when connectivity is poor.
- Hosting / backend usage remains low enough to support a free-first product strategy.

---

## 28. Product decisions already locked

- Working name: **Match Calendar**
- Rugby-first product
- Home and Away remain in the model but are optional
- Event title is supported and can override / supplement the generated team title
- Every normal assignment is standalone
- No arrival/report time
- Agenda is the default home
- Traditional form + Quick Match are the primary manual entry methods
- No CSV requirement for normal users
- Screenshot / AI parsing is not MVP
- Contacts / uniform / parking / similar fields are optional
- Custom user-defined fields are desirable
- Pay tracking distinguishes expected/unpaid, paid, not tracked, and intentionally donated/free assignments
- Payment completion stores `paidAt` so payment delay can be measured later
- Expenses are simple personal accounting and may also track expected/received reimbursement
- Reimbursement completion stores `reimbursedAt` so reimbursement delay can be measured later
- Travel may include flights, hotel, rental car, gas, food, parking, tolls
- Flight information is manual for now; flight API lookup is backlog only and must not create a paid dependency
- Receipt images are backlog only; expense records should remain attachment-compatible without requiring Storage now
- A meaningful match-day agenda/timeline is generated from entered match/travel information rather than entered twice
- Basic local matches do not need an empty timeline experience
- Calendar export may come later
- Push notifications are not an MVP dependency
- Offline access is important
- MatchReadyTX integration is one-way only
- The new product is separate from MatchReadyTX
- Firebase + Google / Apple sign-in remain the preferred foundation

---

## 29. Remaining decisions for design / implementation

These do not block initial wireframing:

- Final brand name vs “Match Calendar” working name
- Exact bottom-nav labels and icon choices
- Whether Tournament ships in v1 or immediately after the core match loop
- Whether users can change currency / timezone in v1
- Whether expected pay should support tax withholding notes later
- Exact final label for the finance area (`Expenses`, `Insights`, or another name)
- Exact preset rugby position list beyond the initial design set
- Whether completed matches auto-transition based on time or require explicit completion
- Whether custom fields are reordered by drag/drop
- How much MatchReadyTX styling is reused directly vs lightly adapted

---

## 30. UX direction

The app should feel faster and calmer than MatchReadyTX.

MatchReadyTX is an operational scheduling product with dense workflows. Match Calendar is a personal utility. Reuse the same visual DNA, but favor:

- Larger spacing
- Fewer simultaneous badges
- One primary action per screen
- Strong date / time hierarchy
- Compact but readable cards
- Progressive disclosure for optional detail
- Bottom-sheet style quick entry on mobile
- Minimal setup before first match can be added

The app should feel like **a referee's field notebook crossed with a personal agenda**, not an enterprise scheduling system.
