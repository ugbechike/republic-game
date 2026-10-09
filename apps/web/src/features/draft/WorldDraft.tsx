import { useEffect, useState } from 'react';
import { ArrowRight, Check, Globe2, LockKeyhole } from 'lucide-react';
import { draftPresident, RESOURCE_INFO, RESOURCE_LABEL, type Deposit } from '@republic/contracts';
import type { WorldController } from '../room/useWorld';
import { FlagBanner } from '../../components/FlagBanner';
import { ResourceIcon } from '../../components/ResourceIcon';
export function WorldDraft({ controller: c }: { controller: WorldController }) {
  const w = c.world!,
    d = w.draft!;
  const [selected, select] = useState<string>(),
    [now, time] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => time(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const who = w.republics.find((r) => r.id === draftPresident(d))!;
  const mine = who.id === w.playerId;
  const chosen = d.deposits.find((x) => x.id === selected);
  const seconds = Math.max(0, Math.ceil((d.deadline - now) / 1000));
  const missing = ['oil', 'gas', 'agriculture', 'iron'].filter(
    (k) => !d.deposits.some((x) => x.resource === k && x.owner),
  );
  const reserved = (x: Deposit) =>
    d.order.length * d.rounds - d.turn <= missing.length && !missing.includes(x.resource);
  const disabled = (x: Deposit) => !!x.owner || w.me.resources.includes(x.resource) || reserved(x);
  if (d.complete)
    return (
      <main className="draft-reveal">
        <span className="kicker">THE WORLD IS FORMED · YEAR 2030</span>
        <FlagBanner flag={w.me.flag} large />
        <h1>
          THE REPUBLIC
          <br />
          OF {w.me.name.toUpperCase()}
        </h1>
        <p>President {w.me.leader}, your strategic hand is dealt.</p>
        <div className="reveal-claims">
          {w.me.resources.map((k) => (
            <span key={k}>
              <ResourceIcon resource={k} />
              {RESOURCE_LABEL[k]}
              <small>{w.me.resourceQuality?.[k]}</small>
            </span>
          ))}
        </div>
        <p className="muted">
          Import dependencies:{' '}
          {['oil', 'gas', 'agriculture', 'iron']
            .filter((k) => !w.me.resources.includes(k as 'oil'))
            .map((k) => RESOURCE_LABEL[k as 'oil'])
            .join(' · ')}
        </p>
        <button
          className="game-button gold"
          disabled={c.busy || d.ready.includes(w.playerId)}
          onClick={() => c.send({ type: 'draftReady' })}
        >
          {d.ready.includes(w.playerId) ? 'Waiting for fellow Presidents' : 'ENTER THE PRESIDENT’S OFFICE'}
          <ArrowRight size={19} />
        </button>
        <small>The presidency begins together · {seconds}s</small>
      </main>
    );
  return (
    <main className="draft-screen">
      <header className="draft-heading">
        <span className="kicker">
          <Globe2 size={16} /> REPUBLIC / THE FIRST ASSEMBLY
        </span>
        <span>
          ROUND {Math.floor(d.turn / d.order.length) + 1} OF {d.rounds}
        </span>
      </header>
      <div className="draft-title">
        <div>
          <span className="kicker">DRAFT YOUR REPUBLIC’S NATURAL ADVANTAGES</span>
          <h1>
            THE WORLD IS
            <br />
            <em>BEING DIVIDED.</em>
          </h1>
        </div>
        <div className={`draft-clock ${mine ? 'your-turn' : ''}`} role="status">
          <FlagBanner flag={who.flag} />
          <div>
            <small>{mine ? 'YOUR TURN' : `${who.leader.toUpperCase()}’S TURN`}</small>
            <b>00:{String(seconds).padStart(2, '0')}</b>
          </div>
        </div>
      </div>
      <footer className="draft-presidents">
        {d.order.map((id) => {
          const r = w.republics.find((r) => r.id === id)!;
          return (
            <article key={id} className={who.id === id ? 'active' : ''}>
              <FlagBanner flag={r.flag} />
              <div>
                <b>{r.name}</b>
                <small>
                  {r.resources.length}/3 claims · {r.leader}
                </small>
                <span>
                  {r.resources.map((k) => (
                    <ResourceIcon key={k} resource={k} size={15} />
                  ))}
                </span>
              </div>
              {r.resources.length === 3 && <Check size={16} />}
            </article>
          );
        })}
      </footer>
      <div className="draft-layout">
        <section className="draft-table" aria-label="Available world deposits">
          <div className="draft-compass">
            N<br />✦
          </div>
          {d.deposits.map((x) => (
            <button
              key={x.id}
              className={`deposit ${selected === x.id ? 'selected' : ''} ${x.owner ? 'claimed' : ''}`}
              onClick={() => select(x.id)}
              aria-pressed={selected === x.id}
            >
              <ResourceIcon resource={x.resource} size={29} />
              <span>{RESOURCE_LABEL[x.resource]}</span>
              <small>
                {x.owner
                  ? w.republics.find((r) => r.id === x.owner)?.name
                  : `${x.quality} · ${d.deposits.filter((o) => o.resource === x.resource && !o.owner).length} remaining`}
              </small>
              {x.owner && <LockKeyhole size={13} />}
            </button>
          ))}
        </section>
        <aside className="claim-dossier">
          <span className="kicker">YOUR NEXT ADVANTAGE</span>
          {chosen ? (
            <>
              <ResourceIcon resource={chosen.resource} size={42} />
              <h2>{RESOURCE_LABEL[chosen.resource]}</h2>
              <span className="quality-stamp">{chosen.quality} potential</span>
              <h3>OPPORTUNITY</h3>
              <p>{RESOURCE_INFO[chosen.resource].opportunities.slice(0, 2).join(' · ')}</p>
              <h3>RISK</h3>
              <p>{RESOURCE_INFO[chosen.resource].risks.slice(0, 2).join(' · ')}</p>
              <button
                className="game-button gold"
                disabled={!mine || disabled(chosen) || c.busy || seconds === 0}
                onClick={() => c.send({ type: 'draftClaim', deposit: chosen.id })}
              >
                {chosen.owner ? 'CLAIMED' : `CLAIM ${RESOURCE_LABEL[chosen.resource].toUpperCase()}`}
                <ArrowRight size={17} />
              </button>
              {reserved(chosen) && <small>This turn must claim a remaining essential supply.</small>}
            </>
          ) : (
            <>
              <h2>What will your nation be known for?</h2>
              <p>Inspect a deposit. Know its promise. Weigh its risks.</p>
              <span className="draft-seal">R</span>
            </>
          )}
          <small>Three claims each · snake order · no duplicate advantages. Unanswered turns delegate a claim.</small>
        </aside>
      </div>
      <p className="draft-announcement" role="status">
        {w.notices[0]?.text}
      </p>
    </main>
  );
}
