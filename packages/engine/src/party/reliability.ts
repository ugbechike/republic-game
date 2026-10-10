import { PARTY_RULES, ROLE_INFO, type PartyMatch, type PartyPlayer, type StockLot } from '@republic/contracts';
import { score } from './scoring';
export function rewardReliability(
  m: PartyMatch,
  recipient: PartyPlayer,
  lots: StockLot[],
  needId: string,
  now: number,
) {
  const contributions = new Map<string, number>();
  for (const lot of lots)
    if (lot.origin !== recipient.id && lot.asset !== 'credits')
      contributions.set(lot.origin, (contributions.get(lot.origin) ?? 0) + lot.amount);
  for (const [id, units] of contributions) {
    const supplier = m.players.find((p) => p.id === id);
    if (!supplier?.role) continue;
    const asset = ROLE_INFO[supplier.role].asset;
    const expected = m.players
      .filter((p) => p.id !== id)
      .reduce(
        (n, p) =>
          n +
          p.needs
            .filter((need) => !need.optional)
            .reduce(
              (v, need) =>
                v +
                need.requirements
                  .filter((r) => r.assets.includes(asset))
                  .reduce((s, r) => s + r.amount / r.assets.length, 0),
              0,
            ),
        0,
      );
    const reward = Math.min(
      PARTY_RULES.exportInfluence - supplier.deliveryInfluence,
      (units * PARTY_RULES.exportInfluence) / Math.max(1, expected),
    );
    supplier.supplied += units;
    supplier.deliveryInfluence += reward;
    score(
      supplier,
      `${needId}-${id}-reliable`,
      now,
      0,
      reward,
      `Reliable delivery: ${units} original units used by ${recipient.name}. Role-adjusted delivery influence is capped at ${PARTY_RULES.exportInfluence} per match.`,
    );
  }
}
