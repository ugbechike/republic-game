import { useState } from 'react';
import { Phone, Check, ChevronDown } from 'lucide-react';
import { ROLE_INFO, ASSET_LABEL, type NationalNeed } from '@republic/contracts';
import { timeLeft } from './usePartyTime';
import type { PartyProps } from './types';
export function NeedBriefing({
  game,
  send,
  busy,
  now,
  call,
}: PartyProps & { now: number; call: (id: string) => void }) {
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
  return (
    <article className="party-brief">
      <header>
        <span className="party-initials">CS</span>
        <div>
          <span className="kicker">YOUR CHIEF OF STAFF</span>
          <p>{need?.optional ? 'A shared opportunity, President.' : 'One promise to your people.'}</p>
        </div>
        {need && (
          <time className={need.status === 'late' ? 'urgent' : ''}>
            {need.status === 'late' ? 'OVERDUE' : timeLeft(need.dueAt, now)}
          </time>
        )}
      </header>
      <h2>{need?.title ?? 'You kept your national promises.'}</h2>
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
      <div className="party-actions">
        {achievable && need ? (
          <button className="primary" disabled={busy} onClick={() => send({ kind: 'fulfill', need: need.id })}>
            <Check size={17} /> {need.optional ? 'SUPPORT THE RESPONSE' : 'FULFILL NATIONAL PROMISE'}
          </button>
        ) : (
          partners.slice(0, 2).map((p) => (
            <button className="primary" disabled={busy || !p.online} key={p.id} onClick={() => call(p.id)}>
              <Phone size={15} /> CALL {p.name.toUpperCase()}
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
