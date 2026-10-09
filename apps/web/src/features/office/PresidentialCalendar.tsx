import type { RoomView } from '@republic/contracts';
import { countdown, useActiveTime } from '../briefings/useActiveTime';
export function PresidentialCalendar({
  w,
  brief,
  matter,
  meetings,
}: {
  w: RoomView;
  brief: (id: string) => void;
  matter: (id: string) => void;
  meetings: () => void;
}) {
  const now = useActiveTime(w);
  const entries = [
    ...(w.me.briefings ?? [])
      .filter((b) => b.status === 'open')
      .map((b) => ({ id: b.id, time: b.dueAt, title: b.minister, action: () => brief(b.id) })),
    ...(w.me.officeMatters ?? [])
      .filter((m) => m.status === 'open')
      .map((m) => ({ id: m.id, time: m.dueAt, title: m.source, action: () => matter(m.id) })),
    ...(w.meetings ?? [])
      .filter((m) => ['requested', 'active', 'proposed', 'agreed'].includes(m.status))
      .map((m) => ({
        id: m.id,
        time: m.delayedUntil ?? now,
        title: `${m.agenda} · ${w.republics.find((r) => m.participants.includes(r.id) && r.id !== w.playerId)?.name}`,
        action: meetings,
      })),
  ].sort((a, b) => a.time - b.time);
  return (
    <div className="presidential-calendar">
      <h3>TODAY / YOUR WORKING SCHEDULE</h3>
      {entries.slice(0, 4).map((e) => (
        <button key={e.id} onClick={e.action}>
          <time>{e.time <= now ? 'NOW' : countdown(e.time, now)}</time>
          <span>{e.title}</span>
          <small>{e.time <= now ? 'Ready to join' : 'Until response due'}</small>
        </button>
      ))}
      {!entries.length && <p>The cabinet is on call. Open a diplomatic conversation.</p>}
    </div>
  );
}
