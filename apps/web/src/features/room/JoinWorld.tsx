import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import type { RoomSummary } from '@republic/contracts';
import type { WorldController } from './useWorld';
export function JoinWorld({
  c,
  enter,
  close,
}: {
  c: WorldController;
  enter: (room: RoomSummary) => void;
  close: () => void;
}) {
  const [code, setCode] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const room = await c.client.roomSummary(code);
      if (room.phase !== 'lobby') throw new Error('This world has already started. Ask your host for a new world.');
      if (room.occupied >= room.options.maxPlayers) throw new Error('This world is full.');
      enter(room);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="join-world game-surface">
      <KeyRound size={30} />
      <span className="kicker">YOUR FRIENDS ARE WAITING</span>
      <h1>JOIN THEIR WORLD.</h1>
      <p>Enter the five-character code from your host. Then found your Republic.</p>
      <label htmlFor="world-code">World code</label>
      <input
        id="world-code"
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))}
        minLength={5}
        maxLength={5}
        required
        autoComplete="off"
        placeholder="BHBZK"
        autoFocus
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="game-button gold" disabled={loading || code.length !== 5}>
        {loading ? 'Finding world…' : 'Find world'}
        <ArrowRight size={18} />
      </button>
      <button className="text-button" type="button" onClick={close}>
        <ArrowLeft size={16} /> Back to title
      </button>
    </form>
  );
}
