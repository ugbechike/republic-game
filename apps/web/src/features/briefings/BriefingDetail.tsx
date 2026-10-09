import { X, ArrowRight, TriangleAlert } from 'lucide-react';
import { RESOURCE_LABEL, SHORTAGE_STAGES, type Action, type Commodity, type RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { useActiveTime, countdown } from './useActiveTime';
export function BriefingDetail({
  w,
  id,
  close,
  send,
  busy,
  negotiate,
  visit,
}: {
  w: RoomView;
  id: string;
  close: () => void;
  send: (a: Action) => void;
  busy: boolean;
  negotiate: (id: string, resource?: Commodity) => void;
  visit?: (id: string) => void;
}) {
  const now = useActiveTime(w),
    b = w.me.briefings?.find((b) => b.id === id);
  if (!b) return null;
  const resource = b.resource,
    f = resource ? w.me.economy?.supply[resource] : undefined;
  const suppliers = resource
    ? w.republics.filter((r) => r.id !== w.playerId && (r.market?.[resource] ?? 0) > 0)
    : w.republics.filter((r) => r.id !== w.playerId);
  const resolved = b.status !== 'open',
    closed = resolved || now >= b.dueAt,
    action = (choice: Extract<Action, { type: 'briefing' }>['choice']) => send({ type: 'briefing', id: b.id, choice });
  return (
    <div className="briefing-backdrop">
      <section className="briefing-detail" role="dialog" aria-modal="true" aria-label={b.title}>
        <header>
          <span className="kicker">{b.minister.toUpperCase()}</span>
          <button aria-label="Close briefing" onClick={close}>
            <X size={18} />
          </button>
        </header>
        <h1>{b.title}</h1>
        <p>{b.description}</p>
        {b.region && visit && (
          <button onClick={() => visit(b.region!)}>
            VIEW DAMAGE · {w.me.regions.find((r) => r.id === b.region)?.name}
          </button>
        )}
        <div className="briefing-deadline">
          <TriangleAlert size={17} />
          {resolved ? b.status.toUpperCase() : `RESPONSE WINDOW ${countdown(b.dueAt, now)}`}
          {w.paused ? ' · PAUSED' : ''}
        </div>
        <div className="briefing-facts">
          {resource && (
            <>
              <span>
                Required reserves
                <b>
                  {b.amount.toFixed(1)} {RESOURCE_LABEL[resource]}
                </b>
              </span>
              <span>
                Available<b>{w.me.stocks[resource].toFixed(1)} units</b>
              </span>
            </>
          )}
          <span>
            Required funds<b>${b.cost.toFixed(1)}B</b>
          </span>
          <span>
            Treasury<b>${w.me.metrics.treasury.toFixed(1)}B</b>
          </span>
          {f && (
            <>
              <span>
                Monthly deficit<b>{Math.max(0, -f.balance).toFixed(2)} units</b>
              </span>
              <span>
                Reserve runway<b>{f.coverage >= 999 ? 'Supply covered' : `${f.coverage.toFixed(1)} months`}</b>
              </span>
            </>
          )}
        </div>
        {f && (
          <p className="briefing-consequence">
            {SHORTAGE_STAGES[f.stage]} · Prices → service interruptions → output → jobs → approval. Securing supply
            reverses pressure gradually.
          </p>
        )}
        <p className="muted small">
          If unresolved:{' '}
          {b.kind === 'flood'
            ? `$${b.damage}B GDP damage and infrastructure losses`
            : 'approval −2 at the deadline; underlying shortages continue'}
          . Delaying once costs 1 approval and grants one minute.
        </p>
        <h3>{resource ? 'KNOWN SUPPLIERS' : 'PRESIDENTS AT THE TABLE'}</h3>
        <p className="muted small">
          Public production estimates, units/month. Stockpiles and your reason remain private unless you share them in a
          proposal.
        </p>
        <div className="supplier-list">
          {suppliers.map((r) => (
            <button key={r.id} onClick={() => negotiate(r.id, resource)}>
              <FlagBanner flag={r.flag} />
              <span>
                <b>{r.name}</b>
                <small>
                  {resource
                    ? `Estimated surplus ${r.market?.[resource]?.toFixed(1)}/month`
                    : 'Discuss a bilateral loan'}
                </small>
              </span>
              NEGOTIATE <ArrowRight size={15} />
            </button>
          ))}
          {!suppliers.length && (
            <p>
              No domestic producer has a known surplus. Negotiate existing reserves, coordinate production, or use
              costly emergency procurement.
            </p>
          )}
        </div>
        <div className="briefing-actions">
          <button className="primary" disabled={busy || closed} onClick={() => action('resolve')}>
            Fund / confirm response
          </button>
          <button disabled={busy || closed || b.requested} onClick={() => action('assistance')}>
            Request foreign assistance
          </button>
          <button disabled={busy || closed || b.delayed} onClick={() => action('delay')}>
            Delay · −1 approval
          </button>
          {resource && b.kind !== 'flood' && (
            <button disabled={busy || closed || b.alternativeUsed} onClick={() => action('alternative')}>
              Emergency procurement · $3B / four months
            </button>
          )}
          <button disabled={busy || closed || !!w.vote} onClick={() => action('mediation')}>
            Seek mediation · $1B
          </button>
          <button
            disabled={busy || closed || !!w.me.bankFacility || w.me.metrics.treasury >= 5}
            onClick={() => send({ type: 'institution', kind: 'emergency' })}
          >
            Accept emergency facility · $5B
          </button>
        </div>
        <p className="muted small">
          Bank terms: 7% total interest, spending cut at least 8%, corporate tax +3 points; caps bind until the
          five-year facility is repaid. Infrastructure construction stops for two years.
        </p>
        {b.kind === 'security' && b.target && (
          <button onClick={() => negotiate(b.target!, resource)}>
            Explore sanctions, alliances or military options
          </button>
        )}
      </section>
    </div>
  );
}
