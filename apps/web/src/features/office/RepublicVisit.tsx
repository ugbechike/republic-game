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
  target,
}: {
  w: RoomView;
  regionId: string;
  select: (id: string) => void;
  back: () => void;
  target?: string;
}) {
  const foreign = w.republics.find((r) => r.id === target && r.id !== w.playerId);
  const landscape = foreign?.landscape;
  const regions = landscape?.regions ?? w.me.regions;
  const region = regions.find((r) => r.id === regionId) ?? regions[0];
  const metrics = landscape
    ? { energy: landscape.energy, approval: landscape.approval, gdp: foreign!.gdp }
    : w.me.metrics;
  const republic = { resources: foreign?.resources ?? w.me.resources, metrics };
  const flood = !!region.flood;
  const lowPower = metrics.energy < 45,
    protest = metrics.approval < 35;
  return (
    <section
      className={`republic-visit ${lowPower ? 'power-strained' : ''}`}
      aria-label={`${region.name} Republic view`}
    >
      <div className="visit-city">
        <City region={region} republic={republic} />
      </div>
      {flood && <div className="flood-overlay" aria-hidden="true" />}
      <div className="visit-caption">
        <span className="kicker">
          <MapPin size={14} /> {date(w.month)}
        </span>
        <h1>{region.name}</h1>
        <p>{foreign ? `${foreign.name} · President ${foreign.leader}` : 'Your decisions leave their mark.'}</p>
        <div className="visit-condition">
          {flood && (
            <span>
              <Waves size={17} />{' '}
              {region.flood?.recovering ? 'Reconstruction in progress' : 'Flooded roads · repairs needed'}
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
        {regions.map((r) => (
          <button key={r.id} className={region.id === r.id ? 'active' : ''} onClick={() => select(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="visit-outcome">
        <span>
          GDP <b>${metrics.gdp.toFixed(1)}B</b>
        </span>
        <span>
          ENERGY <b>{metrics.energy.toFixed(0)}%</b>
        </span>
        <span>
          CONSTRUCTION <b>{region.plots.filter((p) => p.stage > 0 && p.stage < 4).length} projects</b>
        </span>
      </div>
    </section>
  );
}
