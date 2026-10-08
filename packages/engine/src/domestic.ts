import type { Action, Republic, Room } from '@republic/contracts';
import { clamp, notice, requireThat, spend } from './helpers';
import { resolveCrisis, triggerCrisis } from './events';
import { election } from './economy';
export function domestic(room: Room, r: Republic, a: Action, development: boolean): boolean {
  if (a.type === 'policy') {
    const isTax = a.key.endsWith('Tax');
    requireThat(isTax || a.value <= 20, 'Spending is capped at 20');
    requireThat(!r.pendingPolicies.some((c) => c.key === a.key), 'A change to this policy is already pending');
    const cost = r.house < 50 ? 12 : 5;
    requireThat(r.capital >= cost, 'Not enough political capital');
    r.capital -= cost;
    r.pendingPolicies.push({ key: a.key, value: a.value, month: room.month + 3 });
    notice(room, `${a.key} bill passed. Takes effect in three months.`, [r.id]);
    return true;
  }
  if (a.type === 'crisis') {
    resolveCrisis(room, r, a.choice);
    return true;
  }
  if (a.type === 'institution') {
    if (a.kind === 'development') {
      requireThat(r.metrics.debt < r.metrics.gdp, 'Debt burden too high for a development loan');
      r.metrics.treasury += 5;
      r.metrics.debt += 5;
      r.effects.push({ month: room.month + 6, metric: 'infrastructure', amount: 5 });
    }
    if (a.kind === 'emergency') {
      requireThat(
        r.metrics.treasury < 3 && r.policies.social >= 3,
        'Emergency aid requires reserves below $3B and social spending of at least 3',
      );
      r.metrics.treasury += 4;
      r.metrics.debt += 5;
      r.policies.incomeTax = Math.min(40, r.policies.incomeTax + 3);
      r.policies.social -= 3;
      r.pendingPolicies = r.pendingPolicies.filter((p) => !['social', 'incomeTax'].includes(p.key));
      r.metrics.approval = clamp(r.metrics.approval - 5);
    }
    if (a.kind === 'dispute') {
      requireThat(
        room.sanctions.some((s) => s.to === r.id),
        'No active sanction to dispute',
      );
      requireThat(!room.vote, 'An Assembly vote is already open');
      spend(r, 1);
      room.vote = {
        id: `${room.month}-dispute`,
        kind: 'trade',
        target: r.id,
        title: `Restore open trade with ${r.name}`,
        ends: room.month + 4,
        ballots: {},
      };
    }
    notice(
      room,
      `${r.name} has engaged the ${a.kind === 'development' ? 'Global Development Bank' : a.kind === 'emergency' ? 'International Monetary Authority' : 'World Trade Council'}.`,
    );
    return true;
  }
  if (a.type === 'debug') {
    requireThat(development && r.id === room.host, 'Development host only');
    if (a.kind === 'speed') {
      room.speed = room.speed === 1 ? 30 : 1;
      room.nextTick = Date.now() + 1000;
    }
    if (a.kind === 'event') triggerCrisis(room, r);
    if (a.kind === 'money') r.metrics.treasury += 30;
    if (a.kind === 'approval') r.metrics.approval = r.metrics.approval > 40 ? 25 : 80;
    if (a.kind === 'election') election(room, r);
    if (a.kind === 'recession') {
      r.metrics.gdp *= 0.7;
      r.metrics.unemployment = 25;
      r.metrics.energy = 15;
    }
    if (a.kind === 'end') room.month = 239;
    return true;
  }
  return false;
}
