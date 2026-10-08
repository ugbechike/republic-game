import { Handshake, Globe2, Shield, Trophy, ArrowLeft } from 'lucide-react';
export function HowToPlay({ close }: { close: () => void }) {
  return (
    <section className="how-to-panel game-surface" aria-label="How to play">
      <span className="kicker">YOUR FIRST WORLD SUMMIT</span>
      <h1>POWER IS A PEOPLE GAME.</h1>
      <p>Every player is a President. The world keeps moving while you talk.</p>
      <div className="how-to-grid">
        {[
          [
            Globe2,
            '01',
            'Found your Republic',
            'Choose five points of resources. Secure food, energy and construction materials—or find someone who can supply them.',
          ],
          [
            Handshake,
            '02',
            'Make a deal',
            'Talk to your friends, then put promises in writing. Trade, lend, counteroffer or sign a pact. Breaking deals has a price.',
          ],
          [
            Shield,
            '03',
            'Handle the pressure',
            'Policies take three months to work. Face crises, elections and threats. Even in defeat, you keep your Republic.',
          ],
          [
            Trophy,
            '04',
            'Leave your legacy',
            'Twenty simulated years. Five score categories: economy, prosperity, influence, strength and stability. GDP alone will not win.',
          ],
        ].map(([Icon, n, title, detail]) => {
          const Glyph = Icon as typeof Globe2;
          return (
            <article key={String(n)}>
              <Glyph />
              <span>{String(n)}</span>
              <h3>{String(title)}</h3>
              <p>{String(detail)}</p>
            </article>
          );
        })}
      </div>
      <button className="game-button" onClick={close}>
        <ArrowLeft size={18} /> Back to title
      </button>
    </section>
  );
}
