# AeroDataBox flight import

Match Calendar imports a flight into one segment at a time. The user supplies
the combined airline/flight number (for example, `DL1073`), local departure
date, and three-letter departing-airport code. The backend filters the single AeroDataBox response by
departure airport and imports a unique match immediately. Imported fields
remain editable.

## Architecture

- The browser never receives the RapidAPI key.
- Callable functions are deployed from the sibling `MatchReadyTX` repository,
  which owns the shared Firebase backend.
- `getMatchCalendarFlightImportAccess` controls whether the import action is
  shown.
- `searchMatchCalendarFlights` repeats the authorization check before every
  AeroDataBox request. Hiding the client control is not the security boundary.
- Authorization is stored in the server-only
  `matchCalendarFeatureAccess/{uid}` document. Platform admins manage it with
  the **Flight import** switch in Profile → Members.
- `setMatchCalendarFlightImportAccess` is restricted to the existing Match
  Calendar platform-admin UID/email allowlist. Clients cannot write access
  documents directly.
- Lookups use the dated Flight Status endpoint with
  `dateLocalRole=Departure`; nearest-day searches are intentionally avoided.
- Imported provider fields expire after six days. Firestore triggers register
  each import and a scheduled function removes airline, airport, and schedule
  fields every six hours. The user-entered flight number and departure date
  remain available for a later refresh.
- Provider-backed screens include linked AeroDataBox attribution.

## Firebase setup

From the `MatchReadyTX` repository:

1. Ensure the people who may manage feature access are configured as platform
   admins in `functions/.env.matchreadytx` (or the corresponding GitHub Actions
   variables/secrets):

   ```dotenv
   MATCH_CALENDAR_PLATFORM_ADMIN_UIDS=your-firebase-auth-uid
   MATCH_CALENDAR_PLATFORM_ADMIN_EMAILS=you@example.com
   ```

2. Store the RapidAPI key in Secret Manager. Enter the key only when prompted:

   ```sh
   firebase functions:secrets:set AERODATABOX_API_KEY --project matchreadytx
   ```

3. Build and deploy the flight functions, admin member data, and retention
   handlers:

   ```sh
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions:getMatchCalendarPlatformInsights,functions:getMatchCalendarFlightImportAccess,functions:setMatchCalendarFlightImportAccess,functions:searchMatchCalendarFlights,functions:trackMatchCalendarMatchFlightRetention,functions:trackMatchCalendarTournamentFlightRetention,functions:purgeMatchCalendarFlightData --project matchreadytx
   ```

4. Build and deploy Match Calendar after the callables are live. Open Profile →
   Members and enable **Flight import** for each permitted member. Changes take
   effect immediately and do not require another deployment.

## Provider terms

The free RapidAPI plan limits cached/stored provider data to seven days and
requires visible attribution. Match Calendar uses a six-day expiration window
and a six-hour cleanup schedule to remain below that limit. Imported provider
fields therefore do not become permanent historical records; users may refresh
them or keep separately entered manual flight information.

The initial integration imports scheduled UTC times. AeroDataBox local times and
airport time-zone identifiers are retained in the normalized callable response
for display during selection, but are not currently persisted on a segment.
