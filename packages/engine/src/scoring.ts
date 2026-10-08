import type { Republic, Room, Score } from '@republic/contracts';
import { clamp, notice } from './helpers';
export function score(r: Republic, room: Room): Score {
  const m = r.metrics;
  const economy = clamp(m.gdp * 1.1 + m.treasury * 1.4 - m.debt * .4 + r.stats.deliveries * .25, 0, 200);
  const prosperity = clamp((100 - m.unemployment * 2 + m.education + m.healthcare + Math.min(100, m.gdp / m.population * 10)) / 2, 0, 200);
  const pacts = room.alliances.filter(a => a.status === 'active' && [a.from, a.to].includes(r.id)).length;
  const influence = clamp(r.influence + r.reputation * .8 + pacts * 8, 0, 200);
  const strength = clamp((m.infrastructure + m.energy + m.military) * 2 / 3, 0, 200);
  const stability = clamp((m.approval + m.stability + r.house) * 2 / 3, 0, 200);
  const categories = { economy, prosperity, influence, strength, stability };
  return { id: r.id, name: r.name, flag: r.flag, total: Math.round(Object.values(categories).reduce((n, s) => n + s, 0)), ...categories, debt: m.debt, military: m.military, diplomacy: r.reputation + r.stats.deliveries * .1 };
}
export function finish(room: Room) { room.month = 240; room.phase = 'ended'; room.results = room.republics.map(r => score(r, room)).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)); notice(room, `${room.results[0].name} leads the final World Power Ranking. The Assembly is adjourned.`); }
