import { Trophy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Emblem } from './Emblem';
import { PartyHistory } from './PartyHistory';
import type { PartyProps } from './types';
export function PartyResults({ game, world, send, busy, leave }: PartyProps & { leave: () => void }) {
  const [history, setHistory] = useState(false);
  return (
    <main className="party-results">
      <span className="kicker">FIVE MINUTES. A LASTING LEGACY.</span>
      <Trophy size={36} />
      <h1>
        THE WORLD
        <br />
        <em>HAS SPOKEN.</em>
      </h1>
      <p>70% Public Support + 30% Global Influence</p>
      <div className="party-ranking">
        {game.results.map((r, i) => (
          <article key={r.id}>
            <span className="party-rank">0{i + 1}</span>
            <Emblem value={r.emblem} />
            <div>
              <h2>
                {r.name}
                {r.id === world.playerId && <small>YOUR REPUBLIC</small>}
              </h2>
              <p>
                {r.support} Support · {r.influence} Influence
              </p>
            </div>
            <strong>
              {r.legacy.toFixed(1)}
              <small>LEGACY</small>
            </strong>
          </article>
        ))}
      </div>
      <div className="party-awards">
        {game.awards.map((a) => (
          <article key={a.title}>
            <span className="kicker">{a.title}</span>
            <h2>{a.player}</h2>
            <p>{a.reason}</p>
          </article>
        ))}
      </div>
      <div className="party-actions">
        <button onClick={() => setHistory(true)}>WHY THESE SCORES?</button>
        {world.host === world.playerId ? (
          <button className="game-button gold" disabled={busy} onClick={() => send({ kind: 'rematch' })}>
            PLAY AGAIN <ArrowRight />
          </button>
        ) : (
          <p>The host can deal a fresh round.</p>
        )}
        <button onClick={leave}>Return to title</button>
      </div>
      <small>
        Ties: higher Support, then Influence, then stable President ID. Unused assets expire. No elimination.
      </small>
      {history && <PartyHistory game={game} close={() => setHistory(false)} />}
    </main>
  );
}
