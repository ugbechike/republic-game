'use client';
import { useWorld } from '../features/room/useWorld';
import { Landing } from '../features/room/Landing';
import { Lobby } from '../features/room/Lobby';
import { Results } from '../features/game/Results';
import { WorldDraft } from '../features/draft/WorldDraft';
import { Presidency } from '../features/office/Presidency';
export default function Page() {
  const c = useWorld();
  if (!c.session) return <Landing controller={c} />;
  if (!c.world)
    return (
      <main className="lobby">
        <div className="spinner" />
        <h2>Finding your Republic…</h2>
        <p role="status">{c.status}</p>
        <button onClick={c.leave}>Return to title</button>
      </main>
    );
  return (
    <>
      {c.world.phase === 'lobby' ? (
        <Lobby controller={c} />
      ) : c.world.phase === 'draft' ? (
        <WorldDraft controller={c} />
      ) : c.world.phase === 'ended' ? (
        <Results w={c.world} send={c.send} busy={c.busy} leave={c.leave} />
      ) : (
        <Presidency controller={c} />
      )}
      {c.error && (
        <div className="toast error" role="alert">
          {c.error}
          <button aria-label="Dismiss error" onClick={() => c.setError('')}>
            ×
          </button>
        </div>
      )}
      {c.status !== 'Connected' && (
        <div className="connection" role="status">
          {c.status}
        </div>
      )}
    </>
  );
}
