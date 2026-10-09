import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import type { Action, Room, Session } from '@republic/contracts';
import { Rooms } from './service';
it('persists both signatures, deduplicates the final request and continues to the normal game ending', async () => {
  const states = new Map<string, Room>();
  const store = {
    all: async () => [...states.values()],
    save: async (r: Room) => {
      states.set(r.code, structuredClone(r));
    },
    close: async () => {},
  };
  let service = new Rooms(store, true, () => {}, 2);
  const host = await service.create(
    { name: 'Aurelia', leader: 'Morgan', flag: '☀️', resources: [] },
    { duration: 45, maxPlayers: 2 },
  );
  const guest = await service.join(host.code, { name: 'Verdantia', leader: 'Ada', flag: '🌲', resources: [] });
  const send = (s: Session, action: Action) => service.action(s, { requestId: randomUUID(), action });
  await send(host, { type: 'start' });
  for (let n = 0; n < 7; n++) await service.clock(service.rooms.get(host.code)!.nextTick);
  expect(service.rooms.get(host.code)!.phase).toBe('playing');
  const balances = service.rooms.get(host.code)!.republics.map((r) => r.metrics.treasury);
  await send(host, { type: 'meetingRequest', to: guest.playerId, agenda: 'Emergency Aid' });
  const id = service.rooms.get(host.code)!.meetings![0].id;
  await send(guest, { type: 'meetingResponse', id, response: 'join' });
  const empty = { money: 0, resource: 'oil' as const, amount: 0, moneyTiming: 'now' as const };
  await send(host, {
    type: 'meetingTerms',
    id,
    revision: 0,
    offer: { ...empty, money: 1 },
    want: empty,
    years: 1,
    startInMonths: 0,
  });
  await send(host, { type: 'meetingProposal', id, revision: 1, response: 'propose' });
  await send(guest, { type: 'meetingProposal', id, revision: 1, response: 'accept' });
  await send(host, { type: 'meetingProposal', id, revision: 1, response: 'sign' });
  service = new Rooms(store, true, () => {}, 2);
  await service.load();
  expect(service.authenticate(host)).toEqual(host);
  expect(service.rooms.get(host.code)!.meetings![0].signatures).toEqual([host.playerId]);
  const request = {
    requestId: randomUUID(),
    action: { type: 'meetingProposal' as const, id, revision: 1, response: 'sign' as const },
  };
  await Promise.all([service.action(guest, request), service.action(guest, request)]);
  const settled = service.rooms.get(host.code)!;
  expect(settled.deals).toHaveLength(1);
  expect(settled.republics[0].metrics.treasury).toBe(balances[0] - 1);
  expect(settled.republics[1].metrics.treasury).toBe(balances[1] + 1);
  service = new Rooms(store, true, () => {}, 2);
  await service.load();
  expect(service.rooms.get(host.code)!.meetings![0].status).toBe('signed');
  for (let n = 0; n < 240; n++) await service.clock(service.rooms.get(host.code)!.nextTick);
  const ended = service.rooms.get(host.code)!;
  expect(ended.phase).toBe('ended');
  expect(ended.results).toHaveLength(2);
  expect(ended.results.every((s) => Number.isFinite(s.total))).toBe(true);
});
