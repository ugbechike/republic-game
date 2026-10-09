import { useActiveTime, countdown } from '../briefings/useActiveTime';
import type { RoomView, Action } from '@republic/contracts';
export function Assembly({ w, send, busy }: { w: RoomView; send: (a: Action) => void; busy: boolean }) {
  const now = useActiveTime(w);
  const v = w.vote;
  if (!v) return null;
  return (
    <section className="assembly panel">
      <div>
        <div className="eyebrow">WORLD ASSEMBLY · FLOOR OPEN</div>
        <h3>{v.title}</h3>
        <p className="muted small">
          {Object.keys(v.ballots).length} / {w.republics.length} votes cast · {v.ends - w.month} months left · A
          majority of all Republics must support.
        </p>
      </div>
      <div className="actions">
        {now < (v.opensAt ?? 0) && <span>Discussion: {countdown(v.opensAt!, now)}</span>}
        {v.ballots[w.playerId] === undefined ? (
          <>
            <button
              className="primary"
              disabled={busy || now < (v.opensAt ?? 0)}
              onClick={() => send({ type: 'vote', support: true })}
            >
              Support
            </button>
            <button disabled={busy || now < (v.opensAt ?? 0)} onClick={() => send({ type: 'vote', support: false })}>
              Oppose
            </button>
            <button disabled={busy || now < (v.opensAt ?? 0)} onClick={() => send({ type: 'vote', support: null })}>
              Abstain
            </button>
          </>
        ) : (
          <span className="green">
            Voted {v.ballots[w.playerId] === null ? 'abstained' : v.ballots[w.playerId] ? 'in favour' : 'against'}
          </span>
        )}
      </div>
    </section>
  );
}
