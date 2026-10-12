import { useState } from 'react';
import { ASSETS, ASSET_LABEL, type PartyMeeting } from '@republic/contracts';
import { Check, PenLine } from 'lucide-react';
import { Emblem } from './Emblem';
import { TermsComposer } from './TermsComposer';
import { timeLeft } from './usePartyTime';
import type { PartyProps } from './types';
export function TreatyTable(props: PartyProps & { meeting: PartyMeeting; now: number }) {
  const { game, meeting, send, busy, now } = props;
  const [edit, setEdit] = useState(false);
  const evaluation = meeting.evaluations?.[game.me.id];
  const respond = (response: 'propose' | 'accept' | 'counter' | 'reject' | 'sign') =>
    send({ kind: 'proposal', meeting: meeting.id, revision: meeting.revision, response });
  const signed = meeting.status === 'signed';
  const locked = ['proposed', 'accepted'].includes(meeting.status);
  return (
    <div className="party-treaty">
      <div className="party-documents">
        {meeting.participants.map((id, i) => {
          const p = game.players.find((p) => p.id === id)!;
          const bundle = i === 0 ? meeting.terms.offer : meeting.terms.want;
          return (
            <article key={id}>
              <header>
                <Emblem value={p.emblem} />
                <div>
                  <h2>{p.name}</h2>
                  <small>PRESIDENT {p.leader.toUpperCase()}</small>
                </div>
              </header>
              <div className="party-document">
                <span className="kicker">{p.name.toUpperCase()} WILL PROVIDE</span>
                {ASSETS.filter((a) => bundle[a] > 0).map((a) => (
                  <p key={a}>
                    <b>{bundle[a]}</b> {ASSET_LABEL[a]}
                  </p>
                ))}
                {!ASSETS.some((a) => bundle[a] > 0) && <p className="party-empty-terms">Nothing offered yet.</p>}
                <footer>
                  {meeting.signatures.includes(id) ? (
                    <span className="party-signature">
                      {p.leader} <Check size={17} />
                    </span>
                  ) : (
                    <span>Signature awaiting agreement</span>
                  )}
                </footer>
              </div>
            </article>
          );
        })}
      </div>
      <p className="party-term-caption">
        REVISION {meeting.revision} ·{' '}
        {meeting.terms.delay ? `DELIVERY ${meeting.terms.delay}s AFTER SIGNING` : 'IMMEDIATE DELIVERY'}{' '}
        {locked && `· EXPIRES ${timeLeft(meeting.expiresAt, now)}`}
      </p>
      {!signed && evaluation && (
        <aside className="party-adviser">
          <span className="kicker">FINANCE ADVISER / {evaluation.grade.toUpperCase()}</span>
          <p>{evaluation.reasons[0]}</p>
          <details>
            <summary>Review national benefit & score impact</summary>
            {evaluation.reasons.slice(1).map((r) => (
              <p key={r}>{r}</p>
            ))}
            <p>
              Net-export Support adjustment on delivery: {evaluation.projectedSupport >= 0 ? '+' : ''}
              {evaluation.projectedSupport.toFixed(1)} before clamping. Fulfilled national needs can offset this cost.
              Your gains never depend on your partner losing.
            </p>
          </details>
        </aside>
      )}
      <div className="party-actions">
        {meeting.status === 'open' && (
          <>
            <button onClick={() => setEdit(true)}>ADD / REMOVE TERMS</button>
            <button className="primary" disabled={busy} onClick={() => respond('propose')}>
              PROPOSE AGREEMENT
            </button>
          </>
        )}
        {meeting.status === 'proposed' && (
          <>
            {meeting.proposer !== game.me.id ? (
              <button className="primary" disabled={busy} onClick={() => respond('accept')}>
                ACCEPT TERMS
              </button>
            ) : (
              <p>Awaiting the other President’s response. Your offer is reserved.</p>
            )}
            <button
              disabled={busy}
              onClick={async () => {
                if (await respond('counter')) setEdit(true);
              }}
            >
              COUNTEROFFER
            </button>
            <button disabled={busy} onClick={() => respond('reject')}>
              REJECT
            </button>
          </>
        )}
        {meeting.status === 'proposed' && (
          <button
            disabled={busy}
            onClick={async () => {
              if (await respond('counter')) setEdit(true);
            }}
          >
            ADD / REMOVE TERMS
          </button>
        )}
        {meeting.status === 'accepted' && (
          <>
            <p>These terms are immutable. Both sides’ assets are reserved.</p>
            <button
              className="primary"
              disabled={busy || meeting.signatures.includes(game.me.id)}
              onClick={() => respond('sign')}
            >
              <PenLine size={17} />
              {meeting.signatures.includes(game.me.id) ? 'YOUR SIGNATURE IS RECORDED' : 'CONFIRM SUMMARY & SIGN'}
            </button>
            <button
              disabled={busy}
              onClick={async () => {
                if (await respond('counter')) setEdit(true);
              }}
            >
              REOPEN / COUNTEROFFER
            </button>
          </>
        )}
        {signed && (
          <div className="party-ratified">
            <Check /> RATIFIED ·{' '}
            {game.agreements.find((d) => d.meeting === meeting.id)?.status === 'settled'
              ? 'ASSETS DELIVERED'
              : 'DELIVERY SECURED IN ESCROW'}
            <details>
              <summary>Why? Review the signed evaluation</summary>
              <p>{evaluation?.grade}</p>
              {evaluation?.reasons.map((r) => (
                <p key={r}>{r}</p>
              ))}
              {game.me.ledger
                .filter((e) => e.id === `${meeting.id}-signed-settled`)
                .map((e) => (
                  <p key={e.id}>
                    {e.support >= 0 ? '+' : ''}
                    {e.support.toFixed(1)} Support · {e.influence >= 0 ? '+' : ''}
                    {e.influence.toFixed(1)} Influence. {e.reason}
                  </p>
                ))}
            </details>
          </div>
        )}
      </div>
      {edit && <TermsComposer {...props} close={() => setEdit(false)} />}
    </div>
  );
}
