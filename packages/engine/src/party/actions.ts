import { ASSETS, type Room, type PartyIntent } from '@republic/contracts';
import { requireThat } from '../helpers';
import { activate, dealRoles, newParty } from './scenario';
import { partyClock, twist } from './director';
import { fulfill } from './needs';
import { meetingAction } from './meetings';
export function partyAction(
  room: Room,
  playerId: string,
  matchId: string,
  intent: PartyIntent,
  development: boolean,
  wallNow: number,
  online: Set<string>,
) {
  const next = structuredClone(room);
  apply(next, playerId, matchId, intent, development, wallNow, online);
  Object.assign(room, next);
}
function apply(
  room: Room,
  playerId: string,
  matchId: string,
  intent: PartyIntent,
  development: boolean,
  wallNow: number,
  online: Set<string>,
) {
  const m = room.party!;
  requireThat(m && m.id === matchId, 'This action belongs to an earlier match. Review the new round.');
  const p = m.players.find((p) => p.id === playerId)!;
  requireThat(p, 'President not found.');
  const now = wallNow + m.offsetMs;
  if (intent.kind === 'rematch') {
    requireThat(room.host === playerId && m.stage === 'ended', 'Only the host can rematch after results.');
    room.party = newParty(room, m.round + 1);
    room.phase = 'lobby';
    return;
  }
  if (intent.kind === 'start') {
    requireThat(room.host === playerId && m.stage === 'lobby', 'Only the host can start from the lobby.');
    requireThat(m.players.length >= 2 && m.players.length <= 6, 'The Canal Crisis requires 2–6 humans.');
    dealRoles(room, now);
    return;
  }
  if (intent.kind === 'ready') {
    requireThat(['lobby', 'reveal'].includes(m.stage), 'Readiness is already complete.');
    p.ready = true;
    if (m.stage === 'reveal' && m.players.every((p) => p.ready)) activate(m, now);
    return;
  }
  requireThat(m.stage === 'active' && now < m.endsAt, 'The five-minute match has ended.');
  partyClock(room, wallNow);
  if (intent.kind === 'debug') {
    requireThat(development && room.host === playerId, 'Development controls are unavailable.');
    if (intent.command === 'advance') m.offsetMs += (intent.amount ?? 30) * 1000;
    if (intent.command === 'end') m.offsetMs += m.endsAt - now;
    if (intent.command === 'twist') twist(m, now);
    if (intent.command === 'inventory') {
      const asset = intent.asset ?? 'credits';
      p.inventory[asset] = Math.min(50, intent.amount ?? 8);
      p.lots = p.lots.filter((l) => l.asset !== asset);
      p.lots.push({ asset, amount: p.inventory[asset], origin: p.id });
    }
    if (intent.command === 'need')
      p.needs.push({
        id: `${m.id}-debug-${now}`,
        title: 'Emergency fuel delivery',
        description: 'A development scenario for briefing verification.',
        requirements: [{ assets: ['oil'], amount: 1 }],
        dueAt: now + 30000,
        status: 'open',
        optional: true,
      });
    partyClock(room, wallNow);
    return;
  }
  if (intent.kind === 'fulfill' || intent.kind === 'fallback')
    fulfill(m, p, intent.need, intent.kind === 'fallback', now);
  else meetingAction(m, p, intent, now, online);
}
