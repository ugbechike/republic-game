import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2, Landmark, Handshake, Building2, Radio, Settings2, X, Swords, MapPin, ArrowRight } from 'lucide-react';
import type { WorldController } from '../room/useWorld';
import { FlagBanner } from '../../components/FlagBanner';
import { date, money } from './format';
import { Policies } from './Policies';
import { Domestic } from './Domestic';
import { Crisis } from './Crisis';
import { Diplomacy } from './Diplomacy';
import { Conflicts } from './Conflict';
import { Assembly } from './Assembly';
import { WorldMap } from './WorldMap';
import { GameHud } from './GameHud';
const CityCanvas = dynamic(() => import('../city/CityCanvas'), {
  ssr: false,
  loading: () => (
    <div className="city-loading">
      <div className="spinner" />
      Surveying your Republic…
    </div>
  ),
});
const tabs = [
  { id: 'capital', label: 'Republic', icon: Building2 },
  { id: 'world', label: 'World', icon: Globe2 },
  { id: 'diplomacy', label: 'Trade & diplomacy', icon: Handshake },
  { id: 'military', label: 'Military', icon: Swords },
  { id: 'policy', label: 'Policies', icon: Landmark },
  { id: 'economy', label: 'Economy', icon: Settings2 },
  { id: 'events', label: 'Events', icon: Radio },
];
export function Game({ controller: c }: { controller: WorldController }) {
  const w = c.world!,
    r = w.me;
  const [tab, setTab] = useState('capital'),
    [selected, setSelected] = useState(w.republics.find((p) => p.id !== w.playerId)?.id ?? w.playerId),
    [regionId, setRegion] = useState(r.regions[0].id);
  const region = r.regions.find((s) => s.id === regionId) ?? r.regions[0];
  const alerts = Number(!!r.crisis) + Number(!!w.vote) + w.wars.filter((war) => war.status === 'active').length;
  function select(id: string) {
    if (id === w.playerId) setTab('capital');
    else {
      setSelected(id);
      setTab('diplomacy');
    }
  }
  return (
    <main className="world-game">
      <div className="world-stage">
        <CityCanvas region={region} republic={r} />
      </div>
      <div className="world-vignette" />
      <GameHud w={w} leave={c.leave} />
      <nav className="world-nav" aria-label="Game navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} title={label}>
            <Icon size={19} />
            <span>{label}</span>
            {id === 'events' && alerts > 0 && <b>{alerts}</b>}
          </button>
        ))}
      </nav>
      {tab === 'capital' && (
        <>
          <div className="capital-caption">
            <span className="kicker">
              <MapPin size={13} /> {region.id.endsWith('-0') ? 'CAPITAL TERRITORY' : 'STATE TERRITORY'}
            </span>
            <h1>{region.name}</h1>
            <p>
              {region.plots.filter((p) => p.stage > 0 && p.stage < 4).length} projects under construction · Drag to
              explore · Scroll to zoom
            </p>
          </div>
          <aside className="world-wire">
            <div className="section-label">
              WORLD WIRE <i className="live-dot" />
            </div>
            <div className="wire-notices" role="log" aria-live="polite">
              {w.notices.slice(0, 4).map((n) => (
                <article key={n.id}>
                  <time>{date(n.month)}</time>
                  <p>{n.text}</p>
                </article>
              ))}
              {!w.notices.length && <p className="muted">The first decisions are yours. Your world is watching.</p>}
            </div>
            <button className="wire-link" onClick={() => setTab('events')}>
              View all events <ArrowRight size={14} />
            </button>
            <h3>AT THE TABLE</h3>
            {w.republics
              .filter((p) => p.id !== w.playerId)
              .map((p) => (
                <button className="wire-republic" key={p.id} onClick={() => select(p.id)}>
                  <FlagBanner flag={p.flag} />
                  <span>
                    {p.name}
                    <small>{money(p.gdp)} GDP</small>
                  </span>
                  <ArrowRight size={13} />
                </button>
              ))}
          </aside>
          <footer className="region-dock">
            <div className="region-switcher">
              {r.regions.map((s) => (
                <button key={s.id} className={s.id === region.id ? 'active' : ''} onClick={() => setRegion(s.id)}>
                  {s.name}
                </button>
              ))}
            </div>
            <div className="region-readout">
              <span>
                Population <b>{region.population.toFixed(1)}M</b>
              </span>
              <span>
                Development <b>{region.development.toFixed(0)}</b>
              </span>
              <span>
                Infrastructure <b>{region.infrastructure.toFixed(0)}</b>
              </span>
              <span>
                Unemployment <b>{region.unemployment.toFixed(1)}%</b>
              </span>
            </div>
          </footer>
        </>
      )}
      {alerts > 0 && tab !== 'events' && (
        <button className="urgent-alert" onClick={() => setTab('events')}>
          <Radio size={16} />
          {alerts} live {alerts === 1 ? 'decision' : 'decisions'} ·{' '}
          {r.crisis?.title ?? w.vote?.title ?? 'Conflict underway'}
          <ArrowRight size={15} />
        </button>
      )}
      {tab !== 'capital' && (
        <section className={`command-panel ${tab === 'world' ? 'map-command' : ''}`}>
          <header>
            <span className="kicker">
              {tabs.find((t) => t.id === tab)?.label.toUpperCase()} · {r.name}
            </span>
            <button aria-label="Close panel" onClick={() => setTab('capital')}>
              <X size={18} />
            </button>
          </header>
          {tab === 'world' && <WorldMap w={w} select={select} />}{' '}
          {tab === 'policy' && <Policies r={r} send={c.send} busy={c.busy} />}{' '}
          {tab === 'economy' && <Domestic w={w} send={c.send} busy={c.busy} />}{' '}
          {(tab === 'diplomacy' || tab === 'military') && (
            <Diplomacy w={w} selected={selected} select={setSelected} send={c.send} busy={c.busy} />
          )}
          {tab === 'events' && (
            <>
              <h2>YOUR WORLD IN MOTION</h2>
              <Conflicts w={w} send={c.send} busy={c.busy} />
              <Assembly w={w} send={c.send} busy={c.busy} />
              {r.crisis && <Crisis crisis={r.crisis} send={c.send} busy={c.busy} />}{' '}
              {w.notices.map((n) => (
                <article className="dispatch" key={n.id}>
                  <time>{date(n.month)}</time>
                  <p>{n.text}</p>
                </article>
              ))}
              {w.development && w.host === w.playerId && (
                <details className="debug">
                  <summary>Development controls</summary>
                  <div className="actions wrap">
                    {(['speed', 'event', 'money', 'approval', 'election', 'recession', 'end'] as const).map((kind) => (
                      <button key={kind} disabled={c.busy} onClick={() => c.send({ type: 'debug', kind })}>
                        {kind === 'speed' ? `${w.speed}× → toggle speed` : kind}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
