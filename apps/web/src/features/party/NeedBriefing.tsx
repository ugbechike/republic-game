import { CanalBriefing } from './CanalBriefing';
import { useState } from 'react';
import { Phone, Check, ChevronDown } from 'lucide-react';
import { ROLE_INFO, ASSET_LABEL } from '@republic/contracts';
import { timeLeft } from './usePartyTime';
import type { PartyProps } from './types';
export function NeedBriefing({
  game,
  world,
  send,
  busy,
  now,
  call,
}: PartyProps & { now: number; call: (id: string, purpose?: 'passage' | 'assistance') => void }) {
  const [options, setOptions] = useState(false);
  const need = game.me.needs.find((n) => ['open', 'late'].includes(n.status));
  const achievable = need?.requirements.every(
    (r) => r.assets.reduce((n, a) => n + game.me.inventory[a], 0) >= r.amount,
  );
  const partners = game.players.filter(
    (p) =>
      p.id !== game.me.id &&
      p.role &&
      need?.requirements.some(
        (r) =>
          r.assets.includes(ROLE_INFO[p.role!].asset) &&
          r.assets.reduce((n, a) => n + game.me.inventory[a], 0) < r.amount,
      ),
  );
  if (game.me.role === 'canal' && game.canal && game.canal.maintenance !== 'repaired')
    return <CanalBriefing {...{ game, world, send, busy, now, call }} />;
  const blocked =
    need?.shipment &&
    (game.canal?.maintenance === 'restricted' || (need.optional && game.canal?.maintenance === 'pending'));
  return (
    <article className="party-brief">
      <header>
        <span className="party-initials">CS</span>
        <div>
          <span className="kicker">YOUR CHIEF OF STAFF</span>
          <p>{need?.optional ? 'A shared opportunity, President.' : 'One promise to your people.'}</p>
        </div>
        {!need &&
          game.players.length === 2 &&
          game.me.role === 'canal' &&
          !game.news.some((n) => n.id === `${game.id}-emergency-shipment`) && (
            <button
              className="primary"
              disabled={busy}
              onClick={() => call(game.players.find((p) => p.role === 'oil')!.id, 'passage')}
            >
              OFFER CANAL PASSAGE
            </button>
          )}
        {need && (
          <time className={need.status === 'late' ? 'urgent' : ''}>
            {need.status === 'late' ? 'OVERDUE' : timeLeft(need.dueAt, now)}
          </time>
        )}
      </header>
      <h2>
        {need?.title ??
          (game.players.length === 2 &&
          game.me.role === 'canal' &&
          !game.news.some((n) => n.id === `${game.id}-emergency-shipment`)
            ? 'The next shipment needs your passage.'
            : 'You kept your national promises.')}
      </h2>
      <p>
        {need
          ? need.description
          : 'Help another President fulfill theirs. Reliable deliveries earn influence when their people actually use them.'}
      </p>
      {need && (
        <>
          <div className="party-requirements">
            {need.requirements.map((r, i) => (
              <span
                key={i}
                className={r.assets.reduce((n, a) => n + game.me.inventory[a], 0) >= r.amount ? 'secured' : ''}
              >
                <b>{r.amount}</b> {r.assets.map((a) => ASSET_LABEL[a]).join(' / ')}
                <small>{r.assets.reduce((n, a) => n + game.me.inventory[a], 0)} available</small>
              </span>
            ))}
          </div>
          <p className="party-stakes">
            {need.optional
              ? '+8 Support · +4 Influence for helping the shared response.'
              : need.status === 'late'
                ? '−18 Support applied. Fulfill now to recover +18.'
                : '+32 Support if fulfilled · −18 if the deadline passes.'}
          </p>
        </>
      )}
      {blocked && (
        <p>
          Canal maintenance blocks this shipment.{' '}
          {game.canal?.maintenance === 'restricted'
            ? `Reopens in ${timeLeft(game.canal.restrictedUntil, now)}.`
            : 'Ask the Authority to fund repairs or offer assistance.'}
        </p>
      )}
      {blocked && (
        <button disabled={busy} onClick={() => call(game.players.find((p) => p.role === 'canal')!.id, 'assistance')}>
          NEGOTIATE REPAIRS
        </button>
      )}
      {need?.shipment && (
        <p>Shipping consumes the required Oil and passage, earning {need.optional ? 10 : 6} Credits.</p>
      )}
      <div className="party-actions">
        {achievable && need && !blocked ? (
          <button
            className="primary"
            disabled={busy}
            onClick={() => send({ kind: need.shipment ? 'ship' : 'fulfill', need: need.id })}
          >
            <Check size={17} />{' '}
            {need.shipment ? 'SHIP OIL' : need.optional ? 'SUPPORT THE RESPONSE' : 'FULFILL NATIONAL PROMISE'}
          </button>
        ) : (
          partners.slice(0, 2).map((p) => (
            <button
              className="primary"
              disabled={busy || !p.online}
              key={p.id}
              onClick={() => call(p.id, game.players.length === 2 ? 'passage' : undefined)}
            >
              <Phone size={15} /> {game.players.length === 2 ? 'NEGOTIATE PASSAGE' : `CALL ${p.name.toUpperCase()}`}
              {!p.online && ' · OFFLINE'}
            </button>
          ))
        )}
        {need && (
          <button onClick={() => setOptions(!options)} aria-expanded={options}>
            Review options <ChevronDown size={14} />
          </button>
        )}
      </div>
      {options && need && (
        <div className="party-options">
          <p>{game.me.intel}</p>
          <p>
            Available stock excludes assets reserved on proposal tables. Negotiated deliveries must arrive before you
            fulfill this briefing.
          </p>
          {!need.optional && (
            <>
              <button
                disabled={busy || game.me.fallbackUsed || game.me.inventory.credits < 4}
                onClick={() => send({ kind: 'fallback', need: need.id })}
              >
                Use neutral relief · 4 Credits
              </button>
              <small>
                Resolves the objective with only +12 Support and no Influence. One use; negotiating earns more.{' '}
                {game.me.inventory.credits < 4 ? 'You need four available Credits.' : ''}
              </small>
            </>
          )}
        </div>
      )}
    </article>
  );
}
