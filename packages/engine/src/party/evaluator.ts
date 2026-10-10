import {
  ASSETS,
  BASE_VALUES,
  PARTY_RULES,
  type PartyMatch,
  type PartyPlayer,
  type Inventory,
  type DealEvaluation,
} from '@republic/contracts';
import { value } from './scoring';
export function referenceValues(m: PartyMatch): Inventory {
  const values = { ...BASE_VALUES };
  if (m.twist) {
    if (m.twistKind === 'security') {
      values.protection = 6;
      values.shipping = 4;
    }
    if (m.twistKind === 'machinery') {
      values.repairs = 6;
      values.passage = 4;
    }
    if (m.twistKind === 'shipping') {
      values.passage = 5;
      values.oil = 4;
    }
  }
  return values;
}
export function usefulUnits(p: PartyPlayer, bundle: Inventory) {
  return p.needs
    .filter((n) => n.status === 'open' || n.status === 'late')
    .reduce(
      (sum, n) =>
        sum +
        n.requirements.reduce(
          (v, r) =>
            v +
            Math.min(
              r.amount,
              r.assets.reduce((q, a) => q + bundle[a], 0),
            ),
          0,
        ),
      0,
    );
}
export function evaluate(
  m: PartyMatch,
  p: PartyPlayer,
  outgoing: Inventory,
  incoming: Inventory,
  delay: number,
): DealEvaluation {
  const prices = referenceValues(m),
    offered = value(outgoing, prices),
    received = value(incoming, prices);
  const strategic = usefulUnits(p, incoming),
    needCost = usefulUnits(p, outgoing);
  const deficit = Math.max(0, -(p.tradeBalance + value(incoming) - value(outgoing)) - p.strategicCredit);
  const projectedSupport = -(deficit * PARTY_RULES.giveawayRate - p.bargainingPenalty);
  let grade: DealEvaluation['grade'] =
    offered > received * 1.25 + 1 ? 'Weak' : received > offered * 1.25 + 1 ? 'Excellent' : 'Fair';
  const reasons = [`Offer: ${offered} Credits of reference value. Receive: ${received}.`];
  if (strategic) {
    reasons.push(
      `${strategic} incoming units match national requirements. Fulfill the briefing to realize that benefit.`,
    );
    if (grade === 'Weak' && offered <= received + strategic * PARTY_RULES.strategicUnit)
      grade = 'Strategically Justified';
  }
  if (needCost) reasons.push(`You are offering ${needCost} units your own national objectives require.`);
  if (delay) {
    grade = 'Uncertain';
    reasons.push(`Escrow guarantees delivery in ${delay}s; check your national deadline.`);
  }
  if (grade === 'Weak' && !strategic)
    reasons.push('Uncompensated exports reduce Support; large net dependency can reduce Influence.');
  return { grade, offered, received, reasons: reasons.slice(0, 3), projectedSupport };
}
export function validExchange(a: Inventory, b: Inventory) {
  return ASSETS.some((k) => a[k] !== b[k]) && ASSETS.every((k) => !(a[k] && b[k]));
}
