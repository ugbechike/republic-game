import { useEffect, useState } from 'react';
import type { RoomView } from '@republic/contracts';
export function useActiveTime(w: RoomView) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const step = (w.options.duration * 60000) / 240 / w.speed;
  return (w.activeMs ?? 0) + (w.paused ? 0 : Math.max(0, Math.min(step, now - (w.nextTick - step))) * w.speed);
}
export function countdown(due: number, now: number) {
  const s = Math.max(0, Math.ceil((due - now) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
