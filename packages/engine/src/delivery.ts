import type { Bundle, Commodity, Deal, Republic, Room } from '@republic/contracts';
import { ensureEconomy } from './economic-history';
import { embargo } from './embargo';
import { clamp } from './helpers';
export function packageDue(b: Bundle, initial: boolean, annual = true) {
  const money = b.moneyTiming === 'now' ? (initial ? b.money : 0) : annual ? b.money / 12 : 0;
  const resources: Partial<Record<Commodity, number>> = {};
  for (const item of [{ resource: b.resource, amount: b.amount, timing: 'annual' as const }, ...(b.items ?? [])]) {
    const amount = item.timing === 'now' ? (initial ? item.amount : 0) : annual ? item.amount / 12 : 0;
    if (amount === 0) continue;
    resources[item.resource] = (resources[item.resource] ?? 0) + amount;
  }
  return { money, resources };
}
export function canDeliver(r: Republic, due: ReturnType<typeof packageDue>) {
  return (
    r.metrics.treasury + 1e-9 >= due.money &&
    Object.entries(due.resources).every(([k, v]) => (r.stocks[k as Commodity] ?? 0) + 1e-9 >= v)
  );
}
function transfer(from: Republic, to: Republic, due: ReturnType<typeof packageDue>) {
  ensureEconomy(from);
  ensureEconomy(to);
  from.metrics.treasury -= due.money;
  to.metrics.treasury += due.money;
  from.flows!.paid += due.money;
  to.flows!.received += due.money;
  for (const [k, amount] of Object.entries(due.resources) as [Commodity, number][]) {
    from.stocks[k] -= amount;
    to.stocks[k] += amount;
    from.flows!.exports[k] = (from.flows!.exports[k] ?? 0) + amount;
    to.flows!.imports[k] = (to.flows!.imports[k] ?? 0) + amount;
  }
}
export function delivery(room: Room, d: Deal, initial = false) {
  const from = room.republics.find((r) => r.id === d.from)!,
    to = room.republics.find((r) => r.id === d.to)!;
  const annual = room.month >= d.created + (d.startInMonths ?? 0),
    offer = packageDue(d.offer, initial, annual),
    want = packageDue(d.want, initial, annual);
  const resources = [...Object.keys(offer.resources), ...Object.keys(want.resources)] as Commodity[];
  if (
    embargo(room, d.from, d.to, resources, offer.money + want.money > 0) ||
    !canDeliver(from, offer) ||
    !canDeliver(to, want)
  )
    return false;
  if (
    offer.money +
      want.money +
      Object.values(offer.resources).reduce((n, v) => n + v, 0) +
      Object.values(want.resources).reduce((n, v) => n + v, 0) ===
    0
  )
    return true;
  transfer(from, to, offer);
  transfer(to, from, want);
  from.stats.deliveries++;
  to.stats.deliveries++;
  from.influence = clamp(from.influence + 0.08);
  to.influence = clamp(to.influence + 0.08);
  return true;
}
export function hasRecurring(b: Bundle) {
  return (
    (b.money > 0 && b.moneyTiming !== 'now') ||
    b.amount > 0 ||
    b.items?.some((i) => i.amount > 0 && i.timing === 'annual')
  );
}
