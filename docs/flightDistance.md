# Flight distance (derived miles)

Match Calendar computes flight mileage client-side from segment airport codes. Miles are **derived at read time** and are **not stored** in Firestore.

## Data source

Airport coordinates come from [OurAirports](https://ourairports.com/data/) (public domain). A filtered registry is committed at `src/features/matches/airportRegistry.json` (IATA codes for large and medium airports).

Regenerate after updating source data:

```bash
npm run build:airports
```

The registry is internal only. Airport fields in the UI stay free-text; users type or paste codes as they do today.

## Calculation

For each flight segment:

1. Normalize `departureAirport` and `arrivalAirport` (trim, uppercase, extract a 3-letter IATA token when present).
2. Look up coordinates in the bundled registry.
3. Compute great-circle distance (Haversine) in miles.
4. Sum resolvable segment legs. Segments with missing or unknown airports are skipped.

This is a straight-line estimate, not ticket or route mileage.

## Where miles appear

| Surface | Behavior |
|---------|----------|
| Agenda / schedule cards | Travel chip shows `Flight (1001 mi)` when computable |
| Event setup Flight card | Title becomes `Flight (1001 mi)` when computable |
| Insights | **Miles flown** includes derived flight distance and manual `miles_flown` expense entries, with segment count and total air time from segment schedules. **Miles driven** shows trip count and estimated drive time (65 mph average). |
| Event setup Flight form | **Total air time** below segments when departure and arrival times are set |

## Implementation

- Logic: `src/features/matches/flightDistance.ts`
- Registry build: `scripts/build-airport-registry.mjs`
- Tests: `tests/flightDistance.test.ts`
- Platform admin rollup: MatchReadyTX `functions/src/matchCalendarFlightDistance.ts` + `airportRegistry.json` (copy registry after rebuild)
