import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { Server } from 'socket.io';
import { z } from 'zod';
import { draftSchema, optionsSchema, type Session } from '@republic/contracts';
import { view } from '@republic/engine';
import { Rooms } from './service';
import type { Store } from './store';
export async function createApp(store: Store, development = process.env.NODE_ENV !== 'production') {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    bodyLimit: 16_384,
    trustProxy: process.env.NODE_ENV === 'production',
  });
  const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:3000').split(',');
  await app.register(cors, { origin: origins });
  await app.register(rateLimit, { max: 30, timeWindow: '1 minute' });
  const io = new Server(app.server, { cors: { origin: origins }, maxHttpBufferSize: 16_384 });
  const rooms = new Rooms(store, development, (room) => {
    for (const socket of io.sockets.sockets.values()) {
      const session = socket.data.session as Session;
      if (session?.code === room.code) socket.emit('state', view(room, session.playerId, development));
    }
  });
  await rooms.load();
  app.setErrorHandler((error, _request, reply) => {
    reply.status(400).send({
      error:
        error instanceof z.ZodError
          ? error.issues[0].message
          : error instanceof Error
            ? error.message
            : 'Request failed',
    });
  });
  app.get('/health', () => ({ ok: true, rooms: rooms.rooms.size }));
  app.post('/rooms', async (request) => {
    const body = z.object({ draft: draftSchema, options: optionsSchema }).parse(request.body);
    return rooms.create(body.draft, body.options);
  });
  app.post('/rooms/:code/join', async (request) => {
    const { code } = z.object({ code: z.string().regex(/^[A-Z2-9]{5}$/) }).parse(request.params);
    return rooms.join(code, draftSchema.parse(request.body));
  });
  io.use((socket, next) => {
    try {
      socket.data.session = rooms.authenticate(socket.handshake.auth);
      next();
    } catch (e) {
      next(new Error((e as Error).message));
    }
  });
  io.on('connection', (socket) => {
    const session = socket.data.session as Session;
    socket.emit('state', view(rooms.rooms.get(session.code)!, session.playerId, development));
    let count = 0,
      windowStart = Date.now();
    socket.on('action', async (input, ack) => {
      if (typeof ack !== 'function') return;
      if (Date.now() - windowStart > 10_000) {
        count = 0;
        windowStart = Date.now();
      }
      if (++count > 30) return ack({ ok: false, error: 'Slow down; your cabinet is catching up.' });
      try {
        await rooms.action(session, input);
        ack({ ok: true });
      } catch (e) {
        ack({ ok: false, error: e instanceof z.ZodError ? e.issues[0].message : (e as Error).message });
      }
    });
  });
  let ticking = false;
  const timer = setInterval(async () => {
    if (ticking) return;
    ticking = true;
    try {
      await rooms.clock(Date.now());
    } catch (e) {
      app.log.error(e);
    } finally {
      ticking = false;
    }
  }, 500);
  timer.unref();
  app.addHook('preClose', async () => {
    clearInterval(timer);
    io.disconnectSockets(true);
    io.engine.close();
  });
  app.addHook('onClose', async () => {
    clearInterval(timer);
    io.close();
    await Promise.allSettled(rooms.queues.values());
    await store.close();
  });
  return { app, rooms, io };
}
