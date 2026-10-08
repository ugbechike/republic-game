import { expect, it } from 'vitest';
import { createRepublic, createRoom } from './create';
import { act } from './actions';
import { tradeTick } from './trade';
import { diplomacyTick } from './diplomacy';
function world() {
  const draft = {
    name: 'Solara',
    leader: 'Ada',
    flag: '🌅' as const,
    resources: ['oil', 'agriculture'] as ('oil' | 'agriculture')[],
  };
  const room = createRoom('ABCDE', 'a', 'hash', draft, { duration: 60, maxPlayers: 4, difficulty: 'developing' });
  for (const id of ['b', 'c', 'd']) room.republics.push(createRepublic(id, { ...draft, name: id }, false));
  room.phase = 'playing';
  return room;
}
const proposal = {
  type: 'trade' as const,
  to: 'b',
  offer: { money: 1.2, resource: 'agriculture' as const, amount: 12 },
  want: { money: 0, resource: 'oil' as const, amount: 12 },
  years: 2 as const,
};
it('executes exact bilateral transfers and completes after 24 deliveries', () => {
  const room = world();
  act(room, 'a', proposal);
  act(room, 'b', { type: 'dealResponse', id: room.deals[0].id, accept: true });
  expect(room.republics[0].metrics.treasury).toBeCloseTo(11.9);
  expect(room.republics[1].metrics.treasury).toBeCloseTo(12.1);
  for (let month = 1; month <= 24; month++) {
    room.month = month;
    tradeTick(room);
  }
  expect(room.deals[0].status).toBe('completed');
  expect(room.republics[0].stats.deliveries).toBe(24);
});
it('rejects underfunded acceptance without partial transfers', () => {
  const room = world();
  act(room, 'a', proposal);
  room.republics[1].stocks.oil = 0;
  expect(() => act(room, 'b', { type: 'dealResponse', id: room.deals[0].id, accept: true })).toThrow();
  expect(room.republics[0].metrics.treasury).toBe(12);
  expect(room.deals[0].status).toBe('pending');
});
it('replaces a pending offer when the recipient counters', () => {
  const room = world();
  act(room, 'a', proposal);
  const id = room.deals[0].id;
  act(room, 'b', { ...proposal, to: 'a', counter: id });
  expect(room.deals[0].status).toBe('rejected');
  expect(room.deals[1].to).toBe('a');
});
it('blocks sanctioned trade and penalizes broken pacts', () => {
  const room = world();
  act(room, 'a', { type: 'alliance', to: 'b', kind: 'defence' });
  act(room, 'b', { type: 'allianceResponse', id: room.alliances[0].id, accept: true });
  act(room, 'a', { type: 'leaveAlliance', id: room.alliances[0].id });
  expect(room.republics[0].stats.betrayals).toBe(1);
  act(room, 'a', { type: 'sanction', to: 'b' });
  expect(() => act(room, 'a', proposal)).toThrow('Sanctions');
});
it('requires majority of all seats and applies development assistance', () => {
  const room = world();
  room.vote = { id: 'v', title: 'Aid', kind: 'aid', target: 'b', ends: 2, ballots: { a: true, b: true } };
  room.month = 2;
  diplomacyTick(room);
  expect(room.republics[1].metrics.treasury).toBe(12);
  room.vote = { id: 'v2', title: 'Aid', kind: 'aid', target: 'b', ends: 3, ballots: { a: true, b: true, c: true } };
  room.month = 3;
  diplomacyTick(room);
  expect(room.republics[1].metrics.treasury).toBe(15);
});
it('repays a bilateral loan from borrower reserves', () => {
  const room = world();
  act(room, 'a', { type: 'loan', to: 'b', amount: 3 });
  act(room, 'b', { type: 'loanResponse', id: room.loans[0].id, accept: true });
  expect(room.republics[1].metrics.treasury).toBe(15);
  for (let i = 0; i < 24; i++) diplomacyTick(room);
  expect(room.loans[0].status).toBe('paid');
  expect(room.republics[0].metrics.treasury).toBeCloseTo(12.3);
});
