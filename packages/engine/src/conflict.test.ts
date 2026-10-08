import { expect, it } from 'vitest';
import { createRepublic, createRoom } from './create';
import { act } from './actions';
import { conflictTick } from './conflict';
function world() {
  const draft = { name: 'Solara', leader: 'Ada', flag: '🌅' as const, resources: ['oil' as const] };
  const room = createRoom('ABCDE', 'a', 'x', draft, { duration: 60, maxPlayers: 4, difficulty: 'developing' });
  for (const id of ['b', 'c']) room.republics.push(createRepublic(id, { ...draft, name: id }, false));
  room.phase = 'playing';
  return room;
}
it('charges war entry costs and settles without destroying a Republic', () => {
  const room = world();
  act(room, 'a', { type: 'war', to: 'b' });
  expect(room.republics[0].metrics.treasury).toBe(9);
  expect(room.vote?.kind).toBe('sanction');
  for (let m = 1; m <= 6; m++) {
    room.month = m;
    conflictTick(room);
  }
  expect(room.wars[0].status).toBe('ended');
  expect(room.republics).toHaveLength(3);
  expect(room.republics.every((r) => r.metrics.population > 0)).toBe(true);
});
it('accepts outside support once and rejects self intervention', () => {
  const room = world();
  act(room, 'a', { type: 'war', to: 'b' });
  const id = room.wars[0].id;
  act(room, 'c', { type: 'assist', id, side: 'b', kind: 'financial' });
  expect(room.republics[1].metrics.treasury).toBe(14);
  expect(() => act(room, 'c', { type: 'assist', id, side: 'a', kind: 'military' })).toThrow();
  expect(() => act(room, 'a', { type: 'assist', id, side: 'a', kind: 'financial' })).toThrow();
});
it('requires leaving an alliance before attacking', () => {
  const room = world();
  act(room, 'a', { type: 'alliance', to: 'b', kind: 'trade' });
  act(room, 'b', { type: 'allianceResponse', id: room.alliances[0].id, accept: true });
  expect(() => act(room, 'a', { type: 'war', to: 'b' })).toThrow('pact');
});
