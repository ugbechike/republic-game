import { useEffect, useRef } from 'react';
import type { RoomView } from '@republic/contracts';
export type OfficeSound =
  | 'office-ambience'
  | 'clock'
  | 'distant-city'
  | 'secure-phone'
  | 'visitor'
  | 'paper'
  | 'urgent-alert'
  | 'meeting-join'
  | 'treaty-signing'
  | 'world-crisis';
export function officeSound(kind: OfficeSound) {
  window.dispatchEvent(new CustomEvent('republic:interaction', { detail: { kind } }));
}
export function useOfficeAudio(w: RoomView, view: string) {
  const previous = useRef({ request: '', signed: '', matter: '', crisis: '' });
  useEffect(() => {
    officeSound(view === 'office' ? 'office-ambience' : view === 'republic' ? 'distant-city' : 'paper');
  }, [view]);
  const request = w.meetings?.find((m) => m.status === 'requested' && m.requestedBy !== w.playerId)?.id ?? '';
  const signed = w.meetings?.filter((m) => m.status === 'signed').at(-1)?.id ?? '';
  const matter = w.me.officeMatters?.filter((m) => m.status === 'open').at(-1)?.id ?? '';
  const crisis = w.worldCrisis ? `${w.worldCrisis.kind}-${w.worldCrisis.startedAt}` : '';
  useEffect(() => {
    if (request && request !== previous.current.request) officeSound('secure-phone');
    if (signed && signed !== previous.current.signed) officeSound('treaty-signing');
    if (matter && matter !== previous.current.matter) officeSound('visitor');
    if (crisis && crisis !== previous.current.crisis) officeSound('world-crisis');
    previous.current = { request, signed, matter, crisis };
  }, [request, signed, matter, crisis]);
}
