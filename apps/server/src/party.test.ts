import { randomUUID } from 'node:crypto';
import { describe, it, expect, vi } from 'vitest';
import { emptyInventory, type Room, type PartyIntent, type Session } from '@republic/contracts';
import { Rooms } from './service';
const start = 1800000000000;
describe('persisted five-minute rooms', () => {
  it('reconnects between signatures, serializes retries, and completes while every player is offline', async () => {
    let now = start;
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const states = new Map<string, Room>();
    const store = {
      all: async () => [...states.values()].map((r) => structuredClone(r)),
      save: async (r: Room) => {
        states.set(r.code, structuredClone(r));
      },
      close: async () => {},
    };
    try {
      let service = new Rooms(store, true, () => {}, 2);
      service.trackPresence = true;
      const a = await service.create(
        { name: 'Canal Test', leader: 'Morgan', flag: '☀️', resources: [] },
        { duration: 5, maxPlayers: 6 },
      );
      const b = await service.join(a.code, { name: 'Oil Test', leader: 'Ada', flag: '🌲', resources: [] });
      await service.presence(a.code, 1, a.playerId);
      await service.presence(a.code, 1, b.playerId);
      const match = service.rooms.get(a.code)!.party!.id;
      const send = (s: Session, intent: PartyIntent) =>
        service.action(s, { requestId: randomUUID(), action: { type: 'party', match, intent } });
      await send(a, { kind: 'start' });
      await send(a, { kind: 'ready' });
      await send(b, { kind: 'ready' });
      const ends = service.rooms.get(a.code)!.party!.endsAt;
      await send(a, { kind: 'call', to: b.playerId });
      const id = service.rooms.get(a.code)!.party!.meetings[0].id;
      await send(b, { kind: 'respond', meeting: id, response: 'join' });
      await send(a, {
        kind: 'terms',
        meeting: id,
        revision: 0,
        terms: { offer: { ...emptyInventory(), credits: 3 }, want: emptyInventory(), delay: 0 },
      });
      await send(a, { kind: 'proposal', meeting: id, revision: 1, response: 'propose' });
      await send(b, { kind: 'proposal', meeting: id, revision: 1, response: 'accept' });
      await send(a, { kind: 'proposal', meeting: id, revision: 1, response: 'sign' });
      now += 10000;
      service = new Rooms(store, true, () => {}, 2);
      service.trackPresence = true;
      await service.load();
      expect(service.authenticate(a)).toEqual(a);
      expect(service.rooms.get(a.code)!.party!.endsAt).toBe(ends);
      const request = {
        requestId: randomUUID(),
        action: {
          type: 'party' as const,
          match,
          intent: { kind: 'proposal' as const, meeting: id, revision: 1, response: 'sign' as const },
        },
      };
      await Promise.all([service.action(b, request), service.action(b, request)]);
      const m = service.rooms.get(a.code)!.party!;
      expect(m.agreements).toHaveLength(1);
      expect(m.players.find((p) => p.id === b.playerId)!.inventory.credits).toBe(11);
      now = ends;
      await expect(send(a, { kind: 'call', to: b.playerId })).rejects.toThrow('ended');
      await service.clock(now);
      expect(service.rooms.get(a.code)!.party!.stage).toBe('ended');
      expect(service.online.size).toBe(0);
      service = new Rooms(store, true, () => {}, 2);
      await service.load();
      expect(service.rooms.get(a.code)!.party!.results).toHaveLength(2);
      await send(a, { kind: 'rematch' });
      expect(service.rooms.get(a.code)!.party!.players.every((p) => !p.role)).toBe(true);
      await expect(send(a, { kind: 'start' })).rejects.toThrow('earlier');
    } finally {
      clock.mockRestore();
    }
  });
  it('caps party rooms at six and refuses simulator commands', async () => {
    const store = { all: async () => [], save: async () => {}, close: async () => {} };
    const service = new Rooms(store, false, () => {});
    await expect(
      service.create({ name: 'Test', leader: 'Host', flag: '☀️', resources: [] }, { duration: 5, maxPlayers: 8 }),
    ).rejects.toThrow('2–6');
    const host = await service.create(
      { name: 'Test', leader: 'Host', flag: '☀️', resources: [] },
      { duration: 5, maxPlayers: 6 },
    );
    for (let i = 1; i < 6; i++)
      await service.join(host.code, { name: `Test ${i}`, leader: 'Guest', flag: '🌲', resources: [] });
    await expect(
      service.join(host.code, { name: 'Seventh', leader: 'Guest', flag: '🌲', resources: [] }),
    ).rejects.toThrow('full');
    await expect(
      service.action(host, { requestId: randomUUID(), action: { type: 'debug', kind: 'money' } }),
    ).rejects.toThrow('retired');
  });
});
