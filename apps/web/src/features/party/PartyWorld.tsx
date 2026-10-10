import { Phone } from 'lucide-react';
import { ASSETS, ASSET_LABEL, ROLE_INFO } from '@republic/contracts';
import { Emblem } from './Emblem';
import type { PartyProps } from './types';
export function PartyWorld({ game, busy, call }: PartyProps & { call: (id: string) => void }) {
  return (
    <section className="party-world">
      <span className="kicker">ONE CRISIS. CONNECTED FATES.</span>
      <h1>
        Who holds
        <br />
        <em>your next move?</em>
      </h1>
      <div className="party-presidents">
        {game.players.map((p) => (
          <article key={p.id}>
            <Emblem value={p.emblem} />
            <div>
              <h2>{p.name}</h2>
              <p>
                President {p.leader} · {p.online ? 'Online' : 'Offline'}
              </p>
              <strong>{p.role && ROLE_INFO[p.role].name}</strong>
              <small>
                {game.agreements.some((d) => d.participants.includes(p.id) && d.participants.includes(game.me.id))
                  ? 'Signed diplomatic partner'
                  : 'Diplomatic channel open'}
              </small>
            </div>
            {p.id !== game.me.id && (
              <button className="primary" disabled={busy || !p.online} onClick={() => call(p.id)}>
                <Phone size={17} /> REQUEST MEETING
              </button>
            )}
          </article>
        ))}
      </div>
      <details className="party-reference">
        <summary>Reference values {game.twist && '· crisis modifiers active'}</summary>
        <div className="party-inventory">
          {ASSETS.map((a) => (
            <span key={a}>
              <b>{game.reference[a]}</b>
              {ASSET_LABEL[a]} / unit
            </span>
          ))}
        </div>
        <p>
          Values guide bargaining; they are not fixed prices. Gift penalties use stable starting values to prevent
          circular trades around a twist. Fulfilled national benefits offset uncompensated exports.
        </p>
      </details>
    </section>
  );
}
