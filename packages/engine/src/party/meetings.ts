import { prepareOffer } from './prepared-offers';
import {
  emptyInventory,
  type PartyMatch,
  type PartyPlayer,
  type PartyIntent,
  type PartyMeeting,
} from '@republic/contracts';
import { requireThat } from '../helpers';
import { proposal, release } from './treaties';
export function meetingAction(m: PartyMatch, p: PartyPlayer, intent: PartyIntent, now: number, online: Set<string>) {
  if (intent.kind === 'call') {
    requireThat(intent.to !== p.id && m.players.some((r) => r.id === intent.to), 'Choose another President.');
    requireThat(online.has(intent.to), 'That President is offline. Try another partner or neutral relief.');
    requireThat(
      !m.meetings.some(
        (x) =>
          !['closed', 'signed'].includes(x.status) &&
          x.participants.includes(p.id) &&
          x.participants.includes(intent.to),
      ),
      'An open call with this President already exists.',
    );
    requireThat(
      m.meetings.filter((x) => x.status === 'requested' && x.participants.includes(intent.to)).length < 3,
      'Their secure line is busy.',
    );
    const id = `${m.id}-call-${m.meetings.length + 1}`;
    m.meetings.push({
      id,
      participants: [p.id, intent.to],
      status: 'requested',
      revision: 0,
      terms: { offer: emptyInventory(), want: emptyInventory(), delay: 0 },
      signatures: [],
      expiresAt: Math.min(m.endsAt, now + 60000),
      escrow: {},
      chat: [],
    });
    if (intent.purpose) prepareOffer(m, p, m.meetings.at(-1)!, intent.purpose);
    return;
  }
  requireThat('meeting' in intent, 'Unknown diplomatic action.');
  const meeting = m.meetings.find((x) => x.id === intent.meeting);
  requireThat(meeting && meeting.participants.includes(p.id), 'Private meeting not found.');
  requireThat(!['closed', 'signed'].includes(meeting.status), 'This meeting is closed.');
  if (intent.kind === 'respond') {
    if (intent.response === 'join') {
      requireThat(
        meeting.status === 'requested' && meeting.participants[1] === p.id,
        'Only the recipient can accept this call.',
      );
      meeting.status = meeting.purpose ? 'proposed' : 'open';
      meeting.expiresAt = meeting.purpose ? Math.min(m.endsAt, now + 45000) : m.endsAt;
    } else {
      release(m, meeting);
      meeting.status = 'closed';
    }
  } else if (intent.kind === 'chat') {
    requireThat(meeting.status !== 'requested', 'Join the call before sending a message.');
    meeting.chat.push({ id: `${meeting.id}-${meeting.chat.length}-${now}`, from: p.id, text: intent.text, at: now });
    meeting.chat = meeting.chat.slice(-80);
  } else if (intent.kind === 'terms') {
    requireThat(
      meeting.status === 'open' && meeting.revision === intent.revision,
      'The table changed or is locked. Review the latest terms.',
    );
    meeting.terms = structuredClone(intent.terms);
    meeting.revision++;
  } else if (intent.kind === 'proposal') proposal(m, p, meeting, intent, now);
}
export function expireMeetings(m: PartyMatch, now: number) {
  for (const meeting of m.meetings)
    if (!['signed', 'closed', 'open'].includes(meeting.status) && now >= meeting.expiresAt) {
      release(m, meeting);
      meeting.status = 'closed';
    }
}
