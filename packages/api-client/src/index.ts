import { io, type Socket } from 'socket.io-client';
import type { Action, Ack, Draft, Room, RoomView, Session } from '@republic/contracts';
const KEY = 'republic.session.v1';
export function savedSession(): Session | null { try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; } }
export function clearSession() { localStorage.removeItem(KEY); }
export class RepublicClient {
  private socket?: Socket;
  constructor(private baseUrl: string) {}
  private async post(path: string, body: unknown): Promise<Session> {
    const response = await fetch(`${this.baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error ?? 'Unable to reach the world server');
    localStorage.setItem(KEY, JSON.stringify(result)); return result;
  }
  create(draft: Draft, options: Room['options']) { return this.post('/rooms', { draft, options }); }
  join(code: string, draft: Draft) { return this.post(`/rooms/${encodeURIComponent(code.trim().toUpperCase())}/join`, draft); }
  connect(session: Session, onState: (state: RoomView) => void, onConnection: (status: string) => void) {
    this.socket?.disconnect();
    this.socket = io(this.baseUrl, { auth: session, reconnection: true });
    this.socket.on('state', onState);
    this.socket.on('connect', () => onConnection('Connected'));
    this.socket.on('disconnect', () => onConnection('Reconnecting…'));
    this.socket.on('connect_error', error => onConnection(error.message));
    return () => { this.socket?.disconnect(); };
  }
  async action(action: Action): Promise<void> {
    if (!this.socket?.connected) throw new Error('Reconnect before issuing orders');
    const payload = { requestId: crypto.randomUUID(), action };
    for (let attempt = 0; attempt < 2; attempt++) {
      let reply: Ack;
      try { reply = await this.socket.timeout(8000).emitWithAck('action', payload); }
      catch { if (attempt === 0 && this.socket.connected) continue; throw new Error('No acknowledgement. Reconnect to check the latest state.'); }
      if (!reply.ok) throw new Error(reply.error); return;
    }
  }
}
