'use client';
import { useEffect, useState } from 'react';
import { RepublicClient, savedSession } from '@republic/api-client';
import type { Action, RoomView, Session } from '@republic/contracts';
export function useWorld() {
  const [client] = useState(() => new RepublicClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'));
  const [session, setSession] = useState<Session | null>(null);
  const [resumeSession, setResumeSession] = useState<Session | null>(null);
  const [world, setWorld] = useState<RoomView | null>(null);
  const [status, setStatus] = useState('Connecting…');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSession(savedSession());
  }, []);
  useEffect(() => {
    if (session) {
      setResumeSession(session);
      return client.connect(session, setWorld, setStatus);
    }
  }, [client, session]);
  async function send(action: Action) {
    setError('');
    setBusy(true);
    try {
      await client.action(action);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function leave() {
    setSession(null);
    setWorld(null);
    setError('');
  }
  return { client, session, resumeSession, setSession, world, status, error, setError, busy, send, leave };
}
export type WorldController = ReturnType<typeof useWorld>;
