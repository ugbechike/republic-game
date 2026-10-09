import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Draft, Room, Session } from '@republic/contracts';
import { act, migrateRoom, advance, createRepublic, createRoom, interval, requireThat } from '@republic/engine';
import { DEFAULT_MIN_PLAYERS, envelopeSchema } from '@republic/contracts';
import type { Store } from './store';
export const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export class Rooms {
  rooms = new Map<string, Room>();
  trackPresence = false;
  online = new Map<string, number>();
  queues = new Map<string, Promise<unknown>>();
  constructor(
    private store: Store,
    readonly development: boolean,
    private changed: (room: Room) => void,
    readonly minimum = DEFAULT_MIN_PLAYERS,
  ) {}
  async load() {
    for (const r of await this.store.all()) {
      migrateRoom(r, this.minimum);
      r.nextTick = Date.now() + interval(r);
      if (r.phase === 'draft' && r.draft) {
        r.draft.deadline = Date.now() + (r.draft.remainingMs ?? 30000);
        r.nextTick = r.draft.deadline;
      }
      this.rooms.set(r.code, r);
    }
  }
  async presence(code: string, delta: number) {
    const prior = this.online.get(code) ?? 0,
      count = Math.max(0, prior + delta);
    this.online.set(code, count);
    const existing = this.rooms.get(code);
    if (!existing || !['playing', 'draft'].includes(existing.phase) || (prior > 0 && count > 0)) return;
    await this.mutate(code, (room) => {
      room.paused = count === 0;
      if (room.phase === 'draft' && room.draft) {
        if (!count) room.draft.remainingMs = Math.max(0, room.draft.deadline - Date.now());
        else {
          room.draft.deadline = Date.now() + (room.draft.remainingMs ?? 30000);
          room.nextTick = room.draft.deadline;
        }
      } else if (prior === 0 && count > 0) room.nextTick = Date.now() + interval(room);
    });
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
    const room = createRoom(code, playerId, hash(token), { ...draft, resources: [] }, options);
    room.minPlayers = this.minimum;
    requireThat(options.maxPlayers >= this.minimum, `World capacity must be at least ${this.minimum}`);
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
      room.republics.push(
        createRepublic(playerId, { ...draft, resources: [] }, room.options.difficulty === 'struggling'),
      );
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
      if (action.type === 'briefing' || action.type === 'officeDecision') {
        const republic = room.republics.find((r) => r.id === p.id);
        const briefing = (action.type === 'briefing' ? republic?.briefings : republic?.officeMatters)?.find(
          (b) => b.id === action.id,
        );
        const live =
          (room.activeMs ?? 0) +
          (room.paused
            ? 0
            : Math.max(0, Math.min(interval(room), Date.now() - (room.nextTick - interval(room)))) * room.speed);
        requireThat(briefing && live < briefing.dueAt, 'The response deadline has passed');
      }
      act(room, p.id, action, this.development);
      p.requests.push(requestId);
      p.requests = p.requests.slice(-200);
    });
  }
  async clock(now: number) {
    await Promise.all(
      [...this.rooms.values()]
        .filter(
          (r) =>
            ['playing', 'draft'].includes(r.phase) &&
            r.nextTick <= now &&
            (!this.trackPresence || (this.online.get(r.code) ?? 0) > 0),
        )
        .map((r) =>
          this.mutate(r.code, (next) => {
            advance(next, now);
          }),
        ),
    );
  }
}
