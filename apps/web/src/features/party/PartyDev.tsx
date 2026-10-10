import { ASSETS, ASSET_LABEL } from '@republic/contracts';
import { useState } from 'react';
import type { PartyProps } from './types';
export function PartyDev({ send, busy }: PartyProps) {
  const [asset, setAsset] = useState<(typeof ASSETS)[number]>('credits'),
    [amount, setAmount] = useState(8);
  return (
    <details className="party-dev">
      <summary>Development controls</summary>
      <div className="party-actions">
        <button disabled={busy} onClick={() => send({ kind: 'debug', command: 'advance', amount: 30 })}>
          Advance 30 seconds
        </button>
        <button disabled={busy} onClick={() => send({ kind: 'debug', command: 'twist' })}>
          Force twist
        </button>
        <button disabled={busy} onClick={() => send({ kind: 'debug', command: 'need' })}>
          Simulate need
        </button>
        <button disabled={busy} onClick={() => send({ kind: 'debug', command: 'end' })}>
          Jump to results
        </button>
      </div>
      <label>
        Inventory asset
        <select value={asset} onChange={(e) => setAsset(e.target.value as typeof asset)}>
          {ASSETS.map((a) => (
            <option key={a} value={a}>
              {ASSET_LABEL[a]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Units
        <input type="number" min={0} max={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </label>
      <button disabled={busy} onClick={() => send({ kind: 'debug', command: 'inventory', asset, amount })}>
        Set inventory
      </button>
      <p>Deal evaluations are always available on the live negotiation table.</p>
    </details>
  );
}
