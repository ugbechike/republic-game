import { expect, it } from 'vitest';
import { draftSchema, TRADE_RESOURCES, type Draft } from '@republic/contracts';
import { createRepublic, createRoom } from './create';
import { act } from './actions';
import { resourceEconomy } from './resource-economy';
import { resourceEvents } from './resource-events';
import { migrateRoom } from './migrate';
const draft: Draft = { name: 'Solara', leader: 'John', flag: '☀️', resources: ['oil', 'coastline', 'agriculture'] };
const options = { duration: 60 as const, maxPlayers: 6, difficulty: 'developing' as const };
it('allows five points and rejects six or duplicate selections', () => {
  expect(draftSchema.safeParse(draft).success).toBe(true);
  expect(draftSchema.safeParse({ ...draft, resources: ['uranium', 'rareEarths'] }).success).toBe(false);
  expect(draftSchema.safeParse({ ...draft, resources: ['oil', 'oil'] }).success).toBe(false);
  expect(TRADE_RESOURCES).not.toContain('coastline');
});
it('requires two human seats even when test delegates are present', () => {
  const room = createRoom('ABCDE', 'host', 'hash', draft, options);
  act(room, 'host', { type: 'debug', kind: 'bot' }, true);
  expect(() => act(room, 'host', { type: 'start' })).toThrow('2 human');
  room.players.push({ ...room.players[0], id: 'guest' });
  room.republics.push(createRepublic('guest', { ...draft, name: 'Kantara' }, false));
  act(room, 'host', { type: 'start' });
  expect(room.phase).toBe('playing');
});
it('honors a configured human minimum', () => {
  const room = createRoom('ABCDE', 'host', 'hash', draft, options);
  room.minPlayers = 3;
  room.players.push({ ...room.players[0], id: 'guest' });
  room.republics.push(createRepublic('guest', draft, false));
  expect(() => act(room, 'host', { type: 'start' })).toThrow('3 human');
});
it('halves complete resource output for six months and then restores production', () => {
  const room = createRoom('ABCDE', 'host', 'hash', draft, options),
    healthy = room.republics[0];
  const damaged = structuredClone(healthy);
  healthy.stocks.oil = damaged.stocks.oil = 0;
  damaged.disruptions = [{ resource: 'oil', ends: 6 }];
  resourceEconomy(room, healthy);
  resourceEconomy(room, damaged);
  expect(damaged.stocks.oil).toBeCloseTo(healthy.stocks.oil / 2);
  room.month = 6;
  healthy.stocks.oil = damaged.stocks.oil = 0;
  resourceEconomy(room, healthy);
  resourceEconomy(room, damaged);
  expect(damaged.stocks.oil).toBeCloseTo(healthy.stocks.oil);
});
it('makes geography and uranium consequential while limiting risks to selected resources', () => {
  const base = createRepublic('a', { ...draft, resources: ['iron'] }, false);
  const coast = createRepublic('a', { ...draft, resources: ['coastline', 'rivers'] }, false);
  expect(coast.metrics.gdp).toBeGreaterThan(base.metrics.gdp);
  expect(coast.metrics.energy).toBeGreaterThan(base.metrics.energy);
  expect(coast.stocks.coastline).toBe(0);
  expect(resourceEvents(coast).every((e) => ['coastline', 'rivers'].includes(e.resource!))).toBe(true);
  const uranium = createRepublic('a', { ...draft, resources: ['uranium'] }, false);
  expect(uranium.metrics.debt).toBeGreaterThan(base.metrics.debt);
  expect(uranium.influence).toBeGreaterThan(base.influence);
});
it('migrates saved worlds without replacing identities or existing holdings', () => {
  const room = createRoom('ABCDE', 'host', 'hash', draft, options);
  delete (room as Partial<typeof room>).minPlayers;
  delete (room.republics[0].stocks as Partial<(typeof room.republics)[0]['stocks']>).uranium;
  migrateRoom(room, 2);
  expect(room.minPlayers).toBe(2);
  expect(room.republics[0].id).toBe('host');
  expect(room.republics[0].stocks.oil).toBe(28);
  expect(room.republics[0].stocks.uranium).toBe(0);
});
