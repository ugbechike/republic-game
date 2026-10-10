import { useEffect, useState } from 'react';
import type { PartyView } from '@republic/contracts';
export function usePartyTime(game: PartyView) {
  const [clock, setClock] = useState({ server: game.serverNow, local: Date.now(), now: game.serverNow });
  useEffect(() => {
    const local = Date.now();
    setClock({ server: game.serverNow, local, now: game.serverNow });
  }, [game.serverNow]);
  useEffect(() => {
    const timer = setInterval(() => setClock((c) => ({ ...c, now: c.server + Date.now() - c.local })), 200);
    return () => clearInterval(timer);
  }, []);
  return clock.now;
}
export function timeLeft(deadline: number, now: number) {
  const s = Math.max(0, Math.ceil((deadline - now) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
