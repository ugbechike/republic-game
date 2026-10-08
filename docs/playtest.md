# Local playtest checklist

## Automated coverage

`npm run check` covers scarce resource consequences, policy lag, nonnegative inventories,
elections, persistent plots, recurring settlements, failed acceptance, counters, sanctions,
pacts, loans, majority rules, war costs/outcomes, assistance, score caps, deadlines and rematches.
Service tests exercise token checks, privacy, parallel joins, capacity, persistence and the clock.
HTTP/Socket.IO integration uses embedded PostgreSQL to verify schemas, authentication,
action deduplication, saved request IDs and reconnect snapshots.

## Multiplayer rehearsal

- Use two to eight independent browsers/profiles. Create a room and join the displayed code.
- Start as host. Check that all players’ calendars and public GDP figures agree.
- Reload the host and another player. Their seats, stocks and plots must be unchanged.
- Offer food for fuel. Counter, accept, inspect both ledgers and wait for monthly delivery.
- Deliberately create an unaffordable deal; acceptance must fail without a partial transfer.
- Sign a trade pact, take a bilateral loan, impose sanctions and inspect the economic consequences.
- Use development tools to trigger a crisis and force an election. Pass a policy under a hostile House.
- Declare war, invite outside assistance, vote on sanctions and wait for bounded settlement.
- Switch between capital and states, then return. Existing plots must retain position and progress.
- Jump near the ending. Inspect all five score categories, awards and rematch with the same seats.
- Restart the backend during play. After reconnect, the world should resume from the saved month.

## Human hypothesis test

Run a full 60-minute session with 4–8 friends before tuning or deployment. Record:

1. When did each person first need another player?
2. Which proposals prompted an actual spoken negotiation?
3. Did sanctions, votes and wars create choices for uninvolved players?
4. Did anyone feel effectively eliminated while still owning a Republic?
5. Were resource shortages, policy delays and failed agreements understandable?
6. Which decisions felt too cheap, too punishing or irrelevant?
7. Did the final ranking feel explainable? Did the group want another game?

Avoid adding more systems until this test identifies a concrete problem in the social loop.

## Redesign verification — 2026-10-08

- Automated: 33 tests; contracts, engine, service persistence and HTTP/Socket.IO integration. TypeScript and the 250-line source limit pass.
- Desktop browser: created Solara with oil, coastline and farmland (5/5 points), checked the land preview and exact starting values, and reached the summit. Start was disabled with one human.
- Independent origin: joined the same world as Kantara using gold, farmland, rivers and timber; the host's challenge was locked. Both seats appeared live, and two humans could start.
- Reloaded both browser sessions: each recovered its own President, resources and the same running calendar.
- Inspected the city HUD, resource landmarks, world view, economy and diplomacy overlays. Production client build passed.
- Local development explicitly allows the two loopback origins for independent storage during browser QA. No deployment performed.

Remaining product validation: a full social session with friends to assess resource balance and pacing.
