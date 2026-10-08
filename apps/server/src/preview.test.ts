import { expect, it } from 'vitest';
import { createApp } from './app';
import { createStore } from './store';
import type { Session } from '@republic/contracts';
it('previews the exact starting metrics and exposes the host challenge to joiners', async () => {
  const { app, rooms } = await createApp(await createStore('memory://', ''), false);
  try {
    const draft = { name: 'Solara', leader: 'John', flag: '☀️', resources: ['coastline', 'uranium'] };
    const options = { duration: 45, maxPlayers: 2, difficulty: 'struggling' };
    const preview = await app.inject({
      method: 'POST',
      url: '/republic-preview',
      payload: { draft, difficulty: options.difficulty },
    });
    expect(preview.statusCode).toBe(200);
    expect(rooms.rooms.size).toBe(0);
    const created = await app.inject({ method: 'POST', url: '/rooms', payload: { draft, options } });
    const session = created.json<Session>();
    const room = rooms.rooms.get(session.code)!;
    expect(preview.json().metrics).toEqual(room.republics[0].metrics);
    const summary = await app.inject({ method: 'GET', url: `/rooms/${session.code}/summary` });
    expect(summary.json()).toMatchObject({ minPlayers: 2, occupied: 1, options });
    const joined = await app.inject({
      method: 'POST',
      url: `/rooms/${session.code}/join`,
      payload: { ...draft, name: 'Kantara' },
    });
    expect(joined.statusCode).toBe(200);
    expect(rooms.rooms.get(session.code)!.republics[1].metrics).toEqual(preview.json().metrics);
  } finally {
    await app.close();
  }
});
