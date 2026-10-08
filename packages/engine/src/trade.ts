import type { Action, Bundle, Deal, Republic, Room } from '@republic/contracts';
import { clamp, notice, other, requireThat, uid } from './helpers';
const canPay = (r: Republic, b: Bundle) => r.metrics.treasury >= b.money / 12 && r.stocks[b.resource] >= b.amount / 12;
function transfer(from: Republic, to: Republic, b: Bundle) {
  from.metrics.treasury -= b.money / 12;
  to.metrics.treasury += b.money / 12;
  from.stocks[b.resource] -= b.amount / 12;
  to.stocks[b.resource] += b.amount / 12;
}
export function delivery(room: Room, d: Deal): boolean {
  const from = room.republics.find((r) => r.id === d.from)!,
    to = room.republics.find((r) => r.id === d.to)!;
  if (!canPay(from, d.offer) || !canPay(to, d.want)) return false;
  transfer(from, to, d.offer);
  transfer(to, from, d.want);
  from.stats.deliveries++;
  to.stats.deliveries++;
  from.influence = clamp(from.influence + 0.08);
  to.influence = clamp(to.influence + 0.08);
  return true;
}
export function tradeAction(room: Room, me: Republic, a: Action): boolean {
  if (a.type === 'trade') {
    const target = other(room, me, a.to);
    requireThat(
      !room.sanctions.some(
        (s) =>
          s.ends > room.month && ((s.from === me.id && s.to === target.id) || (s.to === me.id && s.from === target.id)),
      ),
      'Sanctions block bilateral trade',
    );
    requireThat(a.offer.money + a.offer.amount + a.want.money + a.want.amount > 0, 'Offer money or resources');
    requireThat(
      room.deals.filter((d) => d.status === 'pending' && d.from === me.id).length < 8,
      'Resolve your outstanding offers first',
    );
    if (a.counter) {
      const prior = room.deals.find((d) => d.id === a.counter);
      requireThat(
        prior && prior.to === me.id && prior.from === a.to && prior.status === 'pending',
        'Counteroffer no longer available',
      );
      prior.status = 'rejected';
    }
    room.deals.push({
      id: uid(room),
      from: me.id,
      to: target.id,
      offer: a.offer,
      want: a.want,
      years: a.years,
      status: 'pending',
      ends: 0,
      created: room.month,
    });
    notice(room, `${me.name} proposes ${a.counter ? 'a counteroffer' : 'a trade agreement'} to ${target.name}.`, [
      me.id,
      target.id,
    ]);
    return true;
  }
  if (a.type === 'dealResponse') {
    const d = room.deals.find((d) => d.id === a.id);
    requireThat(d && d.to === me.id && d.status === 'pending', 'This offer is no longer available');
    if (!a.accept) {
      d.status = 'rejected';
      notice(room, `${me.name} declined a trade offer.`, [d.from, d.to]);
      return true;
    }
    requireThat(
      !room.sanctions.some(
        (s) => s.ends > room.month && [d.from, d.to].includes(s.from) && [d.from, d.to].includes(s.to),
      ),
      'Sanctions block this agreement',
    );
    requireThat(delivery(room, d), 'Both parties must afford the first monthly delivery');
    d.status = 'active';
    d.ends = room.month + d.years * 12;
    notice(room, `${me.name} signed a ${d.years}-year trade agreement.`, [d.from, d.to]);
    return true;
  }
  if (a.type === 'breakDeal') {
    const d = room.deals.find((d) => d.id === a.id);
    requireThat(d && [d.from, d.to].includes(me.id) && d.status === 'active', 'Active agreement not found');
    d.status = 'broken';
    me.reputation = clamp(me.reputation - 12);
    me.influence = clamp(me.influence - 4);
    me.metrics.gdp *= 0.99;
    notice(room, `${me.name} broke a trade agreement. Its diplomatic reputation has fallen.`);
    return true;
  }
  return false;
}
export function tradeTick(room: Room) {
  for (const d of room.deals) {
    if (d.status === 'pending' && room.month >= d.created + 12) d.status = 'rejected';
    if (d.status !== 'active') continue;
    if (room.month >= d.ends) {
      d.status = 'completed';
      notice(room, 'A trade agreement has completed its term.', [d.from, d.to]);
      continue;
    }
    const blocked = room.sanctions.some(
      (s) => s.ends > room.month && [d.from, d.to].includes(s.from) && [d.from, d.to].includes(s.to),
    );
    if (blocked || !delivery(room, d)) {
      d.status = 'broken';
      for (const id of [d.from, d.to]) {
        const r = room.republics.find((r) => r.id === id)!;
        r.metrics.gdp *= 0.99;
        if (!canPay(r, id === d.from ? d.offer : d.want)) r.reputation = clamp(r.reputation - 8);
      }
      notice(room, 'A trade agreement collapsed: sanctions or insufficient reserves interrupted delivery.', [
        d.from,
        d.to,
      ]);
    }
  }
}
