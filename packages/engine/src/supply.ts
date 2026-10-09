import {
  MONTHLY_DEMAND,
  TRADE_RESOURCES,
  RESOURCE_LABEL,
  type Commodity,
  type Republic,
  type Room,
} from '@republic/contracts';
import { clamp } from './helpers';
import { ensureEconomy, observed } from './economic-history';
export function demand(r: Republic, resource: Commodity) {
  if (resource === 'uranium' && !r.resources.includes('uranium') && r.policies.energy < 12) return 0;
  if (resource === 'copper' && r.policies.energy < 10 && r.policies.infrastructure < 10) return 0;
  const scale = clamp(r.metrics.population / 10, 0.7, 2);
  const alternative =
    resource === 'oil' || resource === 'gas'
      ? (r.resources.includes('uranium') ? 0.75 : 1) * (r.resources.includes('rivers') ? 0.9 : 1)
      : 1;
  return (
    MONTHLY_DEMAND[resource] *
    scale *
    alternative *
    (resource === 'agriculture' && r.resources.includes('freshWater') ? 0.85 : 1)
  );
}
export function consumeSupply(room: Room, r: Republic, before: Record<string, number>) {
  const e = ensureEconomy(r),
    flow = r.flows!;
  for (const k of TRADE_RESOURCES) {
    const consumption = demand(r, k),
      production = flow.production?.[k] ?? Math.max(0, r.stocks[k] - (before[k] ?? 0)),
      reserveBefore = r.stocks[k];
    const delivered = Math.min(consumption, reserveBefore);
    r.stocks[k] -= delivered;
    const last = e.supply[k],
      shortage = delivered + 0.001 < consumption;
    const shortageMonths = shortage ? (last?.shortageMonths ?? 0) + 1 : Math.max(0, (last?.shortageMonths ?? 0) - 2);
    const balance = production + (flow.imports[k] ?? 0) - (flow.exports[k] ?? 0) - consumption;
    e.supply[k] = {
      production,
      consumption,
      delivered,
      imports: flow.imports[k] ?? 0,
      exports: flow.exports[k] ?? 0,
      reserve: r.stocks[k],
      balance,
      coverage: balance < -0.001 ? r.stocks[k] / -balance : 999,
      shortageMonths,
      stage: Math.min(5, Math.ceil(shortageMonths / 2)),
    };
  }
  return {
    fuel:
      ((e.supply.oil!.delivered + e.supply.gas!.delivered) / Math.max(0.01, demand(r, 'oil') + demand(r, 'gas'))) * 1.7,
    food: e.supply.agriculture!.delivered,
    material: e.supply.iron!.delivered + e.supply.timber!.delivered,
    tech: e.supply.rareEarths!.delivered,
  };
}
export function shortageConsequences(r: Republic) {
  const e = ensureEconomy(r);
  for (const k of TRADE_RESOURCES) {
    const f = e.supply[k];
    if (!f?.stage) continue;
    const recovering = f.delivered + 0.001 >= f.consumption,
      weight = recovering ? 0.35 : 1;
    observed(r, `${RESOURCE_LABEL[k]}: ${recovering ? 'recovering from' : 'stage ' + f.stage + ' of'} shortage`, () => {
      r.metrics.inflation = clamp(r.metrics.inflation + 0.12 * weight, 1, 60);
      if (f.stage >= 2 && (k === 'oil' || k === 'gas' || k === 'uranium'))
        r.metrics.energy = clamp(r.metrics.energy - 0.6 * weight);
      if (f.stage >= 3) r.metrics.gdp = Math.max(8, r.metrics.gdp * (1 - 0.0015 * weight));
      if (f.stage >= 4) r.metrics.unemployment = clamp(r.metrics.unemployment + 0.12 * weight, 2, 40);
      if (f.stage >= 5) r.metrics.approval = clamp(r.metrics.approval - 0.4 * weight);
    });
  }
}
