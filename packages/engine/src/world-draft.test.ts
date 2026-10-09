import { expect, it } from 'vitest';
import { draftPresident } from '@republic/contracts';
import { createRoom, createRepublic } from './create';
import { beginDraft, claimable, claimDeposit, advanceDraft } from './world-draft';
import { act } from './actions';
const identity = { name: 'Solara', leader: 'John', flag: '☀️' as const, resources: [] };
function world(n: number, seed: number) {
  const r = createRoom('DRAFT', 'p0', 'hash', identity, { duration: 60, maxPlayers: n });
  r.seed = seed;
  for (let i = 1; i < n; i++) {
    r.republics.push(createRepublic(`p${i}`, { ...identity, name: `Nation ${i}` }));
    r.players.push({ id: `p${i}`, tokenHash: 'hash', requests: [] });
  }
  return r;
}
it('finishes diverse validated snake drafts for every supported table size', () => {
  for (let n = 2; n <= 8; n++)
    for (let seed = 1; seed <= 20; seed++) {
      const room = world(n, seed);
      beginDraft(room, 100);
      while (!room.draft!.complete) {
        const d = room.draft!,
          who = draftPresident(d),
          choices = claimable(room, who);
        expect(choices.length).toBeGreaterThan(0);
        claimDeposit(room, who, choices[(seed + d.turn) % choices.length].id, 101);
      }
      expect(room.republics.every((r) => r.resources.length === 3 && new Set(r.resources).size === 3)).toBe(true);
      for (const k of ['oil', 'gas', 'agriculture', 'iron'])
        expect(room.republics.some((r) => r.resources.includes(k as 'oil'))).toBe(true);
      expect(room.draft!.deposits.filter((d) => d.resource === 'uranium')).toHaveLength(1);
      expect(
        room.republics.every(
          (r) => !['oil', 'gas', 'agriculture', 'iron'].every((k) => r.resources.includes(k as 'oil')),
        ),
      ).toBe(true);
      advanceDraft(room, room.draft!.deadline);
      expect(room.phase).toBe('playing');
      expect(room.month).toBe(0);
    }
});
it('rejects wrong turns, claimed deposits and late claims; automatically handles absence', () => {
  const r = world(2, 5);
  beginDraft(r, 0);
  const d = r.draft!,
    first = draftPresident(d),
    other = d.order.find((p) => p !== first)!;
  const pick = claimable(r, first)[0];
  expect(() => claimDeposit(r, other, pick.id, 1)).toThrow('turn');
  expect(() => claimDeposit(r, first, pick.id, 30001)).toThrow('closed');
  claimDeposit(r, first, pick.id, 1);
  expect(() => claimDeposit(r, other, pick.id, 2)).toThrow('claimed');
  advanceDraft(r, d.deadline);
  expect(d.turn).toBe(2);
  expect(draftPresident(d)).toBe(other);
  while (!d.complete) advanceDraft(r, d.deadline);
  act(r, 'p0', { type: 'draftReady' }, false, d.deadline - 1);
  act(r, 'p1', { type: 'draftReady' }, false, d.deadline - 1);
  expect(r.phase).toBe('playing');
});
