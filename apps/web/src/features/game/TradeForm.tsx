import { useState } from 'react';
import { RESOURCES, RESOURCE_LABEL, type Action, type Bundle, type Deal } from '@republic/contracts';
function BundleFields({ label, value, change }: { label: string; value: Bundle; change: (b: Bundle) => void }) {
  return (
    <fieldset>
      <legend>{label} · PER YEAR</legend>
      <div className="form-row">
        <label>
          Money ($B)
          <input
            type="number"
            min="0"
            max="30"
            step="0.1"
            value={value.money}
            onChange={(e) => change({ ...value, money: Number(e.target.value) })}
          />
        </label>
        <label>
          Resource
          <select
            value={value.resource}
            onChange={(e) => change({ ...value, resource: e.target.value as Bundle['resource'] })}
          >
            {RESOURCES.map((r) => (
              <option value={r} key={r}>
                {RESOURCE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Units
          <input
            type="number"
            min="0"
            max="60"
            step="0.1"
            value={value.amount}
            onChange={(e) => change({ ...value, amount: Number(e.target.value) })}
          />
        </label>
      </div>
    </fieldset>
  );
}
export function TradeForm({
  to,
  send,
  busy,
  counter,
  done,
}: {
  to: string;
  send: (a: Action) => void;
  busy: boolean;
  counter?: Deal;
  done: () => void;
}) {
  const [offer, setOffer] = useState<Bundle>(counter?.want ?? { money: 1, resource: 'agriculture', amount: 0 });
  const [want, setWant] = useState<Bundle>(counter?.offer ?? { money: 0, resource: 'oil', amount: 12 });
  const [years, setYears] = useState<2 | 5 | 10>((counter?.years as 2 | 5 | 10) ?? 2);
  return (
    <form
      className="trade-form"
      onSubmit={(e) => {
        e.preventDefault();
        send({ type: 'trade', to, offer, want, years, counter: counter?.id });
        done();
      }}
    >
      <h3>{counter ? 'Put a counteroffer on the table' : 'Propose a trade agreement'}</h3>
      <BundleFields label="YOU PROVIDE" value={offer} change={setOffer} />
      <BundleFields label="THEY PROVIDE" value={want} change={setWant} />
      <div className="form-row">
        <label>
          Term
          <select value={years} onChange={(e) => setYears(Number(e.target.value) as 2 | 5 | 10)}>
            {[2, 5, 10].map((n) => (
              <option value={n} key={n}>
                {n} years
              </option>
            ))}
          </select>
        </label>
        <button className="primary" disabled={busy}>
          Send {counter ? 'counteroffer' : 'proposal'}
        </button>
      </div>
      <p className="muted small">
        First monthly delivery on acceptance. Both parties must hold enough cash and resources. Broken deals damage
        reputation and output.
      </p>
    </form>
  );
}
