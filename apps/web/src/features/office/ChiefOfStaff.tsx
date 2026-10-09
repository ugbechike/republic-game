import { ChevronRight, Clock3, X } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { useState } from 'react';
import { useActiveTime, countdown } from '../briefings/useActiveTime';
export function ChiefOfStaff({
  w,
  brief,
  matter,
  inbox,
  meeting,
  meetingTitle,
}: {
  w: RoomView;
  brief: (id: string) => void;
  matter: (id: string) => void;
  inbox: () => void;
  meeting?: () => void;
  meetingTitle?: string;
}) {
  const [later, setLater] = useState(false),
    now = useActiveTime(w);
  const briefings = (w.me.briefings ?? []).filter((b) => b.status === 'open').sort((a, b) => a.dueAt - b.dueAt);
  const matters = (w.me.officeMatters ?? []).filter((m) => m.status === 'open');
  const count = briefings.length + matters.length + Number(!!meeting);
  if (later)
    return (
      <button className="chief-recall" onClick={() => setLater(false)}>
        CHIEF OF STAFF · {count} matters <ChevronRight size={16} />
      </button>
    );
  return (
    <aside className="chief-of-staff">
      <header>
        <span className="adviser-portrait">CS</span>
        <div>
          <small>YOUR FIRST BRIEFING</small>
          <b>Chief of Staff</b>
        </div>
        <button aria-label="Review later" onClick={() => setLater(true)}>
          <X size={16} />
        </button>
      </header>
      <p>
        {count
          ? `${count} ${count === 1 ? 'matter requires' : 'matters require'} your attention, President.`
          : 'The cabinet is monitoring your Republic. This is a good moment to open a conversation.'}
      </p>
      <div className="chief-agenda">
        {meeting && (
          <button onClick={meeting}>
            <span className="agenda-dot foreign" />
            <span>
              {meetingTitle ?? 'A President is waiting'}
              <small>PRIVATE MEETING REQUEST</small>
            </span>
            <ChevronRight size={17} />
          </button>
        )}
        {briefings.slice(0, 2).map((b) => (
          <button key={b.id} onClick={() => brief(b.id)}>
            <span className="agenda-dot urgent" />
            <span>
              {b.title}
              <small>{b.minister}</small>
            </span>
            <time>{countdown(b.dueAt, now)}</time>
          </button>
        ))}
        {matters.slice(0, Math.max(0, 3 - briefings.length - Number(!!meeting))).map((m) => (
          <button key={m.id} onClick={() => matter(m.id)}>
            <span className="agenda-dot" />
            <span>
              {m.title}
              <small>{m.source}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      <footer>
        <Clock3 size={13} />
        <span>
          TODAY · {w.vote ? 'Assembly floor open' : w.worldCrisis ? 'World crisis briefing' : 'Cabinet on call'}
        </span>
        <button onClick={inbox}>
          All correspondence <ChevronRight size={13} />
        </button>
      </footer>
    </aside>
  );
}
