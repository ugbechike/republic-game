import { Building2, Globe2, Landmark, Handshake, LogOut } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
export function PresidencyChrome({
  w,
  view,
  navigate,
  economy,
  leave,
}: {
  w: RoomView;
  view: string;
  navigate: (v: string) => void;
  economy: () => void;
  leave: () => void;
}) {
  return (
    <>
      {' '}
      <header className="presidency-header">
        <button className="presidency-brand" onClick={() => navigate('office')}>
          <FlagBanner flag={w.me.flag} />
          <span>
            {w.me.name}
            <small>THE PRESIDENCY</small>
          </span>
        </button>
        <div className="presidential-vitals">
          <button onClick={() => economy()}>
            <small>TREASURY</small>${w.me.metrics.treasury.toFixed(1)}B
          </button>
          <button onClick={() => economy()}>
            <small>APPROVAL</small>
            {w.me.metrics.approval.toFixed(0)}%
          </button>
          <button aria-label="Return to title" onClick={leave}>
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <nav className="presidency-nav" aria-label="Presidential navigation">
        {[
          ['office', 'OFFICE', Landmark],
          ['republic', 'REPUBLIC', Building2],
          ['world', 'WORLD', Globe2],
          ['meetings', 'MEETINGS', Handshake],
        ].map(([id, label, Icon]) => {
          const Glyph = Icon as typeof Landmark;
          return (
            <button key={String(id)} className={view === id ? 'active' : ''} onClick={() => navigate(String(id))}>
              <Glyph size={18} />
              <span>{String(label)}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
