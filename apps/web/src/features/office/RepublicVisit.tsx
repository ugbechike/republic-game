import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Zap, Megaphone, Waves } from 'lucide-react';
import type { RoomView } from '@republic/contracts';
import { date } from '../game/format';
const City = dynamic(() => import('../city/CityCanvas'), { ssr: false });
export function RepublicVisit({
  w,
  regionId,
  select,
  back,
}: {
  w: RoomView;
  regionId: string;
  select: (id: string) => void;
  back: () => void;
}) {
  const region = w.me.regions.find((r) => r.id === regionId) ?? w.me.regions[0];
  const flood = w.me.briefings?.some((b) => b.kind === 'flood' && b.region === region.id && b.status === 'open');
  const lowPower = w.me.metrics.energy < 45,
    protest = w.me.metrics.approval < 35;
  return (
    <section
      className={`republic-visit ${lowPower ? 'power-strained' : ''}`}
      aria-label={`${region.name} Republic view`}
    >
      <div className="visit-city">
        <City region={region} republic={w.me} />
      </div>
      {flood && <div className="flood-overlay" aria-hidden="true" />}
      <div className="visit-caption">
        <span className="kicker">
          <MapPin size={14} /> {date(w.month)}
        </span>
        <h1>{region.name}</h1>
        <p>Your decisions leave their mark.</p>
        <div className="visit-condition">
          {flood && (
            <span>
              <Waves size={17} /> Flood response in progress
            </span>
          )}
          {lowPower && (
            <span>
              <Zap size={17} /> Power interruptions
            </span>
          )}
          {protest && (
            <span>
              <Megaphone size={17} /> Public demonstrations
            </span>
          )}
        </div>
        <button onClick={back}>
          <ArrowLeft size={17} /> RETURN TO OFFICE
        </button>
      </div>
      <div className="visit-regions">
        {w.me.regions.map((r) => (
          <button key={r.id} className={region.id === r.id ? 'active' : ''} onClick={() => select(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="visit-outcome">
        <span>
          GDP <b>${w.me.metrics.gdp.toFixed(1)}B</b>
        </span>
        <span>
          ENERGY <b>{w.me.metrics.energy.toFixed(0)}%</b>
        </span>
        <span>
          CONSTRUCTION <b>{region.plots.filter((p) => p.stage > 0 && p.stage < 4).length} projects</b>
        </span>
      </div>
    </section>
  );
}
