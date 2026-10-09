import type { Action, Bundle, Deal, Republic, Room } from '@republic/contracts';
import { clamp, notice, other, requireThat, uid } from './helpers';
export { delivery } from './delivery';
import { delivery, packageDue, canDeliver, hasRecurring } from './delivery';
import { embargo } from './embargo';
export function tradeAction(room: Room, me: Republic, a: Action): boolean {
  if (a.type === 'trade') {
    const target = other(room, me, a.to);
    const resources = [
      ...(a.offer.amount ? [a.offer.resource] : []),
      ...(a.want.amount ? [a.want.resource] : []),
      ...(a.offer.items ?? []).filter((i) => i.amount > 0).map((i) => i.resource),
      ...(a.want.items ?? []).filter((i) => i.amount > 0).map((i) => i.resource),
    ];
    requireThat(
      !embargo(room, me.id, target.id, resources, a.offer.money + a.want.money > 0),
      'Sanctions block the proposed exchange',
    );
    requireThat(
      a.offer.money +
        a.offer.amount +
        a.want.money +
        a.want.amount +
        (a.offer.items ?? []).reduce((n, i) => n + i.amount, 0) +
        (a.want.items ?? []).reduce((n, i) => n + i.amount, 0) >
        0,
      'Offer money or resources',
    );
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
      startInMonths: a.startInMonths,
      reason: a.reason,
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
      delivery(room, { ...d, created: room.month }, true),
      'Both parties must afford all immediate items and the first scheduled delivery; sanctions may block exchange',
    );
    d.status = hasRecurring(d.offer) || hasRecurring(d.want) ? 'active' : 'completed';
    d.created = room.month;
    d.ends = room.month + (d.startInMonths ?? 0) + d.years * 12;
    notice(
      room,
      `${me.name} signed ${d.status === 'completed' ? 'an immediate exchange' : `a ${d.years}-year trade agreement`}.`,
      [d.from, d.to],
    );
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
    if (!delivery(room, d)) {
      d.status = 'broken';
      for (const id of [d.from, d.to]) {
        const r = room.republics.find((r) => r.id === id)!;
        r.metrics.gdp *= 0.99;
        if (!canDeliver(r, packageDue(id === d.from ? d.offer : d.want, false))) r.reputation = clamp(r.reputation - 8);
      }
      notice(room, 'A trade agreement collapsed: sanctions or insufficient reserves interrupted delivery.', [
        d.from,
        d.to,
      ]);
    }
  }
}
