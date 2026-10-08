import { resourceEconomy } from './resource-economy';
import { type Republic, type Room } from '@republic/contracts';
import { clamp, notice } from './helpers';
export function election(room: Room, r: Republic) {
  r.house = Math.round(clamp(r.metrics.approval * 0.65 + r.metrics.stability * 0.35 - r.metrics.inflation, 20, 85));
  notice(room, `${r.name} election: government holds ${r.house}% of the House. The President remains in office.`, [
    r.id,
  ]);
}
export function economy(room: Room, r: Republic) {
  const m = r.metrics,
    p = r.policies;
  for (const change of r.pendingPolicies.filter((c) => c.month <= room.month)) p[change.key] = change.value;
  r.pendingPolicies = r.pendingPolicies.filter((c) => c.month > room.month);
  for (const effect of r.effects.filter((e) => e.month <= room.month)) m[effect.metric] += effect.amount;
  r.effects = r.effects.filter((e) => e.month > room.month);
  const advantage = resourceEconomy(room, r);
  const fuel = Math.min(r.stocks.oil + r.stocks.gas, 1.7);
  const oilUsed = Math.min(r.stocks.oil, fuel);
  r.stocks.oil -= oilUsed;
  r.stocks.gas -= fuel - oilUsed;
  const food = Math.min(r.stocks.agriculture, 1.4);
  r.stocks.agriculture -= food;
  const material = Math.min(r.stocks.iron + r.stocks.timber, 0.7);
  const ironUsed = Math.min(r.stocks.iron, material);
  r.stocks.iron -= ironUsed;
  r.stocks.timber -= material - ironUsed;
  const tech = Math.min(r.stocks.rareEarths, 0.2);
  r.stocks.rareEarths -= tech;
  const energyTarget = clamp((fuel / 1.7) * 60 + p.energy * 1.5 + advantage.energy);
  m.energy += (energyTarget - m.energy) * 0.15;
  m.education = clamp(m.education + (p.education - 7) * 0.06);
  m.healthcare = clamp(m.healthcare + (p.healthcare - 7) * 0.06);
  m.infrastructure = clamp(m.infrastructure + (p.infrastructure - 6) * 0.06 + (material - 0.7) * 0.4);
  const war = room.wars.some((w) => w.status === 'active' && [w.attacker, w.defender].includes(r.id));
  const sanctions = room.sanctions.filter((s) => s.to === r.id && s.ends > room.month).length;
  const pacts = room.alliances.filter(
    (a) => a.status === 'active' && a.kind === 'trade' && [a.from, a.to].includes(r.id),
  ).length;
  const regional = r.regions.reduce((n, s) => n + s.development, 0) / r.regions.length;
  const growth = clamp(
    0.0018 +
      advantage.growth +
      (m.education - 50) / 30000 +
      (m.infrastructure - 50) / 25000 +
      (regional - 50) / 50000 +
      (m.energy - 65) / 7000 +
      (food - 1.4) * 0.004 -
      (p.corporateTax - 22) / 18000 -
      sanctions * 0.0015 -
      (war ? 0.004 : 0) +
      pacts * 0.0005,
    -0.02,
    0.014,
  );
  m.gdp = Math.max(8, m.gdp * (1 + growth));
  const tax = (m.gdp * (p.corporateTax + p.incomeTax)) / 2400;
  const spending =
    (Object.entries(p)
      .filter(([k]) => !k.endsWith('Tax'))
      .reduce((n, [, v]) => n + v, 0) *
      m.gdp) /
    3200;
  const balance = tax - spending - m.debt * 0.004 - (war ? 0.25 : 0);
  m.treasury += balance;
  if (m.treasury < 0) {
    m.debt -= m.treasury;
    m.treasury = 0;
  }
  m.inflation = clamp(m.inflation * 0.97 + 0.12 + (fuel < 1 ? 0.3 : 0) + (m.debt > m.gdp ? 0.15 : 0), 1, 60);
  m.unemployment = clamp(m.unemployment - growth * 55 - (m.education - 50) / 1500 + (war ? 0.05 : 0), 2, 40);
  const targetApproval = clamp(
    78 -
      m.unemployment * 1.1 -
      m.inflation * 0.7 +
      (p.social - 7) * 0.8 +
      (m.healthcare - 50) * 0.12 -
      (p.incomeTax - 18) * 0.45 -
      (food < 1 ? 12 : 0),
  );
  m.approval = clamp(m.approval + (targetApproval - m.approval) * 0.06);
  m.stability = clamp(m.stability + (m.approval - m.stability) * 0.025 - (war ? 0.1 : 0));
  m.military = clamp(m.military + (p.defence - 5) * 0.09 + tech * 0.15);
  m.population *= 1 + (0.0006 + (m.healthcare - 50) / 100000);
  r.capital = clamp(r.capital + (m.approval > 45 ? 0.7 : 0.2));
  for (const [i, s] of r.regions.entries()) {
    s.development = clamp(
      s.development +
        growth * 15 +
        (s.industry === 'iron' ? p.infrastructure : s.industry === 'agriculture' ? p.social : p.energy) / 180 -
        0.04,
    );
    s.infrastructure += (m.infrastructure - s.infrastructure) * 0.08;
    s.unemployment = clamp(m.unemployment + (50 - s.development) / 12, 2, 40);
    s.stability = clamp(m.stability + (s.development - regional) * 0.2);
    s.population = m.population * (i === 0 ? 0.2 : 0.16);
    s.economy = m.gdp * (i === 0 ? 0.25 : 0.15);
    if (room.month % 3 === 0) {
      const plot = s.plots.find((plot) => plot.stage < 4);
      if (plot && growth > -0.001 && m.treasury > 1) plot.stage++;
      else if (growth < -0.004) {
        const last = [...s.plots].reverse().find((p) => p.stage === 4);
        if (last && room.month % 12 === 0) last.stage = 3;
      }
    }
  }
  r.history.push(m.gdp);
  r.history = r.history.slice(-36);
  if (room.month % 48 === 0) election(room, r);
  if (room.month % 12 === 0 && m.approval < 40) {
    r.capital = clamp(r.capital - 8);
    notice(room, `Protests in ${r.name}: governors demand jobs and reliable services.`, [r.id]);
  }
}
