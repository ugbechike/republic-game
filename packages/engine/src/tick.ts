import type { Room } from '@republic/contracts';
import { interval } from './helpers';
import { finish } from './scoring';
import { botsTick } from './bots';
import { conflictTick } from './conflict';
import { tradeTick } from './trade';
import { diplomacyTick } from './diplomacy';
import { economy } from './economy';
import { eventsTick } from './events';
export function tick(room: Room) {
  if (room.phase !== 'playing') return;
  botsTick(room);
  room.month++;
  tradeTick(room); diplomacyTick(room); conflictTick(room);
  for (const r of room.republics) { economy(room, r); eventsTick(room, r); }
  if (room.month >= 240) finish(room);
}
export function advance(room: Room, now: number) { if (room.phase !== 'playing' || now < room.nextTick) return false; tick(room); room.nextTick = now + interval(room); return true; }
