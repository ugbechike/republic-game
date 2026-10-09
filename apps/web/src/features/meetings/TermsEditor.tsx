import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X } from 'lucide-react';
import type { Action, Meeting, RoomView } from '@republic/contracts';
import { BundleFields } from '../game/BundleFields';
export function TermsEditor({
  m,
  w,
  side,
  close,
  send,
  busy,
}: {
  m: Meeting;
  w: RoomView;
  side: 'offer' | 'want';
  close: () => void;
  send: (a: Action) => Promise<void>;
  busy: boolean;
}) {
  const [bundle, setBundle] = useState(structuredClone(m.terms[side]));
  const [years, setYears] = useState(m.terms.years),
    [delay, setDelay] = useState(m.terms.startInMonths);
  const [revision] = useState(m.revision);
  const owner = w.republics.find((r) => r.id === m.participants[side === 'offer' ? 0 : 1])!;
  return createPortal(
    <div className="executive-modal">
      <section className="terms-editor" role="dialog" aria-modal="true" aria-label="Edit negotiating terms">
        <header>
          <span className="kicker">PLACE TERMS ON THE TABLE</span>
          <button aria-label="Close terms editor" onClick={close}>
            <X size={20} />
          </button>
        </header>
        <h2>{owner.name} gives</h2>
        <p>Both Presidents can shape either side. Nothing moves until both sign.</p>
        <BundleFields label={`${owner.name}'s contribution`} value={bundle} change={setBundle} />
        <div className="term-schedule">
          <label>
            Agreement duration
            <select value={years} onChange={(e) => setYears(+e.target.value)}>
              {[1, 2, 3, 5, 10].map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </select>
          </label>
          <label>
            Scheduled deliveries start
            <select value={delay} onChange={(e) => setDelay(+e.target.value)}>
              {[0, 3, 6, 12].map((n) => (
                <option key={n} value={n}>
                  {n ? `In ${n} months` : 'Immediately'}
                </option>
              ))}
            </select>
          </label>
        </div>
        {revision !== m.revision && (
          <p role="alert">
            The other President changed the table. Close this document and review their terms before editing.
          </p>
        )}
        <button
          className="primary"
          disabled={busy || revision !== m.revision || m.status !== 'active'}
          onClick={async () => {
            await send({
              type: 'meetingTerms',
              id: m.id,
              revision,
              ...m.terms,
              [side]: bundle,
              years,
              startInMonths: delay,
            });
            close();
          }}
        >
          PLACE ON TABLE →
        </button>
      </section>
    </div>,
    document.body,
  );
}
