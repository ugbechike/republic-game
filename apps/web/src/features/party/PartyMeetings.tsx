import { Phone, ArrowLeft } from 'lucide-react';
import type { PartyProps } from './types';
import { Emblem } from './Emblem';
import { TreatyTable } from './TreatyTable';
import { PartyChat } from './PartyChat';
export function PartyMeetings(
  props: PartyProps & { selected?: string; select: (id?: string) => void; call: (id: string) => void; now: number },
) {
  const { game, send, busy, selected, select, call } = props;
  const meeting = game.meetings.find((m) => m.id === selected);
  if (meeting && !['requested', 'closed'].includes(meeting.status))
    return (
      <section className="party-boardroom">
        <div className="party-boardroom-art" />
        <header className="party-meeting-heading">
          <button onClick={() => select(undefined)}>
            <ArrowLeft size={15} /> BACK TO CALLS
          </button>
          <span className="kicker">PRIVATE BILATERAL SESSION</span>
          <h1>{meeting.status === 'signed' ? 'Agreement signed.' : (meeting.purpose ?? 'The terms are yours.')}</h1>
          <p>
            {meeting.status === 'signed'
              ? 'A promise, made binding.'
              : meeting.purpose
                ? 'This proposed exchange helps both Republics meet their current needs. Negotiate the terms, then both sign.'
                : 'Talk freely. Put only what you can guarantee on the table.'}
          </p>
          {meeting.status !== 'signed' && (
            <button
              className="party-leave"
              disabled={busy}
              onClick={async () => {
                if (await send({ kind: 'respond', meeting: meeting.id, response: 'leave' })) select(undefined);
              }}
            >
              LEAVE MEETING
            </button>
          )}
        </header>
        <div className="party-negotiation">
          <TreatyTable {...props} meeting={meeting} />
          <PartyChat {...props} meeting={meeting} />
        </div>
      </section>
    );
  return (
    <section className="party-calls">
      <span className="kicker">THE SECURE LINE</span>
      <h1>
        There’s a deal
        <br />
        <em>worth making.</em>
      </h1>
      <div className="party-call-list">
        {game.meetings
          .filter((m) => m.status !== 'closed')
          .slice()
          .reverse()
          .map((m) => {
            const other = game.players.find((p) => m.participants.includes(p.id) && p.id !== game.me.id)!;
            const incoming = m.status === 'requested' && m.participants[1] === game.me.id;
            return (
              <article key={m.id}>
                <Emblem value={other.emblem} />
                <div>
                  <h2>{other.name}</h2>
                  <p>
                    {incoming
                      ? 'Incoming diplomatic call'
                      : m.status === 'requested'
                        ? 'Calling…'
                        : m.status === 'signed'
                          ? 'Signed agreement'
                          : m.status === 'accepted'
                            ? 'Ready for signatures'
                            : m.status === 'proposed'
                              ? 'Proposal on the table'
                              : 'The boardroom is open'}
                  </p>
                </div>
                {incoming ? (
                  <>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={async () => {
                        if (await send({ kind: 'respond', meeting: m.id, response: 'join' })) select(m.id);
                      }}
                    >
                      ANSWER
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => send({ kind: 'respond', meeting: m.id, response: 'decline' })}
                    >
                      DECLINE
                    </button>
                  </>
                ) : m.status !== 'requested' ? (
                  <button onClick={() => select(m.id)}>
                    {m.status === 'signed' ? 'VIEW RECORD' : 'ENTER MEETING'}
                  </button>
                ) : (
                  <button disabled={busy} onClick={() => send({ kind: 'respond', meeting: m.id, response: 'leave' })}>
                    CANCEL
                  </button>
                )}
              </article>
            );
          })}
      </div>
      <h2>Call a President</h2>
      <div className="party-call-targets">
        {game.players
          .filter((p) => p.id !== game.me.id)
          .map((p) => (
            <button key={p.id} disabled={busy || !p.online} onClick={() => call(p.id)}>
              <Phone size={17} />
              {p.name}
              <small>{p.online ? 'Available' : 'Offline'}</small>
            </button>
          ))}
      </div>
      <p>Conversations may happen across the room. Only the signed summary is binding.</p>
    </section>
  );
}
