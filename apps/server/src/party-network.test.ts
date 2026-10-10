import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import {
  ROLE_INFO,
  emptyInventory,
  type Ack,
  type PartyIntent,
  type RoomView,
  type Session,
} from '@republic/contracts';
import { createApp } from './app';
import { createStore } from './store';

for (const count of [3, 6])
  it(`${count} independent socket clients negotiate, fulfill, reconnect and finish together`, async () => {
    const { app, rooms } = await createApp(await createStore('memory://', ''), false);
    const sockets: Socket[] = [],
      sessions: Session[] = [],
      views: RoomView[] = [];
    const draft = { name: 'Host', leader: 'Morgan', flag: '☀️', resources: [] };
    try {
      const url = await app.listen({ port: 0, host: '127.0.0.1' });
      sessions.push(
        (
          await app.inject({
            method: 'POST',
            url: '/rooms',
            payload: { draft, options: { duration: 5, maxPlayers: 6 } },
          })
        ).json(),
      );
      for (let i = 1; i < count; i++)
        sessions.push(
          (
            await app.inject({
              method: 'POST',
              url: `/rooms/${sessions[0].code}/join`,
              payload: { ...draft, name: `Republic ${i}` },
            })
          ).json(),
        );
      async function connect(i: number) {
        const socket = io(url, { auth: sessions[i], reconnection: false });
        sockets[i] = socket;
        socket.on('state', (state: RoomView) => {
          views[i] = state;
        });
        await new Promise<void>((resolve, reject) => {
          socket.once('state', () => resolve());
          socket.once('connect_error', reject);
        });
      }
      for (let i = 0; i < count; i++) await connect(i);
      const room = () => rooms.rooms.get(sessions[0].code)!;
      let match = room().party!.id;
      async function send(id: string, intent: PartyIntent) {
        const ack: Ack = await sockets[sessions.findIndex((s) => s.playerId === id)]
          .timeout(2000)
          .emitWithAck('action', { requestId: randomUUID(), action: { type: 'party', match, intent } });
        expect(ack).toEqual({ ok: true });
      }
      await send(sessions[0].playerId, { kind: 'start' });
      for (const s of sessions) await send(s.playerId, { kind: 'ready' });
      const ends = room().party!.endsAt;
      expect(ends - room().party!.startedAt).toBe(300000);
      // Each player obtains the real inputs their role needs through the network action path.
      for (const id of sessions.map((s) => s.playerId)) {
        const player = () => room().party!.players.find((p) => p.id === id)!;
        for (const req of player().needs[0].requirements) {
          const missing = req.amount - req.assets.reduce((n, a) => n + player().inventory[a], 0);
          if (missing <= 0) continue;
          const supplier = room().party!.players.find(
            (p) => p.id !== id && req.assets.includes(ROLE_INFO[p.role!].asset),
          )!;
          await send(id, { kind: 'call', to: supplier.id });
          const meeting = room().party!.meetings.at(-1)!.id;
          await send(supplier.id, { kind: 'respond', meeting, response: 'join' });
          await send(id, { kind: 'chat', meeting, text: 'A binding delivery for our national objective.' });
          await send(id, {
            kind: 'terms',
            meeting,
            revision: 0,
            terms: {
              offer: { ...emptyInventory(), credits: Math.min(2 * missing, player().inventory.credits) },
              want: { ...emptyInventory(), [ROLE_INFO[supplier.role!].asset]: missing },
              delay: 0,
            },
          });
          await send(id, { kind: 'proposal', meeting, revision: 1, response: 'propose' });
          await send(supplier.id, { kind: 'proposal', meeting, revision: 1, response: 'accept' });
          await send(id, { kind: 'proposal', meeting, revision: 1, response: 'sign' });
          await send(supplier.id, { kind: 'proposal', meeting, revision: 1, response: 'sign' });
          // Reconnect resets the real transport rate window and verifies persisted seat projection.
          for (const index of [
            sessions.findIndex((s) => s.playerId === id),
            sessions.findIndex((s) => s.playerId === supplier.id),
          ]) {
            sockets[index].disconnect();
            await connect(index);
          }
        }
        await send(id, { kind: 'fulfill', need: player().needs[0].id });
      }
      expect(room().party!.players.every((p) => p.needs[0].status === 'fulfilled')).toBe(true);
      for (const [i, v] of views.entries()) {
        expect(v.party!.meetings.every((m) => m.participants.includes(sessions[i].playerId))).toBe(true);
        expect(v.party!.players.every((p) => !('inventory' in p))).toBe(true);
        expect(v.party!.endsAt).toBe(ends);
      }
      await rooms.clock(ends - 150000);
      expect(room().party!.twist).toBeDefined();
      const final = sockets.map(
        (socket) =>
          new Promise<RoomView>((resolve) => {
            const listener = (state: RoomView) => {
              if (state.party?.stage === 'ended') {
                socket.off('state', listener);
                resolve(state);
              }
            };
            socket.on('state', listener);
          }),
      );
      await rooms.clock(ends);
      const results = await Promise.all(final);
      expect(results.every((v) => JSON.stringify(v.party!.results) === JSON.stringify(results[0].party!.results))).toBe(
        true,
      );
      expect(results[0].party!.results).toHaveLength(count);
      for (const r of results[0].party!.results) expect(r.legacy).toBeCloseTo(0.7 * r.support + 0.3 * r.influence);
      const old = match;
      await send(sessions[0].playerId, { kind: 'rematch' });
      match = room().party!.id;
      expect(match).not.toBe(old);
      expect(room().party!.agreements).toEqual([]);
    } finally {
      sockets.forEach((socket) => socket.disconnect());
      await app.close();
    }
  }, 30000);
