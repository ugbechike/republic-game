import { useState } from 'react';
import { X, Handshake, Eye, MessageCircle, Shield } from 'lucide-react';
import { RESOURCE_LABEL, type Action, type RoomView } from '@republic/contracts';
import { WorldMap } from '../game/WorldMap';
import { Assembly } from '../game/Assembly';
import { FlagBanner } from '../../components/FlagBanner';
import { ResourceIcon } from '../../components/ResourceIcon';
export function WorldExperience({
  w,
  send,
  busy,
  meet,
  visit,
  policy,
}: {
  w: RoomView;
  send: (a: Action) => Promise<boolean>;
  busy: boolean;
  meet: (id: string) => void;
  visit: (id: string) => void;
  policy: (id: string) => void;
}) {
  const [selected, select] = useState<string>();
  const r = w.republics.find((r) => r.id === selected);
  return (
    <div className="presidency-world">
      <WorldMap w={w} select={select} />
      <div className="world-institutions">
        <Assembly w={w} send={send} busy={busy} />
        <article className="world-crisis-story">
          <span className="kicker">INTERNATIONAL DEVELOPMENT BANK</span>
          <h2>A lifeline, with conditions.</h2>
          <p>Emergency liquidity comes with repayment and temporary spending limits.</p>
          <button disabled={busy} onClick={() => send({ type: 'institution', kind: 'emergency' })}>
            Request emergency facility
          </button>
          <button disabled={busy} onClick={() => send({ type: 'institution', kind: 'development' })}>
            Request development loan
          </button>
        </article>
      </div>
      {w.worldCrisis && (
        <article className="world-crisis-story">
          <span className="kicker">WORLD SERVICE</span>
          <h2>{w.worldCrisis.title}</h2>
          <p>{w.worldCrisis.description}</p>
        </article>
      )}
      <details className="world-history">
        <summary>World history · the decisions that shaped us</summary>
        {w.notices
          .filter((n) => !n.audience)
          .slice(0, 20)
          .map((n) => (
            <p key={n.id}>
              <small>{2030 + Math.floor(n.month / 12)}</small>
              {n.text}
            </p>
          ))}
      </details>
      {r && (
        <div className="office-sheet-backdrop">
          <section className="republic-profile" role="dialog" aria-modal="true" aria-label={`${r.name} public profile`}>
            <header>
              <span className="kicker">DIPLOMATIC INTELLIGENCE / PUBLIC RECORD</span>
              <button aria-label="Close Republic profile" onClick={() => select(undefined)}>
                <X size={20} />
              </button>
            </header>
            <FlagBanner flag={r.flag} />
            <h1>{r.name}</h1>
            <p>President {r.leader}</p>
            <div className="profile-stature">
              <span>
                GDP<b>${r.gdp.toFixed(1)}B</b>
              </span>
              <span>
                PEOPLE<b>{r.population.toFixed(1)}M</b>
              </span>
              <span>
                REPUTATION<b>{r.reputation.toFixed(0)}</b>
              </span>
            </div>
            <div className="profile-advantages">
              {r.resources.map((k) => (
                <span key={k}>
                  <ResourceIcon resource={k} size={19} />
                  {RESOURCE_LABEL[k]}
                </span>
              ))}
            </div>
            <p className="profile-relationship">
              {w.wars.some((x) => x.status === 'active' && [x.attacker, x.defender].includes(r.id))
                ? 'In active conflict'
                : w.alliances.some(
                      (x) =>
                        x.status === 'active' && [x.from, x.to].includes(r.id) && [x.from, x.to].includes(w.playerId),
                    )
                  ? 'Your allied government'
                  : 'Diplomatic channels open'}{' '}
              · {w.publicTrades.filter((x) => [x.from, x.to].includes(r.id)).length} active trade routes
            </p>
            <div className="profile-actions">
              <button onClick={() => visit(r.id)}>
                <Eye size={17} /> VIEW REPUBLIC
              </button>
              {r.id !== w.playerId && (
                <>
                  <button className="primary" onClick={() => meet(r.id)}>
                    <Handshake size={17} /> REQUEST MEETING
                  </button>
                  <button onClick={() => meet(r.id)}>
                    <MessageCircle size={17} /> SEND MESSAGE
                  </button>
                  <button onClick={() => policy(r.id)}>
                    <Shield size={17} /> FOREIGN POLICY
                  </button>
                </>
              )}
            </div>
            <small className="profile-note">Messages use a private meeting channel.</small>
          </section>
        </div>
      )}
    </div>
  );
}
