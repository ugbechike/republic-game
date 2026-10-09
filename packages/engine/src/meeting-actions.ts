import type { Action, Republic, Room } from '@republic/contracts';
import { notice, other, requireThat, uid } from './helpers';
import { meetingProposal } from './meeting-proposal';
const terminal = ['signed', 'declined', 'closed'];
export function meetingAction(room: Room, me: Republic, a: Action): boolean {
  if (a.type === 'meetingRequest') {
    const target = other(room, me, a.to);
    requireThat(!target.id.startsWith('bot-'), 'Development delegates cannot attend meetings');
    const meetings = (room.meetings ??= []);
    requireThat(
      !meetings.some(
        (m) => !terminal.includes(m.status) && m.participants.includes(me.id) && m.participants.includes(target.id),
      ),
      'A meeting with this President is already open',
    );
    requireThat(
      meetings.filter((m) => !terminal.includes(m.status) && m.participants.includes(target.id)).length < 3,
      'This President already has three meetings to attend',
    );
    const empty = { money: 0, resource: 'oil' as const, amount: 0, moneyTiming: 'now' as const, items: [] };
    meetings.push({
      id: uid(room),
      participants: [me.id, target.id],
      joined: [me.id],
      requestedBy: me.id,
      agenda: a.agenda,
      status: 'requested',
      createdAt: room.activeMs ?? 0,
      messages: [],
      terms: { offer: { ...empty }, want: { ...empty }, years: 3, startInMonths: 0 },
      revision: 0,
      signatures: [],
    });
    // Retain active rooms and the most recent signed/closed diplomatic record.
    room.meetings = meetings.filter((m) => !terminal.includes(m.status) || meetings.slice(-40).includes(m));
    notice(room, `President ${me.leader} of ${me.name} requests a ${a.agenda.toLowerCase()} meeting.`, [target.id]);
    return true;
  }
  if (!['meetingResponse', 'meetingChat', 'meetingTerms', 'meetingProposal'].includes(a.type)) return false;
  if (!('id' in a)) return false;
  const m = room.meetings?.find((m) => m.id === a.id && m.participants.includes(me.id));
  requireThat(m, 'Private meeting unavailable');
  if (a.type === 'meetingResponse') {
    requireThat(!terminal.includes(m.status), 'This meeting has concluded');
    if (a.response === 'join') {
      if (!m.joined.includes(me.id)) m.joined.push(me.id);
      if (m.status === 'requested' && m.joined.length === m.participants.length) m.status = 'active';
      delete m.delayedUntil;
    } else if (a.response === 'delay') {
      requireThat(
        m.status === 'requested' && m.requestedBy !== me.id && !m.delayedUntil,
        'Only a new invitation can be delayed once',
      );
      m.delayedUntil = (room.activeMs ?? 0) + 120000;
      notice(room, `President ${me.leader} has asked you to wait two minutes.`, m.participants);
    } else {
      m.status = a.response === 'decline' ? 'declined' : 'closed';
      m.signatures = [];
      notice(room, `${me.name} ${m.status} the meeting.`, m.participants);
    }
    return true;
  }
  requireThat(!terminal.includes(m.status), 'This meeting has concluded');
  requireThat(m.joined.includes(me.id), 'Join the meeting first');
  if (a.type === 'meetingChat') {
    m.messages.push({ id: uid(room), author: me.id, text: a.text, at: room.activeMs ?? 0 });
    m.messages = m.messages.slice(-100);
    return true;
  }
  if (a.type === 'meetingTerms') {
    requireThat(m.status === 'active', 'Wait for both Presidents, or counter the locked proposal');
    requireThat(m.revision === a.revision, 'The table has changed. Review the latest terms and try again');
    m.terms = { offer: a.offer, want: a.want, years: a.years, startInMonths: a.startInMonths };
    m.revision++;
    m.signatures = [];
    return true;
  }
  if (a.type === 'meetingProposal') return meetingProposal(room, me, m, a);
  return false;
}
