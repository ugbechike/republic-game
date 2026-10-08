import type { Room } from '@republic/contracts';
import { interval } from './helpers';
export function tick(room: Room) { if (room.phase !== 'playing') return; room.month++; if (room.month >= 240) room.phase = 'ended'; }
export function advance(room: Room, now: number) { if (room.phase !== 'playing' || now < room.nextTick) return false; tick(room); room.nextTick = now + interval(room); return true; }
