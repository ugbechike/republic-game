import { useState } from 'react';
import { Copy, ArrowRight } from 'lucide-react';
import { Backdrop, GameBrand } from '../room/Backdrop';
import { Emblem } from './Emblem';
import type { PartyProps } from './types';
export function PartyLobby({ game, world, send, busy, leave }: PartyProps & { leave: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <main className="party-lobby">
      <Backdrop summit />
      <header>
        <GameBrand />
        <button onClick={leave}>Return to title</button>
      </header>
      <section>
        <span className="kicker">THE CANAL CRISIS / ROUND {game.round}</span>
        <h1>
          The world is
          <br />
          <em>waiting on you.</em>
        </h1>
        <button
          className="party-code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(world.code);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {world.code}
          <Copy size={20} />
        </button>
        <p>{copied ? 'Code copied. Invite your friends.' : 'Share this code. Bring your best negotiating voice.'}</p>
        <div className="party-seats">
          {game.players.map((p) => (
            <article key={p.id}>
              <Emblem value={p.emblem} large />
              <h2>{p.name}</h2>
              <p>President {p.leader}</p>
              <small>
                {p.id === world.host ? 'HOST · ' : ''}
                {p.ready ? 'READY' : p.online ? 'AT THE TABLE' : 'RECONNECTING'}
              </small>
            </article>
          ))}
        </div>
        <p>
          {game.players.length}/6 Presidents · {(game.durationMs ?? 300000) / 60000} minutes · Random unique advantages
        </p>
        {world.development && world.host === world.playerId && (
          <label>
            Development match length
            <select
              aria-label="Development match length"
              value={(game.durationMs ?? 300000) / 1000}
              onChange={(e) => send({ kind: 'duration', seconds: Number(e.target.value) as 180 | 300 })}
            >
              <option value={300}>5 minutes (normal)</option>
              <option value={180}>3 minutes (development)</option>
            </select>
          </label>
        )}
        <div className="party-actions">
          {!game.me.ready && (
            <button disabled={busy} onClick={() => send({ kind: 'ready' })}>
              I’m ready
            </button>
          )}
          {world.host === world.playerId ? (
            <button
              className="gold game-button"
              disabled={busy || game.players.length < 2}
              onClick={() => send({ kind: 'start' })}
            >
              DEAL THE ADVANTAGES <ArrowRight />
            </button>
          ) : (
            <span>The host will deal when the table is ready.</span>
          )}
        </div>
        {game.players.length < 2 && <p>At least two human Presidents must join.</p>}
      </section>
    </main>
  );
}
