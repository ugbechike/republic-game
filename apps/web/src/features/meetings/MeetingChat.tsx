import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { Action, Meeting, RoomView } from '@republic/contracts';
export function MeetingChat({
  m,
  w,
  send,
  busy,
}: {
  m: Meeting;
  w: RoomView;
  send: (a: Action) => Promise<void>;
  busy: boolean;
}) {
  const [text, setText] = useState(''),
    end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (end.current) end.current.scrollTop = end.current.scrollHeight;
  }, [m.messages.length]);
  return (
    <aside className="meeting-conversation">
      <header>
        <MessageCircle size={16} />
        <span>PRIVATE CONVERSATION</span>
        <small>{m.participants.length} Presidents</small>
      </header>
      <div ref={end} className="meeting-messages" role="log" aria-label="Private conversation" aria-live="polite">
        {!m.messages.length && (
          <p className="conversation-empty">
            Talk across the table.
            <br />
            Or leave a message here.<small>Only the Presidents in this room can read it.</small>
          </p>
        )}
        {m.messages.map((msg) => (
          <div key={msg.id} className={msg.author === w.playerId ? 'message mine' : 'message'}>
            <b>{w.republics.find((r) => r.id === msg.author)?.leader}</b>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      {!['signed', 'closed', 'declined'].includes(m.status) && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (text.trim()) {
              await send({ type: 'meetingChat', id: m.id, text });
              setText('');
            }
          }}
        >
          <input
            aria-label="Message to the other President"
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say it to the President…"
          />
          <button className="primary" aria-label="Send private message" disabled={busy || !text.trim()}>
            <Send size={18} />
          </button>
        </form>
      )}
    </aside>
  );
}
