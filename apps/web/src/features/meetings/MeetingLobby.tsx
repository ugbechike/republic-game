import { useState } from 'react';
import { ArrowRight, Phone, Clock3 } from 'lucide-react';
import { MEETING_AGENDAS, type Action, type Meeting, type RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { countdown, useActiveTime } from '../briefings/useActiveTime';
export function MeetingLobby({
  w,
  selected,
  select,
  send,
  busy,
  enter,
  policy,
}: {
  w: RoomView;
  selected: string;
  select: (id: string) => void;
  send: (a: Action) => Promise<void>;
  busy: boolean;
  enter: (id: string) => void;
  policy: () => void;
}) {
  const [agenda, setAgenda] = useState<Meeting['agenda']>('Trade');
  const now = useActiveTime(w),
    meetings = [...(w.meetings ?? [])].reverse();
  const open = meetings.filter((m) => !['closed', 'declined', 'signed'].includes(m.status));
  const target = w.republics.find((r) => r.id === selected && r.id !== w.playerId);
  async function request() {
    if (!target) return;
    await send({ type: 'meetingRequest', to: target.id, agenda });
  }
  return (
    <section className="meeting-lobby">
      <div className="diplomatic-heading">
        <span className="kicker">THE FOREIGN OFFICE</span>
        <h1>
          Every agreement
          <br />
          begins with a conversation.
        </h1>
        <p>Invite a President. Talk across the room, or use the private line.</p>
      </div>
      <div className="meeting-invitations">
        {open.map((m) => {
          const other = w.republics.find((r) => m.participants.includes(r.id) && r.id !== w.playerId)!;
          const invited = !m.joined.includes(w.playerId);
          return (
            <article className="invitation" key={m.id}>
              <FlagBanner flag={other.flag} />
              <div>
                <span className="kicker">
                  {m.agenda} / {invited ? 'INCOMING REQUEST' : 'PRIVATE ROOM'}
                </span>
                <h2>President {other.leader}</h2>
                <p>
                  {other.name}{' '}
                  {m.delayedUntil && m.delayedUntil > now
                    ? `· Asked to wait ${countdown(m.delayedUntil, now)}`
                    : m.status === 'requested'
                      ? '· Awaiting attendance'
                      : '· At the negotiating table'}
                </p>
              </div>
              <div className="invitation-actions">
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    if (invited) await send({ type: 'meetingResponse', id: m.id, response: 'join' });
                    enter(m.id);
                  }}
                >
                  {invited ? 'JOIN NOW' : 'ENTER MEETING'} <ArrowRight size={16} />
                </button>
                {invited && !m.delayedUntil && (
                  <button
                    disabled={busy}
                    onClick={() => send({ type: 'meetingResponse', id: m.id, response: 'delay' })}
                  >
                    <Clock3 size={15} /> Tell them 2 minutes
                  </button>
                )}
                {invited && (
                  <button
                    disabled={busy}
                    onClick={() => send({ type: 'meetingResponse', id: m.id, response: 'decline' })}
                  >
                    Decline
                  </button>
                )}
              </div>
            </article>
          );
        })}
        <article className="meeting-request">
          <span className="kicker">
            <Phone size={14} /> OPEN A SECURE LINE
          </span>
          <label>
            President
            <select value={target?.id ?? ''} onChange={(e) => select(e.target.value)}>
              <option value="">Choose a Republic</option>
              {w.republics
                .filter((r) => r.id !== w.playerId && !r.id.startsWith('bot-'))
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.leader}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Meeting purpose
            <select value={agenda} onChange={(e) => setAgenda(e.target.value as Meeting['agenda'])}>
              {MEETING_AGENDAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <button
            className="primary"
            disabled={busy || !target || open.some((m) => m.participants.includes(target.id))}
            onClick={request}
          >
            REQUEST MEETING <ArrowRight size={16} />
          </button>
        </article>
        <button className="foreign-policy-link" onClick={policy}>
          Foreign policy & existing agreements →
        </button>
        {meetings.some((m) => m.status === 'signed') && (
          <div className="signed-records">
            <span className="kicker">DIPLOMATIC RECORD</span>
            {meetings
              .filter((m) => m.status === 'signed')
              .map((m) => (
                <button key={m.id} onClick={() => enter(m.id)}>
                  ✓ {m.agenda} agreement ·{' '}
                  {w.republics.find((r) => m.participants.includes(r.id) && r.id !== w.playerId)?.name}{' '}
                  <ArrowRight size={15} />
                </button>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
