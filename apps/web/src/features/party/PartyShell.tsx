import { PartyFeedback } from './PartyFeedback';
import { SessionMenu } from './SessionMenu';
import { useState } from 'react';
import { Landmark, Handshake, Globe2, Phone } from 'lucide-react';
import { ROLE_INFO } from '@republic/contracts';
import { Emblem } from './Emblem';
import { InventoryStrip } from './InventoryStrip';
import { PartyOffice } from './PartyOffice';
import { PartyMeetings } from './PartyMeetings';
import { PartyWorld } from './PartyWorld';
import { PartyHistory } from './PartyHistory';
import { PartyDev } from './PartyDev';
import { timeLeft, usePartyTime } from './usePartyTime';
import type { PartyProps } from './types';
export function PartyShell(props: PartyProps & { leave: () => void }) {
  const { game, world, send, busy, leave } = props;
  const [view, setView] = useState('office'),
    [meeting, select] = useState<string>(),
    [history, setHistory] = useState(false);
  const now = usePartyTime(game);
  const incoming = game.meetings.find((m) => m.status === 'requested' && m.participants[1] === game.me.id);
  const due = game.meetings.find(
    (m) =>
      (m.status === 'accepted' && !m.signatures.includes(game.me.id)) ||
      (m.status === 'proposed' && m.proposer !== game.me.id),
  );
  const seconds = Math.max(0, game.endsAt - now);
  function navigate(next: string) {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  async function call(id: string, purpose?: 'passage' | 'assistance') {
    const existing = game.meetings.find((m) => !['signed', 'closed'].includes(m.status) && m.participants.includes(id));
    if (existing) {
      select(existing.id);
      navigate('meetings');
      return;
    }
    if (await send({ kind: 'call', to: id, purpose })) {
      select(undefined);
      navigate('meetings');
    }
  }
  return (
    <main className={`party-shell ${seconds <= 30000 ? 'party-final' : ''}`}>
      <div className="party-hud-wrap">
        <header className="party-hud">
          <button className="party-brand" onClick={() => navigate('office')}>
            <Emblem value={game.me.emblem} />
            <span>
              {game.me.name}
              <small>{ROLE_INFO[game.me.role!].name}</small>
            </span>
          </button>
          <time className="party-countdown" aria-label="Match time remaining">
            {timeLeft(game.endsAt, now)}
            <small>{seconds <= 30000 ? 'FINAL MOVES' : 'TIME REMAINING'}</small>
          </time>
          <div className="party-scores">
            <button onClick={() => setHistory(true)}>
              <b>{game.me.support}</b>
              <small>PUBLIC SUPPORT</small>
            </button>
            <button onClick={() => setHistory(true)}>
              <b>{game.me.influence}</b>
              <small>GLOBAL INFLUENCE</small>
            </button>
          </div>
          <SessionMenu {...props} />
        </header>
        <div className="party-stock">
          <InventoryStrip inventory={game.me.inventory} />
        </div>
      </div>
      {game.twist && (
        <details className="party-news">
          <summary>WORLD SERVICE · {game.twist.title}</summary>
          <p>{game.twist.description}</p>
          <button
            onClick={() => {
              navigate('office');
            }}
          >
            Review national response
          </button>
        </details>
      )}
      <PartyFeedback game={game} now={now} />
      {view === 'office' ? (
        <PartyOffice {...props} now={now} call={call} navigate={navigate} history={() => setHistory(true)} />
      ) : view === 'meetings' ? (
        <PartyMeetings {...props} selected={meeting} select={select} call={call} now={now} />
      ) : (
        <PartyWorld {...props} call={call} />
      )}
      {view !== 'meetings' && (incoming || due) && (
        <button
          className="party-incoming"
          onClick={() => {
            select((incoming ?? due)?.id);
            navigate('meetings');
          }}
        >
          <Phone size={18} />
          {incoming
            ? `${game.players.find((p) => p.id === incoming.participants[0])?.name} is calling`
            : due?.status === 'accepted'
              ? 'Your signature is requested'
              : 'A proposal awaits your response'}
          <span>OPEN SECURE LINE →</span>
        </button>
      )}
      <nav className="party-nav" aria-label="Presidential navigation">
        {[
          ['office', 'OFFICE', Landmark],
          ['meetings', 'MEETINGS', Handshake],
          ['world', 'WORLD', Globe2],
        ].map(([id, label, Icon]) => {
          const Glyph = Icon as typeof Landmark;
          return (
            <button
              key={String(id)}
              aria-current={view === id ? 'page' : undefined}
              onClick={() => navigate(String(id))}
            >
              <Glyph size={18} />
              {String(label)}
            </button>
          );
        })}
      </nav>
      {history && <PartyHistory game={game} close={() => setHistory(false)} />}
      {world.development && world.host === world.playerId && view === 'world' && <PartyDev {...props} />}
    </main>
  );
}
