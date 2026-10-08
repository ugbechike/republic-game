import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Draft, Room, Session } from '@republic/contracts';
import { act, advance, createRepublic, createRoom, interval, requireThat } from '@republic/engine';
import { envelopeSchema } from '@republic/contracts';
import type { Store } from './store';
export const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export class Rooms {
  rooms = new Map<string, Room>();
  queues = new Map<string, Promise<unknown>>();
  constructor(
    private store: Store,
    readonly development: boolean,
    private changed: (room: Room) => void,
  ) {}
  async load() {
    for (const r of await this.store.all()) {
      r.nextTick = Date.now() + interval(r);
      this.rooms.set(r.code, r);
    }
  }
  async serial<T>(code: string, work: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(code) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(work);
    this.queues.set(code, next);
    try {
      return await next;
    } finally {
      if (this.queues.get(code) === next) this.queues.delete(code);
    }
  }
  async mutate(code: string, fn: (room: Room) => void) {
    return this.serial(code, async () => {
      const original = this.rooms.get(code);
      requireThat(original, 'Room not found');
      const next = structuredClone(original);
      fn(next);
      next.version++;
      await this.store.save(next);
      this.rooms.set(code, next);
      this.changed(next);
    });
  }
  async create(draft: Draft, options: Room['options']): Promise<Session> {
    let code: string;
    do {
      code = Array.from(randomBytes(5), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 31]).join('');
    } while (this.rooms.has(code));
    const playerId = randomUUID(),
      token = randomBytes(32).toString('hex');
    const room = createRoom(code, playerId, hash(token), draft, options);
    await this.store.save(room);
    this.rooms.set(code, room);
    return { code, playerId, token };
  }
  async join(code: string, draft: Draft): Promise<Session> {
    const playerId = randomUUID(),
      token = randomBytes(32).toString('hex');
    await this.mutate(code, (room) => {
      requireThat(room.phase === 'lobby', 'This world has already started');
      requireThat(room.republics.length < room.options.maxPlayers, 'This world is full');
      requireThat(
        !room.republics.some((r) => r.name.toLowerCase() === draft.name.toLowerCase()),
        'Republic name already taken',
      );
      room.players.push({ id: playerId, tokenHash: hash(token), requests: [] });
      room.republics.push(createRepublic(playerId, draft, room.options.difficulty === 'struggling'));
    });
    return { code, playerId, token };
  }
  authenticate(input: unknown): Session {
    const s = input as Session;
    requireThat(
      s &&
        typeof s.code === 'string' &&
        typeof s.playerId === 'string' &&
        typeof s.token === 'string' &&
        s.token.length === 64,
      'Invalid session',
    );
    const player = this.rooms.get(s.code)?.players.find((p) => p.id === s.playerId);
    requireThat(
      player && timingSafeEqual(Buffer.from(player.tokenHash), Buffer.from(hash(s.token))),
      'Session not found. Join with your room code.',
    );
    return s;
  }
  async action(session: Session, input: unknown) {
    const { requestId, action } = envelopeSchema.parse(input);
    await this.mutate(session.code, (room) => {
      const p = room.players.find((p) => p.id === session.playerId)!;
      if (p.requests.includes(requestId)) return;
      act(room, p.id, action, this.development);
      p.requests.push(requestId);
      p.requests = p.requests.slice(-200);
    });
  }
  async clock(now: number) {
    await Promise.all(
      [...this.rooms.values()]
        .filter((r) => r.phase === 'playing' && r.nextTick <= now)
        .map((r) =>
          this.mutate(r.code, (next) => {
            advance(next, now);
          }),
        ),
    );
  }
}
