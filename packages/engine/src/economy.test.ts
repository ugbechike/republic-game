import { describe, expect, it } from 'vitest';
import { createRoom } from './create';
import { act } from './actions';
import { tick } from './tick';
import { economy, election } from './economy';
export function fixture() {
  const room = createRoom(
    'ABCDE',
    'a',
    'hash',
    { name: 'Solara', leader: 'Ada', flag: '🌅', resources: ['agriculture', 'oil'] },
    { duration: 60, maxPlayers: 4, difficulty: 'developing' },
  );
  room.phase = 'playing';
  return room;
}
describe('monthly simulation', () => {
  it('delays policies three months and charges political capital', () => {
    const room = fixture(),
      r = room.republics[0];
    act(room, 'a', { type: 'policy', key: 'education', value: 15 });
    expect(r.policies.education).toBe(8);
    tick(room);
    tick(room);
    expect(r.policies.education).toBe(8);
    tick(room);
    expect(r.policies.education).toBe(15);
  });
  it('makes food and fuel shortages affect output', () => {
    const good = fixture(),
      bad = fixture();
    bad.republics[0].resources = ['gold'];
    for (const k of ['oil', 'gas', 'agriculture'] as const) bad.republics[0].stocks[k] = 0;
    for (let i = 0; i < 12; i++) {
      tick(good);
      tick(bad);
    }
    expect(good.republics[0].metrics.gdp).toBeGreaterThan(bad.republics[0].metrics.gdp);
    expect(bad.republics[0].metrics.approval).toBeLessThan(good.republics[0].metrics.approval);
  });
  it('consumes production and never permits negative inventories', () => {
    const room = fixture(),
      r = room.republics[0];
    for (let i = 0; i < 240; i++) tick(room);
    for (const n of Object.values(r.stocks)) expect(n).toBeGreaterThanOrEqual(0);
    for (const n of Object.values(r.metrics)) expect(Number.isFinite(n)).toBe(true);
  });
  it('elects a hostile House without removing the president', () => {
    const room = fixture(),
      r = room.republics[0];
    r.metrics.approval = 20;
    election(room, r);
    expect(r.house).toBeLessThan(50);
    expect(room.host).toBe('a');
  });
  it('keeps persistent plot positions through development', () => {
    const room = fixture(),
      r = room.republics[0];
    const before = r.regions[0].plots.map((p) => [p.id, p.x, p.z]);
    room.month = 3;
    economy(room, r);
    expect(r.regions[0].plots.map((p) => [p.id, p.x, p.z])).toEqual(before);
  });
});
