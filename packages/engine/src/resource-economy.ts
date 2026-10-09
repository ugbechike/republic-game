import { RESOURCE_INFO, QUALITY_FACTOR, TRADE_RESOURCES, type Republic, type Room } from '@republic/contracts';
import { clamp } from './helpers';
import { marketFactor } from './world-director';
import { ensureEconomy } from './economic-history';
export function resourceEconomy(room: Room, r: Republic) {
  r.disruptions = (r.disruptions ?? []).filter((d) => d.ends > room.month);
  let energy = 0,
    growth = 0;
  for (const resource of r.resources) {
    const info = RESOURCE_INFO[resource];
    const market = marketFactor(room, resource);
    const quality = QUALITY_FACTOR[r.resourceQuality?.[resource] ?? 'Moderate'];
    const factor = quality * (r.disruptions.some((d) => d.resource === resource) ? 0.5 : 1) * market.production;
    const industry = r.regions.filter((s) => s.industry === resource).length;
    const produced =
      (info.production + (info.production ? industry * 0.4 + r.metrics.infrastructure / 100 : 0)) * factor;
    r.stocks[resource] = clamp((r.stocks[resource] ?? 0) + produced, 0, 240);
    const e = ensureEconomy(r),
      flows = r.flows!;
    flows.production ??= {};
    if (TRADE_RESOURCES.includes(resource as (typeof TRADE_RESOURCES)[number])) {
      const key = resource as (typeof TRADE_RESOURCES)[number];
      flows.production[key] = (flows.production[key] ?? 0) + produced;
      const exports = Math.min(info.production * 0.15 * factor * market.demand, Math.max(0, r.stocks[key] - 18));
      r.stocks[key] -= exports;
      flows.exports[key] = (flows.exports[key] ?? 0) + exports;
      const revenue = exports * info.exportPrice * market.price * (r.resources.includes('port') ? 1.2 : 1);
      r.metrics.treasury += revenue;
      e.revenue += revenue;
      flows.received += revenue;
    }
    r.metrics.treasury -= info.extraction;
    e.expenditure += info.extraction;
    energy += info.energy * factor * (resource === 'uranium' ? r.policies.energy / 10 : 1);
    growth += info.growth * factor;
    if (resource === 'coastline') {
      r.stocks.agriculture += 0.65 * factor;
      flows.production.agriculture = (flows.production.agriculture ?? 0) + 0.65 * factor;
      r.metrics.treasury += 0.06 * factor;
      e.revenue += 0.06 * factor;
    }
    if (resource === 'fisheries') {
      const food = 2.7 * factor;
      r.stocks.agriculture += food;
      flows.production.agriculture = (flows.production.agriculture ?? 0) + food;
    }
    if (resource === 'rivers') {
      r.stocks.agriculture += 0.45 * factor;
      flows.production.agriculture = (flows.production.agriculture ?? 0) + 0.45 * factor;
    }
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
