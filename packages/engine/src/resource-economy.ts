import { RESOURCE_INFO, TRADE_RESOURCES, type Republic, type Room } from '@republic/contracts';
import { clamp } from './helpers';
export function resourceEconomy(room: Room, r: Republic) {
  r.disruptions = (r.disruptions ?? []).filter((d) => d.ends > room.month);
  let energy = 0,
    growth = 0;
  for (const resource of r.resources) {
    const info = RESOURCE_INFO[resource];
    const factor = r.disruptions.some((d) => d.resource === resource) ? 0.5 : 1;
    const industry = r.regions.filter((s) => s.industry === resource).length;
    r.stocks[resource] = clamp(
      (r.stocks[resource] ?? 0) +
        (info.production + (info.production ? industry * 0.4 + r.metrics.infrastructure / 100 : 0)) * factor,
      0,
      240,
    );
    // Only surplus above a strategic reserve is sold to the external market.
    const exports = Math.min(0.8 * factor, Math.max(0, r.stocks[resource] - 18));
    r.stocks[resource] -= exports;
    r.metrics.treasury += exports * info.exportPrice;
    r.metrics.treasury -= info.extraction;
    energy += info.energy * factor * (resource === 'uranium' ? r.policies.energy / 10 : 1);
    growth += info.growth * factor;
    if (resource === 'coastline') {
      r.stocks.agriculture += 0.65 * factor;
      r.metrics.treasury += 0.06 * factor;
    }
    if (resource === 'rivers') r.stocks.agriculture += 0.45 * factor;
  }
  for (const k of TRADE_RESOURCES) r.stocks[k] = clamp(r.stocks[k] ?? 0, 0, 240);
  return { energy, growth };
}
export function startingAdvantages(r: Republic) {
  for (const resource of r.resources) {
    r.influence += RESOURCE_INFO[resource].influence;
    if (resource === 'gold') r.metrics.treasury += 1;
    if (resource === 'coastline') {
      r.metrics.gdp += 3;
      r.metrics.infrastructure += 3;
    }
    if (resource === 'rivers') r.metrics.energy += 5;
    if (resource === 'uranium') {
      r.metrics.energy += 4;
      r.metrics.debt += 2;
    }
    if (resource === 'rareEarths') {
      r.metrics.education += 3;
      r.metrics.debt += 1;
    }
    if (resource === 'agriculture') r.metrics.unemployment -= 1;
  }
  r.history = [r.metrics.gdp];
  for (const [i, region] of r.regions.entries()) region.economy = r.metrics.gdp * (i === 0 ? 0.25 : 0.15);
}
