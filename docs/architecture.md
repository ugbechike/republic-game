# Republic V0 architecture

The existing room, simulation and city modules support the pressure and negotiation layer.

1. Playable room: creation, secure session, lobby, server clock and reconnection.
2. Republic simulation: monthly economy, scarce resources, delayed policies, states, elections and choices.
3. Multiplayer strategy: recurring bilateral trade, counteroffers, pacts, loans, sanctions and votes.
4. Conflict: threats, costly bounded wars, outside assistance and reparations.
5. Visual world: persistent seeded plots, staged construction and state-specific scenes.
6. Ending: five-category power score, awards, statistics and a host-led rematch.

## Workspace

- `apps/web`: Next.js App Router, feature-local React components, Tailwind and React Three Fiber.
- `apps/server`: Fastify, Socket.IO, persistence and per-room serialization.
- `packages/contracts`: Zod input validation and shared public/private types.
- `packages/engine`: deterministic simulation, actions and scoring; no transport or database dependencies.
- `packages/api-client`: HTTP, sockets and browser session storage; no API calls in UI components.

## State model

A Room owns its options, phase, host ID, players, month, next tick deadline, Republics,
trade proposals/contracts, alliances, loans, wars, assembly vote, event log and result.
A Republic owns its metrics, policy settings/pending changes, nine tradeable commodity stocks and five geographical advantages,
six regions, persistent city plots, political capital, reputation and statistics.
Money is in billions; resource stocks are abstract strategic units. A session is 240
months (20 years), starting January 2030, with tick interval duration / 240.
The engine is seeded by room/player identity. Wall clock scheduling is isolated at the server.

## Transport contract

HTTP `POST /rooms`: validated options + Republic draft -> code, playerId, secret token.
HTTP `POST /rooms/:code/join`: validated Republic draft -> secure session.
HTTP `GET /health`: readiness.
Socket handshake `auth: {code, playerId, token}` restores identity from hashed server tokens.
`action` payload `{requestId, action}` -> acknowledgement `{ok, error?}`.
`state` -> versioned per-player RoomView. Only the requesting Republic's internal metrics,
resource stocks, choices and political details are exposed. Diplomacy is filtered by participant;
public estimates/alliances/GDP/stability remain visible. Secret tokens never appear in snapshots.
`connect_error` communicates authentication/reconnection failures.

All actions and ticks run through a room queue: clone -> validate/mutate -> persist -> publish.
Request IDs are recorded per player for retry deduplication. PostgreSQL JSONB snapshots are
saved atomically before acknowledgement. Development uses persistent PGlite (PostgreSQL WASM)
when DATABASE_URL is absent; production requires external PostgreSQL. One server replica owns
the clock. Downtime and zero connected human sessions pause the simulation. Reconnection resets the next
monthly tick without advancing missed time. Active-game milliseconds drive adviser and world-event deadlines.
No Redis or account authentication. Tokens are bearer credentials; room code alone cannot
resume another player's identity. Debug actions require development mode and host ownership.

## Validation

Unit tests cover resources/economy, delayed policy effects, elections, agreements, conflict,
score and clocks. Server integration tests cover validation, privacy, deduplication, reconnect
and persisted recovery. Browser smoke checks exercise room creation and the playable UI.
Source-file size check enforces 250 lines. Build and typecheck precede final push.


## Pressure and obligations

`resource-economy` records actual production and external exports; `supply` consumes each
commodity, records deliveries and reserve runway, and escalates or eases shortage stages.
`game-director` ranks genuine needs using counterpart production, contracts, alliances,
public services, recent briefings and game phase. It allows one ordinary open briefing per
Republic, with a 2.5–3.5-minute issue cadence. `world-director` changes production, external
prices and demand every twelve active minutes. No system accepts a human's offer for them.

`delivery` validates both sides before transferring any mixed package. `loans` owns repayment,
credit and default; `bank` owns enforceable policy ceilings and construction suspension.
`economic-history` records monthly metrics, resource flows, causes and event annotations.
Adviser needs and stockpiles remain private; other players see estimated production surplus.

The web client keeps briefings, economy charts and diplomatic forms in separate feature modules.
All transport still goes through `packages/api-client`, including server-initiated reconnects.
Existing saved rooms receive missing ledger/director fields without replacing identities or plots.

## Presidential experience

Room phases are lobby → draft → playing → ended. The server owns scarce draft deposits,
turn deadlines, snake order, automatic unattended claims and the shared reveal. Essential
inputs are represented globally; each Republic receives three quality-adjusted advantages.
The client never awards itself resources.

`office-director` paces governor and business correspondence alongside need-driven minister
briefings. At most one ordinary office matter and one ordinary minister briefing are open
per Republic. `Presidency` maintains the active surface and return-to-document context;
feature-local dossiers expose existing policy, economy and security modules.

Meetings are private room records projected only to participants. Shared terms carry a
revision; stale edits and signatures are rejected. Proposing locks terms, countering clears
signatures, and the second signature invokes existing trade validation on an isolated
room clone. Only success replaces the authoritative state. Retry IDs are then stored on
the replacement player record, so duplicate final signatures cannot transfer twice.

Public Republic projections include regions, persistent plots, flood state, energy and
approval for visits. They exclude private inventories, treasury, needs and policy detail.
R3F landscapes render persistent construction, flood damage, outages and demonstrations;
the SVG fallback uses the same plot coordinates and conditions when WebGL is unavailable.
Office and boardroom environments use original 2.5D assets with accessible React controls.
