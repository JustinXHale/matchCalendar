# Match Calendar — UI Specification

**Status:** Draft v0.1  
**Product source:** `PRD.md`  
**Visual source:** `DESIGN_SYSTEM.md`  
**Sketch interaction reference:** `UX_CONCEPTS_FROM_SKETCHES.md`

This file defines what the MVP screens should contain and how they should behave. It is intentionally more concrete than the PRD so implementation sessions do not repeatedly invent screen structure.

---

## 1. Global mobile shell

### Header

Keep the masthead simple.

Recommended:

- Match Calendar wordmark / Rabbit Hole branding
- theme toggle
- **View demo** / **Exit demo** toggle (sample data preview; available in production)
- profile avatar link to `/profile`
- page title where useful on inner screens
- contextual action only when needed

When demo mode is active, show a short status banner below the masthead so sample data is never mistaken for live Firestore data.

Do not crowd the header with filters, role switchers, org controls, or MatchReadyTX administration concepts.

### Bottom navigation

Four destinations (center slot is the `+` Add action):

| Tab | Purpose |
|---|---|
| Schedule | Agenda + month calendar (toggle on one screen) |
| Money | Pay status, settlement, and finance closure |
| Insights | Personal stats derived from your matches |
| About | Product overview; PWA install help when supported |

Profile and account settings live at `/profile` via the masthead avatar, not the bottom nav.

### Add action

A persistent primary `+` action should be easy to reach with one hand.

Tap opens:

- Quick Match
- Full Match
- Tournament

If Tournament is not implemented yet, omit it rather than presenting a dead option.

---

## 2. Agenda

### Page goal

Answer, immediately:

> What am I doing next?

### A. Next Match hero

Show only when at least one upcoming non-cancelled match exists.

Information order:

1. date / relative day
2. kickoff time
3. title OR Home vs Away
4. location
5. position
6. expected pay, if provided
7. source badge, only when it adds value

Actions:

- if the match has a meaningful generated timeline, tap may expand/reveal that timeline inline
- if there is no meaningful timeline, do not create an empty expansion state; use the normal detail/edit affordance
- Maps / directions action
- overflow or Edit / Full Details action

Avoid filling the hero with hotel, flight, expenses, contacts, or notes. Those belong on detail.

### B. Upcoming

List the rest chronologically.

Each row/card:

- date marker
- time
- title/teams
- location
- position
- optional pay
- cancelled status if relevant

Preferred grouping:

- Today
- Tomorrow
- This Week
- Later

For dense weeks, actual date headings are acceptable.

### Empty state

Copy direction:

**No matches yet**  
Add your first match and keep the important details in one place.

Primary CTA: `Add Match`

---

## 3. Quick Match

### Goal

Fast enough that manually copying an assignment does not feel worse than making a Google Calendar event.

Use one compact page or mobile bottom sheet.

### Field order

1. Date
2. Time
3. Event title
4. Home
5. Away
6. Location
7. Position preset (`Other` reveals custom text)
8. Match type preset (`XVs`, `10s`, `7s`, `Tournament`, `Other`; `Other` reveals custom text)
9. Pay (optional)

At least one of Event title / Home / Away is required.

### Footer actions

Primary: `Save Match`  
Secondary: `More details`

`More details` should preserve entered values and transition into Full Match.

### Interaction guidance

- Use native-friendly date/time controls when practical.
- Do not force a second confirmation after Save.
- On successful create, navigate to Agenda.
- If the new record is now the next match, it should naturally appear in the hero.
- Validation should be inline and short.

---

## 4. Full Match / Edit Match

Use sections. Avoid one giant undifferentiated form.

### Section: Match

- Date
- Time
- Event title
- Home
- Away
- Location
- Position preset + Other/custom
- Match type preset + Other/custom
- Competition

### Section: Pay

- Expected pay
- Pay status (not tracked / unpaid / paid / donated)
- Paid amount when relevant
- Paid date/time when marked paid
- Payment method when useful

### Section: Travel

Collapsed by default unless data exists.

Subsections:

- Flight
- Lodging
- Ground travel

### Section: Expenses

Show existing expense rows and `Add expense`.

### Section: Additional information

Defaults:

- Contact / assigner
- Uniform
- Parking
- Notes

Then:

`+ Add custom field`

### Save behavior

- sticky or easy-to-reach Save on mobile
- no autosave requirement in MVP
- warn before leaving only when there are unsaved changes

---

## 5. Match Detail

Match Detail is the single source for everything the user needs once an assignment is saved.

### Top summary

- date
- time
- title
- Home vs Away when present
- location
- position
- status

Primary utility actions:

- Directions
- Edit

### Information sections

Render only sections that contain data.

Recommended order:

1. Match details
2. Pay
3. Travel
4. Lodging
5. Expenses
6. Additional info
7. Source

Do not show empty rows such as `Flight: none`.

### Status actions

For upcoming:

- Complete / After Match
- Cancel match

`Complete / After Match` opens a short progressive flow for cancellation/payment/donation/expenses/reimbursements rather than only toggling status.

For completed:

- show Completed
- allow Edit
- allow reopening only if product behavior is deliberately added later

For cancelled:

- clearly identify Cancelled
- retain record/history

---

## 6. Generated match-day timeline

The timeline is conditional progressive disclosure. It should appear only when an assignment has meaningful surrounding itinerary data such as flights, lodging, ground transportation, or custom itinerary items.

Order items chronologically and derive them from the underlying match/travel records. Do not require the user to enter the same flight, hotel, or kickoff time again as a timeline item.

Examples of useful items:

- flight departure / arrival
- rental pickup / return
- hotel check-in / checkout
- derived arrival-at-pitch time
- match kickoff
- custom item such as crew dinner or credential pickup

Future profile timing defaults may generate personal items (for example, arrive at pitch 60 minutes before kickoff). A per-match override should eventually be possible without changing the global preference.

A standard local match with only kickoff/location/position/pay does **not** need a timeline.

---

## 7. Calendar

### Month view

- current month header
- previous/next controls
- today affordance
- marker on dates with matches

### Selected day

Below calendar, show matches for selected date.

Match row:

- time
- title/teams
- location
- position

Tap -> Match Detail.

Do not display personal meetings or outside calendar events.

---

## 8. History

### Goal

Let the user answer:

- What did I work?
- What should I have earned?
- What has been paid?
- What did it cost me?

### Summary block

For selected period, optionally show:

- Matches
- Expected
- Paid
- Expenses
- Net

Avoid financial charts in the first release unless the list is already solid.

### List

Reverse chronological.

Each item:

- date
- title/teams
- position
- expected pay
- pay state
- expenses when present

### Filters

MVP can begin with:

- All
- Unpaid
- Paid
- Cancelled

Add richer date filters only when needed.

---

## 9. Expense entry

Use a compact modal/sheet.

Fields:

- category
- amount
- note (optional)
- reimbursement expected?
- reimbursement status / amount / date when relevant

Default categories:

- Gas
- Lodging
- Food
- Rental car
- Uber / rideshare
- Parking
- Tolls
- Airfare
- Other

Primary CTA: `Add Expense`

---

## 10. Tournament

Tournament is a container for a multi-match event.

### Tournament create

Use **Full details** (`+` → Full details). Set **Match type** to **Tournament**; a **Game format** column appears on the same row (Position | Match type | Game format).

Field order (top to bottom):

- event title
- location
- position | match type (Tournament) | game format (XVs / 10s / 7s / Other)
- start date | end date
- competition
- pay structure | expected pay (same row)
- pay status
- who owes pay | uniform (same row)
- notes
- shared travel cards (flight, lodging, ground, itinerary, expenses)

`/tournaments/new` redirects into this flow. There is no separate “Tournament” item in the add menu.

### Tournament edit

Tournament detail → **Edit** opens the same **Full details** form as create (`FullMatchPage` at `/tournaments/:id/edit`). Child matches are edited separately (lean form).

### Pay structure

- **One fee for the tournament** (default): track pay on the parent; Money tab shows the tournament; child games do not expect per-game pay.
- **Paid per match**: default expected pay pre-fills new child games; each game tracks pay on Money.

### Tournament detail

Top:

- title
- date range
- location

Then:

- shared travel/lodging
- matches inside tournament
- `Add Match`

Child matches use the ordinary Match UI and may inherit/present shared context without duplicating it.

Tournament is secondary to standalone matches; do not reorganize the whole product around it.

---

## 11. Profile

Reached from the masthead avatar (`/profile`), not bottom navigation.

MVP:

- name
- email
- preferred/default position (optional)
- timing defaults (pitch arrival, airport arrival)
- appearance preference if supported
- sign out
- delete Match Calendar data / delete account (with confirmation)

Demo preview is entered from **Try demo** on login or **View demo** in the masthead — not from Profile.

Account identity comes from Google or Apple sign-in.

Avoid collecting address, birthday, kit size, referee certification, or MatchReadyTX role data unless Match Calendar itself needs it.

---

## 12. Source badges

Possible source values:

- Manual
- MatchReadyTX

Do not make source a major visual element.

Use a subtle badge or metadata row, mainly to help the user understand imported records.

---

## 13. Error and empty-state behavior

### Offline

Do not throw the user into a blocking error page if cached data exists.

Use a subtle state such as:

`Offline — changes will sync when you're connected.`

### Save failure

Keep entered data on screen and provide retry. Background Firestore/provider failures should surface as a dismissible toast (not a blocking page) when the user did not initiate an inline save action.

### No calendar items

Use the same primary Add Match CTA as Agenda.

### No history

Copy direction:

`Completed matches will show up here.`

---

## 14. Accessibility

- minimum ~48px touch targets
- visible focus states
- labels are not placeholders
- status is never communicated by color alone
- sufficient contrast in light and dark themes
- icon-only controls require accessible names
- forms expose validation text programmatically

PatternFly behavior should be used rather than replaced when it already solves accessibility.

---

## 15. Responsive behavior

Design mobile-first.

At larger widths:

- constrain content to a readable centered max width
- allow Agenda cards to use more horizontal space
- do not turn the app into a desktop dashboard with unnecessary sidebars
- forms can use two columns selectively, but preserve logical reading order

The mobile experience is the product priority.
