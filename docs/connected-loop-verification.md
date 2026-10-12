# Connected gameplay and early ending — 2026-10-11

## Rules added

The two-player opening is a server-prepared 2 Oil / 3 Canal Passage offer. Choosing Negotiate
reserves the caller's offer and sends a private call; answering exposes an actionable proposal.
Counters release escrow and open the editor. General World/Meetings calls remain freeform.
Both signatures remain necessary. The Canal Authority automatically consumes its two required
Oil units and earns national-need consequences when an actual delivery satisfies that need.

Oil must explicitly choose **Ship Oil**. The first shipment consumes 3 Oil and 3 route units,
earns 6 Credits and fulfills the primary objective. It does not complete just by receiving passage.
The existing fulfill intent routes shipment needs through the same validation, preventing bypasses.

Maintenance opens after that shipment, or at the 60-second checkpoint if players stall. Canal can:

- Pay 4 Credits: keep the route open, +6 Support / +4 Influence.
- Request assistance: prepared offer of 2 passage for 4 Credits; negotiate normally, then fund repairs.
- Restrict passage: save Credits, lose 4 Support, suspend shipment use for 30 seconds, then reopen.

An unanswered maintenance decision causes the same safe suspension after 45 seconds. The
emergency order follows primary resolution: 4 Oil + 2 passage, 10 Credits, +8 Support / +4 Influence.
It requires completed maintenance. Assets persist across events. Contracts may still transfer
passage during closure; the restriction blocks shipment execution, not ownership or signed delivery.
Two-player connected events replace the former unrelated midpoint twist; 3–6-player twists remain.
A single primary briefing is shown, with concise recent score/shipment feedback.

## Host and development controls

The shared Game menu is present in Office, Meetings and World. Non-hosts see only Leave game.
Host End Game requires the explicit “End this game for everyone?” confirmation. Cancel changes
nothing. The server authorizes host ownership, processes current-time consequences and immediately
freezes the round. Pending unsigned reservations return without transfer. Already signed future
agreements are fully funded, so their delivery is accelerated and honored once; previous settled
agreements are not replayed. Results say Ended Early. Rematch uses the same seats and fresh state.

Development hosts can Reset Match directly to a fresh lobby. Lobby duration is 3 or 5 minutes
only in development; production rejects reset and duration overrides. Production host End Game
is permitted. The normal match stays five minutes. No deployment occurred.

## Observed browser rehearsal

World 8W5G2; independent localhost and 127.0.0.1 sessions:

1. Solara was Canal, Kanto was Oil; both saw their real stocks and objectives.
2. Kanto chose Negotiate Passage. Solara answered a prepared 2 Oil / 3 passage proposal.
3. Solara countered to 3 Oil / 3 passage; Kanto accepted; both signed.
4. Canal fuel was consumed automatically, earning Support. Oil still needed to authorize shipment.
5. Kanto selected Ship Oil: 3 Oil and 3 passage consumed, Credits rose from 8 to 14.
6. Maintenance immediately offered funding, assistance and restriction; Kanto received the emergency order.
7. Solara requested assistance. Both signed 2 passage for 4 Credits. Solara funded repairs.
8. Kanto shipped the emergency order, ending with 20 Credits, 4 Oil, 90 Support and 28 Influence.
   Solara had 88 Support and 28 Influence. Host cancelled one end confirmation, then ended successfully.
   Both results agreed: Kanto 71.4 Legacy; Solara 70.0.
9. Rematch reset all state. Selected three-minute development mode and observed a 3:00 synchronized timer.
10. Another round ended from inside a meeting with an unsigned proposal: both clients returned to
    early results at 50 Support / 0 Influence; no signature or transfer was fabricated.
11. Advanced a fresh round by 60 development seconds to activate maintenance, then ended from World.
    Both clients left the game with current standings; the pending event did not later penalize them.
12. At 390×844, inspected the prepared table, accepted terms and verified the signing actions were
    above the fixed navigation. The guest's session menu offered only Leave game.
13. Reset Match from a live boardroom returned both seats to a fresh same-code lobby with normal
    five-minute duration, no roles and no old proposal.

Screenshots: [completed early results](connected-early-results.jpg), [mobile signing](connected-mobile-meeting.jpg).

## Automated coverage

82 tests across 23 files pass, plus TypeScript, the 250-line source limit and production build.
New tests cover the full connected shipment chain, repairs/assistance, temporary restrictions,
checkpoint activation, duplicate shipments, production host authorization, unsigned cancellation
at requested/proposed/accepted stages, signed future delivery at early ending, frozen deadlines,
rematch reset and production denial of reset/duration. Existing transport/persistence, 3/6-player
network and scoring/anti-farming regressions remain green. Wash-trade tests isolate trades from
legitimate automatic national consumption, which intentionally changes stocks and scores.

Human party testing is still needed to tune decision windows and assess how often people counter.
