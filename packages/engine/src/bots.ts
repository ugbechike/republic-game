import type { Room } from '@republic/contracts';
import { tradeAction } from './trade';
import { diplomacy } from './diplomacy';
import { resolveCrisis } from './events';
// Development delegates respond deterministically; they are not competitive AI.
export function botsTick(room: Room) {
  for (const r of room.republics.filter((r) => r.id.startsWith('bot-'))) {
    for (const deal of room.deals.filter((d) => d.to === r.id && d.status === 'pending')) {
      try {
        tradeAction(room, r, { type: 'dealResponse', id: deal.id, accept: true });
      } catch {
        deal.status = 'rejected';
      }
    }
    for (const a of room.alliances.filter((a) => a.to === r.id && a.status === 'pending'))
      diplomacy(room, r, { type: 'allianceResponse', id: a.id, accept: true });
    for (const l of room.loans.filter((l) => l.to === r.id && l.status === 'pending')) {
      try {
        diplomacy(room, r, { type: 'loanResponse', id: l.id, accept: true });
      } catch {
        l.status = 'rejected';
      }
    }
    if (room.vote && room.vote.ballots[r.id] === undefined)
      room.vote.ballots[r.id] = room.vote.target !== r.id || room.vote.kind !== 'sanction';
    if (r.crisis) resolveCrisis(room, r, r.metrics.treasury >= 2 ? 'intervene' : 'market');
  }
}
