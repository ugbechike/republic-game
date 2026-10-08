import { Trophy, ArrowUpRight } from 'lucide-react';
import type { RoomView, Action, Score } from '@republic/contracts';
import { human } from './format';
import { FlagBanner } from '../../components/FlagBanner';
const categories = ['economy', 'prosperity', 'influence', 'strength', 'stability'] as const;
export function Results({
  w,
  send,
  busy,
  leave,
}: {
  w: RoomView;
  send: (a: Action) => void;
  busy: boolean;
  leave: () => void;
}) {
  const winner = w.results[0];
  if (!winner) return null;
  const best = (key: keyof Pick<Score, (typeof categories)[number]>) =>
    [...w.results].sort((a, b) => b[key] - a[key])[0];
  const stat = (key: keyof RoomView['me']['stats']) => [...w.republics].sort((a, b) => b.stats[key] - a.stats[key])[0];
  return (
    <main className="results">
      <div className="eyebrow">TWENTY YEARS. COUNTLESS PROMISES. ONE LEGACY.</div>
      <Trophy className="trophy" size={40} strokeWidth={1} />
      <p className="eyebrow">THE ASSEMBLY HAS ADJOURNED</p>
      <h1>World Power Ranking</h1>
      <p className="muted">The world you inherited is gone. This is the one you made.</p>
      <div className="winner">
        <FlagBanner flag={winner.flag} large />
        <h2>{winner.name}</h2>
        <b>
          {winner.total}
          <small> GLOBAL POWER</small>
        </b>
      </div>
      <div className="ranking">
        {w.results.map((r, index) => (
          <article key={r.id} className={r.id === w.playerId ? 'you' : ''}>
            <span className="rank">{String(index + 1).padStart(2, '0')}</span>
            <FlagBanner flag={r.flag} />
            <div>
              <h3>
                {r.name} {r.id === w.playerId && <small>YOUR REPUBLIC</small>}
              </h3>
              <div className="score-segments">
                {categories.map((k, i) => (
                  <i
                    key={k}
                    title={`${human(k)}: ${r[k].toFixed(0)}/200`}
                    style={{
                      width: `${r[k] / 10}%`,
                      background: ['#b7cba6', '#8bb6b2', '#d6bf86', '#8599af', '#b69dac'][i],
                    }}
                  />
                ))}
              </div>
            </div>
            <b>{r.total}</b>
          </article>
        ))}
      </div>
      <div className="score-key">
        {categories.map((k) => (
          <span key={k}>{human(k)} / 200</span>
        ))}
      </div>
      <div className="awards">
        {categories.map((key, i) => (
          <section className="panel" key={key}>
            <span>
              {
                [
                  'Strongest economy',
                  'Most prosperous citizens',
                  'Most influential Republic',
                  'National powerhouse',
                  'Best governed',
                ][i]
              }
            </span>
            <h3>{best(key).name}</h3>
          </section>
        ))}
        <section className="panel">
          <span>Strongest military</span>
          <h3>{[...w.results].sort((a, b) => b.military - a.military)[0].name}</h3>
        </section>
        <section className="panel">
          <span>Diplomatic powerhouse</span>
          <h3>{[...w.results].sort((a, b) => b.diplomacy - a.diplomacy)[0].name}</h3>
        </section>
        <section className="panel">
          <span>Biggest debtor</span>
          <h3>{[...w.results].sort((a, b) => b.debt - a.debt)[0].name}</h3>
        </section>
      </div>
      <div className="table-talk">
        <h2>For the post-game argument.</h2>
        <div>
          {(
            [
              ['sanctions', 'Most sanctioned'],
              ['wars', 'Most wars started'],
              ['deliveries', 'Most reliable trading partner'],
              ['betrayals', 'Most betrayed alliances'],
            ] as const
          ).map(([key, label]) => (
            <p key={key}>
              <span>{label}</span>
              <b>
                {stat(key).name} <small>({stat(key).stats[key]})</small>
              </b>
            </p>
          ))}
        </div>
      </div>
      <div className="actions">
        {w.host === w.playerId ? (
          <button className="primary" disabled={busy} onClick={() => send({ type: 'rematch' })}>
            Play again <ArrowUpRight size={16} />
          </button>
        ) : (
          <p className="muted">The host can reconvene this world for a rematch.</p>
        )}
        <button onClick={leave}>Return to title</button>
      </div>
    </main>
  );
}
