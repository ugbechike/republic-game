import type { RoomView, Action } from '@republic/contracts';
export function Assembly({ w, send, busy }: { w: RoomView; send: (a: Action) => void; busy: boolean }) {
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
        {v.ballots[w.playerId] === undefined ? (
          <>
            <button className="primary" disabled={busy} onClick={() => send({ type: 'vote', support: true })}>
              Support
            </button>
            <button disabled={busy} onClick={() => send({ type: 'vote', support: false })}>
              Oppose
            </button>
          </>
        ) : (
          <span className="green">Voted {v.ballots[w.playerId] ? 'in favour' : 'against'}</span>
        )}
      </div>
    </section>
  );
}
