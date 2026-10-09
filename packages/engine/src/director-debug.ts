import type { Action, Republic, Room } from '@republic/contracts';
import { requireThat, notice } from './helpers';
import { makeBriefing } from './game-director';
import { ensureEconomy } from './economic-history';
import { worldEvent } from './world-director';
import { tick } from './tick';
export function directorDebug(room: Room, me: Republic, a: Action, development: boolean) {
  if (a.type !== 'directorDebug') return false;
  requireThat(development && me.id === room.host, 'Development host only');
  const r = room.republics.find((r) => r.id === (a.target ?? me.id));
  requireThat(r, 'Republic not found');
  ensureEconomy(r);
  const resource = a.resource ?? 'gas';
  if (a.kind === 'advance') {
    for (let i = 0; i < Math.min(24, Math.max(1, Math.floor(a.amount ?? 1))); i++) tick(room);
  } else if (a.kind === 'world') worldEvent(room, a.crisis ?? 'energy');
  else if (a.kind === 'reserves') r.stocks[resource] = a.amount ?? 0;
  else if (a.kind === 'surplus') {
    if (!r.resources.includes(resource)) r.resources.push(resource);
    r.stocks[resource] = a.amount ?? 60;
  } else if (a.kind === 'treasury') {
    r.metrics.treasury = 1;
    makeBriefing(room, r, 'treasury');
  } else if (a.kind === 'flood') makeBriefing(room, r, 'flood');
  else if (a.kind === 'tension')
    makeBriefing(room, r, 'security', resource, room.republics.find((p) => p.id !== r.id)?.id);
  else {
    r.resources = r.resources.filter((k) => k !== resource);
    r.stocks[resource] = 0;
    r.nextBriefingAt = 0;
    makeBriefing(room, r, 'shortage', resource);
    if (a.kind === 'dependency') {
      const other = room.republics.find((p) => p.id !== r.id);
      if (other) {
        if (!other.resources.includes(resource)) other.resources.push(resource);
        other.stocks[resource] = 60;
      }
    }
  }
  notice(room, `Development: ${a.kind} applied to ${r.name}.`, [room.host]);
  return true;
}
