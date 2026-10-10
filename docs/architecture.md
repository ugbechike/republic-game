# Republic party-game architecture

The active route is `PartyLanding → PartyLobby → RoleReveal → PartyShell → PartyResults`.
PartyShell exposes only Office, Meetings and World. Shared session transport, room persistence,
fictional emblems and original Office/boardroom art are reused from the previous simulator.

## Workspace and state

- `apps/web/src/features/party`: feature-local React components and eight small CSS modules.
- `packages/contracts/src/party*`: private/public match types, Zod intents and balance constants.
- `packages/engine/src/party`: scenario, inventory, needs, meetings, treaties, valuation,
  scoring, reliability, director, projection and transactional actions.
- `apps/server`: authoritative room cache, serialization, HTTP/Socket.IO and database snapshots.
- `packages/api-client`: HTTP creation/join, socket connection/retry and local seat storage.

`Room.party` is a versioned-by-round match inside the existing persisted Room envelope.
It owns players, randomly assigned roles, finite inventories, original-supplier stock lots,
needs, private meetings, agreements, score ledgers, timestamps, twist and results.
Legacy fields remain for saved-data compatibility and regression tests. Old worlds can be
recognized at the title, but legacy simulator controls are not routed into the new UI.
Party rooms reject simulator actions.

## Authoritative flow

HTTP `POST /rooms` uses duration 5 and 2–6 seats; `POST /rooms/:code/join` creates another
secure seat. Socket auth is `{code, playerId, token}`; server stores only token hashes.
Room code alone cannot impersonate a President.

An action is `{requestId, action: {type: 'party', match, intent}}`.
The room queue performs clone → authorize/validate → mutate → persist → publish → acknowledge.
Request IDs deduplicate retries. Match IDs reject requests from previous rounds; meeting
revision IDs reject stale edits/acceptances/signatures. Failed actions never publish partial
inventory changes. Every tick uses the same queue. PostgreSQL snapshots commit before broadcasts.

The server projects only the player's private inventory, intel, needs and score ledger.
Calls, chat and treaty records are participant-only. Other Presidents expose name, emblem,
role, live presence, Support and Influence. Future twist identity is private.

## Time and settlement

Reveal lasts at most 20 seconds; all-ready can start sooner. Activation establishes an immutable
`startedAt` and `endsAt = startedAt + 300000`. The server samples deadlines every 500ms, but
all actions check the exact cutoff. Client clocks interpolate server time for display only.
Disconnects never pause party rounds. Loading a saved room processes overdue deadlines and
persists the outcome; deadlines do not slide during downtime.

Proposal reserves the proposer's side; acceptance reserves the other side. Two signatures
on one revision create an immutable agreement. Immediate settlement or 15/30-second delivery
is fully escrowed, conserving quantities and original-supplier lots. Deliveries extending
beyond the round are rejected. Expired/reopened/unsigned proposals release reservations.
Settlement records a timestamp, preventing duplicate transfers. At cutoff, due signed
agreements settle, unsigned reservations release and results freeze once.

## Deployment boundary

Local development uses persistent PGlite. Production requires PostgreSQL, one authoritative
backend replica and an explicit frontend origin. Railway backend and Vercel frontend configs
remain prepared, not deployed. No Redis or distributed ownership is claimed.

Source files remain at most 250 lines. Mechanics are independent of React, sockets and database.
Pure tests cover rules; service tests cover persistence/races; real HTTP/Socket.IO tests cover
private projections and 3/6-player agreement paths. Browser QA covers the complete human UI.
