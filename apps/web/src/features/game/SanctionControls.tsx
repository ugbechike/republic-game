import { useState } from 'react';
import { TRADE_RESOURCES, RESOURCE_LABEL, type Action, type Commodity } from '@republic/contracts';
export function SanctionControls({ to, send, busy }: { to: string; send: (a: Action) => void; busy: boolean }) {
  const [kind, setKind] = useState<'trade' | 'resource' | 'financial' | 'condemnation'>('trade'),
    [resource, setResource] = useState<Commodity>('oil');
  return (
    <div className="panel">
      <h3>Economic and diplomatic pressure</h3>
      <div className="form-row">
        <label>
          Measure
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="trade">Trade sanctions</option>
            <option value="resource">Resource embargo</option>
            <option value="financial">Financial sanctions</option>
            <option value="condemnation">Diplomatic condemnation</option>
          </select>
        </label>
        {kind === 'resource' && (
          <label>
            Resource
            <select value={resource} onChange={(e) => setResource(e.target.value as Commodity)}>
              {TRADE_RESOURCES.map((k) => (
                <option key={k} value={k}>
                  {RESOURCE_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="muted small">
        Costs $0.5B and some domestic output. Trade sanctions block all exchanges; embargoes block contracts involving
        the selected resource; financial sanctions block cash and loans. Condemnation reduces reputation. Lost imports
        can hurt your own Republic.
      </p>
      <button
        disabled={busy}
        onClick={() => send({ type: 'sanction', to, kind, resource: kind === 'resource' ? resource : undefined })}
      >
        Impose measure
      </button>
      <button disabled={busy} onClick={() => send({ type: 'resolution', to })}>
        Propose coordinated sanctions · $1B
      </button>
    </div>
  );
}
