# Match Calendar — Notebook Reconciliation (2026-09)

This file records product decisions clarified from the handwritten Match Calendar sketches and follow-up discussion. It is a decision log, not an instruction to implement every item immediately. `BUILD_PLAN.md` controls sequencing.

## Build / model decisions

- Agenda/timeline content is generated from information already entered for the match, travel, lodging, and ground transportation. Do not require duplicate itinerary entry.
- A plain local match does not need a timeline. Timeline expansion is conditional on meaningful surrounding itinerary content.
- Match type uses rugby-first presets: XVs, 10s, 7s, Tournament, Other. Other exposes custom text.
- Position uses rugby-first presets plus Other/custom text. Keep the preset list in UI/domain constants so it can evolve without schema churn.
- Donated/free is a distinct compensation state from unpaid.
- Store `paidAt` when payment is received so personal insights can calculate payment delay.
- Expenses preserve what the official actually spent. Reimbursement is separate state and may include reimbursed amount and `reimbursedAt`.
- After Match is a lightweight progressive completion flow covering cancellation, payment expectation, donated status, payment receipt, expenses, and reimbursements.
- Personal finance/history should be able to evolve toward insights such as average fee, fee by position/type, average days to payment, unpaid balances, donated assignments, expenses, reimbursements, and out-of-pocket cost.

## Model now / build later

- Generated timeline items should derive from source fields. Persist only custom itinerary items or explicit overrides when those interactions are implemented.
- Expense records should be compatible with a future receipt attachment, but receipt upload/storage is not part of the current phase.
- Profile-level timing defaults may later generate personal timeline items such as arrival-at-pitch relative to kickoff.

## Backlog / do not implement now

- Flight API lookup/status. Manual flight entry remains the baseline; do not add a paid aviation dependency.
- Receipt photo upload and Firebase Storage usage.
- Cross-user or Rabbit Hole Apps industry analytics pipeline.
- AI/OCR receipt parsing.

## Still open

- Final name for the finance area: Expenses, Insights, or another label.
- Exact complete rugby position preset list.
- Exact UX for per-match timeline overrides and custom itinerary items.
