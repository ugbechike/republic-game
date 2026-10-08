import type { RoomView, Region } from '@republic/contracts';
import { money } from './format';
export function Overview({ w, region, setRegion }: { w: RoomView; region: Region; setRegion: (id: string) => void }) {
  return <section className="panel overview"><div className="section-label">YOUR REPUBLIC <span>LIVE OUTLOOK</span></div><h2 className="panel-title">A future taking shape.</h2><p className="muted">Your policies shape the skyline. Your relationships shape what comes next.</p><div className="scene-placeholder"><span>{w.me.flag}</span><h2>{region.name}</h2><p>Development {region.development.toFixed(0)} · Economy {money(region.economy)}</p></div><div className="region-tabs">{w.me.regions.map(r => <button key={r.id} className={r.id === region.id ? 'selected' : ''} onClick={() => setRegion(r.id)}>{r.name}</button>)}</div></section>;
}
