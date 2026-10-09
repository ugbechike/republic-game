import { expect, it } from 'vitest';
import { pressureWorld } from './pressure-fixture';
import { act } from './actions';
import { tick } from './tick';
import { diplomacyTick } from './diplomacy';
import { worldEvent } from './world-director';
import { resourceEconomy } from './resource-economy';
import { tradeTick } from './trade';
const empty = { money: 0, resource: 'oil' as const, amount: 0, moneyTiming: 'now' as const };
it('enforces bank conditions and prevents bypass through pending policies', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  r.metrics.treasury = 1;
  r.pendingPolicies = [
    { key: 'corporateTax', value: 0, month: 1 },
    { key: 'infrastructure', value: 20, month: 1 },
  ];
  act(room, 'a', { type: 'institution', kind: 'emergency' });
  expect(r.metrics.treasury).toBe(6);
  expect(r.metrics.debt).toBeCloseTo(17.35);
  expect(r.pendingPolicies).toHaveLength(0);
  expect(() => act(room, 'a', { type: 'policy', key: 'corporateTax', value: 22 })).toThrow('floor');
  expect(() => act(room, 'a', { type: 'policy', key: 'infrastructure', value: 8 })).toThrow('cap');
  const stages = r.regions[0].plots.map((p) => p.stage);
  for (let n = 0; n < 6; n++) tick(room);
  expect(r.regions[0].plots.map((p) => p.stage)).toEqual(stages);
  expect(() => act(room, 'a', { type: 'institution', kind: 'development' })).toThrow('unavailable');
});
it('defaults a negotiated bullet loan at maturity and tightens future credit', () => {
  const room = pressureWorld(),
    r = room.republics[1];
  act(room, 'a', { type: 'loan', to: 'b', amount: 3, repayment: 4, term: 12, mode: 'bullet' });
  act(room, 'b', { type: 'loanResponse', id: room.loans[0].id, accept: true });
  room.month = 11;
  diplomacyTick(room);
  expect(room.loans[0].remaining).toBe(4);
  r.metrics.treasury = 0;
  room.month = 12;
  diplomacyTick(room);
  expect(room.loans[0].status).toBe('defaulted');
  expect(r.credit).toBeLessThan(70);
  expect(r.relations?.a).toBe(-15);
});
it('keeps mixed immediate and future deliveries atomic and delivers immediate items only once', () => {
  const room = pressureWorld(),
    [a, b] = room.republics;
  const before = b.stocks.gas;
  act(room, 'a', {
    type: 'trade',
    to: 'b',
    offer: { ...empty, money: 1 },
    want: {
      ...empty,
      items: [
        { resource: 'gas', amount: 2, timing: 'now' },
        { resource: 'gas', amount: 12, timing: 'annual' },
      ],
    },
    years: 1,
    startInMonths: 3,
  });
  act(room, 'b', { type: 'dealResponse', id: room.deals[0].id, accept: true });
  expect(b.stocks.gas).toBe(before - 2);
  room.month = 1;
  tradeTick(room);
  expect(b.stocks.gas).toBe(before - 2);
  room.month = 3;
  tradeTick(room);
  expect(b.stocks.gas).toBe(before - 3);
  expect(a.metrics.treasury).toBe(11);
});
it('does not transfer any part of an unaffordable multi-resource acceptance', () => {
  const room = pressureWorld(),
    [a, b] = room.republics;
  act(room, 'a', {
    type: 'trade',
    to: 'b',
    offer: { ...empty, money: 2 },
    want: {
      ...empty,
      items: [
        { resource: 'gas', amount: 2, timing: 'now' },
        { resource: 'gas', amount: 60, timing: 'now' },
      ],
    },
    years: 1,
  });
  const cash = a.metrics.treasury,
    gas = b.stocks.gas;
  expect(() => act(room, 'b', { type: 'dealResponse', id: room.deals[0].id, accept: true })).toThrow('afford');
  expect(a.metrics.treasury).toBe(cash);
  expect(b.stocks.gas).toBe(gas);
});
it('makes resource embargoes bilateral while leaving unrelated resources negotiable', () => {
  const room = pressureWorld();
  act(room, 'a', { type: 'sanction', to: 'b', kind: 'resource', resource: 'gas' });
  expect(() =>
    act(room, 'b', {
      type: 'trade',
      to: 'a',
      offer: { ...empty, items: [{ resource: 'gas', amount: 1, timing: 'now' }] },
      want: empty,
      years: 1,
    }),
  ).toThrow('Sanctions');
  act(room, 'b', {
    type: 'trade',
    to: 'a',
    offer: { ...empty, items: [{ resource: 'iron', amount: 1, timing: 'now' }] },
    want: empty,
    years: 1,
  });
  expect(room.deals).toHaveLength(1);
});
it('world energy crises reduce fuel output and increase producer external prices', () => {
  const room = pressureWorld(),
    normal = structuredClone(room);
  worldEvent(room, 'energy');
  const r = room.republics[0],
    n = normal.republics[0];
  r.stocks.oil = n.stocks.oil = 28;
  resourceEconomy(room, r);
  resourceEconomy(normal, n);
  expect(r.flows!.production!.oil).toBeCloseTo(n.flows!.production!.oil! * 0.75);
  expect(r.metrics.treasury).toBeGreaterThan(n.metrics.treasury);
});
it('allows abstention only after the discussion window', () => {
  const room = pressureWorld();
  room.vote = { id: 'v', title: 'Aid', kind: 'aid', target: 'a', ends: 12, opensAt: 30000, ballots: {} };
  expect(() => act(room, 'a', { type: 'vote', support: null })).toThrow('Discussion');
  room.activeMs = 30000;
  act(room, 'a', { type: 'vote', support: null });
  expect(room.vote.ballots.a).toBeNull();
  expect(() => act(room, 'a', { type: 'vote', support: true })).toThrow('already');
});
