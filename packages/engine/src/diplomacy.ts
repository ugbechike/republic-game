import type { Action, Republic, Room } from '@republic/contracts';
import { clamp, notice, other, requireThat, spend, uid } from './helpers';
export function diplomacy(room: Room, me: Republic, a: Action): boolean {
  if (a.type === 'alliance') {
    const target = other(room, me, a.to);
    requireThat(!room.alliances.some(p => p.kind === a.kind && p.status !== 'ended' && [p.from, p.to].includes(me.id) && [p.from, p.to].includes(a.to)), 'A pact or invitation already exists');
    room.alliances.push({ id: uid(room), from: me.id, to: a.to, kind: a.kind, status: 'pending' }); notice(room, `${me.name} proposes a ${a.kind} pact to ${target.name}.`); return true;
  }
  if (a.type === 'allianceResponse') {
    const p = room.alliances.find(p => p.id === a.id); requireThat(p && p.to === me.id && p.status === 'pending', 'Invitation not available');
    p.status = a.accept ? 'active' : 'ended';
    if (a.accept) { for (const id of [p.from, p.to]) { const r = room.republics.find(r => r.id === id)!; r.influence = clamp(r.influence + 2); } notice(room, `${me.name} entered a ${p.kind} pact.`); }
    return true;
  }
  if (a.type === 'leaveAlliance') {
    const p = room.alliances.find(p => p.id === a.id); requireThat(p && [p.from, p.to].includes(me.id) && p.status === 'active', 'Pact not found');
    p.status = 'ended'; me.reputation = clamp(me.reputation - 10); me.influence = clamp(me.influence - 3); me.stats.betrayals++; notice(room, `${me.name} abandoned a ${p.kind} pact.`); return true;
  }
  if (a.type === 'loan') {
    other(room, me, a.to); requireThat(room.loans.filter(l => l.from === me.id && l.status === 'pending').length < 4, 'Resolve pending loan offers first');
    requireThat(me.metrics.treasury >= a.amount, 'Insufficient reserves to offer this loan'); room.loans.push({ id: uid(room), from: me.id, to: a.to, amount: a.amount, remaining: a.amount * 1.1, months: 24, status: 'pending' }); notice(room, `${me.name} offers a two-year loan at 10% total interest.`, [me.id, a.to]); return true;
  }
  if (a.type === 'loanResponse') {
    const l = room.loans.find(l => l.id === a.id); requireThat(l && l.to === me.id && l.status === 'pending', 'Loan offer unavailable');
    if (!a.accept) { l.status = 'rejected'; return true; }
    const lender = room.republics.find(r => r.id === l.from)!; spend(lender, l.amount); me.metrics.treasury += l.amount; me.metrics.debt += l.remaining; l.status = 'active'; notice(room, `${me.name} accepted a bilateral loan.`, [l.from, l.to]); return true;
  }
  if (a.type === 'sanction') {
    const target = other(room, me, a.to); requireThat(!room.sanctions.some(s => s.from === me.id && s.to === a.to), 'Sanction already active'); spend(me, .5);
    room.sanctions.push({ from: me.id, to: a.to, ends: room.month + 24 }); target.stats.sanctions++; me.metrics.gdp *= .995; notice(room, `${me.name} imposed two-year sanctions on ${target.name}. Bilateral trade will be disrupted.`); return true;
  }
  if (a.type === 'vote') { requireThat(room.vote && room.vote.ends > room.month, 'No open Assembly vote'); requireThat(room.vote.ballots[me.id] === undefined, 'Your vote is already recorded'); room.vote.ballots[me.id] = a.support; return true; }
  return false;
}
export function diplomacyTick(room: Room) {
  room.sanctions = room.sanctions.filter(s => s.ends > room.month);
  for (const l of room.loans.filter(l => l.status === 'active')) {
    const lender = room.republics.find(r => r.id === l.from)!, borrower = room.republics.find(r => r.id === l.to)!;
    const due = Math.min(l.remaining, l.amount * 1.1 / 24), paid = Math.min(borrower.metrics.treasury, due);
    borrower.metrics.treasury -= paid; borrower.metrics.debt = Math.max(0, borrower.metrics.debt - paid); lender.metrics.treasury += paid; l.remaining -= paid;
    if (paid < due) { borrower.reputation = clamp(borrower.reputation - 1); if (room.month % 6 === 0) notice(room, `${borrower.name} is in arrears on its bilateral loan.`, [l.from, l.to]); }
    if (l.remaining < .001) l.status = 'paid'; l.months = Math.max(0, l.months - 1);
  }
  if (room.vote && room.month >= room.vote.ends) {
    const v = room.vote, yes = Object.values(v.ballots).filter(Boolean).length, passed = yes > room.republics.length / 2;
    const target = room.republics.find(r => r.id === v.target)!;
    if (passed) {
      if (v.kind === 'aid') { target.metrics.treasury += 3; target.metrics.approval = clamp(target.metrics.approval + 4); }
      if (v.kind === 'trade') { room.sanctions = room.sanctions.filter(s => s.to !== v.target); for (const r of room.republics) r.metrics.gdp *= 1.01; }
      if (v.kind === 'sanction') { for (const r of room.republics.filter(r => r.id !== v.target)) if (!room.sanctions.some(s => s.from === r.id && s.to === v.target)) room.sanctions.push({ from: r.id, to: v.target, ends: room.month + 24 }); target.stats.sanctions++; }
      for (const r of room.republics.filter(r => v.ballots[r.id])) r.influence = clamp(r.influence + 1);
    }
    notice(room, `Assembly: “${v.title}” ${passed ? 'passed' : 'failed'} (${yes}/${room.republics.length} in favour).`); delete room.vote;
  }
  if (room.month % 36 === 0 && !room.vote) room.vote = { id: uid(room), kind: 'trade', target: room.host, title: 'A global open-trade initiative', ends: room.month + 4, ballots: {} };
}
