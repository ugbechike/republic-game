import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, Crown, Plus, Users, Clock3 } from 'lucide-react';
import { RESOURCE_LABEL } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { ResourceIcon } from '../../components/ResourceIcon';
import { Backdrop, GameBrand } from './Backdrop';
import type { WorldController } from './useWorld';
export function Lobby({ controller: c }: { controller: WorldController }) {
  const w = c.world!,
    humans = w.republics.filter((r) => !r.id.startsWith('bot-')).length;
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(w.code);
      setCopied(true);
    } catch {
      c.setError('Copy the world code shown here manually.');
    }
  }
  return (
    <main className="summit-screen">
      <Backdrop summit />
      <header className="title-header">
        <GameBrand small />
        <div className="summit-code">
          <span>WORLD CODE</span>
          <button onClick={copy} aria-label="Copy world code">
            {w.code}
            <Copy size={17} />
          </button>
          <small role="status">{copied ? 'Copied. Send it to your friends.' : 'Share with your friends'}</small>
        </div>
      </header>
      <section className="summit-content">
        <div className="summit-title">
          <span className="summit-crest">
            <Users size={30} />
          </span>
          <div>
            <span className="kicker">LEADERS ARE GATHERING. STRATEGIES ARE FORMING.</span>
            <h1>WORLD SUMMIT</h1>
          </div>
          <div className="summit-count">
            <b>
              {humans}
              <span> / {w.options.maxPlayers}</span>
            </b>
            <small>HUMAN PRESIDENTS</small>
          </div>
        </div>
        <div className="summit-seats">
          {Array.from({ length: w.options.maxPlayers }, (_, i) => {
            const r = w.republics[i];
            return r ? (
              <article className={`summit-seat arrived ${r.id === w.playerId ? 'your-seat' : ''}`} key={r.id}>
                <div className="seat-ribbon">
                  {r.id === w.host ? (
                    <>
                      <Crown size={15} /> HOST
                    </>
                  ) : r.id === w.playerId ? (
                    'YOUR REPUBLIC'
                  ) : (
                    'PRESIDENT ARRIVED'
                  )}
                </div>
                <FlagBanner flag={r.flag} large />
                <h2>{r.name}</h2>
                <p>President {r.leader}</p>
                <div className="seat-resources">
                  {r.resources.map((resource) => (
                    <span key={resource}>
                      <ResourceIcon resource={resource} size={13} />
                      {RESOURCE_LABEL[resource]}
                    </span>
                  ))}
                </div>
                <small>Founding member</small>
                <span className={`ready-badge ${r.id.startsWith('bot-') ? 'delegate' : ''}`}>
                  <CheckCircle2 size={13} />
                  {r.id.startsWith('bot-') ? 'TEST DELEGATE' : 'READY'}
                </span>
              </article>
            ) : (
              <article className="summit-seat empty-seat" key={`empty-${i}`}>
                <span className="empty-crest">
                  <Plus size={35} strokeWidth={1} />
                </span>
                <p>
                  WAITING FOR
                  <br />
                  ANOTHER REPUBLIC
                </p>
                <small>Seat {i + 1}</small>
              </article>
            );
          })}
        </div>
        <footer className="summit-footer">
          <button className="game-button quiet" onClick={c.leave}>
            <ArrowLeft size={17} /> Back to title
          </button>
          <div>
            <span>
              <Clock3 size={15} /> {w.options.duration} minutes · 20 simulated years
            </span>
            <p>
              {humans >= w.minPlayers
                ? 'The table is ready. Your world is about to begin.'
                : `Waiting for ${w.minPlayers - humans} more human ${w.minPlayers - humans === 1 ? 'President' : 'Presidents'}. Minimum ${w.minPlayers} to start.`}
            </p>
          </div>
          {w.playerId === w.host ? (
            <button
              className="game-button gold"
              disabled={c.busy || humans < w.minPlayers}
              onClick={() => c.send({ type: 'start' })}
            >
              START GAME{' '}
              <span>
                ({humans}/{w.minPlayers})
              </span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <span className="waiting-host">
              <span className="live-dot" /> Waiting for your host to start
            </span>
          )}
        </footer>
        {w.development && w.playerId === w.host && (
          <details className="summit-debug">
            <summary>Development tools</summary>
            <p>Test delegates do not count toward the human minimum.</p>
            <button
              disabled={c.busy || w.republics.length >= w.options.maxPlayers}
              onClick={() => c.send({ type: 'debug', kind: 'bot' })}
            >
              Add test delegate
            </button>
          </details>
        )}
      </section>
    </main>
  );
}
