import type { Room } from '@republic/contracts';
import { interval } from './helpers';
import { economy } from './economy';
import { eventsTick } from './events';
export function tick(room: Room) {
  if (room.phase !== 'playing') return;
  room.month++;
  for (const r of room.republics) { economy(room, r); eventsTick(room, r); }
  if (room.month >= 240) room.phase = 'ended';
}
export function advance(room: Room, now: number) { if (room.phase !== 'playing' || now < room.nextTick) return false; tick(room); room.nextTick = now + interval(room); return true; }
