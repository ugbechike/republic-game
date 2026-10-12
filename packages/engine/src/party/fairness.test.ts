import { describe, it, expect } from 'vitest';
import { emptyInventory } from '@republic/contracts';
import { fixture, begin, command, START, trade, openTable, bundle } from './fixture';
import { partyClock } from './director';
import { evaluate } from './evaluator';
import { partyAction } from './actions';
describe('binding negotiation, evaluation and anti-farming', () => {
  it('requires recipient acceptance, immutable revision, and two signatures', () => {
    const r = fixture();
    begin(r);
    const id = openTable(r, 'p0', 'p1');
    command(r, 'p0', {
      kind: 'terms',
      meeting: id,
      revision: 0,
      terms: { offer: bundle({ credits: 2 }), want: bundle({ credits: 0 }), delay: 0 },
    });
    expect(() =>
      command(r, 'p1', {
        kind: 'terms',
        meeting: id,
        revision: 0,
        terms: { offer: emptyInventory(), want: emptyInventory(), delay: 0 },
      }),
    ).toThrow('changed');
    command(r, 'p0', { kind: 'proposal', meeting: id, revision: 1, response: 'propose' });
    expect(r.party!.players[0].inventory.credits).toBe(6);
    expect(() => command(r, 'p0', { kind: 'proposal', meeting: id, revision: 1, response: 'accept' })).toThrow(
      'counterparty',
    );
    command(r, 'p1', { kind: 'proposal', meeting: id, revision: 1, response: 'counter' });
    expect(r.party!.players[0].inventory.credits).toBe(8);
    expect(() => command(r, 'p0', { kind: 'proposal', meeting: id, revision: 1, response: 'sign' })).toThrow('changed');
    command(r, 'p1', { kind: 'proposal', meeting: id, revision: 2, response: 'propose' });
    command(r, 'p0', { kind: 'proposal', meeting: id, revision: 2, response: 'accept' });
    command(r, 'p0', { kind: 'proposal', meeting: id, revision: 2, response: 'sign' });
    expect(r.party!.agreements).toHaveLength(0);
    command(r, 'p1', { kind: 'proposal', meeting: id, revision: 2, response: 'sign' });
    expect(r.party!.agreements).toHaveLength(1);
    expect(r.party!.players[1].inventory.credits).toBe(10);
    expect(() => command(r, 'p1', { kind: 'proposal', meeting: id, revision: 2, response: 'sign' })).toThrow('closed');
  });
  it('escrows assets across tables, rejects unaffordable acceptance atomically and releases expired offers', () => {
    const r = fixture(3);
    begin(r);
    const first = openTable(r, 'p0', 'p1'),
      second = openTable(r, 'p0', 'p2');
    command(r, 'p0', {
      kind: 'terms',
      meeting: first,
      revision: 0,
      terms: { offer: bundle({ credits: 8 }), want: bundle({ oil: 50 }), delay: 0 },
    });
    command(r, 'p0', { kind: 'proposal', meeting: first, revision: 1, response: 'propose' });
    command(r, 'p0', {
      kind: 'terms',
      meeting: second,
      revision: 0,
      terms: { offer: bundle({ credits: 1 }), want: emptyInventory(), delay: 0 },
    });
    expect(() => command(r, 'p0', { kind: 'proposal', meeting: second, revision: 1, response: 'propose' })).toThrow(
      'available',
    );
    const before = structuredClone(r);
    expect(() => command(r, 'p1', { kind: 'proposal', meeting: first, revision: 1, response: 'accept' })).toThrow(
      'available',
    );
    expect(r).toEqual(before);
    expect(() =>
      command(r, 'p1', { kind: 'proposal', meeting: first, revision: 1, response: 'accept' }, START + 45000),
    ).toThrow('closed');
    partyClock(r, START + 45000);
    expect(r.party!.players[0].inventory.credits).toBe(8);
  });
  it('settles escrowed future commitments once even through a twist and ending', () => {
    const r = fixture();
    begin(r);
    trade(r, 'p0', 'p1', { credits: 3 }, {}, 30);
    expect(r.party!.players[1].inventory.credits).toBe(8);
    command(r, 'p0', { kind: 'debug', command: 'twist' });
    partyClock(r, START + 30000);
    expect(r.party!.players[1].inventory.credits).toBe(11);
    partyClock(r, START + 300000);
    expect(r.party!.players[1].inventory.credits).toBe(11);
    expect(r.party!.agreements[0].status).toBe('settled');
  });
  it('classifies fair, weak, strategic and timing-dependent agreements', () => {
    const r = fixture();
    begin(r);
    const oil = r.party!.players.find((p) => p.role === 'oil')!;
    expect(evaluate(r.party!, oil, bundle({ oil: 3 }), bundle({ passage: 3 }), 0).grade).toBe('Fair');
    expect(evaluate(r.party!, oil, bundle({ oil: 3 }), bundle({ credits: 2 }), 0).grade).toBe('Weak');
    expect(evaluate(r.party!, oil, bundle({ oil: 3 }), bundle({ passage: 2 }), 0).grade).toBe(
      'Strategically Justified',
    );
    expect(evaluate(r.party!, oil, bundle({ oil: 3 }), bundle({ passage: 3 }), 15).grade).toBe('Uncertain');
    expect(evaluate(r.party!, oil, bundle({ credits: 1 }), bundle({ oil: 3 }), 0).grade).toBe('Excellent');
  });
  it('gifts lose support, circular trades and splitting cannot create score', () => {
    const r = fixture(3);
    begin(r);
    const oil = r.party!.players.find((p) => p.role === 'oil')!,
      canal = r.party!.players.find((p) => p.role === 'canal')!;
    trade(r, oil.id, canal.id, { oil: 3 }, {});
    expect(r.party!.players.find((p) => p.id === oil.id)!.support).toBe(36.5);
    trade(r, canal.id, oil.id, { oil: 3 }, {});
    expect(r.party!.players.every((p) => p.support === 50 && p.influence === 0)).toBe(true);
    for (let i = 0; i < 3; i++) trade(r, oil.id, canal.id, { oil: 1 }, {});
    expect(r.party!.players.find((p) => p.id === oil.id)!.support).toBe(36.5);
    const whole = fixture(3);
    begin(whole);
    trade(whole, oil.id, canal.id, { oil: 3 }, {});
    expect(r.party!.players.map((p) => p.support)).toEqual(whole.party!.players.map((p) => p.support));
  });
  it('does not farm clamping, declarations, chats, no-op trades or repeated needs', () => {
    const r = fixture(3);
    begin(r);
    const oil = r.party!.players.find((p) => p.role === 'oil')!,
      canal = r.party!.players.find((p) => p.role === 'canal')!;
    trade(r, oil.id, canal.id, { oil: 14 }, {});
    expect(r.party!.players.find((p) => p.id === oil.id)!.support).toBe(0);
    trade(r, canal.id, oil.id, { oil: 14 }, {});
    expect(r.party!.players.every((p) => p.support === 50 && p.influence === 0)).toBe(true);
    const id = openTable(r, 'p0', 'p1');
    command(r, 'p0', { kind: 'chat', meeting: id, text: 'I promise everything. Trust me.' });
    expect(r.party!.players.every((p) => p.support === 50)).toBe(true);
    expect(() => command(r, 'p0', { kind: 'proposal', meeting: id, revision: 0, response: 'propose' })).toThrow(
      'meaningful',
    );
    command(r, 'p0', {
      kind: 'terms',
      meeting: id,
      revision: 0,
      terms: { offer: bundle({ credits: 1 }), want: bundle({ credits: 1 }), delay: 0 },
    });
    expect(() => command(r, 'p0', { kind: 'proposal', meeting: id, revision: 1, response: 'propose' })).toThrow(
      'meaningful',
    );
  });
  it('requires online recipients and rejects all production debug controls', () => {
    const r = fixture();
    begin(r);
    expect(() => partyAction(r, 'p0', r.party!.id, { kind: 'call', to: 'p1' }, true, START, new Set(['p0']))).toThrow(
      'offline',
    );
    for (const command of ['advance', 'twist', 'inventory', 'need', 'end'] as const)
      expect(() => partyAction(r, 'p0', r.party!.id, { kind: 'debug', command }, false, START, new Set())).toThrow(
        'unavailable',
      );
  });
});
