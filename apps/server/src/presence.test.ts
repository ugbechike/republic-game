import { expect, it } from 'vitest';
import { Rooms } from './service';
import { createStore } from './store';
import { makeBriefing } from '../../../packages/engine/src/game-director';
it('freezes active deadlines while everyone is disconnected, resumes, and persists briefings', async () => {
  const store = await createStore('memory://', '');
  try {
    const rooms = new Rooms(store, true, () => {});
    rooms.trackPresence = true;
    const session = await rooms.create(
      { name: 'Solara', leader: 'John', flag: '☀️', resources: ['oil'] },
      { duration: 60, maxPlayers: 2 },
    );
    await rooms.mutate(session.code, (r) => {
      r.phase = 'playing';
      r.nextTick = 1;
      makeBriefing(r, r.republics[0], 'shortage', 'gas');
    });
    await rooms.clock(Date.now() + 10000000);
    expect(rooms.rooms.get(session.code)!.month).toBe(0);
    await rooms.presence(session.code, 1);
    const live = rooms.rooms.get(session.code)!;
    await rooms.clock(live.nextTick);
    expect(rooms.rooms.get(session.code)!.month).toBe(1);
    await rooms.presence(session.code, -1);
    const paused = rooms.rooms.get(session.code)!;
    const deadline = paused.republics[0].briefings![0].dueAt,
      active = paused.activeMs;
    await rooms.clock(Date.now() + 10000000);
    expect(rooms.rooms.get(session.code)!.activeMs).toBe(active);
    expect(paused.paused).toBe(true);
    const restored = new Rooms(store, true, () => {});
    await restored.load();
    expect(restored.authenticate(session)).toEqual(session);
    expect(restored.rooms.get(session.code)!.republics[0].briefings![0].dueAt).toBe(deadline);
    await restored.presence(session.code, 1);
    expect(restored.rooms.get(session.code)!.paused).toBe(false);
  } finally {
    await store.close();
  }
});
