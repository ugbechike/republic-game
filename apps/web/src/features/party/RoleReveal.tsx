import { ROLE_INFO, ASSET_LABEL } from '@republic/contracts';
import { Emblem } from './Emblem';
import { InventoryStrip } from './InventoryStrip';
import { usePartyTime, timeLeft } from './usePartyTime';
import type { PartyProps } from './types';
export function RoleReveal({ game, send, busy }: PartyProps) {
  const me = game.me,
    role = ROLE_INFO[me.role!],
    now = usePartyTime(game);
  return (
    <main className="party-reveal">
      <span className="kicker">CONFIDENTIAL / THE HAND YOU WERE DEALT</span>
      <div className="party-role-card">
        <Emblem value={me.emblem} large />
        <span className="kicker">{me.name}</span>
        <h1>{role.name}</h1>
        <p>{role.headline}</p>
        <InventoryStrip inventory={me.inventory} />
        <hr />
        <h2>{me.needs[0].title}</h2>
        <p>
          Secure{' '}
          {me.needs[0].requirements
            .map((r) => `${r.amount} ${r.assets.map((a) => ASSET_LABEL[a]).join(' or ')}`)
            .join(' + ')}
          .
        </p>
        <small>
          Fulfill your promise for +32 Support. Missing its deadline costs 18. Neutral relief is a weaker backup.
        </small>
      </div>
      <button className="game-button gold" disabled={busy || me.ready} onClick={() => send({ kind: 'ready' })}>
        {me.ready ? 'WAITING FOR FELLOW PRESIDENTS' : 'I UNDERSTAND. OPEN MY OFFICE.'}
      </button>
      <p>
        The {(game.durationMs ?? 300000) / 60000}-minute clock starts together · {timeLeft(game.revealEndsAt, now)}
      </p>
    </main>
  );
}
