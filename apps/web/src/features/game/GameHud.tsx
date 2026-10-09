import { useEffect, useState } from 'react';
import { LogOut, Timer, TrendingUp, Landmark, Users, Zap } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { date, money } from './format';
export function GameHud({ w, leave, explain }: { w: RoomView; leave: () => void; explain: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const r = w.me,
    seconds = Math.max(0, Math.ceil((w.nextTick - now) / 1000));
  return (
    <header className="world-hud">
      <div className="hud-identity">
        <FlagBanner flag={r.flag} />
        <div>
          <b>{r.name}</b>
          <small>President {r.leader}</small>
        </div>
      </div>
      <div className="hud-calendar">
        <b>{date(w.month)}</b>
        <span>
          <Timer size={11} /> Next month in {seconds}s
        </span>
        <progress value={w.month} max={240} aria-label="World progress" />
      </div>
      <div className="hud-metrics">
        {[
          [TrendingUp, 'GDP', money(r.metrics.gdp)],
          [Landmark, 'Treasury', money(r.metrics.treasury)],
          [Users, 'Approval', `${r.metrics.approval.toFixed(0)}%`],
          [Zap, 'Energy', `${r.metrics.energy.toFixed(0)}%`],
        ].map(([Icon, label, value]) => {
          const Glyph = Icon as typeof Users;
          return (
            <button
              className="hud-metric"
              aria-label={`${label}: ${value}. Explain changes`}
              onClick={explain}
              key={String(label)}
            >
              <Glyph size={19} />
              <span>
                <b>{String(value)}</b>
                <small>{String(label)}</small>
              </span>
            </button>
          );
        })}
      </div>
      <button aria-label="Return to title" onClick={leave}>
        <LogOut size={17} />
      </button>
    </header>
  );
}
