import type { Action, Room } from '@republic/contracts';
import { botDraft, createRepublic } from './create';
import { domestic } from './domestic';
import { interval, notice, requireThat } from './helpers';
export function act(room: Room, playerId: string, action: Action, development = false, now = Date.now()) {
  const me = room.republics.find(r => r.id === playerId);
  requireThat(me, 'Unknown player');
  if (action.type === 'start') {
    requireThat(playerId === room.host && room.phase === 'lobby', 'Only the host can start a lobby');
    requireThat(room.republics.length >= 4, 'At least four Republics are required');
    room.phase = 'playing'; room.nextTick = now + interval(room); notice(room, 'The Assembly is in session. Twenty years. One world.'); return;
  }
  if (action.type === 'debug' && action.kind === 'bot') {
    requireThat(development && playerId === room.host && room.phase === 'lobby', 'Development host only');
    requireThat(room.republics.length < room.options.maxPlayers, 'Room is full');
    const id = `bot-${room.republics.length}`;
    room.republics.push(createRepublic(id, botDraft(room.republics.length), room.options.difficulty === 'struggling')); return;
  }
  requireThat(room.phase === 'playing', 'The world is not in session');
  if (domestic(room, me, action, development)) return;
  throw new Error('Action not available yet');
}
