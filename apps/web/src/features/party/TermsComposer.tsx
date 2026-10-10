import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { ASSETS, ASSET_LABEL, type Inventory, type PartyMeeting } from '@republic/contracts';
import type { PartyProps } from './types';
export function TermsComposer({
  game,
  meeting,
  send,
  busy,
  close,
}: PartyProps & { meeting: PartyMeeting; close: () => void }) {
  const [draft, setDraft] = useState(() => structuredClone(meeting.terms));
  const [revision] = useState(meeting.revision),
    [side, setSide] = useState<'offer' | 'want'>(meeting.participants[0] === game.me.id ? 'offer' : 'want');
  const [asset, setAsset] = useState<(typeof ASSETS)[number]>('credits');
  const own = (side === 'offer' ? meeting.participants[0] : meeting.participants[1]) === game.me.id;
  function quantity(a: keyof Inventory, n: number) {
    setDraft((d) => ({ ...d, [side]: { ...d[side], [a]: Math.max(0, Math.min(50, n)) } }));
  }
  return createPortal(
    <div className="party-overlay">
      <section className="party-composer" role="dialog" aria-modal="true" aria-label="Edit treaty terms">
        <button className="party-close" aria-label="Close terms editor" onClick={close}>
          <X />
        </button>
        <span className="kicker">THE SHARED NEGOTIATION TABLE</span>
        <h2>Put it in writing.</h2>
        <div className="party-tabs">
          {(['offer', 'want'] as const).map((s) => (
            <button key={s} aria-pressed={side === s} onClick={() => setSide(s)}>
              {game.players.find((p) => p.id === meeting.participants[s === 'offer' ? 0 : 1])?.name} gives
            </button>
          ))}
        </div>
        <div className="party-term-rows">
          {ASSETS.filter((a) => draft[side][a] > 0).map((a) => (
            <label key={a}>
              {ASSET_LABEL[a]}
              <input
                aria-label={`${ASSET_LABEL[a]} quantity`}
                type="number"
                min={0}
                max={50}
                value={draft[side][a]}
                onChange={(e) => quantity(a, Number(e.target.value))}
              />
              <button aria-label={`Remove ${ASSET_LABEL[a]}`} onClick={() => quantity(a, 0)}>
                <Trash2 size={16} />
              </button>
              {own && <small>{game.me.inventory[a]} available</small>}
            </label>
          ))}
        </div>
        <div className="party-add">
          <select aria-label="Asset to add" value={asset} onChange={(e) => setAsset(e.target.value as typeof asset)}>
            {ASSETS.map((a) => (
              <option value={a} key={a}>
                {ASSET_LABEL[a]}
              </option>
            ))}
          </select>
          <button onClick={() => quantity(asset, draft[side][asset] + 1)}>
            <Plus size={15} /> Add
          </button>
        </div>
        <label>
          Binding delivery
          <select
            value={draft.delay}
            onChange={(e) => setDraft({ ...draft, delay: Number(e.target.value) as 0 | 15 | 30 })}
          >
            <option value={0}>Immediately on both signatures</option>
            <option value={15}>In 15 seconds · fully escrowed</option>
            <option value={30}>In 30 seconds · fully escrowed</option>
          </select>
        </label>
        <p>
          Chat promises are nonbinding. These assets are reserved on proposal/acceptance and delivered only after both
          signatures.
        </p>
        {revision !== meeting.revision && (
          <p role="alert">The other President changed the table. Close and review their revision before editing.</p>
        )}
        <button
          className="primary"
          disabled={busy || revision !== meeting.revision}
          onClick={async () => {
            if (await send({ kind: 'terms', meeting: meeting.id, revision, terms: draft })) close();
          }}
        >
          PLACE TERMS ON TABLE
        </button>
      </section>
    </div>,
    document.body,
  );
}
