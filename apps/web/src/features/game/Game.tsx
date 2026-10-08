import { useState } from 'react';
import { Globe2, Landmark, Handshake, Building2, Radio, Settings2, LogOut } from 'lucide-react';
import type { WorldController } from '../room/useWorld';
import { date, money } from './format';
import { Policies } from './Policies';
import { Domestic } from './Domestic';
import { Crisis } from './Crisis';
import { WorldRail } from './WorldRail';
import { Diplomacy } from './Diplomacy';
import { Conflicts } from './Conflict';
import { Assembly } from './Assembly';
import { Overview } from './Overview';
const tabs = [{ id: 'capital', label: 'Republic', icon: Building2 }, { id: 'policy', label: 'Cabinet', icon: Landmark }, { id: 'diplomacy', label: 'Diplomacy', icon: Handshake }, { id: 'economy', label: 'Economy', icon: Settings2 }];
export function Game({ controller: c }: { controller: WorldController }) {
  const w = c.world!, r = w.me;
  const [tab, setTab] = useState('capital'), [selected, setSelected] = useState(w.playerId), [regionId, setRegion] = useState(r.regions[0].id), [debug, setDebug] = useState(false);
  const region = r.regions.find(s => s.id === regionId) ?? r.regions[0];
  function select(id: string) { setSelected(id); if (id !== w.playerId) setTab('diplomacy'); }
  return <main className="game"><header className="topbar"><div className="game-brand"><Globe2 size={21} /> REPUBLIC</div><div className="world-name">THE FIRST ASSEMBLY <span>WORLD {w.code}</span></div><div className="calendar"><i className="live-dot" /><b>{date(w.month)}</b><span>YEAR {Math.min(20, Math.floor(w.month / 12) + 1)} / 20</span></div><button className="text-button" aria-label="Return to title" onClick={c.leave}><LogOut size={17} /></button></header>
    <WorldRail w={w} selected={selected} select={select} /><div className="game-main"><header className="republic-header"><div><div className="eyebrow">OFFICE OF THE PRESIDENT</div><h1>{r.flag} {r.name}</h1><p className="muted">President {r.leader} <span className="divider">/</span> {r.metrics.stability > 55 ? 'A nation finding its stride' : 'A nation at a crossroads'}</p></div><div className="approval"><span>PUBLIC APPROVAL</span><b>{r.metrics.approval.toFixed(0)}<small>%</small></b></div></header>
      <div className="headline-metrics">{[['GROSS DOMESTIC PRODUCT', money(r.metrics.gdp)], ['TREASURY RESERVES', money(r.metrics.treasury)], ['GLOBAL INFLUENCE', r.influence.toFixed(0)], ['ENERGY SECURITY', `${r.metrics.energy.toFixed(0)}%`]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
      <nav className="game-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</nav>
      <Conflicts w={w} send={c.send} busy={c.busy} />
      <Assembly w={w} send={c.send} busy={c.busy} />
      {r.crisis && <Crisis crisis={r.crisis} send={c.send} busy={c.busy} />}
      {tab === 'capital' && <Overview w={w} region={region} setRegion={setRegion} />}
      {tab === 'policy' && <Policies r={r} send={c.send} busy={c.busy} />}
      {tab === 'economy' && <Domestic w={w} send={c.send} busy={c.busy} />}
      {tab === 'diplomacy' && <Diplomacy w={w} selected={selected} select={setSelected} send={c.send} busy={c.busy} />}
      {w.development && w.host === w.playerId && <div className="debug"><button className="text-button" onClick={() => setDebug(!debug)}>Development controls {debug ? '−' : '+'}</button>{debug && <div className="actions">{(['speed', 'event', 'money', 'approval', 'election', 'recession', 'end'] as const).map(kind => <button key={kind} disabled={c.busy} onClick={() => c.send({ type: 'debug', kind })}>{kind === 'speed' ? `${w.speed}× → toggle speed` : kind}</button>)}</div>}</div>}
    </div><aside className="news-rail"><div className="section-label"><span><Radio size={13} /> WORLD WIRE</span><i className="live-dot" /></div><h3>The world<br />doesn’t stand still.</h3>{w.notices.length === 0 && <p className="muted">Diplomatic dispatches will appear here.</p>}<div role="log" aria-live="polite">{w.notices.slice(0, 16).map(n => <article className="dispatch" key={n.id}><time>{date(n.month)}</time><p>{n.text}</p></article>)}</div></aside>
  </main>;
}
