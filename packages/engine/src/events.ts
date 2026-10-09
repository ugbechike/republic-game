import { resourceEvents } from './resource-events';
import type { Crisis, Republic, Room } from '@republic/contracts';
import { clamp, notice, random, spend, uid } from './helpers';
const events: Pick<Crisis, 'kind' | 'title' | 'description'>[] = [
  {
    kind: 'power',
    title: 'The grid goes dark',
    description: 'Factories are idle. Governors demand a response before this becomes a national shutdown.',
  },
  {
    kind: 'flood',
    title: 'The river has broken its banks',
    description:
      'Coastal communities need shelter. Emergency reconstruction will compete with your international commitments.',
  },
  {
    kind: 'scandal',
    title: 'The missing billions',
    description:
      'A procurement scandal has reached the House. An independent inquiry costs political capital and money.',
  },
  {
    kind: 'boom',
    title: 'An investor at the door',
    description:
      'A foreign consortium wants to develop a new industrial district. Public funding keeps control; private funding creates inflation pressure.',
  },
  {
    kind: 'health',
    title: 'Hospitals at capacity',
    description: 'A health emergency is spreading. Governors ask for emergency supplies and funding.',
  },
  {
    kind: 'drought',
    title: 'A season without rain',
    description: 'Harvests have failed. Secure food imports or pay for relief before prices hit the streets.',
  },
];
export function triggerCrisis(room: Room, r: Republic) {
  if (r.crisis) return;
  const specific = resourceEvents(r);
  const general = events.filter(
    (e) =>
      !['drought', 'flood'].includes(e.kind) ||
      r.resources.some((k) => ['agriculture', 'rivers', 'coastline'].includes(k)),
  );
  const pool = random(room) < 0.7 && specific.length ? specific : general;
  r.crisis = { ...pool[Math.floor(random(room) * pool.length)], id: uid(room), expires: room.month + 6 };
  if (r.crisis.resource) {
    r.disruptions = [...(r.disruptions ?? []), { resource: r.crisis.resource, ends: room.month + 6 }];
    const metric = r.crisis.affectedMetric ?? 'infrastructure';
    r.metrics[metric] = clamp(r.metrics[metric] - 4);
  }
  notice(room, `${r.name}: ${r.crisis.title}. Cabinet decision required.`, [r.id]);
}
export function resolveCrisis(room: Room, r: Republic, choice: 'intervene' | 'appeal' | 'market') {
  if (!r.crisis) throw new Error('No active crisis');
  const metric =
    r.crisis.affectedMetric ??
    (r.crisis.kind === 'power'
      ? 'energy'
      : r.crisis.kind === 'health'
        ? 'healthcare'
        : r.crisis.kind === 'scandal'
          ? 'stability'
          : 'infrastructure');
  if (choice === 'intervene') {
    spend(r, 2);
    r.effects.push({ month: room.month + 3, metric, amount: 8 });
    r.effects.push({ month: room.month + 2, metric: 'approval', amount: 5 });
  }
  if (choice === 'appeal') {
    r.metrics.approval = clamp(r.metrics.approval - 3);
    notice(room, `${r.name} requests foreign financial and resource assistance. There is an opportunity to negotiate.`);
    if (!room.vote)
      room.vote = {
        id: uid(room),
        kind: 'aid',
        target: r.id,
        title: `Emergency assistance for ${r.name}`,
        ends: room.month + 12,
        opensAt: (room.activeMs ?? 0) + 30000,
        ballots: {},
      };
  }
  if (choice === 'market') {
    r.effects.push({ month: room.month + 3, metric, amount: 5 });
    r.effects.push({ month: room.month + 4, metric: 'inflation', amount: 3 });
    r.metrics.approval = clamp(r.metrics.approval - 4);
  }
  delete r.crisis;
}
export function eventsTick(room: Room, r: Republic) {
  if (r.crisis && room.month >= r.crisis.expires) {
    r.metrics.approval = clamp(r.metrics.approval - 7);
    r.metrics.infrastructure = clamp(r.metrics.infrastructure - 3);
    notice(room, `${r.name}'s unresolved crisis has damaged public confidence.`, [r.id]);
    delete r.crisis;
  }
  // Major new issues are paced by GameDirector; legacy crises still resolve.
  if (room.month % 24 === 0) {
    const s = r.regions[1 + Math.floor(random(room) * 5)];
    notice(
      room,
      `Governor of ${s.name}: ${s.unemployment > 12 ? 'jobs are scarce. Please secure new trade and infrastructure.' : 'our development programme is creating jobs.'}`,
      [r.id],
    );
  }
}
