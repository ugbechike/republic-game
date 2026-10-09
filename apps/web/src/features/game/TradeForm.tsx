import { useState } from 'react';
import type { Action, Bundle, Deal, Commodity } from '@republic/contracts';
import { BundleFields } from './BundleFields';
export function TradeForm({
  to,
  send,
  busy,
  counter,
  done,
  need,
}: {
  to: string;
  send: (a: Action) => void;
  busy: boolean;
  counter?: Deal;
  done: () => void;
  need?: Commodity;
}) {
  const [offer, setOffer] = useState<Bundle>(
    counter?.want ?? { money: 1, resource: 'oil', amount: 0, moneyTiming: 'now', items: [] },
  );
  const [want, setWant] = useState<Bundle>(
    counter?.offer ?? {
      money: 0,
      resource: need ?? 'oil',
      amount: 0,
      items: [{ resource: need ?? 'oil', amount: 6, timing: 'now' }],
    },
  );
  const [years, setYears] = useState(counter?.years ?? 3),
    [start, setStart] = useState(counter?.startInMonths ?? 0),
    [reason, setReason] = useState('');
  return (
    <form
      className="trade-form"
      onSubmit={(e) => {
        e.preventDefault();
        send({
          type: 'trade',
          to,
          offer,
          want,
          years,
          startInMonths: start,
          reason: reason || undefined,
          counter: counter?.id,
        });
        done();
      }}
    >
      <h3>{counter ? 'Put a counteroffer on the table' : 'Propose a trade agreement'}</h3>
      <BundleFields label="YOU PROVIDE" value={offer} change={setOffer} />
      <BundleFields label="THEY PROVIDE" value={want} change={setWant} />
      <div className="form-row">
        <label>
          Recurring term
          <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {[1, 2, 3, 5, 10].map((n) => (
              <option value={n} key={n}>
                {n} years
              </option>
            ))}
          </select>
        </label>
        <label>
          Recurring supply starts
          <select value={start} onChange={(e) => setStart(Number(e.target.value))}>
            <option value={0}>On acceptance</option>
            <option value={3}>In 3 months</option>
            <option value={6}>In 6 months</option>
            <option value={12}>In 1 year</option>
          </select>
        </label>
      </div>
      <label>
        Share why you need this (optional)
        <input
          maxLength={160}
          placeholder="Keep your reason private, or make your case."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <button className="primary full" disabled={busy}>
        Send {counter ? 'counteroffer' : 'proposal'}
      </button>
      <p className="muted small">
        Immediate items transfer together only after acceptance. Annual quantities settle monthly. Future promises are
        binding when their start date arrives. Neither side can spend the other's incoming payment to fund the same
        exchange.
      </p>
    </form>
  );
}
