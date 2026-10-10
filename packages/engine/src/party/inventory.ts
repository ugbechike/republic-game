import { ASSETS, type Inventory, type PartyPlayer, type StockLot, type Requirement } from '@republic/contracts';
import { requireThat } from '../helpers';
export function hasInventory(p: PartyPlayer, bundle: Inventory) {
  return ASSETS.every((a) => p.inventory[a] >= bundle[a]);
}
export function subtract(p: PartyPlayer, bundle: Inventory) {
  requireThat(hasInventory(p, bundle), `${p.name} does not have the available assets. Review the terms.`);
  ASSETS.forEach((a) => (p.inventory[a] -= bundle[a]));
}
export function add(p: PartyPlayer, bundle: Inventory) {
  ASSETS.forEach((a) => (p.inventory[a] += bundle[a]));
}
export function takeLots(p: PartyPlayer, bundle: Inventory): StockLot[] {
  const out: StockLot[] = [];
  ASSETS.forEach((asset) => {
    let left = bundle[asset];
    for (const lot of p.lots)
      if (lot.asset === asset && left > 0) {
        const amount = Math.min(left, lot.amount);
        left -= amount;
        lot.amount -= amount;
        if (amount) out.push({ asset, amount, origin: lot.origin });
      }
    if (left) out.push({ asset, amount: left, origin: p.id });
  });
  p.lots = p.lots.filter((l) => l.amount > 0);
  return out;
}
export function requirementBundle(p: PartyPlayer, requirements: Requirement[]): Inventory | undefined {
  const result = Object.fromEntries(ASSETS.map((a) => [a, 0])) as Inventory;
  for (const r of requirements) {
    let left = r.amount;
    for (const a of r.assets) {
      const n = Math.min(left, p.inventory[a] - result[a]);
      result[a] += n;
      left -= n;
    }
    if (left) return;
  }
  return result;
}
