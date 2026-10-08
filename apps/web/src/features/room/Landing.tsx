import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Globe2, Users, Hourglass } from 'lucide-react';
import type { Draft, Room } from '@republic/contracts';
import type { WorldController } from './useWorld';
import { RepublicForm } from './RepublicForm';
export function Landing({ controller: c }: { controller: WorldController }) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [draft, setDraft] = useState<Draft>({ name: '', leader: '', flag: '🌅', resources: ['agriculture', 'oil'] });
  const [options, setOptions] = useState<Room['options']>({ duration: 60, maxPlayers: 6, difficulty: 'developing' });
  const [code, setCode] = useState(''), [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setLoading(true); c.setError(''); try { c.setSession(await (mode === 'create' ? c.client.create(draft, options) : c.client.join(code, draft))); } catch (error) { c.setError((error as Error).message); } finally { setLoading(false); } }
  return <main className="landing"><div className="landing-grid" /><header className="brand"><Globe2 size={23} /> REPUBLIC <span>THE WORLD IS NEGOTIABLE.</span></header>
    <section className="hero"><div className="eyebrow"><span className="live-dot" /> A MULTIPLAYER STRATEGY EXPERIENCE</div><h1>A nation of your own.<br /><em>A world to contend with.</em></h1><p>Build prosperity. Broker impossible deals.<br />Find out what your friends are really made of.</p><div className="hero-facts"><span><Users size={16} /> 4–8 presidents</span><span><Hourglass size={16} /> 45–90 minutes</span><span><Globe2 size={16} /> One shared world</span></div><div className="hero-quote">“Your greatest resource<br />might be the person across the table.”</div><span className="edition">REPUBLIC / FIRST ASSEMBLY · V0</span></section>
    <section className="entry-panel"><div className="tabs"><button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create world</button><button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Join friends</button></div>
      <form onSubmit={submit}><h2>{mode === 'create' ? 'Your presidency begins here.' : 'Take your seat at the table.'}</h2><p className="muted">No accounts. Just a room code and a little ambition.</p>
        {mode === 'join' && <label>Room code<input aria-label="Room code" required maxLength={5} minLength={5} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="K7F9Q" /></label>}
        <RepublicForm draft={draft} setDraft={setDraft} />
        {mode === 'create' && <div className="form-row options"><label>Session<select value={options.duration} onChange={e => setOptions({ ...options, duration: Number(e.target.value) as 45 | 60 | 90 })}>{[45, 60, 90].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label><label>Seats<select value={options.maxPlayers} onChange={e => setOptions({ ...options, maxPlayers: Number(e.target.value) })}>{[4, 5, 6, 7, 8].map(n => <option key={n}>{n}</option>)}</select></label><label>Starting outlook<select value={options.difficulty} onChange={e => setOptions({ ...options, difficulty: e.target.value as 'developing' | 'struggling' })}><option value="developing">Developing</option><option value="struggling">Struggling</option></select></label></div>}
        {c.error && <p role="alert" className="error">{c.error}</p>}<button className="primary full" disabled={loading || !draft.resources.length}>{loading ? 'Preparing your world…' : mode === 'create' ? 'Create world' : 'Enter world'}<ArrowUpRight size={18} /></button>
      </form></section></main>;
}
