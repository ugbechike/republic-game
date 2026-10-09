import { advanceDraft } from './world-draft';
import { gameDirector } from './game-director';
import { worldDirector } from './world-director';
import { ensureEconomy, observed, recordEconomy, explain } from './economic-history';
import { shortageConsequences } from './supply';
import { bankTick } from './bank';
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
  room.activeMs = (room.activeMs ?? 0) + interval(room) * room.speed;
  for (const r of room.republics) {
    const e = ensureEconomy(r);
    e.causes = [];
    e.revenue = 0;
    e.expenditure = 0;
  }
  worldDirector(room);
  botsTick(room);
  room.month++;
  for (const [reason, step] of [
    ['Trade deliveries and commitments', tradeTick],
    ['Loans, sanctions and Assembly decisions', diplomacyTick],
    ['Military operations and settlements', conflictTick],
  ] as const) {
    const before = room.republics.map((r) => ({ ...r.metrics }));
    step(room);
    room.republics.forEach((r, i) => explain(r, before[i], reason));
  }
  for (const r of room.republics) {
    observed(r, 'Taxes, spending, jobs and public services', () => economy(room, r));
    shortageConsequences(r);
    observed(r, 'Legacy crisis and governor updates', () => eventsTick(room, r));
    observed(r, 'Emergency facility repayment', () => bankTick(room, r));
  }
  gameDirector(room);
  for (const r of room.republics) recordEconomy(room, r);
  if (room.month >= 240) finish(room);
}
export function advance(room: Room, now: number) {
  if (room.phase === 'draft') return advanceDraft(room, now);
  if (room.phase !== 'playing' || now < room.nextTick) return false;
  tick(room);
  room.nextTick = now + interval(room);
  return true;
}
