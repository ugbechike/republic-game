import type { Action, Republic, Room, War } from '@republic/contracts';
import { clamp, notice, other, random, requireThat, spend, uid } from './helpers';
export function conflict(room: Room, me: Republic, a: Action): boolean {
  if (a.type === 'threat') {
    const target = other(room, me, a.to); requireThat(me.capital >= 5, 'Requires five political capital'); me.capital -= 5;
    notice(room, `${me.name} issued a military ultimatum to ${target.name}. Negotiations are urgent.`); return true;
  }
  if (a.type === 'war') {
    const target = other(room, me, a.to);
    requireThat(!room.wars.some(w => w.status === 'active' && [w.attacker, w.defender].some(id => id === me.id || id === target.id)), 'One of these Republics is already at war');
    requireThat(!room.alliances.some(p => p.status === 'active' && [p.from, p.to].includes(me.id) && [p.from, p.to].includes(target.id)), 'Leave your pact before attacking an ally');
    requireThat(me.metrics.military >= 15 && me.metrics.stability >= 25, 'Military must be at least 15 and stability at least 25');
    const capital = me.house < 50 ? 30 : 15; requireThat(me.capital >= capital, `Requires ${capital} political capital`);
    spend(me, me.house < 50 ? 5 : 3); me.capital -= capital; me.reputation = clamp(me.reputation - 15); me.stats.wars++;
    room.wars.push({ id: uid(room), attacker: me.id, defender: a.to, ends: room.month + 6, support: {}, status: 'active' });
    notice(room, `${me.name} invaded ${target.name}. ${target.name} requests military and financial assistance. A settlement is expected in six months.`);
    if (!room.vote) room.vote = { id: uid(room), title: `Sanction the invasion by ${me.name}`, kind: 'sanction', target: me.id, ends: room.month + 4, ballots: {} };
    for (const p of room.alliances.filter(p => p.status === 'active' && p.kind === 'defence' && [p.from, p.to].includes(target.id))) notice(room, `Defence pact activated: ${target.name} requests your help.`, [p.from === target.id ? p.to : p.from]);
    return true;
  }
  if (a.type === 'assist') {
    const war = room.wars.find(w => w.id === a.id && w.status === 'active'); requireThat(war && [war.attacker, war.defender].includes(a.side), 'Active conflict not found');
    requireThat(![war.attacker, war.defender].includes(me.id), 'Only outside Republics can intervene');
    requireThat(!war.support[me.id], 'You have already committed assistance');
    const side = room.republics.find(r => r.id === a.side)!;
    if (a.kind === 'financial') { spend(me, 2); side.metrics.treasury += 2; war.support[me.id] = { side: a.side, strength: 2 }; }
    else { requireThat(me.capital >= (me.house < 50 ? 15 : 5), 'Insufficient political capital'); spend(me, me.house < 50 ? 2 : 1); me.capital -= me.house < 50 ? 15 : 5; const strength = me.metrics.military * .2; me.metrics.military = clamp(me.metrics.military - strength * .2); war.support[me.id] = { side: a.side, strength }; }
    me.influence = clamp(me.influence + 2); notice(room, `${me.name} committed ${a.kind} assistance to ${side.name}.`); return true;
  }
  return false;
}
function power(r: Republic, w: War) {
  const m = r.metrics;
  return (m.military + r.policies.defence * 1.5 + m.gdp * .07 + m.education * .1) * (.5 + m.stability / 100) + Object.values(w.support).filter(s => s.side === r.id).reduce((n, s) => n + s.strength, 0);
}
export function conflictTick(room: Room) {
  for (const w of room.wars.filter(w => w.status === 'active')) {
    const a = room.republics.find(r => r.id === w.attacker)!, d = room.republics.find(r => r.id === w.defender)!;
    for (const r of [a, d]) { r.metrics.population = Math.max(1, r.metrics.population * .999); r.metrics.infrastructure = clamp(r.metrics.infrastructure - .5); r.metrics.military = clamp(r.metrics.military - .5); }
    if (room.month < w.ends) continue;
    const attack = power(a, w) * (.9 + random(room) * .2), defence = power(d, w) * 1.15;
    const winner = attack > defence ? a : d, loser = winner === a ? d : a;
    const reparations = Math.min(2, loser.metrics.treasury * .2); loser.metrics.treasury -= reparations; winner.metrics.treasury += reparations;
    winner.influence = clamp(winner.influence + 6); loser.influence = clamp(loser.influence - 3);
    winner.metrics.approval = clamp(winner.metrics.approval + 3); loser.metrics.approval = clamp(loser.metrics.approval - 5);
    winner.metrics.military = clamp(winner.metrics.military * .92); loser.metrics.military = clamp(loser.metrics.military * .8);
    w.status = 'ended'; w.winner = winner.id;
    notice(room, `Ceasefire: ${winner.name} secures $${reparations.toFixed(1)}B in reparations. Both Republics retain sovereignty.`);
  }
}
