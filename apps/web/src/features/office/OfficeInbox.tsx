import { PresidentialCalendar } from './PresidentialCalendar';
import { useState } from 'react';
import { ArrowUpRight, MailOpen } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { useActiveTime, countdown } from '../briefings/useActiveTime';
export function OfficeInbox({
  w,
  brief,
  matter,
  foreign,
}: {
  w: RoomView;
  brief: (id: string) => void;
  matter: (id: string) => void;
  foreign: () => void;
}) {
  const [category, setCategory] = useState('URGENT'),
    now = useActiveTime(w);
  const briefings = (w.me.briefings ?? []).filter(
    (b) =>
      b.status === 'open' &&
      (category === 'URGENT' ||
        category === 'CABINET' ||
        (category === 'SECURITY' && b.kind === 'security') ||
        (category === 'GOVERNORS' && b.kind === 'flood')),
  );
  const matters = (w.me.officeMatters ?? []).filter(
    (m) =>
      m.status === 'open' &&
      (category === 'URGENT' ||
        (category === 'GOVERNORS' && m.kind === 'governor') ||
        (category === 'BUSINESS' && m.kind === 'business')),
  );
  return (
    <section className="presidential-inbox">
      <span className="kicker">OFFICIAL CORRESPONDENCE</span>
      <h2>On your desk.</h2>
      <p className="muted">A decision, a conversation, a consequence.</p>
      <PresidentialCalendar w={w} brief={brief} matter={matter} meetings={foreign} />
      <nav className="inbox-categories" aria-label="Correspondence categories">
        {['URGENT', 'FOREIGN', 'CABINET', 'GOVERNORS', 'BUSINESS', 'SECURITY', 'ARCHIVE'].map((k) => (
          <button key={k} className={category === k ? 'active' : ''} onClick={() => setCategory(k)}>
            {k}
          </button>
        ))}
      </nav>
      {briefings.map((b) => (
        <button className="correspondence-letter" key={b.id} onClick={() => brief(b.id)}>
          <span className="letter-mark">{b.kind === 'flood' ? 'G' : 'M'}</span>
          <span>
            <small>{b.minister.toUpperCase()}</small>
            <b>{b.title}</b>
            <em>Briefing enclosed · {countdown(b.dueAt, now)} remaining</em>
          </span>
          <ArrowUpRight />
        </button>
      ))}
      {matters.map((m) => (
        <button className="correspondence-letter" key={m.id} onClick={() => matter(m.id)}>
          <span className="letter-mark">{m.kind === 'business' ? 'B' : 'G'}</span>
          <span>
            <small>{m.source.toUpperCase()}</small>
            <b>{m.title}</b>
            <em>
              {m.priority.toUpperCase()} · {countdown(m.dueAt, now)} remaining
            </em>
          </span>
          <ArrowUpRight />
        </button>
      ))}
      {category === 'FOREIGN' && (
        <button className="correspondence-letter" onClick={foreign}>
          <MailOpen />
          <span>
            <b>Foreign correspondence & meetings</b>
            <em>Open the secure line to another President.</em>
          </span>
          <ArrowUpRight />
        </button>
      )}
      {category === 'ARCHIVE' && (
        <div className="office-archive">
          {w.notices.slice(0, 30).map((n) => (
            <article key={n.id}>
              <small>GOVERNMENT RECORD · MONTH {n.month}</small>
              <p>{n.text}</p>
            </article>
          ))}
        </div>
      )}
      {!briefings.length && !matters.length && !['FOREIGN', 'ARCHIVE'].includes(category) && (
        <p className="empty-correspondence">
          Your {category.toLowerCase()} correspondence is clear. Your Chief of Staff will bring new matters to you.
        </p>
      )}
    </section>
  );
}
