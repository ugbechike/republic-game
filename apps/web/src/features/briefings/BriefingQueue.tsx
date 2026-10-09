import { BellRing, MessageSquare, Globe2, ArrowRight } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { useActiveTime, countdown } from './useActiveTime';
export function BriefingQueue({
  w,
  open,
  diplomacy,
  events,
}: {
  w: RoomView;
  open: (id: string) => void;
  diplomacy: (id: string) => void;
  events: () => void;
}) {
  const now = useActiveTime(w),
    briefings = (w.me.briefings ?? []).filter((b) => b.status === 'open'),
    offers = w.deals.filter((d) => d.to === w.playerId && d.status === 'pending'),
    loans = w.loans.filter((l) => l.to === w.playerId && l.status === 'pending');
  return (
    <aside className="briefing-queue">
      <header>
        <BellRing size={15} />
        <span>PRESIDENTIAL BRIEFINGS</span>
      </header>
      {w.paused && <p>World paused · no Presidents connected</p>}
      {briefings.map((b) => (
        <button
          className={`briefing-alert ${b.dueAt - now < 60000 ? 'critical' : ''}`}
          key={b.id}
          onClick={() => open(b.id)}
        >
          <small>{b.minister.toUpperCase()}</small>
          <b>{b.title}</b>
          <span>
            Speak with Minister <ArrowRight size={12} />
            <time>{countdown(b.dueAt, now)}</time>
          </span>
        </button>
      ))}
      {offers.map((d) => (
        <button className="briefing-alert diplomatic" key={d.id} onClick={() => diplomacy(d.from)}>
          <small>
            <MessageSquare size={12} /> TRADE OFFER
          </small>
          <b>{w.republics.find((r) => r.id === d.from)?.name} wants to negotiate</b>
          <span>
            Accept, reject or counter <ArrowRight size={12} />
          </span>
        </button>
      ))}
      {loans.map((l) => (
        <button className="briefing-alert diplomatic" key={l.id} onClick={() => diplomacy(l.from)}>
          <small>FINANCE</small>
          <b>Loan offer from {w.republics.find((r) => r.id === l.from)?.name}</b>
          <span>
            Review terms <ArrowRight size={12} />
          </span>
        </button>
      ))}
      {w.worldCrisis && (
        <button className="briefing-alert world" onClick={events}>
          <small>
            <Globe2 size={12} /> WORLD CRISIS
          </small>
          <b>{w.worldCrisis.title}</b>
          <span>{countdown(w.worldCrisis.endsAt, now)} remaining</span>
        </button>
      )}
      {(w.vote || w.wars.some((x) => x.status === 'active') || w.me.crisis) && (
        <button className="briefing-alert critical" onClick={events}>
          <b>Assembly & security decisions</b>
          <span>
            Review live decisions <ArrowRight size={12} />
          </span>
        </button>
      )}
      {!briefings.length && !offers.length && !loans.length && !w.worldCrisis && (
        <p className="briefing-quiet">
          Your cabinet is monitoring reserves. Use this time to talk, plan and negotiate.
        </p>
      )}
      <button className="wire-link" onClick={events}>
        Events & briefing history <ArrowRight size={13} />
      </button>
    </aside>
  );
}
