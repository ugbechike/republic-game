import { X, MapPin } from 'lucide-react';
import type { Action, OfficeMatter, RoomView } from '@republic/contracts';
import { useActiveTime, countdown } from '../briefings/useActiveTime';
export function MatterDetail({
  m,
  w,
  send,
  busy,
  close,
  visit,
}: {
  m: OfficeMatter;
  w: RoomView;
  send: (a: Action) => void;
  busy: boolean;
  close: () => void;
  visit: (id: string) => void;
}) {
  const now = useActiveTime(w),
    closed = m.status !== 'open' || now >= m.dueAt;
  const choices =
    m.kind === 'governor'
      ? [
          ['fund', 'Reimburse $0.62B'],
          ['partial', 'Reimburse 50% · $0.31B'],
          ['refuse', 'Refuse reimbursement'],
        ]
      : [
          ['support', 'Infrastructure support · $1.2B'],
          ['incentive', 'Tax incentive grant · $0.6B'],
          ['refuse', 'Take no action'],
        ];
  return (
    <div className="executive-modal">
      <section className="decision-document" role="dialog" aria-modal="true" aria-label={m.title}>
        <header>
          <span className="kicker">{m.source.toUpperCase()}</span>
          <button aria-label="Close matter" onClick={close}>
            <X size={19} />
          </button>
        </header>
        <span className="document-seal">{m.kind === 'business' ? 'BC' : 'G'}</span>
        <h1>{m.title}</h1>
        <p>{m.summary}</p>
        <div className="decision-facts">
          <span>
            YOUR TREASURY<b>${w.me.metrics.treasury.toFixed(2)}B</b>
          </span>
          <span>
            {m.priority.toUpperCase()}
            <b>{closed ? m.status.toUpperCase() : countdown(m.dueAt, now)}</b>
          </span>
        </div>
        <p className="decision-consequence">
          {m.kind === 'governor'
            ? 'Reimbursement rebuilds regional confidence. Refusal or delay reduces local stability and national approval.'
            : 'Approved support begins factory construction. Jobs and output arrive in six months. Declining lets the opportunity pass.'}
        </p>
        {m.outcome && (
          <p className="decision-outcome" role="status">
            ✓ {m.outcome}
          </p>
        )}
        <div className="decision-options">
          {choices.map(([choice, label]) => (
            <button
              key={choice}
              disabled={busy || closed}
              onClick={() => send({ type: 'officeDecision', id: m.id, choice: choice as 'fund' })}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="visit-link" onClick={() => visit(m.region)}>
          <MapPin size={16} /> VISIT {w.me.regions.find((r) => r.id === m.region)?.name.toUpperCase()}
        </button>
      </section>
    </div>
  );
}
