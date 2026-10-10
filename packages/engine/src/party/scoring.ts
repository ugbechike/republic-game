import { BASE_VALUES, PARTY_RULES, type Inventory, type PartyMatch, type PartyPlayer } from '@republic/contracts';
import { clamp } from '../helpers';
export function value(bundle: Inventory, values = BASE_VALUES) {
  return Object.entries(bundle).reduce((n, [a, q]) => n + q * values[a as keyof Inventory], 0);
}
function append(p: PartyPlayer, id: string, at: number, reason: string) {
  const support = Math.round(clamp(p.supportBase - p.bargainingPenalty) * 10) / 10;
  const influence = Math.round(clamp(p.influenceBase - p.weaknessPenalty) * 10) / 10;
  p.ledger.push({ id, at, support: support - p.support, influence: influence - p.influence, reason });
  p.support = support;
  p.influence = influence;
}
export function score(p: PartyPlayer, id: string, at: number, support: number, influence: number, reason: string) {
  if (p.ledger.some((e) => e.id === id)) return;
  p.supportBase += support;
  p.influenceBase += influence;
  append(p, id, at, reason);
}
export function reconcileBargaining(p: PartyPlayer, id: string, at: number) {
  const deficit = Math.max(0, -p.tradeBalance - p.strategicCredit);
  p.bargainingPenalty = deficit * PARTY_RULES.giveawayRate;
  p.weaknessPenalty = Math.max(0, deficit - PARTY_RULES.weaknessThreshold) * PARTY_RULES.weaknessRate;
  append(
    p,
    id,
    at,
    deficit
      ? `Net uncompensated exports: ${deficit.toFixed(1)} reference Credits. National assets need protection.`
      : 'Compensation and fulfilled strategic benefits cover your exports.',
  );
}
export function finishScores(m: PartyMatch) {
  m.results = m.players
    .map((p) => ({
      id: p.id,
      name: p.name,
      emblem: p.emblem,
      support: p.support,
      influence: p.influence,
      legacy:
        Math.round((p.support * PARTY_RULES.supportWeight + p.influence * PARTY_RULES.influenceWeight) * 100) / 100,
    }))
    .sort(
      (a, b) => b.legacy - a.legacy || b.support - a.support || b.influence - a.influence || a.id.localeCompare(b.id),
    );
  const supplier = [...m.players].sort((a, b) => b.supplied - a.supplied)[0];
  if (supplier?.supplied)
    m.awards.push({
      title: 'Most Reliable Ally',
      player: supplier.name,
      reason: `${supplier.supplied} original resource units used to fulfill another nation's needs`,
    });
  const gift = [...m.players].sort((a, b) => b.bargainingPenalty - a.bargainingPenalty)[0];
  if (gift?.bargainingPenalty)
    m.awards.push({
      title: 'Biggest Giveaway',
      player: gift.name,
      reason: `${(gift.bargainingPenalty / PARTY_RULES.giveawayRate).toFixed(1)} reference Credits exported without compensation or fulfilled strategic benefit`,
    });
}
