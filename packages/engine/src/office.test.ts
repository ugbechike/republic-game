import { expect, it } from 'vitest';
import { pressureWorld } from './pressure-fixture';
import { officeDirector } from './office-director';
import { act } from './actions';
it('paces business decisions, starts persistent construction and prevents duplicate expenditure', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  room.activeMs = 60000;
  officeDirector(room);
  const m = r.officeMatters![0],
    treasury = r.metrics.treasury;
  expect(m.kind).toBe('business');
  act(room, r.id, { type: 'officeDecision', id: m.id, choice: 'incentive' });
  expect(r.metrics.treasury).toBeCloseTo(treasury - 0.6);
  expect(r.effects.some((e) => e.metric === 'gdp' && e.month === 6)).toBe(true);
  expect(r.regions.find((s) => s.id === m.region)!.plots.some((p) => p.kind === 'factory' && p.stage === 1)).toBe(true);
  expect(() => act(room, r.id, { type: 'officeDecision', id: m.id, choice: 'incentive' })).toThrow('closed');
  officeDirector(room);
  expect(r.officeMatters).toHaveLength(1);
  room.activeMs = 360000;
  officeDirector(room);
  expect(r.officeMatters![1].kind).toBe('governor');
});
it('charges half reimbursement exactly and applies consequences when a governor is ignored', () => {
  const room = pressureWorld(),
    r = room.republics[0];
  r.metrics.energy = 20;
  room.activeMs = 60000;
  officeDirector(room);
  const m = r.officeMatters![0],
    money = r.metrics.treasury,
    approval = r.metrics.approval;
  act(room, r.id, { type: 'officeDecision', id: m.id, choice: 'partial' });
  expect(r.metrics.treasury).toBeCloseTo(money - 0.31);
  expect(r.metrics.approval).toBeCloseTo(approval + 0.5);
  room.activeMs = 360000;
  officeDirector(room);
  const next = r.officeMatters![1];
  room.activeMs = next.dueAt;
  officeDirector(room);
  expect(next.status).toBe('expired');
  expect(r.metrics.approval).toBeCloseTo(approval - 0.5);
  expect(() => act(room, r.id, { type: 'officeDecision', id: next.id, choice: 'fund' })).toThrow('closed');
});
