import { expect, it } from 'vitest';
import { pressureWorld } from './pressure-fixture';
import { act } from './actions';
import { view } from './view';
const empty = { money: 0, resource: 'oil' as const, amount: 0, moneyTiming: 'now' as const, items: [] };
function meetingWorld() {
  const room = pressureWorld();
  act(room, 'a', { type: 'meetingRequest', to: 'b', agenda: 'Trade' });
  const m = room.meetings![0];
  act(room, 'b', { type: 'meetingResponse', id: m.id, response: 'join' });
  act(room, 'a', {
    type: 'meetingTerms',
    id: m.id,
    revision: 0,
    offer: { ...empty, money: 0.8 },
    want: { ...empty, items: [{ resource: 'gas', amount: 4, timing: 'now' }] },
    years: 3,
    startInMonths: 0,
  });
  return room;
}
it('supports live chat, a locked proposal, counteroffer and two signatures before atomic delivery', () => {
  const room = meetingWorld(),
    m = room.meetings![0];
  act(room, 'a', { type: 'meetingChat', id: m.id, text: 'Gas for cash?' });
  expect(view(room, 'b', false).meetings![0].messages[0].text).toBe('Gas for cash?');
  act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 1, response: 'propose' });
  expect(() => act(room, 'b', { type: 'meetingTerms', id: m.id, revision: 1, ...m.terms })).toThrow('locked');
  act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 1, response: 'counter' });
  act(room, 'b', { type: 'meetingTerms', id: m.id, revision: 2, ...m.terms, offer: { ...empty, money: 1 } });
  expect(() => act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 1, response: 'accept' })).toThrow(
    'changed',
  );
  act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 3, response: 'propose' });
  act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 3, response: 'accept' });
  const money = room.republics[0].metrics.treasury,
    gas = room.republics[0].stocks.gas;
  act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 3, response: 'sign' });
  expect(room.deals).toHaveLength(0);
  expect(room.republics[0].metrics.treasury).toBe(money);
  act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 3, response: 'sign' });
  expect(room.meetings![0].status).toBe('signed');
  expect(room.deals).toHaveLength(1);
  expect(room.republics[0].metrics.treasury).toBeCloseTo(money - 1);
  expect(room.republics[0].stocks.gas).toBeCloseTo(gas + 4);
  expect(() => act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 3, response: 'sign' })).toThrow(
    'concluded',
  );
});
it('preserves signatures and all balances if funding changes before the final signature', () => {
  const room = meetingWorld(),
    m = room.meetings![0];
  act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 1, response: 'propose' });
  act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 1, response: 'accept' });
  act(room, 'a', { type: 'meetingProposal', id: m.id, revision: 1, response: 'sign' });
  room.republics[0].metrics.treasury = 0;
  const before = structuredClone(room);
  expect(() => act(room, 'b', { type: 'meetingProposal', id: m.id, revision: 1, response: 'sign' })).toThrow('afford');
  expect(room).toEqual(before);
});
it('keeps meetings private, rejects stale edits and allows one two-minute delay', () => {
  const room = pressureWorld();
  act(room, 'a', { type: 'meetingRequest', to: 'b', agenda: 'Security' });
  const m = room.meetings![0];
  act(room, 'b', { type: 'meetingResponse', id: m.id, response: 'delay' });
  expect(m.delayedUntil).toBe(120000);
  expect(() => act(room, 'b', { type: 'meetingResponse', id: m.id, response: 'delay' })).toThrow('once');
  expect(() => act(room, 'a', { type: 'meetingRequest', to: 'b', agenda: 'Trade' })).toThrow('already open');
  room.republics.push({ ...structuredClone(room.republics[0]), id: 'c' });
  expect(view(room, 'c', false).meetings).toHaveLength(0);
  expect(() => act(room, 'c', { type: 'meetingChat', id: m.id, text: 'spying' })).toThrow('Private');
  act(room, 'b', { type: 'meetingResponse', id: m.id, response: 'join' });
  expect(m.status).toBe('active');
  act(room, 'a', { type: 'meetingTerms', id: m.id, revision: 0, ...m.terms });
  expect(() => act(room, 'b', { type: 'meetingTerms', id: m.id, revision: 0, ...m.terms })).toThrow('changed');
});
