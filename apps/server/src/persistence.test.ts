import { expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Rooms } from './service';
import { createStore } from './store';
it('restores a room and secret hash from a reopened PostgreSQL data directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'republic-test-'));
  try {
    const first = await createStore(join(directory, 'db'), '');
    const service = new Rooms(first, true, () => {});
    const session = await service.create(
      { name: 'Solara', leader: 'Ada', flag: '🌅', resources: ['oil'] },
      { duration: 60, maxPlayers: 4, difficulty: 'developing' },
    );
    await first.close();
    const second = await createStore(join(directory, 'db'), '');
    try {
      const restored = new Rooms(second, true, () => {});
      await restored.load();
      expect(restored.authenticate(session)).toEqual(session);
      expect(restored.rooms.get(session.code)?.republics[0].name).toBe('Solara');
    } finally {
      await second.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
