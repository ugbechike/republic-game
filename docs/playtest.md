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

## Pressure loop verification — 2026-10-08

- Automated: 49 tests across engine, server and API client; typechecks and source limits pass.
- Natural two-Republic test: oil/farmland versus gas/iron develops reciprocal needs, selects
  a real supplier, counters a mixed immediate/recurring proposal, transfers funds/resources,
  eases shortage stages and records economic history without exposing another player's stocks.
- Additional coverage: every legal resource selection has unmet essential production;
  deadline/delay penalties, funded flood response, equal starting difficulty inputs, bank
  restrictions, negotiated loan default, future deliveries, atomic failure, embargoes,
  world prices/output, discussion/abstention, offline pause/persistence and restart reconnect.
- Browser world MUU48: Solara Lab (oil/farmland) and Kantara Lab (gas/iron) started as two humans.
  Their energy ministers independently raised gas and oil needs. Solara's briefing showed
  required reserves, available stock, consequences, deadline and Kantara's estimated surplus.
- Opened Negotiate from that supplier. Sent $1B for six gas units, countered from Kantara to
  $1.5B, accepted as Solara. Treasury transferred, gas reserves replenished, the adviser request
  resolved, energy began recovering, and Economy recorded the signed deal and secured supply.
- Triggered development energy and flood events, verified the iron/cash reconstruction briefing,
  and recorded an Assembly abstention after discussion.
- Inspected GDP, flow, fiscal, debt and employment charts, event history, shortage stages and
  monthly cause details. Reloaded both sessions without losing their seats or agreements.
- Actual hovered states for both Create Republic and Next: Choose your land retained dark
  text over the gold gradient. This fixes the generic hover rule overriding their background.
- Browser uses the existing persistent 2D city fallback when WebGL is unavailable; this
  iteration does not change city rendering. No deployment performed.

### Reproduce the pressure scenario

Use two independent profiles (or localhost and 127.0.0.1). Create A with oil/farmland and B with
gas/iron. Start at normal speed. Ministers surface the first dependency in about 30–45 seconds.
Negotiate immediate reserves plus recurring supply before the three-minute deadline. Counter
from the other profile, accept, and watch the monthly supply table and stage recovery.

Under Events, the development host can expand GameDirector controls to target a Republic,
resource and quantity: shortage, treasury, flood, energy, world crisis, reserve adjustment,
advance 1–24 months, supplier surplus, trade dependency and security tension. These actions
are server-rejected in production and for non-host players.

Use the controls to check less frequent situations: miss a flood deadline, accept a bank
facility and try to bypass its policy ceilings, default a loan, embargo your supplier,
request military help, and discuss/abstain on a coordinated sanction resolution.

A 15–20-minute human conversation test and full 4–8-player balance session remain product
validation. Automated and browser checks establish that the mechanics work; they cannot
prove that negotiation prices, interruptions and consequences feel fair or fun.

## Presidential overhaul — 2026-10-09

See [the overhaul verification record](presidential-overhaul.md) for the complete
observed two-player draft → Office → negotiation → signatures → consequences → ending
rehearsal, including mobile and reconnect checks. It also distinguishes forced crisis
and accelerated ending checks from natural simulation and future human balance testing.

For new sessions, resources are selected in the shared scarce draft. Earlier dated
resource-point checklists above document historical builds, not the current setup flow.
