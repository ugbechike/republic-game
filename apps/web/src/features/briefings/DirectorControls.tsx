import { useState } from 'react';
import {
  TRADE_RESOURCES,
  RESOURCE_LABEL,
  type Action,
  type Commodity,
  type RoomView,
  type WorldCrisisKind,
} from '@republic/contracts';
export function DirectorControls({ w, send, busy }: { w: RoomView; send: (a: Action) => void; busy: boolean }) {
  const [target, setTarget] = useState(w.playerId),
    [resource, setResource] = useState<Commodity>('gas'),
    [amount, setAmount] = useState(6),
    [crisis, setCrisis] = useState<WorldCrisisKind>('energy');
  if (!w.development || w.host !== w.playerId) return null;
  return (
    <details className="director-controls panel">
      <summary>GameDirector development controls</summary>
      <div className="form-row">
        <label>
          Republic
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {w.republics.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
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
        <label>
          Units / months
          <input type="number" min="0" max="240" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <label>
          World crisis
          <select value={crisis} onChange={(e) => setCrisis(e.target.value as WorldCrisisKind)}>
            {['energy', 'food', 'commodities', 'recession'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="actions wrap">
        {(
          [
            'shortage',
            'treasury',
            'flood',
            'energy',
            'world',
            'reserves',
            'advance',
            'surplus',
            'dependency',
            'tension',
          ] as const
        ).map((kind) => (
          <button
            disabled={busy}
            key={kind}
            onClick={() => send({ type: 'directorDebug', kind, target, resource, amount, crisis })}
          >
            {kind}
          </button>
        ))}
      </div>
      <div className="actions wrap">
        {(['speed', 'money', 'approval', 'election', 'recession', 'end'] as const).map((kind) => (
          <button key={kind} disabled={busy} onClick={() => send({ type: 'debug', kind })}>
            Session: {kind}
          </button>
        ))}
      </div>
    </details>
  );
}
