import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { PartyMeeting } from '@republic/contracts';
import type { PartyProps } from './types';
export function PartyChat({ game, meeting, send, busy }: PartyProps & { meeting: PartyMeeting }) {
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [meeting.chat.length]);
  return (
    <details className="party-chat" open>
      <summary>
        Private conversation <small>Promises here are nonbinding</small>
      </summary>
      <div className="party-chat-log" ref={list}>
        {meeting.chat.map((m) => (
          <p key={m.id} className={m.from === game.me.id ? 'mine' : ''}>
            <small>{game.players.find((p) => p.id === m.from)?.leader}</small>
            {m.text}
          </p>
        ))}
        {!meeting.chat.length && <p>Talk across the table, or privately here. Only signed terms are binding.</p>}
      </div>
      {!['signed', 'closed'].includes(meeting.status) && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (text.trim() && (await send({ kind: 'chat', meeting: meeting.id, text }))) setText('');
          }}
        >
          <input
            aria-label="Private message"
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your message…"
          />
          <button disabled={busy || !text.trim()} aria-label="Send message">
            <Send size={17} />
          </button>
        </form>
      )}
    </details>
  );
}
