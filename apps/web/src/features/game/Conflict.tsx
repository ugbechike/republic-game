import { useState } from 'react';
import type { Action, RoomView } from '@republic/contracts';
export function ConflictControls({
  target,
  w,
  send,
  busy,
}: {
  target: string;
  w: RoomView;
  send: (a: Action) => void;
  busy: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="conflict-controls">
      <div className="actions wrap">
        <button disabled={busy} onClick={() => send({ type: 'threat', to: target })}>
          Issue ultimatum · 5 capital
        </button>
        <button className="danger-button" onClick={() => setConfirm(!confirm)}>
          Military intervention
        </button>
      </div>
      {confirm && (
        <div className="war-confirm">
          <h3>Authorize an invasion?</h3>
          <p className="muted small">
            Costs ${w.me.house < 50 ? 5 : 3}B and {w.me.house < 50 ? 30 : 15} political capital. Six months of losses,
            damaged infrastructure and disrupted output. The world may sanction you. Outcomes are bounded to reparations
            and influence.
          </p>
          <div className="actions">
            <button
              className="danger-button"
              disabled={busy}
              onClick={() => {
                send({ type: 'war', to: target });
                setConfirm(false);
              }}
            >
              Authorize invasion
            </button>
            <button onClick={() => setConfirm(false)}>Stand down</button>
          </div>
        </div>
      )}
    </div>
  );
}
export function Conflicts({ w, send, busy }: { w: RoomView; send: (a: Action) => void; busy: boolean }) {
  const name = (id: string) => w.republics.find((r) => r.id === id)?.name;
  const wars = w.wars.filter((w) => w.status === 'active');
  if (!wars.length) return null;
  return (
    <section className="panel war-panel">
      <div className="eyebrow">SECURITY COUNCIL · ACTIVE CONFLICTS</div>
      {wars.map((war) => (
        <article key={war.id}>
          <h3>
            {name(war.attacker)} → {name(war.defender)}
          </h3>
          <p className="muted">Settlement in {war.ends - w.month} months. Outside support can change the outcome.</p>
          {![war.attacker, war.defender].includes(w.playerId) && !war.support[w.playerId] && (
            <div className="actions wrap">
              {[war.attacker, war.defender].map((side) => (
                <div key={side}>
                  <p className="small">Support {name(side)}</p>
                  <button disabled={busy} onClick={() => send({ type: 'assist', id: war.id, side, kind: 'military' })}>
                    Military
                  </button>{' '}
                  <button disabled={busy} onClick={() => send({ type: 'assist', id: war.id, side, kind: 'financial' })}>
                    Send $2B
                  </button>
                </div>
              ))}
            </div>
          )}
          {Object.entries(war.support).map(([id, s]) => (
            <p className="small muted" key={id}>
              {name(id)} supports {name(s.side)}
            </p>
          ))}
        </article>
      ))}
    </section>
  );
}
