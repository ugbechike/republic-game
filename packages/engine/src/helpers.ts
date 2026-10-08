import type { Room, Republic } from '@republic/contracts';
export const clamp = (n: number, low = 0, high = 100) => Math.max(low, Math.min(high, n));
export function random(room: Room) {
  room.seed = (Math.imul(room.seed, 1664525) + 1013904223) >>> 0;
  return room.seed / 4294967296;
}
export function uid(room: Room) {
  return `${room.month}-${Math.floor(random(room) * 1e12).toString(36)}`;
}
export function notice(room: Room, text: string, audience?: string[]) {
  room.notices.unshift({ id: uid(room), month: room.month, text, audience });
  room.notices = room.notices.slice(0, 100);
}
export function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function other(room: Room, me: Republic, id: string) {
  const target = room.republics.find((r) => r.id === id);
  requireThat(target && id !== me.id, 'Choose another Republic');
  return target;
}
export function spend(r: Republic, amount: number) {
  requireThat(r.metrics.treasury >= amount, `Requires $${amount.toFixed(1)}B in reserves`);
  r.metrics.treasury -= amount;
}
export const interval = (room: Room) => (room.options.duration * 60_000) / 240 / room.speed;
