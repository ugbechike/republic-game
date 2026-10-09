import { EMPTY_FLOWS, type Metrics, type Republic, type Room } from '@republic/contracts';
export function ensureEconomy(r: Republic) {
  r.economy ??= { supply: {}, timeline: [], causes: [], revenue: 0, expenditure: 0, tradeBalance: 0 };
  r.flows ??= EMPTY_FLOWS();
  r.briefings ??= [];
  r.credit ??= 70;
  r.relations ??= {};
  return r.economy;
}
export function explain(r: Republic, before: Metrics, reason: string, since?: number) {
  const e = ensureEconomy(r);
  for (const key of Object.keys(before) as (keyof Metrics)[]) {
    const detailed =
      since === undefined
        ? 0
        : e.causes
            .slice(since)
            .filter((c) => c.metric === key)
            .reduce((n, c) => n + c.amount, 0);
    const amount = r.metrics[key] - before[key] - detailed;
    if (Math.abs(amount) > 0.00001) e.causes.push({ metric: key, amount, reason });
  }
  e.causes = e.causes.slice(-120);
}
export function observed(r: Republic, reason: string, work: () => void) {
  const before = { ...r.metrics },
    since = ensureEconomy(r).causes.length;
  work();
  explain(r, before, reason, since);
}
export function recordEconomy(room: Room, r: Republic) {
  const e = ensureEconomy(r),
    m = r.metrics,
    s = e.supply;
  const energy = ['oil', 'gas', 'uranium'] as const;
  e.tradeBalance = r.flows!.received - r.flows!.paid;
  e.timeline.push({
    resources: Object.fromEntries(
      Object.entries(s).map(([k, f]) => [k, { production: f.production, imports: f.imports, exports: f.exports }]),
    ),
    month: room.month,
    gdp: m.gdp,
    debt: m.debt,
    inflation: m.inflation,
    unemployment: m.unemployment,
    approval: m.approval,
    revenue: e.revenue,
    expenditure: e.expenditure,
    energySupply: energy.reduce((n, k) => n + (s[k]?.delivered ?? 0), 0),
    energyDemand: energy.reduce((n, k) => n + (s[k]?.consumption ?? 0), 0),
    foodSupply: s.agriculture?.delivered ?? 0,
    foodDemand: s.agriculture?.consumption ?? 0,
    tradeBalance: e.tradeBalance,
    annotations: room.notices
      .filter((n) => n.month >= room.month - 1 && (!n.audience || n.audience.includes(r.id)))
      .filter((n) => !e.timeline.at(-1)?.annotations.includes(n.text))
      .slice(0, 4)
      .map((n) => n.text),
  });
  e.timeline = e.timeline.slice(-241);
  r.flows = EMPTY_FLOWS();
}
