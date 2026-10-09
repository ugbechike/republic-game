import { useState } from 'react';
import type { Action } from '@republic/contracts';
export function LoanForm({
  to,
  send,
  busy,
  credit,
}: {
  to: string;
  send: (a: Action) => void;
  busy: boolean;
  credit: number;
}) {
  const [amount, setAmount] = useState(3),
    [repayment, setRepayment] = useState(4),
    [term, setTerm] = useState(60),
    [mode, setMode] = useState<'bullet' | 'installments'>('bullet');
  return (
    <form
      className="loan-form loan-terms"
      onSubmit={(e) => {
        e.preventDefault();
        send({ type: 'loan', to, amount, repayment, term, mode });
      }}
    >
      <h3>Offer a bilateral loan</h3>
      <p className="muted small">
        Borrower credit {credit}/100 · principal limit ${Math.max(1, credit / 5).toFixed(1)}B. Default damages
        reputation, credit and relations.
      </p>
      <div className="form-row">
        <label>
          Principal ($B)
          <input
            type="number"
            min="1"
            max={Math.max(1, credit / 5)}
            step=".1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <label>
          Total repayment ($B)
          <input
            type="number"
            min={amount}
            max={amount * 2}
            step=".1"
            value={repayment}
            onChange={(e) => setRepayment(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Term
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
            {[12, 24, 36, 60, 120].map((n) => (
              <option key={n} value={n}>
                {n / 12} years
              </option>
            ))}
          </select>
        </label>
        <label>
          Repayment
          <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option value="bullet">Full amount at maturity</option>
            <option value="installments">Equal monthly payments</option>
          </select>
        </label>
      </div>
      <button disabled={busy}>Offer loan</button>
    </form>
  );
}
