import type { WorldController } from './useWorld';
export function Lobby({ controller: c }: { controller: WorldController }) {
  const w = c.world!;
  return (
    <main className="lobby">
      <div className="eyebrow">THE FIRST ASSEMBLY</div>
      <h1>The world is gathering.</h1>
      <p className="muted">Share this code with your friends.</p>
      <button
        className="room-code"
        onClick={() =>
          navigator.clipboard.writeText(w.code).catch(() => c.setError('Copy the code shown above manually.'))
        }
      >
        {w.code}
      </button>
      <p>
        {w.republics.length} / {w.options.maxPlayers} seats · {w.options.duration} minutes · {w.options.difficulty}
      </p>
      <div className="lobby-players">
        {w.republics.map((r) => (
          <article className="panel" key={r.id}>
            <span className="flag">{r.flag}</span>
            <h3>{r.name}</h3>
            <p className="muted">President {r.leader}</p>
            <small>{r.id === w.host ? 'HOST' : r.id.startsWith('bot') ? 'DEVELOPMENT DELEGATE' : 'READY'}</small>
          </article>
        ))}
      </div>
      {w.playerId === w.host ? (
        <div className="actions">
          <button
            className="primary"
            disabled={c.busy || w.republics.length < 4}
            onClick={() => c.send({ type: 'start' })}
          >
            Convene the Assembly
          </button>
          {w.development && (
            <button
              disabled={c.busy || w.republics.length >= w.options.maxPlayers}
              onClick={() => c.send({ type: 'debug', kind: 'bot' })}
            >
              Add development delegate
            </button>
          )}
        </div>
      ) : (
        <p>Waiting for the host to begin…</p>
      )}
      <p className="muted small">At least four Republics must join. Your seat is saved on this browser.</p>
      <button className="text-button" onClick={c.leave}>
        Return to title
      </button>
    </main>
  );
}
