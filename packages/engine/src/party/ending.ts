import type { Room } from '@republic/contracts';
import { release, settle } from './treaties';
import { finishScores } from './scoring';
export function endParty(room: Room, now: number, early = false) {
  const m = room.party!;
  if (m.stage === 'ended') return;
  // Already ratified contracts are fully funded: honor them now, never cancel their promises.
  if (early) for (const d of m.agreements) if (d.status === 'scheduled') d.dueAt = now;
  settle(m, now);
  for (const meeting of m.meetings)
    if (!['signed', 'closed'].includes(meeting.status)) {
      release(m, meeting);
      meeting.status = 'closed';
    }
  for (const p of m.players) for (const n of p.needs) if (n.status !== 'fulfilled') n.status = 'missed';
  m.stage = 'ended';
  room.phase = 'ended';
  m.endedEarly = early;
  m.endedAt = now;
  m.endsAt = now;
  finishScores(m);
  m.news.unshift({
    id: `${m.id}-end`,
    at: now,
    text: early
      ? 'The host ended the game early. Signed deliveries honored; unsigned offers cancelled. Current standings are final.'
      : 'The world has spoken. Signed deliveries settled; unsigned offers cancelled.',
  });
}
