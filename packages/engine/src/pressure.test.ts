import { expect, it } from 'vitest';
import { RESOURCE_COST, RESOURCES, TRADE_RESOURCES, type Draft, type Bundle } from '@republic/contracts';
import { createRepublic, createRoom } from './create';
import { tick } from './tick';
import { act } from './actions';
import { suppliers, makeBriefing, gameDirector } from './game-director';
import { demand } from './supply';
import { resourceEconomy } from './resource-economy';
import { ensureEconomy } from './economic-history';
import { view } from './view';
import { pressureWorld } from './pressure-fixture';
const empty: Bundle = { money: 0, resource: 'oil', amount: 0, moneyTiming: 'now' };
it('naturally creates reciprocal needs, negotiates a counteroffer, and recovers through supply', () => {
  const room = pressureWorld(),
    [a, b] = room.republics;
  for (let n = 0; n < 10; n++) tick(room);
  const need = a.briefings!.find((x) => x.kind === 'shortage' && x.resource === 'gas')!;
  expect(need).toBeDefined();
  expect(b.briefings!.some((x) => x.resource === 'agriculture' || x.resource === 'oil')).toBe(true);
  expect(a.economy!.supply.gas!.stage).toBeGreaterThan(0);
  expect(suppliers(room, 'gas', a.id)[0].id).toBe(b.id);
  const proposal = {
    type: 'trade' as const,
    to: 'b',
    offer: {
      ...empty,
      money: 1.2,
      items: [{ resource: 'agriculture' as const, amount: 18, timing: 'annual' as const }],
    },
    want: {
      ...empty,
      items: [
        { resource: 'gas' as const, amount: 6, timing: 'now' as const },
        { resource: 'gas' as const, amount: 12, timing: 'annual' as const },
      ],
    },
    years: 3,
  };
  act(room, 'a', proposal);
  const original = room.deals[0];
  act(room, 'b', {
    ...proposal,
    to: 'a',
    offer: proposal.want,
    want: { ...proposal.offer, money: 1.5 },
    counter: original.id,
  });
  expect(original.status).toBe('rejected');
  const before = b.metrics.treasury;
  act(room, 'a', { type: 'dealResponse', id: room.deals[1].id, accept: true });
  expect(b.metrics.treasury).toBeCloseTo(before + 1.5);
  expect(a.stocks.gas).toBeGreaterThan(6);
  for (let n = 0; n < 7; n++) tick(room);
  expect(a.economy!.supply.gas!.stage).toBe(0);
  expect(need.status).toBe('resolved');
  expect(a.economy!.timeline.some((p) => p.tradeBalance < 0)).toBe(true);
  expect(room.notices.some((n) => n.text.includes('secured Natural gas'))).toBe(true);
  expect(view(room, 'a', false).republics[1]).not.toHaveProperty('stocks');
});
it('no legal five-point selection produces all its essential requirements', () => {
  for (let mask = 1; mask < 1 << RESOURCES.length; mask++) {
    const resources = RESOURCES.filter((_, i) => mask & (1 << i));
    if (resources.reduce((n, k) => n + RESOURCE_COST[k], 0) > 5) continue;
    const room = pressureWorld(),
      r = createRepublic('test', { name: 'Test', leader: 'Test', flag: '☀️', resources }, false);
    for (const k of TRADE_RESOURCES) r.stocks[k] = 0;
    resourceEconomy(room, r);
    expect(TRADE_RESOURCES.some((k) => demand(r, k) > r.stocks[k])).toBe(true);
  }
});
it('paces advisers and gives delay and missed deadlines explicit consequences', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  tick(room);
  tick(room);
  const b = r.briefings![0],
    approval = r.metrics.approval;
  expect(b).toBeDefined();
  act(room, r.id, { type: 'briefing', id: b.id, choice: 'delay' });
  expect(r.metrics.approval).toBeCloseTo(approval - 1);
  expect(() => act(room, r.id, { type: 'briefing', id: b.id, choice: 'delay' })).toThrow('only once');
  for (let n = 0; n < 6; n++) tick(room);
  expect(r.briefings).toHaveLength(1);
  room.activeMs = b.dueAt;
  gameDirector(room);
  expect(b.status).toBe('expired');
  expect(r.economy!.causes.some((c) => c.reason.includes('deadline missed'))).toBe(true);
});
it('rejects unfunded reconstruction and spends exact resources on successful response', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  const b = makeBriefing(room, r, 'flood');
  r.stocks.iron = 1;
  expect(() => act(room, r.id, { type: 'briefing', id: b.id, choice: 'resolve' })).toThrow('required');
  r.stocks.iron = 3;
  const money = r.metrics.treasury;
  act(room, r.id, { type: 'briefing', id: b.id, choice: 'resolve' });
  expect(r.stocks.iron).toBeCloseTo(0.6);
  expect(r.metrics.treasury).toBeCloseTo(money - 1.8);
  expect(b.status).toBe('resolved');
});
it('keeps the same new starting baseline even for legacy difficulty inputs', () => {
  const draft: Draft = { name: 'Same', leader: 'Same', flag: '☀️', resources: ['iron'] };
  expect(createRepublic('a', draft, true).metrics).toEqual(createRepublic('b', draft, false).metrics);
});
it('restricts director controls to the development host', () => {
  const room = pressureWorld();
  expect(() => act(room, 'a', { type: 'directorDebug', kind: 'world' }, false)).toThrow('Development host');
  expect(() => act(room, 'b', { type: 'directorDebug', kind: 'world' }, true)).toThrow('Development host');
  act(room, 'a', { type: 'directorDebug', kind: 'world', crisis: 'energy' }, true);
  expect(room.worldCrisis?.kind).toBe('energy');
});
it('explains exact monthly metric deltas', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  for (let n = 0; n < 12; n++) tick(room);
  const before = { ...r.metrics };
  tick(room);
  ensureEconomy(r);
  for (const metric of ['gdp', 'approval', 'inflation', 'unemployment', 'debt'] as const)
    expect(r.economy!.causes.filter((c) => c.metric === metric).reduce((n, c) => n + c.amount, 0)).toBeCloseTo(
      r.metrics[metric] - before[metric],
    );
});
