import { X } from 'lucide-react';
import type { PartyView } from '@republic/contracts';
export function PartyHistory({ game, close }: { game: PartyView; close: () => void }) {
  return (
    <div className="party-overlay">
      <section className="party-record" role="dialog" aria-modal="true" aria-label="Presidential record">
        <button className="party-close" aria-label="Close record" onClick={close}>
          <X />
        </button>
        <span className="kicker">THE RECORD / WHY YOUR SCORES CHANGED</span>
        <h1>
          Decisions have
          <br />
          consequences.
        </h1>
        <p>
          Public Support {game.me.support} · Global Influence {game.me.influence}
        </p>
        {[...game.me.ledger].reverse().map((e) => (
          <article key={e.id}>
            <strong>
              {e.support >= 0 ? '+' : ''}
              {e.support.toFixed(1)} Support · {e.influence >= 0 ? '+' : ''}
              {e.influence.toFixed(1)} Influence
            </strong>
            <p>{e.reason}</p>
          </article>
        ))}
        {!game.me.ledger.length && (
          <p>Everyone starts at 50 Support and 0 Influence. No passive decay. Your decisions write the record.</p>
        )}
        <h2>The world’s headlines</h2>
        {game.news.slice(0, 12).map((n) => (
          <p key={n.id}>{n.text}</p>
        ))}
      </section>
    </div>
  );
}
