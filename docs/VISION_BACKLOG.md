# Match Calendar — Vision Backlog

**Status:** Active  
**Source:** `docs/MatchAssignments_260911_233928.pdf`, `docs/UX_CONCEPTS_FROM_SKETCHES.md`, gap review (Sep 2026)  
**Purpose:** Track sketch-to-shipped gaps in priority order. Update status as work lands.

**Terminology:** Sketch **Quick Add** = app **Quick Match** (the `+` modal). Same flow, not a separate feature.

Legend: `done` | `in_progress` | `pending` | `deferred` | `cancelled`

---

## Priority 1 — Financial closure (travel + expenses as one story)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| F1 | Include travel self-paid amounts in match + History totals | `done` | `travelFinance.ts`, `paySummary.ts`, Detail + History |
| F2 | After Match: review pending travel reimbursements | `done` | Reimbursement step before expenses |
| F3 | After Match: offer to import travel self-paid into expense list | `done` | “Add from travel” button |
| F4 | After Match: suggest gas expense when car rental was self-paid | `done` | Prompt only; user adds |
| F5 | After Match: **removed from assignment** path | `done` | Same pay follow-up as cancelled |
| F6 | Expense category rollup on Money (flight, lodging, car, gas) | `done` | `getCategoryRollup` + Costs by category section |
| F7 | Per-position financial breakdown | `done` | Money page “By position” section |
| F8 | **Who owes?** on unpaid matches | `done` | `payOwedBy` field + Money “Who owes pay” rollup |

---

## Priority 2 — Timeline & profile defaults

| ID | Item | Status | Notes |
|----|------|--------|-------|
| T1 | Profile default: arrive at airport (minutes before first flight) | `done` | Default 120 min; Profile setting |
| T2 | Derived timeline row: arrive at airport | `done` | From first flight departure − profile default |
| T3 | Custom itinerary editor in Full Match form | `done` | Expandable “Custom itinerary” card |
| T4 | Edit derived times on timeline (picker on row) | `done` | Match Detail timeline: derived + custom “Change time” |
---

## Priority 3 — Schedule navigation (Cal \| Age)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| N1 | Combined schedule surface with Cal \| Age header toggle | `done` | `/schedule` + `ScheduleViewToggle`; legacy `/agenda` `/calendar` redirect |
| N2 | Quick Match affordance at bottom of Agenda list | `done` | Opens same Quick Match modal as `+`; sketch label was “Quick Add” |
| N3 | Dedicated finance ($) tab vs History | `done` | **Money** tab (`/money`); `/history` redirects |
| N4 | **Insights** tab for rollups + appointment counts | `done` | `/insights`; earnings summaries moved off Money |
| N5 | Money tab = tax/settlement workspace | `done` | Needs settlement + settled match records; no hero rollups |

---

## Priority 4 — Full Details richness

| ID | Item | Status | Notes |
|----|------|--------|-------|
| D1 | Multi-contact expandable card (Name, Phone, Email, Team, + Contact) | `done` | `ContactsEditor` on Full Match; legacy `contact` migrated |
| D2 | Union \| Comp \| Div metadata row | `cancelled` | Single `competition` field is sufficient |
| D3 | Quick Match: Match Title field | `done` | Optional field on Quick Match modal |
| D4 | Quick Match: Position \| Type \| Pay chip row layout | `cancelled` | Not planned |

---

## Priority 5 — Cards & match record

| ID | Item | Status | Notes |
|----|------|--------|-------|
| C1 | Match score on completed cards | `cancelled` | Not planned |
| C2 | Donated / unpaid chips on agenda rows | `done` | Chips on `MatchCard` |
| C3 | Inline match settlement on Money cards | `done` | Single-panel lines: amount + paid/unpaid toggles, expenses, close out / save for later |
| C4 | Inline settlement on Match Detail | `done` | Settlement section when kickoff passed |
| M1 | Needs settlement section when kickoff passes | `done` | Top of Money tab + nav badge |

---

## Deferred (documented non-goals / later phases)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| X1 | Auth (Google / Apple) | `done` | Shared MatchReadyTX Firebase project; `/login` |
| X2 | Firestore sync + offline hardening | `done` | `users/{uid}/matches` + tournaments; persistent cache |
| X3 | MatchReadyTX import | `deferred` | Phase 10 |
| X4 | Flight API | `deferred` | Manual entry baseline |
| X5 | Receipt photo upload | `deferred` | Storage cost |
| X6 | Cross-user analytics | `deferred` | Privacy / product boundary |

---

## Shipped (vision-aligned, no further backlog item)

- Quick Match (sketch: Quick Add) → Full Details split with rugby presets
- Assignment row: date column, chips, teams, venue, travel icons, right Timeline tab
- Collapsed travel cards with I Paid + reimbursement
- Multi-segment flights
- Generated match-day timeline (factual + pitch arrival derived)
- Calendar → day → cards flow
- History filters + summary totals (expense list scope)
- After Match: completed / cancelled / donated / pay / expenses (baseline)
- Tournament parent edit + lean child matches with per-game pay override
- Form validation hardening + unsaved-changes guard on match/tournament forms
- Tournament create via **Full details** (Match type → Tournament + game format row)
- Tournament `payScope` (`tournament` vs `per_match`); parent-only timeline on agenda/detail
- Tournament create and edit both via **Full details** (`FullMatchPage` + shared `MatchCoreFields`)

---

## Current sprint

**Local product** is feature-complete. **Auth + Firestore** (shared MatchReadyTX project) is implemented. Next up: deploy rules, add `.env.local`, device testing with real accounts, then MatchReadyTX import when API is ready.
