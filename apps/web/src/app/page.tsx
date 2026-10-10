'use client';
import { useWorld } from '../features/room/useWorld';
import { PartyLanding } from '../features/party/PartyLanding';
import { PartyGame } from '../features/party/PartyGame';
export default function Page() {
  const c = useWorld();
  return (
    <>
      {!c.session ? (
        <PartyLanding c={c} />
      ) : !c.world ? (
        <main className="lobby">
          <div className="spinner" />
          <h2>Finding your Republic…</h2>
          <p role="status">{c.status}</p>
          <button onClick={c.leave}>Return to title</button>
        </main>
      ) : c.world.party ? (
        <PartyGame c={c} />
      ) : (
        <main className="party-legacy">
          <h1>A new kind of Republic.</h1>
          <p>
            This saved world belongs to the earlier simulation. Start a new five-minute Canal Crisis with your friends.
          </p>
          <button className="primary" onClick={c.leave}>
            RETURN TO TITLE
          </button>
        </main>
      )}
      {c.error && (
        <div className="toast error" role="alert">
          {c.error}
          <button aria-label="Dismiss error" onClick={() => c.setError('')}>
            ×
          </button>
        </div>
      )}
      {c.session && c.status !== 'Connected' && (
        <div className="connection" role="status">
          {c.status}
        </div>
      )}
    </>
  );
}
