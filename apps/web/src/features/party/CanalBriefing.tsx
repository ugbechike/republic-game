import { timeLeft } from './usePartyTime';
import type { PartyProps } from './types';
export function CanalBriefing({
  game,
  send,
  busy,
  now,
  call,
}: PartyProps & { now: number; call: (id: string, purpose?: 'passage' | 'assistance') => void }) {
  const c = game.canal!;
  const oil = game.players.find((p) => p.role === 'oil')!;
  return (
    <article className="party-brief">
      <span className="kicker">YOUR CHIEF OF STAFF / CANAL MAINTENANCE</span>
      <h2>
        {c.maintenance === 'restricted' ? 'Passage is temporarily suspended.' : 'The canal needs urgent repairs.'}
      </h2>
      {c.maintenance === 'restricted' ? (
        <p>
          Crews reopen the route in {timeLeft(c.restrictedUntil, now)}. Negotiate the next shipment while they work.
        </p>
      ) : (
        <>
          <p>
            Future oil shipments need this route. Fund repairs for 4 Credits (+6 Support, +4 Influence), ask {oil.name}{' '}
            for funding in exchange for passage, or close for 30 seconds (−4 Support).
          </p>
          <p>Decision due in {timeLeft(c.dueAt, now)}; otherwise a safety closure begins.</p>
          <div className="party-actions">
            <button
              className="primary"
              disabled={busy || game.me.inventory.credits < 4}
              onClick={() => send({ kind: 'maintenance', choice: 'repair' })}
            >
              FUND REPAIRS · 4 CREDITS
            </button>
            <button disabled={busy || !oil.online} onClick={() => call(oil.id, 'assistance')}>
              REQUEST ASSISTANCE
            </button>
            <button disabled={busy} onClick={() => send({ kind: 'maintenance', choice: 'restrict' })}>
              RESTRICT PASSAGE · 30s
            </button>
          </div>
        </>
      )}
    </article>
  );
}
