import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { io, type Socket } from 'socket.io-client';
import { createApp } from './app';
import { createStore } from './store';
import type { Ack, RoomView, Session } from '@republic/contracts';
const draft = { name: 'Solara', leader: 'Ada', flag: '🌅', resources: ['oil', 'agriculture'] };
const options = { duration: 60, maxPlayers: 4, difficulty: 'developing' };
function connect(url: string, session: Session): Promise<{ socket: Socket; state: RoomView }> {
  return new Promise((resolve, reject) => {
    const socket = io(url, { auth: session, reconnection: false });
    socket.once('state', (state) => resolve({ socket, state }));
    socket.once('connect_error', (error) => {
      socket.close();
      reject(error);
    });
  });
}
it('validates HTTP, authenticates sockets, deduplicates actions and restores a seat', async () => {
  const store = await createStore('memory://', '');
  const { app, rooms } = await createApp(store, true);
  const sockets: Socket[] = [];
  try {
    const url = await app.listen({ port: 0, host: '127.0.0.1' });
    const invalid = await app.inject({
      method: 'POST',
      url: '/rooms',
      payload: { draft: { ...draft, resources: ['oil', 'gold', 'gas'] }, options },
    });
    expect(invalid.statusCode).toBe(400);
    const created = await app.inject({ method: 'POST', url: '/rooms', payload: { draft, options } });
    expect(created.statusCode).toBe(200);
    const session = created.json<Session>();
    const connected = await connect(url, session);
    sockets.push(connected.socket);
    expect(connected.state.me.name).toBe('Solara');
    await expect(connect(url, { ...session, token: '0'.repeat(64) })).rejects.toThrow();
    const payload = { requestId: randomUUID(), action: { type: 'debug', kind: 'bot' } };
    const ack: Ack = await connected.socket.timeout(2000).emitWithAck('action', payload);
    expect(ack.ok).toBe(true);
    await connected.socket.timeout(2000).emitWithAck('action', payload);
    expect(rooms.rooms.get(session.code)!.republics).toHaveLength(2);
    connected.socket.disconnect();
    const resumed = await connect(url, session);
    sockets.push(resumed.socket);
    expect(resumed.state.playerId).toBe(session.playerId);
    expect(resumed.state.republics).toHaveLength(2);
    expect((await store.all())[0].players[0].requests).toContain(payload.requestId);
  } finally {
    await app.close();
    sockets.forEach((s) => s.disconnect());
  }
}, 30_000);
it('broadcasts the same authoritative calendar to four independent players', async () => {
  const { app, rooms } = await createApp(await createStore('memory://', ''), false);
  const sockets: Socket[] = [];
  try {
    const url = await app.listen({ port: 0, host: '127.0.0.1' });
    const host = (await app.inject({ method: 'POST', url: '/rooms', payload: { draft, options } })).json<Session>();
    const sessions = [host];
    for (let n = 1; n < 4; n++)
      sessions.push(
        (
          await app.inject({
            method: 'POST',
            url: `/rooms/${host.code}/join`,
            payload: { ...draft, name: `Nation ${n}` },
          })
        ).json<Session>(),
      );
    for (const session of sessions) sockets.push((await connect(url, session)).socket);
    const rejected: Ack = await sockets[1]
      .timeout(2000)
      .emitWithAck('action', { requestId: randomUUID(), action: { type: 'start' } });
    expect(rejected.ok).toBe(false);
    const debug: Ack = await sockets[0]
      .timeout(2000)
      .emitWithAck('action', { requestId: randomUUID(), action: { type: 'debug', kind: 'bot' } });
    expect(debug.ok).toBe(false);
    const updates = sockets.map((socket) => new Promise<RoomView>((resolve) => socket.once('state', resolve)));
    await sockets[0].timeout(2000).emitWithAck('action', { requestId: randomUUID(), action: { type: 'start' } });
    const started = await Promise.all(updates);
    expect(started.every((s) => s.phase === 'playing' && s.nextTick === started[0].nextTick)).toBe(true);
    const ticks = sockets.map((socket) => new Promise<RoomView>((resolve) => socket.once('state', resolve)));
    await rooms.clock(started[0].nextTick);
    const states = await Promise.all(ticks);
    expect(states.every((s) => s.month === 1 && s.version === states[0].version)).toBe(true);
    expect(states.map((s) => s.me.id)).toEqual(sessions.map((s) => s.playerId));
  } finally {
    await app.close();
    sockets.forEach((s) => s.disconnect());
  }
}, 30_000);
