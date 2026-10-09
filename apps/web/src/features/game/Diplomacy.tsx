import { LoanForm } from './LoanForm';
import { SanctionControls } from './SanctionControls';
import type { Commodity } from '@republic/contracts';
import { useState } from 'react';
import { FlagBanner } from '../../components/FlagBanner';
import { RESOURCE_LABEL, type Action, type Deal, type RoomView } from '@republic/contracts';
import { TradeForm } from './TradeForm';
import { Agreements } from './Agreements';
import { ConflictControls } from './Conflict';
import { money } from './format';
export function Diplomacy({
  w,
  selected,
  select,
  send,
  busy,
  need,
}: {
  w: RoomView;
  selected: string;
  select: (id: string) => void;
  send: (a: Action) => void;
  busy: boolean;
  need?: Commodity;
}) {
  const [offer, setOffer] = useState(!!need),
    [counter, setCounter] = useState<Deal | undefined>();
  const target = w.republics.find((r) => r.id === selected && r.id !== w.playerId);
  return (
    <div className="diplomacy-layout">
      <section className="panel">
        <div className="section-label">THE DIPLOMATIC TABLE</div>
        <label className="target-select">
          Choose a Republic
          <select
            value={target?.id ?? ''}
            onChange={(e) => {
              select(e.target.value);
              setOffer(false);
              setCounter(undefined);
            }}
          >
            <option value="">Select a Republic</option>
            {w.republics
              .filter((r) => r.id !== w.playerId)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </label>
        {target ? (
          <>
            <h2 className="panel-title">
              <FlagBanner flag={target.flag} /> {target.name}
            </h2>
            <p className="muted">
              President {target.leader} · {target.resources.map((r) => RESOURCE_LABEL[r]).join(', ')}
            </p>
            <div className="profile-metrics">
              <span>
                GDP <b>{money(target.gdp)}</b>
              </span>
              <span>
                Population <b>{target.population.toFixed(1)}M</b>
              </span>
              <span>
                Military <b>≈{target.militaryEstimate}</b>
              </span>
              <span>
                Stability <b>{target.stability.toFixed(0)}</b>
              </span>
            </div>
            <p className="muted small">
              Known trade partners:{' '}
              {w.publicTrades
                .filter((d) => [d.from, d.to].includes(target.id))
                .map((d) => w.republics.find((r) => r.id === (d.from === target.id ? d.to : d.from))?.name)
                .join(', ') || 'None'}{' '}
              · Reputation {target.reputation.toFixed(0)}
            </p>
            <div className="actions wrap">
              <button
                className="primary"
                onClick={() => {
                  setCounter(undefined);
                  setOffer(!offer);
                }}
              >
                Propose trade
              </button>
              <button disabled={busy} onClick={() => send({ type: 'alliance', to: target.id, kind: 'trade' })}>
                Trade alliance
              </button>
              <button disabled={busy} onClick={() => send({ type: 'alliance', to: target.id, kind: 'defence' })}>
                Defence pact
              </button>
            </div>
            <p className="muted small">
              Trade alliances improve growth. Defence pacts invite mutual assistance. Sanctions reduce both sides’
              output and block bilateral trade for two years.
            </p>
            <ConflictControls key={target.id} target={target.id} w={w} send={send} busy={busy} />
            <SanctionControls to={target.id} send={send} busy={busy} />
            <LoanForm to={target.id} send={send} busy={busy} credit={target.credit ?? 70} />
            {offer && (
              <TradeForm
                key={`${target.id}-${counter?.id ?? 'new'}`}
                need={need}
                to={target.id}
                send={send}
                busy={busy}
                counter={counter}
                done={() => setOffer(false)}
              />
            )}
          </>
        ) : (
          <p className="muted">
            Select a rival from the world panel. Their public profile opens here; your domestic position remains
            private.
          </p>
        )}
      </section>
      <Agreements
        w={w}
        send={send}
        busy={busy}
        counter={(d) => {
          select(d.from);
          setCounter(d);
          setOffer(true);
        }}
      />
    </div>
  );
}
