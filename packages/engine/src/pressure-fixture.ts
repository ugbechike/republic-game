import type { Draft } from '@republic/contracts';
import { createRepublic, createRoom } from './create';
export function pressureWorld() {
  const a: Draft = { name: 'Solara', leader: 'John', flag: '☀️', resources: ['oil', 'agriculture'] };
  const room = createRoom('NEEDS', 'a', 'hash', a, { duration: 60, maxPlayers: 4 });
  room.republics.push(createRepublic('b', { ...a, name: 'Kantara', resources: ['gas', 'iron'] }, false));
  room.players.push({ id: 'b', tokenHash: 'hash-b', requests: [] });
  room.phase = 'playing';
  return room;
}
