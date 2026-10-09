# Presidential overhaul — local verification

Implemented in four playable milestones: shared World Draft; interactive Office;
private bilateral meetings; connected Republic/World consequences and mobile polish.

## What is playable

- Two to eight Presidents create identities, join a world and claim three scarce
  advantages each in a timed snake draft. Deposits disclose quality, opportunities,
  risks and remaining availability. Claims are announced publicly. Unattended turns
  delegate a claim so the party does not stall.
- The Office is a layered presidential workspace with a desk folder, economic report,
  secure phone, window, wall map and cabinet. A Chief of Staff prioritizes a small set
  of actionable matters. Correspondence and a working calendar retain the details.
- Ministers use actual reserves, production, suppliers and obligations. Governors
  request reimbursements; businesses propose investments with delayed consequences.
- Presidents request, delay, decline or join a private boardroom. Chat is optional.
  Either participant edits shared terms; proposals lock, counters reopen, and two
  signatures bind a single validated exchange. Reconnect preserves the negotiation.
- Republic visits show persistent construction, flooding/reconstruction, reduced
  power and demonstrations. Visits from a briefing return to that document. Both
  R3F and an SVG fallback use the actual persistent region state.
- The World connects public profiles, trade routes, alliances, conflict, sanctions,
  institutions and history. Rival visits expose public landscapes, not stockpiles.
- Existing policy, loans, pacts, conflict, elections, ending and rematch remain usable.

Multi-President summits and shared-table loan/peace composers remain deferred, as allowed
by the brief. Existing bilateral loans and pacts remain in the Foreign Policy dossier.

## Automated checks — 2026-10-09

`npm run check`: 59 tests across 18 files; both TypeScript projects and the 250-line
source limit pass. `npm run build`: production Next.js build passes.

New coverage includes 140 seeded drafts across two to eight seats; turn/deadline
validation; resource quality; private meeting projection; stale revisions; proposals,
counters and signatures; atomic insufficient-funds failure; governor/business
consequences; persistent flood recovery; and public landscape projection.

A service test persists a two-player draft and negotiation, reloads between signatures,
submits the final signature twice in parallel, confirms exactly one exchange, reloads
the signed record, then advances all 240 monthly ticks to finite scores for both players.
Existing network/authentication, reconnect, offline pause, economy, pressure, sanctions,
loans, war and ending tests also pass.

## Actual two-player browser rehearsal

Independent browser storage at localhost and 127.0.0.1, with desktop and 390 × 844
phone layouts. World WX4YZ: Aurelia / Morgan and Verdantia / Ada.

1. Created and joined as two humans. Manually completed all six snake-order claims;
   both clients saw scarcity, public announcements, the reveal and the same calendar.
2. Drafted Aurelia oil/farmland/port and Verdantia gas/iron/uranium. Normal simulation
   produced reciprocal needs. Aurelia's iron briefing named Verdantia's real surplus.
3. Requested and joined a bilateral meeting from the briefing. Sent private chat,
   proposed, countered, edited the terms, accepted and signed revision four.
4. Reloaded Verdantia after Morgan signed. The proposal, chat and first signature
   survived. Ada signed; both clients displayed the ratified record. Treasury rose
   by exactly the agreed $0.8B and iron moved immediately, with recurring food/iron
   supply over three years. Aurelia's iron briefing subsequently resolved.
5. Used development controls to trigger a flood. Inspected the damaged region,
   returned to the same briefing, funded $1.8B plus 2.4 iron, and revisited persistent
   reconstruction. Approved a business factory opportunity and its delayed output.
6. Opened Verdantia's public World profile and active trade route, then visited its
   actual landscape. Tested the phone Office, correspondence, terms editor and signing.
7. Advanced to the final month using development controls. The normal next tick
   produced the same ranking on both clients (Verdantia 486, Aurelia 481). Host rematch
   returned both seats to the lobby and a fresh draft.

The crisis and browser ending were deliberately accelerated test cases, not a claim
of a full 45-minute human playthrough. Four-to-eight-person social pacing, bargaining
and balance still need a sustained session with friends before deployment.

## Preview artifacts

- [Office](office-preview.jpg)
- [Signed bilateral meeting](boardroom-preview.jpg)
- [Phone treaty](mobile-treaty-preview.jpg)
- [Phone Office](mobile-office-preview.jpg)

Original environment asset directions are recorded in [art direction](art-direction.md).
No deployment was performed.
