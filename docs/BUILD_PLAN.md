# Match Calendar — Build Plan

**Status:** Draft v0.3 (sketch reconciliation + local-only track)  
**Purpose:** Give Cursor small, bounded implementation phases.

Rule: implement one phase at a time. Do not pre-build later phases unless a small foundational dependency is required.

**Vision gaps:** Tracked in [`VISION_BACKLOG.md`](./VISION_BACKLOG.md) (sketch → shipped). Phases 0–7 are largely complete on the local track; backlog items refine financial closure, timeline defaults, and navigation before auth/import.

---

## Cloud track (current development mode)

Match Calendar uses the **shared MatchReadyTX Firebase project** (second web app registration). Same Google/Apple accounts work across both apps.

| Decision | Choice |
|----------|--------|
| Firebase project | MatchReadyTX (shared) — separate web `appId` for Calendar |
| Data storage | Firestore `users/{uid}/matches` + `tournaments` when signed in; `localStorage` fallback when Firebase is not configured |
| Calendar prefs | `users/{uid}/matchCalendar/settings` — not root `users/{uid}` |
| User identity | Firebase Auth; no MatchReady onboarding in Calendar |
| Demo mode | **Try demo** on `/login` or **View demo** in the masthead — preview without auth or Firestore writes; available in production (not env-gated) |
| Deferred | MatchReadyTX import (Phase 10) |
| Tournament rules | Parent defaults apply at child **create** time only; per-game pay override on child; parent edits do not cascade to existing children |
| Tournament pay | `payScope`: `tournament` (default, lump fee on parent) or `per_match` (pay tracked per child) |
| Tournament UI | **Create** and **edit** via Full details (`FullMatchPage`; Match type → Tournament on create). `/tournaments/new` redirects to Full details; `/tournaments/:id/edit` reuses the same page. |
| Timeline | Parent tournament only; child matches have no timeline tab |

Firestore field names and types in `DATA_MODEL.md` still apply to the TypeScript domain layer.

---

## Phase 0 — Repository + shell

### Build

- Vite + React 19 + TypeScript
- React Router v7
- PatternFly React v6
- Firebase client setup
- `vite-plugin-pwa`
- global design tokens
- light/dark theme structure
- authenticated shell
- bottom nav placeholders
- Add action shell

### Done when

- app runs locally
- routes render
- mobile shell is usable
- PWA manifest/service worker builds
- no Tailwind/Next.js
- no feature-specific Firestore schema beyond User setup

---

## Phase 1 — Authentication + Firestore

### Build

- Google sign-in
- Apple sign-in
- auth guard + `/login`
- Firestore matches/tournaments under `users/{uid}/…`
- Calendar settings subdoc
- one-time localStorage migration on first sign-in
- sign out
- persistent Firestore local cache

### Done when

- unauthenticated users land on login (when Firebase configured)
- authenticated users land on Schedule
- create/edit syncs to Firestore
- refresh preserves session
- demo works without sign-in
- local dev still works without `.env.local`

---

## Phase 2 — Match domain + local CRUD

### Build

- TypeScript Match types from `DATA_MODEL.md`
- Firestore match repository
- Quick Match form
- Full Match form
- Edit Match
- Match Detail
- delete only if PRD explicitly allows it; otherwise retain via status

### Done when

- user can create a Quick Match
- user can create/edit optional details
- data survives refresh
- validation matches spec
- generated title follows documented rules
- user cannot access another user's documents

---

## Phase 3 — Agenda

### Build

- next-match query
- hero card
- upcoming groups
- empty state
- Directions action
- Add action from Agenda

### Done when

- Agenda correctly orders upcoming matches
- cancelled records do not become Next Match
- empty state is useful
- UI works at narrow mobile widths

---

## Phase 4 — Calendar

### Build

- month calendar
- date markers for matches
- selected-day match list
- detail navigation

### Done when

- moving month does not load unrelated data unnecessarily
- dates with matches are obvious
- multiple matches on one date are supported

---

## Phase 5 — History + pay

### Build

- history list
- completed/cancelled presentation
- pay status including donated/free
- paid amount and `paidAt`
- lightweight After Match completion flow
- summary totals
- simple filters
- data needed for future personal insights such as payment delay

### Done when

- past matches are discoverable
- expected vs paid is not conflated
- totals use documented definitions
- app still performs with a meaningful history dataset

---

## Phase 6 — Expenses

### Build

- expense add/edit/remove
- default categories including rideshare
- reimbursement expected/pending/reimbursed tracking
- `reimbursedAt` and reimbursed amount
- match expense total
- History/finance summary integration
- expected/realized/out-of-pocket calculations where shown
- receipt attachment field compatibility only; do not add Storage/upload UI yet

### Done when

- expenses remain attached to one match
- totals update immediately
- no payment/accounting integrations were introduced

---

## Phase 7 — Travel + custom fields

### Build

- flight section (manual entry only)
- lodging section
- ground travel section
- built-in optional details
- custom label/value fields
- generated conditional match-day timeline from entered details
- timeline expansion only for matches with meaningful itinerary content

### Done when

- empty optional sections do not clutter Match Detail
- existing data reopens the right edit sections
- custom fields support add/edit/remove without dynamic Firestore property names
- timeline reuses underlying match/travel data rather than duplicating it
- plain local matches do not show an empty timeline
- no flight API dependency is introduced

---

## Phase 8 — Offline hardening

### Build

- persistent Firestore local cache (`done`)
- offline UI state (`OfflineBanner` when signed in)
- queued CRUD verification (Firestore default queue)
- service worker caching review (PWA shell via `vite-plugin-pwa`)
- reconnect behavior (“Back online” notice)

### Done when

Test manually:

1. load Agenda online
2. go offline
3. reopen an existing match
4. edit/create a match while offline
5. reconnect
6. verify sync and no duplicate record

No custom sync engine unless Firebase's standard behavior fails a documented requirement.

---

## Phase 9 — Tournament

### Build

- Tournament create/edit/detail
- child match relation
- shared hotel/flight/ground travel
- add child match from Tournament
- `payScope` (lump vs per-match pay)
- unified create and edit through Full details (`FullMatchPage`)

### Done when

- standalone matches remain first-class
- child matches are ordinary Match docs
- tournament relationship does not require duplicate child ID arrays
- deleting/editing shared data does not silently overwrite child-owned data without a defined rule
- parent timeline/travel does not duplicate onto child cards

---

## Phase 10 — MatchReadyTX import

### Dependency

MatchReadyTX callable `syncMatchReadyAssignments` (deploy from MatchReadyTX repo).

### Build

- server-side integration boundary
- one-way import
- source/external ID mapping
- idempotent upsert
- preserve Match Calendar user-owned fields

### Done when

- repeated imports do not duplicate matches
- source updates refresh only source-owned fields
- personal notes/expenses/pay status/travel/custom fields remain intact
- there is no write-back to MatchReadyTX

---

## Phase 11 — Polish / release

**Status:** Largely complete on the Calendar repo (Sep 2026). Remaining ops: commit MatchReadyTX `firestore.rules` so CI does not overwrite Calendar paths; manual offline/PWA smoke on prod.

### Build

- Firebase Hosting site `matchcalendar` → `matchcalendar.web.app`
- `.firebaserc` + `npm run deploy:hosting` (local) or `.github/workflows/deploy.yml` (CI on `main`)
- `.github/workflows/ci.yml` — typecheck, lint, test on push/PR; deploy workflow runs the same before build
- GitHub Actions secrets for `VITE_FIREBASE_*` + `FIREBASE_TOKEN` (same pattern as MatchReadyTX)
- Auth authorized domain: `matchcalendar.web.app`
- loading states (`AppDataGate` while Firestore hydrates)
- user-visible error toasts for Firestore/provider failures (`AppToastProvider`)
- install experience (PWA manifest + **Add to Home Screen** prompts on Login and About)
- accessibility pass (skip link, main landmark, schedule view toggle semantics)
- responsive pass
- Firestore rules deployed from MatchReadyTX repo (not Calendar) — **must be committed in MatchReadyTX**
- basic smoke tests

### Done when

- no dead navigation
- no placeholder controls presented as working
- keyboard/focus behavior is usable
- app is installable
- primary workflows work on mobile browser and installed PWA
- Firestore rules are deployed and tested
- demo preview remains available from login and masthead without hiding behind env flags

---

## Cursor workflow for each phase

Before coding a phase:

1. read `docs/PRD.md`
2. read the relevant section of `docs/IMPLEMENTATION_SPEC.md`
3. read `docs/DATA_MODEL.md` if touching data
4. read `docs/DESIGN_SYSTEM.md` if touching UI
5. read this phase
6. inspect existing code before creating new patterns

Then:

- state the small set of files you expect to change
- implement only the phase
- run typecheck/build/tests available in repo
- summarize what changed
- list any product decision that could not be resolved from docs

Do not use a large repo-wide refactor as a side effect of a feature phase.
