import { describe, it, expect } from 'vitest';
import { begin, command, fixture, START, trade } from './fixture';
import { partyAction } from './actions';
import { partyClock } from './director';
const roles = (r: ReturnType<typeof fixture>) => ({
  oil: r.party!.players.find((p) => p.role === 'oil')!,
  canal: r.party!.players.find((p) => p.role === 'canal')!,
});
function opening(r: ReturnType<typeof fixture>) {
  const { oil, canal } = roles(r);
  command(r, oil.id, { kind: 'call', to: canal.id, purpose: 'passage' });
  const id = r.party!.meetings.at(-1)!.id;
  command(r, canal.id, { kind: 'respond', meeting: id, response: 'join' });
  command(r, canal.id, { kind: 'proposal', meeting: id, revision: 1, response: 'accept' });
  command(r, oil.id, { kind: 'proposal', meeting: id, revision: 1, response: 'sign' });
  command(r, canal.id, { kind: 'proposal', meeting: id, revision: 1, response: 'sign' });
  return id;
}
describe('connected two-player Canal Crisis', () => {
  it('prepares 2 oil for 3 passage, consumes canal fuel, ships explicitly and chains maintenance/emergency', () => {
    const r = fixture();
    begin(r);
    const { oil, canal } = roles(r);
    opening(r);
    expect(r.party!.meetings[0].terms.offer.oil).toBe(2);
    expect(roles(r).canal.inventory.oil).toBe(0);
    expect(roles(r).canal.needs[0].status).toBe('fulfilled');
    expect(roles(r).oil.needs[0].status).toBe('open');
    command(r, oil.id, { kind: 'ship', need: oil.needs[0].id });
    expect(roles(r).oil.inventory).toMatchObject({ oil: 9, passage: 0, credits: 14 });
    expect(r.party!.canal?.maintenance).toBe('pending');
    const emergency = roles(r).oil.needs[1];
    expect(() => command(r, oil.id, { kind: 'ship', need: emergency.id })).toThrow('repairs');
    command(r, canal.id, { kind: 'call', to: oil.id, purpose: 'assistance' });
    const call = r.party!.meetings.at(-1)!;
    expect(call.terms.offer.passage).toBe(2);
    expect(call.terms.want.credits).toBe(4);
    command(r, oil.id, { kind: 'respond', meeting: call.id, response: 'join' });
    for (const [id, response] of [
      [oil.id, 'accept'],
      [oil.id, 'sign'],
      [canal.id, 'sign'],
    ] as const)
      command(r, id, { kind: 'proposal', meeting: call.id, revision: 1, response });
    command(r, canal.id, { kind: 'maintenance', choice: 'repair' });
    command(r, oil.id, { kind: 'ship', need: emergency.id });
    expect(roles(r).oil.inventory).toMatchObject({ oil: 5, passage: 0, credits: 20 });
    expect(roles(r).oil.support).toBe(90);
    const snapshot = structuredClone(r);
    expect(() => command(r, oil.id, { kind: 'ship', need: emergency.id })).toThrow('resolved');
    expect(r).toEqual(snapshot);
  });
  it('restrictions cost support, block shipping, reopen, and checkpoint prevents initial stalling', () => {
    const r = fixture();
    begin(r);
    const { oil, canal } = roles(r);
    opening(r);
    partyClock(r, START + 60000);
    expect(r.party!.canal?.maintenance).toBe('pending');
    command(r, canal.id, { kind: 'maintenance', choice: 'restrict' }, START + 60000);
    expect(() => command(r, oil.id, { kind: 'ship', need: oil.needs[0].id }, START + 70000)).toThrow('closed');
    expect(roles(r).canal.inventory.credits).toBe(8);
    partyClock(r, START + 90000);
    command(r, oil.id, { kind: 'ship', need: oil.needs[0].id }, START + 90000);
    expect(roles(r).oil.inventory.credits).toBe(14);
  });
  it('host ends in production, cancels pending offers, preserves settlements and freezes active deadlines', () => {
    for (const pending of ['none', 'requested', 'proposed', 'accepted'] as const) {
      const r = fixture();
      begin(r);
      const { oil, canal } = roles(r);
      opening(r);
      command(r, oil.id, { kind: 'ship', need: oil.needs[0].id });
      const stocks = structuredClone(r.party!.players.map((p) => p.inventory));
      if (pending !== 'none') {
        command(r, canal.id, { kind: 'call', to: oil.id, purpose: 'assistance' });
        const meeting = r.party!.meetings.at(-1)!;
        if (pending !== 'requested') command(r, oil.id, { kind: 'respond', meeting: meeting.id, response: 'join' });
        if (pending === 'accepted')
          command(r, oil.id, { kind: 'proposal', meeting: meeting.id, revision: 1, response: 'accept' });
      }
      const m = r.party!.id;
      expect(() => partyAction(r, 'p1', m, { kind: 'endGame' }, false, START + 1000, new Set())).toThrow('host');
      partyAction(r, 'p0', m, { kind: 'endGame' }, false, START + 1000, new Set());
      expect(r.party!.endedEarly).toBe(true);
      expect(r.party!.players.map((p) => p.inventory)).toEqual(stocks);
      expect(r.party!.meetings.every((x) => ['signed', 'closed'].includes(x.status))).toBe(true);
      const result = structuredClone(r.party!);
      partyClock(r, START + 500000);
      expect(r.party).toEqual(result);
      expect(() => command(r, oil.id, { kind: 'maintenance', choice: 'repair' })).toThrow('ended');
      command(r, 'p0', { kind: 'rematch' });
      expect(r.party!.canal).toBeUndefined();
      expect(r.party!.endedEarly).toBeUndefined();
      expect(r.party!.meetings).toEqual([]);
    }
  });
  it('honors funded signed future deliveries on early ending exactly once', () => {
    const r = fixture();
    begin(r);
    trade(r, 'p0', 'p1', { credits: 3 }, {}, 30);
    command(r, 'p0', { kind: 'endGame' }, START + 1000);
    expect(r.party!.players[1].inventory.credits).toBe(11);
    expect(r.party!.agreements[0].status).toBe('settled');
    partyClock(r, START + 300000);
    expect(r.party!.players[1].inventory.credits).toBe(11);
  });
  it('limits reset and three-minute configuration to development hosts', () => {
    const r = fixture();
    const id = r.party!.id;
    for (const intent of [{ kind: 'resetMatch' } as const, { kind: 'duration', seconds: 180 } as const])
      expect(() => partyAction(r, 'p0', id, intent, false, START, new Set())).toThrow('unavailable');
    command(r, 'p0', { kind: 'duration', seconds: 180 });
    begin(r);
    expect(r.party!.endsAt - r.party!.startedAt).toBe(180000);
    command(r, 'p0', { kind: 'resetMatch' });
    expect(r.party!.stage).toBe('lobby');
    expect(r.party!.id).not.toBe(id);
  });
});
