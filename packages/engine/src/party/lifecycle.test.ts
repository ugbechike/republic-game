import { describe, it, expect } from 'vitest';
import { ROLE_INFO, ROLES, PARTY_RULES } from '@republic/contracts';
import { fixture, begin, command, START, trade } from './fixture';
import { partyClock } from './director';
import { partyAction } from './actions';
import { partyView } from './view';
describe('five-minute Canal Crisis lifecycle', () => {
  it('deals unique roles for 2–6 players and starts only after reveal readiness', () => {
    const assignments = new Set<string>();
    for (let n = 2; n <= 6; n++)
      for (let seed = 1; seed <= 20; seed++) {
        const r = fixture(n, seed);
        command(r, 'p0', { kind: 'start' });
        expect(r.party!.startedAt).toBe(0);
        expect(new Set(r.party!.players.map((p) => p.role)).size).toBe(n);
        expect(r.party!.players.map((p) => p.role).sort()).toEqual([...ROLES.slice(0, n)].sort());
        assignments.add(r.party!.players.map((p) => p.role).join(','));
        partyClock(r, START + 20000);
        expect(r.party!.endsAt - r.party!.startedAt).toBe(300000);
        expect(r.party!.players.every((p) => p.support === 50 && p.influence === 0)).toBe(true);
      }
    expect(assignments.size).toBeGreaterThan(10);
  });
  it('rejects single-player and non-host starts', () => {
    const r = fixture(1);
    expect(() => begin(r)).toThrow('2–6');
    const s = fixture();
    expect(() => command(s, 'p1', { kind: 'start' })).toThrow('host');
  });
  it('completes reciprocal Oil/Canal needs through a fair binding trade', () => {
    const r = fixture();
    begin(r);
    const oil = r.party!.players.find((p) => p.role === 'oil')!,
      canal = r.party!.players.find((p) => p.role === 'canal')!;
    trade(r, oil.id, canal.id, { oil: 3 }, { passage: 3 });
    for (const p of r.party!.players)
      if (p.needs[0].status !== 'fulfilled') command(r, p.id, { kind: 'fulfill', need: p.needs[0].id });
    expect(r.party!.players.every((p) => p.support === 82)).toBe(true);
    expect(r.party!.players.every((p) => p.influence === 24)).toBe(true);
    expect(() => command(r, oil.id, { kind: 'fulfill', need: oil.needs[0].id })).toThrow('already');
  });
  it('all role variants can negotiate supplies or choose independent costly relief', () => {
    for (const n of [2, 3, 4, 5, 6]) {
      const r = fixture(n);
      begin(r);
      for (const p of r.party!.players) {
        for (const req of p.needs[0].requirements) {
          let left =
            req.amount - req.assets.reduce((a, k) => a + r.party!.players.find((x) => x.id === p.id)!.inventory[k], 0);
          if (left <= 0) continue;
          const supplier = r.party!.players.find(
            (x) => x.id !== p.id && req.assets.includes(ROLE_INFO[x.role!].asset),
          )!;
          expect(supplier).toBeDefined();
          const asset = ROLE_INFO[supplier.role!].asset;
          trade(
            r,
            supplier.id,
            p.id,
            { [asset]: left },
            { credits: Math.min(left * 2, r.party!.players.find((x) => x.id === p.id)!.inventory.credits) },
          );
        }
      }
      for (const p of r.party!.players)
        if (p.needs[0].status !== 'fulfilled') command(r, p.id, { kind: 'fulfill', need: p.needs[0].id });
      expect(r.party!.players.every((p) => p.needs[0].status === 'fulfilled')).toBe(true);
      const fallback = fixture(n);
      begin(fallback);
      for (const p of fallback.party!.players) command(fallback, p.id, { kind: 'fallback', need: p.needs[0].id });
      expect(fallback.party!.players.every((p) => p.support === 62 && p.inventory.credits === 4)).toBe(true);
    }
  });
  it('twists exactly once at midpoint, finishes without online players and rejects cutoff actions', () => {
    const r = fixture();
    begin(r);
    partyClock(r, START + 149999);
    expect(r.party!.twist).toBeUndefined();
    partyClock(r, START + 150000);
    const snapshot = structuredClone(r.party!.twist);
    partyClock(r, START + 150001);
    expect(r.party!.twist).toEqual(snapshot);
    expect(() => command(r, 'p0', { kind: 'call', to: 'p1' }, START + 300000)).toThrow('ended');
    partyClock(r, START + 300000);
    const result = structuredClone(r.party!.results);
    partyClock(r, START + 500000);
    expect(r.party!.results).toEqual(result);
    expect(r.party!.stage).toBe('ended');
    expect(result[0].id).toBe('p0');
    const old = r.party!.id;
    command(r, 'p0', { kind: 'rematch' }, START + 400000);
    expect(r.party!.id).not.toBe(old);
    expect(r.party!.meetings).toEqual([]);
    expect(r.party!.players.every((p) => !p.role && p.support === 50)).toBe(true);
    expect(() => partyAction(r, 'p0', old, { kind: 'start' }, true, START, new Set())).toThrow('earlier');
  });
  it('every midpoint variant creates a reachable foreign-supply need for every role', () => {
    for (const count of [3, 4, 5, 6])
      for (const kind of ['security', 'machinery', 'shipping'] as const) {
        const r = fixture(count);
        begin(r);
        r.party!.twistKind = kind;
        const before = r.party!.players.map((p) => structuredClone(p.inventory));
        partyClock(r, START + PARTY_RULES.twist);
        for (const [i, p] of r.party!.players.entries()) {
          const need = p.needs.find((n) => n.optional)!;
          expect(need.requirements[0].assets).not.toContain(ROLE_INFO[p.role!].asset);
          expect(
            r.party!.players.some(
              (other) => other.id !== p.id && need.requirements[0].assets.includes(ROLE_INFO[other.role!].asset),
            ),
          ).toBe(true);
          expect(p.inventory).toEqual(before[i]);
          expect(need.dueAt).toBe(r.party!.endsAt);
        }
      }
  });
  it('projects only participant conversations and own private inventory', () => {
    const r = fixture(3);
    begin(r);
    command(r, 'p0', { kind: 'call', to: 'p1' });
    const v = partyView(r.party!, 'p2', START, new Set(['p0', 'p2']));
    expect(v.meetings).toEqual([]);
    expect(v.players[0]).not.toHaveProperty('inventory');
    expect(v).not.toHaveProperty('twistKind');
    expect(v.players[1].online).toBe(false);
  });
});
