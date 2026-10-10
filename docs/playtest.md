# Canal Crisis verification and playtest guide

## Automated validation — 2026-10-10

77 tests across 22 files; TypeScript and the 250-line source limit pass.
Party coverage includes:

- 100 seeded deals across 2–6 players; correct role sets, reveal readiness and five-minute duration.
- Every 2–6-player primary objective fulfilled through actual trades; independent neutral fallback.
- Every role has a foreign supplier for all three midpoint variants; twists preserve inventory.
- Shared terms, stale revisions, counters, two signatures, escrow, insufficient stock and atomic failure.
- Expiry, delayed settlement, exact cutoff, duplicate signatures, rematch match IDs and offline completion.
- Fair/Weak/Excellent/Strategically Justified/Uncertain evaluations, bounded scoring and exact ledger changes.
- Gift reversals, circular trades, split transfers, clamp/refund exploits and no reward for messages/no-ops.
- Persist/restart between signatures; serialized duplicate final signatures; production debug denial.
- Independent **three- and six-client HTTP/Socket.IO** sessions, real role-dependent trades and fulfillment,
  private projections, reconnect, synchronized deadlines, midpoint, identical results and clean rematch.
- Existing simulator and shared transport regression tests remain green.

Larger groups were verified over real network clients, not six simultaneous visual browser windows.
The production frontend build and formatter are also part of the final checks.

## Observed two-browser rehearsal

Separate storage origins: localhost:3000 and 127.0.0.1:3000. World **8W5G2**.
Solara / Morgan received Oil; Kanto / Ada received Canal.

1. Created and joined as two humans; random reveal showed actual stocks and reciprocal needs.
2. Readiness started synchronized five-minute clocks; no resource draft or simulator setup.
3. Solara called Kanto. Both entered the same private boardroom and exchanged chat.
4. Proposed 2 oil for 3 passage; Kanto countered to 3 oil for 3 passage. Adviser updated independently.
5. Solara accepted and signed. Reloaded Kanto between signatures; seat, deadline, chat, revision
   and first signature survived. Kanto signed; exactly one agreement delivered the actual assets.
6. Both fulfilled primary needs. Each showed 82 Support and 24 Influence; no points merely for signing.
7. The natural 2:30 machinery incident appeared with reachable foreign-supply needs.
8. At the natural 5:00 cutoff both showed identical results: 82 Support / 24 Influence / **64.6 Legacy**.
   The documented stable-ID tie-break ranked Kanto first. Same-room Play Again cleared gameplay.

## Mobile rematch and crisis response

Kanto ran at **390×844**, Solara at desktop width. Checked Office, terms editor, meeting actions,
sticky countdown, inventory, readable controls and fixed navigation.

- From the phone, requested a call and composed 3 passage for 3 oil with a **15-second delivery**.
- Both accepted and signed. Stocks left available inventory into escrow; the signed record first
  read “delivery secured in escrow,” then “assets delivered.” Both offices received the assets.
- Both fulfilled their primary obligations and reached 82/24 again.
- At the next natural midpoint, shipping disruption changed reference prices (passage 5, oil 4).
- The phone initiated another call and exchanged 2 passage for 2 oil. Adviser used the new prices.
- Both signed, returned to Office and fulfilled the optional response: **90 Support / 28 Influence**.
- Both devices finished the rematch at **71.4 Legacy** (90 Support / 28 Influence). The phone’s
  Why These Scores record showed the +32 primary, +24 delivery and +8/+4 crisis entries.
- A transient local socket disconnect blocked submission with a clear error, retained the local
  edited terms, reconnected, and allowed the proposal to be submitted. No partial action occurred.

Screenshots: [desktop Office](party-office.jpg), [phone Office](party-mobile-office.jpg),
[phone treaty editor](party-mobile-terms.jpg), [boardroom](party-meeting.jpg), [results](party-results.jpg).
The original source artwork is reused; no new external assets or infrastructure were added.

## Reproduce locally

Run `npm run dev`. Use separate browsers/profiles (or the two loopback origins above).
Create a game, join its code, deal, read the role cards and enter Office. For the two-role
scenario, exchange 3 oil for 3 passage, sign from both seats, and fulfill each primary need.
Negotiate again when the midpoint crisis arrives. Let five minutes elapse; compare results and rematch.

Also try: refuse a call, let an offer expire, counter after one signature, reserve too much,
refresh each participant, stay offline through the ending and submit an old revision.
World's development tools can accelerate time or force edge cases. Production rejects them.

## Human social playtest still needed

Run several five-minute rounds with 2, 3 and 6 friends before tuning or deployment. Record:

1. Did everyone understand their first need within 20 seconds?
2. How quickly did they begin talking to another President?
3. Were bargaining prices and Finance Adviser explanations understandable?
4. Did the fallback keep an uncooperative partner from blocking participation?
5. Did the midpoint create another conversation without overwhelming the table?
6. Were any roles consistently stronger or less interesting?
7. Did the final ledger explain the result, and did players want a rematch?

Automated checks establish mechanics; they cannot establish fun or competitive role balance.
No deployment was performed. Prior simulator history remains in [the previous overhaul record](presidential-overhaul.md).
