# Republic V0 implementation plan

Empty repository: no existing application or architecture to reuse.

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
A Republic owns its metrics, policy settings/pending changes, seven resource stocks,
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
the clock. Downtime pauses the clock on restart, avoiding unattended mass simulation.
No Redis or account authentication. Tokens are bearer credentials; room code alone cannot
resume another player's identity. Debug actions require development mode and host ownership.

## Validation

Unit tests cover resources/economy, delayed policy effects, elections, agreements, conflict,
score and clocks. Server integration tests cover validation, privacy, deduplication, reconnect
and persisted recovery. Browser smoke checks exercise room creation and the playable UI.
Source-file size check enforces 250 lines. Build and typecheck precede final push.
