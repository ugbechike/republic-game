import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { PartyProps } from './types';
export function SessionMenu({ world, send, busy, leave }: PartyProps & { leave: () => void }) {
  const [open, setOpen] = useState(false),
    [confirm, setConfirm] = useState(false);
  return (
    <div className="party-session">
      <button aria-label="Game menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        •••
      </button>
      {open && (
        <div className="party-session-list">
          <button onClick={leave}>Leave game</button>
          {world.host === world.playerId && (
            <button
              onClick={() => {
                setConfirm(true);
                setOpen(false);
              }}
            >
              End Game
            </button>
          )}
          {world.development && world.host === world.playerId && (
            <button disabled={busy} onClick={() => send({ kind: 'resetMatch' })}>
              Reset Match (development)
            </button>
          )}
        </div>
      )}
      {confirm &&
        createPortal(
          <div className="party-overlay">
            <section
              className="party-composer"
              role="dialog"
              aria-modal="true"
              aria-label="End this game for everyone?"
            >
              <h2>End this game for everyone?</h2>
              <p>
                Current standings become final. Unsigned offers are cancelled. Signed escrow deliveries are honored now.
              </p>
              <div className="party-actions">
                <button onClick={() => setConfirm(false)}>Cancel</button>
                <button className="primary" disabled={busy} onClick={() => send({ kind: 'endGame' })}>
                  End Game
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
