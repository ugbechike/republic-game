# The Canal Crisis — active V0 rules

**Two-player update:** see [the connected gameplay rules](connected-loop-verification.md) for
prepared opening offers, explicit shipping, maintenance, emergency orders and host early ending.
These replace the two-player midpoint response described in the original baseline below.
The baseline remains applicable to 3–6-player games.

## A five-minute presidency

2–6 human players create fictional Republics. The host deals unique roles randomly from the
count-specific deck. Reveal lasts at most 20 seconds; everyone ready starts sooner. Then the
server runs exactly five minutes. Disconnections and server downtime do not extend play.
There is no elimination. At 2:30 one seeded shared twist appears. At 5:00 actions stop and
results freeze. Setup and role reveal do not consume the five minutes.

## Roles and obligations

Everyone starts with 8 Credits, 50 Support and 0 Influence. Oil receives 14 oil units;
other roles receive 8 units of their controlled resource. Inventories never regenerate.
The deck contains the first N roles below; assignments are shuffled.

| Role | Controls | Primary national requirement |
| --- | --- | --- |
| Oil | Oil | 3 oil + 3 passage/shipping (may mix routes) |
| Canal | Passage | 2 oil; add 1 shipping at 3+ players; add 1 protection at 4+ (repairs also valid at 6) |
| Shipping | Shipping capacity | 2 oil + 1 passage |
| Security | Protection | 1 oil + 1 food at 5+ players, otherwise 1 passage |
| Agriculture | Food | 1 oil + 1 shipping |
| Engineering | Repairs | 1 oil + 1 passage |

Fulfill consumes the complete required bundle from available inventory. Assets reserved in
agreements cannot be used. Primary fulfillment before 4:00 earns +32 Support. Missing 4:00
costs 18 Support once; late fulfillment restores 18. Instead, once per round, spend 4 available
Credits on neutral relief for +12 Support and no diplomatic delivery Influence. A deadline
penalty already incurred is not erased by relief. This prevents one refusing partner from
freezing another player's progress, but negotiating is the stronger outcome.

Unused assets expire with the round and have no direct final score. National benefits and
reliable delivery are worth more than hoarding or clicking through many contracts.

## Private meetings and binding terms

Call an online President; they may join or decline. Calls expire after 60 seconds. Chat and
spoken promises are nonbinding and never directly affect score. Both participants can edit
a shared table while it is open. Every edit increments the revision.

Propose reserves your side. Accept reserves the counterparty's side. Both confirm and sign
the immutable summary. Counter/reopen releases reservations and clears signatures; rejection
or leaving releases unsigned reservations. A proposal expires 45 seconds after proposal,
including the signature window. Stale revisions fail. No player can spend an escrowed asset twice.

Delivery is immediate, or 15/30 seconds after the second signature. Delayed transfers are
fully funded in escrow, not promises backed by future income. They must mature by 5:00.
Once signed they cannot be cancelled; delivery occurs exactly once even if players disconnect.
At game end due signed deliveries settle before results; unsigned reservations return.
No empty or identical exchanges, and no same asset on both sides of one agreement.

## Adviser and bargaining

Base reference values: Credits 1, oil 3, passage 3, shipping 3, protection 4, food 3, repairs 4.
World publishes the current reference values. The deterministic adviser values both sides:
more than 25% imbalance plus 1 Credit yields Weak/Excellent; otherwise Fair. Incoming needed
units can justify a discount (up to 3 reference Credits per useful unit), labeled Strategically
Justified. Scheduled delivery is Uncertain because timing matters, even though escrow guarantees
execution. Reasons explain values, national opportunity cost and delay. The signed evaluation
is preserved; a later twist does not rewrite the decision at signing.

Actual bargaining score tracks cumulative received base value minus exported base value.
Consumed foreign supplies that fulfill a real need add strategic credit (up to 3 per unit).
Uncompensated exports = max(0, exported − received − realized strategic credit).
Support penalty = 1.5 × uncompensated exports. Influence penalty = 0.5 × max(0, exports deficit − 6).
The penalty updates cumulatively; restoring assets recovers previous loss, never grants a new
bonus. Scores use stable base values so crisis price changes cannot create wash-trade rewards.
Current crisis values inform the adviser and negotiations; score reconciliation stays stable.

## Reliable delivery and anti-farming

Original-supplier stock lots follow assets through transfers. Influence is awarded only when
another Republic actually consumes those assets to fulfill an obligation. Reselling a supply
cannot steal its original supplier's credit. Expected role demand normalizes delivery rewards,
capped at 24 Influence per player per match. Credits do not earn supply Influence. Repeated
signatures, duplicate requests, split deals, chat, gifts or circular trades earn no extra points.
Both parties can benefit: one fulfills a national goal and the other proves reliable delivery.

Underlying score totals remain separate from displayed bounds, preventing clamp-and-refund
farming. Displayed Support/Influence are rounded to tenths and clamped to 0–100. Every change
has an idempotent ledger entry showing its actual displayed delta and reason.

## One world twist

At 2:30, the seeded variant is announced once:

- Security incident: protection value 6, shipping 4; emergency escort demand.
- Machinery failure: repairs value 6, passage 4; emergency engineering demand.
- Shipping disruption: passage value 5, oil 4; emergency canal transit demand.

Each President gets one optional response requiring 2 foreign-controlled supply units plus
2 Credits. The scenario selects present partners and never requests the player's own controlled
asset; Oil can use passage/shipping, other roles can fall back to oil when the authored partner
is absent. This optional objective earns +8 Support/+4 Influence before the ending; ignoring it
has no additional penalty. Supplies remain scarce, so not every player is guaranteed to fulfill
both objectives. Existing inventory, completed deliveries and signed escrow remain valid.

## Results and rematch

Legacy = 0.70 × bounded Support + 0.30 × bounded Influence, rounded to two decimals internally.
Ties break by higher Support, then higher Influence, then ascending stable President ID.
The UI displays Legacy to one decimal. Actual-event awards include Most Reliable Ally (original
units consumed abroad) and Biggest Giveaway (remaining uncompensated exports), only when earned.
Why These Scores exposes the private ledger and public event recap.

Host Play Again retains seats and the room code, clears all gameplay and re-deals randomly.
Random shuffling may give someone the same role again. Old match actions cannot affect the new round.
