import {
  TRADE_RESOURCES,
  RESOURCE_LABEL,
  type Briefing,
  type Commodity,
  type Republic,
  type Room,
} from '@republic/contracts';
import { pressurePriority, briefingCadence } from './pressure-priority';
import { ensureEconomy, observed } from './economic-history';
import { demand } from './supply';
import { clamp, notice, uid } from './helpers';
export function suppliers(room: Room, resource: Commodity, exclude: string) {
  return room.republics
    .filter(
      (p) =>
        p.id !== exclude &&
        p.economy?.supply[resource] &&
        p.economy.supply[resource]!.production > p.economy.supply[resource]!.consumption,
    )
    .sort(
      (a, b) =>
        b.economy!.supply[resource]!.production -
        b.economy!.supply[resource]!.consumption -
        (a.economy!.supply[resource]!.production - a.economy!.supply[resource]!.consumption),
    );
}
export function makeBriefing(
  room: Room,
  r: Republic,
  kind: Briefing['kind'],
  resource: Commodity = 'iron',
  target?: string,
) {
  ensureEconomy(r);
  const now = room.activeMs ?? 0,
    region = [...r.regions].sort((a, b) => a.infrastructure - b.infrastructure)[0];
  const energy = ['oil', 'gas', 'uranium'].includes(resource),
    need = demand(r, resource) * 8;
  const b: Briefing = {
    id: uid(room),
    kind,
    resource: kind === 'treasury' ? undefined : resource,
    amount: kind === 'flood' ? 2.4 : need,
    cost: kind === 'flood' ? 1.8 : 0,
    damage: kind === 'flood' ? 4.2 : 2,
    createdAt: now,
    dueAt: now + (kind === 'flood' ? 240000 : 180000),
    status: 'open',
    target,
    region: kind === 'flood' ? region.id : undefined,
    minister:
      kind === 'flood'
        ? `Governor of ${region.name}`
        : kind === 'treasury'
          ? 'Minister of Finance'
          : kind === 'security'
            ? 'National Security Council'
            : energy
              ? 'Minister of Energy'
              : resource === 'agriculture'
                ? 'Minister of Agriculture'
                : 'Minister of Trade',
    title:
      kind === 'flood'
        ? 'Bridges washed away'
        : kind === 'treasury'
          ? 'Treasury under pressure'
          : kind === 'security'
            ? 'Scarcity is becoming a security issue'
            : `${resource === 'oil' ? 'Oil' : RESOURCE_LABEL[resource]} reserves are falling`,
    description:
      kind === 'flood'
        ? `Flooding has cut two road links in ${region.name}. Reconstruction needs cash and iron. Delay will damage the regional economy.`
        : kind === 'treasury'
          ? 'Reserves are below $3B. Secure a bilateral loan, earn export income, or accept an institutional facility with binding conditions.'
          : kind === 'security'
            ? 'Recent negotiations failed while supplies remained insecure. Seek another supplier, mediation or alternative inputs before considering economic or military pressure.'
            : `Domestic output cannot cover ${RESOURCE_LABEL[resource].toLowerCase()} demand. Secure eight months of reserves or enough recurring supply to cover the monthly deficit. Your suppliers set their own terms.`,
  };
  if (kind === 'flood') region.flood = { severity: 1, recovering: false, started: room.month };
  r.briefings!.push(b);
  r.briefings = r.briefings!.slice(-18);
  r.nextBriefingAt = now + briefingCadence(room);
  notice(room, `${b.minister}: ${b.title}.`, [r.id]);
  return b;
}
export function gameDirector(room: Room) {
  const now = room.activeMs ?? 0;
  for (const [index, r] of room.republics.entries()) {
    const e = ensureEconomy(r);
    for (const b of r.briefings!.filter((b) => b.status === 'open')) {
      const f = b.resource ? e.supply[b.resource] : undefined;
      if (
        (b.kind === 'shortage' || b.kind === 'security') &&
        f &&
        (f.reserve >= b.amount || (f.balance >= 0 && f.delivered >= f.consumption))
      ) {
        b.status = 'resolved';
        notice(
          room,
          `${r.name} secured ${RESOURCE_LABEL[b.resource!]} supplies. Shortage effects will ease over the coming months.`,
          [r.id],
        );
      } else if (b.kind === 'treasury' && r.metrics.treasury >= 5) {
        b.status = 'resolved';
        notice(room, `${r.name}'s immediate treasury pressure has eased.`, [r.id]);
      } else if (now >= b.dueAt) {
        b.status = 'expired';
        observed(r, `${b.title}: response deadline missed`, () => {
          r.metrics.approval = clamp(r.metrics.approval - 2);
          if (b.kind === 'flood') {
            r.metrics.gdp = Math.max(8, r.metrics.gdp - b.damage);
            const region = r.regions.find((s) => s.id === b.region);
            if (region) region.infrastructure = clamp(region.infrastructure - 6);
            r.metrics.infrastructure = clamp(r.metrics.infrastructure - 2);
          }
        });
        notice(
          room,
          `${r.name}: response deadline passed for ${b.title.toLowerCase()}. ${b.kind === 'flood' ? 'Reconstruction delays damaged GDP.' : 'Underlying shortages continue until supply recovers.'}`,
          [r.id],
        );
      }
    }
    if (
      r.id.startsWith('bot-') ||
      r.briefings!.some((b) => b.status === 'open') ||
      now < (r.nextBriefingAt ?? 0) ||
      now < 30000 + index * 15000
    )
      continue;
    if (r.metrics.treasury < 3) {
      makeBriefing(room, r, 'treasury');
      continue;
    }
    const needs = TRADE_RESOURCES.filter((k) => {
      const f = e.supply[k];
      return f && f.consumption > 0 && f.balance < -0.02 && (f.coverage < 8 || f.stage > 0);
    }).sort((a, b) => {
      const score = (k: Commodity) => pressurePriority(room, r, k, suppliers(room, k, r.id));
      return score(b) - score(a);
    });
    const resource = needs[0];
    if (resource) {
      const supplier = suppliers(room, resource, r.id)[0];
      const refusals = room.deals.filter(
        (d) =>
          d.from === r.id &&
          d.to === supplier?.id &&
          d.status === 'rejected' &&
          room.month - d.created <= 24 &&
          (d.want.resource === resource || d.want.items?.some((i) => i.resource === resource)),
      ).length;
      makeBriefing(
        room,
        r,
        room.month >= 40 && refusals >= 2 && e.supply[resource]!.stage >= 3 ? 'security' : 'shortage',
        resource,
        supplier?.id,
      );
    } else if (
      room.month > 40 &&
      r.regions.some((s) => s.infrastructure < 50) &&
      r.resources.some((k) => ['rivers', 'coastline'].includes(k))
    )
      makeBriefing(room, r, 'flood');
  }
}
