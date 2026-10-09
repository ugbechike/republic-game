import { useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Action, Meeting, RoomView } from '@republic/contracts';
import { MeetingChat } from './MeetingChat';
import { NegotiationTable } from './NegotiationTable';
import { TermsEditor } from './TermsEditor';
export function MeetingRoom({
  m,
  w,
  send,
  busy,
  back,
  policy,
}: {
  m: Meeting;
  w: RoomView;
  send: (a: Action) => Promise<boolean>;
  busy: boolean;
  back: () => void;
  policy: () => void;
}) {
  const [edit, setEdit] = useState<'offer' | 'want'>();
  const response = (response: 'propose' | 'accept' | 'reject' | 'counter' | 'sign') =>
    send({ type: 'meetingProposal', id: m.id, revision: m.revision, response });
  const concluded = ['closed', 'declined'].includes(m.status);
  return (
    <section className="meeting-room">
      <div className="boardroom-atmosphere" aria-hidden="true" />
      <header className="meeting-title">
        <button onClick={back}>
          <ArrowLeft size={16} /> LEAVE TABLE
        </button>
        <div>
          <span className="kicker">{m.agenda.toUpperCase()} / PRIVATE SESSION</span>
          <h1>
            {m.status === 'signed'
              ? 'AGREEMENT SIGNED'
              : m.status === 'agreed'
                ? 'AGREEMENT REACHED'
                : 'BILATERAL MEETING'}
          </h1>
          <p>
            {m.status === 'requested'
              ? 'Your invitation is on their desk.'
              : concluded
                ? 'This meeting has concluded.'
                : m.status === 'signed'
                  ? 'Both governments are bound. Agreed transfers are now in effect.'
                  : m.status === 'agreed'
                    ? 'Review the terms. Both Presidents must sign.'
                    : 'Two governments. One table. Find common ground.'}
          </p>
        </div>
        <span className="meeting-confidential">
          <ShieldCheck size={16} /> CONFIDENTIAL
        </span>
      </header>
      <div className="boardroom-layout">
        <div className="table-space">
          <NegotiationTable m={m} w={w} edit={setEdit} />
          <div className="table-timeline">
            REVISION {m.revision} <span /> {m.terms.years} YEAR TERM <span />{' '}
            {m.terms.startInMonths
              ? `SCHEDULED SUPPLY IN ${m.terms.startInMonths} MONTHS`
              : 'SCHEDULED SUPPLY BEGINS NOW'}
          </div>
          <div className="meeting-controls" aria-live="polite">
            {m.status === 'requested' && (
              <p>
                {m.delayedUntil
                  ? 'The President asked for two minutes. You may leave the table and return.'
                  : 'Waiting for the other President to join.'}
              </p>
            )}
            {m.status === 'active' && (
              <button className="primary" disabled={busy} onClick={() => response('propose')}>
                PROPOSE THESE TERMS →
              </button>
            )}
            {m.status === 'proposed' &&
              (m.proposedBy === w.playerId ? (
                <p>Your proposal is locked. Awaiting the other President.</p>
              ) : (
                <>
                  <button className="primary" disabled={busy} onClick={() => response('accept')}>
                    ACCEPT TERMS
                  </button>
                  <button disabled={busy} onClick={() => response('counter')}>
                    COUNTER
                  </button>
                  <button disabled={busy} onClick={() => response('reject')}>
                    REJECT
                  </button>
                </>
              ))}
            {m.status === 'agreed' &&
              (m.signatures.includes(w.playerId) ? (
                <p>Your signature is recorded. Waiting for the other President.</p>
              ) : (
                <button className="primary sign-agreement" disabled={busy} onClick={() => response('sign')}>
                  SIGN AGREEMENT
                </button>
              ))}
            {m.status === 'signed' && (
              <div className="treaty-seal">
                <ShieldCheck size={32} />
                <b>RATIFIED</b>
                <small>RECORDED IN WORLD HISTORY</small>
                <button onClick={back}>Return to the Presidency →</button>
              </div>
            )}
            {concluded && <button onClick={back}>Return to your office</button>}
          </div>
          {m.status !== 'signed' && !concluded && (
            <div className="meeting-secondary">
              <button onClick={policy}>Pacts, loans & foreign policy</button>
              <button disabled={busy} onClick={() => send({ type: 'meetingResponse', id: m.id, response: 'close' })}>
                End meeting
              </button>
            </div>
          )}
        </div>
        <MeetingChat m={m} w={w} send={send} busy={busy} />
      </div>
      {edit && (
        <TermsEditor
          key={`${m.id}-${edit}`}
          m={m}
          w={w}
          side={edit}
          close={() => setEdit(undefined)}
          send={send}
          busy={busy}
        />
      )}
    </section>
  );
}
