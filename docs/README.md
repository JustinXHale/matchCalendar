# Match Calendar docs

**Canonical location:** files in this `docs/` folder only. Older copies (for example `MATCH_CALENDAR_PRD.md` or bundled export folders) should not be kept alongside these — they create conflicting product truth.

- `PRD.md` — product truth
- `IMPLEMENTATION_SPEC.md` — technical truth
- `DATA_MODEL.md` — schema truth
- `DESIGN_SYSTEM.md` — visual truth
- `UI_SPEC.md` — screen behavior
- `BUILD_PLAN.md` — phased implementation
- `UX_CONCEPTS_FROM_SKETCHES.md` — sketch-derived interaction reference
- `PRODUCT_DECISIONS_2026-09.md` — decision log from notebook reconciliation
- `../.cursor/rules/match-calendar.mdc` — AI coding rules

Conflict precedence: PRD for product decisions; Data Model for exact schema; Design System for visual conventions.

## Primary navigation

Bottom nav: **Schedule** · **Money** · `+` · **Insights** · **About**. Profile is masthead-only (`/profile`).

### Schedule (Agenda + Calendar)

**Schedule** is a single bottom-nav destination with a **Cal | Agenda** header toggle:

- **Agenda** — chronological “what is next” list (Next match, This week, Later).
- **Cal** — month grid plus the selected day’s matches below it (browse by date).

Legacy paths `/agenda` and `/calendar` redirect to `/schedule` (calendar view uses `?view=calendar`).

### Demo mode

**Try demo** on login or **View demo** in the masthead loads in-memory sample data (no Firestore writes). Intentionally available in production.

## 2026-09 notebook reconciliation

The current docs incorporate the handwritten product exploration for match-day timelines, rugby match/position presets, After Match completion, donated assignments, reimbursement tracking, future receipt attachments, and personal finance insights.

Scope discipline:

- Build/model only according to `BUILD_PLAN.md`; sketches are not permission to build every future idea immediately.
- Cross-user/company analytics are not in current scope.
- Receipt uploads are backlog; do not add Firebase Storage for them yet.
- Flight APIs are backlog; manual flight entry must remain the production baseline.
- Generated timelines are conditional and derive from existing match/travel data.


## Handwritten UX reference

`UX_CONCEPTS_FROM_SKETCHES.md` translates the September handwritten concept notebook into implementation-readable UX intent and includes page renders under `docs/assets/sketches/`. Cursor should use it to understand interaction hierarchy and sketch rationale, while respecting the precedence rules above.
