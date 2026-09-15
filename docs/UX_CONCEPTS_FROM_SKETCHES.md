# Match Calendar — UX Concepts from Handwritten Sketches

**Status:** Design reference / product intent  
**Source:** `Matchassignments thoughts and ideas.pdf`, handwritten concept notebook, pages 1–23  
**Relationship to other docs:** The sketches explain interaction intent and information hierarchy. They are not pixel-perfect layouts. `PRD.md` remains product truth, `DATA_MODEL.md` remains schema truth, `DESIGN_SYSTEM.md` remains visual-system truth, and `UI_SPEC.md` remains implementation behavior. When a sketch conflicts with a later explicit product decision, the later decision wins.

## How Cursor should use this document

Do **not** reproduce the drawings literally. Use them to understand the intended UX: what is prominent, what expands, which information belongs together, and how a user moves from a match into richer match-day context. Do not invent functionality from illegible handwriting. Where this document labels something as exploration or backlog, do not implement it unless the current build phase calls for it.

The original page renders are included under `docs/assets/sketches/` so the design intent remains visible in the repo.

---

## Concept A — Agenda, assignment cards, and progressive disclosure

**Sketch pages 1–4**  
![Sketch page 1](assets/sketches/page-01.png)
![Sketch page 2](assets/sketches/page-02.png)
![Sketch page 3](assets/sketches/page-03.png)
![Sketch page 4](assets/sketches/page-04.png)

### What the drawings are exploring

The opening sketches explore the app shell and the idea that the user's schedule should be readable as a compact list of assignment cards rather than requiring a traditional calendar first. The cards emphasize the immediately useful match facts: date/time, teams or title, location, position, and pay.

The richer card drawing shows a second layer of information, including travel/lodging indicators. The intent is **progressive disclosure**: keep a normal local match simple, but allow a travel-heavy assignment to reveal more context without making every card enormous.

### Product decision derived from the sketches

- Agenda remains the default/home experience.
- A normal local match does **not** need an expandable empty itinerary.
- If a match has meaningful timeline content — e.g. flight, lodging, rental/ground travel, or custom itinerary items — tapping/expanding may reveal the generated timeline.
- Full Details/Edit remains available separately.
- Do not put every Full Details field onto the collapsed Agenda card.

---

## Concept B — Quick Match should feel genuinely quick

(Sketch label: **Quick Add** — same flow as the app’s Quick Match modal.)

**Sketch pages 5–6**  
![Sketch page 5](assets/sketches/page-05.png)
![Sketch page 6](assets/sketches/page-06.png)

### What the drawings are exploring

The Quick Add sketches place **Position, Match Type, and Pay** prominently, followed by Date/Time, Location, Match Title, Home/Away, Save, and a route into Full Details. The point is not the exact pixel arrangement; it is the separation between a fast assignment capture flow and the richer optional record.

### Product decision derived from the sketches

- `position` and `matchType` are separate fields.
- Match Type is rugby-first with presets: `XVs`, `10s`, `7s`, `Tournament`, `Other`. `Other` reveals custom text.
- Position uses a rugby-first preset list plus `Other`; `Other` reveals custom text.
- Quick Add should not expose travel, reimbursement, receipts, contacts, etc.
- `Full Details` is the deliberate escape hatch for richer information.

---

## Concept C — Full Details is grouped by real-world task

**Sketch pages 7–10**  
![Sketch page 7](assets/sketches/page-07.png)
![Sketch page 8](assets/sketches/page-08.png)
![Sketch page 9](assets/sketches/page-09.png)
![Sketch page 10](assets/sketches/page-10.png)

### What the drawings are exploring

These pages expand the assignment into optional groups rather than one huge flat form. The notebook explores:

- Match Contact: name, phone, email, team/organization context.
- Flight: outbound/return details, flight number, confirmation, departure/arrival information.
- Rental Car / ground travel: company, pickup/return timing, cost/payment and reimbursement context.
- Lodging: property, check-in/check-out, confirmation, cost/payment and reimbursement context.

The repeated “I paid” / reimbursement thinking is important. A cost paid personally is an expense even if the user expects to be reimbursed later.

### Product decision derived from the sketches

- Travel sections remain optional and collapsed/secondary until needed.
- Flight data is manual for now. No aviation API dependency in the current build.
- Expenses preserve the original amount even after reimbursement.
- Reimbursement is tracked separately from the expense itself.
- Receipt attachments are a future capability; do not add Firebase Storage for receipts yet.

---

## Concept D — History is also the beginning of financial insight

**Sketch pages 11–15**  
![Sketch page 11](assets/sketches/page-11.png)
![Sketch page 12](assets/sketches/page-12.png)
![Sketch page 13](assets/sketches/page-13.png)
![Sketch page 14](assets/sketches/page-14.png)
![Sketch page 15](assets/sketches/page-15.png)

### What the drawings are exploring

These pages move beyond “past matches” into the financial aftermath of officiating. They explore sorting/filtering past assignments, payment status, cancellation, reimbursements, additional expenses, and summary information.

One handwritten question on page 11 meant: **can the details entered on the assignment be used to generate the full agenda/timeline?** The answer/product direction is yes; users should not re-enter itinerary facts to build an agenda.

The notebook also explores statistics such as total paid, breakdown by position, unpaid money, donated/free matches, and expense categories such as flight, lodging, car, gas, rideshare, parking, etc. “Expenses” vs “Insights” is not yet a final navigation/name decision.

### Product decision derived from the sketches

- `donated` is distinct from `unpaid`.
- Preserve `paidAt`, not only paid/unpaid state, so future personal analytics can calculate payment delay.
- Preserve `reimbursedAt`, not only reimbursement state, so reimbursement delay can be calculated.
- Personal insights are a roadmap direction, including average fee, average fee by position/type, average days to payment, unpaid totals, donated work, expenses, reimbursements, and net out-of-pocket cost.
- Cross-user/company-wide analytics are **not** part of the current implementation scope.

---

## Concept E — Calendar → day → assignment → timeline

**Sketch pages 16–19**  
![Sketch page 16](assets/sketches/page-16.png)
![Sketch page 17](assets/sketches/page-17.png)
![Sketch page 18](assets/sketches/page-18.png)
![Sketch page 19](assets/sketches/page-19.png)

### What the drawings are exploring

This sequence is an interaction model, not four unrelated screens:

1. Browse the month calendar.
2. Select a date.
3. See assignment card(s) for that date.
4. Select an assignment.
5. If the assignment contains meaningful surrounding events, reveal its match-day timeline.

The vertical timeline sketch is a core UX concept. It shows travel and match events in chronological order — e.g. depart, land/get rental, match, return rental, depart — so the assignment becomes a complete view of the user's match day/trip.

A normal local match with no flight, hotel, rental/ground travel, or custom itinerary does **not** need a timeline just for consistency.

### Clarification of handwritten notes

The page-16 note about uploading/taking pictures refers to **receipt photos for expenses/reimbursement documentation**, not general photo sharing. This is backlog/future work because storage cost and retention need to be considered for a free app.

The note about the “legality of tracking events” refers to Rabbit Hole Apps potentially possessing valuable referee/payment data. That is a privacy/business-policy question, not a current UI feature. Do not implement cross-user analytics from it.

---

## Concept F — Generated timeline with editable defaults

**Sketch pages 20–22**  
![Sketch page 20](assets/sketches/page-20.png)
![Sketch page 21](assets/sketches/page-21.png)
![Sketch page 22](assets/sketches/page-22.png)

### What the drawings are exploring

The timeline should be **generated from information the user already entered**, not maintained as a duplicate itinerary.

There are three useful classes of timeline item:

1. **Factual** — entered travel/match facts such as flight departure/arrival, hotel check-in/out, rental pickup/return, kickoff.
2. **Derived** — generated from user preferences and a factual anchor, e.g. “arrive at pitch 60 minutes before kickoff.”
3. **Custom** — user-created itinerary items such as crew dinner, credential pickup, meeting, etc.

Profile-level timing preferences may provide defaults. A derived time should be overridable for one assignment without changing the user's global default.

### Product decision derived from the sketches

- Timeline generation is a core direction.
- Do not require a separate manual agenda when the necessary facts already exist.
- Generated/derived timeline items must remain understandable and editable.
- Do not overbuild automatic timing rules until the UI/data foundation exists.
- Aviation API lookup is backlog only. Manual flight entry must remain the baseline.

---

## Concept G — Open exploration / not a committed screen

**Sketch page 23**  
![Sketch page 23](assets/sketches/page-23.png)

Page 23 is retained as part of the design notebook but should not be treated as a finalized implementation requirement unless its concept is also specified in the PRD/UI Spec or a later product decision.

---

## Interaction principles preserved from the notebook

1. **Simple matches stay simple.** Do not force travel/finance complexity into every assignment.
2. **Enter facts once.** Reuse assignment/travel data to construct the agenda and later insights.
3. **Complexity appears when useful.** Travel-heavy matches can become rich match-day timelines.
4. **Quick Add and Full Details serve different jobs.** Do not merge them into one giant form.
5. **Financial status has history.** Dates such as `paidAt` and `reimbursedAt` matter, not just current booleans/statuses.
6. **The sketches communicate hierarchy, not final visual styling.** Use `DESIGN_SYSTEM.md` for visual execution.

## Explicit non-goals from this sketch pass

Do not implement these merely because they appear in the notebook discussion:

- flight API integration;
- receipt upload/storage;
- OCR/AI receipt extraction;
- cross-user industry analytics;
- selling or sharing referee data;
- a timeline for every local match;
- pixel-for-pixel reproduction of Samsung Notes sketches.
