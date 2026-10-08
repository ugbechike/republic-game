import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Rooms } from './service';
import { view } from '@republic/engine';
import type { Draft, Room } from '@republic/contracts';
const draft: Draft = { name: 'Solara', leader: 'Ada', flag: '🌅', resources: ['oil', 'agriculture'] };
const options = { duration: 60 as const, maxPlayers: 4, difficulty: 'developing' as const };
function setup() {
  const snapshots = new Map<string, Room>();
  const store = { all: async () => [...snapshots.values()], save: async (r: Room) => { snapshots.set(r.code, structuredClone(r)); }, close: async () => {} };
  return { service: new Rooms(store, true, () => {}), store };
}
describe('authoritative rooms', () => {
  it('restores a secure identity and persisted state after backend restart', async () => {
    const { service, store } = setup();
    const session = await service.create(draft, options);
    expect(service.authenticate(session)).toEqual(session);
    expect(() => service.authenticate({ ...session, token: '0'.repeat(64) })).toThrow();
    const restored = new Rooms(store, true, () => {}); await restored.load();
    expect(restored.authenticate(session)).toEqual(session);
    expect(restored.rooms.get(session.code)?.republics[0].name).toBe('Solara');
  });
  it('serializes joins, enforces capacity and starts a synchronized clock', async () => {
    const { service } = setup(); const host = await service.create(draft, options);
    await Promise.all([1, 2, 3].map(n => service.join(host.code, { ...draft, name: `Nation ${n}` })));
    await expect(service.join(host.code, { ...draft, name: 'Overflow' })).rejects.toThrow('full');
    await service.action(host, { requestId: randomUUID(), action: { type: 'start' } });
    const room = service.rooms.get(host.code)!;
    await service.clock(room.nextTick - 1); expect(service.rooms.get(host.code)!.month).toBe(0);
    await service.clock(room.nextTick); expect(service.rooms.get(host.code)!.month).toBe(1);
  });
  it('keeps secrets and internal rival metrics out of public snapshots', async () => {
    const { service } = setup(); const host = await service.create(draft, options);
    await service.join(host.code, { ...draft, name: 'Kanto' });
    const snapshot = view(service.rooms.get(host.code)!, host.playerId, true);
    expect(JSON.stringify(snapshot)).not.toContain('tokenHash');
    expect(snapshot.republics[1]).not.toHaveProperty('metrics');
    expect(snapshot.me.metrics.treasury).toBe(12);
  });
});
