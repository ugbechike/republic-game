# Five-minute Canal Crisis migration

The active game becomes a server-timed, five-minute negotiation party game for 2–6 humans.

1. **Audit/migrate:** reuse secure sessions, room serialization, PostgreSQL snapshots,
   Socket.IO, shared transport, emblems and original Office/boardroom art. Add a versioned
   party match inside the existing room envelope so saved simulator rooms remain readable.
   Retire draft, city management, economic charts, policies and war from active routes.
2. **Two-player core:** Oil/Canal role deal, readiness reveal, immutable five-minute deadline,
   finite inventory, national obligations, escrowed offers, counters, two signatures, results.
3. **Fairness:** deterministic reference valuation, need-aware adviser, signed score ledger,
   net-transfer giveaway penalties and rewards only for actual one-time fulfilled needs.
4. **Variants:** coherent 3–6-player dependency graph, one midpoint twist, costly neutral
   fallback, deadline pressure and actual-event news. Disconnections never pause a match.
5. **Experience:** three destinations (Office/Meetings/World), short briefings, touch-first
   offer editor, atmospheric role reveal, transparent outcomes and same-room rematch.
6. **Verify:** pure rules, service persistence/races, 2/3/6-player paths, browser negotiation,
   reconnect, mobile, cutoff and rematch. Build/check before functional commits and push.

Legacy simulation modules remain isolated for saved-data compatibility and regression tests;
new actions cannot enter them. No deployment or new infrastructure is needed.
