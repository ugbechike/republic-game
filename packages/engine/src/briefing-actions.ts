import type { Action, Republic, Room } from '@republic/contracts';
import { clamp, notice, requireThat, spend, uid } from './helpers';
import { observed } from './economic-history';
import { demand } from './supply';
export function briefingAction(room: Room, r: Republic, a: Action) {
  if (a.type !== 'briefing') return false;
  const b = r.briefings?.find((b) => b.id === a.id && b.status === 'open');
  requireThat(b && (room.activeMs ?? 0) < b.dueAt, 'This briefing is no longer open');
  observed(r, b.title + ': ' + a.choice, () => {
    if (a.choice === 'resolve') {
      requireThat(b.kind !== 'security', 'Choose a diplomatic or strategic response');
      if (b.kind === 'treasury') requireThat(r.metrics.treasury >= 5, 'Restore reserves to at least $5B');
      if (b.resource) {
        const flow = r.economy?.supply[b.resource];
        requireThat(
          r.stocks[b.resource] >= b.amount || (b.kind === 'shortage' && flow && flow.balance >= 0),
          'Secure the required reserves or recurring supply first',
        );
      }
      requireThat(r.metrics.treasury >= b.cost, 'Insufficient treasury for reconstruction');
      spend(r, b.cost);
      if (b.kind === 'flood' && b.resource) {
        r.stocks[b.resource] -= b.amount;
        r.metrics.infrastructure = clamp(r.metrics.infrastructure + 4);
        const region = r.regions.find((s) => s.id === b.region);
        if (region) {
          region.infrastructure = clamp(region.infrastructure + 6);
          if (region.flood) region.flood.recovering = true;
        }
      }
      r.metrics.approval = clamp(r.metrics.approval + 2);
      b.status = 'resolved';
    } else if (a.choice === 'delay') {
      requireThat(!b.delayed, 'You can delay a briefing only once');
      b.delayed = true;
      b.dueAt += 60000;
      r.metrics.approval = clamp(r.metrics.approval - 1);
    } else if (a.choice === 'assistance') {
      requireThat(!b.requested, 'Assistance has already been requested');
      b.requested = true;
      notice(
        room,
        `${r.name} requests ${b.resource ? b.amount.toFixed(1) + ' units of ' + b.resource : 'financial'} assistance. Human Presidents may negotiate a trade or loan; no transfer is automatic.`,
      );
    } else if (a.choice === 'alternative') {
      requireThat(b.resource && b.kind !== 'flood', 'Alternative procurement is available for resource shortages');
      requireThat(!b.alternativeUsed, 'Emergency procurement is available once per briefing');
      spend(r, 3);
      b.alternativeUsed = true;
      r.stocks[b.resource] += demand(r, b.resource) * 4;
      r.metrics.approval = clamp(r.metrics.approval - 2);
    } else if (a.choice === 'mediation') {
      requireThat(!room.vote, 'An Assembly vote is already open');
      spend(r, 1);
      room.vote = {
        id: uid(room),
        kind: 'trade',
        target: r.id,
        title: `Mediate access to supplies for ${r.name}`,
        ends: room.month + 12,
        opensAt: (room.activeMs ?? 0) + 30000,
        ballots: {},
      };
    }
  });
  notice(room, `${r.name}: ${b.title} — ${a.choice}${b.status === 'resolved' ? ' completed' : ''}.`, [r.id]);
  return true;
}
